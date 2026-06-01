import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useRequireAuth } from '../../src/hooks/useAuthNavigation';
import { colors } from '../../src/theme';

export default function TabsLayout() {
  const { blocked } = useRequireAuth();
  if (blocked) return null;

  return (
    <Tabs
      initialRouteName="index"
      screenOptions={{
        headerShown: true,
        headerTintColor: colors.primary,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.muted,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color, size }) => <Ionicons name="home" size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="scan"
        options={{
          title: 'Scan',
          tabBarIcon: ({ color, size }) => <Ionicons name="barcode" size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color, size }) => <Ionicons name="person" size={size} color={color} />,
        }}
      />
    </Tabs>
  );
}
