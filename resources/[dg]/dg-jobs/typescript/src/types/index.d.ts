interface SignInLocation {
  jobs: string[];
  zone: {
    vector: Vec3;
    width: number;
    length: number;
    data: {
      data: Record<string, any>;
      heading: number;
      minZ: number;
      maxZ: number;
    };
  };
}
