import { useEffect, useState } from 'react';
import { Stack, useRouter, useSegments } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useFonts } from 'expo-font';
import { StatusBar } from 'expo-status-bar';
import { initRevenueCat, configureRevenueCat, getActiveTier } from '@/lib/revenuecat';
import { initErrorLogging, setUser, clearUser } from '@/lib/error-logging';
import { useAppStore } from '@/store/useAppStore';
import { DataProviderRoot, useData } from '@/lib/data-provider';
import { AppErrorBoundary } from '@/components/ErrorBoundary';
import 'react-native-reanimated';

// Initialize Sentry as early as possible
initErrorLogging();

export { ErrorBoundary } from 'expo-router';

SplashScreen.preventAutoHideAsync();

function useProtectedRoute(
  session: { user: { id: string } } | null,
  profile: { onboarding_completed: boolean } | null
) {
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    const inAuthGroup = segments[0] === '(auth)';
    const inOnboarding = segments[0] === 'onboarding';

    if (!session && !inAuthGroup) {
      router.replace('/(auth)/login');
    } else if (session && inAuthGroup) {
      // After login, wait for profile to load before deciding
      if (!profile) return; // Profile still loading — don't redirect yet
      if (!profile.onboarding_completed) {
        router.replace('/onboarding');
      } else {
        router.replace('/(tabs)');
      }
    } else if (session && profile && !profile.onboarding_completed && !inOnboarding) {
      router.replace('/onboarding');
    }
  }, [session, profile, segments]);
}

function RootLayoutInner() {
  const [loaded, error] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });
  const {
    session, profile, setSession, setProfile, setHabits,
    setSprints, setMITs, setHygieneConfigs, setHygieneLogs,
  } = useAppStore();
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
          fetchSummisData(s.user.id);
        }
        setIsReady(true);
      });
      return;
    }

    // Real mode: use Supabase auth
    const { supabase } = require('@/lib/supabase');

    // Configure RevenueCat once at startup so getOfferings works even
    // when the user signs in after the initial session check.
    configureRevenueCat().catch(console.warn);

    supabase.auth.getSession().then(({ data: { session: s } }: { data: { session: { user: { id: string } } | null } }) => {
      setSession(s ? { user: { id: s.user.id } } : null);
      if (s) {
        fetchProfile(s.user.id);
        fetchSummisData(s.user.id);
        setUser(s.user.id);
        initRevenueCat(s.user.id).catch(console.warn);
      }
      setIsReady(true);
    }).catch((err: unknown) => {
      console.error('Failed to get session:', err);
      setSession(null);
      setIsReady(true);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event: string, s: { user: { id: string } } | null) => {
      setSession(s ? { user: { id: s.user.id } } : null);
      if (s) {
        fetchProfile(s.user.id);
        fetchSummisData(s.user.id);
        setUser(s.user.id);
        initRevenueCat(s.user.id).catch(console.warn);
      } else {
        setProfile(null);
        clearUser();
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
      // Mirror RevenueCat entitlement into local profile tier in case a
      // previous purchase's webhook hasn't reached Supabase yet.
      const rcTier = await getActiveTier();
      if (rcTier && rcTier !== 'free') {
        const current = useAppStore.getState().profile;
        if (current && current.subscription_tier === 'free') {
          setProfile({ ...current, subscription_tier: rcTier });
        }
      }
    } catch (err) {
      console.error('Error fetching profile:', err);
    }
  }

  async function fetchSummisData(userId: string) {
    try {
      const [sprints, mits, configs, logs] = await Promise.all([
        data.fetchSprints(userId),
        data.fetchMITs(userId),
        data.fetchHygieneConfigs(userId),
        data.fetchHygieneLogs(userId),
      ]);
      setSprints(sprints);
      setMITs(mits);
      setHygieneConfigs(configs);
      setHygieneLogs(logs);
    } catch (err) {
      console.error('Error loading Summis data:', err);
    }
  }

  useEffect(() => {
    if (loaded && isReady) {
      SplashScreen.hideAsync();
    }
  }, [loaded, isReady]);

  useProtectedRoute(session, profile);

  if (!loaded || !isReady) {
    return null;
  }

  return (
    <>
      <StatusBar style="light" />
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(auth)" />
        <Stack.Screen name="onboarding" options={{ gestureEnabled: false }} />
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="protocols" options={{ presentation: 'modal' }} />
        <Stack.Screen name="ai-insights" options={{ presentation: 'modal' }} />
        <Stack.Screen name="daily-plan" options={{ presentation: 'modal' }} />
        <Stack.Screen name="accountability" options={{ presentation: 'modal' }} />
        <Stack.Screen name="privacy-policy/index" options={{ presentation: 'modal' }} />
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
