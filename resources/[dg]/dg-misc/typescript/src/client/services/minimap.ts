setImmediate(() => {
  SetMapZoomDataLevel(0, 0.96, 0.9, 0.08, 0.0, 0.0);
  SetMapZoomDataLevel(1, 1.6, 0.9, 0.08, 0.0, 0.0);
  SetMapZoomDataLevel(2, 8.6, 0.9, 0.08, 0.0, 0.0);
  SetMapZoomDataLevel(3, 12.3, 0.9, 0.08, 0.0, 0.0);
  SetMapZoomDataLevel(4, 22.3, 0.9, 0.08, 0.0, 0.0);

  // For this map to work, zoom needs to be constant
  // Being in a vehicle sets zoom to variable amounts according to speed so that was the cause
  setInterval(() => {
    SetRadarZoom(1100);
  }, 1);
});
