import { Image, StyleSheet, Text, View } from 'react-native';
import React from 'react';

import Onboarding from 'react-native-onboarding-swiper';
import { Button, IconButton } from 'react-native-paper';

const Next = ({ isLight, ...props }) => (
  <IconButton
    {...props}
    icon="chevron-right"
    iconColor="#FFFFFF"
    size={50}
    containerColor="#38B6FF"
  />
);

const OnboardingScreen = () => {
  return (
    <View style={{ flex: 1 }}>
      <Onboarding
        NextButtonComponent={Next}
        bottomBarHeight={100}
        bottomBarColor="#FFFFFF"
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
          },
        ]}
      />
    </View>
  );
};

export default OnboardingScreen;

const styles = StyleSheet.create({});
