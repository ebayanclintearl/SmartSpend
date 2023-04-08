import React, { useContext, useState } from 'react';
import { BottomNavigation, useTheme } from 'react-native-paper';
import BudgetScreen from './BudgetScreen';
import { AppContext } from '../Helper/Context';
import AccountScreen from './AccountScreen';
import HomeTabStack from '../routes/HomeTabStack';

const HomeTabNavigatorScreen = () => {
  const { userAccount } = useContext(AppContext);
  const theme = useTheme();
  const [index, setIndex] = useState(0);
  const [providerRoutes] = useState([
    {
      key: 'home',
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
  const [memberRoutes] = useState([
    {
      key: 'home',
      title: 'Home',
      focusedIcon: 'store-outline',
    },
    {
      key: 'account',
      title: 'Account',
      focusedIcon: 'account-circle-outline',
    },
  ]);
  const renderScene = BottomNavigation.SceneMap({
    home: HomeTabStack,
    account: AccountScreen,
    budget: BudgetScreen,
  });
  return (
    <BottomNavigation
      navigationState={{
        index,
        routes:
          Object.keys(userAccount?.type || {}).length === 0
            ? memberRoutes
            : userAccount?.type === 'provider'
            ? providerRoutes
            : memberRoutes,
      }}
      onIndexChange={setIndex}
      renderScene={renderScene}
      keyboardHidesNavigationBar={true}
      activeColor={theme.colors.primary}
      barStyle={{ backgroundColor: '#FFFFFF' }}
      inactiveColor="#79757F"
      compact={true}
    />
  );
};

export default HomeTabNavigatorScreen;
