import { StyleSheet, View } from 'react-native';
import React, { useContext, useEffect, useState } from 'react';
import {
  Appbar,
  Avatar,
  Button,
  Card,
  FAB,
  IconButton,
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
  const [state, setState] = useState({ open: false });
  const onStateChange = ({ open }) => setState({ open });
  const { open } = state;
  const { accountInfo, accountsInfo } = useContext(AccountContext);

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
      {Object.entries(accountsInfo)
        .filter(([, value]) =>
          accountInfo?.type === 'provider'
            ? value.type === 'member'
            : value.type === 'provider'
        )
        .filter(([key]) => key !== 'transactions')
        .map(([id, value]) => (
          <Card.Title
            key={id}
            title={value.name}
            subtitle={value.type}
            left={(props) => (
              <Avatar.Text
                {...props}
                size={30}
                label={value.name.slice(0, 1)}
              />
            )}
            right={(props) => (
              <IconButton
                {...props}
                icon="dots-vertical"
                onPress={() => {
                  console.log(
                    accountsInfo.transactions.filter(
                      (transaction) => transaction.uid === id
                    )
                  );
                }}
              />
            )}
          />
        ))}
      {console.log(accountsInfo)}
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
