import { StatusBar, StyleSheet, TouchableOpacity, View } from 'react-native';
import React, { useContext, useEffect, useState } from 'react';

import {
  Appbar,
  Avatar,
  Button,
  Card,
  FAB,
  IconButton,
  List,
  Modal,
  Portal,
  Surface,
  Text,
} from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { AppContext } from '../Helper/Context';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import {
  formatCurrency,
  formatDate,
  formatDateRange,
} from '../Helper/FormatFunctions';
import { ScrollView } from 'react-native-gesture-handler';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Image } from 'react-native';

const SegmentedButtons = ({ value, onValueChange, buttons }) => (
  <View
    style={{
      flexDirection: 'row',
      justifyContent: 'space-between',
      width: '100%',
      paddingHorizontal: 5,
    }}
  >
    {buttons.map(({ value: buttonValue, label }) => (
      <Button
        key={buttonValue}
        mode={'contained-tonal'}
        style={
          value !== buttonValue && {
            backgroundColor: 'transparent',
          }
        }
        labelStyle={{ color: value === buttonValue ? '#151940' : '#7F8192' }}
        icon={({ size, color, direction }) => (
          <MaterialCommunityIcons
            name="circle"
            color={value === buttonValue ? '#38B6FF' : '#7F8192'}
            size={12}
          />
        )}
        onPress={() => onValueChange(buttonValue)}
      >
        {label}
      </Button>
    ))}
  </View>
);
const ExpenseHistoryScreen = ({ jumpTo }) => {
  const navigation = useNavigation();
  const { userAccount, familyCode, setBalancePromptLimit } =
    useContext(AppContext);
  const [value, setValue] = useState('month');
  const [currentDate, setCurrentDate] = useState(new Date());
  const [totalBalance, setTotalBalance] = useState(0);
  const [totalIncome, setTotalIncome] = useState(0);
  const [totalExpense, setTotalExpense] = useState(0);
  const [visible, setVisible] = useState(false);

  // This code filters the family expenses by the selected time period (day, week, or month)
  // and then sorts the transactions in reverse chronological order. It also maps the transaction objects to include their corresponding IDs.
  // Finally, it filters the transactions based on the user account type (provider or member).
  // The resulting array contains the filtered and sorted family expenses ready to be displayed in the app.
  const filteredByDateFamilyExpenseHistory = Object.entries(
    familyCode?.familyExpenseHistory || {}
  )
    ?.filter(([key, transaction]) => {
      const transactionDate = transaction?.date?.toDate();
      if (value === 'day') {
        return (
          transactionDate.getDate() === currentDate.getDate() &&
          transactionDate.getMonth() === currentDate.getMonth() &&
          transactionDate.getFullYear() === currentDate.getFullYear()
        );
      } else if (value === 'week') {
        const monday = new Date(currentDate.getTime());
        monday.setDate(currentDate.getDate() - currentDate.getDay() + 1);
        const sunday = new Date(monday.getTime());
        sunday.setDate(monday.getDate() + 6);
        sunday.setHours(23, 59, 59, 0);

        return transactionDate >= monday && transactionDate <= sunday;
      } else if (value === 'month') {
        return (
          transactionDate.getMonth() === currentDate.getMonth() &&
          transactionDate.getFullYear() === currentDate.getFullYear()
        );
      }
    })
    .sort(([, transactionA], [, transactionB]) => {
      const dateA = transactionA.date.toDate();
      const dateB = transactionB.date.toDate();
      return dateB.getTime() - dateA.getTime();
    })
    .map(([key, transaction]) => {
      return { id: key, ...transaction };
    })
    .filter((transaction) => {
      if (userAccount.accountType === 'provider') {
        return (
          transaction.accountType === 'provider' ||
          transaction.accountType === 'member'
        );
      } else if (userAccount.accountType === 'member') {
        return transaction.uid === userAccount.uid;
      } else {
        return [];
      }
    });

  const filteredByDateAccountBudgetAllocation = Object.entries(
    familyCode?.accountBudgetAllocation || {}
  )
    ?.filter(([key, budget]) => {
      const startDate = budget.dateRangeStart.toDate();
      const endDate = budget.dateRangeEnd.toDate();

      if (value === 'day') {
        return (
          startDate.getDate() === currentDate.getDate() &&
          startDate.getMonth() === currentDate.getMonth() &&
          startDate.getFullYear() === currentDate.getFullYear() &&
          budget.dateRange === 'day'
        );
      } else if (value === 'week') {
        const monday = new Date(currentDate.getTime());
        monday.setDate(currentDate.getDate() - currentDate.getDay() + 1);
        const sunday = new Date(monday.getTime());
        sunday.setDate(monday.getDate() + 6);
        sunday.setHours(23, 59, 59, 0);
        return (
          startDate >= monday &&
          endDate <= sunday &&
          budget.dateRange === 'week'
        );
      } else if (value === 'month') {
        return (
          startDate.getMonth() === currentDate.getMonth() &&
          startDate.getFullYear() === currentDate.getFullYear() &&
          budget.dateRange === 'month'
        );
      }
    })
    .filter(([key, budget]) => {
      return budget.selectedAccount.uid === userAccount.uid;
    })
    .map(([key, budget]) => ({ id: key, ...budget }));

  // Helper Functions
  const showModal = () => setVisible(true);
  const hideModal = () => setVisible(false);
  const offsetMap = {
    day: { days: 1 },
    week: { weeks: 1 },
    month: { months: 1 },
  };
  const handlePreviousDate = () => {
    const { days = 0, weeks = 0, months = 0, years = 0 } = offsetMap[value];
    setCurrentDate(
      new Date(
        currentDate.getFullYear() - years,
        currentDate.getMonth() - months,
        currentDate.getDate() - days - weeks * 7
      )
    );
  };
  const handleNextDate = () => {
    const { days = 0, weeks = 0, months = 0, years = 0 } = offsetMap[value];
    setCurrentDate(
      new Date(
        currentDate.getFullYear() + years,
        currentDate.getMonth() + months,
        currentDate.getDate() + days + weeks * 7
      )
    );
  };

  // UseEffects
  // This code block sets the current date based on the selected value of a frequency filter (day, week, month)
  useEffect(() => {
    const newCurrentDate = new Date();
    if (value === 'day') {
      setCurrentDate(newCurrentDate);
    } else if (value === 'week') {
      const weekStart = newCurrentDate.getDate() - newCurrentDate.getDay() + 1; // Monday of the current week
      setCurrentDate(
        new Date(
          newCurrentDate.getFullYear(),
          newCurrentDate.getMonth(),
          weekStart
        )
      );
    } else if (value === 'month') {
      setCurrentDate(
        new Date(newCurrentDate.getFullYear(), newCurrentDate.getMonth(), 1)
      );
    }
  }, [value, setCurrentDate]);

  // This code block handles loading the selected option month, week, day
  useEffect(() => {
    const loadSelectedOption = async () => {
      try {
        const savedOption = await AsyncStorage.getItem('selectedOption');
        if (savedOption !== null) {
          setValue(savedOption);
        } else {
          // If no saved option exists, set the default option
          await AsyncStorage.setItem('selectedOption', value);
        }
      } catch (error) {
        console.log('Error loading selected option:', error);
      }
    };

    loadSelectedOption(); // Call the loadSelectedOption function when the component mounts
  }, []);

  // This code block handles saving the selected option month, week, day
  useEffect(() => {
    const saveSelectedOption = async () => {
      try {
        await AsyncStorage.setItem('selectedOption', value);
      } catch (error) {
        console.log('Error saving selected option:', error);
      }
    };

    saveSelectedOption(); // Call the saveSelectedOption function whenever the selectedOption updates
  }, [value]);

  // This code block handles showing modal from budget allocation
  useEffect(() => {
    // Remove budget IDs from AsyncStorage that are not present in accountBudgetAllocation
    const removeShownBudgetIds = async () => {
      const shownBudgetIds = await AsyncStorage.getItem('shownBudgetIds');
      const shownBudgetIdsArray = shownBudgetIds
        ? JSON.parse(shownBudgetIds)
        : [];
      const accountBudgetAllocation = familyCode?.accountBudgetAllocation;
      if (!Object.keys(accountBudgetAllocation || {}).length) return;
      const updatedShownBudgetIds = shownBudgetIdsArray.filter((id) =>
        accountBudgetAllocation.hasOwnProperty(id)
      );
      await AsyncStorage.setItem(
        'shownBudgetIds',
        JSON.stringify(updatedShownBudgetIds)
      );
    };
    const fetchBudgetAllocation = async () => {
      if (
        filteredByDateAccountBudgetAllocation &&
        filteredByDateAccountBudgetAllocation.length > 0
      ) {
        const budgetId = filteredByDateAccountBudgetAllocation[0].id;
        // Check if the budget ID has been shown before
        const shownBudgetIds = await AsyncStorage.getItem('shownBudgetIds');
        const shownBudgetIdsArray = shownBudgetIds
          ? JSON.parse(shownBudgetIds)
          : [];
        const hasShown = shownBudgetIdsArray.includes(budgetId);
        if (!hasShown) {
          showModal();
          // Store the shown budget ID to prevent showing the modal again
          shownBudgetIdsArray.push(budgetId);
          await AsyncStorage.setItem(
            'shownBudgetIds',
            JSON.stringify(shownBudgetIdsArray)
          );
        }
      }
    };
    if (
      filteredByDateAccountBudgetAllocation.length > 0 &&
      filteredByDateAccountBudgetAllocation[0].dateRange === value
    ) {
      removeShownBudgetIds();
      fetchBudgetAllocation();
    }
  }, [filteredByDateAccountBudgetAllocation, value]);
  // This code block calculates the total income, total expense, and total balance based on the filtered family expense history.
  // It runs whenever the filteredByDateFamilyExpenseHistory state changes.
  useEffect(() => {
    const calculateTotals = () => {
      const income = filteredByDateFamilyExpenseHistory
        ?.filter((transaction) => transaction.expenseType === 'income')
        .reduce((prev, curr) => prev + curr.amount, 0);

      setTotalIncome(
        userAccount.accountType === 'member'
          ? filteredByDateAccountBudgetAllocation[0]?.amount ?? 0
          : income
      );

      const expense = filteredByDateFamilyExpenseHistory
        ?.filter((transaction) => transaction.expenseType === 'expense')
        .reduce((prev, curr) => prev + curr.amount, 0);
      setTotalExpense(expense);

      const balance = totalIncome - totalExpense;
      setTotalBalance(balance);
      setBalancePromptLimit(balance);
    };

    calculateTotals();
  }, [
    filteredByDateFamilyExpenseHistory,
    filteredByDateAccountBudgetAllocation,
  ]);

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
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <TouchableOpacity
                style={{ flexDirection: 'row', alignItems: 'center' }}
                onPress={() => jumpTo('account')}
              >
                <IconButton
                  icon={() => (
                    <Text
                      variant="bodyMedium"
                      style={{
                        color: 'white',
                        top: 3,
                        fontSize: 18,
                      }}
                    >
                      {userAccount?.name?.slice(0, 1)?.toUpperCase()}
                    </Text>
                  )}
                  containerColor={userAccount?.profileBackground}
                  size={20}
                />
                <View>
                  <Text variant="labelMedium" style={{ color: '#7F8192' }}>
                    Welcome!
                  </Text>
                  <Text variant="titleSmall">
                    {userAccount?.name?.split(' ')[0]}
                  </Text>
                </View>
              </TouchableOpacity>
            </View>
          }
        />
        <Appbar.Action
          icon="magnify"
          onPress={() => {
            navigation.navigate('SearchScreen');
          }}
          color="#151940"
        />
      </Appbar.Header>
      <View style={styles.container}>
        <Portal>
          <Modal
            visible={visible}
            onDismiss={hideModal}
            contentContainerStyle={{
              backgroundColor: 'white',
              padding: 20,
              margin: 10,
              borderRadius: 10,
            }}
          >
            {filteredByDateAccountBudgetAllocation?.map(
              ({ id, providerName, amount, description, dateRange }) => (
                <View key={id}>
                  <IconButton
                    icon="close"
                    iconColor={'black'}
                    size={32}
                    style={{ alignSelf: 'flex-end' }}
                    onPress={() => hideModal()}
                  />
                  <View
                    style={{
                      width: '100%',
                      height: 75,
                      marginVertical: 5,
                      justifyContent: 'center',
                    }}
                  >
                    <Image
                      resizeMode="contain"
                      style={{
                        width: '100%',
                        height: '100%',
                      }}
                      source={require('../assets/AppAssets/popup_icon.png')}
                    />
                  </View>

                  <Text
                    variant="displayMedium"
                    style={{ fontSize: 25, textAlign: 'center' }}
                  >
                    {providerName}
                  </Text>
                  <Text>The provider has allocated a budget for you.</Text>
                  <Text
                    style={{
                      textAlign: 'center',
                    }}
                  >
                    Details
                  </Text>
                  <Text
                    variant="displaySmall"
                    style={{
                      color: '#38B6FF',
                      fontSize: 30,
                      textAlign: 'center',
                    }}
                  >
                    Php {formatCurrency(amount)}
                  </Text>
                  <Text
                    style={{
                      textAlign: 'center',
                    }}
                  >
                    {description}
                  </Text>
                  <Text
                    style={{
                      textAlign: 'center',
                    }}
                  >
                    Duration: {dateRange}
                  </Text>
                </View>
              )
            )}
          </Modal>
        </Portal>
        <ScrollView>
          <View style={{ paddingHorizontal: '3%', marginTop: 1 }}>
            <View
              style={{
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: 35,
              }}
            >
              <Text
                style={{
                  position: 'absolute',
                  top: 30,
                  textAlign: 'center',
                  color: '#FFFFFF',
                }}
                variant="titleSmall"
              >
                Total Balance
              </Text>
              <Text
                style={{
                  position: 'absolute',
                  top: 65,
                  textAlign: 'center',
                  color: '#FFFFFF',
                }}
                variant="headlineLarge"
              >
                Php {formatCurrency(totalBalance)}
              </Text>
              <Card.Cover
                source={
                  totalBalance >= 0
                    ? require('../assets/AppAssets/gradient_bg.png')
                    : require('../assets/AppAssets/gradient_bg_negative.png')
                }
                style={{ zIndex: -1, width: '100%' }}
              />
              <View style={{ justifyContent: 'space-evenly', width: '100%' }}>
                <Card
                  style={{
                    position: 'absolute',
                    left: 10,
                    bottom: -20,
                    borderRadius: 5,
                    backgroundColor: '#FFFFFF',
                    width: '45%',
                    alignItems: 'center',
                  }}
                  elevation={2}
                >
                  <Card.Content>
                    <Text
                      variant="bodyLarge"
                      style={{
                        color: '#38B6FF',
                        textAlign: 'center',
                        fontWeight: '900',
                      }}
                    >
                      Php {formatCurrency(totalIncome)}
                    </Text>
                    <Text
                      variant="titleSmall"
                      style={{ color: '#7F8192', textAlign: 'center' }}
                    >
                      {userAccount.accountType === 'provider'
                        ? 'Family Budget'
                        : 'Budget Limit'}
                    </Text>
                  </Card.Content>
                </Card>
                <Card
                  style={{
                    position: 'absolute',
                    right: 10,
                    bottom: -20,
                    borderRadius: 5,
                    backgroundColor: '#FFFFFF',
                    width: '45%',
                    alignItems: 'center',
                  }}
                  elevation={2}
                >
                  <Card.Content>
                    <Text
                      variant="bodyLarge"
                      style={{
                        color: '#FF4C38',
                        textAlign: 'center',
                        fontWeight: '900',
                      }}
                    >
                      Php {formatCurrency(totalExpense)}
                    </Text>
                    <Text
                      variant="titleSmall"
                      style={{ color: '#7F8192', textAlign: 'center' }}
                    >
                      Expense
                    </Text>
                  </Card.Content>
                </Card>
              </View>
            </View>
            <Surface
              style={{
                padding: 2,
                borderRadius: 10,
                backgroundColor: '#FFFFFF',
                marginBottom: 8,
              }}
              elevation={1}
            >
              <View
                style={{
                  flexDirection: 'row',
                  width: '100%',
                  justifyContent: 'space-evenly',
                  marginTop: 5,
                }}
              >
                <SegmentedButtons
                  value={value}
                  onValueChange={setValue}
                  buttons={[
                    {
                      value: 'month',
                      label: 'Month',
                    },
                    {
                      value: 'week',
                      label: 'Week',
                    },
                    { value: 'day', label: 'Day' },
                  ]}
                />
              </View>
              <View
                style={{
                  flexDirection: 'row',
                  justifyContent: 'center',
                  alignItems: 'center',
                  backgroundColor: 'white',
                  borderRadius: 10,
                }}
              >
                <IconButton
                  icon="chevron-left"
                  iconColor="black"
                  size={22}
                  onPress={handlePreviousDate}
                />
                <Text variant="bodyLarge" style={{ color: '#7F8192' }}>
                  {value === 'week'
                    ? formatDateRange(
                        currentDate,
                        new Date(
                          currentDate.getTime() + 6 * 24 * 60 * 60 * 1000
                        )
                      )
                    : formatDate(currentDate)}
                </Text>
                <IconButton
                  icon="chevron-right"
                  iconColor="black"
                  size={22}
                  onPress={handleNextDate}
                />
              </View>
            </Surface>
            <Card
              mode="contained"
              style={{
                backgroundColor: 'rgba(245, 246, 250, 0.8)',
                borderRadius: 15,
              }}
            >
              <Card.Content>
                <Text variant="titleLarge">Recent History</Text>
                {filteredByDateFamilyExpenseHistory?.map(
                  (transaction, index) => {
                    return (
                      <View
                        key={index}
                        style={{
                          backgroundColor: 'rgba(245, 246, 250, 0.8)',
                          overflow: 'hidden',
                          borderRadius: 10,
                          margin: 5,
                        }}
                      >
                        <List.Item
                          title={transaction.description}
                          description={transaction.name}
                          style={{
                            backgroundColor: '#FFFFFF',
                          }}
                          left={(props) => (
                            <List.Icon
                              {...props}
                              icon={() => (
                                <Avatar.Icon
                                  size={45}
                                  icon={transaction.category.icon}
                                  color="#FFFFFF"
                                  style={{
                                    backgroundColor: transaction.category.color,
                                  }}
                                />
                              )}
                            />
                          )}
                          right={(props) => (
                            <Text
                              {...props}
                              style={{
                                color:
                                  transaction.expenseType === 'income'
                                    ? '#38B6FF'
                                    : '#FF4C38',
                                fontWeight: 'bold',
                                alignSelf: 'center',
                              }}
                            >
                              {formatCurrency(transaction.amount)}
                            </Text>
                          )}
                          onPress={() => {
                            navigation.navigate('DetailScreen', {
                              transactionId: transaction.id,
                            });
                          }}
                        />
                      </View>
                    );
                  }
                )}
                {filteredByDateFamilyExpenseHistory.length === 0 && (
                  <View
                    style={{
                      width: '100%',
                      height: 46,
                      justifyContent: 'center',
                    }}
                  >
                    <Text>No Data</Text>
                  </View>
                )}
              </Card.Content>
            </Card>
          </View>
        </ScrollView>
      </View>
      <FAB
        icon="plus"
        style={[
          styles.fab,
          { backgroundColor: totalBalance >= 0 ? '#38B6FF' : '#FF4C38' },
        ]}
        onPress={() => navigation.navigate('AddScreen')}
        color="#FFFFFF"
        customSize={64}
      />
    </>
  );
};

export default ExpenseHistoryScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  tabContainer: {
    flex: 1,
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
    borderRadius: 50,
  },
});
