import { useEffect, useState } from 'react';
import { Stack, useRouter, useSegments } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useFonts } from 'expo-font';
import { StatusBar } from 'expo-status-bar';
import { supabase } from '@/lib/supabase';
import { initRevenueCat } from '@/lib/revenuecat';
import { useAppStore } from '@/store/useAppStore';
import { MOCK_PROFILE, MOCK_HABITS } from '@/lib/mock-data';
import 'react-native-reanimated';

export { ErrorBoundary } from 'expo-router';

// Set to true to skip auth and use mock data for demos
const DEMO_MODE = process.env.EXPO_PUBLIC_SUPABASE_URL === undefined || process.env.EXPO_PUBLIC_SUPABASE_URL === '';

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

export default function RootLayout() {
  const [loaded, error] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });
  const { session, setSession, setProfile, setHabits } = useAppStore();
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    if (error) throw error;
  }, [error]);

  useEffect(() => {
    if (DEMO_MODE) {
      // Demo mode: skip Supabase auth, load mock data
      setSession({ user: { id: MOCK_PROFILE.id } });
      setProfile(MOCK_PROFILE);
      setHabits(MOCK_HABITS);
      setIsReady(true);
      return;
    }

    supabase.auth.getSession().then(({ data: { session: s } }) => {
      setSession(s ? { user: { id: s.user.id } } : null);
      if (s) {
        fetchProfile(s.user.id);
        initRevenueCat(s.user.id).catch(console.warn);
      }
      setIsReady(true);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, s) => {
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
      const { data, error } = await supabase
        .from('profiles')
        .select('id, display_name, timezone, onboarding_completed, subscription_tier, created_at')
        .eq('id', userId)
        .single();

      if (error) {
        console.error('Error fetching profile:', error.message);
        return;
      }
      if (data) {
        setProfile(data);
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
