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
import {
  formatCurrency,
  formatDate,
  formatDateAndTime,
} from '../../Helper/FormatFunctions';
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
const DailyScreen = () => {
  const { accountInfo, accountsInfo } = useContext(AccountContext);
  const [dailyDateFilter, setDailyDateFilter] = useState(new Date());
  const [totalBalance, setTotalBalance] = useState(0);
  const [totalIncome, setTotalIncome] = useState(0);
  const [totalExpense, setTotalExpense] = useState(0);
  const [visible, setVisible] = useState(false);
  const [transaction, setTransaction] = useState({});

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

  const showModal = (transaction) => {
    setVisible(true);
    setTransaction(transaction);
  };
  const hideModal = () => setVisible(false);

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

  const removeItem = async (id) => {
    const filteredTransactions = accountsInfo?.transactions.filter(
      (transaction) => transaction.id !== id
    );
    const docRef = doc(db, 'familyGroup', accountInfo?.code);
    await updateDoc(docRef, {
      transactions: filteredTransactions,
    });
    hideModal();
  };
  return (
    <View style={styles.container}>
      <Portal>
        <Modal
          visible={visible}
          onDismiss={hideModal}
          contentContainerStyle={{
            backgroundColor: 'white',
            alignSelf: 'center',
            padding: 29,
            borderRadius: 5,
          }}
        >
          <Text>Name: {transaction?.name}</Text>
          <Text>Description: {transaction?.description}</Text>
          <Text>{formatDateAndTime(transaction?.date)}</Text>
          <View style={{ padding: 10 }}>
            <Button
              mode="outlined"
              onPress={() => {
                removeItem(transaction.id);
              }}
            >
              Remove
            </Button>
          </View>
        </Modal>
      </Portal>
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
                onPress={() => showModal(transaction)}
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
