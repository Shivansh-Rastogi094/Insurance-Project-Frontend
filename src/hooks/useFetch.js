/**
 * Topic: Custom React Hooks
 * Module: Data Fetching Handler (useFetch)
 * Description: Generic custom hook to handle async API requests, manages state for loading, error logging, and fetched data.
 */
import { useState, useCallback, useRef } from 'react';

export const useFetch = (apiFunc) => {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const abortControllerRef = useRef(null);

    const execute = useCallback(async (...args) => {
        if (abortControllerRef.current) {
            abortControllerRef.current.abort();
        }
        abortControllerRef.current = new AbortController();

        try {
            setLoading(true);
            setError(null);
            const response = await apiFunc(...args);
            const responseData = response?.data !== undefined ? response.data : response;
            setData(responseData);
            return responseData;
        } catch (err) {
            if (err.name === 'AbortError' || err.code === 'ERR_CANCELED') {
                return; // Aborted request - ignore
            }
            setError(err?.response?.data?.message || err.message || 'An error occurred');
            throw err;
        } finally {
            setLoading(false);
        }
    }, [apiFunc]);

    return { data, loading, error, execute, setData, setLoading };
};


