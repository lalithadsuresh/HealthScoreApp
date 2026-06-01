import { Redirect, Stack } from 'expo-router';
import { WELCOME_ROUTE } from '../src/constants/routes';

export default function NotFound() {
  return (
    <>
      <Stack.Screen options={{ title: 'Not found', headerShown: false }} />
      <Redirect href={WELCOME_ROUTE} />
    </>
  );
}
