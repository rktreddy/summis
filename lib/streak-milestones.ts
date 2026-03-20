export const MILESTONES = [7, 14, 30, 60, 100] as const;

export function isMilestone(streak: number): boolean {
  return MILESTONES.includes(streak as typeof MILESTONES[number]);
}

const MESSAGES: Record<number, string> = {
  7: 'One week strong!',
  14: 'Two weeks of consistency!',
  30: 'A full month — you\'re building something real.',
  60: '60 days. Most people never get this far.',
  100: 'Triple digits. You\'re in the top 1%.',
};

export function getMilestoneMessage(streak: number): string {
  return MESSAGES[streak] ?? `${streak}-day streak!`;
}
