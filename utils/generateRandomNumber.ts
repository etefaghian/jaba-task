/**
 * @function
 * generate a random string according to length of input
 * @param length
 * @returns result in string format
 */
export const generateRandomNumber = (length: number) =>
  Math.random()
    .toString()
    .slice(2, length + 2);
