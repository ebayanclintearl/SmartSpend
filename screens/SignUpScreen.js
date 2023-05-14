import { Image, StatusBar, StyleSheet, View } from 'react-native';
import React, { useContext, useState } from 'react';
import {
  TextInput,
  Button,
  Text,
  HelperText,
  Snackbar,
} from 'react-native-paper';
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { auth, db } from '../config';
import { doc, setDoc } from 'firebase/firestore';
import { AppContext } from '../Helper/Context';
import { validateSignUpInputs } from '../Helper/Validation';
import { SafeAreaView } from 'react-native-safe-area-context';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { useNavigation } from '@react-navigation/native';
import randomColor from 'randomcolor';

const SignUpScreen = ({ route }) => {
  const navigation = useNavigation();
  const { code } = route.params ?? {};
  const { setDisplaySignUpSuccess } = useContext(AppContext);
  const [accountName, setAccountName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showLoading, setShowLoading] = useState(false);
  const [securePassword, setSecurePassword] = useState(true);
  const [secureConfirmPassword, setSecureConfirmPassword] = useState(true);
  const [showSnackBar, setShowSnackBar] = useState(false);
  const [error, setError] = useState({
    errorMessage: '',
    errorAccountName: false,
    errorEmail: false,
    errorPassword: false,
    errorConfirmPassword: false,
    errorFamilyCode: false,
  });

  // Function to toggle
  const toggleSecurePassword = () => setSecurePassword(!securePassword);
  const toggleSecureConfirmPassword = () =>
    setSecureConfirmPassword(!secureConfirmPassword);
  const onDismissSnackBar = () => setShowSnackBar(false);

  // Function to handle sign up button press
  const handleSignUp = async () => {
    // Validate sign up inputs
    const validationResult = validateSignUpInputs(
      accountName,
      email,
      password,
      confirmPassword
    );
    setError(validationResult);
    if (validationResult.errorMessage) return;

    // Attempt to sign up with Firebase FireStore
    try {
      setShowLoading(true);
      setDisplaySignUpSuccess(true);
      const res = await createUserWithEmailAndPassword(auth, email, password);
      await updateProfile(res.user, { displayName: accountName });

      const generatedCode = Math.floor(Math.random() * 90000) + 10000;
      const userRef = doc(db, 'users', res.user.uid);

      await setDoc(userRef, {
        uid: res.user.uid,
        name: accountName,
        email: email,
        password: password,
        profileBackground: randomColor(),
        accountType: code ? 'member' : 'provider',
        familyCode: code ? parseInt(code) : generatedCode,
      });

      if (!code) {
        const codeRef = doc(db, 'familyCodes', generatedCode.toString());
        await setDoc(codeRef, {
          familyExpenseHistory: {},
        });
      }

      setShowLoading(false);
      console.log('Done execution, sign up');
    } catch (error) {
      console.log('SignUp', error.code);
      setShowLoading(false);
      setDisplaySignUpSuccess(false);
      if (error.code === 'auth/network-request-failed') {
        setShowSnackBar(true);
      }
      if (error.code === 'auth/email-already-in-use') {
        setError({
          errorMessage: 'Email already in use',
          errorAccountName: false,
          errorEmail: true,
          errorPassword: false,
          errorConfirmPassword: false,
          errorFamilyCode: false,
        });
      } else {
        setError({
          errorMessage: 'An error occurred while signing up.',
          errorAccountName: true,
          errorEmail: false,
          errorPassword: false,
          errorConfirmPassword: false,
          errorFamilyCode: false,
        });
      }
    }
  };

  return (
    <>
      {/* SafeAreaView and KeyboardAwareScrollView from react-native libraries */}
      <SafeAreaView style={styles.container}>
        <StatusBar
          backgroundColor="#FF4C38"
          barStyle="light-content"
          translucent
        />
        <KeyboardAwareScrollView contentContainerStyle={{ flexGrow: 1 }}>
          <View
            style={{
              paddingHorizontal: '8%',
              flex: 1,
            }}
          >
            {/* Display register text and img background */}
            <View
              style={{
                width: '100%',
                height: 200,
                justifyContent: 'center',
                marginBottom: 20,
              }}
            >
              <Image
                resizeMode="contain"
                style={{
                  width: '100%',
                  height: '100%',
                  position: 'absolute',
                  top: 15,
                  left: -25,
                }}
                source={require('../assets/AppAssets/registration_bg.png')}
              />
              <Text variant="displayMedium" style={{ color: '#FF4C38' }}>
                Register
              </Text>
              <Text variant="bodyLarge">Please Sign Up to continue</Text>
            </View>
            {/* Show error message if account name error occurs */}
            {error.errorAccountName && (
              <HelperText type="error" visible={error.errorAccountName}>
                {error.errorMessage}
              </HelperText>
            )}
            {/* Input field for account name */}
            <TextInput
              mode="outlined"
              label="Full name"
              value={accountName}
              onChangeText={(accountName) => setAccountName(accountName)}
              outlineColor="#F5F6FA"
              activeOutlineColor="#FF4C38"
              outlineStyle={{ borderRadius: 5 }}
              style={{
                marginVertical: 2,
                backgroundColor: '#F5F6FA',
              }}
            />
            {/* Show error message if email error occurs */}
            {error.errorEmail && (
              <HelperText type="error" visible={error.errorEmail}>
                {error.errorMessage}
              </HelperText>
            )}
            {/* Input field for email */}
            <TextInput
              mode="outlined"
              label="Email"
              value={email}
              onChangeText={(email) => setEmail(email)}
              outlineColor="#F5F6FA"
              activeOutlineColor="#FF4C38"
              outlineStyle={{ borderRadius: 5 }}
              style={{
                marginVertical: 2,
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
              activeOutlineColor="#FF4C38"
              outlineStyle={{ borderRadius: 5 }}
              secureTextEntry={securePassword}
              right={
                <TextInput.Icon
                  icon={securePassword ? 'eye' : 'eye-off'}
                  iconColor="#7F8192"
                  forceTextInputFocus={false}
                  onPress={toggleSecurePassword}
                />
              }
              style={{
                marginVertical: 2,
                backgroundColor: '#F5F6FA',
              }}
            />
            {/* Show error message if confirm password error occurs */}
            {error.errorConfirmPassword && (
              <HelperText type="error" visible={error.errorConfirmPassword}>
                {error.errorMessage}
              </HelperText>
            )}
            {/* Input field for confirm password */}
            <TextInput
              mode="outlined"
              label="Confirm Password"
              value={confirmPassword}
              onChangeText={(confirmPassword) =>
                setConfirmPassword(confirmPassword)
              }
              outlineColor="#F5F6FA"
              activeOutlineColor="#FF4C38"
              outlineStyle={{ borderRadius: 5 }}
              secureTextEntry={secureConfirmPassword}
              right={
                <TextInput.Icon
                  icon={secureConfirmPassword ? 'eye' : 'eye-off'}
                  iconColor="#7F8192"
                  forceTextInputFocus={false}
                  onPress={toggleSecureConfirmPassword}
                />
              }
              style={{
                marginVertical: 2,
                backgroundColor: '#F5F6FA',
              }}
            />
            {/* Button for login */}
            <Button
              mode="contained"
              style={{ marginVertical: 10, borderRadius: 5 }}
              contentStyle={{ padding: 3, backgroundColor: '#FF4C38' }}
              onPress={() => {
                handleSignUp();
              }}
              loading={showLoading}
            >
              Register
            </Button>
            {/* Navigation to login screen */}
            <View
              style={{ flex: 1, justifyContent: 'flex-end', marginBottom: 30 }}
            >
              <Text variant="labelLarge">Already have an account?</Text>
              <Button
                mode="text"
                icon="arrow-right"
                style={{ width: '50%' }}
                contentStyle={{ flexDirection: 'row-reverse' }}
                labelStyle={{ fontWeight: 'bold', top: -1, color: '#FF4C38' }}
                onPress={() => navigation.navigate('SignInScreen')}
              >
                L O G I N
              </Button>
            </View>
          </View>
        </KeyboardAwareScrollView>
        <Snackbar visible={showSnackBar} onDismiss={onDismissSnackBar}>
          Network Error.
        </Snackbar>
      </SafeAreaView>
    </>
  );
};

export default SignUpScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
});
