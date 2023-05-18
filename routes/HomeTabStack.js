// Imports
import { createStackNavigator } from '@react-navigation/stack';
import ExpenseHistoryScreen from '../screens/ExpenseHistoryScreen';
import AddScreen from '../screens/AddScreen';
import DetailScreen from '../screens/DetailScreen';
import SearchScreen from '../screens/SearchScreen';

const Stack = createStackNavigator();

// The HomeTabStack component is responsible for defining the stack of screens within the home tab.
const HomeTabStack = (props) => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="ExpenseHistoryScreen">
        {() => <ExpenseHistoryScreen jumpTo={props.jumpTo} />}
      </Stack.Screen>
      <Stack.Screen name="AddScreen" component={AddScreen} />
      <Stack.Screen name="DetailScreen" component={DetailScreen} />
      <Stack.Screen name="SearchScreen" component={SearchScreen} />
    </Stack.Navigator>
  );
};

export default HomeTabStack;
