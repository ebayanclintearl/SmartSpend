import { useEffect, useState } from 'react';
import { Provider as PaperProvider } from 'react-native-paper';
import { NavigationContainer } from '@react-navigation/native';
import HomeStack from './routes/HomeStack';
import { onAuthStateChanged } from 'firebase/auth';
import { auth, db } from './config';
import { AccountContext, AuthContext, LoginContext } from './Helper/Context';
import { doc, getDoc, onSnapshot } from 'firebase/firestore';
export default function App() {
  const [loggedIn, setLoggedIn] = useState(false);
  const [currentUser, setCurrentUser] = useState({});
  const [accountInfo, setAccountInfo] = useState({});
  const [accountsInfo, setAccountsInfo] = useState([]);
  useEffect(() => {
    const authStateChange = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
    });
    return () => {
      authStateChange();
    };
  }, []);

  useEffect(() => {
    let isCancelled = false;

    const getAccountDetails = async () => {
      if (!currentUser?.uid || !db) return;
      const docRef = doc(db, 'users', currentUser.uid);
      const docSnap = await getDoc(docRef);

      if (!isCancelled && docSnap.exists()) {
        setAccountInfo(docSnap.data());
      }
    };

    currentUser?.uid && getAccountDetails();

    return () => {
      isCancelled = true;
    };
  }, [currentUser, db]);

  useEffect(() => {
    if (!accountInfo || !accountInfo.code || !db) return;

    let unsubscribe;

    const updateFamilyGroup = async () => {
      const docRef = doc(db, 'familyGroup', accountInfo.code);
      unsubscribe = onSnapshot(docRef, (doc) => {
        setAccountsInfo(doc.data());
      });
    };

    updateFamilyGroup();

    return () => {
      unsubscribe && unsubscribe();
    };
  }, [accountInfo, db]);

  return (
    <AuthContext.Provider value={{ currentUser }}>
      <LoginContext.Provider value={{ loggedIn, setLoggedIn }}>
        <AccountContext.Provider value={{ accountInfo, accountsInfo }}>
          <PaperProvider theme={{ dark: false, mode: 'exact' }}>
            <NavigationContainer>
              <HomeStack />
            </NavigationContainer>
          </PaperProvider>
        </AccountContext.Provider>
      </LoginContext.Provider>
    </AuthContext.Provider>
  );
}
