import { StyleSheet, View } from 'react-native';
import React, { useState } from 'react';
import { BottomNavigation, Text } from 'react-native-paper';
import { AccountRoute } from './BottomTabsScreens/AccountRoute';
import { TransactionRoute } from './BottomTabsScreens/TransactionRoute';

const HomeScreen = ({ navigation }) => {
  const [index, setIndex] = useState(0);
  const [routes] = useState([
    {
      key: 'transaction',
      title: 'Transaction',
      focusedIcon: 'note-plus',
      unfocusedIcon: 'note-plus-outline',
    },
    {
      key: 'account',
      title: 'Account',
      focusedIcon: 'account',
      unfocusedIcon: 'account-outline',
    },
  ]);
  const renderScene = BottomNavigation.SceneMap({
    transaction: TransactionRoute,
    account: AccountRoute,
  });
  return (
    <BottomNavigation
      navigationState={{ index, routes }}
      onIndexChange={setIndex}
      renderScene={renderScene}
      shifting={true}
    />
  );
};

export default HomeScreen;

const styles = StyleSheet.create({});
