export function getLastRoundedFiveMinuteInterval() {
  const date = new Date();
  const minutes = date.getMinutes();
  const roundedMinutes = Math.floor(minutes / 5) * 5;
  const roundedDate = new Date(
    date.getFullYear(),
    date.getMonth(),
    date.getDate(),
    date.getHours(),
    roundedMinutes,
    0
  );
  const formattedDate = roundedDate
    .toISOString()
    .replace(/T/, " ")
    .replace(/\..+/, "");
  return formattedDate;
}

export function getPreviousRoundedMinuteInterval(minutesBack = 1) {
  const date = new Date();
  date.setMinutes(date.getMinutes() - minutesBack);
  const roundedMinutes =
    Math.floor(date.getMinutes() / minutesBack) * minutesBack;
  date.setMinutes(roundedMinutes);
  const roundedDate = new Date(
    date.getFullYear(),
    date.getMonth(),
    date.getDate(),
    date.getHours(),
    roundedMinutes,
    0
  );
  return roundedDate.getTime();
}

export function getPreviousRoundedHourInterval(hoursBack = 1) {
  const date = new Date();
  date.setHours(date.getHours() - hoursBack);
  const roundedHours = Math.floor(date.getHours() / hoursBack) * hoursBack;
  date.setHours(roundedHours);
  const roundedDate = new Date(
    date.getFullYear(),
    date.getMonth(),
    date.getDate(),
    roundedHours,
    date.getMinutes(),
    0
  );
  return roundedDate.getTime();
}

export function getPreviousDayBeginning(daysBack = 1) {
  const date = new Date();
  date.setDate(date.getDate() - daysBack);
  const roundedDays = Math.floor(date.getDate() / daysBack) * daysBack;
  date.setDate(roundedDays);
  const roundedDate = new Date(
    date.getFullYear(),
    date.getMonth(),
    roundedDays,
    date.getHours(),
    date.getMinutes(),
    0
  );
  return roundedDate.getTime();
}

export function getPreviousWeekBeginning() {
  const today = new Date();
  const dayOfWeek = today.getDay(); // 0 (Sunday) to 6 (Saturday)
  const daysSinceMonday = (dayOfWeek + 6) % 7;
  const startOfLastWeek = new Date(today);
  startOfLastWeek.setDate(today.getDate() - daysSinceMonday - 7);
  startOfLastWeek.setHours(0, 0, 0, 0); // Set time to midnight
  return startOfLastWeek.getTime();
}

export function getUTCWeekbegin() {
  const now = new Date();
  const currentDay = now.getUTCDay(); // 0 (Sunday) to 6 (Saturday)

  // Adjust for Sunday to start the week on Monday
  if (currentDay === 0) {
    now.setUTCDate(now.getUTCDate() - 6); // Move back six days to the previous Monday
  } else {
    now.setUTCDate(now.getUTCDate() - (currentDay - 1)); // Move back to the beginning of the current week (Monday)
  }

  // Set the time to 00:00:00 UTC
  now.setUTCHours(0, 0, 0, 0);

  const formattedDate = now.toISOString().replace(/T/, " ").replace(/\..+/, "");

  return formattedDate;
}

export function getUTCHourBegin() {
  const now = new Date();

  // Set the minutes, seconds, and milliseconds to zero
  now.setUTCMinutes(0, 0, 0);

  const formattedDate = now.toISOString().replace(/T/, " ").replace(/\..+/, "");

  return formattedDate;
}

export function getMinuteStartInUTC() {
  const now = new Date();

  // Set the seconds and milliseconds to zero
  now.setUTCSeconds(0, 0);

  const formattedDate = now.toISOString().replace(/T/, " ").replace(/\..+/, "");

  return formattedDate;
}

export function getDayStartInUTC() {
  const now = new Date();

  // Set the hours, minutes, seconds, and milliseconds to zero
  now.setUTCHours(0, 0, 0, 0);

  const formattedDate = now.toISOString().replace(/T/, " ").replace(/\..+/, "");

  return formattedDate;
}

export const sleep = (milliseconds) => {
  return new Promise((resolve) => setTimeout(resolve, milliseconds));
};

export function isM5ScalarValuesUndefined(queryCommandOutput) {
  const queryCommandOutputRowData = queryCommandOutput.Rows[0].Data;
  if (queryCommandOutputRowData) {
    let undefinedCount = 0;
    const isEmptyOrUndefined = (obj) => obj.ScalarValue === undefined;

    for (const obj of queryCommandOutputRowData) {
      if (isEmptyOrUndefined(obj)) {
        undefinedCount++;
      }
    }

    return (
      undefinedCount === 1 ||
      queryCommandOutputRowData.every(isEmptyOrUndefined)
    );
  } else {
    return true;
  }
}
