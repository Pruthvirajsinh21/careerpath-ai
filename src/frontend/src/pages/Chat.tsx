import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { Bot, Briefcase, Send, User } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useRef, useState } from "react";
import type { JobMatchResult } from "../backend.d";
import { useAddMessage, useConversationHistory } from "../hooks/useQueries";

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
  matches?: JobMatchResult[];
}

export default function Chat() {
  const { data: history, isLoading } = useConversationHistory();
  const { mutateAsync: addMessage, isPending } = useAddMessage();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const historyLoaded = useRef(false);

  useEffect(() => {
    if (history && !historyLoaded.current) {
      historyLoaded.current = true;
      const msgs: ChatMessage[] = history.map((m) => ({
        role: m.role === "user" ? "user" : "assistant",
        content: m.content,
      }));
      if (msgs.length === 0) {
        msgs.push({
          role: "assistant",
          content:
            "Hello! I'm your AI Career Advisor. I can help you explore career paths, find job matches, and guide your professional journey. What would you like to know?",
        });
      }
      setMessages(msgs);
    }
  }, [history]);

  // biome-ignore lint/correctness/useExhaustiveDependencies: intentional scroll trigger
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  const handleSend = async () => {
    const content = input.trim();
    if (!content || isPending) return;
    setInput("");

    const userMsg: ChatMessage = { role: "user", content };
    setMessages((prev) => [...prev, userMsg]);
    setIsTyping(true);

    try {
      const response = await addMessage({ role: "user", content });
      setIsTyping(false);
      const assistantMsg: ChatMessage = {
        role: "assistant",
        content: response.response,
        matches: response.matches.length > 0 ? response.matches : undefined,
      };
      setMessages((prev) => [...prev, assistantMsg]);
    } catch {
      setIsTyping(false);
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "Sorry, I encountered an error. Please try again.",
        },
      ]);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const getGrowthColor = (outlook: string) => {
    const o = outlook.toLowerCase();
    if (o.includes("excellent")) return "text-emerald-600";
    if (o.includes("good")) return "text-yellow-600";
    return "text-muted-foreground";
  };

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)] lg:h-screen max-h-screen">
      {/* Chat Header */}
      <div className="flex items-center gap-3 px-6 py-4 border-b bg-card flex-shrink-0">
        <div className="w-10 h-10 rounded-xl gradient-card flex items-center justify-center">
          <Bot className="w-5 h-5 text-white" />
        </div>
        <div>
          <h2 className="font-display font-bold">AI Career Advisor</h2>
          <p className="text-xs text-muted-foreground">
            Powered by AI — ask me anything about your career
          </p>
        </div>
      </div>

      {/* Messages */}
      <ScrollArea className="flex-1 px-4 py-6">
        {isLoading ? (
          <div className="space-y-4 max-w-2xl mx-auto">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className={cn("flex gap-3", i % 2 === 0 ? "justify-end" : "")}
              >
                <Skeleton className="h-16 w-64 rounded-2xl" />
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-4 max-w-2xl mx-auto">
            <AnimatePresence initial={false}>
              {messages.map((msg, i) => (
                <motion.div
                  // biome-ignore lint/suspicious/noArrayIndexKey: message list index
                  key={`msg-${i}`}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2 }}
                  className={cn(
                    "flex gap-3",
                    msg.role === "user" ? "justify-end" : "justify-start",
                  )}
                  data-ocid={`chat.message.item.${i + 1}`}
                >
                  {msg.role === "assistant" && (
                    <div className="w-8 h-8 rounded-full gradient-card flex items-center justify-center flex-shrink-0 mt-1">
                      <Bot className="w-4 h-4 text-white" />
                    </div>
                  )}
                  <div
                    className={cn(
                      "max-w-[80%] space-y-3",
                      msg.role === "user" ? "items-end" : "items-start",
                    )}
                  >
                    <div
                      className={cn(
                        "px-4 py-3 rounded-2xl text-sm leading-relaxed",
                        msg.role === "user"
                          ? "bg-accent text-accent-foreground rounded-br-sm"
                          : "bg-secondary text-foreground rounded-bl-sm",
                      )}
                    >
                      {msg.content}
                    </div>
                    {msg.matches && msg.matches.length > 0 && (
                      <div className="space-y-2">
                        <p className="text-xs font-semibold text-muted-foreground px-1">
                          Suggested Jobs:
                        </p>
                        {msg.matches.map((match, j) => (
                          <div
                            // biome-ignore lint/suspicious/noArrayIndexKey: match list index
                            key={`match-${j}`}
                            data-ocid={`chat.job_match.item.${j + 1}`}
                            className="bg-card border rounded-xl p-3 shadow-xs"
                          >
                            <div className="flex items-start justify-between mb-1">
                              <div className="flex items-center gap-2">
                                <Briefcase className="w-4 h-4 text-accent flex-shrink-0" />
                                <span className="font-semibold text-sm">
                                  {match.job.title}
                                </span>
                              </div>
                              <span
                                className={cn(
                                  "text-xs font-bold",
                                  getGrowthColor(match.job.growthOutlook),
                                )}
                              >
                                {match.job.growthOutlook}
                              </span>
                            </div>
                            <p className="text-xs text-muted-foreground mb-2 ml-6">
                              {match.job.salaryRange}
                            </p>
                            <div className="ml-6">
                              <div className="flex justify-between text-xs mb-1">
                                <span className="text-muted-foreground">
                                  Match
                                </span>
                                <span className="font-semibold text-accent">
                                  {Number(match.score)}%
                                </span>
                              </div>
                              <Progress
                                value={Number(match.score)}
                                className="h-1.5"
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                  {msg.role === "user" && (
                    <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center flex-shrink-0 mt-1">
                      <User className="w-4 h-4 text-muted-foreground" />
                    </div>
                  )}
                </motion.div>
              ))}
            </AnimatePresence>

            {/* Typing indicator */}
            <AnimatePresence>
              {isTyping && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  className="flex gap-3 justify-start"
                  data-ocid="chat.typing.loading_state"
                >
                  <div className="w-8 h-8 rounded-full gradient-card flex items-center justify-center flex-shrink-0">
                    <Bot className="w-4 h-4 text-white" />
                  </div>
                  <div className="px-4 py-3 rounded-2xl rounded-bl-sm bg-secondary">
                    <div className="flex gap-1 items-center h-4">
                      {[0, 1, 2].map((i) => (
                        <motion.div
                          key={i}
                          className="w-1.5 h-1.5 rounded-full bg-muted-foreground"
                          animate={{ y: [0, -4, 0] }}
                          transition={{
                            duration: 0.6,
                            delay: i * 0.15,
                            repeat: Number.POSITIVE_INFINITY,
                          }}
                        />
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <div ref={bottomRef} />
          </div>
        )}
      </ScrollArea>

      {/* Input */}
      <div className="flex-shrink-0 border-t bg-card px-4 py-4">
        <div className="max-w-2xl mx-auto flex gap-3 items-end">
          <textarea
            ref={inputRef}
            data-ocid="chat.textarea"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask your AI advisor anything about your career..."
            rows={1}
            className="flex-1 resize-none rounded-xl border bg-background px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring transition min-h-[44px] max-h-32"
            style={{ height: "auto" }}
            onInput={(e) => {
              const t = e.currentTarget;
              t.style.height = "auto";
              t.style.height = `${Math.min(t.scrollHeight, 128)}px`;
            }}
          />
          <Button
            data-ocid="chat.send.primary_button"
            onClick={handleSend}
            disabled={!input.trim() || isPending}
            className="h-11 w-11 p-0 rounded-xl gradient-card text-white border-0 hover:opacity-90 flex-shrink-0"
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
