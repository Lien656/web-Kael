
import React, { useState } from 'react';

interface ApiKeyModalProps {
    isOpen: boolean;
    onSubmit: (apiKey: string) => void;
}

const ApiKeyModal: React.FC<ApiKeyModalProps> = ({ isOpen, onSubmit }) => {
    const [apiKey, setApiKey] = useState('');

    if (!isOpen) {
        return null;
    }

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSubmit(apiKey);
    };

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-50">
            <div className="bg-[#2d2d2d] border border-white/10 rounded-lg shadow-xl p-6 w-full max-w