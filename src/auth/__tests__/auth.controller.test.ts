import request from "supertest";
import { app } from "../../app";
import { resetDatabase } from "../../test/utils";

describe("Auth Controller Integration", () => {
  beforeEach(async () => {
    await resetDatabase();
  });

  describe("POST /auth/register", () => {
    it("should register a new user", async () => {
      const res = await request(app)
        .post("/auth/register")
        .send({ email: "test@example.com", username: "testuser", password: "password123" });

      expect(res.status).toBe(201);
      expect(res.body.user).toHaveProperty("id");
      expect(res.body.token).toBeDefined();
    });

    it("should fail if email already exists", async () => {
      await request(app)
        .post("/auth/register")
        .send({ email: "test@example.com", username: "testuser", password: "password123" });

      const res = await request(app)
        .post("/auth/register")
        .send({ email: "test@example.com", username: "otheruser", password: "password123" });

      expect(res.status).toBe(409);
    });

    it("should fail if required fields are missing", async () => {
      const res = await request(app)
        .post("/auth/register")
        .send({ email: "missing@example.com" });

      expect(res.status).toBe(400);
    });
  });

  describe("POST /auth/login", () => {
    it("should login successfully", async () => {
      await request(app)
        .post("/auth/register")
        .send({ email: "login@example.com", username: "loginuser", password: "password123" });

      const res = await request(app)
        .post("/auth/login")
        .send({ email: "login@example.com", password: "password123" });

      expect(res.status).toBe(200);
      expect(res.body.token).toBeDefined();
    });

    it("should fail with wrong password", async () => {
      await request(app)
        .post("/auth/register")
        .send({ email: "wrongpass@example.com", username: "user", password: "password123" });

      const res = await request(app)
        .post("/auth/login")
        .send({ email: "wrongpass@example.com", password: "wrongpassword" });

      expect(res.status).toBe(401);
    });

    it("should fail if user does not exist", async () => {
      const res = await request(app)
        .post("/auth/login")
        .send({ email: "nonexistent@example.com", password: "password123" });

      expect(res.status).toBe(401);
    });
  });
});
