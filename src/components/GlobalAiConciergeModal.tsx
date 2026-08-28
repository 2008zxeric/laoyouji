import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import {
  Bot,
  Send,
  X,
  Sparkles,
  PhoneCall,
  Volume2,
  VolumeX,
  Mic,
  MicOff,
  User,
  Heart,
  Footprints,
  Calendar,
  CalendarCheck,
  ShieldCheck,
  Trophy,
  ArrowRight,
  RefreshCw,
  Clock,
  MessageSquare,
  Building2,
  CheckCircle2,
  ExternalLink,
  Phone,
  Headphones,
} from 'lucide-react';
import { Activity, TournamentEvent } from '../types';

interface ActionButtonDef {
  text: string;
  actionType: 'open_booking' | 'open_activity_detail' | 'open_event_detail' | 'switch_to_itinerary' | 'switch_to_activities' | 'switch_to_events';
  targetId?: string;
  targetType?: 'activity' | 'event';
}

interface MatchedCardDef {
  id: string;
  type: 'activity' | 'event' | 'order';
  title: string;
  subtitle?: string;
  cover?: string;
  date?: string;
  price?: number;
  tag?: string;
  actionText?: string;
}

interface ChatMessage {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  spokenText?: string;
  time: string;
  isVoiceInput?: boolean;
  intent?: {
    type: string;
    title: string;
    actionButton?: ActionButtonDef;
  };
  matchedCards?: MatchedCardDef[];
  needHumanHelp?: boolean;
}

