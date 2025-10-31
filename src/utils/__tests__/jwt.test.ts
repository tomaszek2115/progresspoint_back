import { generateToken, verifyToken } from "../jwt";
import jwt from "jsonwebtoken";

describe("JWT utils", () => {
  const id = "user123";
  const secret = process.env.JWT_SECRET || "supersecret";

  it("should generate a valid JWT token", () => {
    const token = generateToken(id);
    expect(typeof token).toBe("string");
    const decoded = jwt.verify(token, secret) as { id: string };
    expect(decoded.id).toBe(id);
  });

  it("should verify a valid token and return payload", () => {
    const token = jwt.sign({ id: id }, secret, { expiresIn: "1h" });
    const decoded = verifyToken(token) as { id: string };
    expect(decoded.id).toBe(id);
  });

  it("should throw an error for invalid token", () => {
    expect(() => verifyToken("invalid.token.here")).toThrow();
  });
});
