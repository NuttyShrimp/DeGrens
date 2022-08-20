export const doRectanglesOverlap = (
  movingPosition: Vec2,
  movingSize: Vec2,
  otherPosition: Vec2,
  otherSize: Vec2
): boolean => {
  return (
    movingPosition.x < otherPosition.x + otherSize.x &&
    movingPosition.x + movingSize.x > otherPosition.x &&
    movingPosition.y < otherPosition.y + otherSize.y &&
    movingPosition.y + movingSize.y > otherPosition.y
  );
};
