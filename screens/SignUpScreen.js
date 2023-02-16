import { StyleSheet, View } from 'react-native';
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
import {
  arrayUnion,
  doc,
  getDocs,
  setDoc,
  updateDoc,
} from 'firebase/firestore';
import { LoginContext } from '../Helper/Context';
import { collection, query, where } from 'firebase/firestore';
import { validateSignUpInputs } from '../Helper/Validation';
const SignUpScreen = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [accountName, setAccountName] = useState('');
  const { loggedIn, setLoggedIn } = useContext(LoginContext);
  const [showLoading, setShowLoading] = useState(false);
  const [familyProvider, setFamilyProvider] = useState(true);
  const [familyCode, setFamilyCode] = useState('');
  const [error, setError] = useState({
    errorMessage: '',
    errorAccountName: false,
    errorEmail: false,
    errorPassword: false,
    errorFamilyCode: false,
  });

  const handleSignUp = async () => {
    const validationResult = validateSignUpInputs(
      accountName,
      email,
      password,
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
          setError({
            errorMessage: 'Invalid Family Code',
            errorAccountName: false,
            errorEmail: false,
            errorPassword: false,
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
      <Appbar.Header>
        <Appbar.BackAction
          onPress={() => {
            navigation.navigate('SignInScreen');
          }}
        />
      </Appbar.Header>
      <View style={styles.container}>
        {error.errorAccountName && (
          <HelperText type="error" visible={error.errorAccountName}>
            {error.errorMessage}
          </HelperText>
        )}
        <TextInput
          label="Name"
          value={accountName}
          error={error.errorAccountName}
          onChangeText={(accountName) => setAccountName(accountName)}
        />
        {error.errorEmail && (
          <HelperText type="error" visible={error.errorEmail}>
            {error.errorMessage}
          </HelperText>
        )}
        <TextInput
          label="Email"
          value={email}
          error={error.errorEmail}
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
    </>
  );
};

export default SignUpScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
  },
});
