import { StyleSheet, View } from 'react-native';
import React, { useContext, useEffect, useState } from 'react';
import {
  Button,
  Card,
  IconButton,
  List,
  Modal,
  Portal,
  Text,
} from 'react-native-paper';
import { AccountContext } from '../../Helper/Context';
import { formatCurrency, formatDate } from '../../Helper/FormatFunctions';
import { ScrollView } from 'react-native-gesture-handler';
import {
  arrayRemove,
  collection,
  doc,
  getDocs,
  query,
  updateDoc,
  where,
} from 'firebase/firestore';
import { db } from '../../config';
import { useNavigation } from '@react-navigation/native';

const DailyScreen = () => {
  const navigation = useNavigation();
  const { accountInfo, accountsInfo } = useContext(AccountContext);
  const [dailyDateFilter, setDailyDateFilter] = useState(new Date());
  const [totalBalance, setTotalBalance] = useState(0);
  const [totalIncome, setTotalIncome] = useState(0);
  const [totalExpense, setTotalExpense] = useState(0);

  const filteredDailyTransactions = (
    accountsInfo?.transactions && Object.entries(accountsInfo.transactions)
  )
    ?.filter(([key, transaction]) => {
      const transactionDate = transaction.date.toDate();

      return (
        transactionDate.getDate() === dailyDateFilter.getDate() &&
        transactionDate.getMonth() === dailyDateFilter.getMonth() &&
        transactionDate.getFullYear() === dailyDateFilter.getFullYear()
      );
    })
    .map(([key, transaction]) => {
      return { id: key, ...transaction };
    })
    .filter((transaction) => {
      if (accountInfo.type === 'provider') {
        return (
          transaction.accountType === 'provider' ||
          transaction.accountType === 'member'
        );
      } else if (accountInfo.type === 'member') {
        return transaction.accountType === 'member';
      } else {
        return true; // show all transactions if user account type is not recognized
      }
    });

  useEffect(() => {
    const calculateTotals = () => {
      const income = filteredDailyTransactions
        ?.filter((transaction) => transaction.type === 'income')
        .reduce((prev, curr) => prev + parseInt(curr.amount), 0);
      setTotalIncome(income);

      const expense = filteredDailyTransactions
        ?.filter((transaction) => transaction.type === 'expense')
        .reduce((prev, curr) => prev + parseInt(curr.amount), 0);
      setTotalExpense(expense);
      const balance = totalIncome - totalExpense;
      setTotalBalance(balance);
    };

    calculateTotals();
  }, [filteredDailyTransactions]);

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

  return (
    <View style={styles.container}>
      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'center',
          alignItems: 'center',
          backgroundColor: 'white',
        }}
      >
        <IconButton
          icon="chevron-left"
          iconColor="black"
          size={24}
          onPress={handlePreviousDay}
        />
        <Text variant="bodyLarge">{formatDate(dailyDateFilter)}</Text>
        <IconButton
          icon="chevron-right"
          iconColor="black"
          size={24}
          onPress={handleNextDay}
        />
      </View>
      <Card>
        <Card.Content>
          <Text variant="titleMedium">
            Balance: {`PHP ${formatCurrency(totalBalance)}`}
          </Text>
          <Text variant="titleMedium">
            Budget: {`PHP ${formatCurrency(totalIncome)}`}
          </Text>
          <Text variant="titleMedium">
            Expense: {`PHP ${formatCurrency(totalExpense)}`}
          </Text>
        </Card.Content>
      </Card>
      <View style={{ flex: 1 }}>
        <ScrollView>
          {filteredDailyTransactions?.map((transaction, index) => {
            return (
              <List.Item
                key={index}
                title={transaction.category.title}
                description={transaction.name}
                left={(props) => (
                  <List.Icon {...props} icon={transaction.category.icon} />
                )}
                right={(props) => (
                  <Text
                    {...props}
                    style={{
                      color: transaction.type === 'income' ? 'green' : 'red',
                      fontWeight: 'bold',
                      alignSelf: 'center',
                    }}
                  >
                    {transaction.amount}
                  </Text>
                )}
                onPress={() => {
                  navigation.navigate('TransactionDetailScreen', {
                    transactionID: transaction.id,
                  });
                }}
              />
            );
          })}
        </ScrollView>
      </View>
    </View>
  );
};

export default DailyScreen;

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
