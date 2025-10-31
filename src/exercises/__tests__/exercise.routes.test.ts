import request from "supertest";
import { app } from "../../app";
import prisma from "../../prisma";
import { resetDatabase } from "../../test/utils";

describe("Exercise routes", () => {
  beforeEach(async () => {
    await resetDatabase();
  });

  it("GET /exercises should return id and name for all exercises", async () => {
    const e1 = await prisma.exercise.create({ data: { name: "Bench Press" } });
    const e2 = await prisma.exercise.create({ data: { name: "Squat" } });

    const res = await request(app).get("/exercises");

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    // should contain at least the two we inserted, with only id and name fields
    const names = res.body.map((e: any) => e.name);
    expect(names).toEqual(expect.arrayContaining(["Bench Press", "Squat"]));

    for (const e of res.body) {
      expect(Object.keys(e).sort()).toEqual(["id", "name"]);
    }

    // ensure returned ids match created ones
    const returnedIds = res.body.map((e: any) => e.id);
    expect(returnedIds).toEqual(expect.arrayContaining([e1.id, e2.id]));
  });
});
