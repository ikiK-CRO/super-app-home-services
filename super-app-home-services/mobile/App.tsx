import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { Platform, View, LogBox } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Provider as PaperProvider } from 'react-native-paper';
import { NavigationContainer } from '@react-navigation/native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { AuthProvider } from './src/contexts/AuthContext';
import AppNavigator from './src/navigation';
import { paperTheme, navigationTheme } from './src/theme';

// Silence specific warnings that you can't fix easily
LogBox.ignoreLogs([
  'VirtualizedLists should never be nested',
  'Non-serializable values were found in the navigation state',
  // Add any other specific warnings here
]);

export default function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <PaperProvider theme={paperTheme}>
          <NavigationContainer theme={navigationTheme}>
            <AuthProvider>
              <StatusBar style="auto" key="statusBar" />
              <View style={{ flex: 1, paddingTop: Platform.OS === 'ios' ? 5 : 0 }}>
                <AppNavigator />
              </View>
            </AuthProvider>
          </NavigationContainer>
        </PaperProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
} 