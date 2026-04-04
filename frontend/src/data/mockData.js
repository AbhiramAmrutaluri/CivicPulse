export const kpis = [
  { title: "Total Complaints", value: 342, trend: "+12%", type: "neutral" },
  { title: "Pending Tickets", value: 124, trend: "-4%", type: "warning" },
  { title: "Resolved Today", value: 45, trend: "+22%", type: "success" },
  { title: "Overdue (SLA Breach)", value: 8, trend: "-2%", type: "danger" },
];

export const dailyTrends = [
  { date: "Mon", complaints: 40 },
  { date: "Tue", complaints: 30 },
  { date: "Wed", complaints: 45 },
  { date: "Thu", complaints: 50 },
  { date: "Fri", complaints: 35 },
  { date: "Sat", complaints: 20 },
  { date: "Sun", complaints: 55 },
];

export const categoryData = [
  { name: "Sanitation", value: 120 },
  { name: "Roads", value: 80 },
  { name: "Water", value: 50 },
  { name: "Electricity", value: 45 },
  { name: "Drainage", value: 47 },
];

export const recentFeed = [
  { id: "C-101", citizen: "Aarti M.", issue: "Severed power line on 4th Ave!", urgency: "Critical", time: "2m ago" },
  { id: "C-102", citizen: "Rahul S.", issue: "Huge pothole causing traffic", urgency: "High", time: "15m ago" },
  { id: "C-103", citizen: "Imran K.", issue: "Garbage not picked up for 3 days", urgency: "Medium", time: "1h ago" },
  { id: "C-104", citizen: "Elena P.", issue: "Street light flickering repeatedly", urgency: "Low", time: "2h ago" },
];

export const hotspots = [
  { ward: "Ward 4 - Secunderabad", issue: "Contaminated Water", count: 15, severity: "High" },
  { ward: "Ward 10 - Charminar", issue: "Severe Traffic / Roads", count: 12, severity: "Medium" },
  { ward: "Ward 6 - Jubilee Hills", issue: "Drainage Overflow", count: 8, severity: "Low" },
];
