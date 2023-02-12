import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { createStackNavigator } from '@react-navigation/stack';
import PeriodicalScreen from '../PeriodicalScreen';
import TransactionScreen from '../TransactionScreen';
import TransactionDetailScreen from '../TransactionDetailScreen';
const Stack = createStackNavigator();

export const TransactionRoute = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="PeriodicalScreen" component={PeriodicalScreen} />
      <Stack.Screen name="TransactionScreen" component={TransactionScreen} />
      <Stack.Screen
        name="TransactionDetailScreen"
        component={TransactionDetailScreen}
      />
    </Stack.Navigator>
  );
};

const styles = StyleSheet.create({});
