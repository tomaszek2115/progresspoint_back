import request from "supertest";
import express from "express";

describe("GET /user/picture", () => {
  beforeEach(() => {
    jest.resetModules();
  });

  it("returns 200 and profileImageUrl when user has picture", async () => {
    jest.doMock("../../middleware/auth.middleware", () => ({
      authMiddleware: (req: any, res: any, next: any) => {
        req.user = "user-1";
        return next();
      },
    }));

    const mockFindUnique = jest.fn().mockResolvedValue({ profileImageUrl: "https://s3.amazonaws.com/bucket/users/user-1/profile-123.jpg" });
    jest.doMock("../../prisma", () => ({
      __esModule: true,
      default: { user: { findUnique: mockFindUnique } },
    }));

    const { userRouter } = await import("../user.routes");
    const app = express();
    app.use(express.json());
    app.use("/user", userRouter);

    const res = await request(app).get("/user/picture");
    expect(res.status).toBe(200);
    expect(res.body.profileImageUrl).toBe("https://s3.amazonaws.com/bucket/users/user-1/profile-123.jpg");
  });

  it("returns 404 when no profile picture is set", async () => {
    jest.doMock("../../middleware/auth.middleware", () => ({
      authMiddleware: (req: any, res: any, next: any) => {
        req.user = "user-1";
        return next();
      },
    }));

    const mockFindUnique = jest.fn().mockResolvedValue({ profileImageUrl: null });
    jest.doMock("../../prisma", () => ({
      __esModule: true,
      default: { user: { findUnique: mockFindUnique } },
    }));

    const { userRouter } = await import("../user.routes");
    const app = express();
    app.use(express.json());
    app.use("/user", userRouter);

    const res = await request(app).get("/user/picture");
    expect(res.status).toBe(404);
    expect(res.body).toHaveProperty("error");
  });
});
