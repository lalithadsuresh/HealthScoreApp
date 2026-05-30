import { Stack } from 'expo-router';

export default function LegalLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: true,
        headerTintColor: '#0d9488',
        headerBackTitle: 'Back',
      }}
    />
  );
}
