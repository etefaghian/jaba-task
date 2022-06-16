export const generateRandomNumber = (length: number) =>
  Math.random()
    .toString()
    .slice(2, length + 2);
