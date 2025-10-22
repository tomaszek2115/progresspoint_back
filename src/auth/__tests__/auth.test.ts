import request from "supertest";
import { app } from "../../index";
import prisma from "../../prisma";

describe("Auth Endpoints", () => {
  beforeAll(async () => {
    // cleaning up the users table before tests
    await prisma.user.deleteMany();
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  it("should register a new user", async () => {
    const res = await request(app)
      .post("/auth/register")
      .send({
        email: "test@example.com",
        username: "testuser",
        password: "123456",
      });

    expect(res.statusCode).toBe(201);
    expect(res.body.user).toHaveProperty("id");
    expect(res.body.user.email).toBe("test@example.com");
    expect(res.body.token).toBeDefined();
  });

  it("should not register with existing email", async () => {
    const res = await request(app)
      .post("/auth/register")
      .send({
        email: "test@example.com",
        username: "anotheruser",
        password: "abcdef",
      });

    expect(res.statusCode).toBe(409);
  });

  it("should login an existing user", async () => {
    const res = await request(app)
      .post("/auth/login")
      .send({
        email: "test@example.com",
        password: "123456",
      });

    expect(res.statusCode).toBe(200);
    expect(res.body.user.username).toBe("testuser");
    expect(res.body.token).toBeDefined();
  });

  it("should not login with wrong password", async () => {
    const res = await request(app)
      .post("/auth/login")
      .send({
        email: "test@example.com",
        password: "wrongpassword",
      });

    expect(res.statusCode).toBe(401);
    expect(res.body).toHaveProperty("error");
  });
});
