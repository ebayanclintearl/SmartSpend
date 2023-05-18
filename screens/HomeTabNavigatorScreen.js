// Imports
import React, { useContext, useState } from 'react';
import { BottomNavigation, Text, useTheme } from 'react-native-paper';
import BudgetScreen from './BudgetScreen';
import { AppContext } from '../Helper/Context';
import AccountScreen from './AccountScreen';
import HomeTabStack from '../routes/HomeTabStack';

// HomeTabNavigatorScreen component is responsible for rendering the bottom navigation bar based on the user's account type (provider or member).
const HomeTabNavigatorScreen = () => {
  const { userAccount } = useContext(AppContext);
  const theme = useTheme();
  const [index, setIndex] = useState(0);
  // The routes array holds the route configurations.
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
  // The RenderScene objects use the BottomNavigation.SceneMap function to map the routes to their respective screens.
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
    // Display BottomNavigation component only if the userAccount has accountType data.
    Object.keys(userAccount?.accountType || {}).length > 0 && (
      <BottomNavigation
        navigationState={{
          index,
          routes:
            userAccount?.accountType === 'provider'
              ? providerRoutes
              : memberRoutes,
        }}
        onIndexChange={setIndex}
        renderScene={
          userAccount?.accountType === 'provider'
            ? providerRenderScene
            : memberRenderScene
        }
        keyboardHidesNavigationBar={true}
        barStyle={{ backgroundColor: '#FFFFFF' }}
        renderLabel={(props) => (
          <Text
            variant="labelMedium"
            style={{
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
