export const DEFAULT_SERVICE_STATUS: Service.Status = {
  engine: 1000,
  axle: 1000,
  brakes: 1000,
  suspension: 1000,
};

export const SERVICE_CONDITIONS = [
  {
    label: 'Excellent',
    percentage: 80,
  },
  {
    label: 'Good',
    percentage: 60,
  },
  {
    label: 'Bad',
    percentage: 40,
  },
  {
    label: 'Terrible',
    percentage: 0,
  },
];
