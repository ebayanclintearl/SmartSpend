import { StyleSheet, Text, View } from 'react-native';
import React, { useContext, useEffect, useState } from 'react';
import { Avatar, Button, Card, FAB, IconButton } from 'react-native-paper';
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
  console.log(accountsInfo);

  return (
    <View style={styles.container}>
      {accountsInfo?.accounts?.map((data, index) => (
        <Card.Title
          key={index}
          title={data.name}
          subtitle={data.type}
          left={(props) => (
            <Avatar.Text {...props} size={30} label={data.name.slice(0, 1)} />
          )}
          right={(props) => (
            <IconButton {...props} icon="dots-vertical" onPress={() => {}} />
          )}
        />
      ))}
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
    justifyContent: 'center',
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 10,
  },
});
