import { Image, ScrollView, StyleSheet, View } from 'react-native';
import {
  Appbar,
  Avatar,
  Button,
  Card,
  Dialog,
  IconButton,
  List,
  Portal,
  Text,
} from 'react-native-paper';
import { signOut } from 'firebase/auth';
import { auth, db } from '../../config';
import {
  AccountContext,
  AppContext,
  AuthContext,
  LoginContext,
} from '../../Helper/Context';
import { useContext, useEffect, useState } from 'react';
import {
  collection,
  doc,
  getDoc,
  getDocs,
  onSnapshot,
  query,
  where,
} from 'firebase/firestore';
import { StatusBar } from 'expo-status-bar';

export const AccountRoute = () => {
  const [accounts, setAccounts] = useState();
  const { currentUser, setLoggedIn, userAccount, familyCode } =
    useContext(AppContext);
  const [visible, setVisible] = useState(false);
  const hideDialog = () => setVisible(false);

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      setLoggedIn(false);
    } catch (error) {
      console.log(error);
    }
  };
  useEffect(() => {
    if (!userAccount || Object.keys(userAccount).length === 0) return;

    const q = query(
      collection(db, 'users'),
      where('code', '==', userAccount?.code)
    );
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const accounts = snapshot?.docs?.map((doc) => doc.data());
      setAccounts(accounts);
    });

    return () => {
      unsubscribe();
    };
  }, []);

  return (
    <>
      <StatusBar
        backgroundColor="#FFFFFF"
        barStyle="light-content"
        translucent
      />
      <Appbar.Header
        mode="center-aligned"
        style={{
          backgroundColor: '#FFFFFF',
        }}
      >
        <Appbar.Content
          title={
            <Text variant="labelLarge" style={{ fontSize: 24, lineHeight: 30 }}>
              MY PROFILE
            </Text>
          }
        />
        <Appbar.Action
          icon="logout"
          onPress={() => handleSignOut()}
          style={{
            backgroundColor: '#FF4C38',
            borderRadius: 12,
          }}
          color="#FFFFFF"
        />
      </Appbar.Header>
      <View style={styles.container}>
        <ScrollView>
          <View style={{ paddingHorizontal: '3%' }}>
            <View
              style={{
                width: '100%',
                justifyContent: 'center',
                alignItems: 'center',
                backgroundColor: '#F5F6FA',
                padding: 10,
                marginVertical: 8,
                borderRadius: 12,
              }}
            >
              <Avatar.Text
                size={64}
                label={userAccount?.name?.slice(0, 1)}
                style={{
                  backgroundColor: userAccount?.profileBackground,
                  margin: 5,
                }}
                labelStyle={{ color: 'white', top: 1, fontSize: 45 }}
              />
              <Text
                variant="displayMedium"
                style={{ color: '#151940', fontSize: 40 }}
              >
                {userAccount?.name}
              </Text>
              <Text variant="bodyLarge" style={{ color: '#7F8192' }}>
                {userAccount?.email}
              </Text>
              <Text variant="bodyLarge" style={{ color: '#7F8192' }}>
                {userAccount?.type?.toUpperCase()}
              </Text>
              <Text
                variant="displaySmall"
                style={{
                  fontWeight: 'bold',
                  letterSpacing: 2,
                  textDecorationLine: 'underline',
                }}
              >
                {userAccount?.code}
              </Text>
              <Text variant="bodyLarge" style={{ color: '#7F8192' }}>
                Family Code
              </Text>
            </View>
            <Text variant="titleLarge" style={{ padding: 10 }}>
              Linked Account(s)
            </Text>
            {accounts &&
              accounts?.map((account) => (
                <List.Item
                  key={account.uid}
                  title={account.name}
                  description={account.email}
                  style={{
                    backgroundColor: '#F5F6FA',
                    borderRadius: 12,
                    margin: 5,
                  }}
                  left={(props) => (
                    <List.Icon
                      {...props}
                      icon={() => (
                        <Avatar.Icon
                          size={45}
                          icon="account"
                          color="#FFFFFF"
                          style={{
                            backgroundColor: account.profileBackground,
                          }}
                        />
                      )}
                    />
                  )}
                  right={(props) => (
                    <View
                      style={{
                        backgroundColor: '#FFFFFF',
                        width: 50,
                        justifyContent: 'center',
                        alignItems: 'center',
                        borderRadius: 12,
                      }}
                    >
                      {account.type === 'provider' ? (
                        <Text variant="labelLarge" style={{ color: '#FF4C38' }}>
                          P
                        </Text>
                      ) : (
                        <Text variant="labelLarge" style={{ color: '#38B6FF' }}>
                          M
                        </Text>
                      )}
                    </View>
                  )}
                />
              ))}
          </View>
        </ScrollView>
      </View>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
