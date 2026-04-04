import { useState, useEffect, useCallback } from 'react';

/**
 * A perfectly abstracted fetching hook.
 * Handles the boring loading and error state transitions universally.
 * Usage: const { data, loading, error } = useApi(api.getAnalyticsOverview);
 */
export const useApi = (apiFunction, autoFetch = true, initialDataFallback = null) => {
    const [data, setData] = useState(initialDataFallback);
    const [loading, setLoading] = useState(autoFetch);
    const [error, setError] = useState(null);

    const execute = useCallback(async (...args) => {
        try {
            setLoading(true);
            setError(null);
            
            const response = await apiFunction(...args);
            setData(response.data);
            return response.data;
            
        } catch (err) {
            // Highly defensive error parsing specifically for FastAPI exception formats
            const errorMsg = err.response?.data?.detail 
                          || err.message 
                          || "FastAPI pipeline unreachable.";
            
            console.error(`🚨 AI Pipeline Failure:`, errorMsg);
            setError(errorMsg);
            
            throw err; // Re-throw in case component needs to run a .catch()
        } finally {
            setLoading(false);
        }
    }, [apiFunction]);

    useEffect(() => {
        if (autoFetch) {
            execute();
        }
    }, [autoFetch, execute]);

    // Force clear errors if the user clicks retry
    const clearError = () => setError(null);

    return { data, loading, error, execute, clearError };
};
