import { createContext, useState, useEffect } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth, db } from '../config';
import { doc, getDoc, onSnapshot } from 'firebase/firestore';
import NetInfo from '@react-native-community/netinfo';

// Create context objects
export const AuthContext = createContext();
export const LoginContext = createContext();
export const AccountContext = createContext();

// Provider component that wraps the application and provides the context values
export const AppContextProvider = ({ children }) => {
  // Define state variables for context values
  const [loggedIn, setLoggedIn] = useState(false);
  const [currentUser, setCurrentUser] = useState({});
  const [accountInfo, setAccountInfo] = useState({});
  const [accountsInfo, setAccountsInfo] = useState({});
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        // User is signed in
        setCurrentUser(user);
        const isConnected = await NetInfo.fetch().then(
          (state) => state.isConnected
        );

        if (isConnected) {
          setIsConnected(true);

          // Fetch account details for the new user
          const docRef = doc(db, 'users', user.uid);
          getDoc(docRef)
            .then((docSnap) => {
              if (docSnap.exists()) {
                setAccountInfo(docSnap.data());

                // Listen for changes to the new user's family group
                const familyGroupRef = doc(
                  db,
                  'familyGroup',
                  docSnap.data().code
                );
                const familyGroupUnsubscribe = onSnapshot(
                  familyGroupRef,
                  (doc) => {
                    setAccountsInfo(doc.data());
                  }
                );

                // Set up cleanup function to unsubscribe from family group updates
                return () => {
                  familyGroupUnsubscribe();
                };
              }
            })
            .catch((error) => {
              console.log('Error fetching account details:', error);
            });
        } else {
          // User is online but Firebase is experiencing network errors
          console.log(
            'Firebase is experiencing network errors. Retrying in 5 seconds...'
          );
          setTimeout(() => {
            // Retry fetching data
            console.log('Retrying...');
            unsubscribe();
            unsubscribe();
          }, 5000);
        }
      } else {
        // User is signed out
        setIsConnected(false);
        setLoggedIn(false);
        setCurrentUser({});
        setAccountInfo({});
        setAccountsInfo({});
      }
    });

    return () => {
      unsubscribe();
    };
  }, []);

  // Provide context values to child components
  return (
    <AuthContext.Provider value={{ currentUser }}>
      <LoginContext.Provider value={{ loggedIn, setLoggedIn }}>
        <AccountContext.Provider value={{ accountInfo, accountsInfo }}>
          {children}
        </AccountContext.Provider>
      </LoginContext.Provider>
    </AuthContext.Provider>
  );
};
