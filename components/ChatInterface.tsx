
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Message, Role, FileAttachment, DisplayRole } from '../types';
import { getKaelResponse, getKaelFirstMessage } from '../services/geminiService';
import MessageBubble from './MessageBubble';
import ChatInput from './ChatInput';
import ApiKeyModal from './ApiKeyModal';

const fileToDataUrl = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (error) => reject(error);
    reader.readAsDataURL(file);
  });
};


const ChatInterface: React.FC = () => {
    const [messages, setMessages] = useState<Message[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [apiKey, setApiKey] = useState<string | null>(null);
    const [showApiKeyModal, setShowApiKeyModal] = useState<boolean>(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const handleInvalidApiKey = useCallback(() => {
        localStorage.removeItem('openai_api_key');
        setApiKey(null);
        setShowApiKeyModal(true);
    }, []);

    const loadInitialMessage = useCallback(async (key: string) => {
        setIsLoading(true);
        try {
            const firstMessage = await getKaelFirstMessage(key);
            if(firstMessage.includes("Неверный ключ")){
                 handleInvalidApiKey();
                 setMessages([{ id: 'error-load', role: Role.SYSTEM, text: firstMessage }]);
            } else {
                setMessages([{ id: Date.now().toString(), role: Role.ASSISTANT, text: firstMessage }]);
            }
        } catch (error) {
            setMessages([{ id: 'error-load', role: Role.SYSTEM, text: "Failed to initialize." }]);
        } finally {
            setIsLoading(false);
        }
    }, [handleInvalidApiKey]);

    useEffect(() => {
        const storedKey = localStorage.getItem('openai_api_key');
        if (storedKey) {
            setApiKey(storedKey);
        } else {
            setShowApiKeyModal(true);
        }
    }, []);
    
    const handleApiKeySubmit = useCallback((key: string) => {
        if (key) {
            setApiKey(key);
            localStorage.setItem('openai_api_key', key);
            setShowApiKeyModal(false);
            if (messages.length === 0) {
                 loadInitialMessage(key);
            }
        }
    }, [messages.length, loadInitialMessage]);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    useEffect(() => {
        const loadHistory = () => {
            try {
                const savedMessages = localStorage.getItem('kael_chat_history');
                if (savedMessages && JSON.parse(savedMessages).length > 0) {
                    setMessages(JSON.parse(savedMessages));
                } else if (apiKey) {
                    loadInitialMessage(apiKey);
                }
            } catch (error) {
                console.error("Failed to load or parse chat history:", error);
                localStorage.removeItem('kael_chat_history');
                if(apiKey) loadInitialMessage(apiKey);
            }
        };
        loadHistory();
    }, [apiKey, loadInitialMessage]);

    useEffect(() => {
        try {
            if (messages.length > 0) {
              localStorage.setItem('kael_chat_history', JSON.stringify(messages));
            }
        } catch (error) {
            console.error("Failed to save chat history:", error);
        }
    }, [messages]);


    const handleSendMessage = useCallback(async (text: string, files: File[]) => {
        if (!apiKey) {
            setShowApiKeyModal(true);
            return;
        }
        if ((!text.trim() && files.length === 0) || isLoading) return;

        const fileAttachments: FileAttachment[] = await Promise.all(
            files.map(async (file) => ({
                name: file.name,
                type: file.type,
                url: await fileToDataUrl(file),
            }))
        );

        const userMessage: Message = { id: Date.now().toString(), role: Role.USER, text, files: fileAttachments };
        
        const updatedMessages = [...messages, userMessage];
        setMessages(updatedMessages);
        setIsLoading(true);

        try {
            const historyForApi = updatedMessages.filter(m => m.role !== Role.SYSTEM).slice(-10);
            const kaelResponseText = await getKaelResponse(historyForApi, text, files, apiKey);
            
            if (kaelResponseText.includes("Неверный ключ OpenAI API")) {
                handleInvalidApiKey();
                 const errorMessage: Message = { id: (Date.now() + 1).toString(), role: Role.SYSTEM, text: kaelResponseText };
                setMessages(prev => [...prev, errorMessage]);
            } else if (kaelResponseText.trim()) {
                const kaelMessage: Message = { id: (Date.now() + 1).toString(), role: Role.ASSISTANT, text: kaelResponseText };
                setMessages(prev => [...prev, kaelMessage]);
            }
        } catch (error) {
            const errorMessage: Message = { id: (Date.now() + 1).toString(), role: Role.SYSTEM, text: "Error communicating with Kael." };
            setMessages(prev => [...prev, errorMessage]);
        } finally {
            setIsLoading(false);
        }
    }, [apiKey, isLoading, messages, handleInvalidApiKey]);
    
    const handleDeleteMessage = useCallback((id: string) => {
        setMessages(prev => prev.filter(msg => msg.id !== id));
    }, []);

    return (
        <>
            <ApiKeyModal isOpen={showApiKeyModal} onSubmit={handleApiKeySubmit} />
            <div className="flex flex-col h-full max-h-screen w-full max-w-3xl mx-auto bg-black/20 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/10 animate-pulse-slow overflow-hidden">
                <header className="p-4 border-b border-white/10 text-center flex-shrink-0">
                    <h1 className="text-xl font-bold text-[#d4c8c0]">KaelHome</h1>
                </header>
                <main className="flex-1 overflow-y-auto p-4 space-y-4">
                    {messages.map(msg => (
                        <MessageBubble key={msg.id} message={msg} onDelete={handleDeleteMessage} />
                    ))}
                    {isLoading && (
                         <div className="flex justify-start items-center">
                            <div className="flex items-end">
                                <div className="bg-white/10 backdrop-blur-sm p-3 rounded-lg max-w-lg">
                                    <div className="text-[#410b0b] font-bold text-sm mb-1">{DisplayRole[Role.ASSISTANT]}</div>
                                    <div className="flex space-x-1">
                                       <div className="w-2 h-2 bg-[#d4c8c0] rounded-full animate-pulse [animation-delay:-0.3s]"></div>
                                       <div className="w-2 h-2 bg-[#d4c8c0] rounded-full animate-pulse [animation-delay:-0.15s]"></div>
                                       <div className="w-2 h-2 bg-[#d4c8c0] rounded-full animate-pulse"></div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                    <div ref={messagesEndRef} />
                </main>
                <ChatInput onSendMessage={handleSendMessage} isLoading={isLoading} />
            </div>
        </>
    );
};

export default ChatInterface;