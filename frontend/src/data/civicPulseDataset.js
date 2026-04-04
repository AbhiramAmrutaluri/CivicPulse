const SOURCES = ['Mobile App', 'Web Portal', 'WhatsApp', 'Call Center', 'Twitter', 'Citizen Portal'];

const CATEGORY_META = {
  Roads: { department: 'Public Works Department', keywords: ['pothole', 'road', 'traffic', 'bridge', 'street', 'highway'] },
  Water: { department: 'Water Board', keywords: ['water', 'pipe', 'contaminated', 'supply', 'drinking', 'tap'] },
  Sanitation: { department: 'Solid Waste Management', keywords: ['garbage', 'waste', 'sanitation', 'litter', 'bin', 'filth'] },
  Electricity: { department: 'Power Distribution Corp', keywords: ['power', 'electric', 'light', 'line', 'transformer', 'outage'] },
  Drainage: { department: 'Sewerage Department', keywords: ['drain', 'drainage', 'sewage', 'overflow', 'waterlogging'] },
  PublicHealth: { department: 'Health Department', keywords: ['health', 'hospital', 'clinic', 'mosquito', 'fever', 'toilet'] },
};

const WARDS = [
  { ward: 'Ward 1 - Kapra', location: '17.3599, 78.3411' },
  { ward: 'Ward 2 - AS Rao Nagar', location: '17.3684, 78.3716' },
  { ward: 'Ward 3 - Malkajgiri', location: '17.3548, 78.3329' },
  { ward: 'Ward 4 - Secunderabad', location: '17.4408, 78.4983' },
  { ward: 'Ward 6 - Jubilee Hills', location: '17.4321, 78.4119' },
  { ward: 'Ward 7 - Banjara Hills', location: '17.4102, 78.4275' },
  { ward: 'Ward 8 - Khairatabad', location: '17.3144, 78.3478' },
  { ward: 'Ward 10 - Charminar', location: '17.3152, 78.4474' },
  { ward: 'Ward 14 - L.B. Nagar', location: '17.3986, 78.4116' },
  { ward: 'Ward 15 - Kukatpally', location: '17.4135, 78.4268' },
];

const CITIZENS = [
  'Aarti M.', 'Rahul S.', 'Imran K.', 'Elena P.', 'Priya Reddy', 'Arjun Singh',
  'Meera K.', 'John D.', 'Farhan A.', 'Sana T.', 'Rohit B.', 'Nandini S.',
  'Akhil P.', 'Shreya G.', 'Zoya H.', 'Vikram N.', 'Ananya R.', 'Kiran V.',
];

const ISSUE_TEMPLATES = {
  Roads: [
    'Large potholes on {ward} causing traffic backups and vehicle damage.',
    'Road surface on {ward} is broken and unsafe for two-wheelers.',
    'Traffic congestion on {ward} is worsening after the recent road cave-in.',
  ],
  Water: [
    'Water supply on {ward} is intermittent and the water has a foul smell.',
    'Residents in {ward} have had no drinking water for several hours.',
    'Contaminated water is flowing through the line serving {ward}.',
  ],
  Sanitation: [
    'Garbage has not been collected on {ward} for days and the smell is severe.',
    'Overflowing bins in {ward} are attracting pests and causing hygiene issues.',
    'Sanitation workers have missed pickups repeatedly on {ward}.',
  ],
  Electricity: [
    'Power cuts in {ward} are happening repeatedly and disrupting work.',
    'A transformer near {ward} is sparking and needs urgent inspection.',
    'Street lights on {ward} are out and the area is unsafe at night.',
  ],
  Drainage: [
    'Drainage overflow in {ward} is causing waterlogging on the road.',
    'Stormwater drains on {ward} are clogged and backing up into homes.',
    'Sewage water is stagnating in {ward} after the latest rain.',
  ],
  PublicHealth: [
    'Health services near {ward} are overloaded and residents are waiting too long.',
    'A dirty public toilet in {ward} is creating a health hazard.',
    'Mosquito breeding has increased around {ward} and people are falling sick.',
  ],
};

