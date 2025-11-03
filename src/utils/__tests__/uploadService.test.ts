// Ensure uploadService exports an `upload` with multer-like API
describe("uploadService module", () => {
  beforeEach(() => {
    jest.resetModules();
  });

  it("exports upload with a single() function (mocking S3 client)", async () => {
    // mock S3Client so importing the module doesn't require @aws-sdk/client-s3 to be installed
    jest.doMock("@aws-sdk/client-s3", () => ({ S3Client: class {} }));

    const mod = await import("../../utils/uploadService");
    expect(mod).toBeDefined();
    expect(mod.upload).toBeDefined();
    // multer's upload has .single function
    expect(typeof mod.upload.single).toBe("function");
  });
});
