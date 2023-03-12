import { createStackNavigator } from '@react-navigation/stack';
import QuickStartScreen from '../screens/QuickStartScreen';
import SignInScreen from '../screens/SignInScreen';
import SignUpScreen from '../screens/SignUpScreen';
import HomeScreen from '../screens/HomeScreen';
import { LoginContext } from '../Helper/Context';
import { useContext } from 'react';
import TransactionScreen from '../screens/TransactionScreen';
import RegistrationPromptScreen from '../screens/RegistrationPromptScreen';
import CodeVerificationScreen from '../screens/CodeVerificationScreen';
import OnboardingScreen from '../screens/OnboardingScreen';

const Stack = createStackNavigator();

function HomeStack() {
  const { loggedIn } = useContext(LoginContext);

  return (
    <Stack.Navigator>
      {loggedIn ? (
        <Stack.Group>
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
            name="OnboardingScreen"
            component={OnboardingScreen}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="QuickStartScreen"
            component={QuickStartScreen}
            options={{ headerShown: false }}
          />
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
