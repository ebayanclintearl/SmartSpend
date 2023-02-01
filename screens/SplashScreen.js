import React, { useContext } from 'react';
import { StyleSheet, View } from 'react-native';
import { Text, Button } from 'react-native-paper';
import { AuthContext, LoginContext } from '../Helper/Context';

const SplashScreen = ({ navigation }) => {
  const { currentUser } = useContext(AuthContext);
  const { loggedIn, setLoggedIn } = useContext(LoginContext);
  const handleNavigation = () => {
    if (currentUser) {
      setLoggedIn(true);
    } else {
      navigation.navigate('SignInScreen');
    }
  };
  return (
    <View style={styles.container}>
      <Text variant="displayMedium">Let's Get Started</Text>
      <Text variant="headlineSmall">Track Expense</Text>
      <Button mode="contained" onPress={() => handleNavigation()}>
        Join Now
      </Button>
    </View>
  );
};

export default SplashScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
