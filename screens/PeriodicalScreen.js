import { StyleSheet, View } from 'react-native';
import React, { useContext } from 'react';

import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import DailyScreen from './TopTabScreens/DailyScreen';
import WeeklyScreen from './TopTabScreens/WeeklyScreen';
import MonthlyScreen from './TopTabScreens/MonthlyScreen';
import { Appbar, Avatar, Card, FAB, Text } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { AccountContext } from '../Helper/Context';
import { Image } from 'react-native';

const Tab = createMaterialTopTabNavigator();

const PeriodicalScreen = () => {
  const navigation = useNavigation();
  const { accountInfo, accountsInfo } = useContext(AccountContext);
  return (
    <>
      <Appbar.Header style={{ backgroundColor: '#FFFFFF' }}>
        <Appbar.Content
          title={
            <View style={{ flexDirection: 'row' }}>
              <Avatar.Text
                size={35}
                label={accountInfo?.name?.charAt(0)}
                style={{ backgroundColor: '#FFAF38', marginRight: 5 }}
                labelStyle={{ color: 'white', top: 2 }}
              />
              <View>
                <Text variant="labelMedium" style={{ color: '#7F8192' }}>
                  {' '}
                  Welcome!
                </Text>
                <Text variant="titleSmall">
                  {' '}
                  {accountInfo?.name?.split(' ')[0]}
                </Text>
              </View>
            </View>
          }
        />
        <Appbar.Action
          icon="magnify"
          onPress={() => {
            navigation.navigate('SearchScreen');
          }}
          color="#151940"
        />
      </Appbar.Header>
      <View style={styles.container}>
        <View
          style={{
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: 35,
          }}
        >
          <Text
            style={{
              position: 'absolute',
              top: 30,
              textAlign: 'center',
              color: '#FFFFFF',
            }}
          >
            Total Balance
          </Text>
          <Text
            style={{
              position: 'absolute',
              top: 80,
              textAlign: 'center',
              color: '#FFFFFF',
            }}
            variant="displaySmall"
          >
            Php 20,000
          </Text>
          <Card.Cover
            source={require('../assets/AppAssets/gradient_bg.png')}
            style={{ zIndex: -1, width: '100%' }}
          />
          <View style={{ justifyContent: 'space-evenly', width: '100%' }}>
            <Card
              style={{
                position: 'absolute',
                left: 10,
                bottom: -20,
                borderRadius: 5,
                backgroundColor: '#FFFFFF',
                width: '45%',
              }}
              elevation={2}
            >
              <Card.Content>
                <Text variant="titleMedium" style={{ color: '#38B6FF' }}>
                  Php 3000
                </Text>
                <Text variant="bodySmall" style={{ color: '#7F8192' }}>
                  Family Budget
                </Text>
              </Card.Content>
            </Card>
            <Card
              style={{
                position: 'absolute',
                right: 10,
                bottom: -20,
                borderRadius: 5,
                backgroundColor: '#FFFFFF',
                width: '45%',
              }}
              elevation={2}
            >
              <Card.Content>
                <Text variant="titleMedium" style={{ color: '#38B6FF' }}>
                  Php 30,000
                </Text>
                <Text variant="bodySmall" style={{ color: '#7F8192' }}>
                  Family Budget
                </Text>
              </Card.Content>
            </Card>
          </View>
        </View>
        <View style={styles.tabContainer}>
          <Tab.Navigator
            screenOptions={{
              tabBarPressColor: 'transparent',
              tabBarStyle: { elevation: 0 },
            }}
            initialRouteName="Monthly"
          >
            <Tab.Screen name="Daily" component={DailyScreen} />
            <Tab.Screen name="Weekly" component={WeeklyScreen} />
            <Tab.Screen name="Monthly" component={MonthlyScreen} />
          </Tab.Navigator>
        </View>
      </View>
      <FAB
        icon="plus"
        style={styles.fab}
        onPress={() => navigation.navigate('TransactionScreen')}
        color="#FFFFFF"
        customSize={64}
      />
    </>
  );
};

export default PeriodicalScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: '3%',
    backgroundColor: '#FFFFFF',
  },
  tabContainer: {
    flex: 1,
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
    borderRadius: 50,
  },
});
