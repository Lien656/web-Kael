
import React, { useState, useRef } from 'react';

interface ChatInputProps {
    onSendMessage: (text: string, files: File[]) => void;
    isLoading: boolean;
}

const fileToDataUrl = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (error) => reject(error);
    reader.readAsDataURL(file);
  });
};

const FilePreview: React.FC<{ file: File; onRemove: () => void }> = ({ file, onRemove }) => {
    const [previewUrl, setPreviewUrl] = React.useState<string | null>(null);

    React.useEffect(() => {
        if (file.type.startsWith('image/')) {
            fileToDataUrl(file).then(setPreviewUrl);
        }
    }, [file]);

    return (
        <div className="relative mr-2 mb-2 p-1 bg-gray-900/50 rounded-lg">
            <div className="flex items-center space-x-2">
                {previewUrl ? (
                    <img src={previewUrl} alt={file.name} className="w-10 h-10 rounded object-cover" />
                ) : (
                    <div className="w-10 h-10 rounded bg-gray-700 flex items-center justify-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                    </div>
                )}
                <span className="text-xs text-gray-300 max-w-24 truncate">{file.name}</span>
            </div>
            <button
                type="button"
                onClick={onRemove}
                className="absolute -top-1 -right-1 bg-red-500 rounded-full text-white w-4 h-4 flex items-center justify-center text-xs"
                aria-label="Remove file"
            >
                &times;
            </button>
        </div>
    );
};

const ChatInput: React.FC<ChatInputProps> = ({ onSendMessage, isLoading }) => {
    const [text, setText] = useState('');
    const [files, setFiles] = useState<File[]>([]);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!text.trim() && files.length === 0) return;
        onSendMessage(text, files);
        setText('');
        setFiles([]);
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSubmit(e);
        }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            setFiles(prev => [...prev, ...Array.from(e.target.files)]);
        }
    };
    
    const removeFile = (indexToRemove: number) => {
        setFiles(prev => prev.filter((_, index) => index !== indexToRemove));
    };

    return (
        <footer className="p-4 flex-shrink-0">
            {files.length > 0 && (
                <div className="flex flex-wrap p-2">
                    {files.map((file, index) => (
                        <FilePreview key={index} file={file} onRemove={() => removeFile(index)} />
                    ))}
                </div>
            )}
            <form onSubmit={handleSubmit} className="flex items-center bg-black/20 backdrop-blur-sm rounded-lg p-2">
                <input
                    type="file"
                    multiple
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    className="hidden"
                    accept="image/*,video/*,.txt,.py,.json"
                />
                <button type="button" onClick={() => fileInputRef.current?.click()} className="p-2 text-gray-400 hover:text-white" aria-label="Attach file">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                    </svg>
                </button>
                <textarea
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Сообщение Каэлю..."
                    className="flex-1 bg-transparent text-[#d4c8c0] placeholder-gray-500 focus:outline-none resize-none px-2"
                    rows={1}
                    disabled={isLoading}
                />
                <button type="submit" className="p-2 text-gray-400 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed" disabled={isLoading || (!text.trim() && files.length === 0)}>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/>
                    </svg>
                </button>
            </form>
        </footer>
    );
};

export default ChatInput;