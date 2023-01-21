function getDigits(ticksize: number, seperator = '.') {
  const splitStringNumByComma = ticksize.toString().split(seperator)[1];
  return splitStringNumByComma ? splitStringNumByComma.length : 0;
}

function roundToDigits(num: number, digits = 0) {
  return num.toFixed(digits);
}

export function roundToTicksize(num: number, ticksize = 0.1) {
  const digits = getDigits(ticksize);
  const roundedTickSize = Math.round(num / ticksize) * ticksize;
  return roundToDigits(roundedTickSize, digits);
}
