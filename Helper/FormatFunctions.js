// Format a given date to "Day Month Year" format.
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
// Format a date range to display as "StartDay to EndDay Month Year" format.
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
// Format a given date to "Month Day, Year - Hour:Minute AM/PM" format.
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
// Format a given amount to currency format with commas for thousands separator.
export const formatCurrency = (amount) => {
  if (isNaN(amount)) {
    return '0.00';
  }
  return amount
    ?.toFixed(2)
    .replace(/\B(?=(\d{3})+(?!\d))/g, ',')
    .replace(/\s/g, '');
};
// Function to handle amount change.
export const handleAmountChange = (value, setAmount) => {
  // Remove all non-numeric characters from the input
  const numericValue = isNaN(value)
    ? value.replace(/[^0-9]/g, '')
    : value.toString();

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
// Function to convert a hexadecimal color code to RGBA.
export const hexToRgba = (hex, alpha) => {
  if (!hex) return;
  const r = parseInt(hex.slice(1, 3), 16); // Convert the red component of the hexadecimal color code to decimal.
  const g = parseInt(hex.slice(3, 5), 16); // Convert the green component of the hexadecimal color code to decimal.
  const b = parseInt(hex.slice(5, 7), 16); // Convert the blue component of the hexadecimal color code to decimal.
  return `rgba(${r}, ${g}, ${b}, ${alpha})`; // Return the RGBA color code with the specified opacity.
};
