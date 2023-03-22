import { createStackNavigator } from '@react-navigation/stack';
import QuickStartScreen from '../screens/QuickStartScreen';
import SignInScreen from '../screens/SignInScreen';
import SignUpScreen from '../screens/SignUpScreen';
import HomeScreen from '../screens/HomeScreen';
import { AppContext } from '../Helper/Context';
import { useContext, useEffect, useState } from 'react';
import TransactionScreen from '../screens/TransactionScreen';
import RegistrationPromptScreen from '../screens/RegistrationPromptScreen';
import CodeVerificationScreen from '../screens/CodeVerificationScreen';
import OnboardingScreen from '../screens/OnboardingScreen';
import SignUpSuccessScreen from '../screens/SignUpSuccessScreen';

const Stack = createStackNavigator();

function HomeStack() {
  const { loggedIn, onboardingComplete } = useContext(AppContext);

  return (
    <Stack.Navigator>
      {loggedIn ? (
        <Stack.Group>
          <Stack.Screen
            name="SignUpSuccessScreen"
            component={SignUpSuccessScreen}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="HomeScreen"
            component={HomeScreen}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="TransactionScreen"
            component={TransactionScreen}
            options={{ headerShown: false }}
          />
        </Stack.Group>
      ) : (
        <Stack.Group>
          <Stack.Screen
            name="QuickStartScreen"
            component={QuickStartScreen}
            options={{ headerShown: false }}
          />
          {!onboardingComplete && (
            <Stack.Screen
              name="OnboardingScreen"
              component={OnboardingScreen}
              options={{ headerShown: false }}
            />
          )}
          <Stack.Screen
            name="SignInScreen"
            component={SignInScreen}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="RegistrationPromptScreen"
            component={RegistrationPromptScreen}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="CodeVerificationScreen"
            component={CodeVerificationScreen}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="SignUpScreen"
            component={SignUpScreen}
            options={{ headerShown: false }}
          />
        </Stack.Group>
      )}
    </Stack.Navigator>
  );
}
export default HomeStack;
