import { useEffect, useState } from 'react';
import { Stack, useRouter, useSegments } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useFonts } from 'expo-font';
import { StatusBar } from 'expo-status-bar';
import { initRevenueCat } from '@/lib/revenuecat';
import { useAppStore } from '@/store/useAppStore';
import { DataProviderRoot, useData } from '@/lib/data-provider';
import { AppErrorBoundary } from '@/components/ErrorBoundary';
import 'react-native-reanimated';

export { ErrorBoundary } from 'expo-router';

SplashScreen.preventAutoHideAsync();

function useProtectedRoute(session: { user: { id: string } } | null) {
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    const inAuthGroup = segments[0] === '(auth)';

    if (!session && !inAuthGroup) {
      router.replace('/(auth)/login');
    } else if (session && inAuthGroup) {
      router.replace('/(tabs)');
    }
  }, [session, segments]);
}

function RootLayoutInner() {
  const [loaded, error] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });
  const { session, setSession, setProfile, setHabits } = useAppStore();
  const [isReady, setIsReady] = useState(false);
  const data = useData();

  useEffect(() => {
    if (error) throw error;
  }, [error]);

  useEffect(() => {
    if (data.isDemoMode) {
      // Demo mode: load mock data via the provider
      data.getSession().then((s) => {
        setSession(s);
        if (s) {
          data.fetchProfile(s.user.id).then((p) => {
            if (p) setProfile(p);
          });
          data.fetchHabits(s.user.id).then((h) => {
            setHabits(h);
          });
        }
        setIsReady(true);
      });
      return;
    }

    // Real mode: use Supabase auth
    const { supabase } = require('@/lib/supabase');

    supabase.auth.getSession().then(({ data: { session: s } }: { data: { session: { user: { id: string } } | null } }) => {
      setSession(s ? { user: { id: s.user.id } } : null);
      if (s) {
        fetchProfile(s.user.id);
        initRevenueCat(s.user.id).catch(console.warn);
      }
      setIsReady(true);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event: string, s: { user: { id: string } } | null) => {
      setSession(s ? { user: { id: s.user.id } } : null);
      if (s) {
        fetchProfile(s.user.id);
      } else {
        setProfile(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  async function fetchProfile(userId: string) {
    try {
      const profile = await data.fetchProfile(userId);
      if (profile) {
        setProfile(profile);
      } else {
        // Profile doesn't exist yet — create one
        const newProfile = await data.createProfile(userId, 'User');
        if (newProfile) {
          setProfile(newProfile);
        }
      }
    } catch (err) {
      console.error('Error fetching profile:', err);
    }
  }

  useEffect(() => {
    if (loaded && isReady) {
      SplashScreen.hideAsync();
    }
  }, [loaded, isReady]);

  useProtectedRoute(session);

  if (!loaded || !isReady) {
    return null;
  }

  return (
    <>
      <StatusBar style="light" />
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(auth)" />
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="protocols" options={{ presentation: 'modal' }} />
        <Stack.Screen name="ai-insights" options={{ presentation: 'modal' }} />
        <Stack.Screen name="privacy-policy" options={{ presentation: 'modal' }} />
      </Stack>
    </>
  );
}

export default function RootLayout() {
  return (
    <AppErrorBoundary>
      <DataProviderRoot>
        <RootLayoutInner />
      </DataProviderRoot>
    </AppErrorBoundary>
  );
}
