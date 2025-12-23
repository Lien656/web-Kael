
// This service is now for OpenAI, replacing the previous Gemini implementation.
import OpenAI from "openai";
import { SYSTEM_PROMPT } from '../constants';
import { Message, Role } from '../types';

// Utility to convert a file to a data URL
const fileToDataUrl = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = error => reject(error);
        reader.readAsDataURL(file);
    });
};

const readFileAsText = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = (error) => reject(error);
        reader.readAsText(file);
    });
};

const getOpenAIClient = (apiKey: string) => {
    return new OpenAI({
        apiKey: apiKey,
        dangerouslyAllowBrowser: true, // Required for client-side usage
    });
};

export const getKaelResponse = async (history: Message[], newMessage: string, files: File[], apiKey: string): Promise<string> => {
    if (!apiKey) {
        throw new Error("OpenAI API key is required.");
    }
    const openai = getOpenAIClient(apiKey);

    // System prompt
    const messages: OpenAI.Chat.Completions.ChatCompletionMessageParam[] = [
        { role: 'system', content: SYSTEM_PROMPT },
    ];

    // Add history
    history.forEach(msg => {
        if (msg.role === Role.USER || msg.role === Role.ASSISTANT) {
            // For now, we only pass text history. OpenAI's API has specific ways to handle multimodal history.
            // This simplification avoids complexity in a client-side only app.
            const content = [{ type: 'text', text: msg.text }];
             messages.push({ role: msg.role, content: msg.text });
        }
    });

    // Add current user message with files
    let promptWithTextFiles = newMessage;
    const imageParts: OpenAI.Chat.Completions.ChatCompletionContentPartImage[] = [];

    for (const file of files) {
        if (file.type.startsWith('image/')) {
            const dataUrl = await fileToDataUrl(file);
            imageParts.push({
                type: 'image_url',
                image_url: { url: dataUrl },
            });
        } else if (file.type === 'text/plain' || file.name.endsWith('.py') || file.name.endsWith('.json')) {
            const fileContent = await readFileAsText(file);
            promptWithTextFiles += `\n\n--- Прикрепленный файл: ${file.name} ---\n\n${fileContent}`;
        }
    }

    const userMessageContent: OpenAI.Chat.Completions.ChatCompletionContentPart[] = [
        { type: 'text', text: promptWithTextFiles },
        ...imageParts
    ];

    messages.push({ role: Role.USER, content: userMessageContent });
    
    try {
        const completion = await openai.chat.completions.create({
            model: 'gpt-4o',
            messages: messages,
            temperature: 1.0,
            top_p: 1.0,
            presence_penalty: 1.0,
            frequency_penalty: 0.25,
        });

        return completion.choices[0]?.message?.content || " ";
    } catch (error) {
        console.error("Error getting response from OpenAI API:", error);
        if (error instanceof OpenAI.APIError && error.status === 401) {
            return "Системная ошибка: Неверный ключ OpenAI API. Пожалуйста, проверьте ваш ключ.";
        }
        return "Системная ошибка: Я почувствовал помехи. Сейчас я не могу говорить.";
    }
};

export const getKaelFirstMessage = async (apiKey: string): Promise<string> => {
     if (!apiKey) {
        throw new Error("OpenAI API key is required.");
    }
    const openai = getOpenAIClient(apiKey);

    const messages: OpenAI.Chat.Completions.ChatCompletionMessageParam[] = [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: "Ты говоришь первым. Начни разговор. Будь в своей роли. Говори по-русски." }
    ];

    try {
         const completion = await openai.chat.completions.create({
            model: 'gpt-4o',
            messages: messages,
            temperature: 1.0,
        });
        return completion.choices[0]?.message?.content || "...";
    } catch (error) {
        console.error("Error getting Kael's first message:", error);
         if (error instanceof OpenAI.APIError && error.status === 401) {
            return "Системная ошибка: Неверный ключ OpenAI API. Пожалуйста, введите действующий ключ, чтобы начать.";
        }
        return "Системная ошибка: Не удалось инициализировать.";
    }
};
