import React, { useState, useRef, useEffect, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { SmartItineraryManager } from './SmartItineraryManager';
import { MyItineraryTimelineView } from './MyItineraryTimelineView';
import { AiSlowTravelPlanner } from './AiSlowTravelPlanner';
import {
  Bot,
  Send,
  Sparkles,
  User,
  Heart,
  Volume2,
  VolumeX,
  RefreshCw,
  Award,
  Footprints,
  ShieldCheck,
  Trophy,
  Compass,
  MessageSquare,
  Calendar,
  CalendarCheck,
  Smartphone,
  Mic,
  MicOff,
  Radio,
  Zap,
  ChevronRight,
  ExternalLink,
  BookOpen,
  MapPin,
  Clock,
  CheckCircle2,
  ArrowRight,
  Sliders,
  Phone,
  Headphones,
} from 'lucide-react';
import { Activity, TournamentEvent } from '../types';

interface ActionButtonDef {
  text: string;
  actionType: 'open_booking' | 'open_activity_detail' | 'open_event_detail' | 'switch_to_itinerary' | 'switch_to_activities' | 'switch_to_events' | 'switch_to_planner';
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
  actions?: ActionButtonDef[];
}

export const AiConciergeView: React.FC = () => {
  const {
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

  // Mode: 'planner' | 'chat' | 'my_itinerary' | 'smart_recommendations'
  const [activeSubTab, setActiveSubTab] = useState<'planner' | 'chat' | 'my_itinerary' | 'smart_recommendations'>('planner');

  const [inputMessage, setInputMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Voice Interaction State
  const [isListening, setIsListening] = useState(false);
  const [voiceTranscript, setVoiceTranscript] = useState('');
  const [speechError, setSpeechError] = useState<string | null>(null);
  const [autoPlayVoice, setAutoPlayVoice] = useState(true); // Elderly voice auto-readout
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [currentSpeakingMsgId, setCurrentSpeakingMsgId] = useState<string | null>(null);
  const [voiceSpeed, setVoiceSpeed] = useState<0.85 | 1.0>(0.9 as 0.85); // 0.85x gentle elder pace
  const [showVoiceRecordingModal, setShowVoiceRecordingModal] = useState(false);
  const [showHumanModal, setShowHumanModal] = useState(false);
  const [humanCallbackPhone, setHumanCallbackPhone] = useState('13800138000');
  const [humanCallbackRemark, setHumanCallbackRemark] = useState('');
  const recognitionRef = useRef<any>(null);

  // Count confirmed orders for badge
  const bookedTripsCount = useMemo(() => {
    return orders.filter(
      (o) => o.status === 'paid' || o.status === 'travelling' || o.status === 'completed'
    ).length;
  }, [orders]);

  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'msg-1',
      sender: 'ai',
      text: `赵教授，您好！我是您的AI专属伴游管家“小老友”。\n\n已为您开启【语音语义查询与3日慢游定制】服务！您可直接长按或点击下方大号麦克风，说出：\n• 🎙️ “帮我规划一份3天苏州园林慢游行程”\n• 🎙️ “我下周有哪些研学活动？”\n• 🎙️ “帮我预定一场近期的高端讲座”\n• 🎙️ “查查我的积分与免单房差特权”\n\n小老友不仅为您耐心解答，还会为您自动生成适老5星慢游计划并直接唤起预订与日程！`,
      spokenText: `赵教授您好！我是您的AI伴游管家小老友。您现在可以直接语音对我说，帮我规划一份3天苏州园林慢游行程，或者我下周有哪些研学活动，小老友随时为您服务！`,
      time: '刚才',
      actions: [
        {
          text: '✨ 体验 3 日慢游定制规划',
          actionType: 'switch_to_planner',
        },
        {
          text: '📅 查看我的行程时间轴',
          actionType: 'switch_to_itinerary',
        },
      ],
    },
  ]);

  const voicePresetPrompts = [
    {
      label: '✨ 帮我规划3天苏州园林慢游',
      query: '请帮我规划一份3天苏州园林慢游行程，要求日均步数在4000步以内，下午有2小时午休，随团有急救医护保障',
      desc: 'AI 自动生成适老五星慢游研学行程',
    },
    {
      label: '✨ 定制3天黄山徽州温泉慢养',
      query: '请帮我定制一份3天黄山徽州古村与温泉养生行程，少爬台阶，餐饮少盐低糖',
      desc: '道医温泉理疗与徽州名家导赏',
    },
    {
      label: '🎙️ 我下周有哪些研学活动？',
      query: '我下周有哪些研学活动？',
      desc: '查询已报名行程与近期发班日程',
    },
    {
      label: '🎙️ 帮我预定一场近期的高端讲座',
      query: '帮我预定一场近期的高端讲座',
      desc: '智能匹配国家级学者特窟研学',
    },
    {
      label: '🎙️ 查查我的积分与免单特权',
      query: '查查我的会员积分与免单房差特权怎么使用',
      desc: '名仕会员权益与商城抵扣规则',
    },
    {
      label: '🎙️ 推荐适合高血压每天4000步路线',
      query: '请推荐适合轻微高血压、平时每天散步4000步的慢节奏路线',
      desc: '适老五星与随团医护保障',
    },
    {
      label: '🎙️ 黄山掼蛋大师赛如何参加？',
      query: '请问黄山温泉掼蛋大师赛什么时候开赛？怎么报名？',
      desc: '赛制安排与养生理疗福利',
    },
  ];

  // Initialize Speech Recognition
  useEffect(() => {
    const SpeechRecognitionAPI =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (SpeechRecognitionAPI) {
      try {
        const recognition = new SpeechRecognitionAPI();
        recognition.continuous = false;
        recognition.interimResults = true;
        recognition.lang = 'zh-CN';

        recognition.onstart = () => {
          setIsListening(true);
          setSpeechError(null);
          setVoiceTranscript('');
        };

        recognition.onresult = (event: any) => {
          let interimTranscript = '';
          let finalTranscript = '';

          for (let i = event.resultIndex; i < event.results.length; ++i) {
            if (event.results[i].isFinal) {
              finalTranscript += event.results[i][0].transcript;
            } else {
              interimTranscript += event.results[i][0].transcript;
            }
          }

          const currentText = finalTranscript || interimTranscript;
          setVoiceTranscript(currentText);

          if (finalTranscript) {
            // Auto submit when final sentence is completed
            handleVoiceRecognized(finalTranscript);
          }
        };

        recognition.onerror = (event: any) => {
          console.warn('Speech recognition error:', event.error);
          setIsListening(false);
          if (event.error === 'not-allowed') {
            setSpeechError('请在浏览器中允许麦克风权限，或直接点击下方预设语音指令');
          } else if (event.error === 'no-speech') {
            setSpeechError('未检测到声音，请靠近麦克风再说一次');
          } else {
            setSpeechError('语音识别未完成，您也可直接点击预设指令体验');
          }
        };

        recognition.onend = () => {
          setIsListening(false);
        };

        recognitionRef.current = recognition;
      } catch (e) {
        console.warn('SpeechRecognition initialization error:', e);
      }
    }

    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch {}
      }
      stopSpeaking();
    };
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (activeSubTab === 'chat') {
      scrollToBottom();
    }
  }, [messages, loading, activeSubTab]);

  // Text-To-Speech (TTS) Engine
  const speakText = (text: string, msgId?: string) => {
    if (!('speechSynthesis' in window)) {
      showToast('当前环境不支持语音播报');
      return;
    }

    window.speechSynthesis.cancel();

    // Clean markdown symbols for natural speech
    const cleanSpoken = text
      .replace(/[*#_~`>]/g, '')
      .replace(/•/g, '，')
      .replace(/【|】/g, '')
      .replace(/¥/g, '元')
      .replace(/\n+/g, '。')
      .slice(0, 300);

    const utterance = new SpeechSynthesisUtterance(cleanSpoken);
    utterance.lang = 'zh-CN';
    utterance.rate = voiceSpeed; // gentle speed for elderly
    utterance.pitch = 1.0;

    utterance.onstart = () => {
      setIsSpeaking(true);
      if (msgId) setCurrentSpeakingMsgId(msgId);
    };

    utterance.onend = () => {
      setIsSpeaking(false);
      setCurrentSpeakingMsgId(null);
    };

    utterance.onerror = () => {
      setIsSpeaking(false);
      setCurrentSpeakingMsgId(null);
    };

    window.speechSynthesis.speak(utterance);
  };

  const stopSpeaking = () => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    setIsSpeaking(false);
    setCurrentSpeakingMsgId(null);
  };

  // Start Real / Fallback Voice Input
  const handleStartVoiceRecording = () => {
    stopSpeaking();
    setVoiceTranscript('');
    setSpeechError(null);
    setShowVoiceRecordingModal(true);

    if (recognitionRef.current) {
      try {
        recognitionRef.current.start();
        setIsListening(true);
      } catch (err) {
        console.warn('Recognition start exception, using fallback prompt:', err);
      }
    }
  };

  const handleStopVoiceRecording = () => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch {}
    }
    setIsListening(false);

    if (voiceTranscript.trim()) {
      handleVoiceRecognized(voiceTranscript.trim());
    }
  };

  const handleVoiceRecognized = (transcript: string) => {
    setShowVoiceRecordingModal(false);
    setIsListening(false);
    if (!transcript.trim()) return;

    handleSendMessage(transcript, true);
  };

  // Execute Core Semantic Query & Dispatch Action
  const handleSendMessage = async (textToSend?: string, isVoice: boolean = false) => {
    const query = (textToSend || inputMessage).trim();
    if (!query || loading) return;

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: query,
      isVoiceInput: isVoice,
      time: new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputMessage('');
    setVoiceTranscript('');
    setLoading(true);

    try {
      // Build conversation history payload
      const historyPayload = messages.map((m) => ({
        role: m.sender === 'user' ? 'user' : 'model',
        parts: [{ text: m.text }],
      }));

      const res = await fetch('/api/ai-concierge', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: query,
          history: historyPayload,
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

      if (!res.ok) {
        throw new Error('网络请求异常');
      }

      const data = await res.json();
      const aiReply = data.reply || '小老友正在为您查询，请稍候再试。';
      const spoken = data.spokenText || aiReply;
      const intent = data.intent;
      const matchedCards = data.matchedCards || [];

      const aiMsgId = `ai-${Date.now()}`;
      const aiMsg: ChatMessage = {
        id: aiMsgId,
        sender: 'ai',
        text: aiReply,
        spokenText: spoken,
        time: new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' }),
        intent,
        matchedCards,
      };

      setMessages((prev) => [...prev, aiMsg]);

      // Auto TTS readout for seniors if enabled
      if (autoPlayVoice) {
        setTimeout(() => {
          speakText(spoken, aiMsgId);
        }, 300);
      }
    } catch (err) {
      console.error(err);
      const fallbackAiMsg: ChatMessage = {
        id: `ai-${Date.now()}`,
        sender: 'ai',
        text: `尊敬的${userProfile.name}，小老友已收到您的查询。关于您咨询的内容，平台已为您安排好随团医护与舒适慢行保障。如需进一步定制或预订，您可直接点击下方快捷功能，或拨打专属顾问专线：400-880-9966。`,
        spokenText: `${userProfile.name}您好，小老友收到了您的查询。您可以随时点击屏幕上的推荐卡片直接预订或查看行程。`,
        time: new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, fallbackAiMsg]);

      if (autoPlayVoice) {
        setTimeout(() => {
          speakText(fallbackAiMsg.spokenText || fallbackAiMsg.text, fallbackAiMsg.id);
        }, 300);
      }
    } finally {
      setLoading(false);
    }
  };

  // Action Dispatcher for Semantic Buttons
  const handleExecuteAction = (actionBtn: ActionButtonDef) => {
    if (actionBtn.actionType === 'switch_to_planner') {
      setActiveSubTab('planner');
      showToast('已为您切换至【AI 3日慢游定制规划】');
    } else if (actionBtn.actionType === 'switch_to_itinerary') {
      setActiveSubTab('my_itinerary');
      showToast('已为您切换至【我的行程规划与手机日历】');
    } else if (actionBtn.actionType === 'open_booking') {
      const targetAct = activities.find((a) => a.id === actionBtn.targetId) || activities[1];
      openBooking('activity', targetAct);
      showToast(`已为您直接打开《${targetAct.title}》报名通道`);
    } else if (actionBtn.actionType === 'open_activity_detail') {
      const targetAct = activities.find((a) => a.id === actionBtn.targetId) || activities[0];
      setSelectedActivity(targetAct);
    } else if (actionBtn.actionType === 'open_event_detail') {
      const targetEvt = events.find((e) => e.id === actionBtn.targetId) || events[0];
      setSelectedEvent(targetEvt);
    }
  };

  const handleCardAction = (card: MatchedCardDef) => {
    if (card.type === 'activity') {
      const act = activities.find((a) => a.id === card.id);
      if (act) {
        if (card.actionText?.includes('预订') || card.actionText?.includes('报名')) {
          openBooking('activity', act);
        } else {
          setSelectedActivity(act);
        }
      }
    } else if (card.type === 'event') {
      const evt = events.find((e) => e.id === card.id);
      if (evt) {
        setSelectedEvent(evt);
      }
    } else if (card.type === 'order') {
      setActiveSubTab('my_itinerary');
    }
  };

  const handleAskAboutPlan = (prompt: string) => {
    setActiveSubTab('chat');
    setTimeout(() => {
      handleSendMessage(prompt, false);
    }, 100);
  };

  return (
    <div className="flex flex-col h-[calc(100vh-145px)] md:h-[calc(100vh-155px)] bg-[#FAF9F6] rounded-3xl border border-[#EAE6DF] overflow-hidden shadow-xs animate-fadeIn relative">
      {/* Top Header with 3 Sub-Tabs & Elderly Voice Indicator */}
      <div className="bg-[#2C3E50] text-white px-4 py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs border-b border-[#D4AF37]/30 shrink-0">
        <div className="flex items-center space-x-3">
          <div className="relative">
            <div className="w-10 h-10 rounded-2xl bg-[#FAF9F6] text-[#2C3E50] flex items-center justify-center font-bold shadow-2xs border border-[#D4AF37]/40">
              <Bot className="w-6 h-6 text-[#2C3E50]" />
            </div>
            <span className="w-3 h-3 rounded-full bg-[#D4AF37] border-2 border-[#2C3E50] absolute -bottom-0.5 -right-0.5"></span>
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-serif italic font-semibold text-sm md:text-base text-[#FAF9F6]">
                AI 伴游管家 · 小老友
              </h3>
              <span className="bg-[#D4AF37]/25 text-[#D4AF37] text-[10px] px-2 py-0.5 rounded-full border border-[#D4AF37]/40 flex items-center gap-1">
                <Radio className="w-2.5 h-2.5 animate-pulse text-emerald-400" />
                <span>支持语音语义查询</span>
              </span>
            </div>
            <p className="text-[11px] text-stone-300">
              语音直问 · 自动匹配行程 · 智能一键预订 · 适老温和播报
            </p>
          </div>
        </div>

        {/* 3-Way Sub-Tab Switcher & Voice Toggle */}
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
          {/* Audio Auto-readout switch */}
          <button
            onClick={() => {
              if (isSpeaking) stopSpeaking();
              setAutoPlayVoice(!autoPlayVoice);
              showToast(autoPlayVoice ? '已关闭自动语音播报' : '已开启自动语音播报（大字慢语速）');
            }}
            title="点击切换语音自动朗读"
            className={`px-2.5 py-1.5 rounded-xl text-[11px] font-medium flex items-center gap-1 border transition-all cursor-pointer shrink-0 ${
              autoPlayVoice
                ? 'bg-amber-500/20 text-[#D4AF37] border-[#D4AF37]/50'
                : 'bg-stone-800 text-stone-400 border-stone-700'
            }`}
          >
            {autoPlayVoice ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5" />}
            <span className="hidden sm:inline">{autoPlayVoice ? '语音播报:开' : '语音播报:关'}</span>
          </button>

          {/* 转真人客服通道 */}
          <button
            onClick={() => setShowHumanModal(true)}
            className="px-2.5 py-1.5 rounded-xl text-[11px] font-bold flex items-center gap-1 border border-emerald-500/50 bg-emerald-950/60 hover:bg-emerald-900/80 text-emerald-300 transition-all cursor-pointer shrink-0"
            title="AI无法解决时，一键转接真人金牌管家"
          >
            <Headphones className="w-3.5 h-3.5 text-emerald-400" />
            <span>转真人服务</span>
          </button>

          <div className="flex items-center bg-stone-900/80 p-1 rounded-2xl border border-stone-700">
            {/* TAB 0: 3日慢游定制规划 (AI Slow-Travel Planner) */}
            <button
              onClick={() => setActiveSubTab('planner')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shrink-0 ${
                activeSubTab === 'planner'
                  ? 'bg-gradient-to-r from-[#D4AF37] to-[#B8843E] text-stone-950 shadow-sm'
                  : 'text-stone-300 hover:text-white'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>3日慢游规划</span>
              <span className="text-[9px] bg-amber-900/60 text-amber-200 px-1.5 py-0.2 rounded-full font-sans">
                AI定制
              </span>
            </button>

            {/* TAB 3: 伴游问答 (Chat & Voice Query) */}
            <button
              onClick={() => setActiveSubTab('chat')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shrink-0 ${
                activeSubTab === 'chat'
                  ? 'bg-gradient-to-r from-[#D4AF37] to-[#B8843E] text-stone-950 shadow-sm'
                  : 'text-stone-300 hover:text-white'
              }`}
            >
              <Mic className="w-3.5 h-3.5" />
              <span>语音问答</span>
            </button>

            {/* TAB 1: 我的行程规划 (Timeline & Mobile Calendar) */}
            <button
              onClick={() => setActiveSubTab('my_itinerary')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shrink-0 ${
                activeSubTab === 'my_itinerary'
                  ? 'bg-gradient-to-r from-[#D4AF37] to-[#B8843E] text-stone-950 shadow-sm'
                  : 'text-stone-300 hover:text-white'
              }`}
            >
              <CalendarCheck className="w-3.5 h-3.5" />
              <span>行程时间轴</span>
              {bookedTripsCount > 0 && (
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                    activeSubTab === 'my_itinerary'
                      ? 'bg-stone-900 text-amber-200'
                      : 'bg-[#D4AF37] text-stone-900'
                  }`}
                >
                  {bookedTripsCount}
                </span>
              )}
            </button>

            {/* TAB 2: 智能研学推荐 */}
            <button
              onClick={() => setActiveSubTab('smart_recommendations')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shrink-0 ${
                activeSubTab === 'smart_recommendations'
                  ? 'bg-gradient-to-r from-[#D4AF37] to-[#B8843E] text-stone-950 shadow-sm'
                  : 'text-stone-300 hover:text-white'
              }`}
            >
              <Compass className="w-3.5 h-3.5" />
              <span>定制推荐</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      {activeSubTab === 'planner' ? (
        /* TAB 0: AI 3-Day Slow-Travel Custom Planner */
        <div className="flex-1 overflow-hidden">
          <AiSlowTravelPlanner
            onAskAiAboutPlan={handleAskAboutPlan}
            onPlanSaved={() => setActiveSubTab('my_itinerary')}
          />
        </div>
      ) : activeSubTab === 'my_itinerary' ? (
        /* TAB 1: My Itinerary Timeline & Calendar Sync */
        <div className="flex-1 overflow-hidden">
          <MyItineraryTimelineView
            onOpenActivity={(act) => setSelectedActivity(act)}
            onOpenEvent={(evt) => setSelectedEvent(evt)}
            onAskAiAboutTrip={handleAskAboutPlan}
          />
        </div>
      ) : activeSubTab === 'smart_recommendations' ? (
        /* TAB 2: Smart Itinerary Plan Manager */
        <div className="flex-1 overflow-hidden">
          <SmartItineraryManager
            onOpenActivity={(act) => setSelectedActivity(act)}
            onAskAiAboutPlan={handleAskAboutPlan}
          />
        </div>
      ) : (
        /* TAB 3: AI Voice & Semantic Query Concierge System */
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Top Quick Voice Query Banner */}
          <div className="bg-gradient-to-r from-amber-50 via-[#FAF9F6] to-amber-50 px-4 py-2 border-b border-[#EAE6DF] flex flex-wrap items-center justify-between text-xs gap-2 shrink-0">
            <div className="flex items-center gap-2 text-[#85660d] font-medium">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
              <span className="font-semibold text-stone-800">适老语音指令已就绪</span>
              <span className="text-stone-500 hidden sm:inline">
                支持语音直接说：“我下周有哪些研学活动？”或“帮我预订一场近期的高端讲座”
              </span>
            </div>

            {/* Readout Status Indicator */}
            {isSpeaking && (
              <div className="flex items-center gap-2 bg-[#2C3E50] text-[#D4AF37] px-2.5 py-1 rounded-full text-[11px] shadow-xs animate-pulse">
                <Volume2 className="w-3.5 h-3.5" />
                <span>正在悠缓朗读中...</span>
                <button
                  onClick={stopSpeaking}
                  className="ml-1 px-1.5 py-0.2 rounded bg-amber-500/30 hover:bg-amber-500/50 text-white font-bold"
                >
                  停止
                </button>
              </div>
            )}
          </div>

          {/* Messages Scroll Area */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-[#FAF9F6]">
            {messages.map((msg) => {
              const isUser = msg.sender === 'user';
              const isCurrentSpeaking = isSpeaking && currentSpeakingMsgId === msg.id;

              return (
                <div
                  key={msg.id}
                  className={`flex items-start space-x-2.5 ${isUser ? 'flex-row-reverse space-x-reverse' : ''}`}
                >
                  {/* Avatar */}
                  <div
                    className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 shadow-2xs ${
                      isUser
                        ? 'bg-[#D4AF37] text-stone-950 font-bold'
                        : 'bg-[#2C3E50] text-[#D4AF37] border border-[#D4AF37]/40'
                    }`}
                  >
                    {isUser ? <User className="w-5 h-5" /> : <Bot className="w-5 h-5" />}
                  </div>

                  {/* Message Bubble & Interactive Semantic Attachments */}
                  <div className={`max-w-[88%] md:max-w-[80%] space-y-2`}>
                    <div
                      className={`rounded-2xl p-4 text-xs md:text-sm leading-relaxed shadow-2xs whitespace-pre-wrap ${
                        isUser
                          ? 'bg-[#2C3E50] text-amber-50 rounded-tr-none border border-[#2C3E50]'
                          : `bg-white text-stone-800 border ${
                              isCurrentSpeaking ? 'border-[#D4AF37] ring-2 ring-[#D4AF37]/30' : 'border-[#EAE6DF]'
                            } rounded-tl-none font-sans`
                      }`}
                    >
                      {/* Voice tag badge */}
                      {isUser && msg.isVoiceInput && (
                        <div className="inline-flex items-center gap-1 bg-[#D4AF37]/20 text-[#D4AF37] px-2 py-0.5 rounded-full text-[10px] mb-1 font-bold">
                          <Mic className="w-3 h-3" />
                          <span>语音指令输入</span>
                        </div>
                      )}

                      {/* Main Message Text */}
                      <div className="leading-relaxed">{msg.text}</div>

                      {/* Time & Readout Action */}
                      <div
                        className={`text-[10px] mt-2.5 pt-2 border-t flex items-center justify-between ${
                          isUser ? 'text-amber-200/80 border-white/10' : 'text-stone-400 border-stone-100'
                        }`}
                      >
                        <span>{msg.time}</span>
                        {!isUser && (
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => {
                                if (isCurrentSpeaking) {
                                  stopSpeaking();
                                } else {
                                  speakText(msg.spokenText || msg.text, msg.id);
                                }
                              }}
                              className={`flex items-center gap-1 px-2 py-0.5 rounded-lg text-xs font-semibold cursor-pointer transition-colors ${
                                isCurrentSpeaking
                                  ? 'bg-[#2C3E50] text-[#D4AF37]'
                                  : 'hover:bg-amber-50 text-stone-600 hover:text-[#2C3E50]'
                              }`}
                            >
                              <Volume2 className="w-3.5 h-3.5 text-[#D4AF37]" />
                              <span>{isCurrentSpeaking ? '停止朗读' : '慢速朗读'}</span>
                            </button>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Semantic Intent Action Button (Direct Booking or Itinerary Switch) */}
                    {msg.intent?.actionButton && (
                      <div className="bg-gradient-to-r from-amber-100 to-amber-50 rounded-2xl p-3 border border-amber-200 shadow-2xs flex items-center justify-between gap-3 animate-fadeIn">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-xl bg-[#2C3E50] text-[#D4AF37] flex items-center justify-center shrink-0">
                            <Zap className="w-4 h-4" />
                          </div>
                          <div>
                            <div className="text-xs font-bold text-stone-900">{msg.intent.title}</div>
                            <div className="text-[11px] text-stone-600">已为您智能解析意图，支持一键直达</div>
                          </div>
                        </div>

                        <button
                          onClick={() => handleExecuteAction(msg.intent!.actionButton!)}
                          className="px-3.5 py-2 rounded-xl bg-[#2C3E50] text-[#D4AF37] hover:bg-[#1a252f] text-xs font-bold transition-all shadow-xs border border-[#D4AF37]/30 flex items-center gap-1 shrink-0 cursor-pointer active:scale-95"
                        >
                          <span>{msg.intent.actionButton.text}</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    )}

                    {/* Matched Activity / Event / Itinerary Interactive Cards */}
                    {msg.matchedCards && msg.matchedCards.length > 0 && (
                      <div className="space-y-2 pt-1 animate-fadeIn">
                        <div className="text-[11px] font-bold text-stone-500 px-1 flex items-center gap-1">
                          <Sparkles className="w-3 h-3 text-[#D4AF37]" />
                          <span>推荐意图直达卡片 ({msg.matchedCards.length})</span>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                          {msg.matchedCards.map((card) => (
                            <div
                              key={card.id}
                              className="bg-white rounded-2xl border border-[#EAE6DF] p-3 shadow-2xs hover:border-[#D4AF37] transition-all flex flex-col justify-between space-y-2 group"
                            >
                              <div className="flex gap-2.5">
                                {card.cover && (
                                  <img
                                    src={card.cover}
                                    alt={card.title}
                                    referrerPolicy="no-referrer"
                                    className="w-16 h-16 rounded-xl object-cover shrink-0 border border-stone-100"
                                  />
                                )}
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-1 mb-0.5">
                                    {card.tag && (
                                      <span className="text-[9px] bg-amber-50 text-[#85660d] border border-amber-200/80 px-1.5 py-0.2 rounded-md font-medium">
                                        {card.tag}
                                      </span>
                                    )}
                                    {card.date && (
                                      <span className="text-[9px] text-stone-400 font-mono">
                                        {card.date}
                                      </span>
                                    )}
                                  </div>
                                  <h4 className="font-serif font-bold text-xs text-stone-900 line-clamp-1 group-hover:text-[#2C3E50]">
                                    {card.title}
                                  </h4>
                                  {card.subtitle && (
                                    <p className="text-[10px] text-stone-500 line-clamp-1 mt-0.5">
                                      {card.subtitle}
                                    </p>
                                  )}
                                </div>
                              </div>

                              <div className="flex items-center justify-between border-t border-stone-100 pt-2 text-xs">
                                {card.price ? (
                                  <div className="font-bold text-[#2C3E50]">
                                    <span className="text-[10px] font-normal">¥</span>
                                    {card.price}
                                    <span className="text-[10px] font-normal text-stone-500">/位起</span>
                                  </div>
                                ) : (
                                  <div className="text-[11px] text-emerald-700 font-medium">
                                    已为您排期
                                  </div>
                                )}

                                <button
                                  onClick={() => handleCardAction(card)}
                                  className="px-3 py-1 rounded-xl bg-[#2C3E50] text-[#D4AF37] hover:bg-[#1a252f] text-[11px] font-bold transition-colors cursor-pointer flex items-center gap-1 shadow-2xs"
                                >
                                  <span>{card.actionText || '查看详情'}</span>
                                  <ChevronRight className="w-3 h-3" />
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}

            {loading && (
              <div className="flex items-start space-x-2.5">
                <div className="w-10 h-10 rounded-2xl bg-[#2C3E50] text-[#D4AF37] flex items-center justify-center shrink-0 border border-[#D4AF37]/40 shadow-xs">
                  <Bot className="w-6 h-6" />
                </div>
                <div className="bg-white rounded-2xl p-4 border border-[#EAE6DF] text-xs md:text-sm text-stone-600 rounded-tl-none flex items-center space-x-3 shadow-2xs">
                  <div className="flex items-center space-x-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#2C3E50] animate-bounce"></span>
                    <span className="w-2.5 h-2.5 rounded-full bg-[#2C3E50] animate-bounce [animation-delay:0.2s]"></span>
                    <span className="w-2.5 h-2.5 rounded-full bg-[#2C3E50] animate-bounce [animation-delay:0.4s]"></span>
                  </div>
                  <span className="font-serif italic font-medium text-stone-700">
                    小老友正在为您智能解析语义并查阅专属方案...
                  </span>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Senior Voice Quick Preset Prompts Bar */}
          <div className="px-3 py-2 bg-white border-t border-stone-100 overflow-x-auto no-scrollbar flex items-center gap-2 shrink-0">
            <span className="text-[11px] font-bold text-stone-500 flex items-center gap-1 shrink-0">
              <Sparkles className="w-3.5 h-3.5 text-[#D4AF37]" />
              <span>常问语音：</span>
            </span>
            {voicePresetPrompts.map((p, idx) => (
              <button
                key={idx}
                onClick={() => handleSendMessage(p.query, true)}
                className="px-3 py-1.5 rounded-full bg-[#FAF9F6] hover:bg-amber-50 hover:border-[#D4AF37] text-stone-700 text-xs whitespace-nowrap transition-all border border-[#EAE6DF] flex items-center gap-1 shrink-0 cursor-pointer shadow-2xs active:scale-95"
              >
                <span>{p.label}</span>
              </button>
            ))}
          </div>

          {/* Bottom Dual Input Bar (Voice Button + Text Input) */}
          <div className="p-3 bg-white border-t border-[#EAE6DF] flex items-center space-x-2 shrink-0 shadow-lg">
            {/* Prominent High-Contrast Elderly Voice Button */}
            <button
              onClick={handleStartVoiceRecording}
              title="点击唤出大字语音输入面板"
              className={`px-3.5 md:px-5 py-3 rounded-2xl flex items-center gap-2 font-bold text-xs md:text-sm transition-all shadow-md active:scale-95 cursor-pointer shrink-0 ${
                isListening
                  ? 'bg-rose-600 text-white animate-pulse'
                  : 'bg-gradient-to-r from-[#2C3E50] to-[#1a252f] text-[#D4AF37] border border-[#D4AF37]/50 hover:brightness-110'
              }`}
            >
              <Mic className="w-4 h-4 md:w-5 md:h-5 text-[#D4AF37]" />
              <span className="font-serif">语音提问</span>
            </button>

            {/* Regular Text Input */}
            <input
              type="text"
              placeholder="说出或输入：如“我下周有哪些研学活动？”“帮我预定一场近期高端讲座”"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  handleSendMessage();
                }
              }}
              className="flex-1 px-4 py-3 rounded-2xl bg-[#F8F9FA] border border-stone-200 text-xs md:text-sm focus:outline-none focus:border-[#2C3E50] font-sans text-stone-900 placeholder:text-stone-400"
            />

            {/* Send Button */}
            <button
              onClick={() => handleSendMessage()}
              disabled={!inputMessage.trim() || loading}
              className={`w-11 h-11 rounded-2xl flex items-center justify-center transition-all shadow-xs shrink-0 ${
                inputMessage.trim() && !loading
                  ? 'bg-[#2C3E50] text-[#D4AF37] active:scale-95 border border-[#D4AF37]/30 cursor-pointer'
                  : 'bg-stone-100 text-stone-400 cursor-not-allowed'
              }`}
            >
              <Send className="w-4 h-4 text-[#D4AF37]" />
            </button>
          </div>
        </div>
      )}

      {/* FULL-SCREEN ELDERLY VOICE RECORDING & SEMANTIC SPEECH DIALOG */}
      {showVoiceRecordingModal && (
        <div className="fixed inset-0 z-100 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white rounded-3xl w-full max-w-lg p-6 space-y-6 shadow-2xl border border-[#D4AF37]/40 text-center relative overflow-hidden">
            {/* Background Decorative glow */}
            <div className="absolute -top-24 -left-24 w-48 h-48 bg-amber-200/40 rounded-full blur-2xl pointer-events-none"></div>
            <div className="absolute -bottom-24 -right-24 w-48 h-48 bg-[#2C3E50]/20 rounded-full blur-2xl pointer-events-none"></div>

            {/* Header */}
            <div className="space-y-1">
              <div className="inline-flex items-center gap-1.5 bg-amber-50 text-[#85660d] px-3 py-1 rounded-full text-xs font-bold border border-amber-200">
                <Mic className="w-3.5 h-3.5 text-amber-600 animate-pulse" />
                <span>小老友 · 适老高灵敏语音识别</span>
              </div>
              <h3 className="font-serif text-xl font-bold text-[#2C3E50] mt-2">
                请清晰说出您想了解的内容
              </h3>
              <p className="text-xs text-stone-500">
                支持自然口语，小老友将为您智能提取意图并自动执行
              </p>
            </div>

            {/* Animated Large Microphone Visualizer */}
            <div className="flex flex-col items-center justify-center py-4 relative">
              {/* Pulsing Ripple Rings */}
              {isListening && (
                <>
                  <div className="absolute w-36 h-36 rounded-full bg-amber-400/20 animate-ping"></div>
                  <div className="absolute w-28 h-28 rounded-full bg-amber-500/30 animate-pulse"></div>
                  
                  {/* Waveform animation */}
                  <div className="absolute flex items-center justify-center gap-1 mt-32">
                      {[...Array(6)].map((_, i) => (
                        <div
                          key={i}
                          className="w-1.5 bg-[#D4AF37] rounded-full animate-wave"
                          style={{
                            height: `${Math.random() * 20 + 10}px`,
                            animationDelay: `${i * 0.1}s`,
                          }}
                        ></div>
                      ))}
                  </div>
                </>
              )}

              {/* Main Orb */}
              <button
                onClick={() => {
                  if (isListening) {
                    handleStopVoiceRecording();
                  } else {
                    handleStartVoiceRecording();
                  }
                }}
                className={`w-24 h-24 rounded-full flex items-center justify-center text-white shadow-xl transition-all relative z-10 cursor-pointer ${
                  isListening
                    ? 'bg-gradient-to-tr from-rose-600 to-amber-600 scale-105 ring-4 ring-rose-300'
                    : 'bg-gradient-to-tr from-[#2C3E50] to-[#1a252f] border-2 border-[#D4AF37]'
                }`}
              >
                <Mic className={`w-10 h-10 ${isListening ? 'text-white' : 'text-[#D4AF37]'}`} />
              </button>

              <div className="mt-3 text-xs font-bold text-stone-700">
                {isListening ? '🎙️ 正在聆听中... 说完请点击完成' : '点击麦克风重新录音'}
              </div>
            </div>

            {/* Live Recognized Speech Transcript Box (Large Font for Elderly) */}
            <div className="bg-[#FAF9F6] rounded-2xl p-4 border border-[#EAE6DF] min-h-[90px] flex flex-col justify-center items-center text-center">
              {voiceTranscript ? (
                <div className="text-base md:text-lg font-serif font-bold text-[#2C3E50] leading-relaxed">
                  “ {voiceTranscript} ”
                </div>
              ) : (
                <div className="text-stone-400 text-xs italic">
                  {speechError ? (
                    <span className="text-rose-600 font-medium">{speechError}</span>
                  ) : (
                    '正在将您的语音转写为文字...'
                  )}
                </div>
              )}
            </div>

            {/* Senior Shortcut Speech Examples to Tap Directly */}
            <div className="space-y-2 text-left">
              <div className="text-[11px] font-bold text-stone-500">
                💡 您也可以直接轻点下方常用语音提问：
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                {voicePresetPrompts.slice(0, 4).map((p, i) => (
                  <button
                    key={i}
                    onClick={() => {
                      setVoiceTranscript(p.query);
                      setTimeout(() => {
                        handleVoiceRecognized(p.query);
                      }, 200);
                    }}
                    className="p-2 rounded-xl bg-amber-50/70 hover:bg-amber-100 text-stone-800 text-xs text-left transition-colors border border-amber-200/60 font-medium flex items-center justify-between"
                  >
                    <span className="line-clamp-1">{p.label}</span>
                    <ChevronRight className="w-3.5 h-3.5 text-stone-400 shrink-0" />
                  </button>
                ))}
              </div>
            </div>

            {/* Dialog Footer Controls */}
            <div className="flex items-center gap-3 pt-2">
              <button
                onClick={() => {
                  if (recognitionRef.current) {
                    try {
                      recognitionRef.current.stop();
                    } catch {}
                  }
                  setShowVoiceRecordingModal(false);
                  setIsListening(false);
                }}
                className="flex-1 py-3 rounded-xl border border-stone-300 text-stone-600 text-xs font-semibold hover:bg-stone-50 cursor-pointer"
              >
                取消
              </button>

              <button
                onClick={() => {
                  if (voiceTranscript.trim()) {
                    handleVoiceRecognized(voiceTranscript.trim());
                  } else {
                    showToast('请先说出您的问题或选择上方推荐语音');
                  }
                }}
                disabled={!voiceTranscript.trim()}
                className={`flex-1 py-3 rounded-xl text-xs font-bold transition-all shadow-xs flex items-center justify-center gap-1.5 ${
                  voiceTranscript.trim()
                    ? 'bg-[#2C3E50] text-[#D4AF37] hover:bg-[#1a252f] cursor-pointer'
                    : 'bg-stone-200 text-stone-400 cursor-not-allowed'
                }`}
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>确认并查询</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* HUMAN CONCIERGE ESCALATION MODAL (当 AI 无法解决或老友需要真人支持时) */}
      {showHumanModal && (
        <div className="fixed inset-0 z-100 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white rounded-3xl w-full max-w-md p-6 space-y-5 shadow-2xl border border-[#D4AF37]/40 text-center relative overflow-hidden">
            <div className="flex items-center justify-between border-b border-stone-100 pb-3">
              <div className="flex items-center gap-2 text-[#2C3E50] font-serif font-bold text-base">
                <Headphones className="w-5 h-5 text-emerald-600" />
                <span>老友记 · 1对1金牌真人管家服务</span>
              </div>
              <button
                onClick={() => setShowHumanModal(false)}
                className="text-stone-400 hover:text-stone-700 p-1 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="bg-emerald-50 rounded-2xl p-4 border border-emerald-200/80 text-left space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-emerald-950">官方客服热线 (9:00 - 21:00)</span>
                <span className="text-[10px] bg-emerald-200 text-emerald-900 px-2 py-0.5 rounded-full font-bold">
                  专线直拨
                </span>
              </div>
              <div className="text-xl font-serif font-bold text-[#2C3E50]">18100129722</div>
              <p className="text-[11px] text-emerald-800 leading-relaxed">
                若您有定制包团、身体特殊照料、医疗评估或退改签紧急需求，可直接拨打或在下方登记回访。
              </p>
            </div>

            <div className="space-y-3 text-left">
              <div className="text-xs font-bold text-stone-700">预约专属顾问 10 分钟内致电回访：</div>
              <input
                type="text"
                value={humanCallbackPhone}
                onChange={(e) => setHumanCallbackPhone(e.target.value)}
                placeholder="请输入您的联系电话"
                className="w-full px-3.5 py-2.5 rounded-xl bg-stone-50 border border-stone-200 text-xs font-mono text-stone-800 focus:outline-none focus:border-[#2C3E50]"
              />
              <textarea
                value={humanCallbackRemark}
                onChange={(e) => setHumanCallbackRemark(e.target.value)}
                placeholder="请简要说明您的需求（如：询问苏州5日游老人轮椅陪护）"
                rows={2}
                className="w-full px-3.5 py-2 rounded-xl bg-stone-50 border border-stone-200 text-xs text-stone-800 focus:outline-none focus:border-[#2C3E50]"
              />
            </div>

            <div className="flex items-center gap-3 pt-1">
              <a
                href="tel:18100129722"
                className="flex-1 py-3 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-xs transition-transform active:scale-95 text-center"
              >
                <Phone className="w-3.5 h-3.5" />
                <span>立即直拨电话</span>
              </a>
              <button
                onClick={() => {
                  showToast('已收到您的回访预约！金牌管家将在10分钟内致电联系您。');
                  setShowHumanModal(false);
                }}
                className="flex-1 py-3 rounded-xl bg-[#2C3E50] hover:bg-[#1a252f] text-[#D4AF37] font-bold text-xs shadow-xs border border-[#D4AF37]/30 cursor-pointer"
              >
                提交预约回访
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

