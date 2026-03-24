import { View, Text, StyleSheet } from 'react-native';
import { Card } from '@/components/ui/Card';
import { Colors } from '@/constants/Colors';
import type { AccountabilityPartner } from '@/types';

interface PartnerCardProps {
  partner: AccountabilityPartner;
  onPress?: () => void;
}

export function PartnerCard({ partner, onPress }: PartnerCardProps) {
  const isPending = partner.status === 'pending';

  return (
    <Card style={styles.container} onPress={onPress}>
      <View style={styles.row}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>
            {(partner.partner_name ?? 'P')[0].toUpperCase()}
          </Text>
        </View>
        <View style={styles.info}>
          <Text style={styles.name}>{partner.partner_name ?? 'Partner'}</Text>
          <Text style={styles.status}>
            {isPending ? 'Invite pending...' : 'Accountability partner'}
          </Text>
        </View>
        <View style={[styles.statusDot, { backgroundColor: isPending ? Colors.warning : Colors.success }]} />
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 10,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.accent + '30',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  avatarText: {
    color: Colors.accent,
    fontSize: 16,
    fontWeight: '700',
  },
  info: {
    flex: 1,
  },
  name: {
    color: Colors.text,
    fontSize: 15,
    fontWeight: '600',
  },
  status: {
    color: Colors.textSecondary,
    fontSize: 12,
    marginTop: 2,
  },
  statusDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
});
