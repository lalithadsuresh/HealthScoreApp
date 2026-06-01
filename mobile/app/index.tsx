import { Redirect } from 'expo-router';
import { WELCOME_ROUTE } from '../src/constants/routes';

/** Root `/` — redirect to the welcome group so `router.replace("/")` and deep links resolve. */
export default function RootIndex() {
  return <Redirect href={WELCOME_ROUTE} />;
}
