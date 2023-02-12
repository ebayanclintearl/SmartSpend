import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { createStackNavigator } from '@react-navigation/stack';
import TransactionScreen from '../TransactionScreen';
import TransactionOverviewScreen from '../TransactionOverviewScreen';
const Stack = createStackNavigator();

export const TransactionRoute = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen
        name="TransactionHomeScreen"
        component={TransactionOverviewScreen}
      />
      <Stack.Screen name="TransactionScreen" component={TransactionScreen} />
    </Stack.Navigator>
  );
};

const styles = StyleSheet.create({});
