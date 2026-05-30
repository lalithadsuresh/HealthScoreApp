import { Redirect, Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LoadingCenter } from '../../src/components/ui';
import { useAuth } from '../../src/context/AuthContext';
import { colors } from '../../src/theme';

export default function TabsLayout() {
  const { user, loading } = useAuth();

  if (loading) return <LoadingCenter />;
  if (!user) return <Redirect href="/" />;
  if (!user.onboardingComplete) return <Redirect href="/(onboarding)/primary" />;

  return (
    <Tabs
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
