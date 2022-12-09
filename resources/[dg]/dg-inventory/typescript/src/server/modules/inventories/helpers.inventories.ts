export const doRectanglesOverlap = (
  [firstRectangle1, firstRectangle2]: [Vec2, Vec2],
  [secondRectangle1, secondRectangle2]: [Vec2, Vec2]
): boolean =>
  firstRectangle1.x < secondRectangle2.x &&
  firstRectangle2.x > secondRectangle1.x &&
  firstRectangle1.y < secondRectangle2.y &&
  firstRectangle2.y > secondRectangle1.y;
