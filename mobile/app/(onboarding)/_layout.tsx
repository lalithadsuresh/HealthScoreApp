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
      <Stack.Screen name="goals" options={{ title: 'Your goals' }} />
      <Stack.Screen name="sliders" options={{ title: 'Importance' }} />
          <Stack.Screen name="ingredients" options={{ title: 'Ingredients' }} />
    </Stack>
  );
}
