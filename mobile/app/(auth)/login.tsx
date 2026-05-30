import { useRouter } from 'expo-router';
import { useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { Button, Card, ErrorBanner, Input, Subtitle, Title } from '../../src/components/ui';
import { useAuth } from '../../src/context/AuthContext';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const router = useRouter();

  const submit = async () => {
    setError('');
    setLoading(true);
    try {
      const u = await login(email.trim(), password);
      if (u.onboardingComplete) router.replace('/(tabs)');
      else router.replace('/(onboarding)/primary');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Login failed');
    } finally {
      setLoading(false);
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
          <Button label="Log in" onPress={submit} loading={loading} disabled={!email || !password} />
        </Card>
        <Button label="Create account" variant="ghost" onPress={() => router.push('/(auth)/signup')} />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
