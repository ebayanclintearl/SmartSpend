import { ScrollView, StyleSheet, View } from 'react-native';
import { Avatar, Button, Dialog, Portal, Text } from 'react-native-paper';
import { signOut } from 'firebase/auth';
import { auth, db } from '../../config';
import { AuthContext, LoginContext } from '../../Helper/Context';
import { useContext, useEffect, useState } from 'react';
import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  where,
} from 'firebase/firestore';

export const AccountRoute = () => {
  const { loggedIn, setLoggedIn } = useContext(LoginContext);
  const { currentUser } = useContext(AuthContext);
  const [accountData, setAccountData] = useState({});
  const [usersData, setUsersData] = useState(null);
  const [showLoading, setShowLoading] = useState(false);
  const [visible, setVisible] = useState(false);
  const hideDialog = () => setVisible(false);
  useEffect(() => {
    const getAccountDetails = async () => {
      setShowLoading(true);
      const docRef = doc(db, 'users', currentUser?.uid);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        setAccountData(docSnap.data());
        const q = query(
          collection(db, 'users'),
          where('code', '==', docSnap.data().code)
        );
        const querySnapshot = await getDocs(q);
        setUsersData(querySnapshot.docs.map((doc) => doc.data()));
      }
      setShowLoading(false);
    };
    getAccountDetails();
  }, []);

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
            <ScrollView contentContainerStyle={{ paddingHorizontal: 24 }}>
              {usersData &&
                usersData?.map((item, id) => (
                  <>
                    <View key={id} style={{ flexDirection: 'row' }}>
                      <Avatar.Text size={24} label={item.name.slice(0, 1)} />
                      <Text variant="titleSmall"> {item.name}</Text>
                    </View>
                  </>
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
      {showLoading && <Text variant="titleSmall">Loading...</Text>}
      {!showLoading &&
        (accountData?.type === 'provider' ? (
          <>
            <Text variant="titleMedium">Family Provider</Text>
            <Text variant="titleMedium">Family Code: {accountData?.code}</Text>
          </>
        ) : (
          <Text variant="titleMedium">Family Member</Text>
        ))}
      <Button
        onPress={() => {
          setVisible(true);
        }}
      >
        Show Family Accounts
      </Button>
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
