import React, { useEffect, useRef } from 'react';
import { View } from 'react-native';
import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants/Colors';
import { useNotificationSetup } from '@/hooks/useNotificationSetup';
import { useNetworkState } from '@/hooks/useNetworkState';
import { OfflineBanner } from '@/components/ui/OfflineBanner';
import { processMutationQueue } from '@/lib/mutation-queue';

type TabIconName = React.ComponentProps<typeof Ionicons>['name'];

function TabIcon({ name, color }: { name: TabIconName; color: string }) {
  return <Ionicons name={name} size={24} color={color} />;
}

export default function TabLayout() {
  useNotificationSetup();

  const { isConnected } = useNetworkState();
  const wasOffline = useRef(false);

  // Drain mutation queue when coming back online
  useEffect(() => {
    if (!isConnected) {
      wasOffline.current = true;
      return;
    }
    if (wasOffline.current) {
      wasOffline.current = false;
      processMutationQueue().catch(console.warn);
    }
  }, [isConnected]);

  return (
    <View style={{ flex: 1 }}>
      {!isConnected && <OfflineBanner />}
      <Tabs
        screenOptions={{
          tabBarActiveTintColor: Colors.accent,
          tabBarInactiveTintColor: Colors.textSecondary,
          tabBarStyle: {
            backgroundColor: Colors.card,
            borderTopColor: Colors.border,
            borderTopWidth: 1,
            height: 85,
            paddingBottom: 25,
            paddingTop: 8,
          },
          headerStyle: {
            backgroundColor: Colors.background,
          },
          headerTintColor: Colors.text,
          headerShadowVisible: false,
        }}
      >
        <Tabs.Screen
          name="index"
          options={{
            title: 'Today',
            tabBarIcon: ({ color }) => <TabIcon name="today-outline" color={color} />,
          }}
        />
        <Tabs.Screen
          name="sprint"
          options={{
            title: 'Sprint',
            tabBarIcon: ({ color }) => <TabIcon name="flash-outline" color={color} />,
          }}
        />
        <Tabs.Screen
          name="score"
          options={{
            title: 'Score',
            tabBarIcon: ({ color }) => <TabIcon name="trending-up-outline" color={color} />,
          }}
        />
        {/* Hidden legacy tabs — kept for Expo Router file matching, not shown in tab bar */}
        <Tabs.Screen
          name="habits"
          options={{ href: null }}
        />
        <Tabs.Screen
          name="journal"
          options={{ href: null }}
        />
        <Tabs.Screen
          name="focus"
          options={{ href: null }}
        />
        <Tabs.Screen
          name="insights"
          options={{ href: null }}
        />
        <Tabs.Screen
          name="profile"
          options={{ href: null }}
        />
      </Tabs>
    </View>
  );
}
