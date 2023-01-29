import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Text, Button } from 'react-native-paper';

const SplashScreen = ({ navigation }) => {
  return (
    <View style={styles.container}>
      <Text variant="displayMedium">Let's Get Started</Text>
      <Text variant="headlineSmall">Track Expense</Text>
      <Button
        mode="contained"
        onPress={() => navigation.navigate('SignInScreen')}
      >
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
