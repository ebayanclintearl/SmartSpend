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
export const validateBudgetInputs = (
  budgetName,
  amount,
  dateRange,
  category
) => {
  if (!budgetName.trim()) {
    return {
      errorMessage: 'Empty Budget Name',
      errorBudgetName: true,
      errorAmount: false,
      errorDateRange: false,
      errorCategory: false,
    };
  } else if (budgetName.trim().length > 30) {
    return {
      errorMessage: 'Budget name should not exceed 30 characters',
      errorBudgetName: true,
      errorAmount: false,
      errorDateRange: false,
      errorCategory: false,
    };
  } else if (!amount.trim()) {
    return {
      errorMessage: 'Empty amount',
      errorBudgetName: false,
      errorAmount: true,
      errorDateRange: false,
      errorCategory: false,
    };
  } else if (!/^\d{1,3}(,\d{3})*(\.\d{1,2})?$/.test(amount)) {
    return {
      errorMessage:
        'Amount should be a valid number without any other characters',
      errorBudgetName: false,
      errorAmount: true,
      errorDateRange: false,
      errorCategory: false,
    };
  } else if (!dateRange.trim()) {
    return {
      errorMessage: 'Empty Date Range',
      errorBudgetName: false,
      errorAmount: false,
      errorDateRange: true,
      errorCategory: false,
    };
  } else if (category === null) {
    return {
      errorMessage: 'Empty category',
      errorBudgetName: false,
      errorAmount: false,
      errorDateRange: false,
      errorCategory: true,
    };
  }
  return {
    errorMessage: '',
    errorBudgetName: false,
    errorAmount: false,
    errorDateRange: false,
    errorCategory: false,
  };
};

export const validateSignUpInputs = (
  accountName,
  email,
  password,
  familyCode,
  familyProvider
) => {
  if (!accountName.trim()) {
    return {
      errorMessage: 'Empty Name',
      errorAccountName: true,
      errorEmail: false,
      errorPassword: false,
      errorFamilyCode: false,
    };
  } else if (!/^[a-zA-Z]+( [a-zA-Z]+)*$/.test(accountName)) {
    return {
      errorMessage: 'Invalid Account Name',
      errorAccountName: true,
      errorEmail: false,
      errorPassword: false,
      errorFamilyCode: false,
    };
  } else if (!email.trim()) {
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
  } else if (!familyCode.trim() && !familyProvider) {
    return {
      errorMessage: 'Invalid Family Code',
      errorAccountName: false,
      errorEmail: false,
      errorPassword: false,
      errorFamilyCode: true,
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
