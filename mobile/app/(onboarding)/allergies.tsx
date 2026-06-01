import { Redirect } from 'expo-router';

/** Allergies removed — redirect old route to final onboarding step. */
export default function AllergiesRedirect() {
  return <Redirect href="/(onboarding)/ingredients" />;
}
