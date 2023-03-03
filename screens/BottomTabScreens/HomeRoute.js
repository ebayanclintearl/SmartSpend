import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { createStackNavigator } from '@react-navigation/stack';
import HomeTabScreen from '../HomeTabScreen';
import TransactionScreen from '../TransactionScreen';
import TransactionDetailScreen from '../TransactionDetailScreen';
import SearchScreen from '../SearchScreen';
const Stack = createStackNavigator();

export const HomeRoute = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="HomeTabScreen" component={HomeTabScreen} />
      <Stack.Screen name="TransactionScreen" component={TransactionScreen} />
      <Stack.Screen
        name="TransactionDetailScreen"
        component={TransactionDetailScreen}
      />
      <Stack.Screen name="SearchScreen" component={SearchScreen} />
    </Stack.Navigator>
  );
};

const styles = StyleSheet.create({});
