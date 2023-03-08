import { Image, StyleSheet, View } from 'react-native';
import React, { useContext, useState } from 'react';
import {
  TextInput,
  Button,
  Appbar,
  Text,
  Checkbox,
  HelperText,
} from 'react-native-paper';
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { auth, db } from '../config';
import { doc, getDocs, setDoc, updateDoc } from 'firebase/firestore';
import { LoginContext } from '../Helper/Context';
import { collection, query, where } from 'firebase/firestore';
import { validateSignUpInputs } from '../Helper/Validation';
import { SafeAreaView } from 'react-native-safe-area-context';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
const SignUpScreen = ({ navigation }) => {
  const { setLoggedIn } = useContext(LoginContext);
  const [accountName, setAccountName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [familyProvider, setFamilyProvider] = useState(true);
  const [familyCode, setFamilyCode] = useState('');
  const [showLoading, setShowLoading] = useState(false);
  const [securePassword, setSecurePassword] = useState(true);
  const [secureConfirmPassword, setSecureConfirmPassword] = useState(true);
  const [error, setError] = useState({
    errorMessage: '',
    errorAccountName: false,
    errorEmail: false,
    errorPassword: false,
    errorConfirmPassword: false,
    errorFamilyCode: false,
  });

  // Function to toggle visibility of password text
  const toggleSecurePassword = () => setSecurePassword(!securePassword);
  const toggleSecureConfirmPassword = () =>
    setSecureConfirmPassword(!secureConfirmPassword);

  const handleSignUp = async () => {
    const validationResult = validateSignUpInputs(
      accountName,
      email,
      password,
      confirmPassword,
      familyCode,
      familyProvider
    );
    setError(validationResult);
    if (validationResult.errorMessage) return;

    if (!familyProvider) {
      setShowLoading(true);
      try {
        const validFamilyCode = await validateFamilyCode(familyCode);
        if (!validFamilyCode) {
          setShowLoading(false);
          setError({
            errorMessage: 'Invalid Family Code',
            errorAccountName: false,
            errorEmail: false,
            errorPassword: false,
            errorConfirmPassword: false,
            errorFamilyCode: true,
          });
          return;
        }
      } catch (error) {
        setError({
          errorMessage: 'Error validating Family Code',
          errorAccountName: false,
          errorEmail: false,
          errorPassword: false,
          errorConfirmPassword: false,
          errorFamilyCode: true,
        });
        return;
      }
    }

    try {
      setShowLoading(true);
      const res = await createUserWithEmailAndPassword(auth, email, password);
      await updateProfile(res.user, { displayName: accountName });

      const code = Math.floor(Math.random() * 90000) + 10000;
      const userRef = doc(db, 'users', res.user.uid);
      await setDoc(userRef, {
        uid: res.user.uid,
        name: accountName,
        email: email,
        type: familyProvider ? 'provider' : 'member',
        code: familyProvider ? code.toString() : familyCode,
      });

      if (familyProvider) {
        const familyGroupRef = doc(db, 'familyGroup', code.toString());
        await setDoc(familyGroupRef, {
          [res.user.uid]: {
            email: email,
            name: accountName,
            type: 'provider',
          },
        });
      } else {
        const familyGroupRef = doc(db, 'familyGroup', familyCode);
        await updateDoc(familyGroupRef, {
          [res.user.uid]: {
            email: email,
            name: accountName,
            type: 'member',
          },
        });
      }

      setShowLoading(false);
      setLoggedIn(true);
      console.log('Done execution, sign up');
    } catch (error) {
      setShowLoading(false);
      setError({
        errorMessage: error.message || 'Invalid Email/Password',
        errorAccountName: false,
        errorEmail: true,
        errorPassword: false,
        errorConfirmPassword: false,
        errorFamilyCode: false,
      });
    }
  };

  const validateFamilyCode = async (code) => {
    const usersRef = collection(db, 'users');
    const querySnapshot = await getDocs(
      query(usersRef, where('code', '==', code))
    );
    return !querySnapshot.empty;
  };

  return (
    <>
      {/* SafeAreaView and KeyboardAwareScrollView from react-native libraries */}
      <SafeAreaView style={styles.container}>
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
                marginBottom: 30,
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

            {!familyProvider && (
              <>
                {error.errorFamilyCode && (
                  <HelperText type="error" visible={error.errorFamilyCode}>
                    {error.errorMessage}
                  </HelperText>
                )}
                <TextInput
                  mode="outlined"
                  label="Family Code"
                  value={familyCode}
                  onChangeText={(familyCode) => setFamilyCode(familyCode)}
                />
              </>
            )}
            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'center',
                alignItems: 'center',
              }}
            >
              <Checkbox
                status={familyProvider ? 'checked' : 'unchecked'}
                onPress={() => {
                  setFamilyProvider(!familyProvider);
                }}
              />
              <Text>Family Provider</Text>
              <Checkbox
                status={familyProvider ? 'unchecked' : 'checked'}
                onPress={() => {
                  setFamilyProvider(!familyProvider);
                }}
              />
              <Text>Family Member</Text>
            </View>
            <Button
              mode="contained"
              onPress={() => {
                handleSignUp();
              }}
              loading={showLoading}
            >
              Sign Up
            </Button>
          </View>
        </KeyboardAwareScrollView>
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