function pick(list, index) {
  return list[index % list.length];
}

function formatTemplate(template, ward) {
  return template.replace('{ward}', ward);
}

function urgencyForIndex(index) {
  const roll = index % 20;
  if (roll < 4) return 'Critical';
  if (roll < 9) return 'High';
  if (roll < 15) return 'Medium';
  return 'Low';
}

function statusForUrgency(urgency, index) {
  if (urgency === 'Critical') return index % 3 === 0 ? 'Open' : 'In Progress';
  if (urgency === 'High') return index % 4 === 0 ? 'Open' : 'In Progress';
  if (urgency === 'Medium') return index % 5 === 0 ? 'Resolved' : 'In Progress';
  return index % 2 === 0 ? 'Resolved' : 'Open';
}

function categoryForIndex(index) {
  const categories = Object.keys(CATEGORY_META);
  return pick(categories, index * 3);
}

function locationForIndex(index) {
  return pick(WARDS, index * 2);
}

export function normalizeComplaint(record) {
  const text = record.text || record.original_text || record.translated_text || '';
  const urgency = record.urgency || 'Medium';

  return {
    id: record.id || record.complaint_id,
    citizen_name: record.citizen_name || record.citizen || 'Anonymous',
    category: record.category || 'Other',
    urgency,
    status: record.status || 'Open',
    source: record.source || 'Live Feed',
    ward: record.ward || 'Unknown',
    location: record.location || '17.0, 78.0',
    text,
    original_text: record.original_text || text,
    translated_text: record.translated_text || text,
    created_at: record.created_at || new Date().toISOString(),
    is_overdue: Boolean(record.is_overdue),
    department: record.department || CATEGORY_META[record.category]?.department || 'Unassigned',
    ai_confidence: record.ai_confidence ?? 0.86,
  };
}

export function createComplaintRecord(index, createdAt = new Date()) {
  const category = categoryForIndex(index);
  const ward = locationForIndex(index);
  const urgency = urgencyForIndex(index);
  const template = pick(ISSUE_TEMPLATES[category], index);
  const citizen = pick(CITIZENS, index * 5);
  const source = pick(SOURCES, index * 7);
  const timestamp = new Date(createdAt.getTime() - index * 17 * 60 * 1000);

  const text = formatTemplate(template, ward.ward);

  return normalizeComplaint({
    complaint_id: `CP-${String(index + 1).padStart(5, '0')}`,
    citizen_name: citizen,
    category,
    urgency,
    status: statusForUrgency(urgency, index),
    source,
    ward: ward.ward,
    location: ward.location,
    text,
    original_text: text,
    translated_text: text,
    created_at: timestamp.toISOString(),
    is_overdue: urgency === 'Critical' || urgency === 'High' ? index % 6 === 0 : false,
    department: CATEGORY_META[category].department,
    ai_confidence: urgency === 'Critical' ? 0.98 : urgency === 'High' ? 0.94 : urgency === 'Medium' ? 0.82 : 0.71,
  });
}

export const seedComplaints = Array.from({ length: 240 }, (_, index) => createComplaintRecord(index))
  .sort((left, right) => new Date(right.created_at).getTime() - new Date(left.created_at).getTime());

export function buildMetrics(complaints) {
  const categories = { Sanitation: 0, Roads: 0, Water: 0, Electricity: 0, Drainage: 0, PublicHealth: 0, Other: 0 };
  const urgencyCounts = { Critical: 0, High: 0, Medium: 0, Low: 0 };
  const departments = new Set();

  complaints.forEach((complaint) => {
    const category = complaint.category || 'Other';
    const urgency = complaint.urgency || 'Low';
    categories[category] = (categories[category] || 0) + 1;
    urgencyCounts[urgency] = (urgencyCounts[urgency] || 0) + 1;
    if (complaint.department) departments.add(complaint.department);
  });

  const resolvedToday = complaints.filter((complaint) => {
    const createdAt = new Date(complaint.created_at).getTime();
    const oneDayAgo = Date.now() - 24 * 60 * 60 * 1000;
    return createdAt >= oneDayAgo && String(complaint.status).toLowerCase() === 'resolved';
  }).length;

  return {
    total: complaints.length,
    critical: urgencyCounts.Critical + urgencyCounts.High,
    resolvedToday,
    activeDepartments: departments.size,
    categories,
    urgencyCounts,
  };
}

