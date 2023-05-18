// Imports
import { createContext, useState, useEffect } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth, db } from '../config';
import {
  collection,
  doc,
  getDoc,
  onSnapshot,
  query,
  where,
} from 'firebase/firestore';
import NetInfo from '@react-native-community/netinfo';
import { fonts } from './FontConfig';
import * as Font from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar, View } from 'react-native';
import { ActivityIndicator, Text } from 'react-native-paper';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Create context object
export const AppContext = createContext({
  loggedIn: false,
  currentUser: {},
  userAccount: {},
  familyCode: {},
  isConnected: true,
  onboardingComplete: false,
});

// Provider component that wraps the application and provides the context values
export const AppContextProvider = ({ children }) => {
  // Define state variables for context values
  const [loggedIn, setLoggedIn] = useState(false);
  const [currentUser, setCurrentUser] = useState({});
  const [userAccount, setUserAccount] = useState({});
  const [familyCode, setFamilyCode] = useState({});
  const [isConnected, setIsConnected] = useState(true);
  const [accounts, setAccounts] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [isResourcesLoaded, setIsResourcesLoaded] = useState(false);
  const [onboardingComplete, setOnboardingComplete] = useState(false);
  const [displaySignUpSuccess, setDisplaySignUpSuccess] = useState(false);
  const [errorFetchingUserData, setErrorFetchingUserData] = useState(false);
  const [balancePromptLimit, setBalancePromptLimit] = useState('0');

  // Loads resources and prevents the SplashScreen from automatically hiding.
  useEffect(() => {
    const loadResources = async () => {
      try {
        await SplashScreen.preventAutoHideAsync();
        await Font.loadAsync(fonts);
        await SplashScreen.hideAsync();
        setIsResourcesLoaded(true);
      } catch (e) {
        console.warn(e);
      }
    };

    loadResources();
  }, []);

  // Checks if the onboarding process is complete.
  useEffect(() => {
    const checkOnboardingStatus = async () => {
      try {
        const value = await AsyncStorage.getItem('onboardingComplete');
        if (value !== null && value === 'true') {
          setOnboardingComplete(true);
        }
      } catch (error) {
        console.log(error);
      }
    };

    checkOnboardingStatus();
  }, []);

  // This code block sets up a listener for changes in network connectivity
  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener((state) => {
      setIsConnected(state.isConnected);
    });

    return () => {
      unsubscribe();
    };
  }, []);

  // This code block fetches data from Firestore based on a user's authentication and family code,
  // sets state variables, and sets up listeners for changes to the family code and accounts.
  // It returns an unsubscribe function to clean up the listeners when the component unmounts.
  const fetchOnlineData = async (userAuth) => {
    try {
      const userRef = doc(db, 'users', userAuth.uid);
      const userDoc = await getDoc(userRef);
      if (userDoc.exists()) {
        const user = userDoc.data();
        setUserAccount(user);
        const codeRef = doc(db, 'familyCodes', user.familyCode.toString());
        const matchFamilyCodes = query(
          collection(db, 'users'),
          where('familyCode', '==', user.familyCode)
        );

        const familyCodeUnsubscribe = onSnapshot(
          codeRef,
          (doc) => {
            if (doc.exists()) {
              setFamilyCode(doc.data());
            } else {
              setFamilyCode({});
            }
          },
          (error) => {
            console.log('FamilyCode error occurred:', error.code);
          }
        );

        const accountsUnsubscribe = onSnapshot(
          matchFamilyCodes,
          (snapshot) => {
            const accounts = snapshot?.docs?.map((doc) => doc.data());
            setAccounts(accounts);
          },
          (error) => {
            console.log('Accounts error occurred:', error.code);
          }
        );

        return () => {
          familyCodeUnsubscribe();
          accountsUnsubscribe();
        };
      }
    } catch (error) {
      throw error;
    }
  };

  // This code block sets up a listener for changes in the authentication state using Firebase Auth
  // and updates the user's data accordingly based on their authentication status and network connectivity.
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      try {
        if (user) {
          // User is signed in
          setCurrentUser(user);

          if (isConnected) {
            setIsLoading(true);
            await fetchOnlineData(user);
            setIsLoading(false);
            setLoggedIn(true);
          } else {
            setErrorFetchingUserData(true);
            console.log('no internet connection');
          }
        } else {
          // User is signed out
          setIsLoading(false);
          setIsConnected(false);
          setLoggedIn(false);
          setCurrentUser({});
          setUserAccount({});
          setFamilyCode({});
        }
      } catch (error) {
        console.log(error);
        if (error.code === 'unavailable') {
          setErrorFetchingUserData(true);
          console.log('Network Error while fetching the user');
        }
      }
    });
    return unsubscribe;
  }, []);

  // This code block conditionally renders a loading indicator or an error message based on
  // the state of isLoading and errorFetchingUserData, and returns null if the resources have not yet been loaded.
  if (!isResourcesLoaded) {
    return null;
  } else if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <StatusBar
          backgroundColor="#FFFFFF"
          barStyle="dark-content"
          translucent={false}
        />
        <ActivityIndicator animating={true} color="black" />
      </View>
    );
  } else if (errorFetchingUserData) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <StatusBar
          backgroundColor="#FFFFFF"
          barStyle="dark-content"
          translucent={false}
        />
        <Text>Network Error: Restart The App</Text>
      </View>
    );
  }

  // Provide context values to child components
  return (
    <AppContext.Provider
      value={{
        loggedIn,
        setLoggedIn,
        currentUser,
        setCurrentUser,
        userAccount,
        setUserAccount,
        familyCode,
        setFamilyCode,
        isConnected,
        setIsConnected,
        accounts,
        setAccounts,
        displaySignUpSuccess,
        setDisplaySignUpSuccess,
        onboardingComplete,
        setOnboardingComplete,
        balancePromptLimit,
        setBalancePromptLimit,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};
