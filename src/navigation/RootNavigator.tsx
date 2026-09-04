import React from 'react';
import { ActivityIndicator, Platform, View } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useAuth } from '../auth/AuthContext';
import { AppIcon } from '../components/AppIcon';
import { LoginScreen } from '../screens/LoginScreen';
import { HomeScreen } from '../screens/HomeScreen';
import { TasksScreen } from '../screens/TasksScreen';
import { TeamScreen } from '../screens/TeamScreen';
import { InboxScreen } from '../screens/InboxScreen';
import { ProfileScreen } from '../screens/ProfileScreen';
import { colors, shadows } from '../theme';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.primaryDeep,
        tabBarInactiveTintColor: colors.muted,
        tabBarStyle: {
          backgroundColor: colors.surface,
          borderTopWidth: 0,
          height: Platform.OS === 'ios' ? 84 : 68,
          paddingBottom: Platform.OS === 'ios' ? 24 : 10,
          paddingTop: 8,
          ...shadows.sm,
        },
        tabBarLabelStyle: { fontSize: 11, fontWeight: '600', marginTop: 2 },
        animation: 'shift',
      }}>
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          tabBarLabel: 'Today',
          tabBarIcon: ({ color, size, focused }) => (
            <View style={{ opacity: focused ? 1 : 0.85 }}>
              <AppIcon name="home" size={size - 1} color={color} />
            </View>
          ),
        }}
      />
      <Tab.Screen
        name="Tasks"
        component={TasksScreen}
        options={{
          title: 'Tasks',
          tabBarIcon: ({ color, size, focused }) => (
            <View style={{ opacity: focused ? 1 : 0.85 }}>
              <AppIcon name="check-square" size={size - 1} color={color} />
            </View>
          ),
        }}
      />
      <Tab.Screen
        name="Team"
        component={TeamScreen}
        options={{
          tabBarIcon: ({ color, size, focused }) => (
            <View style={{ opacity: focused ? 1 : 0.85 }}>
              <AppIcon name="users" size={size - 1} color={color} />
            </View>
          ),
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          tabBarIcon: ({ color, size, focused }) => (
            <View style={{ opacity: focused ? 1 : 0.85 }}>
              <AppIcon name="user" size={size - 1} color={color} />
            </View>
          ),
        }}
      />
    </Tab.Navigator>
  );
}

function MainStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Tabs" component={MainTabs} />
      <Stack.Screen
        name="Inbox"
        component={InboxScreen}
        options={{
          presentation: 'modal',
          animation: 'slide_from_bottom',
          gestureEnabled: true,
        }}
      />
    </Stack.Navigator>
  );
}

export function RootNavigator() {
  const { bootstrapping, token } = useAuth();

  if (bootstrapping) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.bg }}>
        <ActivityIndicator color={colors.primary} size="large" />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
          animation: 'fade_from_bottom',
        }}>
        {token ? (
          <Stack.Screen name="Main" component={MainStack} />
        ) : (
          <Stack.Screen name="Login" component={LoginScreen} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
