import * as React from 'react';
import { Provider as PaperProvider } from 'react-native-paper';
import { NavigationContainer } from '@react-navigation/native';
import HomeStack from './routes/HomeStack';
import { AuthContext } from './Helper/Context';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from './config';
export default function App() {
  const [loggedIn, setLoggedIn] = React.useState(false);
  // React.useEffect(() => {
  //   const unsub = onAuthStateChanged(auth, (user) => {
  //     setCurrentUser(user);
  //   });
  //   return () => {
  //     unsub();
  //   };
  // }, []);

  return (
    <AuthContext.Provider value={{ loggedIn, setLoggedIn }}>
      <PaperProvider>
        <NavigationContainer>
          <HomeStack />
        </NavigationContainer>
      </PaperProvider>
    </AuthContext.Provider>
  );
}
