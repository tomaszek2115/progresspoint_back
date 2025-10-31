import request from "supertest";
import { app } from "../../app";
import { resetDatabase } from "../../test/utils";

describe("Middleware integration", () => {

    beforeEach(async () => {
        await resetDatabase();
    });

    it("should block request without token", async () => {
        const res = await request(app).get("/me");
        expect(res.status).toBe(401);
    });

    it("should allow request with valid token", async () => {
        const registerRes = await request(app)
            .post("/auth/register")
            .send({ email: "example@abc.com", username: "exampleuser", password: "password123" });

        expect(registerRes.status).toBe(201);

        const validToken = registerRes.body.token;
        const res = await request(app)
            .get("/me")
            .set("Authorization", `Bearer ${validToken}`);

        expect(res.status).toBe(200);
    });
});