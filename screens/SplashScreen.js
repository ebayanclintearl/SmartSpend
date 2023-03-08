import React, { useContext } from 'react';
import { Image, StyleSheet, View } from 'react-native';
import { Text, Button, Card } from 'react-native-paper';
import { AuthContext, LoginContext } from '../Helper/Context';

const SplashScreen = ({ navigation }) => {
  const { currentUser } = useContext(AuthContext);
  const { setLoggedIn } = useContext(LoginContext);
  const handleNavigation = () => {
    if (currentUser) {
      setLoggedIn(true);
    } else {
      navigation.navigate('SignInScreen');
    }
  };
  return (
    <View style={styles.container}>
      <View style={{ paddingHorizontal: '8%' }}>
        <Image
          resizeMode="contain"
          style={{ width: '80%', height: '40%', alignSelf: 'center' }}
          source={require('../assets/AppAssets/splash_screen_icon.png')}
        />
        <Text
          variant="displayMedium"
          style={{ color: '#FFFFFF', alignSelf: 'center', padding: 10 }}
        >
          SmartSpend
        </Text>
        <View style={{ paddingBottom: 30 }}>
          <Text
            variant="bodyMedium"
            style={{ fontSize: 14, color: '#FFFFFF', alignSelf: 'center' }}
          >
            A Expense Tracking App
          </Text>
          <Text
            variant="bodyMedium"
            style={{ fontSize: 14, color: '#FFFFFF', alignSelf: 'center' }}
          >
            Made For Families
          </Text>
        </View>
        <Button
          mode="elevated"
          style={{ backgroundColor: '#FFFFFF', borderRadius: 5 }}
          labelStyle={{ color: '#151940', fontSize: 16 }}
          onPress={() => handleNavigation()}
        >
          Get Started Now
        </Button>
      </View>
    </View>
  );
};

export default SplashScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#38B6FF',
    justifyContent: 'center',
  },
});
