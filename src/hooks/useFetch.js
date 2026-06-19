import { useState, useCallback } from 'react';

export const useFetch = (apiFunc) => {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const execute = useCallback(async (...args) => {
        try {
            setLoading(true);
            setError(null);
            const response = await apiFunc(...args);
            const responseData = response?.data !== undefined ? response.data : response;
            setData(responseData || null);
            return responseData;
        } catch (err) {
            setError(err?.response?.data?.message || err.message || 'An error occurred');
            throw err;
        } finally {
            setLoading(false);
        }
    }, [apiFunc]);

    return { data, loading, error, execute, setData, setLoading };
};
