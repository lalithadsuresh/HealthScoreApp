import { useRouter } from 'expo-router';
import { useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { Button, Card, Disclaimer, ErrorBanner, Input, Subtitle, Title } from '../../src/components/ui';
import { MEDICAL_DISCLAIMER } from '../../src/constants/goals';
import { useAuth } from '../../src/context/AuthContext';

export default function SignupScreen() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { signup } = useAuth();
  const router = useRouter();

  const submit = async () => {
    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }
    setError('');
    setLoading(true);
    try {
      await signup(name.trim(), email.trim(), password);
      router.replace('/(onboarding)/goals');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Signup failed');
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
        <Title>Create account</Title>
        <Subtitle>We store your nutrition preferences to personalize scores. Not medical advice.</Subtitle>
        <Disclaimer text={MEDICAL_DISCLAIMER} />
        <ErrorBanner message={error} />
        <Card>
          <Input label="Name" value={name} onChangeText={setName} />
          <Input label="Email" value={email} onChangeText={setEmail} autoCapitalize="none" keyboardType="email-address" />
          <Input label="Password" value={password} onChangeText={setPassword} secureTextEntry placeholder="6+ characters" />
          <Button label="Sign up" onPress={submit} loading={loading} disabled={!name || !email || !password} />
        </Card>
        <Button label="Already have an account? Log in" variant="ghost" onPress={() => router.push('/(auth)/login')} />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
