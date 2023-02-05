import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { createStackNavigator } from '@react-navigation/stack';
import TransactionScreen from '../TransactionScreen';
import TransactionHomeScreen from '../TransactionHomeScreen';
const Stack = createStackNavigator();

export const TransactionRoute = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen
        name="TransactionHomeScreen"
        component={TransactionHomeScreen}
      />
      <Stack.Screen name="TransactionScreen" component={TransactionScreen} />
    </Stack.Navigator>
  );
};

const styles = StyleSheet.create({});
