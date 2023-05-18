// Imports
import { Image, SafeAreaView, StatusBar } from 'react-native';
import React, { useContext } from 'react';
import Onboarding from 'react-native-onboarding-swiper';
import { IconButton } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AppContext } from '../Helper/Context';

// Display the custom next and done button
const Next = ({ isLight, ...props }) => (
  <IconButton
    {...props}
    icon="chevron-right"
    iconColor="#FFFFFF"
    size={50}
    containerColor="#38B6FF"
  />
);
const Done = ({ isLight, ...props }) => (
  <IconButton
    {...props}
    icon="chevron-right"
    iconColor="#38B6FF"
    size={50}
    containerColor="#FFFFFF"
  />
);

// The OnboardingScreen component represents the screen that displays the onboarding process for the application.
const OnboardingScreen = () => {
  const navigation = useNavigation();
  const { setOnboardingComplete } = useContext(AppContext);
  // The completeOnboarding function is an asynchronous function that is called when the onboarding process is completed.
  async function completeOnboarding() {
    try {
      await AsyncStorage.setItem('onboardingComplete', 'true');
      setOnboardingComplete(true);
      navigation.navigate('SignInScreen');
    } catch (error) {
      console.log(error);
    }
  }
  return (
    // * Provides a safe area for content rendering, ensuring it is visible and not obstructed by device-specific elements like notches or status bars.
    <SafeAreaView style={{ flex: 1 }}>
      {/* The component renders a StatusBar component to set the status bar appearance. */}
      <StatusBar
        backgroundColor="#38B6FF"
        barStyle="light-content"
        translucent
      />
      {/* This component display the onboarding contents. */}
      <Onboarding
        onDone={() => {
          completeOnboarding();
        }}
        NextButtonComponent={Next}
        DoneButtonComponent={Done}
        bottomBarHeight={100}
        bottomBarHighlight={false}
        controlStatusBar={false}
        allowFontScalingText={false}
        allowFontScalingButtons={false}
        skipToPage={3}
        pages={[
          {
            backgroundColor: '#fff',
            image: (
              <Image
                resizeMode="contain"
                style={{
                  width: '100%',
                  height: 200,
                }}
                source={require('../assets/AppAssets/onboarding1.png')}
              />
            ),
            title: 'Take hold of your finances',
            subtitle: 'Running your finances is easier with SmartSpend',
            titleStyles: {
              fontFamily: 'Poppins-SemiBold',
              fontSize: 35,
              fontWeight: 'bold',
            },
            subTitleStyles: {
              fontFamily: 'Poppins-Regular',
              fontSize: 16,
            },
          },
          {
            backgroundColor: '#fff',
            image: (
              <Image
                resizeMode="contain"
                style={{
                  width: '100%',
                  height: 200,
                }}
                source={require('../assets/AppAssets/onboarding2.png')}
              />
            ),
            title: 'See where your money is going',
            subtitle:
              'Stay on top by effortlessly tracking your family expenses',
            titleStyles: {
              fontFamily: 'Poppins-SemiBold',
              fontSize: 35,
              fontWeight: 'bold',
            },
            subTitleStyles: {
              fontFamily: 'Poppins-Regular',
              fontSize: 16,
            },
          },
          {
            backgroundColor: '#fff',
            image: (
              <Image
                resizeMode="contain"
                style={{
                  width: '100%',
                  height: 200,
                }}
                source={require('../assets/AppAssets/onboarding3.png')}
              />
            ),
            title: 'Reach your goals with ease',
            subtitle:
              'Use the smart budget feature to manage your future expenses',
            titleStyles: {
              fontFamily: 'Poppins-SemiBold',
              fontSize: 35,
              fontWeight: 'bold',
            },
            subTitleStyles: {
              fontFamily: 'Poppins-Regular',
              fontSize: 16,
            },
          },
          {
            backgroundColor: '#38B6FF',
            image: (
              <Image
                resizeMode="contain"
                style={{
                  width: '100%',
                  height: 200,
                }}
                source={require('../assets/AppAssets/onboarding4.png')}
              />
            ),
            title: 'Welcome',
            subtitle:
              'Stay on top by effortlessly tracking your family expenses',
            titleStyles: {
              fontFamily: 'Poppins-SemiBold',
              fontSize: 35,
              fontWeight: 'bold',
            },
            subTitleStyles: {
              fontFamily: 'Poppins-Regular',
              fontSize: 16,
            },
          },
        ]}
      />
    </SafeAreaView>
  );
};

export default OnboardingScreen;
