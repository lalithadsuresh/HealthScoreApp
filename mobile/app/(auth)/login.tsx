import { useRouter } from 'expo-router';
import { useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { getApiUrl } from '../../src/api/client';
import { Button, Card, ErrorBanner, Input, Subtitle, Title } from '../../src/components/ui';
import { HOME_ROUTE, ONBOARDING_PRIMARY_ROUTE } from '../../src/constants/routes';
import { useAuth } from '../../src/context/AuthContext';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const { login } = useAuth();
  const router = useRouter();

  const submit = async () => {
    setError('');
    setSubmitting(true);
    console.log('[3Bite] login started (LoginScreen)');
    console.log('[3Bite] API URL being called:', getApiUrl('/auth/login'));

    try {
      const u = await login(email.trim(), password);
      console.log('[3Bite] response received (LoginScreen)');
      if (u.onboardingComplete) router.replace(HOME_ROUTE);
      else router.replace(ONBOARDING_PRIMARY_ROUTE);
    } catch (e) {
      console.log('[3Bite] error caught (LoginScreen)', e);
      const message = e instanceof Error ? e.message : 'Login failed';
      setError(message || 'Login failed');
    } finally {
      console.log('[3Bite] finally reached (LoginScreen)');
      setSubmitting(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView contentContainerStyle={{ padding: 16, flexGrow: 1 }}>
        <Title>Welcome back</Title>
        <Subtitle>Sign in to continue scanning with your goal-based scores.</Subtitle>
        <ErrorBanner message={error} />
        <Card>
          <Input label="Email" value={email} onChangeText={setEmail} autoCapitalize="none" keyboardType="email-address" />
          <Input label="Password" value={password} onChangeText={setPassword} secureTextEntry />
          <Button label="Log in" onPress={submit} loading={submitting} disabled={!email || !password || submitting} />
        </Card>
        <Button label="Create account" variant="ghost" onPress={() => router.push('/(auth)/signup')} />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
