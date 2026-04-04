// Pure offline mock data enabling absolute rapid UI designing without FastAPI dependencies.
export const initialComplaints = [
  {
    id: "C-9921",
    citizen_name: "Priya Reddy",
    category: "Electricity",
    urgency: "Critical",
    status: "Pending",
    source: "Mobile App",
    ward: "Ward 10 - Charminar",
    text: "Live wire snapped and fallen on the main crossing. Highly dangerous, please send someone immediately!",
    created_at: "2026-03-25T08:15:00Z",
    is_overdue: false,
    department: "Power Distribution Corp"
  },
  {
    id: "C-9920",
    citizen_name: "Arjun Singh",
    category: "Water Supply",
    urgency: "High",
    status: "In Progress",
    source: "Web Portal",
    ward: "Ward 4 - Secunderabad",
    text: "No drinking water for the last 3 days in our colony. Borewell is entirely dry.",
    created_at: "2026-03-22T09:00:00Z",
    is_overdue: true,  // SLA Breach Simulated
    department: "Water Board"
  },
  {
    id: "C-9919",
    citizen_name: "Meera K.",
    category: "Sanitation",
    urgency: "Low",
    status: "Resolved",
    source: "WhatsApp",
    ward: "Ward 6 - Jubilee Hills",
    text: "Garbage bins overflowing near the park entrance, causing terrible smell.",
    created_at: "2026-03-20T14:30:00Z",
    is_overdue: false,
    department: "Solid Waste Management"
  },
  {
    id: "C-9918",
    citizen_name: "John D.",
    category: "Roads",
    urgency: "Medium",
    status: "Pending",
    source: "Call Center",
    ward: "Ward 1 - Kapra",
    text: "Massive pothole in front of the primary school causing accidents daily.",
    created_at: "2026-03-24T18:00:00Z",
    is_overdue: false,
    department: "Public Works Department"
  }
];
