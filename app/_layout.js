import { Stack } from 'expo-router';
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import { KeyboardAvoidingView, Platform } from "react-native";
import "../global.css";
import { AuthProvider } from "../auth/AuthContext";
import Toast from 'react-native-toast-message';
import { StatusBar } from 'expo-status-bar';
import { Provider } from 'react-redux';
import { store } from '../redux/store';

export default function RootLayout() {
  return (
    <Provider store={store}>
      <SafeAreaProvider>
        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === "ios" ? "padding" : undefined}
          keyboardVerticalOffset={Platform.OS === "ios" ? 60 : 0}
        >
          <AuthProvider>
            <StatusBar backgroundColor="white" translucent={false} />
            <SafeAreaView style={{ flex: 1, backgroundColor: '#eeeeee' }}>
              <Stack screenOptions={{ headerShown: false }}>
                <Stack.Screen name="index" options={{ headerShown: false }} />
                <Stack.Screen name="(auth)" options={{ headerShown: false }} />
                <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
              </Stack>
            </SafeAreaView>
            <Toast topOffset={60} containerStyle={{
              zIndex: 9999,        // Make Toast appear above everything
              elevation: 9999,     // Android support
            }} />
          </AuthProvider>
        </KeyboardAvoidingView>
      </SafeAreaProvider>
    </Provider>
  );
}