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
      const getAccountDetails = async () => {
        const docRef = doc(db, 'users', currentUser?.uid);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          setAccountInfo(docSnap.data());
        }
      };
      currentUser?.uid && getAccountDetails();
    });
    return () => {
      authStateChange();
    };
  }, [currentUser?.uid]);

  useEffect(() => {
    if (!accountInfo.code) return;
    const unsub = onSnapshot(
      doc(db, 'familyGroup', accountInfo.code),
      (doc) => {
        setAccountsInfo(doc.data());
      }
    );
    return () => {
      unsub();
    };
  }, [accountInfo?.code]);

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
