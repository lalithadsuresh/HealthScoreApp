import { Stack } from 'expo-router';

export default function OnboardingLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: true,
        headerBackTitle: 'Back',
        headerTintColor: '#0d9488',
        gestureEnabled: false,
      }}
    >
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen name="primary" options={{ title: 'Your goal' }} />
      <Stack.Screen name="focus" options={{ title: 'Focus areas' }} />
      <Stack.Screen name="priorities" options={{ title: 'Priorities' }} />
      <Stack.Screen name="ingredients" options={{ title: 'Ingredients' }} />
      <Stack.Screen name="goals" options={{ title: 'Your goals' }} />
      <Stack.Screen name="sliders" options={{ title: 'Importance' }} />
    </Stack>
  );
}
