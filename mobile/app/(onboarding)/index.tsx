import { Redirect } from 'expo-router';

/** New story-based onboarding entry */
export default function OnboardingIndex() {
  return <Redirect href="/(onboarding)/primary" />;
}
