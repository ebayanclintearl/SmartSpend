import {
  configureFonts,
  DefaultTheme,
  MD3LightTheme,
  Provider as PaperProvider,
} from 'react-native-paper';
import { NavigationContainer } from '@react-navigation/native';
import HomeStack from './routes/HomeStack';
import { AppContextProvider } from './Helper/Context';
import * as Font from 'expo-font';
import { fontConfig, fonts } from './Helper/FontConfig';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect, useState } from 'react';
import AppSplashScreen from './screens/AppSplashScreen';
export default function App() {
  const [isReady, setIsReady] = useState(false);
  useEffect(() => {
    const loadFonts = async () => {
      try {
        await SplashScreen.preventAutoHideAsync();
        await Font.loadAsync(fonts);
        setIsReady(true);
        await SplashScreen.hideAsync();
      } catch (e) {
        console.warn(e);
      }
    };
    loadFonts();
  }, []);

  if (!isReady) return null;

  const theme = {
    ...DefaultTheme,
    dark: false,
    mode: 'exact',
    fonts: configureFonts({
      config: fontConfig,
    }),
    colors: {
      ...MD3LightTheme.colors,
      primary: '#38B6FF',
      primaryContainer: '#38B6FF',
      secondaryContainer: 'rgba(56,182,255,0.25)',
      background: '#FFFFFF',
    },
  };
  return (
    <AppContextProvider>
      <PaperProvider theme={theme}>
        <NavigationContainer>
          <HomeStack />
        </NavigationContainer>
      </PaperProvider>
    </AppContextProvider>
  );
}
