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
import { handleAmountChange, hexToRgba } from '../Helper/FormatFunctions';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { expenseCategories, incomeCategories } from '../Helper/CategoriesData';
import { validateBudgetInputs } from '../Helper/Validation';
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
    console.log(token);
  } else {
    alert('Must use physical device for Push Notifications');
  }

  return token;
};
// Custom segment buttons in the bottom sheet
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
                  buttonValue === 'budgetByCagetory'
                    ? '#38B6FF'
                    : buttonValue === 'budgetByAccount'
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
              ? '#7F8192'
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
  const { userAccount, familyCode } = useContext(AppContext);
  const [segmentValue, setSegmentValue] = useState('budgetByCagetory');
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
  const [allocationByCategoryExpanded, setAllocationByCategoryExpanded] =
    useState(false);
  const [addAllocation, setAddAllocation] = useState(false);
  const [suggestAllocation, setSuggestAllocation] = useState(false);
  // notification
  const [expoPushToken, setExpoPushToken] = useState('');
  const [notification, setNotification] = useState(false);
  const notificationListener = useRef();
  const responseListener = useRef();
  // bottom sheet
  const sheetRef = useRef(null);
  const snapPoints = useMemo(() => ['90%'], []);

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

  // helper functions
  const handleAllocationByCategoryPress = () =>
    setAllocationByCategoryExpanded(!allocationByCategoryExpanded);
  const handleDateRangePress = () => setDateRangeExpanded(!dateRangeExpanded);
  const handleCategoryPress = () => setCategoryExpanded(!categoryExpanded);
  const handleAllocation = (isAddAllocation) => {
    setAddAllocation(isAddAllocation);
    setSuggestAllocation(!isAddAllocation);
    handleSnapPress(0);
  };
  const getDateRange = (range) => {
    const now = new Date();
    let startDate = null;
    let endDate = null;

    if (range === 'day') {
      startDate = new Date(now.getTime());
      endDate = new Date(now.getTime() + 24 * 60 * 60 * 1000);
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
      setAddAllocation(false);
      setSuggestAllocation(false);
      setDescription('');
      setAmount('');
      setDateRange('');
      setCategory(null);
    }
  }, []);
  const handleSnapPress = useCallback((index) => {
    sheetRef.current?.snapToIndex(index);
  }, []);
  const handleCloseSheetPress = useCallback(() => {
    sheetRef.current?.close();
  }, []);

  const handleSave = async () => {
    const validationResult = validateBudgetInputs(
      description,
      amount,
      dateRange,
      category
    );
    setError(validationResult);
    if (validationResult.errorMessage) return;

    const { startDate, endDate } = getDateRange(dateRange.toLowerCase());

    if (segmentValue === 'budgetByCagetory') {
      try {
        setShowLoading(true);
        const categoryAllocation = {
          uid: userAccount.uid,
          name: userAccount.name,
          description: description,
          amount: amount,
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
          userAccount.code.toString()
        );

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
    } else {
      try {
        const accountAllocation = {
          uid: userAccount.uid,
          name: userAccount.name,
          accountType: userAccount.type,
          accountDescription: description,
          amount: amount,
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
          userAccount.code.toString()
        );

        await setDoc(
          familyCodeRef,
          {
            budgetAllocation: {
              account: {
                [uuid.v4()]: accountAllocation,
              },
            },
          },
          { merge: true }
        );
      } catch (error) {
        console.log(error);
      }
    }
  };

  const handleRemove = async (id) => {
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
            handleRemove(budget.id);
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
  function computeBudgetSummary(timeRange) {
    const filteredBudgets = Object.entries(
      familyCode.budgetAllocation.category || {}
    )?.filter(([_, { dateRange }]) => dateRange === timeRange);

    return filteredBudgets.reduce((budgetSummary, [key, budget]) => {
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
      budgetSummary.push({
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
      async function handleBudgetPercentageReached(id, percentage) {
        try {
          if (percentage >= 1) {
            const isNotificationScheduled = await AsyncStorage.getItem(id);
            if (!isNotificationScheduled) {
              await schedulePushNotification(
                'Budget Allocation Full',
                `You have reached the maximum budget allocation for the ${category.title} category. 
                Please review your spending habits and consider adjusting your budget accordingly.`,
                {}, // additional parameter for data/sender/message
                5 // send notification after 5 seconds
              );
              await AsyncStorage.setItem(id, 'true');
            }
          }
        } catch (error) {
          console.error(error);
        }
      }
      handleBudgetPercentageReached(key, percentage);

      return budgetSummary;
    }, []);
  }

  const budgetAllocationForDay = computeBudgetSummary('day');

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
        <View style={{ paddingHorizontal: '3%' }}>
          <ScrollView>
            <List.Section title="Budget by Category">
              <List.Accordion
                title="Day"
                expanded={allocationByCategoryExpanded}
                onPress={handleAllocationByCategoryPress}
              >
                {budgetAllocationForDay?.map(renderCategoryAllocation)}
              </List.Accordion>
            </List.Section>
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
                <SegmentedButtons
                  value={segmentValue}
                  onValueChange={setSegmentValue}
                  buttons={[
                    {
                      value: 'budgetByCagetory',
                      label: 'Category',
                      disabled: false,
                    },
                    {
                      value: 'budgetByAccount',
                      label: 'Account',
                      disabled: false,
                    },
                  ]}
                />

                {/* description */}
                <TextInput
                  mode="outlined"
                  label={
                    segmentValue === 'budgetByCagetory'
                      ? 'Budget Description'
                      : 'Account Description'
                  }
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
                  buttonColor={
                    segmentValue === 'budgetByCagetory' ? '#38B6FF' : '#FF4C38'
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
                    source={require('../assets/AppAssets/backpack.png')}
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
                  Backpack Algorithm
                </Text>
                <Text style={{ textAlign: 'center' }}>
                  The backpack algorithm, also known as the knapsack algorithm,
                  is commonly used to solve optimization problems where a set of
                  items have to be selected to maximize their total value
                  without exceeding a given value.
                </Text>
                <Button
                  mode="contained"
                  compact={true}
                  loading={showLoading}
                  buttonColor="#38B6FF"
                  onPress={() => handleSave()}
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
