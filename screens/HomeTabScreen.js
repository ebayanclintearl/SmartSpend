import { StatusBar, StyleSheet, View } from 'react-native';
import React, { useContext, useEffect, useState } from 'react';

import {
  Appbar,
  Avatar,
  Button,
  Card,
  FAB,
  IconButton,
  List,
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
const HomeTabScreen = () => {
  const navigation = useNavigation();
  const { userAccount, familyCode } = useContext(AppContext);
  const [value, setValue] = useState('monthly');
  const [dateFilter, setDateFilter] = useState(new Date());
  const [totalBalance, setTotalBalance] = useState(0);
  const [totalIncome, setTotalIncome] = useState(0);
  const [totalExpense, setTotalExpense] = useState(0);

  useEffect(() => {
    const currentDate = new Date();
    if (value === 'daily') {
      setDateFilter(currentDate);
    } else if (value === 'weekly') {
      const weekStart = currentDate.getDate() - currentDate.getDay() + 1; // Monday of the current week
      setDateFilter(
        new Date(currentDate.getFullYear(), currentDate.getMonth(), weekStart)
      );
    } else if (value === 'monthly') {
      setDateFilter(
        new Date(currentDate.getFullYear(), currentDate.getMonth(), 1)
      );
    }
  }, [value, setDateFilter]);

  const filteredByDateFamilyExpenseHistory = Object.entries(
    familyCode?.familyExpenseHistory || {}
  )
    ?.filter(([key, transaction]) => {
      const transactionDate = transaction?.date?.toDate();
      if (value === 'daily') {
        return (
          transactionDate.getDate() === dateFilter.getDate() &&
          transactionDate.getMonth() === dateFilter.getMonth() &&
          transactionDate.getFullYear() === dateFilter.getFullYear()
        );
      } else if (value === 'weekly') {
        const weekStart = dateFilter.getDate() - dateFilter.getDay() + 1; // Monday of the current week
        const weekEnd = weekStart + 6; // Sunday of the current week
        return (
          transactionDate.getDate() >= weekStart &&
          transactionDate.getDate() <= weekEnd &&
          transactionDate.getMonth() === dateFilter.getMonth() &&
          transactionDate.getFullYear() === dateFilter.getFullYear()
        );
      } else if (value === 'monthly') {
        return (
          transactionDate.getMonth() === dateFilter.getMonth() &&
          transactionDate.getFullYear() === dateFilter.getFullYear()
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
    });

  useEffect(() => {
    const calculateTotals = () => {
      const income = filteredByDateFamilyExpenseHistory
        ?.filter((transaction) => transaction.type === 'income')
        .reduce((prev, curr) => prev + curr.amount, 0);
      setTotalIncome(income);

      const expense = filteredByDateFamilyExpenseHistory
        ?.filter((transaction) => transaction.type === 'expense')
        .reduce((prev, curr) => prev + curr.amount, 0);
      setTotalExpense(expense);

      const balance = totalIncome - totalExpense;
      setTotalBalance(balance);
    };

    calculateTotals();
  }, [filteredByDateFamilyExpenseHistory]);

  const offsetMap = {
    daily: { days: 1 },
    weekly: { weeks: 1 },
    monthly: { months: 1 },
  };

  const handlePreviousDate = () => {
    const { days = 0, weeks = 0, months = 0, years = 0 } = offsetMap[value];
    setDateFilter(
      new Date(
        dateFilter.getFullYear() - years,
        dateFilter.getMonth() - months,
        dateFilter.getDate() - days - weeks * 7
      )
    );
  };

  const handleNextDate = () => {
    const { days = 0, weeks = 0, months = 0, years = 0 } = offsetMap[value];
    setDateFilter(
      new Date(
        dateFilter.getFullYear() + years,
        dateFilter.getMonth() + months,
        dateFilter.getDate() + days + weeks * 7
      )
    );
  };
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
            <View style={{ flexDirection: 'row' }}>
              <Avatar.Text
                size={35}
                label={userAccount?.name?.slice(0, 1)?.toUpperCase()}
                style={{
                  backgroundColor: userAccount?.profileBackground,
                  marginRight: 5,
                }}
                labelStyle={{ color: 'white', top: 2 }}
              />
              <View>
                <Text variant="labelMedium" style={{ color: '#7F8192' }}>
                  Welcome!
                </Text>
                <Text variant="titleSmall">
                  {userAccount?.name?.split(' ')[0]}
                </Text>
              </View>
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
                      Family Budget
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
                      value: 'monthly',
                      label: 'Month',
                    },
                    {
                      value: 'weekly',
                      label: 'Week',
                    },
                    { value: 'daily', label: 'Day' },
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
                  {value === 'weekly'
                    ? formatDateRange(
                        dateFilter,
                        new Date(dateFilter.getTime() + 6 * 24 * 60 * 60 * 1000)
                      )
                    : formatDate(dateFilter)}
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
                <Text variant="titleLarge">Expense History</Text>
                {filteredByDateFamilyExpenseHistory
                  .filter((transaction) => {
                    if (userAccount.type === 'provider') {
                      return (
                        transaction.accountType === 'provider' ||
                        transaction.accountType === 'member'
                      );
                    } else if (userAccount.type === 'member') {
                      return transaction.uid === userAccount.uid;
                    } else {
                      return [];
                    }
                  })
                  ?.map((transaction, index) => {
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
                                  transaction.type === 'income'
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
                            navigation.navigate('TransactionDetailScreen', {
                              transactionId: transaction.id,
                            });
                          }}
                        />
                      </View>
                    );
                  })}
                <View style={{ width: '100%', height: 46 }}></View>
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
        onPress={() => navigation.navigate('TransactionScreen')}
        color="#FFFFFF"
        customSize={64}
      />
    </>
  );
};

export default HomeTabScreen;

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
