import { Image, SafeAreaView, StatusBar, StyleSheet } from 'react-native';
import React from 'react';

import Onboarding from 'react-native-onboarding-swiper';
import { Button, IconButton } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';

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

const OnboardingScreen = () => {
  const navigation = useNavigation();
  async function completeOnboarding() {
    try {
      navigation.navigate('SignInScreen');
      await AsyncStorage.setItem('onboardingComplete', 'true');
    } catch (error) {
      console.log(error);
    }
  }

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <StatusBar
        backgroundColor="#38B6FF"
        barStyle="light-content"
        translucent
      />
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
