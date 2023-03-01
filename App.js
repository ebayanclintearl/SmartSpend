import {
  configureFonts,
  DefaultTheme,
  MD3LightTheme,
  Provider as PaperProvider,
} from 'react-native-paper';
import { NavigationContainer } from '@react-navigation/native';
import HomeStack from './routes/HomeStack';
import { AppContextProvider } from './Helper/Context';
import { useFonts } from 'expo-font';
import { fontConfig, fonts } from './Helper/FontConfig';
export default function App() {
  const [fontsLoaded] = useFonts(fonts);
  const theme = {
    ...DefaultTheme,
    dark: false,
    mode: 'exact',
    fonts: fontsLoaded
      ? configureFonts({
          config: fontConfig,
        })
      : configureFonts({}),
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
