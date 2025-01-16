export function getHoursMinSec() {
  return (
    new Date().getHours() +
    '-' +
    new Date().getMinutes() +
    '-' +
    new Date().getSeconds()
  );
}
