export function printTime(date: Date) {
  const hh = date.getHours().toString().padStart(2, '0');
  const mm = date.getMinutes().toString().padStart(2, '0');
  const ss = date.getSeconds().toString().padStart(2, '0');
  const ms = date.getMilliseconds().toString().padStart(2, '0');

  return `${hh}:${mm}:${ss}:${ms}`;
}

export function printSymbol(number: number) {
  if (number >= 0) {
    return '+';
  } else {
    return '-';
  }
}
