import {
  Image,
  ScrollView,
  StatusBar,
  StyleSheet,
  TextInput as NativeTextInput,
  TouchableWithoutFeedback,
  View,
  Platform,
  TouchableOpacity,
} from 'react-native';
import React, {
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import BottomSheet, {
  BottomSheetScrollView,
  BottomSheetBackdrop,
} from '@gorhom/bottom-sheet';
import {
  Button,
  HelperText,
  TextInput,
  Text,
  List,
  Surface,
  Avatar,
  Appbar,
  ProgressBar,
  IconButton,
} from 'react-native-paper';
import {
  formatCurrency,
  handleAmountChange,
  hexToRgba,
} from '../Helper/FormatFunctions';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { expenseCategories } from '../Helper/CategoriesData';
import {
  validateCategoryAllocationInputs,
  validateSuggestInputs,
} from '../Helper/Validation';
import { AppContext } from '../Helper/Context';
import {
  deleteField,
  doc,
  getDoc,
  setDoc,
  updateDoc,
} from 'firebase/firestore';
import { db } from '../config';
import uuid from 'react-native-uuid';
import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Sets up a notification handler that determines whether to show an alert, play a sound, and set a badge
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

// Registers the device for push notifications and returns the Expo Push Token
const registerForPushNotificationsAsync = async () => {
  let token;

  // Sets up the notification channel for Android devices
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'default',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#FF231F7C',
    });
  }

  // Requests permission to send push notifications if necessary
  if (Device.isDevice) {
    const { status: existingStatus } =
      await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }
    if (finalStatus !== 'granted') {
      alert('Failed to get push token for push notification!');
      return;
    }
    // Gets the Expo Push Token
    token = (await Notifications.getExpoPushTokenAsync()).data;
  } else {
    alert('Must use physical device for Push Notifications');
  }

  return token;
};
const SegmentedButtons = ({ value, onValueChange, buttons }) => (
  <View
    style={{
      flexDirection: 'row',
      width: '100%',
      justifyContent: 'space-between',
      marginTop: 5,
      marginBottom: 15,
    }}
  >
    {buttons.map(({ value: buttonValue, label, disabled }) => (
      <Button
        key={buttonValue}
        mode="contained"
        contentStyle={{ padding: 3 }}
        style={
          value === buttonValue
            ? {
                backgroundColor:
                  buttonValue === 'categoryAlloc'
                    ? '#38B6FF'
                    : buttonValue === 'accountAlloc'
                    ? '#FF4C38'
                    : '#F5F6FA',
                borderRadius: 8,
                width: '49%',
              }
            : {
                backgroundColor: '#F5F6FA',
                borderRadius: 8,
                width: '49%',
              }
        }
        labelStyle={{
          color:
            value === buttonValue
              ? '#FFFFFF'
              : disabled
              ? '#c5c5c7'
              : '#151940',
        }}
        onPress={() => onValueChange(buttonValue)}
        disabled={disabled}
      >
        {label}
      </Button>
    ))}
  </View>
);

