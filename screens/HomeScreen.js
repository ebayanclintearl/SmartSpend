import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Text, Button } from 'react-native-paper';

const HomeScreen = ({ navigation }) => {
  return (
    <View style={styles.container}>
      <View style={styles.headlineContainer}>
        <Text variant="displayLarge">Let's Get Started</Text>
        <Text variant="headlineSmall">Track Expense</Text>
        <Button
          mode="contained"
          onPress={() => navigation.navigate('SignInScreen')}
          style={styles.button}
        >
          Join Now
        </Button>
      </View>
    </View>
  );
};

export default HomeScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  headlineContainer: {
    width: '90%',
    marginBottom: '10%',
  },
  button: {
    marginTop: 10,
    paddingVertical: 10,
    borderRadius: 100,
  },
});
