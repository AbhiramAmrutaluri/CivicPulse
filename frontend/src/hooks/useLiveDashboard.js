import { useState, useEffect, useCallback } from 'react';

// Mock data for initial dashboard display
const INITIAL_MOCK_DATA = {
  liveEvents: [
    { id: "MOCK-001", citizen_name: "Rajesh Kumar", category: "Roads", urgency: "High", location: "Ward 4", original_text: "Large pothole on Necklace Road causing traffic congestion", created_at: new Date(Date.now() - 120000).toISOString() },
    { id: "MOCK-002", citizen_name: "Priya Sharma", category: "Sanitation", urgency: "Medium", location: "Ward 2", original_text: "Garbage collection delayed for 3 days", created_at: new Date(Date.now() - 300000).toISOString() },
    { id: "MOCK-003", citizen_name: "Ahmed Hassan", category: "Water", urgency: "Critical", location: "Ward 6", original_text: "Contaminated water supply in residential area", created_at: new Date(Date.now() - 600000).toISOString() },
  ],
  metrics: {
    total: 247,
    critical: 8,
    resolvedToday: 42,
    activeDepartments: 4,
    categories: {
      Sanitation: 89,
      Roads: 65,
      Water: 38,
      Electricity: 31,
      Drainage: 24,
      Other: 0
    }
  }
};

export function useLiveDashboard(wsUrl = 'ws://localhost:8000/ws/dashboard') {
  const [isConnected, setIsConnected] = useState(false);
  const [liveEvents, setLiveEvents] = useState(INITIAL_MOCK_DATA.liveEvents);
  const [connectionStatus, setConnectionStatus] = useState('disconnected'); // 'disconnected', 'connecting', 'connected'
  const [eventCount, setEventCount] = useState(0);
  
  // Real-time aggregates - start with mock data
  const [metrics, setMetrics] = useState(INITIAL_MOCK_DATA.metrics);

  const connect = useCallback(() => {
    setConnectionStatus('connecting');
    const ws = new WebSocket(wsUrl);

    ws.onopen = () => {
      setIsConnected(true);
      setConnectionStatus('connected');
      console.log('✅ Connected to CivicPulse Live Stream');
    };

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        
        // Handle NEW_COMPLAINT events (from Kafka consumer broadcast)
        if (data.type === 'NEW_COMPLAINT') {
          // The payload can be in data.data or data.payload depending on broadcast source
          const complaint = data.data || data.payload;
          
          if (!complaint || !complaint.id) {
            console.warn('⚠️  Received invalid complaint data:', data);
            return;
          }
          
          console.log(`📨 New Complaint: ${complaint.id} | Category: ${complaint.category} | Urgency: ${complaint.urgency}`);
          
          // 1. Add to live feed (keep last 50)
          setLiveEvents(prev => [complaint, ...prev].slice(0, 200));
          
          // 2. Increment event counter
          setEventCount(prev => prev + 1);
          
          // 3. Update live metrics seamlessly
          setMetrics(prev => {
            const newTotal = prev.total + 1;
            const urgencyLevel = complaint.urgency?.toLowerCase() || 'normal';
            const isCritical = urgencyLevel === 'critical' || urgencyLevel === 'high';
            const newCritical = isCritical ? prev.critical + 1 : prev.critical;
            const catName = complaint.category || 'Other';
            
            return {
              ...prev,
              total: newTotal,
              critical: newCritical,
              categories: {
                ...prev.categories,
                [catName]: (prev.categories[catName] || 0) + 1
              }
            };
          });
        }
        
        // Handle ANALYTICS_REFRESH events
        else if (data.type === 'ANALYTICS_REFRESH') {
          console.log('📊 Analytics refresh signal received');
        }
        
      } catch (e) {
        console.error('❌ Error parsing live event:', e);
      }
    };

    ws.onclose = () => {
      setIsConnected(false);
      setConnectionStatus('disconnected');
      console.log('⚠️  Disconnected from live stream. Reconnecting in 3s...');
      setTimeout(connect, 3000);
    };

    ws.onerror = (err) => {
      console.error('❌ WebSocket error:', err);
      setConnectionStatus('disconnected');
      ws.close();
    };

    return ws;
  }, [wsUrl]);

  useEffect(() => {
    const ws = connect();
    return () => {
      // Clean up connection when component unmounts
      ws.onclose = null; // Prevent reconnect loop on intentional unmount
      ws.close();
    };
  }, [connect]);

  // Derived arrays for charting
  const categoryDataArray = Object.entries(metrics.categories)
    .filter(([_, value]) => value > 0)
    .map(([name, value]) => ({
      name,
      value
    }))
    .sort((a, b) => b.value - a.value);

  return {
    isConnected,
    connectionStatus,
    liveEvents,
    metrics,
    categoryDataArray,
    eventCount
  };
}
