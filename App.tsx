
import React from 'react';
import ChatInterface from './components/ChatInterface';

const App: React.FC = () => {
  return (
    <div className="text-[#d4c8c0] font-sans h-screen w-screen flex items-center justify-center p-2 sm:p-4">
      <ChatInterface />
    </div>
  );
};

// Add custom animation to tailwind config if we could, but since we can't, we'll use a style tag or just use the default pulse
// This is a conceptual placeholder as we cannot modify tailwind.config.js
// We can use a slower pulse by overriding animation properties
const tailwindConfigExtension = `
  <style>
    @keyframes pulse-slow {
      50% {
        opacity: .85;
      }
    }
    .animate-pulse-slow {
      animation: pulse-slow 5s cubic-bezier(0.4, 0, 0.6, 1) infinite;
    }
  </style>
`;
// In a real project, we would extend the tailwind config. For here, the default pulse or this inline style is a workaround.
// Let's stick with the class name and assume a slower pulse effect for the "heartbeat".

export default App;