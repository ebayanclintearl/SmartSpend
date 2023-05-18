// Imports
import { Image, SafeAreaView, StatusBar, StyleSheet, View } from 'react-native';
import React from 'react';
import { Appbar, Button, Text } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import OrDivider from '../components/OrDivider';

// The RegistrationPromptScreen component represents the screen that prompts the user to choose their account type during the registration process.
const RegistrationPromptScreen = () => {
  const navigation = useNavigation();
  // The handlePress function is called when the user selects their account type.
  // If the user is a Family Provider, it navigates to the SignUpScreen; otherwise,
  // it navigates to the CodeVerificationScreen.
  const handlePress = (isFamilyProvider) => {
    if (isFamilyProvider) {
      navigation.navigate('SignUpScreen');
    } else {
      navigation.navigate('CodeVerificationScreen');
    }
  };
  return (
    // Provides a safe area for content rendering, ensuring it is visible and not obstructed by device-specific elements like notches or status bars.
    <SafeAreaView style={styles.container}>
      {/* The component renders a StatusBar component to set the status bar appearance. */}
      <StatusBar
        backgroundColor="#FF4C38"
        barStyle="light-content"
        translucent
      />
      {/* Component to display the header */}
      <Appbar.Header style={{ backgroundColor: '#FF4C38' }}>
        <Appbar.BackAction
          style={{ backgroundColor: '#FFFFFF', borderRadius: 12 }}
          onPress={() => {
            navigation.pop();
          }}
        />
      </Appbar.Header>
      <View
        style={{
          paddingHorizontal: '8%',
          flex: 1,
        }}
      >
        {/* Display register prompt text and img background */}
        <View
          style={{
            width: '100%',
            height: 200,
            justifyContent: 'center',
            marginBottom: 5,
          }}
        >
          <Image
            resizeMode="contain"
            style={{
              width: '100%',
              height: '100%',
              position: 'absolute',
              left: -20,
            }}
            source={require('../assets/AppAssets/register_prompt_bg.png')}
          />
          <Text variant="displayMedium" style={{ color: '#FFFFFF' }}>
            Register
          </Text>
          <Text variant="bodyLarge" style={{ color: '#FFFFFF' }}>
            Please Choose Account Type
          </Text>
        </View>
        {/* Display prompt text */}
        <View
          style={{
            flex: 1,

            justifyContent: 'center',
          }}
        >
          <Text
            variant="displayMedium"
            style={{
              color: 'white',
              marginVertical: 5,
              fontSize: 28,
              lineHeight: 30,
              textAlign: 'center',
            }}
          >
            Are you a Family Provider or Member?
          </Text>
        </View>
        {/* Display buttons for selecting account type */}
        <View
          style={{
            flex: 1,
            justifyContent: 'center',
            paddingVertical: 60,
          }}
        >
          {/* Family Provider button */}
          <Button
            mode="elevated"
            style={{
              backgroundColor: '#FFFFFF',
              borderRadius: 5,
              marginVertical: 10,
            }}
            labelStyle={{
              color: '#151940',
              fontSize: 16,
            }}
            contentStyle={{ padding: 3 }}
            onPress={() => handlePress(true)}
          >
            I am a Family Provider
          </Button>
          <OrDivider />
          {/* Family Member button */}
          <Button
            mode="elevated"
            style={{
              backgroundColor: '#FFFFFF',
              borderRadius: 5,
              marginVertical: 10,
            }}
            labelStyle={{
              color: '#151940',
              fontSize: 16,
            }}
            contentStyle={{ padding: 3 }}
            onPress={() => handlePress(false)}
          >
            I am a Family Member
          </Button>
        </View>
      </View>
    </SafeAreaView>
  );
};

export default RegistrationPromptScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FF4C38',
  },
});
