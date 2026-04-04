import axios from 'axios';

// Vite handles .env mapping automatically. Defaults to localhost 8000 if not found.
const API_BASE_URL = import.meta.env?.VITE_API_URL || 'http://localhost:8000';

const client = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
    timeout: 8000 // Fails fast in a hackathon demo to trigger UI fallbacks instead of endless spinners
});

export const api = {
    // -------------------------
    // Complaints Operations
    // -------------------------
    getComplaints: async (skip=0, limit=200) => {
        return client.get(`/complaints/?skip=${skip}&limit=${limit}`);
    },
    getLiveFeed: async () => {
        return client.get('/complaints/feed/live');
    },
    updateComplaintStatus: async (id, status) => {
        return client.patch(`/complaints/${id}/status`, { status });
    },

    // -------------------------
    // Spark Analytics Engine
    // -------------------------
    getAnalyticsOverview: async () => {
        return client.get('/analytics/overview');
    },
    getCategoryAnalytics: async () => {
        return client.get('/analytics/category-wise');
    },
    getWardAnalytics: async () => {
        return client.get('/analytics/ward-wise');
    },
    getUrgencyAnalytics: async () => {
        return client.get('/analytics/urgency-wise');
    },
    getSlaAnalytics: async () => {
        return client.get('/analytics/sla');
    },

    // -------------------------
    // Geospatial Routing
    // -------------------------
    getClusters: async (limit=50) => {
        return client.get(`/clusters?limit=${limit}`);
    },
    getDepartments: async () => {
        return client.get('/departments');
    }
};
