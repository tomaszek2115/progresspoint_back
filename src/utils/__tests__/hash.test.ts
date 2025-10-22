import { hashPassword, comparePassword } from "../hash";

describe("hashPassword & comparePassword", () => {
  it("should hash password and validate it correctly", async () => {
    const password = "supersecret";
    const hash = await hashPassword(password);

    expect(typeof hash).toBe("string");
    expect(hash).not.toBe(password);

    const isValid = await comparePassword(password, hash);
    expect(isValid).toBe(true);
  });

  it("should return false for wrong password", async () => {
    const password = "supersecret";
    const hash = await hashPassword(password);
    const isValid = await comparePassword("wrong", hash);
    expect(isValid).toBe(false);
  });
});
