import { useMemo } from 'react';
import { useLiveDashboard } from './useLiveDashboard';
import {
  buildAnalyticsData,
  buildMetrics,
  mergeComplaints,
  seedComplaints,
} from '../data/civicPulseDataset';

export function useCivicPulseData() {
  const live = useLiveDashboard();

  const complaints = useMemo(() => mergeComplaints(seedComplaints, live.liveEvents), [live.liveEvents]);
  const metrics = useMemo(() => buildMetrics(complaints), [complaints]);
  const analytics = useMemo(() => buildAnalyticsData(complaints), [complaints]);
  const overviewEvents = useMemo(
    () => complaints.filter((complaint) => ['Critical', 'High'].includes(complaint.urgency)).slice(0, 40),
    [complaints],
  );

  return {
    ...live,
    complaints,
    metrics,
    analytics,
    overviewEvents,
  };
}
