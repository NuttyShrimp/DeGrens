class Screenshot {
  imgur(target: number): Promise<string> {
    return global.exports['screenshot-basic'].requestClientImgurScreenshot(target);
  }
  minio(target: number, options: { fileName: string }): Promise<string> {
    return global.exports['screenshot-basic'].requestClientMinioScreenshot(target, options);
  }
  generateMinioFilename(): Promise<string> {
    return global.exports['screenshot-basic'].generateMinioFilename();
  }
}

export default {
  Screenshot: new Screenshot(),
};
