import React, { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { Appbar, FAB, Text } from 'react-native-paper';
import DailyScreen from './TopTabScreens/DailyScreen';
import MonthlyScreen from './TopTabScreens/MonthlyScreen';
import WeeklyScreen from './TopTabScreens/WeeklyScreen';
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';

const Tab = createMaterialTopTabNavigator();

const TransactionOverviewScreen = ({ navigation }) => {
  const [state, setState] = useState({ open: false });
  const onStateChange = ({ open }) => setState({ open });
  const { open } = state;
  return (
    <>
      <Appbar.Header>
        <Appbar.Content title="Title" />
        <Appbar.Action icon="calendar" onPress={() => {}} />
        <Appbar.Action icon="magnify" onPress={() => {}} />
      </Appbar.Header>
      <Tab.Navigator
        screenOptions={{
          tabBarPressColor: 'transparent',
          tabBarStyle: { elevation: 0 },
        }}
      >
        <Tab.Screen name="Daily" component={DailyScreen} />
        <Tab.Screen name="Weekly" component={WeeklyScreen} />
        <Tab.Screen name="Monthly" component={MonthlyScreen} />
      </Tab.Navigator>
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
    </>
  );
};

export default TransactionOverviewScreen;

const styles = StyleSheet.create({});
