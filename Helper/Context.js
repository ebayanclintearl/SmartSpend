import { createContext, useState, useEffect } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth, db } from '../config';
import { doc, getDoc, onSnapshot } from 'firebase/firestore';
import NetInfo from '@react-native-community/netinfo';
import { fonts } from './FontConfig';
import * as Font from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';
import { View } from 'react-native';
import { ActivityIndicator } from 'react-native-paper';

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
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadFontsAndFetchData = async () => {
      try {
        await SplashScreen.preventAutoHideAsync();
        await Font.loadAsync(fonts);
        await SplashScreen.hideAsync();
      } catch (e) {
        console.warn(e);
      }
    };

    loadFontsAndFetchData();
  }, []);

  useEffect(() => {
    let unsubscribe;
    let retryCount = 0;
    const retryInterval = 5000; // 5 seconds
    const maxRetryCount = 3; // Maximum number of retries

    const fetchData = async (user) => {
      try {
        // Fetch account details for the new user
        const docRef = doc(db, 'users', user.uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setAccountInfo(docSnap.data());

          // Listen for changes to the new user's family group
          const familyGroupRef = doc(db, 'familyGroup', docSnap.data().code);
          const familyGroupUnsubscribe = onSnapshot(
            familyGroupRef,
            (doc) => {
              setAccountsInfo(doc.data());
            },
            (error) => {
              console.log('FamilyGroup error occurred2:', error.code);
            }
          );

          // Set up cleanup function to unsubscribe from family group updates
          return () => {
            familyGroupUnsubscribe();
          };
        }
      } catch (error) {
        console.log('Error occurred2:', error.code);
        // Retry fetching data if error is due to network issues and retry count is less than the maximum
        if (error.code === 'unavailable' && retryCount < maxRetryCount) {
          retryCount++;
          console.log(
            `Firebase is experiencing network errors. Retrying in ${
              retryInterval / 1000
            } seconds...`
          );
          setTimeout(() => {
            console.log('Retrying...');
            fetchData(user);
          }, retryInterval);
        }
      } finally {
        console.log('finally');
        setIsLoading(false);
      }
    };

    const authStateChanged = async (user) => {
      try {
        if (user) {
          // User is signed in
          setCurrentUser(user);
          const isConnected = await NetInfo.fetch().then(
            (state) => state.isConnected
          );

          if (isConnected) {
            setIsConnected(true);
            fetchData(user);
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
            }, retryInterval);
          }
        } else {
          // User is signed out
          setIsConnected(false);
          setLoggedIn(false);
          setCurrentUser({});
          setAccountInfo({});
          setAccountsInfo({});
        }
      } catch (error) {
        console.log('Error occurred:', error);
      } finally {
        setIsLoading(false);
      }
    };

    unsubscribe = onAuthStateChanged(auth, authStateChanged);

    return () => {
      unsubscribe();
    };
  }, []);

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator animating={true} color="black" />
      </View>
    );
  }

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
