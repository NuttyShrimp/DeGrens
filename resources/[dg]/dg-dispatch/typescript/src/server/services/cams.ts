let cams: Dispatch.Cams.Cam[] = [];

export const loadCams = (config: Dispatch.Cams.Cam[]) => {
  cams = config;
};

export const getCams = () => cams;
