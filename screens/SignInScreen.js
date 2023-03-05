import { Image, KeyboardAvoidingView, StyleSheet, View } from 'react-native';
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
import { ScrollView } from 'react-native-gesture-handler';
import { SafeAreaView } from 'react-native-safe-area-context';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
const SignInScreen = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showLoading, setShowLoading] = useState(false);
  const { loggedIn, setLoggedIn } = useContext(LoginContext);
  const [secure, setSecure] = useState(true);
  const [error, setError] = useState({
    errorMessage: '',
    errorEmail: false,
    errorPassword: false,
    errorAccount: false,
  });

  const toggleSecure = () => setSecure(!secure);
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
      <SafeAreaView style={styles.container}>
        <KeyboardAwareScrollView contentContainerStyle={{ flexGrow: 1 }}>
          <View
            style={{
              paddingHorizontal: '8%',
              flex: 1,
            }}
          >
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
              mode="outlined"
              label="Enter Email Address"
              value={email}
              onChangeText={(email) => setEmail(email)}
              outlineColor="#F5F6FA"
              outlineStyle={{ borderRadius: 5 }}
              style={{
                marginVertical: 5,
                backgroundColor: '#F5F6FA',
              }}
            />
            {error.errorPassword && (
              <HelperText type="error" visible={error.errorPassword}>
                {error.errorMessage}
              </HelperText>
            )}
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
            <View
              style={{ flex: 1, justifyContent: 'flex-end', marginBottom: 30 }}
            >
              <Text variant="labelLarge">Don't have an account?</Text>
              <Button
                mode="text"
                icon="arrow-right"
                style={{ width: '50%' }}
                contentStyle={{ flexDirection: 'row-reverse' }}
                labelStyle={{ fontWeight: 'bold', top: -1 }}
                onPress={() => navigation.navigate('SignUpScreen')}
              >
                R E G I S T E R
              </Button>
            </View>
          </View>
        </KeyboardAwareScrollView>
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
