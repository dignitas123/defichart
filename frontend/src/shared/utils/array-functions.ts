export function findNearestIndex(n: number, arr: number[]) {
  let nearestIndex = 0;
  let smallestDifference = Math.abs(n - arr[0]);
  for (let i = 1; i < arr.length; i++) {
    const difference = Math.abs(n - arr[i]);
    if (difference < smallestDifference) {
      smallestDifference = difference;
      nearestIndex = i;
    }
  }
  return nearestIndex;
}
