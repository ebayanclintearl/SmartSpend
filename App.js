// Imports
import {
  configureFonts,
  DefaultTheme,
  MD3LightTheme,
  Provider as PaperProvider,
} from 'react-native-paper';
import { NavigationContainer } from '@react-navigation/native';
import MainStack from './routes/MainStack';
import { AppContextProvider } from './Helper/Context';
import { fontConfig } from './Helper/FontConfig';

// The App component is the entry point of the application.
export default function App() {
  // App theme configuration
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
          <MainStack />
        </NavigationContainer>
      </PaperProvider>
    </AppContextProvider>
  );
}
