export function increaseToDivisibleByX(
  num: number,
  divisible = 3,
  maxNumber = 24
) {
  while (num % divisible !== 0) {
    num++;
    if (num === maxNumber) {
      return maxNumber;
    }
  }
  return num;
}
