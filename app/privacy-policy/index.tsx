import { ScrollView, Text, StyleSheet, SafeAreaView } from 'react-native';
import { Colors } from '@/constants/Colors';

const EFFECTIVE_DATE = 'March 18, 2026';
const CONTACT_EMAIL = 'privacy@summis.app';

export default function PrivacyPolicyScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <Text style={styles.title}>Privacy Policy</Text>
        <Text style={styles.date}>Effective Date: {EFFECTIVE_DATE}</Text>

        <Text style={styles.body}>
          Summis ("we", "us", or "our") operates the Summis mobile application
          (the "App"). This Privacy Policy describes how we collect, use, and
          share information when you use the App.
        </Text>

        <Text style={styles.heading}>1. Information We Collect</Text>
        <Text style={styles.body}>
          <Text style={styles.bold}>Account Information:</Text> When you create
          an account, we collect your email address, display name, and timezone.
          {'\n\n'}
          <Text style={styles.bold}>Usage Data:</Text> We collect data about
          your habits, journal entries, focus sessions, and performance scores
          that you create within the App. This data is stored securely in your
          private account and is never shared with other users.
          {'\n\n'}
          <Text style={styles.bold}>Device Information:</Text> We may collect
          device type, operating system version, and push notification tokens to
          deliver notifications you have opted into.
        </Text>

        <Text style={styles.heading}>2. How We Use Your Information</Text>
        <Text style={styles.body}>
          {'\u2022'} To provide, maintain, and improve the App{'\n'}
          {'\u2022'} To compute your performance scores and insights{'\n'}
          {'\u2022'} To send push notifications you have opted into (streak
          reminders, performance windows, weekly reports){'\n'}
          {'\u2022'} To generate AI-powered insights based on your data (Pro
          feature){'\n'}
          {'\u2022'} To process subscription payments through Apple App Store or
          Google Play Store
        </Text>

        <Text style={styles.heading}>3. AI-Powered Features</Text>
        <Text style={styles.body}>
          Pro subscribers may use AI Insights, which sends anonymized usage
          patterns (habit completion rates, mood/energy trends, focus durations)
          to our AI provider (Anthropic) for analysis. We do not send the full
          content of your journal entries — only summaries and metadata. You can
          opt out of AI features at any time in your profile settings.
        </Text>

        <Text style={styles.heading}>4. Data Storage & Security</Text>
        <Text style={styles.body}>
          Your data is stored securely using Supabase (hosted on AWS) with
          row-level security ensuring only you can access your data.
          Authentication tokens are stored using your device's secure storage
          (iOS Keychain / Android Keystore). We use HTTPS for all data
          transmission.
        </Text>

        <Text style={styles.heading}>5. Third-Party Services</Text>
        <Text style={styles.body}>
          {'\u2022'} <Text style={styles.bold}>Supabase</Text> — Database and
          authentication{'\n'}
          {'\u2022'} <Text style={styles.bold}>RevenueCat</Text> — Subscription
          management{'\n'}
          {'\u2022'} <Text style={styles.bold}>Anthropic (Claude AI)</Text> —
          AI-powered insights (Pro only){'\n'}
          {'\u2022'} <Text style={styles.bold}>Expo</Text> — Push notifications
          and app updates{'\n\n'}
          Each third-party service has its own privacy policy governing their use
          of data.
        </Text>

        <Text style={styles.heading}>6. Data Retention & Deletion</Text>
        <Text style={styles.body}>
          Your data is retained as long as your account is active. You may
          request deletion of your account and all associated data at any time by
          contacting us at {CONTACT_EMAIL}. Upon deletion, all your data is
          permanently removed from our servers within 30 days.
        </Text>

        <Text style={styles.heading}>7. Subscriptions</Text>
        <Text style={styles.body}>
          Summis Pro is available as a monthly ($7.99/month), annual
          ($49.99/year), or lifetime ($79.99 one-time) subscription. Payment is
          charged to your App Store or Google Play account. Subscriptions
          automatically renew unless cancelled at least 24 hours before the end
          of the current period. You can manage and cancel subscriptions in your
          device's Settings.
        </Text>

        <Text style={styles.heading}>8. Children's Privacy</Text>
        <Text style={styles.body}>
          The App is not directed to children under 13. We do not knowingly
          collect personal information from children under 13. If we learn we
          have collected data from a child under 13, we will delete it promptly.
        </Text>

        <Text style={styles.heading}>9. Your Rights</Text>
        <Text style={styles.body}>
          Depending on your jurisdiction, you may have rights to access, correct,
          delete, or export your personal data. To exercise these rights, contact
          us at {CONTACT_EMAIL}.
        </Text>

        <Text style={styles.heading}>10. Changes to This Policy</Text>
        <Text style={styles.body}>
          We may update this Privacy Policy from time to time. We will notify you
          of material changes via in-app notification or email. Continued use of
          the App after changes constitutes acceptance.
        </Text>

        <Text style={styles.heading}>11. Contact Us</Text>
        <Text style={styles.body}>
          Questions or concerns? Contact us at:{'\n'}
          {CONTACT_EMAIL}
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scroll: {
    padding: 20,
    paddingBottom: 60,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: Colors.text,
    marginBottom: 4,
  },
  date: {
    fontSize: 13,
    color: Colors.textSecondary,
    marginBottom: 24,
  },
  heading: {
    fontSize: 17,
    fontWeight: '700',
    color: Colors.text,
    marginTop: 24,
    marginBottom: 8,
  },
  body: {
    fontSize: 14,
    color: Colors.textSecondary,
    lineHeight: 22,
  },
  bold: {
    fontWeight: '600',
    color: Colors.text,
  },
});