export function buildDailyTrends(complaints) {
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const buckets = Array.from({ length: 7 }, () => 0);

  complaints.forEach((complaint) => {
    const createdAt = new Date(complaint.created_at);
    const dayIndex = createdAt.getDay();
    const normalized = (dayIndex + 6) % 7;
    buckets[normalized] += 1;
  });

  return days.map((date, index) => ({ date, complaints: buckets[index] }));
}

export function buildCategoryData(complaints) {
  const counts = buildMetrics(complaints).categories;

  return Object.entries(counts)
    .filter(([, value]) => value > 0)
    .map(([name, value]) => ({ name, value }))
    .sort((left, right) => right.value - left.value);
}

export function buildRecentFeed(complaints, limit = 6) {
  return complaints
    .slice()
    .sort((left, right) => new Date(right.created_at).getTime() - new Date(left.created_at).getTime())
    .slice(0, limit)
    .map((item) => ({
      id: item.id,
      citizen: item.citizen_name,
      issue: item.text,
      urgency: item.urgency,
      time: new Date(item.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    }));
}

export function buildHotspots(complaints, limit = 8) {
  const grouped = new Map();

  complaints.forEach((complaint) => {
    const key = `${complaint.ward}::${complaint.category}`;
    const current = grouped.get(key) || {
      ward: complaint.ward,
      location: complaint.location,
      category: complaint.category,
      complaint_count: 0,
      score: 0,
      criticals: 0,
      highs: 0,
      representative_text: complaint.text,
      latest_ts: complaint.created_at,
    };

    current.complaint_count += 1;
    current.score += complaint.urgency === 'Critical' ? 4 : complaint.urgency === 'High' ? 3 : complaint.urgency === 'Medium' ? 2 : 1;
    current.criticals += complaint.urgency === 'Critical' ? 1 : 0;
    current.highs += complaint.urgency === 'High' ? 1 : 0;

    if (new Date(complaint.created_at).getTime() > new Date(current.latest_ts).getTime()) {
      current.latest_ts = complaint.created_at;
      current.representative_text = complaint.text;
      current.location = complaint.location;
    }

    grouped.set(key, current);
  });

  return Array.from(grouped.values())
    .sort((left, right) => right.score - left.score)
    .slice(0, limit)
    .map((item, index) => ({
      cluster_id: `HS-${String(index + 1).padStart(3, '0')}`,
      complaint_count: item.complaint_count,
      ward: item.ward,
      location: item.location,
      category: item.category,
      representative_text: item.representative_text,
      hotspot_score: Math.min(99, item.score * 4 + item.complaint_count),
      severity: item.criticals > 1 || item.complaint_count >= 12 ? 'Critical' : item.highs > 1 || item.complaint_count >= 8 ? 'High' : item.complaint_count >= 4 ? 'Medium' : 'Low',
      trend: item.criticals > item.highs ? 'increasing' : item.highs > 1 ? 'stable' : 'decreasing',
    }));
}

export function mergeComplaints(seed, live) {
  const normalized = [...seed, ...(live || []).map(normalizeComplaint)];
  const unique = new Map();

  normalized.forEach((complaint) => {
    unique.set(complaint.id, complaint);
  });

  return Array.from(unique.values()).sort((left, right) => new Date(right.created_at).getTime() - new Date(left.created_at).getTime());
}

export function buildAnalyticsData(complaints) {
  return {
    dailyTrends: buildDailyTrends(complaints),
    categoryData: buildCategoryData(complaints),
    recentFeed: buildRecentFeed(complaints),
    hotspots: buildHotspots(complaints),
    metrics: buildMetrics(complaints),
  };
}
