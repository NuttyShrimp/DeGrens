let currentSpotBox: NodeJS.Timer;

export const createCurrentSpotBox = (spot: Garage.ParkingSpot) => {
  if (currentSpotBox) {
    clearInterval(currentSpotBox);
  }
  currentSpotBox = setInterval(() => {
    if (!spot) {
      clearInterval(currentSpotBox);
      return;
    }

    DrawSphere(spot.coords.x, spot.coords.y, spot.coords.z + 1.0, spot.size, 0, 0, 255, 0.2);
    DrawSphere(spot.coords.x, spot.coords.y, spot.coords.z + 1.0, spot.size + spot.distance, 255, 0, 255, 0.2);
  }, 1);
};

export const removeCurrentSpotBox = () => {
  if (currentSpotBox) {
    clearInterval(currentSpotBox);
  }
};
