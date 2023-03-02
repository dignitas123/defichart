function addDigits(num: number, digits = 0) {
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

function ticksizePrecision(
  tick: number,
  ticksize = 0.1,
  roundMethod: 'round' | 'ceil' | 'floor' = 'round'
) {
  const digits = getDigits(ticksize);
  let roundedTickSize: number;
  const numTickSizeRatio = tick / ticksize;
  switch (roundMethod) {
    case 'round':
      roundedTickSize = Math.round(numTickSizeRatio) * ticksize;
      break;
    case 'ceil':
      roundedTickSize = Math.ceil(numTickSizeRatio) * ticksize;
      break;
    case 'floor':
      roundedTickSize = Math.floor(numTickSizeRatio) * ticksize;
      break;
  }
  return Number(addDigits(roundedTickSize, digits));
}

export function roundToTicksize(tick: number, ticksize = 0.1) {
  return ticksizePrecision(tick, ticksize);
}

export function floorToTicksize(tick: number, ticksize = 0.1) {
  return ticksizePrecision(tick, ticksize, 'floor');
}

export function ceilToTicksize(tick: number, ticksize = 0.1) {
  return ticksizePrecision(tick, ticksize, 'ceil');
}
