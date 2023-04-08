import {
  Image,
  ScrollView,
  StatusBar,
  StyleSheet,
  TextInput as NativeTextInput,
  TouchableWithoutFeedback,
  View,
  Platform,
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
import { deleteField, doc, setDoc, updateDoc } from 'firebase/firestore';
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

// Schedules a push notification to be sent after 2 seconds
const schedulePushNotification = async (title, body, data, seconds) => {
  await Notifications.scheduleNotificationAsync({
    content: {
      title: title,
      body: body,
      data: data,
    },
    trigger: { seconds: seconds },
  });
};

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

const BudgetScreen = () => {
  const { userAccount, familyCode } = useContext(AppContext);
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [dateRange, setDateRange] = useState('');
  const [category, setCategory] = useState(null);
  const [categoryExpanded, setCategoryExpanded] = useState(false);
  const [dateRangeExpanded, setDateRangeExpanded] = useState(false);
  const [showLoading, setShowLoading] = useState(false);
  const [error, setError] = useState({
    errorMessage: '',
    errorDescription: false,
    errorAmount: false,
    errorDateRange: false,
    errorCategory: false,
  });
  const [addAllocation, setAddAllocation] = useState(false);
  const [suggestAllocation, setSuggestAllocation] = useState(false);
  // notification
  const [expoPushToken, setExpoPushToken] = useState('');
  const [notification, setNotification] = useState(false);
  const notificationListener = useRef();
  const responseListener = useRef();
  // Compute for budget Allocation for different date ranges
  const budgetAllocationForDay = computeBudgetAllocation('day');
  const budgetAllocationForWeek = computeBudgetAllocation('week');
  const budgetAllocationForMonth = computeBudgetAllocation('month');
  // bottom sheet
  const sheetRef = useRef(null);
  const snapPoints = useMemo(() => ['90%'], []);

  // notification
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
    const handleBudgetPercentageReached = async (id, percentage, category) => {
      try {
        const isNotificationScheduled = await AsyncStorage.getItem(id);
        if (!isNotificationScheduled && percentage >= 1 && percentage - 1 < 1) {
          await AsyncStorage.setItem(id, 'true'); // Set the flag before scheduling the notification
          await schedulePushNotification(
            'Budget Allocation Full',
            `You have reached the maximum budget allocation for the ${category.title} category.`,
            {},
            5
          );
        } else if (isNotificationScheduled && percentage < 1) {
          await AsyncStorage.removeItem(id); // Remove the flag if the percentage drops below 100%
        }
      } catch (error) {
        console.error(error);
      }
    };
    async function notifyWhenBudgetAllocationIsFull() {
      // Combine budgetAllocation arrays
      const allBudgetAllocations = budgetAllocationForDay
        .concat(budgetAllocationForWeek)
        .concat(budgetAllocationForMonth);

      // Notify when budget allocation is full for all budget allocations
      const promises = allBudgetAllocations.map((budget) => {
        return handleBudgetPercentageReached(
          budget.id,
          budget.percentage,
          budget.category
        );
      });

      await Promise.all(promises);
    }
    notifyWhenBudgetAllocationIsFull();
  }, [
    budgetAllocationForDay,
    budgetAllocationForMonth,
    budgetAllocationForWeek,
  ]);

  // helper functions
  const handleDateRangePress = () => setDateRangeExpanded(!dateRangeExpanded);
  const handleCategoryPress = () => setCategoryExpanded(!categoryExpanded);
  const handleAllocation = (isAddAllocation) => {
    setAddAllocation(isAddAllocation);
    setSuggestAllocation(!isAddAllocation);
    setError({
      errorMessage: '',
      errorDescription: false,
      errorAmount: false,
      errorDateRange: false,
      errorCategory: false,
    });
    setShowLoading(false);
    setDescription('');
    setAmount('');
    setDateRange('');
    setCategory(null);
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
    // if (index === -1) {
    //   setAddAllocation(false);
    //   setSuggestAllocation(false);
    // }
  }, []);
  const handleSnapPress = useCallback((index) => {
    sheetRef.current?.snapToIndex(index);
  }, []);
  const handleCloseSheetPress = useCallback(() => {
    sheetRef.current?.close();
  }, []);

  // Filter transactions by date range
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
        budget.dateRange === timeRange &&
        category.title === budget.category.title
      );
    });
  }

  // Compute the budget allocation for a given time range
  function computeBudgetAllocation(timeRange) {
    const filteredBudgets = Object.entries(
      familyCode?.budgetAllocation?.category || {}
    )?.filter(([_, { dateRange }]) => dateRange === timeRange);
    const result = filteredBudgets.reduce((budgetAllocation, [key, budget]) => {
      const {
        name,
        uid,
        description,
        amount,
        dateRange,
        dateRangeStart,
        dateRangeEnd,
        category,
      } = budget;
      const filteredTransactions = filterFamilyExpenseHistoryByDateRange(
        familyCode.familyExpenseHistory,
        timeRange,
        budget
      );
      const totalAmount = filteredTransactions.reduce(
        (total, [, { amount }]) => total + amount,
        0
      );
      const percentage = Math.min(totalAmount / amount, 1);
      budgetAllocation.push({
        id: key,
        name,
        uid,
        description,
        amount,
        dateRange,
        dateRangeStart,
        dateRangeEnd,
        category,
        totalAmount: totalAmount,
        percentage: percentage,
        budgetStartDate: budget.dateRangeStart.toDate(),
        budgetEndDate: budget.dateRangeEnd.toDate(),
      });
      return budgetAllocation;
    }, []);

    return result;
  }
  const handleSave = async () => {
    const validationResult = validateCategoryAllocationInputs(
      description,
      amount,
      dateRange,
      category
    );
    setError(validationResult);
    if (validationResult.errorMessage) return;

    const { startDate, endDate } = getDateRange(dateRange.toLowerCase());
    try {
      setShowLoading(true);
      const categoryAllocation = {
        uid: userAccount.uid,
        name: userAccount.name,
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

      const familyCodeRef = doc(db, 'familyCodes', userAccount.code.toString());

      await setDoc(
        familyCodeRef,
        {
          budgetAllocation: {
            category: {
              [uuid.v4()]: categoryAllocation,
            },
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
  };

  const handleSuggest = async () => {
    const getCategoryStatistics = (familyCode, budgetLimit) => {
      // Extract transaction category expenses from familyExpenseHistory
      const expenseHistory = familyCode.familyExpenseHistory;
      const familyCategoryExpenses = Object.entries(expenseHistory)
        .filter(([key, transaction]) => transaction.type === 'expense')
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
      // Step 2: Sort categories by total expenses in descending order
      const sortedCategories = Object.keys(categoryExpenses).sort(
        (a, b) => categoryExpenses[b] - categoryExpenses[a]
      );
      // Step 3-4: Assign budgets to categories
      let remainingBudget = budgetLimit;
      const suggestedBudgets = {};

      // Determine the total variance in spending across categories
      const totalVariance = Object.values(categoryExpenses).reduce(
        (acc, val) => acc + (val - budgetLimit / expenseCategories.length) ** 2,
        0
      );
      // Assign budgets to each category based on variance and frequency of spending
      sortedCategories.forEach((category) => {
        const categoryExpense = categoryExpenses[category];

        // Determine the variance in spending within the category
        const categoryVariance = familyCategoryExpenses
          .filter((expense) => expense.category === category)
          .reduce(
            (acc, expense) =>
              acc +
              (expense.amount -
                categoryExpense /
                  familyCategoryExpenses.filter((e) => e.category === category)
                    .length) **
                2,
            0
          );

        // Determine the weight for this category based on variance and frequency of spending
        const weight =
          (categoryVariance / totalVariance) *
          Math.log(
            familyCategoryExpenses.filter(
              (expense) => expense.category === category
            ).length + 1
          );

        // Determine the budget for this category based on the weight and remaining budget
        const budget = remainingBudget * weight;

        // Update remaining budget and suggested budgets
        remainingBudget -= budget;
        suggestedBudgets[category] = budget;
      });

      // Allocate remaining budget evenly across categories if necessary
      if (remainingBudget > 0) {
        const numCategories = Object.keys(suggestedBudgets).length;
        const remainingBudgetPerCategory = remainingBudget / numCategories;
        Object.keys(suggestedBudgets).forEach((category) => {
          suggestedBudgets[category] += remainingBudgetPerCategory;
        });
      }

      const result = Object.keys(suggestedBudgets).map((title) => ({
        title,
        distributedValue: Math.round(suggestedBudgets[title]),
        icon: expenseCategories.find((category) => category.title === title)
          .icon,
        color: expenseCategories.find((category) => category.title === title)
          .color,
      }));

      return result;
    };

    const createCategoryAllocation = (familyCode, budget) => {
      const categoryStats = getCategoryStatistics(familyCode, budget);
      const { startDate, endDate } = getDateRange(dateRange.toLowerCase());
      return categoryStats.reduce((acc, category) => {
        const { title, distributedValue, icon, color } = category;
        const categoryAllocationId = uuid.v4();

        acc[categoryAllocationId] = {
          uid: userAccount.uid,
          name: userAccount.name,
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
      console.log(error.errorMessage);
      if (validationResult.errorMessage) return;

      setShowLoading(true);
      const categoryAllocationList = createCategoryAllocation(
        familyCode,
        parseFloat(amount.replace(/,/g, ''))
      );
      const familyCodeRef = doc(db, 'familyCodes', userAccount.code.toString());
      await setDoc(
        familyCodeRef,
        {
          budgetAllocation: {
            category: categoryAllocationList,
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
  };

  const handleDeleteAllocation = async (id) => {
    try {
      const familyCodeRef = doc(
        db,
        'familyCodes',
        userAccount?.code.toString()
      );
      await updateDoc(familyCodeRef, {
        ['budgetAllocation.category.' + id]: deleteField(),
      });
      // remove the saved id from notification
      const itemExists = await AsyncStorage.getItem(id);
      if (itemExists !== null) {
        await AsyncStorage.removeItem(id);
      }
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

  const renderCategoryAllocation = (budget) => (
    <List.Item
      key={budget.id}
      style={{
        backgroundColor: hexToRgba(budget.category.color, 0.1),
        borderRadius: 10,
        marginVertical: 2,
      }}
      title={budget.name}
      description={() => (
        <View style={{ width: '100%' }}>
          <Text
            style={{
              fontWeight: 'bold',
            }}
          >
            PHP {budget.totalAmount}
          </Text>
          <Text
            style={{
              fontWeight: 'bold',
            }}
          >
            Budget: {formatCurrency(budget.amount)}
          </Text>
          <Text
            style={{
              fontWeight: 'bold',
            }}
          >
            Desc: {budget.description}
          </Text>
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
          {budgetAllocationForDay.length <= 0 &&
            budgetAllocationForWeek.length <= 0 &&
            budgetAllocationForMonth.length <= 0 && (
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
                  category, helping you stay on track with your financial goals.
                </Text>
              </View>
            )}
          <ScrollView>
            {budgetAllocationForDay.length > 0 ||
            budgetAllocationForWeek.length > 0 ||
            budgetAllocationForMonth.length > 0 ? (
              <List.Section title="Budget by Category">
                {budgetAllocationForDay.length > 0 && (
                  <List.Accordion title="Day">
                    {budgetAllocationForDay?.map(renderCategoryAllocation)}
                  </List.Accordion>
                )}
                {budgetAllocationForWeek.length > 0 && (
                  <List.Accordion title="Week">
                    {budgetAllocationForWeek?.map(renderCategoryAllocation)}
                  </List.Accordion>
                )}
                {budgetAllocationForMonth.length > 0 && (
                  <List.Accordion title="Month">
                    {budgetAllocationForMonth?.map(renderCategoryAllocation)}
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
                  Category Allocation
                </Text>

                {/* description */}
                <TextInput
                  mode="outlined"
                  label="Budget Description"
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
                  label="Amount"
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
                        value={dateRange ? dateRange : 'Select DateRange'}
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
                    onPress={() => handleCategoryPress()}
                  >
                    <View style={{ width: '100%' }}>
                      <TextInput
                        mode="outlined"
                        outlineColor="#F5F6FA"
                        outlineStyle={{ borderRadius: 5 }}
                        value={category ? category.title : 'Select Category'}
                        error={error.errorCategory}
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
                  {error.errorCategory && (
                    <HelperText type="error" visible={error.errorCategory}>
                      {error.errorMessage}
                    </HelperText>
                  )}
                  <Surface
                    style={[
                      styles.surface,
                      { display: categoryExpanded ? 'flex' : 'none' },
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
                        {expenseCategories.map(renderCategoryItems)}
                      </BottomSheetScrollView>
                    </View>
                  </Surface>
                </View>
                <Button
                  mode="contained"
                  compact={true}
                  loading={showLoading}
                  buttonColor="#38B6FF"
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
                {/* Display backpack img */}
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
                    alignSelf: 'center',
                  }}
                >
                  Budget Allocation Algorithm
                </Text>
                <Text style={{ textAlign: 'center' }}>
                  Description: The algorithm automatically allocates a user's
                  budget to different expense categories based on their past
                  spending habits. It calculates the total expenses for each
                  category, sorts them by total expenses in descending order,
                  assigns budgets to each category based on variance and
                  frequency of spending, and allocates any remaining budget
                  evenly across categories if necessary. The output is a list of
                  suggested budgets for each expense category.
                </Text>

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
                        value={dateRange ? dateRange : 'Select DateRange'}
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
