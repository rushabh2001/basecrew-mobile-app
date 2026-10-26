import React from 'react';
import { StatusBar } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AuthProvider } from './src/auth/AuthContext';
import { DateTimePickerProvider } from './src/components/DateTimePickerHost';
import { RootNavigator } from './src/navigation/RootNavigator';
import { colors } from './src/theme';

function App(): React.JSX.Element {
  return (
    <SafeAreaProvider>
      <AuthProvider>
        <DateTimePickerProvider>
          <StatusBar barStyle="dark-content" backgroundColor={colors.bg} translucent={false} />
          <RootNavigator />
        </DateTimePickerProvider>
      </AuthProvider>
    </SafeAreaProvider>
  );
}

export default App;
