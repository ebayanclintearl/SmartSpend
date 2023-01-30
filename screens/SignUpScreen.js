import { StyleSheet, View } from 'react-native';
import React, { useContext, useState } from 'react';
import { TextInput, Button, Appbar, Text, Checkbox } from 'react-native-paper';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { auth, db } from '../config';
import { doc, getDocs, setDoc } from 'firebase/firestore';
import { AuthContext } from '../Helper/Context';
import { collection, query, where } from 'firebase/firestore';
const SignUpScreen = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [accountName, setAccountName] = useState('');
  const { loggedIn, setLoggedIn } = useContext(AuthContext);
  const [showLoading, setShowLoading] = useState(false);
  const [famProvider, setFamProvider] = useState(true);
  const [famCode, setFamCode] = useState('');
  const [error, setError] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [genFamCode, setGenFamCode] = useState('');

  const handleSignUp = async () => {
    setShowLoading(true);
    if (famProvider) {
      const code = Math.floor(Math.random() * 90000) + 10000;
      setGenFamCode(code.toString());
    }
    if (!famProvider) {
      if (!famCode.trim()) {
        setShowLoading(false);
        setError(true);
        setErrorMsg('Empty Family Code');
        return;
      }
      const usersRef = collection(db, 'users');

      const q = query(usersRef, where('code', '==', famCode));
      const querySnapshot = await getDocs(q);
      if (querySnapshot.empty) {
        setShowLoading(false);
        setError(true);
        setErrorMsg('Invalid Family Code');
        return;
      }
    }
    if (!accountName.trim()) {
      setShowLoading(false);
      setError(true);
      setErrorMsg('Invalid Name');
      return;
    }
    if (!email.trim()) {
      setShowLoading(false);
      setError(true);
      setErrorMsg('Invalid Email');
      return;
    }
    if (!password.trim()) {
      setShowLoading(false);
      setError(true);
      setErrorMsg('Invalid Password');
      return;
    }
    try {
      const res = await createUserWithEmailAndPassword(auth, email, password);
      await setDoc(doc(db, 'users', res.user.uid), {
        uid: res.user.uid,
        name: accountName,
        email: email,
        type: famProvider ? 'provider' : 'member',
        code: genFamCode ? genFamCode : famCode,
      });
      setLoggedIn(true);
      console.log('Done execution, sign up');
    } catch (error) {
      setShowLoading(false);
      setError(true);
      setErrorMsg('Invalid Email/Password');
    }
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
        {error && <Text style={{ color: 'red' }}>{errorMsg}</Text>}
        <TextInput
          label="Name"
          value={accountName}
          onChangeText={(accountName) => setAccountName(accountName)}
        />
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
        <View style={{ flexDirection: 'row' }}>
          <Checkbox
            status={famProvider ? 'checked' : 'unchecked'}
            onPress={() => {
              setFamProvider(!famProvider);
            }}
          />
          <Text>Family Provider</Text>
          <Checkbox
            status={famProvider ? 'unchecked' : 'checked'}
            onPress={() => {
              setFamProvider(!famProvider);
            }}
          />
          <Text>Family Member</Text>
        </View>
        {!famProvider && (
          <TextInput
            mode="outlined"
            label="Family Code"
            value={famCode}
            onChangeText={(famCode) => setFamCode(famCode)}
          />
        )}
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
