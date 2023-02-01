import { StyleSheet, View } from 'react-native';
import React, { useContext, useState } from 'react';
import { Button, Text, TextInput, Appbar } from 'react-native-paper';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../config';
import { LoginContext } from '../Helper/Context';
const SignInScreen = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showLoading, setShowLoading] = useState(false);
  const { loggedIn, setLoggedIn } = useContext(LoginContext);

  const handleSignIn = async () => {
    try {
      setShowLoading(true);
      const res = await signInWithEmailAndPassword(auth, email, password);
      setLoggedIn(true);
    } catch (error) {
      const errorCode = error.code;
      const errorMessage = error.message;
      console.log(errorCode);
      console.log(errorMessage);
      setShowLoading(false);
    }
  };
  return (
    <>
      <Appbar.Header>
        <Appbar.BackAction
          onPress={() => {
            navigation.navigate('SplashScreen');
          }}
        />
      </Appbar.Header>
      <View style={styles.container}>
        <Text variant="displayLarge">Welcome Back!</Text>
        <Text variant="displaySmall">Enter Your Email & Password</Text>
        <TextInput
          label="Email"
          value={email}
          onChangeText={(email) => setEmail(email)}
        />
        <TextInput
          label="Password"
          value={password}
          onChangeText={(password) => setPassword(password)}
        />
        <Button
          mode="contained"
          onPress={() => {
            handleSignIn();
          }}
          loading={showLoading}
        >
          Sign In
        </Button>
        <Text variant="headlineSmall">Don't have an account?</Text>
        <Button mode="text" onPress={() => navigation.navigate('SignUpScreen')}>
          Sign Up
        </Button>
      </View>
    </>
  );
};

export default SignInScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    zIndex: -1,
  },
});
