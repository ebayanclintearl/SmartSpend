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
  return `${date.getDate()} ${months[date.getMonth()]} ${date.getFullYear()}`;
};
export const formatDateRange = (startDate, endDate) => {
  const months = [
    'Jan',
    'Feb',
    'Mar',
    'Apr',
    'May',
    'Jun',
    'Jul',
    'Aug',
    'Sep',
    'Oct',
    'Nov',
    'Dec',
  ];
  const startDay = startDate.getDate();
  const startMonth = months[startDate.getMonth()];
  const startYear = startDate.getFullYear();
  const endDay = endDate.getDate();
  const endMonth = months[endDate.getMonth()];
  const endYear = endDate.getFullYear();

  // Check if the dates are in the same month and year
  if (startMonth === endMonth && startYear === endYear) {
    return `${startDay} to ${endDay} ${startMonth} ${endYear}`;
  }

  // Otherwise, format the date range with the full month name
  return `${startDay} ${startMonth} to ${endDay} ${endMonth} ${endYear}`;
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
  return amount
    ?.toFixed(2)
    .replace(/\B(?=(\d{3})+(?!\d))/g, ',')
    .replace(/\s/g, '');
};

export const handleAmountChange = (value, setAmount) => {
  // Remove all non-numeric characters from the input
  const numericValue = value.replace(/[^0-9]/g, '');

  // Check that the numeric value does not exceed 100 trillion
  const numericLimit = 100000000000;
  if (parseInt(numericValue) > numericLimit) {
    // Exit the function without updating the state
    return;
  }

  // Format the numeric value with commas
  let formattedValue = '';
  if (numericValue.length >= 10) {
    // Format for billions
    const billions = parseInt(numericValue.slice(0, -9));
    const millions = parseInt(numericValue.slice(-9, -6));
    const thousands = parseInt(numericValue.slice(-6, -3));
    const ones = parseInt(numericValue.slice(-3));
    formattedValue = `${billions},${millions
      .toString()
      .padStart(3, '0')},${thousands.toString().padStart(3, '0')},${ones
      .toString()
      .padStart(3, '0')}`;
  } else if (numericValue.length >= 7) {
    // Format for millions
    const millions = parseInt(numericValue.slice(0, -6));
    const thousands = parseInt(numericValue.slice(-6, -3));
    const ones = parseInt(numericValue.slice(-3));
    formattedValue = `${millions},${thousands
      .toString()
      .padStart(3, '0')},${ones.toString().padStart(3, '0')}`;
  } else if (numericValue.length >= 4) {
    // Format for thousands
    const thousands = parseInt(numericValue.slice(0, -3));
    const ones = parseInt(numericValue.slice(-3));
    formattedValue = `${thousands},${ones.toString().padStart(3, '0')}`;
  } else {
    // No formatting needed
    formattedValue = numericValue;
  }

  // Update the state with the formatted value
  setAmount(formattedValue);
};
