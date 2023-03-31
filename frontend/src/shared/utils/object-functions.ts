export function getTargetValue(
  targetValue: string,
  obj: Record<string, string>
) {
  const valueToKeyMap = new Map(
    Object.entries(obj).map(([key, value]) => [value, key])
  );
  if (valueToKeyMap.has(targetValue)) {
    return valueToKeyMap.get(targetValue);
  }
}
