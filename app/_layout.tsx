
import { useColorScheme } from '@/hooks/useColorScheme';
import { LogtoConfig, LogtoProvider } from '@logto/rn';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import "react-native-gesture-handler";
import 'react-native-reanimated';
import 'react-native-url-polyfill/auto';


import { ChatWrapper } from '@/components/ChatWrapper';
import { StyleSheet } from 'react-native';
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaProvider } from "react-native-safe-area-context";
export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [loaded] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });

  if (!loaded) {
    // Async font loading only occurs in development.
    return null;
  }

  const config: LogtoConfig = {
    endpoint: process.env.EXPO_PUBLIC_LOGTO_ENDPOINT || 'https://default-endpoint.com',
    appId: process.env.EXPO_PUBLIC_LOGTO_APPID || 'default-app-id',
  };


  return (
    <LogtoProvider config={config}>
      <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
        <SafeAreaProvider>
          <GestureHandlerRootView style={styles.container}>
            <ChatWrapper>
              <Stack>
                <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
                <Stack.Screen name="+not-found" />
              </Stack>
              <StatusBar style="auto" />
            </ChatWrapper>
          </GestureHandlerRootView>

        </SafeAreaProvider>
      </ThemeProvider>
    </LogtoProvider>
  );
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});