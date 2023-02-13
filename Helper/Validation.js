export const validateTransactionInputs = (
  dateString,
  amount,
  description,
  category
) => {
  if (!dateString.trim()) {
    return {
      errorMessage: 'Empty Date',
      errorDateString: true,
      errorAmount: false,
      errorDescription: false,
      errorCategory: false,
    };
  } else if (!amount.trim()) {
    return {
      errorMessage: 'Empty amount',
      errorDateString: false,
      errorAmount: true,
      errorDescription: false,
      errorCategory: false,
    };
  } else if (!/^\d+(\.\d{1,2})?$/.test(amount)) {
    return {
      errorMessage:
        'Amount should be a valid number without any other characters',
      errorDateString: false,
      errorAmount: true,
      errorDescription: false,
      errorCategory: false,
    };
  } else if (!description.trim()) {
    return {
      errorMessage: 'Empty Description',
      errorDateString: false,
      errorAmount: false,
      errorDescription: true,
      errorCategory: false,
    };
  } else if (description.trim().length > 60) {
    return {
      errorMessage: 'Description should not exceed 60 characters',
      errorDateString: false,
      errorAmount: false,
      errorDescription: true,
      errorCategory: false,
    };
  } else if (category.title === 'Select Category') {
    return {
      errorMessage: 'Empty category',
      errorDateString: false,
      errorAmount: false,
      errorDescription: false,
      errorCategory: true,
    };
  }
  return {
    errorMessage: '',
    errorDateString: false,
    errorAmount: false,
    errorDescription: false,
    errorCategory: false,
  };
};
