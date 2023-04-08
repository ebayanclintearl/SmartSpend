import { createStackNavigator } from '@react-navigation/stack';
import ExpenseHistoryScreen from '../screens/ExpenseHistoryScreen';
import AddScreen from '../screens/AddScreen';
import DetailScreen from '../screens/DetailScreen';
import SearchScreen from '../screens/SearchScreen';

const Stack = createStackNavigator();

const HomeTabStack = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen
        name="ExpenseHistoryScreen"
        component={ExpenseHistoryScreen}
      />
      <Stack.Screen name="AddScreen" component={AddScreen} />
      <Stack.Screen name="DetailScreen" component={DetailScreen} />
      <Stack.Screen name="SearchScreen" component={SearchScreen} />
    </Stack.Navigator>
  );
};

export default HomeTabStack;