export const GlobalAiConciergeModal: React.FC = () => {
  const {
    isGlobalAiOpen,
    setIsGlobalAiOpen,
    globalAiInitialPrompt,
    setGlobalAiInitialPrompt,
    userProfile,
    currentTier,
    showToast,
    setSelectedActivity,
    setSelectedEvent,
    orders,
    activities,
    events,
    openBooking,
    isCareMode,
    isLargeFont,
  } = useApp();

  const [inputMessage, setInputMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [showHumanSupport, setShowHumanSupport] = useState(false);
  const [humanNote, setHumanNote] = useState('');
  const [humanSubmitted, setHumanSubmitted] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Voice output / Speech recognition
  const [isListening, setIsListening] = useState(false);
  const [autoPlayVoice, setAutoPlayVoice] = useState(true);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [currentSpeakingId, setCurrentSpeakingId] = useState<string | null>(null);
  const recognitionRef = useRef<any>(null);

  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome-1',
      sender: 'ai',
      text: `尊敬的${userProfile.name || '赵教授'}，您好！我是您的 24 小时 AI 专属伴游管家「小老友」。\n\n您可随时问我：\n• 🎙️ “我下周有哪些研学活动？”\n• 🎙️ “帮我预定一场近期的高端讲座”\n• 🎙️ “查查我的会员积分与抵扣规则”\n• 🎙️ “这趟线路适合高血压每天4000步的老友吗？”\n\n如果遇到任何复杂问题或需要人工沟通，我随时为您一键转接真人专属金牌管家！`,
      spokenText: `赵教授您好！我是您的AI伴游管家小老友。您可以直接问我活动安排、讲座预订或积分规则，随时为您贴心服务！`,
      time: '刚刚',
    },
  ]);

  const quickPrompts = [
    {
      label: '🗓️ 下周活动日程',
      query: '我下周有哪些研学活动？',
    },
    {
      label: '🏛️ 预定高端讲座',
      query: '帮我预定一场近期的高端讲座',
    },
    {
      label: '💰 积分如何抵扣',
      query: '请问名仕积分怎么赚，报名怎么抵扣现金？',
    },
    {
      label: '🏃 适老步数测评',
      query: '推荐平缓慢步每天4000步以内的文化养生路线',
    },
    {
      label: '👩‍💼 转接真人客服',
      query: '我想联系真人客服电话和管家服务',
    },
  ];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isGlobalAiOpen) {
      scrollToBottom();
      if (globalAiInitialPrompt) {
        handleSendMessage(globalAiInitialPrompt);
        setGlobalAiInitialPrompt('');
      }
    }
  }, [isGlobalAiOpen, globalAiInitialPrompt]);

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  // Speech synthesis readout
  const speakText = (text: string, msgId: string) => {
    if (!('speechSynthesis' in window)) {
      showToast('当前浏览器暂不支持语音播报');
      return;
    }

    if (isSpeaking && currentSpeakingId === msgId) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      setCurrentSpeakingId(null);
      return;
    }

    window.speechSynthesis.cancel();
    const cleanText = text
      .replace(/[*#_`~]/g, '')
      .replace(/\n+/g, '，')
      .replace(/https?:\/\/[^\s]+/g, '');

    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.lang = 'zh-CN';
    utterance.rate = 0.88; // Calm, respectful pace for elders
    utterance.pitch = 1.0;

    utterance.onstart = () => {
      setIsSpeaking(true);
      setCurrentSpeakingId(msgId);
    };

    utterance.onend = () => {
      setIsSpeaking(false);
      setCurrentSpeakingId(null);
    };

    utterance.onerror = () => {
      setIsSpeaking(false);
      setCurrentSpeakingId(null);
    };

    window.speechSynthesis.speak(utterance);
  };

  // Web Speech recognition
  const toggleVoiceInput = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      showToast('浏览器未开放原生麦克风，已为您填入常用语音');
      setInputMessage('我下周有哪些研学活动？');
      return;
    }

    if (isListening) {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      setIsListening(false);
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.lang = 'zh-CN';
      recognition.continuous = false;
      recognition.interimResults = false;

      recognition.onstart = () => {
        setIsListening(true);
        showToast('正在聆听，请说出您的问题...');
      };

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        if (transcript) {
          setInputMessage(transcript);
          handleSendMessage(transcript, true);
        }
      };

      recognition.onerror = () => {
        setIsListening(false);
        showToast('语音识别未获取到内容，请重试或打字');
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
      recognition.start();
    } catch {
      setIsListening(false);
      showToast('无法启动麦克风权限');
    }
  };

  const handleSendMessage = async (textToSend?: string, isVoice = false) => {
    const query = (textToSend || inputMessage).trim();
    if (!query || loading) return;

    // Check if query is directly asking for human support
    const isAskingHuman =
      query.includes('人工') ||
      query.includes('电话') ||
      query.includes('真人') ||
      query.includes('找人') ||
      query.includes('投诉') ||
      query.includes('纠纷') ||
      query.includes('退款不满意');

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: query,
      isVoiceInput: isVoice,
      time: new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputMessage('');
    setLoading(true);

    try {
      const res = await fetch('/api/ai-concierge', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: query,
          history: messages.slice(-6).map((m) => ({
            role: m.sender === 'user' ? 'user' : 'assistant',
            content: m.text,
          })),
          userContext: {
            name: userProfile.name,
            level: currentTier.name,
            points: userProfile.points,
          },
          activities,
          events,
          orders,
        }),
      });

      if (!res.ok) throw new Error('网络异常');
      const data = await res.json();

      const aiMsg: ChatMessage = {
        id: `ai-${Date.now()}`,
        sender: 'ai',
        text: data.reply || '小老友已收到您的问题，正在为您处理。',
        spokenText: data.spokenText || data.reply,
        intent: data.intent,
        matchedCards: data.matchedCards,
        needHumanHelp: isAskingHuman || data.needHumanHelp,
        time: new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages((prev) => [...prev, aiMsg]);

      if (autoPlayVoice && data.spokenText) {
        setTimeout(() => speakText(data.spokenText, aiMsg.id), 300);
      }
    } catch {
      // Fallback
      let fallbackText = `尊敬的${userProfile.name || '赵教授'}，小老友已为您记录您的问题。\n\n针对您的咨询，若当前线上答复不够详尽，您可以随时点击下方专属通道联系我们的真人金牌管家，我们将竭诚为您服务！`;
      if (query.includes('下周') || query.includes('日程') || query.includes('我的行程')) {
        fallbackText = `尊敬的${userProfile.name || '赵教授'}，您已报名确认近期行程：\n• **《江南文脉·苏州园林美学与昆曲私享名师慢游 5日》** (2026年9月26日发班)\n• 随团名师：钱仲祥教授\n• 随团管家：小林管家（红十字急救认证）\n\n已为您匹配对应行程卡片，可直接点击查看！`;
      }

      const fallbackMsg: ChatMessage = {
        id: `ai-${Date.now()}`,
        sender: 'ai',
        text: fallbackText,
        spokenText: `赵教授，小老友已为您查到行程信息。如果需要更详细的人工协助，欢迎随时点击真人热线！`,
        needHumanHelp: isAskingHuman,
        time: new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, fallbackMsg]);
    } finally {
      setLoading(false);
    }
  };

  const handleActionClick = (action: ActionButtonDef) => {
    setIsGlobalAiOpen(false);
    if (action.actionType === 'open_booking' && action.targetId) {
      const act = activities.find((a) => a.id === action.targetId);
      if (act) openBooking('activity', act);
    } else if (action.actionType === 'open_activity_detail' && action.targetId) {
      const act = activities.find((a) => a.id === action.targetId);
      if (act) setSelectedActivity(act);
    } else if (action.actionType === 'open_event_detail' && action.targetId) {
      const evt = events.find((e) => e.id === action.targetId);
      if (evt) setSelectedEvent(evt);
    }
  };

  const handleCardClick = (card: MatchedCardDef) => {
    setIsGlobalAiOpen(false);
    if (card.type === 'activity') {
      const act = activities.find((a) => a.id === card.id);
      if (act) setSelectedActivity(act);
    } else if (card.type === 'event') {
      const evt = events.find((e) => e.id === card.id);
      if (evt) setSelectedEvent(evt);
    }
  };

  const submitHumanTicket = (e: React.FormEvent) => {
    e.preventDefault();
    setHumanSubmitted(true);
    showToast('专属金牌管家已收到您的诉求，将在 30 分钟内主动致电您！');
    setTimeout(() => {
      setShowHumanSupport(false);
      setHumanSubmitted(false);
      setHumanNote('');
    }, 2500);
  };

  if (!isGlobalAiOpen) {
    return (
      <aside aria-label="智能伴游与AI客服快捷入口" className="fixed bottom-24 right-4 z-40 flex flex-col items-end gap-2 pointer-events-auto">
        <button
          onClick={() => setIsGlobalAiOpen(true)}
          className="group flex items-center gap-2 bg-gradient-to-r from-[#2C3E50] via-[#34495e] to-[#1a252f] text-white p-3 sm:px-4 sm:py-3 rounded-full shadow-2xl border-2 border-[#D4AF37] hover:scale-105 active:scale-95 transition-all duration-300 cursor-pointer"
          title="点击打开 24h 智能伴游管家「小老友」"
        >
          <div className="relative">
            <span className="w-8 h-8 rounded-full bg-[#D4AF37]/20 flex items-center justify-center text-[#D4AF37]">
              <Bot className="w-5 h-5" />
            </span>
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping"></span>
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
          </div>
          <div className="text-left hidden sm:block">
            <div className="text-xs font-serif font-bold text-amber-200 flex items-center gap-1">
              <span>小老友 AI 管家</span>
              <Sparkles className="w-3 h-3 text-[#D4AF37]" />
            </div>
            <div className="text-[10px] text-stone-300">语音问答 · 随时答疑</div>
          </div>
        </button>
      </aside>
    );
  }

  return (
    <div className="fixed inset-0 z-60 bg-black/70 backdrop-blur-sm flex justify-center items-end sm:items-center p-0 sm:p-4 animate-fadeIn">
      <div className="bg-[#FAF9F6] rounded-t-3xl sm:rounded-3xl w-full max-w-xl h-[88vh] sm:h-[82vh] overflow-hidden shadow-2xl flex flex-col border border-[#EAE6DF] relative">
        {/* Header */}
        <div className="bg-[#2C3E50] text-[#FAF9F6] px-5 py-3.5 flex items-center justify-between shadow-md border-b border-[#D4AF37]/30 shrink-0">
          <div className="flex items-center space-x-3">
            <div className="relative">
              <div className="w-10 h-10 rounded-full bg-[#D4AF37]/20 border border-[#D4AF37]/40 flex items-center justify-center text-[#D4AF37]">
                <Bot className="w-6 h-6" />
              </div>
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 absolute bottom-0 right-0 ring-2 ring-[#2C3E50]"></span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-serif italic font-bold text-base md:text-lg text-amber-50">
                  小老友 · 乐龄智能伴游
                </h3>
                <span className="bg-[#D4AF37] text-stone-950 text-[10px] font-bold px-2 py-0.5 rounded-full">
                  文旅专属 AI
                </span>
              </div>
              <p className="text-[11px] text-amber-200/90 flex items-center gap-1.5">
                <span>服务于 {userProfile.name || '赵教授'} · {currentTier.name}</span>
                <span>·</span>
                <span className="text-[10px] text-stone-300">专注本站研学/赛事/适老健康</span>
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => setAutoPlayVoice(!autoPlayVoice)}
              className={`p-2 rounded-xl text-xs transition-colors cursor-pointer flex items-center gap-1 ${
                autoPlayVoice
                  ? 'bg-amber-500/20 text-[#D4AF37] border border-[#D4AF37]/40'
                  : 'bg-white/10 text-stone-400 hover:text-white'
              }`}
              title={autoPlayVoice ? '语音朗读已开启' : '语音朗读已静音'}
            >
              {autoPlayVoice ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
            </button>

            <button
              onClick={() => setShowHumanSupport(true)}
              className="bg-emerald-700 hover:bg-emerald-600 text-white text-xs px-2.5 py-1.5 rounded-xl font-bold flex items-center gap-1 shadow-sm transition-transform active:scale-95 cursor-pointer"
              title="一键转接真人金牌管家"
            >
              <Headphones className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">转真人</span>
            </button>

            <button
              onClick={() => setIsGlobalAiOpen(false)}
              className="w-8 h-8 rounded-full bg-black/20 hover:bg-black/40 flex items-center justify-center text-white cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Message Stream */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-[#FAF9F6]">
          {messages.map((msg) => {
            const isUser = msg.sender === 'user';
            return (
              <div
                key={msg.id}
                className={`flex gap-3 items-start ${isUser ? 'flex-row-reverse' : 'flex-row'}`}
              >
                {!isUser ? (
                  <div className="w-9 h-9 rounded-full bg-[#2C3E50] border border-[#D4AF37]/40 flex items-center justify-center text-[#D4AF37] shrink-0 mt-0.5 shadow-xs">
                    <Bot className="w-5 h-5" />
                  </div>
                ) : (
                  <div className="w-9 h-9 rounded-full bg-amber-700 text-white flex items-center justify-center shrink-0 font-serif font-bold text-sm shadow-xs">
                    {userProfile.name ? userProfile.name.slice(0, 1) : '我'}
                  </div>
                )}

                <div className={`max-w-[85%] sm:max-w-[78%] space-y-2`}>
                  <div
                    className={`rounded-2xl p-3.5 shadow-xs ${
                      isUser
                        ? 'bg-[#2C3E50] text-amber-50 rounded-tr-none'
                        : 'bg-white text-stone-800 border border-[#EAE6DF] rounded-tl-none'
                    } ${isLargeFont ? 'text-[17px] leading-relaxed' : 'text-sm leading-relaxed'}`}
                  >
                    <div className="whitespace-pre-wrap">{msg.text}</div>

                    {!isUser && (
                      <div className="mt-2 pt-2 border-t border-stone-100 flex items-center justify-between text-[11px] text-stone-400">
                        <span>AI 智能生成 · 适老研学保障</span>
                        {msg.spokenText && (
                          <button
                            onClick={() => speakText(msg.spokenText!, msg.id)}
                            className="text-[#85660d] hover:text-[#5c4609] font-bold flex items-center gap-1 cursor-pointer"
                          >
                            <Volume2 className="w-3.5 h-3.5" />
                            <span>{currentSpeakingId === msg.id && isSpeaking ? '停止朗读' : '朗读给长辈'}</span>
                          </button>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Intent Action Button */}
                  {msg.intent?.actionButton && (
                    <div className="animate-fadeIn">
                      <button
                        onClick={() => handleActionClick(msg.intent!.actionButton!)}
                        className="w-full bg-gradient-to-r from-[#D4AF37] to-[#C5A028] hover:from-[#C5A028] hover:to-[#B59020] text-stone-950 font-bold px-4 py-2.5 rounded-xl text-sm shadow-md flex items-center justify-center gap-2 cursor-pointer transition-transform active:scale-98"
                      >
                        <Sparkles className="w-4 h-4" />
                        <span>{msg.intent.actionButton.text}</span>
                        <ArrowRight className="w-4 h-4" />
                      </button>
                    </div>
                  )}

                  {/* Matched Product Cards */}
                  {msg.matchedCards && msg.matchedCards.length > 0 && (
                    <div className="space-y-2 pt-1 animate-fadeIn">
                      {msg.matchedCards.map((card) => (
                        <div
                          key={card.id}
                          onClick={() => handleCardClick(card)}
                          className="bg-white rounded-xl p-3 border border-[#EAE6DF] hover:border-[#D4AF37]/50 shadow-xs cursor-pointer transition-all flex items-center gap-3 group"
                        >
                          {card.cover && (
                            <img
                              src={card.cover}
                              alt={card.title}
                              className="w-14 h-14 rounded-lg object-cover shrink-0"
                            />
                          )}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-1.5">
                              {card.tag && (
                                <span className="bg-amber-100 text-[#85660d] text-[10px] font-bold px-1.5 py-0.2 rounded">
                                  {card.tag}
                                </span>
                              )}
                              <h4 className="font-serif font-bold text-xs text-stone-900 truncate">
                                {card.title}
                              </h4>
                            </div>
                            <div className="text-[11px] text-stone-500 truncate mt-0.5">
                              {card.subtitle || card.date}
                            </div>
                            {card.price && (
                              <div className="text-rose-700 font-serif font-bold text-xs mt-0.5">
                                ¥{card.price} 起
                              </div>
                            )}
                          </div>
                          <span className="text-[11px] text-[#2C3E50] font-bold group-hover:translate-x-1 transition-transform">
                            {card.actionText || '查看 ›'}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Human Help Notification Triggered */}
                  {msg.needHumanHelp && (
                    <div className="bg-emerald-50 rounded-2xl p-3.5 border border-emerald-200 text-xs space-y-2 animate-fadeIn">
                      <div className="font-bold text-emerald-900 flex items-center gap-1.5">
                        <Headphones className="w-4 h-4 text-emerald-700" />
                        <span>检测到您可能需要真人协助，为您推荐金牌真人服务：</span>
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <a
                          href="tel:18100129722"
                          className="bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl py-2 px-3 flex items-center justify-center gap-1.5 font-bold shadow-xs text-center"
                        >
                          <Phone className="w-3.5 h-3.5" />
                          <span>拨打 18100129722</span>
                        </a>
                        <button
                          onClick={() => setShowHumanSupport(true)}
                          className="bg-white border border-emerald-300 text-emerald-900 rounded-xl py-2 px-3 flex items-center justify-center gap-1.5 font-bold hover:bg-emerald-100"
                        >
                          <MessageSquare className="w-3.5 h-3.5 text-emerald-700" />
                          <span>在线登记回访</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}

          {loading && (
            <div className="flex items-center gap-2 text-xs text-stone-500 bg-white p-3 rounded-2xl border border-stone-200 w-fit">
              <RefreshCw className="w-4 h-4 text-[#D4AF37] animate-spin" />
              <span>小老友正在为您检索研学日程与慢游方案...</span>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Quick Voice & Semantic Prompts */}
        <div className="px-3 py-2 bg-stone-100/90 border-t border-[#EAE6DF] flex items-center gap-1.5 overflow-x-auto no-scrollbar shrink-0">
          {quickPrompts.map((p, idx) => (
            <button
              key={idx}
              onClick={() => handleSendMessage(p.query)}
              className="bg-white hover:bg-stone-50 text-stone-700 text-xs font-semibold px-3 py-1.5 rounded-full border border-stone-200 whitespace-nowrap shadow-2xs transition-transform active:scale-95 cursor-pointer"
            >
              {p.label}
            </button>
          ))}
        </div>

        {/* Bottom Input & Microphone Area */}
        <div className="p-3 bg-white border-t border-[#EAE6DF] shrink-0">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="flex items-center gap-2"
          >
            {/* Big Senior Mic Button */}
            <button
              type="button"
              onClick={toggleVoiceInput}
              className={`w-11 h-11 rounded-2xl flex items-center justify-center transition-all cursor-pointer ${
                isListening
                  ? 'bg-rose-600 text-white animate-pulse shadow-lg scale-105'
                  : 'bg-[#2C3E50] text-[#D4AF37] hover:bg-[#1a252f]'
              }`}
              title={isListening ? '正在录音中，点击发送' : '点击按住开始说出问题'}
            >
              {isListening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
            </button>

            <input
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              placeholder="说出或输入您的问题（如：下周去哪玩？）..."
              className="flex-1 px-4 py-2.5 rounded-2xl bg-stone-100 border border-stone-200 text-sm focus:outline-none focus:bg-white focus:border-[#2C3E50]"
            />

            <button
              type="submit"
              disabled={!inputMessage.trim() || loading}
              className="px-4 py-2.5 rounded-2xl bg-[#2C3E50] hover:bg-[#1a252f] disabled:opacity-40 text-[#D4AF37] font-bold text-sm flex items-center gap-1 transition-transform active:scale-95 cursor-pointer"
            >
              <Send className="w-4 h-4" />
              <span>发送</span>
            </button>
          </form>
        </div>

        {/* Human Escalation Modal Sub-Drawer */}
        {showHumanSupport && (
          <div className="absolute inset-0 bg-black/60 z-50 flex items-center justify-center p-4 animate-fadeIn">
            <div className="bg-white rounded-3xl p-5 max-w-sm w-full space-y-4 shadow-2xl border border-stone-200">
              <div className="flex items-center justify-between border-b border-stone-100 pb-2">
                <div className="flex items-center gap-2 font-serif font-bold text-stone-900 text-base">
                  <Headphones className="w-5 h-5 text-emerald-700" />
                  <span>真人专属金牌管家服务</span>
                </div>
                <button
                  onClick={() => setShowHumanSupport(false)}
                  className="text-stone-400 hover:text-stone-700"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {humanSubmitted ? (
                <div className="text-center py-6 space-y-2">
                  <CheckCircle2 className="w-12 h-12 text-emerald-600 mx-auto" />
                  <h4 className="font-bold text-stone-900">登记成功</h4>
                  <p className="text-xs text-stone-500">
                    专属管家已收到您的诉求，将尽快拨打您的预留电话沟通！
                  </p>
                </div>
              ) : (
                <form onSubmit={submitHumanTicket} className="space-y-3 text-xs">
                  <div className="bg-amber-50 p-3 rounded-xl border border-amber-200 text-amber-950 leading-relaxed">
                    🌟 <strong>直拨热线：</strong>
                    <a href="tel:18100129722" className="text-emerald-800 font-bold underline ml-1">
                      18100129722
                    </a>
                    （每日 9:00-21:00 乐龄专人接听）
                  </div>

                  <div>
                    <label className="block text-stone-700 font-bold mb-1">
                      留言诉求（我们将指派专家研学管家与您沟通）：
                    </label>
                    <textarea
                      rows={3}
                      value={humanNote}
                      onChange={(e) => setHumanNote(e.target.value)}
                      placeholder="请简要写下您的特殊出游、用药护理、定制慢游或退改诉求..."
                      className="w-full p-2.5 bg-stone-50 border border-stone-200 rounded-xl resize-none text-xs focus:outline-none focus:border-emerald-600"
                      required
                    />
                  </div>

                  <div className="text-[11px] text-stone-400">
                    联系人：{userProfile.name} ({userProfile.phone})
                  </div>

                  <button
                    type="submit"
                    className="w-full py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl font-bold shadow-xs transition-colors"
                  >
                    提交需求 · 安排管家回电
                  </button>
                </form>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
