import { StyleSheet, View } from 'react-native';
import React, { useState } from 'react';
import { BottomNavigation, Text, useTheme } from 'react-native-paper';
import { AccountRoute } from './BottomTabScreens/AccountRoute';
import { TransactionRoute } from './BottomTabScreens/TransactionRoute';
import BudgetRoute from './BottomTabScreens/BudgetRoute';

const HomeScreen = () => {
  const theme = useTheme();
  const [index, setIndex] = useState(0);
  const [routes] = useState([
    {
      key: 'transaction',
      title: 'Home',
      focusedIcon: 'store-outline',
    },
    {
      key: 'budget',
      title: 'Budget',
      focusedIcon: 'widgets-outline',
    },
    {
      key: 'account',
      title: 'Account',
      focusedIcon: 'account-circle-outline',
    },
  ]);
  const renderScene = BottomNavigation.SceneMap({
    transaction: TransactionRoute,
    account: AccountRoute,
    budget: BudgetRoute,
  });
  return (
    <BottomNavigation
      navigationState={{ index, routes }}
      onIndexChange={setIndex}
      renderScene={renderScene}
      keyboardHidesNavigationBar={true}
      activeColor={theme.colors.primary}
      barStyle={{ backgroundColor: '#FFFBFE' }}
      inactiveColor="#79757F"
      compact={true}
    />
  );
};

export default HomeScreen;

const styles = StyleSheet.create({});
