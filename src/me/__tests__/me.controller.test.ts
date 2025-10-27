import request from "supertest";
import { app } from "../../app";
import { resetDatabase } from "../../test/utils";

describe("Me controller integration", () => {
    beforeEach(async () => {
        await resetDatabase();
    })

    it("should fail if invalid token is provided", async () => {
        const res = await request(app)
            .get("/me")
            .set("Authorization", `Bearer invalidtoken`);

        expect(res.status).toBe(401);
    })

    it("should pass if token is valid", async () => {
        const res = await request(app)
            .post("/auth/register")
            .send({ email: "metest@abc.com", username: "example", password: "password123" });

        expect(res.status).toBe(201);

        const token = res.body.token;
        const meRes = await request(app)
            .get("/me")
            .set("Authorization", `Bearer ${token}`);
        
        expect(meRes.status).toBe(200);
        expect(meRes.body.user.email).toBe("metest@abc.com");
    })
})