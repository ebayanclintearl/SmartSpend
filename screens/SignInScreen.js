// Imports
import { Image, StatusBar, StyleSheet, View } from 'react-native';
import React, { useState } from 'react';
import {
  Button,
  Text,
  TextInput,
  HelperText,
  Snackbar,
} from 'react-native-paper';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../config';
import { validateSignInInputs } from '../Helper/Validation';
import { SafeAreaView } from 'react-native-safe-area-context';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { useNavigation } from '@react-navigation/native';

// The SignInScreen component represents the screen where users can sign in to their account.
const SignInScreen = () => {
  const navigation = useNavigation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showLoading, setShowLoading] = useState(false);
  const [secure, setSecure] = useState(true);
  const [showSnackBar, setShowSnackBar] = useState(false);
  const [error, setError] = useState({
    errorMessage: '',
    errorEmail: false,
    errorPassword: false,
    errorAccount: false,
  });

  // Function to toggle
  const toggleSecure = () => setSecure(!secure);
  const onDismissSnackBar = () => setShowSnackBar(false);

  // Function to handle sign in
  const handleSignIn = async () => {
    // Validate sign in inputs
    const validationResult = validateSignInInputs(email, password);
    setError(validationResult);
    if (validationResult.errorMessage) return;

    // Attempt to sign in with Firebase authentication
    try {
      setShowLoading(true);
      await signInWithEmailAndPassword(auth, email, password);
      setShowLoading(false);
    } catch (error) {
      console.log('SignIn', error.code);
      if (error.code === 'auth/network-request-failed') {
        setShowSnackBar(true);
      }
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
      {/* Provides a safe area for content rendering, ensuring it is visible and not obstructed by device-specific elements like notches or status bars. */}
      <SafeAreaView style={styles.container}>
        {/* The component renders a StatusBar component to set the status bar appearance. */}
        <StatusBar
          backgroundColor="#38B6FF"
          barStyle="light-content"
          translucent
        />
        {/* The KeyboardAwareScrollView component ensures that the screen's content is scrollable and adjusts the keyboard behavior. */}
        <KeyboardAwareScrollView contentContainerStyle={{ flexGrow: 1 }}>
          <View
            style={{
              paddingHorizontal: '8%',
              flex: 1,
            }}
          >
            {/* Display login text and img background */}
            <View
              style={{
                width: '100%',
                height: 200,
                justifyContent: 'center',
                marginBottom: 30,
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
                source={require('../assets/AppAssets/login_bg.png')}
              />
              <Text variant="displayMedium" style={{ color: '#38B6FF' }}>
                Log In
              </Text>
              <Text variant="bodyLarge">Please Sign In to continue</Text>
            </View>
            {/* Show error message if account error occurs */}
            {error.errorAccount && (
              <HelperText type="error" visible={error.errorAccount}>
                {error.errorMessage}
              </HelperText>
            )}
            {/* Show error message if email error occurs */}
            {error.errorEmail && (
              <HelperText type="error" visible={error.errorEmail}>
                {error.errorMessage}
              </HelperText>
            )}
            {/* Input field for email */}
            <TextInput
              mode="outlined"
              label="Email Address"
              value={email}
              onChangeText={(email) => setEmail(email)}
              outlineColor="#F5F6FA"
              outlineStyle={{ borderRadius: 5 }}
              style={{
                marginVertical: 5,
                backgroundColor: '#F5F6FA',
              }}
            />
            {/* Show error message if password error occurs */}
            {error.errorPassword && (
              <HelperText type="error" visible={error.errorPassword}>
                {error.errorMessage}
              </HelperText>
            )}
            {/* Input field for password */}
            <TextInput
              mode="outlined"
              label="Password"
              value={password}
              onChangeText={(password) => setPassword(password)}
              outlineColor="#F5F6FA"
              outlineStyle={{ borderRadius: 5 }}
              secureTextEntry={secure}
              right={
                <TextInput.Icon
                  icon={secure ? 'eye' : 'eye-off'}
                  iconColor="#7F8192"
                  forceTextInputFocus={false}
                  onPress={toggleSecure}
                />
              }
              style={{
                marginVertical: 5,
                backgroundColor: '#F5F6FA',
              }}
            />
            {/* Login button */}
            <Button
              mode="contained"
              style={{ marginVertical: 10, borderRadius: 5 }}
              contentStyle={{ padding: 3 }}
              onPress={() => {
                handleSignIn();
              }}
              loading={showLoading}
            >
              Login
            </Button>
            {/* Navigation to registration prompt screen */}
            <View
              style={{ flex: 1, justifyContent: 'flex-end', marginBottom: 30 }}
            >
              <Text variant="labelLarge">Don't have an account?</Text>
              {/* Register button */}
              <Button
                mode="text"
                icon="arrow-right"
                style={{ width: '50%' }}
                contentStyle={{ flexDirection: 'row-reverse' }}
                labelStyle={{ fontWeight: 'bold', top: -1, color: '#38B6FF' }}
                onPress={() => navigation.navigate('RegistrationPromptScreen')}
              >
                R E G I S T E R
              </Button>
            </View>
          </View>
        </KeyboardAwareScrollView>
        {/* The Snackbar component displays a network error message if there is a network request failure. */}
        <Snackbar visible={showSnackBar} onDismiss={onDismissSnackBar}>
          Network Error.
        </Snackbar>
      </SafeAreaView>
    </>
  );
};

export default SignInScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
});
