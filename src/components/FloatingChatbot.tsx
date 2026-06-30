import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, X, Send, Sparkles, Loader2 } from 'lucide-react';
import { chatWithAssistant } from '@/lib/gemini';

export default function FloatingChatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<{role: 'user' | 'assistant', text: string}[]>([
    { role: 'assistant', text: "Namaste! I am your AI assistant. You can ask me how to report an issue, about government schemes, or what features GramSahay offers." }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage = input.trim();
    setMessages(prev => [...prev, { role: 'user', text: userMessage }]);
    setInput('');
    setIsTyping(true);

    try {
      // Map local messages to Gemini format (excluding the new user message we just appended locally)
      const history = messages.map(m => ({
        role: m.role === 'user' ? 'user' as const : 'model' as const,
        text: m.text
      }));
      
      const responseText = await chatWithAssistant(userMessage, history);
      setMessages(prev => [...prev, { role: 'assistant', text: responseText }]);
    } catch (error) {
      console.error("Chatbot error:", error);
      setMessages(prev => [...prev, { role: 'assistant', text: "Sorry, I am having trouble connecting to the network right now." }]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 50, scale: 0.9 }}
            className="fixed bottom-24 right-6 w-[350px] max-w-[calc(100vw-3rem)] bg-[#0a0a0a] border border-yellow-500/30 rounded-2xl shadow-[0_0_40px_rgba(234,179,8,0.15)] z-[100] overflow-hidden flex flex-col"
            style={{ height: '500px', maxHeight: 'calc(100vh - 8rem)' }}
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-yellow-600 to-yellow-500 p-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-black" />
                <span className="font-bold text-black">GramSahay AI</span>
              </div>
              <button onClick={() => setIsOpen(false)} className="text-black/70 hover:text-black transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Chat Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map((msg, idx) => (
                <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[85%] rounded-2xl px-4 py-2 text-sm ${
                    msg.role === 'user' 
                      ? 'bg-yellow-500/20 text-yellow-500 border border-yellow-500/30 rounded-br-sm' 
                      : 'bg-white/5 text-white/80 border border-white/10 rounded-bl-sm'
                  }`}>
                    {msg.text}
                  </div>
                </div>
              ))}
              {isTyping && (
                <div className="flex justify-start">
                  <div className="bg-white/5 text-white/50 border border-white/10 rounded-2xl rounded-bl-sm px-4 py-2 flex items-center gap-2 text-sm">
                    <Loader2 className="w-4 h-4 animate-spin" /> Thinking...
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="p-3 border-t border-white/10 bg-white/[0.02]">
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                  placeholder="Ask me anything..."
                  className="flex-1 bg-white/5 border border-white/10 rounded-full px-4 py-2 text-sm text-white focus:outline-none focus:border-yellow-500/50"
                />
                <button
                  onClick={handleSend}
                  disabled={!input.trim() || isTyping}
                  className="w-9 h-9 rounded-full bg-yellow-500 text-black flex items-center justify-center disabled:opacity-50 transition-colors hover:bg-yellow-400 shrink-0"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 w-14 h-14 rounded-full bg-gradient-to-r from-yellow-600 to-yellow-500 flex items-center justify-center shadow-[0_0_20px_rgba(234,179,8,0.4)] hover:scale-110 transition-transform z-50"
      >
        <MessageSquare className="w-6 h-6 text-black" />
      </button>
    </>
  );
}
