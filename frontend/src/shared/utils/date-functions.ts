export function getLastDateWithDayOfMonth(date: Date, dayOfMonth: number) {
  while (date.getDate() !== dayOfMonth) {
    date.setDate(date.getDate() - 1);
  }

  return date;
}
