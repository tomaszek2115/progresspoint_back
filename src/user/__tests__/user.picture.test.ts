import request from "supertest";
import express from "express";

// We'll mock auth middleware, upload middleware and prisma per-test using jest.resetModules

describe("POST /user/picture", () => {
  beforeEach(() => {
    jest.resetModules();
  });

  it("returns 200 and profileImageUrl when file uploaded and user authenticated", async () => {
    // mock auth middleware to set req.user
    jest.doMock("../../middleware/auth.middleware", () => ({
      authMiddleware: (req: any, res: any, next: any) => {
        req.user = "user-1";
        return next();
      },
    }));

    // mock upload middleware to attach req.file.location
    jest.doMock("../../utils/uploadService", () => ({
      upload: {
        single: () => (req: any, res: any, next: any) => {
          req.file = { location: "https://s3.amazonaws.com/bucket/users/user-1/profile-123.jpg" };
          next();
        },
      },
    }));

    // mock prisma to avoid db calls
    const mockUpdate = jest.fn().mockResolvedValue({ id: "user-1", profileImageUrl: "https://s3.amazonaws.com/bucket/users/user-1/profile-123.jpg" });
    jest.doMock("../../prisma", () => ({
      __esModule: true,
      default: { user: { update: mockUpdate } },
    }));

    const { userRouter } = await import("../user.routes");
    const app = express();
    app.use(express.json());
    app.use("/user", userRouter);

    const res = await request(app).post("/user/picture");
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("profileImageUrl");
    expect(res.body.profileImageUrl).toBe("https://s3.amazonaws.com/bucket/users/user-1/profile-123.jpg");
  });

  it("returns 400 when no file is uploaded", async () => {
    jest.doMock("../../middleware/auth.middleware", () => ({
      authMiddleware: (req: any, res: any, next: any) => {
        req.user = "user-1";
        return next();
      },
    }));

    // upload.single returns middleware that does not attach file
    jest.doMock("../../utils/uploadService", () => ({
      upload: {
        single: () => (req: any, res: any, next: any) => {
          // no req.file
          next();
        },
      },
    }));

    // prisma should not be called, but mock it anyway
    jest.doMock("../../prisma", () => ({
      __esModule: true,
      default: { user: { update: jest.fn() } },
    }));

    const { userRouter } = await import("../user.routes");
    const app = express();
    app.use(express.json());
    app.use("/user", userRouter);

    const res = await request(app).post("/user/picture");
    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty("error");
  });
});
