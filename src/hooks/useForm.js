/**
 * Topic: Custom React Hooks
 * Module: Form State Management & Validation Handler (useForm)
 * Description: Generic custom hook to capture input form values, handle errors, reset forms, and execute client-side validation rules.
 */
import { useState } from 'react';

export const useForm = (initialValues, validate) => {
    const [values, setValues] = useState(initialValues);
    const [errors, setErrors] = useState({});

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setValues({
            ...values,
            [name]: type === 'checkbox' ? checked : value
        });
        
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: '' }));
        }
    };

    const validateForm = () => {
        if (!validate) return true;
        const validationErrors = validate(values);
        setErrors(validationErrors);
        return Object.keys(validationErrors).length === 0;
    };

    const resetForm = () => {
        setValues(initialValues);
        setErrors({});
    };

    return {
        values,
        errors,
        setValues,
        setErrors,
        handleChange,
        validateForm,
        resetForm
    };
};