const BudgetScreen = () => {
  const { userAccount, familyCode, accounts, balancePromptLimit } =
    useContext(AppContext);
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [dateRange, setDateRange] = useState('');
  const [category, setCategory] = useState(null);
  const [account, setAccount] = useState(null);
  const [categoryExpanded, setCategoryExpanded] = useState(false);
  const [accountExpanded, setAccountExpanded] = useState(false);
  const [dateRangeExpanded, setDateRangeExpanded] = useState(false);
  const [showLoading, setShowLoading] = useState(false);
  const [error, setError] = useState({
    errorMessage: '',
    errorDescription: false,
    errorAmount: false,
    errorDateRange: false,
    errorSelection: false,
  });
  const [addAllocation, setAddAllocation] = useState(false);
  const [suggestAllocation, setSuggestAllocation] = useState(false);
  const [segmentValue, setSegmentValue] = useState('categoryAlloc');
  // Notification
  const [expoPushToken, setExpoPushToken] = useState('');
  const [notification, setNotification] = useState(false);
  const [showMore, setShowMore] = useState(false);
  const notificationListener = useRef();
  const responseListener = useRef();
  // Compute for budget Allocation for different date ranges
  const categoryBudgetAllocationForDay = computeBudgetAllocation('day');
  const categoryBudgetAllocationForWeek = computeBudgetAllocation('week');
  const categoryBudgetAllocationForMonth = computeBudgetAllocation('month');
  const accountBudgetAllocationForDay = computeBudgetAllocation(
    'day',
    'account'
  );
  const accountBudgetAllocationForWeek = computeBudgetAllocation(
    'week',
    'account'
  );
  const accountBudgetAllocationForMonth = computeBudgetAllocation(
    'month',
    'account'
  );
  // Bottom sheet
  const sheetRef = useRef(null);
  const snapPoints = useMemo(() => ['90%'], []);

  // Notification
  useEffect(() => {
    // Register for push notifications and update expoPushToken state
    registerForPushNotificationsAsync().then((token) =>
      setExpoPushToken(token)
    );

    // Add notification listener and response listener on component mount
    notificationListener.current =
      Notifications.addNotificationReceivedListener((notification) => {
        setNotification(notification);
      });

    responseListener.current =
      Notifications.addNotificationResponseReceivedListener((response) => {
        console.log(response);
      });

    // Remove notification listener and response listener on component unmount
    return () => {
      Notifications.removeNotificationSubscription(
        notificationListener.current
      );
      Notifications.removeNotificationSubscription(responseListener.current);
    };
  }, []);
  useEffect(() => {
    sendBudgetNotifications(
      categoryBudgetAllocationForDay,
      categoryBudgetAllocationForWeek,
      categoryBudgetAllocationForMonth,
      accountBudgetAllocationForDay,
      accountBudgetAllocationForWeek,
      accountBudgetAllocationForMonth
    );
  }, [familyCode]);
  // Clear values when segment value is changed
  useEffect(() => {
    setError({
      errorMessage: '',
      errorDescription: false,
      errorAmount: false,
      errorDateRange: false,
      errorSelection: false,
    });
    setShowLoading(false);
    setDescription('');
    setAmount('');
    setDateRange('');
    setCategory(null);
    setAccount(null);
  }, [segmentValue]);
  // Helper functions
  const toggleShowMore = () => {
    setShowMore(!showMore);
  };
  const handleDateRangePress = () => setDateRangeExpanded(!dateRangeExpanded);
  const handleCategoryPress = () => setCategoryExpanded(!categoryExpanded);
  const handleAccountPress = () => setAccountExpanded(!accountExpanded);
  const handleAllocation = (isAddAllocation) => {
    setAddAllocation(isAddAllocation);
    setSuggestAllocation(!isAddAllocation);
    setError({
      errorMessage: '',
      errorDescription: false,
      errorAmount: false,
      errorDateRange: false,
      errorSelection: false,
    });
    setShowLoading(false);
    setDescription('');
    setAmount('');
    setDateRange('');
    setCategory(null);
    setAccount(null);
    handleSnapPress(0);
  };
  const getDateRange = (range) => {
    const now = new Date();
    let startDate = null;
    let endDate = null;

    if (range === 'day') {
      startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      endDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
    } else if (range === 'week') {
      const dayOfWeek = now.getDay();
      const daysUntilMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
      const daysUntilSunday = 6 - daysUntilMonday;
      const mondayDate = new Date(
        now.getFullYear(),
        now.getMonth(),
        now.getDate() - daysUntilMonday,
        0,
        0,
        0
      );
      endDate = new Date(
        now.getFullYear(),
        now.getMonth(),
        now.getDate() + daysUntilSunday + 1,
        0,
        0,
        -1
      );
      startDate = new Date(mondayDate.getTime());
    } else if (range === 'month') {
      const year = now.getFullYear();
      const month = now.getMonth();
      startDate = new Date(year, month, 1);
      endDate = new Date(year, month + 1, 0);
    }

    return { startDate, endDate };
  };
  const handleSheetChange = useCallback((index) => {
    if (index === -1) {
      setError({
        errorMessage: '',
        errorDescription: false,
        errorAmount: false,
        errorDateRange: false,
        errorSelection: false,
      });
      setShowLoading(false);
      setDescription('');
      setAmount('');
      setDateRange('');
      setCategory(null);
      setAccount(null);
    }
  }, []);
  const handleSnapPress = useCallback((index) => {
    sheetRef.current?.snapToIndex(index);
  }, []);
  const handleCloseSheetPress = useCallback(() => {
    sheetRef.current?.close();
  }, []);

  function filterFamilyExpenseHistoryByDateRange(
    transactions,
    timeRange,
    budget
  ) {
    const startDate = budget.dateRangeStart.toDate();
    const endDate = budget.dateRangeEnd.toDate();

    return Object.entries(transactions)?.filter(([key, { date, category }]) => {
      const transactionDate = date.toDate();
      return (
        transactionDate >= startDate &&
        transactionDate <= endDate &&
        budget.dateRange === timeRange
      );
    });
  }

  function computeBudgetAllocation(timeRange, allocationType = 'category') {
    const filteredBudgets = Object.entries(
      allocationType === 'category'
        ? familyCode?.categoryBudgetAllocation || {}
        : familyCode?.accountBudgetAllocation || {}
    )?.filter(([_, { dateRange }]) => dateRange === timeRange);

    const result = filteredBudgets.reduce((budgetAllocation, [key, budget]) => {
      const {
        uid,
        description,
        amount,
        dateRange,
        dateRangeStart,
        dateRangeEnd,
        category = null,
        selectedAccount = null,
      } = budget;

      const filteredTransactions = filterFamilyExpenseHistoryByDateRange(
        familyCode.familyExpenseHistory,
        timeRange,
        budget
      ).filter(([key, item]) => {
        return (
          (allocationType === 'category' &&
            item.category?.title === category?.title) ||
          (allocationType === 'account' && item.uid === selectedAccount?.uid)
        );
      });

      const totalAmount = filteredTransactions.reduce(
        (total, [, { amount }]) => total + amount,
        0
      );
      const percentage = Math.min(totalAmount / amount, 1);

      budgetAllocation.push({
        id: key,
        uid,
        description,
        amount,
        dateRange,
        dateRangeStart,
        dateRangeEnd,
        category,
        selectedAccount,
        totalAmount,
        percentage,
        budgetStartDate: budget.dateRangeStart.toDate(),
        budgetEndDate: budget.dateRangeEnd.toDate(),
      });

      return budgetAllocation;
    }, []);

    return result;
  }

  async function sendBudgetNotifications(
    categoryBudgetAllocationForDay,
    categoryBudgetAllocationForWeek,
    categoryBudgetAllocationForMonth,
    accountBudgetAllocationForDay,
    accountBudgetAllocationForWeek,
    accountBudgetAllocationForMonth
  ) {
    const budgets = [
      ...categoryBudgetAllocationForDay,
      ...categoryBudgetAllocationForWeek,
      ...categoryBudgetAllocationForMonth,
      ...accountBudgetAllocationForDay,
      ...accountBudgetAllocationForWeek,
      ...accountBudgetAllocationForMonth,
    ];
    const percentageReached = budgets
      .filter((budget) => budget.percentage >= 1)
      .map((budget) => {
        return { id: budget.id, description: budget.description };
      });

    // Retrieve list of IDs that have already triggered a notification
    const notifiedBudgetIds = await AsyncStorage.getItem('notifiedBudgetIds');
    const notifiedBudgetIdsArray = notifiedBudgetIds
      ? JSON.parse(notifiedBudgetIds)
      : [];

    // Filter out previously notified budget IDs
    const percentageToNotify = percentageReached.filter(
      (budget) => !notifiedBudgetIdsArray.includes(budget.id)
    );

    // Filter and remove every dropped percentage from notified budget IDs
    const percentageDrop = budgets
      .filter(
        (budget) =>
          budget.percentage < 1 && notifiedBudgetIdsArray.includes(budget.id)
      )
      .forEach((budget) => {
        removeNotifiedBudgetId(budget.id);
      });

    // Loop through percentageToNotify and send notifications for new IDs
    const newNotifiedBudgetIds = [];
    percentageToNotify.forEach((budget) => {
      Notifications.scheduleNotificationAsync({
        content: {
          title: 'Budget notification',
          body: `You have reached your budget for ${budget.description}.`,
        },
        to: expoPushToken,
        trigger: { seconds: 5 },
      });
      newNotifiedBudgetIds.push(budget.id);
    });

    // Store updated list of notified budget IDs
    const updatedNotifiedBudgetIds = JSON.stringify([
      ...notifiedBudgetIdsArray,
      ...newNotifiedBudgetIds,
    ]);
    await AsyncStorage.setItem('notifiedBudgetIds', updatedNotifiedBudgetIds);
  }
  async function removeNotifiedBudgetId(idToRemove) {
    const notifiedBudgetIds = await AsyncStorage.getItem('notifiedBudgetIds');
    const notifiedBudgetIdsArray = notifiedBudgetIds
      ? JSON.parse(notifiedBudgetIds)
      : [];

    const updatedNotifiedBudgetIds = JSON.stringify(
      notifiedBudgetIdsArray.filter((id) => id !== idToRemove)
    );
    await AsyncStorage.setItem('notifiedBudgetIds', updatedNotifiedBudgetIds);
  }
  const handleSave = async () => {
    const validationResult = validateCategoryAllocationInputs(
      description,
      amount,
      dateRange,
      segmentValue === 'categoryAlloc' ? category : account
    );
    setError(validationResult);
    if (validationResult.errorMessage) return;

    if (segmentValue === 'categoryAlloc') {
      const { startDate, endDate } = getDateRange(dateRange.toLowerCase());
      try {
        setShowLoading(true);
        const categoryAllocation = {
          uid: userAccount.uid,
          description: description,
          amount: parseFloat(amount.replace(/,/g, '')),
          dateRange: dateRange.toLowerCase(),
          dateRangeStart: startDate,
          dateRangeEnd: endDate,
          category: {
            title: category.title,
            icon: category.icon,
            color: category.color,
          },
        };

        const familyCodeRef = doc(
          db,
          'familyCodes',
          userAccount.familyCode.toString()
        );

        await setDoc(
          familyCodeRef,
          {
            categoryBudgetAllocation: {
              [uuid.v4()]: categoryAllocation,
            },
          },
          { merge: true }
        );
        setShowLoading(false);
        handleCloseSheetPress();
      } catch (error) {
        setShowLoading(false);
        console.log(error);
      }
    } else {
      // Account allocation
      const { startDate, endDate } = getDateRange(dateRange.toLowerCase());

      try {
        setShowLoading(true);
        const accountAllocation = {
          providerName: userAccount.name,
          description: description,
          amount: parseFloat(amount.replace(/,/g, '')),
          dateRange: dateRange.toLowerCase(),
          dateRangeStart: startDate,
          dateRangeEnd: endDate,
          selectedAccount: {
            name: account.name,
            profileBackground: account.profileBackground,
            uid: account.uid,
          },
        };

        const familyCodeRef = doc(
          db,
          'familyCodes',
          userAccount.familyCode.toString()
        );

        // Check if the document already exists in Firestore
        const familyCodeSnapshot = await getDoc(familyCodeRef);
        const existingAllocation = familyCodeSnapshot.get(
          'accountBudgetAllocation'
        );

        if (existingAllocation) {
          const existingEntries = Object.entries(existingAllocation);

          // Check if any entry has the same dateRange or similar dateRangeStart, dateRangeEnd, and account.uid
          const hasConflict = existingEntries.some(([_, entry]) => {
            return (
              entry.dateRange === accountAllocation.dateRange &&
              entry.dateRangeStart.toDate().getTime() ===
                accountAllocation.dateRangeStart.getTime() &&
              entry.dateRangeEnd.toDate().getTime() ===
                accountAllocation.dateRangeEnd.getTime() &&
              entry.selectedAccount.uid ===
                accountAllocation.selectedAccount.uid
            );
          });

          // Conflict detected. Data not added.
          if (hasConflict) {
            setShowLoading(false);
            setError({
              errorMessage: 'Budget already exist.',
              errorDescription: false,
              errorAmount: false,
              errorDateRange: false,
              errorSelection: true,
            });
            return;
          }
        }

        await setDoc(
          familyCodeRef,
          {
            accountBudgetAllocation: {
              [uuid.v4()]: accountAllocation,
            },
          },
          { merge: true }
        );

        setShowLoading(false);
        handleCloseSheetPress();
      } catch (error) {
        setShowLoading(false);
        console.log(error);
      }
    }
  };
  const handleSuggest = async () => {
    // Budget Allocation Algorithm
    const allocateBudgetByExpensePercentage = (familyCode, budgetLimit) => {
      // Extract transaction category expenses from familyExpenseHistory
      const expenseHistory = familyCode.familyExpenseHistory;
      const familyCategoryExpenses = Object.entries(expenseHistory)
        .filter(([key, transaction]) => transaction.expenseType === 'expense')
        .map(([key, transaction]) => {
          return {
            category: transaction.category.title,
            amount: transaction.amount,
          };
        });

      // Step 1: Calculate total expenses for each category
      const categoryExpenses = {};
      familyCategoryExpenses.forEach((expense) => {
        if (expense.category in categoryExpenses) {
          categoryExpenses[expense.category] += expense.amount;
        } else {
          categoryExpenses[expense.category] = expense.amount;
        }
      });

      // Step 2: Calculate the total of all category expenses
      const totalExpenses = Object.values(categoryExpenses).reduce(
        (acc, expense) => acc + expense,
        0
      );

      // Step 3: Assign budgets to categories based on the percentage of individual category expenses
      const suggestedBudgets = {};
      familyCategoryExpenses.forEach((expense) => {
        const category = expense.category;
        const categoryExpense = categoryExpenses[category];
        const percentage = (categoryExpense / totalExpenses) * 100;
        const budget = Math.round((budgetLimit / 100) * percentage);

        // Scale down the budget if it exceeds the budget limit
        suggestedBudgets[category] =
          budget > budgetLimit ? budgetLimit : budget;
      });

      // Format the result
      const result = Object.keys(suggestedBudgets).map((title) => ({
        title,
        distributedValue: suggestedBudgets[title],
        icon: expenseCategories.find((category) => category.title === title)
          .icon,
        color: expenseCategories.find((category) => category.title === title)
          .color,
      }));

      return result;
    };

    const createCategoryAllocation = (familyCode, budget) => {
      const categoryStats = allocateBudgetByExpensePercentage(
        familyCode,
        budget
      );
      const { startDate, endDate } = getDateRange(dateRange.toLowerCase());
      return categoryStats.reduce((acc, category) => {
        const { title, distributedValue, icon, color } = category;
        const categoryAllocationId = uuid.v4();
        acc[categoryAllocationId] = {
          uid: userAccount.uid,
          description: `${title} Budget`,
          amount: distributedValue,
          dateRange: dateRange.toLowerCase(),
          dateRangeStart: startDate,
          dateRangeEnd: endDate,
          category: {
            title,
            icon,
            color,
          },
        };

        return acc;
      }, {});
    };

    try {
      const validationResult = validateSuggestInputs(amount, dateRange);
      setError(validationResult);
      if (validationResult.errorMessage) return;

      setShowLoading(true);
      const categoryAllocationList = createCategoryAllocation(
        familyCode,
        parseFloat(amount.replace(/,/g, ''))
      );
      const familyCodeRef = doc(
        db,
        'familyCodes',
        userAccount.familyCode.toString()
      );
      await setDoc(
        familyCodeRef,
        {
          categoryBudgetAllocation: categoryAllocationList,
        },
        { merge: true }
      );
      setShowLoading(false);
      handleCloseSheetPress();
    } catch (error) {
      setShowLoading(false);
      console.log(error);
    }
  };
  const handleDeleteAllocation = async (id, allocationType = 'category') => {
    try {
      const familyCodeRef = doc(
        db,
        'familyCodes',
        userAccount?.familyCode.toString()
      );

      if (allocationType === 'category') {
        await updateDoc(familyCodeRef, {
          [`categoryBudgetAllocation.${id}`]: deleteField(),
        });
      } else if (allocationType === 'account') {
        await updateDoc(familyCodeRef, {
          [`accountBudgetAllocation.${id}`]: deleteField(),
        });
      }

      removeNotifiedBudgetId(id);
    } catch (error) {
      console.log(error);
    }
  };

  // renders
  const renderBackdrop = useCallback(
    (props) => (
      <BottomSheetBackdrop
        {...props}
        disappearsOnIndex={-1}
        appearsOnIndex={0}
        opacity={0.3}
      />
    ),
    []
  );
  const renderCategoryItems = (item) => (
    <List.Item
      key={item.id}
      title={item.title}
      left={(props) => (
        <List.Icon
          {...props}
          icon={() => (
            <Avatar.Icon
              size={45}
              icon={item.icon}
              color="#FFFFFF"
              style={{
                backgroundColor: item.color,
              }}
            />
          )}
        />
      )}
      onPress={() => {
        setCategory(item);
        handleCategoryPress();
      }}
    />
  );
  const renderAccountList = (account) => (
    <List.Item
      key={account.uid}
      title={account.name}
      description={account.email}
      descriptionNumberOfLines={1}
      descriptionEllipsizeMode="tail"
      style={{
        backgroundColor: hexToRgba(account.profileBackground, 0.1),
        borderRadius: 12,
        marginVertical: 2,
      }}
      left={(props) => (
        <List.Icon
          {...props}
          icon={() => (
            <Avatar.Icon
              size={45}
              icon="account"
              color="#FFFFFF"
              style={{
                backgroundColor: account.profileBackground,
              }}
            />
          )}
        />
      )}
      right={(props) => (
        <View
          style={{
            backgroundColor: '#FFFFFF',
            width: 50,
            justifyContent: 'center',
            alignItems: 'center',
            borderRadius: 12,
          }}
        >
          {account.accountType === 'provider' ? (
            <Text variant="labelLarge" style={{ color: '#FF4C38' }}>
              P
            </Text>
          ) : (
            <Text variant="labelLarge" style={{ color: '#38B6FF' }}>
              M
            </Text>
          )}
        </View>
      )}
      onPress={() => {
        setAccount(account);
        handleAccountPress();
      }}
    />
  );
  const renderCategoryAllocation = (budget) => (
    <List.Item
      key={budget.id}
      style={{
        backgroundColor: hexToRgba(budget.category.color, 0.1),
        borderRadius: 10,
        marginVertical: 2,
      }}
      title={<Text style={{ fontWeight: 'bold' }}>{budget.description}</Text>}
      description={() => (
        <View style={{ width: '100%' }}>
          <Text>Budget: {formatCurrency(budget.amount)}</Text>
          <Text>Expense: {formatCurrency(budget.totalAmount)}</Text>
          <ProgressBar
            progress={budget.percentage}
            color={budget.category.color}
            style={{
              width: '100%',
              height: 12,
              borderRadius: 15,
              backgroundColor: '#D9D9D9',
            }}
          />
        </View>
      )}
      left={(props) => (
        <List.Icon
          {...props}
          icon={() => (
            <Avatar.Icon
              size={45}
              icon={budget.category.icon}
              color="#FFFFFF"
              style={{
                backgroundColor: budget.category.color,
              }}
            />
          )}
        />
      )}
      right={(props) => (
        <IconButton
          {...props}
          icon="delete"
          size={24}
          iconColor="#FFFFFF"
          onPress={() => {
            handleDeleteAllocation(budget.id);
          }}
          style={{
            backgroundColor: budget.category.color,
            alignSelf: 'center',
          }}
        />
      )}
    />
  );
  const renderAccountAllocation = (budget) => (
    <List.Item
      key={budget.id}
      style={{
        backgroundColor: hexToRgba(
          budget.selectedAccount.profileBackground,
          0.1
        ),
        borderRadius: 10,
        marginVertical: 2,
      }}
      title={
        <Text style={{ fontWeight: 'bold' }}>
          {budget.selectedAccount.name}
        </Text>
      }
      description={() => (
        <View style={{ width: '100%' }}>
          <Text variant="bodySmall">Description: {budget.description}</Text>
          <Text variant="bodySmall">
            Budget: {formatCurrency(budget.amount)}
          </Text>
          <Text variant="bodySmall">
            Expense: {formatCurrency(budget.totalAmount)}
          </Text>
          <ProgressBar
            progress={budget.percentage}
            color={budget.selectedAccount.profileBackground}
            style={{
              width: '100%',
              height: 12,
              borderRadius: 15,
              backgroundColor: '#D9D9D9',
            }}
          />
        </View>
      )}
      left={(props) => (
        <List.Icon
          {...props}
          icon={() => (
            <Avatar.Icon
              size={45}
              icon={'account'}
              color="#FFFFFF"
              style={{
                backgroundColor: budget.selectedAccount.profileBackground,
              }}
            />
          )}
        />
      )}
      right={(props) => (
        <IconButton
          {...props}
          icon="delete"
          size={24}
          iconColor="#FFFFFF"
          onPress={() => {
            handleDeleteAllocation(budget.id, 'account');
          }}
          style={{
            backgroundColor: budget.selectedAccount.profileBackground,
            alignSelf: 'center',
          }}
        />
      )}
    />
  );
  const renderDateRanges = (range, index) => (
    <List.Item
      key={index}
      title={range}
      onPress={() => {
        setDateRange(range);
        handleDateRangePress();
      }}
    />
  );

  return (
    <>
      <StatusBar
        backgroundColor="#FFFFFF"
        barStyle="dark-content"
        translucent={false}
      />
      <Appbar.Header style={{ backgroundColor: '#FFFFFF' }}>
        <Appbar.Content
          title={
            <Text variant="labelLarge" style={{ fontSize: 24, lineHeight: 30 }}>
              Budget Allocation
            </Text>
          }
        />
        <Appbar.Action
          icon="plus"
          onPress={() => {
            handleAllocation(true);
          }}
          color="#FFFFFF"
          style={{ backgroundColor: '#38B6FF' }}
        />
        <Appbar.Action
          icon="lightbulb-on"
          onPress={() => {
            handleAllocation(false);
          }}
          color="#FFFFFF"
          style={{ backgroundColor: '#FFAF38' }}
        />
      </Appbar.Header>
      <View style={styles.container}>
        <View
          style={{
            paddingHorizontal: '3%',
            flexGrow: 1,
          }}
        >
          {categoryBudgetAllocationForDay.length <= 0 &&
            categoryBudgetAllocationForWeek.length <= 0 &&
            categoryBudgetAllocationForMonth.length <= 0 &&
            accountBudgetAllocationForDay.length <= 0 &&
            accountBudgetAllocationForWeek.length <= 0 &&
            accountBudgetAllocationForMonth.length <= 0 && (
              <View
                style={{
                  alignItems: 'center',
                  justifyContent: 'center',
                  height: '100%',
                }}
              >
                <Text
                  style={{
                    textAlign: 'center',
                    fontSize: 16,
                    color: '#7F8192',
                  }}
                >
                  Get valuable insights into your spending habits by tracking
                  your expenses across different categories over a specified
                  period of time such as monthly, weekly, and daily budgets. You
                  will be notified when you approach your budget limit for each
                  category and account helping you stay on track with your
                  financial goals.
                </Text>
              </View>
            )}
          <ScrollView>
            {accountBudgetAllocationForDay.length > 0 ||
            accountBudgetAllocationForWeek.length > 0 ||
            accountBudgetAllocationForMonth.length > 0 ? (
              <List.Section title="Budget by Account">
                {accountBudgetAllocationForDay.length > 0 && (
                  <List.Accordion title="Day">
                    {accountBudgetAllocationForDay.map(renderAccountAllocation)}
                  </List.Accordion>
                )}
                {accountBudgetAllocationForWeek.length > 0 && (
                  <List.Accordion title="Week">
                    {accountBudgetAllocationForWeek.map(
                      renderAccountAllocation
                    )}
                  </List.Accordion>
                )}
                {accountBudgetAllocationForMonth.length > 0 && (
                  <List.Accordion title="Month">
                    {accountBudgetAllocationForMonth.map(
                      renderAccountAllocation
                    )}
                  </List.Accordion>
                )}
              </List.Section>
            ) : null}
            {categoryBudgetAllocationForDay.length > 0 ||
            categoryBudgetAllocationForWeek.length > 0 ||
            categoryBudgetAllocationForMonth.length > 0 ? (
              <List.Section title="Budget by Category">
                {categoryBudgetAllocationForDay.length > 0 && (
                  <List.Accordion title="Day">
                    {categoryBudgetAllocationForDay?.map(
                      renderCategoryAllocation
                    )}
                  </List.Accordion>
                )}
                {categoryBudgetAllocationForWeek.length > 0 && (
                  <List.Accordion title="Week">
                    {categoryBudgetAllocationForWeek?.map(
                      renderCategoryAllocation
                    )}
                  </List.Accordion>
                )}
                {categoryBudgetAllocationForMonth.length > 0 && (
                  <List.Accordion title="Month">
                    {categoryBudgetAllocationForMonth?.map(
                      renderCategoryAllocation
                    )}
                  </List.Accordion>
                )}
              </List.Section>
            ) : null}
          </ScrollView>
        </View>
        <BottomSheet
          ref={sheetRef}
          index={-1}
          snapPoints={snapPoints}
          enablePanDownToClose={true}
          backdropComponent={renderBackdrop}
          onChange={handleSheetChange}
        >
          <BottomSheetScrollView
            contentContainerStyle={{
              backgroundColor: '#FFFFFF',
              padding: 10,
            }}
          >
            {addAllocation && (
              <View>
                <Text variant="titleLarge" style={{ textAlign: 'center' }}>
                  Choose Allocation
                </Text>
                <SegmentedButtons
                  value={segmentValue}
                  onValueChange={setSegmentValue}
                  buttons={[
                    {
                      value: 'categoryAlloc',
                      label: 'Category',
                    },
                    {
                      value: 'accountAlloc',
                      label: 'Account',
                    },
                  ]}
                />
                {/* description */}
                <TextInput
                  mode="outlined"
                  label={'Budget Description'}
                  outlineColor="#F5F6FA"
                  outlineStyle={{ borderRadius: 5 }}
                  activeOutlineColor="#151940"
                  value={description}
                  error={error.errorDescription}
                  style={{
                    marginVertical: 5,
                    backgroundColor: '#F5F6FA',
                    width: '100%',
                  }}
                  onChangeText={(description) => setDescription(description)}
                  right={
                    <TextInput.Icon
                      icon={({ size }) => (
                        <Icon
                          name="note-plus-outline"
                          size={size}
                          color="#7F8192"
                        />
                      )}
                      disabled={true}
                      forceTextInputFocus={false}
                    />
                  }
                />
                {error.errorDescription && (
                  <HelperText type="error" visible={error.errorDescription}>
                    {error.errorMessage}
                  </HelperText>
                )}

                {/* amount */}
                <TextInput
                  mode="outlined"
                  label={
                    segmentValue === 'categoryAlloc'
                      ? 'Amount'
                      : `Amount (₱${formatCurrency(balancePromptLimit)})`
                  }
                  outlineColor="#F5F6FA"
                  outlineStyle={{ borderRadius: 5 }}
                  activeOutlineColor="#151940"
                  value={amount}
                  error={error.errorAmount}
                  style={{
                    marginVertical: 5,
                    backgroundColor: '#F5F6FA',
                    width: '100%',
                  }}
                  onChangeText={(value) => handleAmountChange(value, setAmount)}
                  render={(props) => (
                    <NativeTextInput {...props} keyboardType={'numeric'} />
                  )}
                  right={
                    <TextInput.Icon
                      icon={({ size }) => (
                        <Icon name="currency-php" size={size} color="#7F8192" />
                      )}
                      disabled={true}
                      forceTextInputFocus={false}
                    />
                  }
                />
                {error.errorAmount && (
                  <HelperText type="error" visible={error.errorAmount}>
                    {error.errorMessage}
                  </HelperText>
                )}

                {/* date range */}
                <View>
                  <TouchableWithoutFeedback
                    onPress={() => handleDateRangePress()}
                  >
                    <View style={{ width: '100%' }}>
                      <TextInput
                        mode="outlined"
                        outlineColor="#F5F6FA"
                        outlineStyle={{ borderRadius: 5 }}
                        value={dateRange ? dateRange : 'Select Date Range'}
                        error={error.errorDateRange}
                        style={{
                          marginVertical: 5,
                          backgroundColor: '#F5F6FA',
                        }}
                        editable={false}
                        right={
                          <TextInput.Icon
                            icon={({ size }) => (
                              <Icon
                                name="chevron-down"
                                size={size + 10}
                                color="#7F8192"
                              />
                            )}
                            disabled={true}
                            forceTextInputFocus={false}
                          />
                        }
                      />
                    </View>
                  </TouchableWithoutFeedback>
                  {error.errorDateRange && (
                    <HelperText type="error" visible={error.errorDateRange}>
                      {error.errorMessage}
                    </HelperText>
                  )}
                  <Surface
                    style={[
                      styles.surface,
                      {
                        height: 180,
                        display: dateRangeExpanded ? 'flex' : 'none',
                      },
                    ]}
                    elevation={2}
                  >
                    <View
                      style={{
                        width: '100%',
                        height: '100%',
                      }}
                    >
                      <BottomSheetScrollView
                        contentContainerStyle={{
                          backgroundColor: '#FFFFFF',
                          flexGrow: 1,
                        }}
                      >
                        {['Day', 'Week', 'Month'].map(renderDateRanges)}
                      </BottomSheetScrollView>
                    </View>
                  </Surface>
                </View>

                {/* category */}
                <View
                  style={{
                    display: dateRangeExpanded ? 'none' : 'flex',
                  }}
                >
                  <TouchableWithoutFeedback
                    onPress={() =>
                      segmentValue === 'categoryAlloc'
                        ? handleCategoryPress()
                        : handleAccountPress()
                    }
                  >
                    <View style={{ width: '100%' }}>
                      <TextInput
                        mode="outlined"
                        outlineColor="#F5F6FA"
                        outlineStyle={{ borderRadius: 5 }}
                        value={
                          segmentValue === 'categoryAlloc'
                            ? category?.title || 'Select Category'
                            : account?.name || 'Select Account'
                        }
                        error={error.errorSelection}
                        style={{
                          marginVertical: 5,
                          backgroundColor: '#F5F6FA',
                        }}
                        editable={false}
                        right={
                          <TextInput.Icon
                            icon={({ size }) => (
                              <Icon
                                name="chevron-down"
                                size={size + 10}
                                color="#7F8192"
                              />
                            )}
                            disabled={true}
                            forceTextInputFocus={false}
                          />
                        }
                      />
                    </View>
                  </TouchableWithoutFeedback>
                  {error.errorSelection && (
                    <HelperText type="error" visible={error.errorSelection}>
                      {error.errorMessage}
                    </HelperText>
                  )}
                  <Surface
                    style={[
                      styles.surface,
                      {
                        display:
                          segmentValue === 'categoryAlloc'
                            ? categoryExpanded
                              ? 'flex'
                              : 'none'
                            : accountExpanded
                            ? 'flex'
                            : 'none',
                      },
                    ]}
                    elevation={2}
                  >
                    <View
                      style={{
                        width: '100%',
                        height: '100%',
                      }}
                    >
                      <BottomSheetScrollView
                        contentContainerStyle={{
                          backgroundColor: '#FFFFFF',
                          flexGrow: 1,
                        }}
                      >
                        {segmentValue === 'categoryAlloc'
                          ? expenseCategories.map(renderCategoryItems)
                          : accounts
                              ?.filter(
                                (account) =>
                                  account.accountType !==
                                  userAccount.accountType
                              )
                              .map(renderAccountList)}
                      </BottomSheetScrollView>
                    </View>
                  </Surface>
                </View>
                <Button
                  mode="contained"
                  compact={true}
                  loading={showLoading}
                  buttonColor={
                    segmentValue === 'categoryAlloc' ? '#38B6FF' : '#FF4C38'
                  }
                  onPress={() => handleSave()}
                  contentStyle={{ padding: 3 }}
                  style={{
                    borderRadius: 5,
                    display: categoryExpanded ? 'none' : 'flex',
                    marginVertical: 30,
                  }}
                >
                  Save
                </Button>
              </View>
            )}

            {suggestAllocation && (
              <View>
                {/* Display allocation icon */}
                <View
                  style={{
                    width: '100%',
                    height: 130,
                    justifyContent: 'center',
                    marginBottom: 30,
                  }}
                >
                  <Image
                    resizeMode="contain"
                    style={{
                      width: '100%',
                      height: '100%',
                    }}
                    source={require('../assets/AppAssets/allocation_algo_icon.png')}
                  />
                </View>
                <Text
                  variant="displayMedium"
                  style={{
                    fontSize: 24,
                    fontWeight: '700',
                    textAlign: 'center',
                  }}
                >
                  Suggest Category Allocation
                </Text>
                <Text style={{ textAlign: 'auto' }}>
                  The main idea of the Category Allocation Algorithm is to
                  distribute the available budget among different expense
                  categories based on their individual expenses. It calculates
                  the total expenses, assigns budgets proportional to each
                  category's expenses, and scales down budgets that exceed the
                  budget limit. The algorithm ensures a fair allocation of
                  resources while staying within the specified budget
                  constraint.
                </Text>
                {showMore && (
                  <Text style={{ textAlign: 'auto' }}>
                    <Text>
                      {'\n'}
                      <Text>Calculation Steps:</Text>
                      {'\n\n'}
                      <Text>
                        1. Calculate total expenses for each category:
                      </Text>
                      {'\n'}
                      <Text style={{ marginLeft: 10 }}>• Food: ₱70</Text>
                      {'\n'}
                      <Text style={{ marginLeft: 10 }}>
                        • Transportation: ₱30
                      </Text>
                      {'\n\n'}
                      <Text>
                        2. Calculate the total expenses across all categories:
                      </Text>
                      {'\n'}
                      <Text style={{ marginLeft: 10 }}>
                        Total Expenses = ₱70 + ₱30 = ₱100
                      </Text>
                      {'\n\n'}
                      <Text>
                        3. Assign budgets to each category based on the
                        percentage of their individual expenses out of the total
                        expenses:
                      </Text>
                      {'\n'}
                      <Text style={{ marginLeft: 10 }}>
                        • Food:
                        {'\n'}
                        <Text style={{ marginLeft: 20 }}>
                          Percentage = (₱70 / ₱100) * 100 = 70%
                        </Text>
                        {'\n'}
                        <Text style={{ marginLeft: 20 }}>
                          Budget = (₱100 * 70%) = ₱70
                        </Text>
                      </Text>
                      {'\n'}
                      <Text style={{ marginLeft: 10 }}>
                        • Transportation:
                        {'\n'}
                        <Text style={{ marginLeft: 20 }}>
                          Percentage = (₱30 / ₱100) * 100 = 30%
                        </Text>
                        {'\n'}
                        <Text style={{ marginLeft: 20 }}>
                          Budget = (₱100 * 30%) = ₱30
                        </Text>
                      </Text>
                      {'\n\n'}
                      <Text>
                        Since both budgets are within the budget limit of ₱100,
                        there is no need to scale them down.
                      </Text>
                      {'\n\n'}
                      <Text>
                        Example with scaling down:
                        {'\n'}
                        If the budget limit is ₱20, and the calculated budget
                        for Transportation is ₱30, it exceeds the budget limit.
                        In this case, the budget for Transportation will be
                        scaled down to the budget limit:
                      </Text>
                      {'\n'}
                      <Text style={{ marginLeft: 10 }}>
                        Budget = (₱100 * 30%) = ₱30 (original calculated budget)
                        {'\n'}
                        Scaled Down Budget = ₱20 (budget limit)
                      </Text>
                    </Text>
                  </Text>
                )}
                <TouchableOpacity onPress={toggleShowMore}>
                  <Text style={{ fontWeight: 'bold' }}>
                    {showMore ? 'Hide' : 'Show More'}
                  </Text>
                </TouchableOpacity>

                {/* budget */}
                <TextInput
                  mode="outlined"
                  label="Budget"
                  outlineColor="#F5F6FA"
                  outlineStyle={{ borderRadius: 5 }}
                  activeOutlineColor="#151940"
                  value={amount}
                  error={error.errorAmount}
                  style={{
                    marginVertical: 5,
                    backgroundColor: '#F5F6FA',
                    width: '100%',
                  }}
                  onChangeText={(value) => handleAmountChange(value, setAmount)}
                  render={(props) => (
                    <NativeTextInput {...props} keyboardType={'numeric'} />
                  )}
                  right={
                    <TextInput.Icon
                      icon={({ size }) => (
                        <Icon name="currency-php" size={size} color="#7F8192" />
                      )}
                      disabled={true}
                      forceTextInputFocus={false}
                    />
                  }
                />
                {error.errorAmount && (
                  <HelperText type="error" visible={error.errorAmount}>
                    {error.errorMessage}
                  </HelperText>
                )}

                {/* date range */}
                <View>
                  <TouchableWithoutFeedback
                    onPress={() => handleDateRangePress()}
                  >
                    <View style={{ width: '100%' }}>
                      <TextInput
                        mode="outlined"
                        outlineColor="#F5F6FA"
                        outlineStyle={{ borderRadius: 5 }}
                        value={dateRange ? dateRange : 'Select Date Range'}
                        error={error.errorDateRange}
                        style={{
                          marginVertical: 5,
                          backgroundColor: '#F5F6FA',
                        }}
                        editable={false}
                        right={
                          <TextInput.Icon
                            icon={({ size }) => (
                              <Icon
                                name="chevron-down"
                                size={size + 10}
                                color="#7F8192"
                              />
                            )}
                            disabled={true}
                            forceTextInputFocus={false}
                          />
                        }
                      />
                    </View>
                  </TouchableWithoutFeedback>
                  {error.errorDateRange && (
                    <HelperText type="error" visible={error.errorDateRange}>
                      {error.errorMessage}
                    </HelperText>
                  )}
                  <Surface
                    style={[
                      styles.surface,
                      {
                        height: 180,
                        display: dateRangeExpanded ? 'flex' : 'none',
                      },
                    ]}
                    elevation={2}
                  >
                    <View
                      style={{
                        width: '100%',
                        height: '100%',
                      }}
                    >
                      <BottomSheetScrollView
                        contentContainerStyle={{
                          backgroundColor: '#FFFFFF',
                          flexGrow: 1,
                        }}
                      >
                        {['Day', 'Week', 'Month'].map(renderDateRanges)}
                      </BottomSheetScrollView>
                    </View>
                  </Surface>
                </View>

                <Button
                  mode="contained"
                  compact={true}
                  loading={showLoading}
                  buttonColor="#38B6FF"
                  onPress={() => handleSuggest()}
                  contentStyle={{ padding: 3 }}
                  style={{
                    borderRadius: 5,
                    marginVertical: 30,
                  }}
                >
                  Suggest
                </Button>
              </View>
            )}
          </BottomSheetScrollView>
        </BottomSheet>
      </View>
    </>
  );
};

export default BudgetScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  surface: {
    padding: 8,
    height: 240,
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
    borderRadius: 10,
    backgroundColor: '#FFFFFF',
  },
});
