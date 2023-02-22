import { StyleSheet, View } from 'react-native';
import React, { useState } from 'react';
import { BottomNavigation, Text, useTheme } from 'react-native-paper';
import { AccountRoute } from './BottomTabScreens/AccountRoute';
import { TransactionRoute } from './BottomTabScreens/TransactionRoute';
import BudgetRoute from './BottomTabScreens/BudgetRoute';

const HomeScreen = () => {
  const [index, setIndex] = useState(0);
  const [routes] = useState([
    {
      key: 'transaction',
      title: 'Transaction',
      focusedIcon: 'note-plus',
      unfocusedIcon: 'note-plus-outline',
    },
    {
      key: 'budget',
      title: 'Budget',
      focusedIcon: 'notebook',
      unfocusedIcon: 'notebook-outline',
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
    budget: BudgetRoute,
  });
  const theme = useTheme();
  return (
    <BottomNavigation
      navigationState={{ index, routes }}
      onIndexChange={setIndex}
      renderScene={renderScene}
      shifting={true}
      barStyle={{ backgroundColor: theme.colors.onPrimary }}
      keyboardHidesNavigationBar={true}
    />
  );
};

export default HomeScreen;

const styles = StyleSheet.create({});
