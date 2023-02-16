import { StyleSheet, View } from 'react-native';
import React, { useContext, useState } from 'react';
import {
  Button,
  Text,
  TextInput,
  Appbar,
  HelperText,
} from 'react-native-paper';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../config';
import { LoginContext } from '../Helper/Context';
import { validateSignInInputs } from '../Helper/Validation';
const SignInScreen = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showLoading, setShowLoading] = useState(false);
  const { loggedIn, setLoggedIn } = useContext(LoginContext);
  const [error, setError] = useState({
    errorMessage: '',
    errorEmail: false,
    errorPassword: false,
    errorAccount: false,
  });

  const handleSignIn = async () => {
    const validationResult = validateSignInInputs(email, password);
    setError(validationResult);
    if (validationResult.errorMessage) return;

    try {
      setShowLoading(true);
      await signInWithEmailAndPassword(auth, email, password);
      setShowLoading(false);
      setLoggedIn(true);
    } catch (error) {
      setError({
        errorMessage: 'Invalid email/password',
        errorEmail: false,
        errorPassword: false,
        errorAccount: true,
      });
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
        {error.errorAccount && (
          <HelperText type="error" visible={error.errorAccount}>
            {error.errorMessage}
          </HelperText>
        )}
        {error.errorEmail && (
          <HelperText type="error" visible={error.errorEmail}>
            {error.errorMessage}
          </HelperText>
        )}
        <TextInput
          label="Email"
          value={email}
          onChangeText={(email) => setEmail(email)}
        />
        {error.errorPassword && (
          <HelperText type="error" visible={error.errorPassword}>
            {error.errorMessage}
          </HelperText>
        )}
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
