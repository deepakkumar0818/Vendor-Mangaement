import { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, Bot, User, Sparkles } from 'lucide-react';

const INITIAL_MESSAGE = {
  id: 1,
  role: 'assistant',
  text: "Hi! I'm your VMS AI Assistant. Ask me anything about vendor management, RFQs, scorecards, or how to use the platform.",
};

const QUICK_PROMPTS = [
  'How do I add a vendor?',
  'What is a vendor scorecard?',
  'How to compare quotes?',
];

const AUTO_REPLIES = {
  'add a vendor': "To add a vendor, go to **Vendors** in the sidebar → click **Add Vendor** → fill in the company name, category, and contact details. You can also bulk-import via CSV.",
  'scorecard': "Vendor scorecards automatically rate each vendor on delivery, quality, pricing, and responsiveness. Scores update after every transaction. Navigate to **Scorecard** in the sidebar to view them.",
  'compare quotes': "Go to **Price Comparison** in the sidebar. Select an RFQ, and all vendor quotes for that RFQ will be displayed side-by-side so you can instantly spot the best offer.",
  'rfq': "An RFQ (Request for Quotation) lets you ask multiple vendors to send price quotes. Create one from the **Quotes** page — vendors are notified automatically.",
  'dashboard': "The Dashboard gives you a live overview: active vendors, open RFQs, average scores, and savings metrics all in one place.",
  'default': "I can help with vendor management, RFQs, scorecards, and analytics. Try asking about adding vendors, comparing quotes, or reading scorecards.",
};

function getReply(text) {
  const lower = text.toLowerCase();
  for (const [key, reply] of Object.entries(AUTO_REPLIES)) {
    if (key !== 'default' && lower.includes(key)) return reply;
  }
  return AUTO_REPLIES.default;
}

function MessageBubble({ msg }) {
  const isBot = msg.role === 'assistant';
  return (
    <div className={`flex gap-2.5 items-end ${isBot ? '' : 'flex-row-reverse'}`}>
      {/* avatar */}
      <div className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 mb-0.5
        ${isBot ? 'bg-indigo-600' : 'bg-gray-200'}`}>
        {isBot
          ? <Bot size={14} className="text-white" />
          : <User size={14} className="text-gray-600" />}
      </div>
      {/* bubble */}
      <div className={`max-w-[78%] px-3.5 py-2.5 rounded-2xl text-sm leading-relaxed
        ${isBot
          ? 'bg-indigo-50 text-gray-800 rounded-bl-sm'
          : 'bg-indigo-600 text-white rounded-br-sm'}`}
        dangerouslySetInnerHTML={{
          __html: msg.text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>'),
        }}
      />
    </div>
  );
}

function TypingIndicator() {
  return (
    <div className="flex gap-2.5 items-end">
      <div className="w-7 h-7 rounded-full bg-indigo-600 flex items-center justify-center shrink-0">
        <Bot size={14} className="text-white" />
      </div>
      <div className="bg-indigo-50 px-4 py-3 rounded-2xl rounded-bl-sm flex gap-1 items-center">
        <span className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
        <span className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
        <span className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
      </div>
    </div>
  );
}

export default function AIAssistant() {
  const [open, setOpen]       = useState(false);
  const [messages, setMessages] = useState([INITIAL_MESSAGE]);
  const [input, setInput]     = useState('');
  const [typing, setTyping]   = useState(false);
  const [visible, setVisible] = useState(false);
  const bottomRef = useRef(null);
  const inputRef  = useRef(null);

  // animate chat panel mount/unmount
  useEffect(() => {
    if (open) {
      // next frame so CSS transition plays
      requestAnimationFrame(() => setVisible(true));
      setTimeout(() => inputRef.current?.focus(), 320);
    } else {
      setVisible(false);
    }
  }, [open]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, typing]);

  const send = (text) => {
    const trimmed = (text ?? input).trim();
    if (!trimmed) return;
    const userMsg = { id: Date.now(), role: 'user', text: trimmed };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setTyping(true);
    setTimeout(() => {
      setTyping(false);
      setMessages(prev => [...prev, {
        id: Date.now() + 1,
        role: 'assistant',
        text: getReply(trimmed),
      }]);
    }, 900 + Math.random() * 500);
  };

  return (
    <>
      {/* ── Floating button ── */}
      <button
        onClick={() => setOpen(o => !o)}
        aria-label="AI Assistant"
        className={`fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full shadow-2xl
          flex items-center justify-center transition-all duration-300
          ${open
            ? 'bg-gray-800 rotate-0 scale-100'
            : 'bg-indigo-600 hover:bg-indigo-700 hover:scale-110 scale-100'}
          focus:outline-none focus:ring-4 focus:ring-indigo-300`}
        style={{ boxShadow: open ? undefined : '0 0 0 0 rgba(99,102,241,0.5)' }}
      >
        {/* pulse ring — only when closed */}
        {!open && (
          <span className="absolute inset-0 rounded-full bg-indigo-400 opacity-40 animate-ping" />
        )}
        <span className={`transition-transform duration-300 ${open ? 'rotate-90' : 'rotate-0'}`}>
          {open ? <X size={22} className="text-white" /> : <MessageCircle size={22} className="text-white" />}
        </span>
      </button>

      {/* ── Chat panel ── */}
      {open && (
        <div
          className={`fixed bottom-24 right-6 z-50 w-[340px] max-h-[520px] flex flex-col
            bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden
            transition-all duration-300 origin-bottom-right
            ${visible ? 'opacity-100 scale-100 translate-y-0' : 'opacity-0 scale-90 translate-y-4'}`}
        >
          {/* header */}
          <div className="bg-indigo-600 px-4 py-3.5 flex items-center gap-3 shrink-0">
            <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
              <Sparkles size={15} className="text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-white font-semibold text-sm leading-none">VMS AI Assistant</p>
              <p className="text-indigo-200 text-xs mt-0.5">Always here to help</p>
            </div>
            <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
          </div>

          {/* messages */}
          <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3 min-h-0">
            {messages.map(msg => <MessageBubble key={msg.id} msg={msg} />)}
            {typing && <TypingIndicator />}
            <div ref={bottomRef} />
          </div>

          {/* quick prompts */}
          {messages.length <= 1 && (
            <div className="px-4 pb-2 flex flex-wrap gap-1.5 shrink-0">
              {QUICK_PROMPTS.map(p => (
                <button
                  key={p}
                  onClick={() => send(p)}
                  className="text-xs bg-indigo-50 text-indigo-600 border border-indigo-100
                    px-3 py-1.5 rounded-full hover:bg-indigo-100 transition"
                >
                  {p}
                </button>
              ))}
            </div>
          )}

          {/* input */}
          <div className="px-3 py-3 border-t border-gray-100 flex gap-2 shrink-0">
            <input
              ref={inputRef}
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && !e.shiftKey && send()}
              placeholder="Ask me anything…"
              className="flex-1 text-sm px-4 py-2.5 rounded-full border border-gray-200
                focus:outline-none focus:ring-2 focus:ring-indigo-300 bg-gray-50"
            />
            <button
              onClick={() => send()}
              disabled={!input.trim()}
              className="w-10 h-10 bg-indigo-600 rounded-full flex items-center justify-center
                hover:bg-indigo-700 disabled:opacity-40 disabled:cursor-not-allowed transition shrink-0"
            >
              <Send size={15} className="text-white" />
            </button>
          </div>
        </div>
      )}
    </>
  );
}
