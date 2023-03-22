import { Image, StyleSheet, View } from 'react-native';
import React, { useContext } from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Text, Button } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { AppContext } from '../Helper/Context';

const SignUpSuccessScreen = () => {
  const navigation = useNavigation();
  const { currentUser } = useContext(AppContext);
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
          source={require('../assets/AppAssets/register_success_icon.png')}
        />
        <Text
          variant="displayMedium"
          style={{
            color: '#FFFFFF',
            alignSelf: 'center',
            padding: 10,
            fontSize: 35,
          }}
        >
          Welcome {currentUser?.displayName.split(' ')[0]}!
        </Text>
        <View style={{ paddingBottom: 30 }}>
          <Text
            variant="bodyMedium"
            style={{ fontSize: 14, color: '#FFFFFF', alignSelf: 'center' }}
          >
            It seems everything went well
          </Text>
          <Text
            variant="bodyMedium"
            style={{ fontSize: 14, color: '#FFFFFF', alignSelf: 'center' }}
          >
            SmartSpend is ready to work with you
          </Text>
        </View>
        <Button
          mode="elevated"
          style={{
            backgroundColor: '#FFFFFF',
            borderRadius: 5,
            marginHorizontal: 25,
          }}
          labelStyle={{ color: '#151940', fontSize: 16 }}
          contentStyle={{ paddingVertical: 5 }}
          onPress={() => navigation.navigate('HomeScreen')}
        >
          Get Started
        </Button>
      </View>
    </SafeAreaView>
  );
};

export default SignUpSuccessScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#38B6FF',
    justifyContent: 'center',
  },
});
