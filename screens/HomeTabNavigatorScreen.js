import React, { useContext, useState } from 'react';
import { BottomNavigation, Text, useTheme } from 'react-native-paper';
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
  const providerRenderScene = BottomNavigation.SceneMap({
    home: HomeTabStack,
    budget: BudgetScreen,
    account: AccountScreen,
  });
  const memberRenderScene = BottomNavigation.SceneMap({
    home: HomeTabStack,
    account: AccountScreen,
  });
  return (
    Object.keys(userAccount?.type || {}).length > 0 && (
      <BottomNavigation
        navigationState={{
          index,
          routes:
            userAccount?.type === 'provider' ? providerRoutes : memberRoutes,
        }}
        onIndexChange={setIndex}
        renderScene={
          userAccount?.type === 'provider'
            ? providerRenderScene
            : memberRenderScene
        }
        keyboardHidesNavigationBar={true}
        barStyle={{ backgroundColor: '#FFFFFF' }}
        renderLabel={(props) => (
          <Text
            variant="bodySmall"
            style={{
              fontWeight: '600',
              textAlign: 'center',
              color: props.focused ? '#1C1B1E' : '#7F8192',
            }}
          >
            {props.route.title}
          </Text>
        )}
        activeColor={theme.colors.primary}
        inactiveColor="#79757F"
        compact={true}
      />
    )
  );
};

export default HomeTabNavigatorScreen;
