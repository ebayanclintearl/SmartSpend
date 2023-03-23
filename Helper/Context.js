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
  const [isLoading, setIsLoading] = useState(true);
  const [isResourcesLoaded, setIsResourcesLoaded] = useState(false);
  const [onboardingComplete, setOnboardingComplete] = useState(false);
  const [displaySignUpSuccess, setDisplaySignUpSuccess] = useState(false);

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

    const loadResources = async () => {
      try {
        await SplashScreen.preventAutoHideAsync();
        await Font.loadAsync(fonts);
        await checkOnboardingStatus();
        await SplashScreen.hideAsync();
        setIsResourcesLoaded(true);
      } catch (e) {
        console.warn(e);
      }
    };

    loadResources();
  }, []);
  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener((state) => {
      setIsConnected(state.isConnected);
    });

    return () => {
      unsubscribe();
    };
  }, []);

  const fetchOnlineData = async (userAuth) => {
    try {
      const userRef = doc(db, 'users', userAuth.uid);
      const userDoc = await getDoc(userRef);
      if (userDoc.exists()) {
        const user = userDoc.data();
        const codeRef = doc(db, 'familyCodes', user.code.toString());
        const unsubscribe = onSnapshot(
          codeRef,
          (doc) => {
            if (doc.exists()) {
              setUserAccount(user);
              setFamilyCode(doc.data());
            } else {
              setFamilyCode({});
            }
          },
          (error) => {
            console.log('FamilyCode error occurred:', error.code);
          }
        );
        return () => unsubscribe();
      }
    } catch (error) {
      console.log('Error fetching user:', error);
      if (error.code === 'unavailable') {
        console.log('Network Error while fetching the user');
      }
    }
  };
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
      }
    });
    return unsubscribe;
  }, []);

  if (!isResourcesLoaded) {
    return null;
  } else if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator animating={true} color="black" />
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
        displaySignUpSuccess,
        setDisplaySignUpSuccess,
        onboardingComplete,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};
