import React, { useContext } from 'react';
import { Image, SafeAreaView, StyleSheet, View } from 'react-native';
import { Text, Button, Card } from 'react-native-paper';
import { AppContext } from '../Helper/Context';
import { StatusBar } from 'react-native';
import { useNavigation } from '@react-navigation/native';

const QuickStartScreen = () => {
  const navigation = useNavigation();
  const { onboardingComplete } = useContext(AppContext);
  const handleNavigation = () => {
    if (onboardingComplete) {
      navigation.navigate('SignInScreen');
    } else {
      navigation.navigate('OnboardingScreen');
    }
  };
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar
        backgroundColor="#38B6FF"
        barStyle="light-content"
        translucent
      />
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
