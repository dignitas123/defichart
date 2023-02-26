function roundToDigits(num: number, digits = 0) {
  return num.toFixed(digits);
}

export function getDigits(ticksize: number, seperator = '.') {
  const splitStringNumByComma = ticksize.toString().split(seperator)[1];
  return splitStringNumByComma ? splitStringNumByComma.length : 0;
}

export function getBeforeComma(ticksize: number, seperator = '.') {
  const splitStringNumByComma = ticksize.toString().split(seperator)[0];
  return splitStringNumByComma ? splitStringNumByComma.length : 0;
}

export function roundToTicksize(num: number, ticksize = 0.1) {
  const digits = getDigits(ticksize);
  const roundedTickSize = Math.round(num / ticksize) * ticksize;
  return Number(roundToDigits(roundedTickSize, digits));
}
