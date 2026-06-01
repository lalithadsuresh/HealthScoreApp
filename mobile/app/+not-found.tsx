import { Stack, usePathname, useRouter } from 'expo-router';
import { useEffect } from 'react';
import { LoadingCenter } from '../src/components/ui';
import { WELCOME_ROUTE, isSameRoute } from '../src/constants/routes';

export default function NotFound() {
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (isSameRoute(pathname, WELCOME_ROUTE)) return;
    if (__DEV__) {
      console.log('[not-found] redirect', { pathname, redirectTarget: WELCOME_ROUTE });
    }
    router.replace(WELCOME_ROUTE);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- router ref is unstable
  }, [pathname]);

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <LoadingCenter />
    </>
  );
}
