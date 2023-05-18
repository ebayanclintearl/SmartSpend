// Imports
import React, { useContext } from 'react';
import { Image, SafeAreaView, StyleSheet, View } from 'react-native';
import { Text, Button } from 'react-native-paper';
import { AppContext } from '../Helper/Context';
import { StatusBar } from 'react-native';
import { useNavigation } from '@react-navigation/native';

// The QuickStartScreen component represents the screen that is displayed as a quick start guide for the application.
const QuickStartScreen = () => {
  const navigation = useNavigation();
  const { onboardingComplete } = useContext(AppContext);
  // It checks if the onboarding process is already completed and navigates
  // to the SignInScreen if it is, or navigates to the OnboardingScreen if it is not.
  const handleNavigation = () => {
    if (onboardingComplete) {
      navigation.navigate('SignInScreen');
    } else {
      navigation.navigate('OnboardingScreen');
    }
  };
  return (
    // Provides a safe area for content rendering, ensuring it is visible and not obstructed by device-specific elements like notches or status bars.
    <SafeAreaView style={styles.container}>
      {/* The component renders a StatusBar component to set the status bar appearance. */}
      <StatusBar
        backgroundColor="#38B6FF"
        barStyle="light-content"
        translucent
      />
      {/* Display title with detail text and img background */}
      <View style={{ paddingHorizontal: '8%' }}>
        <Image
          resizeMode="contain"
          style={{ width: '80%', height: '40%', alignSelf: 'center' }}
          source={require('../assets/AppAssets/quickstart_logo_bg.png')}
        />
        <Text
          variant="displayMedium"
          style={{ color: '#151940', alignSelf: 'center', padding: 10 }}
        >
          SmartSpend
        </Text>
        <View style={{ paddingBottom: 30 }}>
          <Text
            variant="bodyMedium"
            style={{ fontSize: 14, color: '#151940', alignSelf: 'center' }}
          >
            A Expense Tracking App
          </Text>
          <Text
            variant="bodyMedium"
            style={{ fontSize: 14, color: '#151940', alignSelf: 'center' }}
          >
            Made For Families
          </Text>
        </View>
        {/* Get started now button */}
        <Button
          mode="elevated"
          style={{ backgroundColor: '#38B6FF', borderRadius: 5 }}
          labelStyle={{ color: '#FFFFFF', fontSize: 16 }}
          onPress={() => handleNavigation()}
        >
          Get Started Now
        </Button>
      </View>
    </SafeAreaView>
  );
};

export default QuickStartScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
  },
});
