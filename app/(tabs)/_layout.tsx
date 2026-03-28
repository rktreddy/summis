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
  // Expose registerIfNeeded — called by useHabits on first completion
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
          name="habits"
          options={{
            title: 'Habits',
            tabBarIcon: ({ color }) => <TabIcon name="checkmark-circle-outline" color={color} />,
          }}
        />
        <Tabs.Screen
          name="journal"
          options={{
            title: 'Journal',
            tabBarIcon: ({ color }) => <TabIcon name="book-outline" color={color} />,
          }}
        />
        <Tabs.Screen
          name="focus"
          options={{
            title: 'Focus',
            tabBarIcon: ({ color }) => <TabIcon name="timer-outline" color={color} />,
          }}
        />
        <Tabs.Screen
          name="insights"
          options={{
            title: 'Insights',
            tabBarIcon: ({ color }) => <TabIcon name="analytics-outline" color={color} />,
          }}
        />
        <Tabs.Screen
          name="profile"
          options={{
            title: 'Profile',
            tabBarIcon: ({ color }) => <TabIcon name="person-outline" color={color} />,
          }}
        />
      </Tabs>
    </View>
  );
}
