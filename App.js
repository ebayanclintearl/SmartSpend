import { useEffect, useState } from 'react';
import { Provider as PaperProvider } from 'react-native-paper';
import { NavigationContainer } from '@react-navigation/native';
import HomeStack from './routes/HomeStack';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from './config';
import { AuthContext, LoginContext } from './Helper/Context';
export default function App() {
  const [loggedIn, setLoggedIn] = useState(false);
  const [currentUser, setCurrentUser] = useState({});
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
    });
    return () => {
      unsub();
    };
  }, []);

  return (
    <AuthContext.Provider value={{ currentUser }}>
      <LoginContext.Provider value={{ loggedIn, setLoggedIn }}>
        <PaperProvider>
          <NavigationContainer>
            <HomeStack />
          </NavigationContainer>
        </PaperProvider>
      </LoginContext.Provider>
    </AuthContext.Provider>
  );
}
