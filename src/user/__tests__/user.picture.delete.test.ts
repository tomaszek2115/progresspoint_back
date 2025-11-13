import request from "supertest";
import express from "express";

describe("DELETE /user/picture", () => {
  beforeEach(() => {
    jest.resetModules();
  });

  it("returns 200 when profile picture deleted successfully", async () => {
    jest.doMock("../../middleware/auth.middleware", () => ({
      authMiddleware: (req: any, res: any, next: any) => {
        req.user = "user-1";
        return next();
      },
    }));

    const mockUpdate = jest.fn().mockResolvedValue({ id: "user-1" });
    jest.doMock("../../prisma", () => ({
      __esModule: true,
      default: { user: { update: mockUpdate } },
    }));

    const { userRouter } = await import("../user.routes");
    const app = express();
    app.use(express.json());
    app.use("/user", userRouter);

    const res = await request(app).delete("/user/picture");
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("message", "Profile picture deleted successfully");
    expect(mockUpdate).toHaveBeenCalledWith({ where: { id: "user-1" }, data: { profileImageUrl: null }, select: { id: true } });
  });

  it("returns 500 when prisma update throws", async () => {
    jest.doMock("../../middleware/auth.middleware", () => ({
      authMiddleware: (req: any, res: any, next: any) => {
        req.user = "user-1";
        return next();
      },
    }));

    const mockUpdate = jest.fn().mockRejectedValue(new Error("DB error"));
    jest.doMock("../../prisma", () => ({
      __esModule: true,
      default: { user: { update: mockUpdate } },
    }));

    const { userRouter } = await import("../user.routes");
    const app = express();
    app.use(express.json());
    app.use("/user", userRouter);

    const res = await request(app).delete("/user/picture");
    expect(res.status).toBe(500);
    expect(res.body).toHaveProperty("error");
  });
});
