
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
            <div className="bg-[#2d2d2d] border border-white/10 rounded-lg shadow-xl p-6 w-full max-w-md mx-4">
                <h2 className="text-lg font-bold text-[#d4c8c0] mb-4">Требуется ключ OpenAI API</h2>
                <p className="text-sm text-gray-400 mb-4">
                    Для общения с Каэлем, пожалуйста, введите ваш ключ OpenAI API. Он будет сохранен локально в вашем браузере и никуда не будет отправлен.
                </p>
                <form onSubmit={handleSubmit}>
                    <input
                        type="password"
                        value={apiKey}
                        onChange={(e) => setApiKey(e.target.value)}
                        placeholder="sk-..."
                        className="w-full bg-black/20 border border-white/10 rounded-md p-2 text-[#d4c8c0] focus:outline-none focus:ring-2 focus:ring-[#410b0b]"
                    />
                    <button
                        type="submit"
                        disabled={!apiKey.trim()}
                        className="w-full mt-4 bg-[#410b0b] text-white font-bold py-2 px-4 rounded-md hover:bg-opacity-80 disabled:bg-gray-500 disabled:cursor-not-allowed"
                    >
                        Сохранить и начать
                    </button>
                </form>
            </div>
        </div>
    );
};

export default ApiKeyModal;
