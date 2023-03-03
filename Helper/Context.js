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

  // Effect hook to listen for changes in user authentication state
  useEffect(() => {
    const authStateChange = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      if (user) {
        NetInfo.fetch().then((state) => {
          if (state.isConnected) {
            setLoggedIn(true);
          }
        });
      }
    });

    // Clean up function to unsubscribe from auth state changes
    return () => {
      authStateChange();
    };
  }, []);

  // Effect hook to fetch account details for the current user
  useEffect(() => {
    let isCancelled = false;

    const getAccountDetails = async () => {
      // Check that current user, database, and internet connection are available
      if (!currentUser?.uid || !db || !isConnected) return;

      try {
        const docRef = doc(db, 'users', currentUser.uid);
        const docSnap = await getDoc(docRef);

        // If document exists and component is still mounted, update accountInfo state
        if (!isCancelled && docSnap.exists()) {
          setAccountInfo(docSnap.data());
        }
      } catch (error) {
        console.error(error);
      }
    };

    // Call getAccountDetails if current user is available and internet connection is present
    currentUser?.uid && isConnected && getAccountDetails();

    // Clean up function to prevent state updates if component is unmounted before getAccountDetails completes
    return () => {
      isCancelled = true;
    };
  }, [currentUser, db, isConnected]);

  // Effect hook to listen for changes to the current account's family group
  useEffect(() => {
    // Check that accountInfo, accountInfo.code, database, and internet connection are available
    if (!accountInfo || !accountInfo.code || !db || !isConnected) return;

    let unsubscribe;

    const updateFamilyGroup = async () => {
      try {
        const docRef = doc(db, 'familyGroup', accountInfo.code);
        unsubscribe = onSnapshot(docRef, (doc) => {
          setAccountsInfo(doc.data());
        });
      } catch (error) {
        console.error(error);
      }
    };

    // Call updateFamilyGroup to start listening for updates
    updateFamilyGroup();

    // Clean up function to unsubscribe from family group updates
    return () => {
      unsubscribe && unsubscribe();
    };
  }, [accountInfo, db, isConnected]);

  // Effect hook to listen for changes in internet connectivity
  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener((state) => {
      setIsConnected(state.isConnected);
    });

    // Clean up function to unsubscribe from internet connectivity updates
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
