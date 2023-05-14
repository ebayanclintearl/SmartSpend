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
  } else if (amount.trim() === '0' && amount.length === 1) {
    return {
      errorMessage: 'Please enter an amount greater than 0',
      errorDescription: false,
      errorAmount: true,
      errorDateRange: false,
      errorCategory: false,
    };
  } else if (!/^\d{1,3}(,\d{3})*(\.\d{1,2})?$/.test(amount)) {
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
  } else if (category === null) {
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
export const validateCategoryAllocationInputs = (
  description,
  amount,
  dateRange,
  selection
) => {
  if (!description.trim()) {
    return {
      errorMessage: 'Empty description',
      errorDescription: true,
      errorAmount: false,
      errorDateRange: false,
      errorSelection: false,
    };
  } else if (description.trim().length > 30) {
    return {
      errorMessage: 'Budget name should not exceed 30 characters',
      errorDescription: true,
      errorAmount: false,
      errorDateRange: false,
      errorSelection: false,
    };
  } else if (!amount.trim()) {
    return {
      errorMessage: 'Empty amount',
      errorDescription: false,
      errorAmount: true,
      errorDateRange: false,
      errorSelection: false,
    };
  } else if (amount.trim() === '0' && amount.length === 1) {
    return {
      errorMessage: 'Please enter an amount greater than 0',
      errorDescription: false,
      errorAmount: true,
      errorDateRange: false,
      errorSelection: false,
    };
  } else if (!/^\d{1,3}(,\d{3})*(\.\d{1,2})?$/.test(amount)) {
    return {
      errorMessage:
        'Amount should be a valid number without any other characters',
      errorDescription: false,
      errorAmount: true,
      errorDateRange: false,
      errorSelection: false,
    };
  } else if (!dateRange.trim()) {
    return {
      errorMessage: 'Empty Date Range',
      errorDescription: false,
      errorAmount: false,
      errorDateRange: true,
      errorSelection: false,
    };
  } else if (selection === null) {
    return {
      errorMessage: 'Please make a selection',
      errorDescription: false,
      errorAmount: false,
      errorDateRange: false,
      errorSelection: true,
    };
  }
  return {
    errorMessage: '',
    errorDescription: false,
    errorAmount: false,
    errorDateRange: false,
    errorSelection: false,
  };
};
export const validateSuggestInputs = (amount, dateRange) => {
  if (!amount.trim()) {
    return {
      errorMessage: 'Empty amount',
      errorDescription: false,
      errorAmount: true,
      errorDateRange: false,
      errorSelection: false,
    };
  } else if (amount.trim() === '0' && amount.length === 1) {
    return {
      errorMessage: 'Please enter an amount greater than 0',
      errorDescription: false,
      errorAmount: true,
      errorDateRange: false,
      errorSelection: false,
    };
  } else if (!/^\d{1,3}(,\d{3})*(\.\d{1,2})?$/.test(amount)) {
    return {
      errorMessage:
        'Amount should be a valid number without any other characters',
      errorDescription: false,
      errorAmount: true,
      errorDateRange: false,
      errorSelection: false,
    };
  } else if (!dateRange.trim()) {
    return {
      errorMessage: 'Empty Date Range',
      errorDescription: false,
      errorAmount: false,
      errorDateRange: true,
      errorSelection: false,
    };
  }
  return {
    errorMessage: '',
    errorDescription: false,
    errorAmount: false,
    errorDateRange: false,
    errorSelection: false,
  };
};
export const validateSignUpInputs = (
  accountName,
  email,
  password,
  confirmPassword
) => {
  if (!accountName.trim()) {
    return {
      errorMessage: 'Empty Name',
      errorAccountName: true,
      errorEmail: false,
      errorPassword: false,
      errorConfirmPassword: false,
      errorFamilyCode: false,
    };
  } else if (!/^[a-zA-Z]+( [a-zA-Z]+)*$/.test(accountName)) {
    return {
      errorMessage: 'Invalid Account Name',
      errorAccountName: true,
      errorEmail: false,
      errorPassword: false,
      errorConfirmPassword: false,
      errorFamilyCode: false,
    };
  } else if (!email.trim()) {
    return {
      errorMessage: 'Empty Email',
      errorAccountName: false,
      errorEmail: true,
      errorPassword: false,
      errorConfirmPassword: false,
      errorFamilyCode: false,
    };
  } else if (!/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(email)) {
    return {
      errorMessage: 'Invalid Email Format',
      errorAccountName: false,
      errorEmail: true,
      errorPassword: false,
      errorConfirmPassword: false,
      errorFamilyCode: false,
    };
  } else if (!password.trim()) {
    return {
      errorMessage: 'Empty Password',
      errorAccountName: false,
      errorEmail: false,
      errorPassword: true,
      errorConfirmPassword: false,
      errorFamilyCode: false,
    };
  } else if (password.length < 6) {
    return {
      errorMessage: 'Must be at least 6 characters',
      errorAccountName: false,
      errorEmail: false,
      errorPassword: true,
      errorConfirmPassword: false,
      errorFamilyCode: false,
    };
  } else if (!confirmPassword.trim()) {
    return {
      errorMessage: 'Empty Value',
      errorAccountName: false,
      errorEmail: false,
      errorPassword: false,
      errorConfirmPassword: true,
      errorFamilyCode: false,
    };
  } else if (confirmPassword !== password) {
    return {
      errorMessage: 'Passwords do not match',
      errorAccountName: false,
      errorEmail: false,
      errorPassword: false,
      errorConfirmPassword: true,
      errorFamilyCode: false,
    };
  }
  return {
    errorMessage: '',
    errorAccountName: false,
    errorEmail: false,
    errorPassword: false,
    errorConfirmPassword: false,
    errorFamilyCode: false,
  };
};
export const validateSignInInputs = (email, password) => {
  if (!email.trim()) {
    return {
      errorMessage: 'Empty Email',
      errorAccountName: false,
      errorEmail: true,
      errorPassword: false,
      errorFamilyCode: false,
    };
  } else if (!/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(email)) {
    return {
      errorMessage: 'Invalid Email Format',
      errorAccountName: false,
      errorEmail: true,
      errorPassword: false,
      errorFamilyCode: false,
    };
  } else if (!password.trim()) {
    return {
      errorMessage: 'Empty Password',
      errorAccountName: false,
      errorEmail: false,
      errorPassword: true,
      errorFamilyCode: false,
    };
  }
  return {
    errorMessage: '',
    errorAccountName: false,
    errorEmail: false,
    errorPassword: false,
    errorFamilyCode: false,
  };
};
