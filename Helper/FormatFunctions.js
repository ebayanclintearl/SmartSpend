export const formatDate = (date) => {
  const months = [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December',
  ];
  return (
    date.getDate() + ' ' + months[date.getMonth()] + ' ' + date.getFullYear()
  );
};
export const timestampToDate = (timestamp) => {
  const timestampMilliseconds =
    timestamp.seconds * 1000 + timestamp.nanoseconds / 1000000;
  return new Date(timestampMilliseconds);
};
export const formatDateAndTime = (date) => {
  const monthNames = [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December',
  ];
  const monthName = monthNames[date.getMonth()];
  const day = date.getDate();
  const year = date.getFullYear();

  let hours = date.getHours();
  let minutes = date.getMinutes();
  let ampm = 'AM';

  if (hours >= 12) {
    hours -= 12;
    ampm = 'PM';
  }
  if (hours === 0) {
    hours = 12;
  }
  if (minutes < 10) {
    minutes = '0' + minutes;
  }

  return `${monthName} ${day}, ${year} - ${hours}:${minutes} ${ampm}`;
};
export const formatCurrency = (amount) => {
  return amount?.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
};
