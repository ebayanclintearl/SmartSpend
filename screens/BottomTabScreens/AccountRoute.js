import { ScrollView, StyleSheet, View } from 'react-native';
import {
  Avatar,
  Button,
  Card,
  Dialog,
  IconButton,
  Portal,
  Text,
} from 'react-native-paper';
import { signOut } from 'firebase/auth';
import { auth, db } from '../../config';
import {
  AccountContext,
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

export const AccountRoute = () => {
  const { loggedIn, setLoggedIn } = useContext(LoginContext);
  const { currentUser } = useContext(AuthContext);
  const { accountInfo, accountsInfo } = useContext(AccountContext);
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
  return (
    <View style={styles.container}>
      <Portal>
        <Dialog
          visible={visible}
          onDismiss={hideDialog}
          style={{ margin: '10%' }}
        >
          <Dialog.Title>
            <Text variant="titleLarge">Family Accounts</Text>
          </Dialog.Title>
          <Dialog.ScrollArea>
            <ScrollView contentContainerStyle={{ paddingHorizontal: 5 }}>
              {accountsInfo &&
                Object.entries(accountsInfo)
                  .filter(([, value]) =>
                    accountInfo?.type === 'provider'
                      ? value.type === 'member'
                      : value.type === 'provider'
                  )
                  .filter(([key]) => key !== 'transactions')
                  .map(([id, value]) => (
                    <Card.Title
                      key={id}
                      title={value.name}
                      subtitle={value.email}
                      left={(props) => (
                        <Avatar.Text
                          {...props}
                          size={24}
                          label={value.name.slice(0, 1)}
                        />
                      )}
                    />
                  ))}
            </ScrollView>
          </Dialog.ScrollArea>
          <Dialog.Actions>
            <Button onPress={() => setVisible(false)}>Done</Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
      <Avatar.Text size={80} label={currentUser?.displayName?.slice(0, 1)} />
      <Text variant="headlineLarge">{currentUser?.displayName}</Text>
      <Text variant="headlineSmall">{currentUser?.email}</Text>

      {accountInfo?.type === 'provider' ? (
        <>
          <Text variant="titleMedium">Family Provider</Text>
          <Text variant="titleMedium">Family Code: {accountInfo?.code}</Text>
          <Button
            onPress={() => {
              setVisible(true);
            }}
          >
            Show Family Accounts
          </Button>
        </>
      ) : (
        <Text variant="titleMedium">Family Member</Text>
      )}
      <Button
        mode="text"
        onPress={() => {
          handleSignOut();
        }}
      >
        Sign Out
      </Button>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
