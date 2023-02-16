import { StyleSheet, Text, View } from 'react-native';
import React from 'react';

import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import DailyScreen from './TopTabScreens/DailyScreen';
import WeeklyScreen from './TopTabScreens/WeeklyScreen';
import MonthlyScreen from './TopTabScreens/MonthlyScreen';
import { Appbar, FAB } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';

const Tab = createMaterialTopTabNavigator();

const PeriodicalScreen = () => {
  const navigation = useNavigation();
  return (
    <>
      <Appbar.Header>
        <Appbar.Content title="Title" />
        <Appbar.Action
          icon="magnify"
          onPress={() => {
            navigation.navigate('SearchScreen');
          }}
        />
      </Appbar.Header>
      <View style={styles.container}>
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
      </View>
      <FAB
        icon="plus"
        style={styles.fab}
        onPress={() => navigation.navigate('TransactionScreen')}
      />
    </>
  );
};

export default PeriodicalScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
  },
});
