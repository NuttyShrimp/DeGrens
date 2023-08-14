class Screenshot {
  imgur(target: number): Promise<string> {
    return global.exports['dg-imager'].requestClientImgurScreenshot(target);
  }
  minio(target: number, options: { fileName: string }): Promise<string> {
    return global.exports['dg-imager'].requestClientMinioScreenshot(target, options);
  }
  generateMinioFilename(): Promise<string> {
    return global.exports['dg-imager'].generateMinioFilename();
  }
}

export default {
  Screenshot: new Screenshot(),
};
