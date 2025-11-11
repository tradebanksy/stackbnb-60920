import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Send } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";

interface Message {
  role: "user" | "assistant";
  content: string;
}

const TripPlannerChat = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content:
        "🌴 Hello! I'm JC, your AI travel assistant. I can help you discover amazing restaurants and excursions for your trip. Where are you planning to visit?",
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const scrollToBottom = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  };

  // 🧠 Smart typing animation based on message length
  const typeOutMessage = (fullText: string) => {
    return new Promise<void>((resolve) => {
      setIsTyping(true);
      let index = 0;

      // Dynamically adjust typing speed by message length
      const length = fullText.length;
      let speed = 20; // default
      if (length < 80) speed = 10;
      else if (length < 300) speed = 20;
      else speed = 35;

      setMessages((prev) => [...prev, { role: "assistant", content: "" }]);

      const interval = setInterval(() => {
        setMessages((prev) => {
          const updated = [...prev];
          updated[updated.length - 1].content = fullText.slice(0, index);
          return updated;
        });
        index++;
        if (index > fullText.length) {
          clearInterval(interval);
          setIsTyping(false);
          resolve();
        }
      }, speed);
    });
  };

  const sendMessage = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput("");
    setMessages((prev) => [...prev, { role: "user", content: userMessage }]);
    setIsLoading(true);

    try {
      const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/trip-planner-chat`;
      const response = await fetch(CHAT_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({
          messages: [...messages, { role: "user", content: userMessage }],
        }),
      });

      if (!response.ok) {
        if (response.status === 429 || response.status === 402) {
          const error = await response.json();
          throw new Error(error.error);
        }
        throw new Error("Failed to get response");
      }

      const data = await response.json();
      const assistantMessage = data?.reply || "I'm here to help! Can you try again?";

      await typeOutMessage(assistantMessage);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to send message",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="h-screen bg-gradient-to-b from-blue-50 to-emerald-50 flex flex-col">
      <div className="max-w-[420px] mx-auto w-full flex flex-col h-full border-x border-gray-200 relative">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b bg-white/80 backdrop-blur-sm sticky top-0 z-10">
          <Button variant="ghost" size="icon" onClick={() => navigate("/appview")}>
            <ArrowLeft className="h-5 w-5 text-gray-700" />
          </Button>
          <h1 className="text-lg font-bold text-gray-800">Trip Planner</h1>
          <div className="w-10" />
        </div>

        {/* Chat Messages */}
        <ScrollArea ref={scrollRef} className="flex-1 p-4">
          <div className="space-y-4">
            {messages.map((message, index) => (
              <div
                key={index}
                className={`flex ${
                  message.role === "user" ? "justify-end" : "justify-start"
                }`}
              >
                <Card
                  className={`max-w-[80%] p-3 rounded-2xl shadow-md ${
                    message.role === "user"
                      ? "bg-gradient-to-r from-orange-400 to-pink-500 text-white"
                      : "bg-white text-gray-800 border border-gray-100"
                  }`}
                >
                  <p
                    className={`text-sm leading-relaxed whitespace-pre-wrap ${
                      message.role === "assistant" ? "chat-link-styles" : ""
                    }`}
                    dangerouslySetInnerHTML={{ __html: message.content }}
                  />
                </Card>
              </div>
            ))}

            {(isLoading || isTyping) && (
              <div className="flex justify-start">
                <Card className="max-w-[80%] p-3 bg-white/80 shadow-sm flex items-center gap-1">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:-0.3s]" />
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:-0.15s]" />
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" />
                </Card>
              </div>
            )}
          </div>
        </ScrollArea>

        {/* Input Bar */}
        <div className="p-4 border-t bg-white/80 backdrop-blur-sm sticky bottom-0">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              sendMessage();
            }}
            className="flex gap-2"
          >
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask me a question..."
              disabled={isLoading || isTyping}
              className="text-sm"
            />
            <Button
              type="submit"
              size="icon"
              disabled={isLoading || isTyping || !input.trim()}
              className="bg-orange-500 hover:bg-orange-600 text-white"
            >
              <Send className="h-4 w-4" />
            </Button>
          </form>
        </div>
      </div>

      {/* Link styling */}
      <style>{`
        .chat-link-styles a {
          color: #059669; /* teal-600 */
          text-decoration: none;
          font-weight: 500;
          transition: all 0.2s ease;
        }
        .chat-link-styles a:hover {
          color: #047857;
          text-decoration: underline;
        }
      `}</style>
    </div>
  );
};

export default TripPlannerChat;
