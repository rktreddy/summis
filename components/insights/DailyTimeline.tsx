import { View, Text, StyleSheet } from 'react-native';
import { Card } from '@/components/ui/Card';
import { Colors } from '@/constants/Colors';
import {
  computeDailySchedule,
  getCurrentWindow,
  getNextPeakIn,
  getWindowInfo,
  formatTime,
  type Chronotype,
} from '@/lib/chronotype';

interface DailyTimelineProps {
  wakeTime: string;
  chronotype: Chronotype;
}

export function DailyTimeline({ wakeTime, chronotype }: DailyTimelineProps) {
  const schedule = computeDailySchedule(wakeTime, chronotype);
  const currentWindow = getCurrentWindow(schedule);
  const windowInfo = getWindowInfo(currentWindow);
  const nextPeakMin = getNextPeakIn(schedule);

  const peakLabel = currentWindow === 'peak1' || currentWindow === 'peak2'
    ? 'You\'re in a peak focus window now!'
    : nextPeakMin != null && nextPeakMin > 0
      ? `Next peak in ${nextPeakMin} min`
      : 'Peaks are done for today — rest well';

  return (
    <Card style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.emoji}>{windowInfo.emoji}</Text>
        <View style={styles.headerText}>
          <Text style={[styles.windowLabel, { color: windowInfo.color }]}>
            {windowInfo.label}
          </Text>
          <Text style={styles.peakInfo}>{peakLabel}</Text>
        </View>
      </View>

      <View style={styles.timeline}>
        <TimeSegment
          label={formatTime(schedule.wakeTime)}
          sublabel="Wake"
          color={Colors.text}
          isFirst
        />
        <TimeSegment
          label={formatTime(schedule.firstPeak.start)}
          sublabel="Peak 1"
          color="#22C55E"
          active={currentWindow === 'peak1'}
        />
        <TimeSegment
          label={formatTime(schedule.secondPeak.start)}
          sublabel="Peak 2"
          color="#22C55E"
          active={currentWindow === 'peak2'}
        />
        <TimeSegment
          label={formatTime(schedule.caffeineCutoff)}
          sublabel="Caffeine stop"
          color={Colors.danger}
        />
        <TimeSegment
          label={formatTime(schedule.windDownStart)}
          sublabel="Wind down"
          color={Colors.warning}
        />
        <TimeSegment
          label={formatTime(schedule.bedTime)}
          sublabel="Bed"
          color="#6366F1"
          isLast
        />
      </View>
    </Card>
  );
}

function TimeSegment({
  label,
  sublabel,
  color,
  active,
  isFirst,
  isLast,
}: {
  label: string;
  sublabel: string;
  color: string;
  active?: boolean;
  isFirst?: boolean;
  isLast?: boolean;
}) {
  return (
    <View style={styles.segment}>
      <View style={styles.dotRow}>
        {!isFirst && <View style={styles.line} />}
        <View style={[styles.dot, { backgroundColor: color }, active && styles.dotActive]} />
        {!isLast && <View style={styles.line} />}
      </View>
      <Text style={[styles.segmentTime, active && { color, fontWeight: '700' }]}>{label}</Text>
      <Text style={[styles.segmentLabel, { color }]}>{sublabel}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 12,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
  },
  emoji: {
    fontSize: 24,
    marginRight: 10,
  },
  headerText: {
    flex: 1,
  },
  windowLabel: {
    fontSize: 15,
    fontWeight: '700',
  },
  peakInfo: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  timeline: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  segment: {
    alignItems: 'center',
    flex: 1,
  },
  dotRow: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 12,
    width: '100%',
    justifyContent: 'center',
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  dotActive: {
    width: 14,
    height: 14,
    borderRadius: 7,
    borderWidth: 2,
    borderColor: Colors.text,
  },
  line: {
    flex: 1,
    height: 2,
    backgroundColor: Colors.border,
  },
  segmentTime: {
    fontSize: 11,
    color: Colors.text,
    marginTop: 6,
    fontVariant: ['tabular-nums'],
  },
  segmentLabel: {
    fontSize: 9,
    marginTop: 2,
    fontWeight: '500',
  },
});
