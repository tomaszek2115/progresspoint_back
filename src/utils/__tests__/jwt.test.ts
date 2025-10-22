import { generateToken, verifyToken } from "../jwt";
import jwt from "jsonwebtoken";

describe("JWT utils", () => {
  const userId = "user123";
  const secret = process.env.JWT_SECRET || "supersecret";

  it("should generate a valid JWT token", () => {
    const token = generateToken(userId);
    expect(typeof token).toBe("string");
    const decoded = jwt.verify(token, secret) as { userId: string };
    expect(decoded.userId).toBe(userId);
  });

  it("should verify a valid token and return payload", () => {
    const token = jwt.sign({ userId }, secret, { expiresIn: "1h" });
    const decoded = verifyToken(token) as { userId: string };
    expect(decoded.userId).toBe(userId);
  });

  it("should throw an error for invalid token", () => {
    expect(() => verifyToken("invalid.token.here")).toThrow();
  });
});
