
import React from 'react';
import { Message, Role, DisplayRole } from '../types';

interface MessageBubbleProps {
    message: Message;
    onDelete: (id: string) => void;
}

const FilePreview: React.FC<{ file: { name: string; type: string; url: string } }> = ({ file }) => {
    if (file.type.startsWith('image/')) {
        return <img src={file.url} alt={file.name} className="mt-2 rounded-lg max-w-xs max-h-64 object-cover" />;
    }
    if (file.type.startsWith('video/')) {
        return <video src={file.url} controls className="mt-2 rounded-lg max-w-xs max-h-64" />;
    }
    return (
        <div className="mt-2 p-2 bg-gray-800/50 rounded-lg flex items-center space-x-2">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
            <span className="text-sm text-gray-300 truncate">{file.name}</span>
        </div>
    );
};

const MessageBubble: React.FC<MessageBubbleProps> = ({ message, onDelete }) => {
    const isKael = message.role === Role.ASSISTANT;
    const isUser = message.role === Role.USER;
    const isSystem = message.role === Role.SYSTEM;

    const bubbleAlignment = isUser ? 'justify-end' : 'justify-start';
    const bubbleColor = isUser ? 'bg-[#410b0b]/50 backdrop-blur-sm' : 'bg-white/10 backdrop-blur-sm';
    const nameColor = 'text-[#410b0b]';

    if (isSystem) {
        return (
            <div className="text-center text-xs text-gray-400 py-2">
                {message.text}
            </div>
        );
    }
    
    const formatText = (text: string) => {
        return text.split('**').map((part, index) => 
            index % 2 === 1 ? <strong key={index}>{part}</strong> : part
        );
    };

    return (
        <div className={`flex ${bubbleAlignment} items-center group`}>
             <div className="flex items-end">
                <div className={`${bubbleColor} p-3 rounded-lg max-w-lg`}>
                    <div className={`${nameColor} font-bold text-sm mb-1`}>
                        {DisplayRole[message.role]}
                    </div>
                    {message.files && message.files.length > 0 && (
                        <div className="flex flex-col space-y-2">
                            {message.files.map((file, index) => <FilePreview key={index} file={file} />)}
                        </div>
                    )}
                    {message.text && <p className={`text-base whitespace-pre-wrap ${message.files && message.files.length > 0 ? 'mt-2' : ''}`}>{formatText(message.text)}</p>}
                </div>
                {isKael && (
                    <button 
                        onClick={() => onDelete(message.id)} 
                        className="ml-2 text-gray-500 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"
                        aria-label="Delete message"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                )}
            </div>
        </div>
    );
};

export default MessageBubble;