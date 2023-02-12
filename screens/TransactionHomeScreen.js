import { StyleSheet, View } from 'react-native';
import React, { useContext, useEffect, useState } from 'react';
import {
  Appbar,
  Avatar,
  Button,
  Card,
  FAB,
  IconButton,
  List,
  Searchbar,
  Surface,
  Text,
} from 'react-native-paper';
import {
  arrayUnion,
  collection,
  doc,
  onSnapshot,
  setDoc,
  updateDoc,
} from 'firebase/firestore';
import { db } from '../config';
import { AccountContext } from '../Helper/Context';

const TransactionHomeScreen = ({ navigation }) => {
  const { accountInfo, accountsInfo } = useContext(AccountContext);
  const [searchQuery, setSearchQuery] = useState('');
  const onChangeSearch = (query) => setSearchQuery(query);
  const filteredTransactions = accountsInfo?.transactions?.filter(
    (transaction) => {
      return (
        transaction?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        transaction.category.title
          .toLowerCase()
          .includes(searchQuery.toLowerCase())
      );
    }
  );

  const [dailyDateFilter, setDailyDateFilter] = useState(new Date());
  const filteredDailyTransactions = accountsInfo?.transactions?.filter(
    (transaction) => {
      const timestamp = transaction.date;
      const timestampMilliseconds =
        timestamp.seconds * 1000 + timestamp.nanoseconds / 1000000;
      const transactionDate = new Date(timestampMilliseconds);
      return (
        transactionDate.getDate() === dailyDateFilter.getDate() &&
        transactionDate.getMonth() === dailyDateFilter.getMonth() &&
        transactionDate.getFullYear() === dailyDateFilter.getFullYear()
      );
    }
  );
  const handlePreviousDay = () => {
    setDailyDateFilter(
      new Date(
        dailyDateFilter.getFullYear(),
        dailyDateFilter.getMonth(),
        dailyDateFilter.getDate() - 1
      )
    );
  };
  const handleNextDay = () => {
    setDailyDateFilter(
      new Date(
        dailyDateFilter.getFullYear(),
        dailyDateFilter.getMonth(),
        dailyDateFilter.getDate() + 1
      )
    );
  };

  const [weeklyDateFilter, setWeeklyDateFilter] = useState(
    new Date(new Date().getFullYear(), new Date().getMonth(), 1)
  );
  const endDateFilter = new Date(
    weeklyDateFilter.getFullYear(),
    weeklyDateFilter.getMonth(),
    weeklyDateFilter.getDate() + 6
  );

  const filteredWeeklyTransactions = accountsInfo?.transactions?.filter(
    (transaction) => {
      const timestamp = transaction.date;
      const timestampMilliseconds =
        timestamp.seconds * 1000 + timestamp.nanoseconds / 1000000;
      const transactionDate = new Date(timestampMilliseconds);
      return (
        transactionDate >= weeklyDateFilter && transactionDate <= endDateFilter
      );
    }
  );
  const handlePreviousWeek = () => {
    setWeeklyDateFilter(
      new Date(
        weeklyDateFilter.getFullYear(),
        weeklyDateFilter.getMonth(),
        weeklyDateFilter.getDate() - 7
      )
    );
  };

  const handleNextWeek = () => {
    setWeeklyDateFilter(
      new Date(
        weeklyDateFilter.getFullYear(),
        weeklyDateFilter.getMonth(),
        weeklyDateFilter.getDate() + 7
      )
    );
  };

  const [dateFilter, setDateFilter] = useState(
    new Date(new Date(new Date().getFullYear(), new Date().getMonth(), 1))
  );

  const filteredMonthlyTransactions = accountsInfo?.transactions?.filter(
    (transaction) => {
      const timestamp = transaction.date;
      const timestampMilliseconds =
        timestamp.seconds * 1000 + timestamp.nanoseconds / 1000000;
      const transactionDate = new Date(timestampMilliseconds);
      return (
        transactionDate.getMonth() === dateFilter.getMonth() &&
        transactionDate.getFullYear() === dateFilter.getFullYear()
      );
    }
  );
  const handlePreviousMonth = () => {
    setDateFilter(new Date(dateFilter.setMonth(dateFilter.getMonth() - 1)));
  };
  const handleNextMonth = () => {
    setDateFilter(new Date(dateFilter.setMonth(dateFilter.getMonth() + 1)));
  };
  const formatDate = (date) => {
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
    return (
      date.getDate() + ' ' + months[date.getMonth()] + ' ' + date.getFullYear()
    );
  };
  const formatDateAndTime = (timestamp) => {
    let timestampMilliseconds =
      timestamp.seconds * 1000 + timestamp.nanoseconds / 1000000;
    let date = new Date(timestampMilliseconds);
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

  return (
    <View style={styles.container}>
      <Appbar.Header>
        <Appbar.Content title="Transactions" />
      </Appbar.Header>
      <Card>
        <Card.Content>
          <Text variant="titleMedium">Total Balance</Text>
          <Text variant="bodyMedium">Income</Text>
          <Text variant="bodyMedium">Expense</Text>
        </Card.Content>
      </Card>
      <Searchbar
        placeholder="Search"
        onChangeText={onChangeSearch}
        value={searchQuery}
      />

      {/* {filteredTransactions?.map((transaction, index) => {
        return (
          <List.Item
            key={index}
            title={transaction.category.title}
            description={dateString}
            left={(props) => (
              <List.Icon {...props} icon={transaction.category.icon} />
            )}
            right={(props) => (
              <Text
                {...props}
                style={{
                  color: 'red',
                  fontWeight: 'bold',
                  alignSelf: 'center',
                }}
              >
                {transaction.amount}
              </Text>
            )}
            onPress={() => {}}
          />
        );
      })} */}
      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        <IconButton
          icon="arrow-left"
          iconColor="black"
          size={20}
          onPress={handlePreviousDay}
        />
        <Text variant="bodyLarge">{formatDate(dailyDateFilter)}</Text>
        <IconButton
          icon="arrow-right"
          iconColor="black"
          size={20}
          onPress={handleNextDay}
        />
      </View>
      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        <IconButton
          icon="arrow-left"
          iconColor="black"
          size={20}
          onPress={handlePreviousMonth}
        />
        {/* <Text variant="bodyLarge">{`${formatDate(
          weeklyDateFilter
        )} to ${formatDate(
          new Date(
            weeklyDateFilter.getFullYear(),
            weeklyDateFilter.getMonth(),
            weeklyDateFilter.getDate() + 6
          )
        )}`}</Text> */}
        <Text variant="bodyLarge">{formatDate(dateFilter)}</Text>
        <IconButton
          icon="arrow-right"
          iconColor="black"
          size={20}
          onPress={handleNextMonth}
        />
      </View>
      {filteredMonthlyTransactions?.map((transaction, index) => {
        return (
          <List.Item
            key={index}
            title={transaction.category.title}
            description={formatDateAndTime(transaction.date)}
            left={(props) => (
              <List.Icon {...props} icon={transaction.category.icon} />
            )}
            right={(props) => (
              <Text
                {...props}
                style={{
                  color: 'red',
                  fontWeight: 'bold',
                  alignSelf: 'center',
                }}
              >
                {transaction.amount}
              </Text>
            )}
            onPress={() => {}}
          />
        );
      })}

      {console.log(accountsInfo.transactions)}
      <FAB.Group
        open={open}
        visible
        icon={open ? 'close' : 'plus'}
        actions={[
          {
            icon: 'cash-plus',
            label: 'Income',
            onPress: () => navigation.navigate('TransactionScreen'),
          },
          {
            icon: 'cash-minus',
            label: 'Expense',
            onPress: () => console.log('Pressed expense'),
          },
          {
            icon: 'piggy-bank',
            label: 'Budget',
            onPress: () => console.log('Pressed budget'),
          },
        ]}
        onStateChange={onStateChange}
      />
    </View>
  );
};

export default TransactionHomeScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 10,
  },
});
