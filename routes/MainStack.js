// Imports
import { createStackNavigator } from '@react-navigation/stack';
import QuickStartScreen from '../screens/QuickStartScreen';
import SignInScreen from '../screens/SignInScreen';
import SignUpScreen from '../screens/SignUpScreen';
import HomeTabNavigatorScreen from '../screens/HomeTabNavigatorScreen';
import { AppContext } from '../Helper/Context';
import { useContext } from 'react';
import AddScreen from '../screens/AddScreen';
import RegistrationPromptScreen from '../screens/RegistrationPromptScreen';
import CodeVerificationScreen from '../screens/CodeVerificationScreen';
import OnboardingScreen from '../screens/OnboardingScreen';
import SignUpSuccessScreen from '../screens/SignUpSuccessScreen';

const Stack = createStackNavigator();

// The MainStack component is responsible for defining the main stack of screens in the application.
function MainStack() {
  const { loggedIn, onboardingComplete, displaySignUpSuccess } =
    useContext(AppContext);
  return (
    <Stack.Navigator>
      {loggedIn ? (
        <Stack.Group>
          {displaySignUpSuccess && (
            <Stack.Screen
              name="SignUpSuccessScreen"
              component={SignUpSuccessScreen}
              options={{ headerShown: false }}
            />
          )}
          <Stack.Screen
            name="HomeTabNavigatorScreen"
            component={HomeTabNavigatorScreen}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="AddScreen"
            component={AddScreen}
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
export default MainStack;
