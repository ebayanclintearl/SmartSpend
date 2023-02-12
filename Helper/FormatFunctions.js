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
export const formatDateAndTime = (timestamp = null, date = null) => {
  let formattedDate;

  if (!timestamp && !date) {
    return 'Timestamp or date is required';
  }

  if (timestamp) {
    let timestampInMilliseconds =
      timestamp.seconds * 1000 + timestamp.nanoseconds / 1000000;
    formattedDate = new Date(timestampInMilliseconds);
  } else {
    formattedDate = new Date(date);
  }

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
  const monthName = monthNames[formattedDate.getMonth()];
  const day = formattedDate.getDate();
  const year = formattedDate.getFullYear();

  let hours = formattedDate.getHours();
  let minutes = formattedDate.getMinutes();
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
