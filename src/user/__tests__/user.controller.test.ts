import request from "supertest";
import { app } from "../../app";
import { resetDatabase } from "../../test/utils";

describe("User Controller Integration", () => {

    beforeEach(async () => {
        await resetDatabase();
    })

    // tests for changeUsername
    describe("PUT /user/username", () => {
        it("should change username", async () => {
            // register new user
            const register = await request(app)
                .post("/auth/register")
                .send({ email: "change@abc.com", username: "change", password: "passsword"})
            // capture token
            const token = register.body.token;
            // change username
            const res = await request(app)
                .put("/user/username")
                .set("Authorization", `Bearer ${token}`)
                .send({ newUsername: "changed"})
            // expect success
            expect (res.status).toBe(200);
            expect (res.body.username).toBe("changed");
        })

        it("should fail if username taken", async () => {
            //register new user")
            await request(app)
                .post("/auth/register")
                .send({ email: "change1@abc.com", username: "change1", password: "password"})
            // register another user
            const register2 = await request(app)
                .post("/auth/register")
                .send({ email: "change2@abc.com", username: "change2", password: "password"})
            const token = register2.body.token;
            // try to change username to the first user's username
            const res = await request(app)
                .put("/user/username")
                .set("Authorization", `Bearer ${token}`)
                .send( { newUsername: "change1"})
            expect(res.status).toBe(409);
        })
    })

    describe("PUT /user/password", () => {

        it("should change password", async () => {
            // register new user
            const register = await request(app)
                .post("/auth/register")
                .send({email: "pswd@abc.com", username: "pswd", password: "password"})
            // get token from request body
            const token = register.body.token
            // try changing password
            const res = await request(app)
                .put("/user/password")
                .set("Authorization", `Bearer ${token}`)
                .send( { oldPassword: "password", newPassword: "pass"})
            expect(res.status).toBe(200);
        })

        it("should fail if old password is incorrect", async() => {
            // register new user
            const register = await request(app)
                .post("/auth/register")
                .send({email: "wrongold@abc.com", username: "wrongold", password: "password"})
            // get token from request body
            const token = register.body.token
            // try changing the password
            const res = await request(app)
                .put("/user/password")
                .set("Authorization", `Bearer ${token}`)
                .send({ oldPassword: "wrong", newPassword: "doesntmatter"})
            expect(res.status).toBe(401)
        })

        it("should fail if the passwords are the same", async() => {
            // register new user
            const register = await request(app)
                .post("/auth/register")
                .send({ email: "pswdsame@abc.com", username: "pswdsame", password: "password"})
            // get token from register body
            const token = register.body.token
            const res = await request(app)
                .put("/user/password")
                .set("Authorization", `Bearer ${token}`)
                .send({ oldPassword: "password", newPassword: "password"})
            expect(res.status).toBe(400)
        })
    })
})