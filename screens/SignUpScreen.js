import { StyleSheet, View } from 'react-native';
import React, { useContext, useState } from 'react';
import { TextInput, Button, Appbar, Text, Checkbox } from 'react-native-paper';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { auth, db } from '../config';
import { doc, setDoc } from 'firebase/firestore';
import { AuthContext } from '../Helper/Context';

const SignUpScreen = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [accountName, setAccountName] = useState('');
  const { loggedIn, setLoggedIn } = useContext(AuthContext);
  const [showLoading, setShowLoading] = useState(false);
  const [checked, setChecked] = useState(false);
  const handleSignUp = async () => {
    try {
      setShowLoading(true);
      const res = await createUserWithEmailAndPassword(auth, email, password);
      await setDoc(doc(db, 'users', res.user.uid), {
        uid: res.user.uid,
        name: accountName,
        email: email,
      });
      setLoggedIn(true);
      console.log('Done execution, sign up');
    } catch (error) {
      console.log(error);
      setShowLoading(false);
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
            status={checked ? 'unchecked' : 'checked'}
            onPress={() => {
              setChecked(!checked);
            }}
          />
          <Text>Family Member</Text>
          <Checkbox
            status={checked ? 'checked' : 'unchecked'}
            onPress={() => {
              setChecked(!checked);
            }}
          />
          <Text>Family Provider</Text>
        </View>
        <Button
          mode="contained"
          onPress={() => {
            handleSignUp();
          }}
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
