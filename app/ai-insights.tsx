import { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  SafeAreaView,
  ActivityIndicator,
  TouchableOpacity,
} from 'react-native';
import { useRouter } from 'expo-router';
import { supabase } from '@/lib/supabase';
import { useAppStore } from '@/store/useAppStore';
import { useSubscription } from '@/hooks/useSubscription';
import { PaywallModal } from '@/components/ui/PaywallModal';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Colors } from '@/constants/Colors';

interface Insight {
  title: string;
  body: string;
  type: 'observation' | 'suggestion' | 'correlation';
}

export default function AIInsightsScreen() {
  const router = useRouter();
  const session = useAppStore((s) => s.session);
  const { isPro } = useSubscription();
  const [insights, setInsights] = useState<Insight[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPaywall, setShowPaywall] = useState(false);

  const fetchInsights = useCallback(async () => {
    if (!session?.user?.id) return;
    setLoading(true);
    setError('');

    try {
      const { data, error: fnError } = await supabase.functions.invoke('ai-insights', {
        body: { user_id: session.user.id },
      });

      if (fnError) throw fnError;

      if (data?.insights && Array.isArray(data.insights)) {
        setInsights(data.insights);
      } else {
        setInsights([]);
      }
    } catch (e) {
      console.error('Error fetching AI insights:', e);
      setError('Could not generate insights. Please try again.');
      // Show fallback insights based on local data
      setInsights(getLocalInsights());
    } finally {
      setLoading(false);
    }
  }, [session?.user?.id]);

  useEffect(() => {
    if (isPro) {
      fetchInsights();
    }
  }, [isPro, fetchInsights]);

  if (!isPro) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} accessibilityLabel="Go back">
            <Text style={styles.backBtn}>{'\u2190'} Back</Text>
          </TouchableOpacity>
          <Text style={styles.title}>AI Insights</Text>
        </View>
        <View style={styles.lockedContainer}>
          <Text style={styles.lockedIcon}>{'\uD83E\uDDE0'}</Text>
          <Text style={styles.lockedTitle}>AI-Powered Analysis</Text>
          <Text style={styles.lockedSubtext}>
            Get personalized insights from your habits, journal, and focus data,
            powered by Claude AI.
          </Text>
          <Button
            title="Upgrade to Pro"
            onPress={() => setShowPaywall(true)}
            accessibilityLabel="Upgrade to Pro"
          />
        </View>
        <PaywallModal
          visible={showPaywall}
          onClose={() => setShowPaywall(false)}
          onPurchased={() => {}}
        />
      </SafeAreaView>
    );
  }

  const TYPE_ICONS: Record<string, string> = {
    observation: '\uD83D\uDD0D',
    suggestion: '\uD83D\uDCA1',
    correlation: '\uD83D\uDD17',
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} accessibilityLabel="Go back">
            <Text style={styles.backBtn}>{'\u2190'} Back</Text>
          </TouchableOpacity>
          <Text style={styles.title}>AI Insights</Text>
          <Text style={styles.subtitle}>
            Personalized analysis from your data
          </Text>
        </View>

        {loading && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={Colors.accent} />
            <Text style={styles.loadingText}>Analyzing your patterns...</Text>
          </View>
        )}

        {error ? (
          <Card style={styles.errorCard}>
            <Text style={styles.errorText}>{error}</Text>
            <Button title="Retry" onPress={fetchInsights} variant="outline" />
          </Card>
        ) : null}

        {insights.map((insight, idx) => (
          <Card key={idx} style={styles.insightCard}>
            <View style={styles.insightHeader}>
              <Text style={styles.insightIcon}>
                {TYPE_ICONS[insight.type] ?? '\uD83D\uDCA1'}
              </Text>
              <Text style={styles.insightType}>{insight.type}</Text>
            </View>
            <Text style={styles.insightTitle}>{insight.title}</Text>
            <Text style={styles.insightBody}>{insight.body}</Text>
          </Card>
        ))}

        {!loading && insights.length > 0 && (
          <Button
            title="Refresh Insights"
            onPress={fetchInsights}
            variant="outline"
            style={styles.refreshBtn}
          />
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

function getLocalInsights(): Insight[] {
  return [
    {
      title: 'Build your data history',
      body: 'Complete habits and log journal entries for at least 7 days to unlock personalized AI insights. The more data you provide, the better the analysis.',
      type: 'suggestion',
    },
    {
      title: 'Consistency beats intensity',
      body: 'Research shows that doing a habit 80% of days is more effective than doing it perfectly some weeks and skipping others. Focus on showing up every day, even if the effort is small.',
      type: 'observation',
    },
  ];
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scroll: {
    padding: 20,
    paddingBottom: 40,
  },
  header: {
    marginBottom: 20,
  },
  backBtn: {
    color: Colors.accent,
    fontSize: 15,
    fontWeight: '500',
    marginBottom: 16,
  },
  title: {
    fontSize: 26,
    fontWeight: '800',
    color: Colors.text,
  },
  subtitle: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginTop: 6,
  },
  lockedContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
    gap: 12,
  },
  lockedIcon: {
    fontSize: 48,
  },
  lockedTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: Colors.text,
  },
  lockedSubtext: {
    fontSize: 15,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 12,
  },
  loadingContainer: {
    alignItems: 'center',
    paddingVertical: 40,
    gap: 12,
  },
  loadingText: {
    color: Colors.textSecondary,
    fontSize: 14,
  },
  errorCard: {
    marginBottom: 16,
    alignItems: 'center',
    gap: 12,
  },
  errorText: {
    color: Colors.danger,
    fontSize: 14,
    textAlign: 'center',
  },
  insightCard: {
    marginBottom: 12,
  },
  insightHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 8,
  },
  insightIcon: {
    fontSize: 16,
  },
  insightType: {
    color: Colors.accent,
    fontSize: 11,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  insightTitle: {
    color: Colors.text,
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 6,
  },
  insightBody: {
    color: Colors.textSecondary,
    fontSize: 14,
    lineHeight: 20,
  },
  refreshBtn: {
    marginTop: 8,
  },
});
