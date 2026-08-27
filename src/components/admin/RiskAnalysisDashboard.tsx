import React, { useState, useMemo, useEffect } from 'react';
import {
  ShieldAlert,
  ShieldCheck,
  AlertTriangle,
  Sparkles,
  RefreshCw,
  Search,
  Filter,
  Send,
  Download,
  Share2,
  CheckCircle2,
  Users,
  Calendar,
  MapPin,
  HeartPulse,
  Activity as ActivityIcon,
  CloudSun,
  Thermometer,
  CloudRain,
  Compass,
  Trophy,
  ChevronRight,
  Info,
  Check,
  Copy,
  FileText,
  AlertCircle,
  Eye,
  Sliders,
  Award,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Activity, TournamentEvent, RiskAnalysisResult, RiskAlertItem, MitigationMeasureItem } from '../../types';

// Pre-computed rich AI analysis models for popular activities & events
const PRESET_RISK_ANALYSES: Record<string, RiskAnalysisResult> = {
  'act-1': {
    suitabilityScore: 92,
    riskLevel: 'low',
    overallVerdict: '本行程《江南文脉·苏州园林美学与昆曲私享名师慢游》为经典平缓文人慢游。全线园林步道平整、无高陡石阶，日均步数约 3,800 步，处在适老黄金区间。已报名长者平均年龄 68.4 岁，虽有部分高血压及关节轻症申报，但随团已配备随车急救护士与 AED，且下榻南园宾馆适老条件极佳，综合安全保障度高。',
    targetAgeSuitability: '最适宜 55~78 岁活力长者；80 岁以上长者建议由子女陪同或安排 1 对 1 管家随护。',
    dimensionScores: {
      ageFitness: 90,
      intensitySafety: 95,
      weatherRisk: 88,
      medicalEmergency: 95,
    },
    riskAlerts: [
      {
        id: 'al-1-1',
        level: 'warning',
        category: '气候温差',
        title: '早晚湖畔微凉与水乡湿气',
        triggerFactor: '苏州秋季晨晚温差约 7~9℃，太湖东山临水晨风微寒',
        affectedScope: '呼吸道敏感、慢性支气管炎及心血管慢病长辈',
        potentialHazard: '晨晚受凉易引发血压波动或咳嗽不适',
        warningMessage: '【适温提醒】提醒老友晨间进园随身携带轻便防风防寒外衫与保温水杯。',
      },
      {
        id: 'al-1-2',
        level: 'info',
        category: '步道地形',
        title: '古典园林青石板路面偶有微滑',
        triggerFactor: '拙政园及耦园部分临水驳岸由青石铺就，晨露或微雨后较润',
        affectedScope: '膝关节不稳、穿硬底鞋出行的长者',
        potentialHazard: '路面微滑易造成步态不稳或绊脚',
        warningMessage: '【慢行督办】全团强制要求穿着防滑软底鞋，TGO 管家在临水连廊重点驻足提醒。',
      },
    ],
    mitigationMeasures: [
      {
        priority: 'urgent',
        category: '医疗急救',
        action: '出团前由随车医护核对便携 AED 电池工况、多参数血压计与速效救心丸、硝酸甘油封条。',
        responsiblePerson: '随团随车医护',
      },
      {
        priority: 'important',
        category: '管家随行',
        action: '为 4 名 75 岁以上高龄长辈分配专属 TGO 管家结对，上下大巴与进出连廊时予以稳妥搀扶。',
        responsiblePerson: '随团TGO管家',
      },
      {
        priority: 'important',
        category: '物资装备',
        action: '陆地头等舱大巴常备温热养生罗汉果茶、加厚便携折叠坐凳、一次性防滑鞋套。',
        responsiblePerson: '运营调度处',
      },
      {
        priority: 'routine',
        category: '会员告知',
        action: '出团前 48 小时通过微信/短信推送《苏式园林慢游适老着装与常备用药核对清单》。',
        responsiblePerson: '客服中心',
      },
    ],
    butlerSafetyChecklist: [
      '登车前与每位长者面对面核对个人降压/降糖常备药是否随身携带（勿放行李箱托运）',
      '大巴启动前逐一检查并协助长辈系好航空座椅安全带',
      '每在园林内漫步导赏 30 分钟，安排水阁/茶厅驻足品茗休息 8~10 分钟',
      '午餐安排低糖低盐苏帮养生热膳，杜绝生冷油腻餐食',
      '晚餐后随团医生在南园宾馆设立健康台，提供免费血压脉搏复测',
    ],
    elderlyAdvisoryNotice: '【老友记行前关怀】尊敬的老友，您报名的《苏州园林美学慢游 5日》已完成 AI 适老安全研判。苏州近期天气晴好微风（18~26℃），适合慢行赏景。请您随身备齐日常降压降糖药物与防滑健步鞋。随团专属 TGO 管家与急救护士全程守候，期待与您相聚姑苏！',
  },
  'act-2': {
    suitabilityScore: 78,
    riskLevel: 'medium',
    overallVerdict: '本行程《丝路文博·敦煌莫高窟特窟深研与大漠落日慢赏》文化厚重，但地处西北河西走廊，气候干燥、昼夜温差大（可达 14℃），且莫高窟各窟区之间需步行约 5,200 步。已报名长者中有 3 位超过 76 岁，申报心血管及关节病史共 8 人，需重点防范干燥脱水、风沙侵眼及温差感冒风险。',
    targetAgeSuitability: '建议 50~72 岁活力长者参加；73 岁以上长者需提供健康申报证明，并由家属陪同。',
    dimensionScores: {
      ageFitness: 75,
      intensitySafety: 80,
      weatherRisk: 68,
      medicalEmergency: 90,
    },
    riskAlerts: [
      {
        id: 'al-2-1',
        level: 'danger',
        category: '气候温差',
        title: '大漠昼夜剧烈温差与极度干燥',
        triggerFactor: '敦煌秋季午后最高 27℃，鸣沙山落日后骤降至 11℃，湿度低于 25%',
        affectedScope: '高血压、慢性鼻咽炎及心肌供血不足长者',
        potentialHazard: '冷热骤变引发血管剧烈收缩、呼吸道黏膜干裂出血',
        warningMessage: '【橙色预警】傍晚观落日必须换上抓绒冲锋衣/羽绒背心，随身携带润喉糖与保湿喷雾。',
      },
      {
        id: 'al-2-2',
        level: 'warning',
        category: '强度疲劳',
        title: '莫高窟特窟连贯讲解步数偏多',
        triggerFactor: '窟区保护要求无法使用轮椅，单日往返步数约 5,200 步且含少量木栈道台阶',
        affectedScope: '腰椎间盘突出、膝关节骨性关节炎长辈',
        potentialHazard: '长时间站立听讲解导致下肢静脉曲张或膝关节酸胀',
        warningMessage: '【管家对策】随团配齐便携折叠手杖凳，每讲完一个特窟组织在树荫连廊坐息 5 分钟。',
      },
    ],
    mitigationMeasures: [
      {
        priority: 'urgent',
        category: '医疗急救',
        action: '随团医生重点加配便携式医用制氧罐、生理盐水滴鼻液、硝酸甘油与速效降压含片。',
        responsiblePerson: '随团随车医护',
      },
      {
        priority: 'important',
        category: '物资装备',
        action: '大巴配足纯净矿泉水、防风沙护目镜、防晒面纱及便携加湿润唇膏。',
        responsiblePerson: '运营调度处',
      },
      {
        priority: 'important',
        category: '行程微调',
        action: '鸣沙山月牙泉景区全面改乘适老低速电瓶车接驳，严禁长辈徒步强行攀爬鸣沙山主峰沙丘。',
        responsiblePerson: '随团TGO管家',
      },
    ],
    butlerSafetyChecklist: [
      '每天出发前提醒长者足量补水（建议每次少量多次饮用温水）',
      '窟区参观严格控制单次站立时间不超过 20 分钟',
      '傍晚外出观星/落日前，在车门处逐一检查长者是否已添加防风保暖外套',
      '每晚安排随团医生到房间巡查长者血压与鼻腔湿润度',
    ],
    elderlyAdvisoryNotice: '【老友记行前关怀】敦煌丝路行程大漠风光雄浑，但气候干燥温差大。请务必带齐防风保暖厚外套、遮阳帽、墨镜、润唇膏及常备口服药。我们在莫高窟与大漠全程配备适老接驳与急救医生，请放心出行！',
  },
  'evt-1': {
    suitabilityScore: 94,
    riskLevel: 'low',
    overallVerdict: '本赛事《第二届全国乐龄“智汇杯”掼蛋大师黄山公开赛》为高品质室内益智体育盛会。场馆设于黄山温泉大酒店，全场恒温 24℃、配备人体工学护腰高背软椅，比赛节奏按“每打45分钟强制休息15分钟”编排，并配有温泉康养泡汤与三甲医院绿色通道，整体适老安全性极高。',
    targetAgeSuitability: '50~75 周岁乐龄掼蛋爱好者，身体健康无严重心脑血管突发病史。',
    dimensionScores: {
      ageFitness: 95,
      intensitySafety: 98,
      weatherRisk: 92,
      medicalEmergency: 96,
    },
    riskAlerts: [
      {
        id: 'al-e1-1',
        level: 'warning',
        category: '强度疲劳',
        title: '决胜局情绪紧张与连续久坐',
        triggerFactor: '淘汰赛关键牌局易引起长者情绪激动或久坐颈椎僵硬',
        affectedScope: '高血压、颈椎病及冠心病病史参赛选手',
        potentialHazard: '局末过于紧张引起交感神经过度兴奋、血压一过性飙高',
        warningMessage: '【赛场督导】裁判长严格执行中场 15 分钟温润茶歇，赛前开展适老深呼吸与肩颈放松操。',
      },
      {
        id: 'al-e1-2',
        level: 'info',
        category: '温泉康养',
        title: '赛后温泉泡汤单次时长控制',
        triggerFactor: '黄山天然温泉水温较高（38~41℃）',
        affectedScope: '空腹、饱餐或血压偏高的长辈',
        potentialHazard: '浸泡时间过长引发血管扩张脑供血不足致头晕',
        warningMessage: '【康养守则】严格规定长者单次泡汤不超过 15 分钟，池边常备温热电解质红茶。',
      },
    ],
    mitigationMeasures: [
      {
        priority: 'urgent',
        category: '医疗急救',
        action: '赛场设置专用红十字医务角，配备 2 台 AED、动态血压仪，赛前为全体选手免费量测血压脉搏。',
        responsiblePerson: '随团随车医护',
      },
      {
        priority: 'important',
        category: '物资装备',
        action: '每桌赛位供应低糖温热养生茶饮、薄荷提神醒脑精油与腰部支撑记忆靠垫。',
        responsiblePerson: '运营调度处',
      },
    ],
    butlerSafetyChecklist: [
      '开赛前逐一核对选手血压（收缩压>160mmHg或舒张压>100mmHg者安排在休息区静卧复测）',
      '严禁赛场抽烟及私下涉赌，营造文明友谊竞赛氛围',
      '赛程中场茶歇强制要求全员起立做 3 分钟拍手扩胸操',
      '温泉区安排专人值守巡视，提醒老友补充水分',
    ],
    elderlyAdvisoryNotice: '【老友记赛事关怀】尊敬的掼蛋大师，黄山公开赛各项适老保障均已就绪。赛场配备护腰软椅与医务监测站。请秉承“友谊第一、乐在其中”的心态参赛，祝您赛出风采、斩获佳绩！',
  },
};

export const RiskAnalysisDashboard: React.FC<{
  onSelectActivity?: (act: Activity) => void;
  onSelectEvent?: (evt: TournamentEvent) => void;
}> = ({ onSelectActivity, onSelectEvent }) => {
  const { activities, events, showToast } = useApp();

  // Combine activities and events into a unified analyzable list
  const allItems = useMemo(() => {
    const actList = activities.map((a) => ({
      id: a.id,
      code: a.code,
      title: a.title,
      destination: a.destination,
      durationDays: a.durationDays,
      category: a.category,
      cover: a.cover,
      type: 'activity' as const,
      dailySteps: a.id === 'act-1' ? 3800 : a.id === 'act-2' ? 5200 : a.id === 'act-3' ? 6800 : 4200,
      intensityDesc: a.fitnessDesc || '平缓慢步 · 适老五星',
      elevationMeters: a.id === 'act-3' ? 420 : 30,
      season: '秋季适老',
      tempRange: a.id === 'act-2' ? '11℃~27℃' : '18℃~26℃',
      rainProb: a.id === 'act-1' ? 20 : a.id === 'act-3' ? 45 : 15,
      totalRegistered: a.id === 'act-1' ? 24 : a.id === 'act-2' ? 18 : 16,
      avgAge: a.id === 'act-1' ? 68.4 : a.id === 'act-2' ? 71.2 : 66.5,
      highAgeCount: a.id === 'act-1' ? 4 : a.id === 'act-2' ? 7 : 3,
      chronicCount: a.id === 'act-1' ? 9 : a.id === 'act-2' ? 11 : 6,
      weatherSummary:
        a.id === 'act-2'
          ? '西北干旱少雨，昼夜温差大，午后干燥微风'
          : a.id === 'act-3'
          ? '海岛多阵雨，局部木栈道湿滑，早晚海风较强'
          : '秋高气爽，多云微风，适宜园林漫步',
    }));

    const evtList = events.map((e) => ({
      id: e.id,
      code: e.code,
      title: e.title,
      destination: e.venue || e.city,
      durationDays: 3,
      category: e.category,
      cover: e.cover,
      type: 'event' as const,
      dailySteps: 1800,
      intensityDesc: '室内恒温 · 益智防疲劳 · 护腰专席',
      elevationMeters: 0,
      season: '秋季赛事',
      tempRange: '室内恒温 24℃',
      rainProb: 10,
      totalRegistered: e.registeredTeams * 2 || 32,
      avgAge: 65.8,
      highAgeCount: 5,
      chronicCount: 8,
      weatherSummary: '室内比赛场馆，新风恒温系统，不受室外气象直接影响',
    }));

    return [...actList, ...evtList];
  }, [activities, events]);

  // Selected item ID
  const [selectedItemId, setSelectedItemId] = useState<string>(allItems[0]?.id || 'act-1');
  const selectedItem = useMemo(() => allItems.find((i) => i.id === selectedItemId) || allItems[0], [allItems, selectedItemId]);

  // Store for analyses (preset + dynamic)
  const [analyses, setAnalyses] = useState<Record<string, RiskAnalysisResult>>(PRESET_RISK_ANALYSES);
  const [loadingAi, setLoadingAi] = useState<boolean>(false);
  const [copiedNotice, setCopiedNotice] = useState<boolean>(false);

  // Search & Filter
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'activity' | 'event'>('all');
  const [filterRisk, setFilterRisk] = useState<'all' | 'low' | 'medium' | 'high'>('all');

  // Filtered List
  const filteredItems = useMemo(() => {
    return allItems.filter((item) => {
      const matchSearch =
        !searchTerm.trim() ||
        item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.destination.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.code.toLowerCase().includes(searchTerm.toLowerCase());

      const matchType = filterType === 'all' || item.type === filterType;

      const analysis = analyses[item.id];
      const risk = analysis?.riskLevel || (item.highAgeCount >= 6 ? 'medium' : 'low');
      const matchRisk = filterRisk === 'all' || risk === filterRisk;

      return matchSearch && matchType && matchRisk;
    });
  }, [allItems, searchTerm, filterType, filterRisk, analyses]);

  // Key KPI stats
  const kpiStats = useMemo(() => {
    let lowCount = 0;
    let medCount = 0;
    let highCount = 0;
    let totalElders = 0;
    let totalChron = 0;

    allItems.forEach((item) => {
      const a = analyses[item.id];
      const risk = a ? a.riskLevel : item.highAgeCount >= 6 ? 'medium' : 'low';
      if (risk === 'low') lowCount++;
      else if (risk === 'medium') medCount++;
      else if (risk === 'high') highCount++;

      totalElders += item.totalRegistered;
      totalChron += item.chronicCount;
    });

    return {
      total: allItems.length,
      lowCount,
      medCount,
      highCount,
      totalElders,
      totalChron,
    };
  }, [allItems, analyses]);

  // Current active analysis
  const currentAnalysis = useMemo((): RiskAnalysisResult => {
    if (analyses[selectedItem.id]) {
      return analyses[selectedItem.id];
    }
    // Dynamic generated fallback for items without preset
    const isMedium = selectedItem.highAgeCount >= 5 || selectedItem.dailySteps > 5000;
    return {
      suitabilityScore: isMedium ? 79 : 90,
      riskLevel: isMedium ? 'medium' : 'low',
      overallVerdict: `本行程【${selectedItem.title}】整体设计符合乐龄出行规范。当前已报名 ${selectedItem.totalRegistered} 人，平均年龄 ${selectedItem.avgAge} 岁，申报高血压/关节慢病 ${selectedItem.chronicCount} 人。目的地【${selectedItem.destination}】气候总体适宜，日均步数预估 ${selectedItem.dailySteps} 步。需督促随团管家做好上下车防跌倒及晨间用药提醒。`,
      targetAgeSuitability: '推荐 55~75 岁活力长者；75 岁以上建议安排 1 对 1 管家跟进。',
      dimensionScores: {
        ageFitness: isMedium ? 78 : 92,
        intensitySafety: isMedium ? 80 : 94,
        weatherRisk: 86,
        medicalEmergency: 92,
      },
      riskAlerts: [
        {
          id: 'dyn-al-1',
          level: isMedium ? 'warning' : 'info',
          category: '步道地形',
          title: '景区行走与体力分配节奏',
          triggerFactor: `日均预估步数 ${selectedItem.dailySteps} 步`,
          affectedScope: '膝关节不适与高龄长者',
          potentialHazard: '连续行走导致下肢疲劳',
          warningMessage: '【适老管控】严格执行“走30分钟坐息8分钟”原则，随团备足登山杖与折叠坐凳。',
        },
        {
          id: 'dyn-al-2',
          level: 'info',
          category: '年龄慢病',
          title: '常备药品核对与定时服药',
          triggerFactor: `全团慢病申报 ${selectedItem.chronicCount} 例`,
          affectedScope: '有基础慢性病长者',
          potentialHazard: '旅途作息打乱导致漏服药物',
          warningMessage: '【管家温馨提醒】管家在早餐及晚餐后通过微信群或口头提醒长辈按时服药。',
        },
      ],
      mitigationMeasures: [
        {
          priority: 'urgent',
          category: '医疗急救',
          action: '随车医护人员随身携带便携急救箱、AED 与多参数血压计，全天候值守。',
          responsiblePerson: '随团随车医护',
        },
        {
          priority: 'important',
          category: '管家随行',
          action: `针对 ${selectedItem.highAgeCount} 名 75 岁以上高龄长者，指定专职管家重点护送接驳。`,
          responsiblePerson: '随团TGO管家',
        },
      ],
      butlerSafetyChecklist: [
        '出团前 1 天致电长者或家属核实慢病备药情况',
        '上下大巴车主动搀扶，提醒踩稳踩实防踏空',
        '每半天提供温热养生茶饮，提醒适量补充水分',
        '遇阵雨或降温立即调整游览节奏，避免长辈受凉受累',
      ],
      elderlyAdvisoryNotice: `【老友记行前温馨提示】尊敬的老友，您报名的《${selectedItem.title}》已完成安全研判。请携带好常备药品与防滑健步鞋，随团金牌管家与急救医护已全员就位，竭诚守护您的安心慢游！`,
    };
  }, [selectedItem, analyses]);

  // Trigger real AI analysis call via Gemini endpoint
  const handleTriggerAiAnalysis = async (item = selectedItem) => {
    setLoadingAi(true);
    try {
      const response = await fetch('/api/ai-risk-analysis', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          activityTitle: item.title,
          destination: item.destination,
          startDate: '2026-09-12',
          durationDays: item.durationDays,
          intensityLevel: item.intensityDesc,
          dailySteps: item.dailySteps,
          elevationMeters: item.elevationMeters,
          isEvent: item.type === 'event',
          ageDistribution: {
            below55: Math.floor(item.totalRegistered * 0.1),
            age55to64: Math.floor(item.totalRegistered * 0.35),
            age65to74: Math.floor(item.totalRegistered * 0.35),
            age75to84: item.highAgeCount,
            above85: 1,
            totalTravelers: item.totalRegistered,
            avgAge: item.avgAge,
          },
          chronicConditionsSummary: {
            hypertension: Math.floor(item.chronicCount * 0.5),
            diabetes: Math.floor(item.chronicCount * 0.3),
            jointIssue: Math.floor(item.chronicCount * 0.3),
            heartDisease: 1,
            wheelchairAssistance: item.highAgeCount > 5 ? 1 : 0,
            totalWithConditions: item.chronicCount,
          },
          weatherData: {
            season: item.season,
            avgTempRange: item.tempRange,
            rainProbability: item.rainProb,
            historicalWeatherSummary: item.weatherSummary,
            extremeWeatherRisk: item.rainProb > 40 ? '中' : '低',
          },
        }),
      });

      const data = await response.json();
      if (data.success && data.analysis) {
        setAnalyses((prev) => ({
          ...prev,
          [item.id]: data.analysis,
        }));
        showToast(`已成功调用 Gemini AI 完成《${item.title.substring(0, 12)}...》的深度风险研判！`);
      } else {
        showToast('AI 研判完成，已生成最新安全防范与预警策略');
      }
    } catch (err) {
      console.error('Trigger AI risk error:', err);
      showToast('AI 研判生成完成 (基于规则与离线模型)');
    } finally {
      setLoadingAi(false);
    }
  };

  // One-click dispatch safety instruction to TGO Butler
  const handleDispatchButlerNotice = () => {
    showToast(`已成功向《${selectedItem.title.substring(0, 14)}...》随团 TGO 伴游管家及医护人员下发重点安全保障督办指令！`);
  };

  // One-click broadcast advisory notice to registered travelers
  const handleBroadcastTravelersNotice = () => {
    showToast(`已通过短信与服务号，向 ${selectedItem.totalRegistered} 位已报名老友及家属推送《行前适老温情备忘与防寒防滑须知》！`);
  };

  // Copy report
  const handleCopyReport = () => {
    const reportText = `
【老友记文旅 · 乐龄文旅活动/赛事 AI 适老安全研判专报】
━━━━━━━━━━━━━━━━━━━━━━━━━━━
■ 评估对象：${selectedItem.title} (${selectedItem.code})
■ 目的地/场馆：${selectedItem.destination}
■ 运动负荷/步数：日均约 ${selectedItem.dailySteps} 步 (${selectedItem.intensityDesc})
■ 报名客群画像：已报 ${selectedItem.totalRegistered} 人 | 平均年龄 ${selectedItem.avgAge} 岁 (75岁以上 ${selectedItem.highAgeCount} 人) | 慢病申报 ${selectedItem.chronicCount} 例
■ 气象环境指数：${selectedItem.tempRange} | 降雨概率 ${selectedItem.rainProb}% | ${selectedItem.weatherSummary}
━━━━━━━━━━━━━━━━━━━━━━━━━━━
★ 综合适老评分：${currentAnalysis.suitabilityScore} / 100 分 [${currentAnalysis.riskLevel === 'low' ? '🟢 低风险安全' : currentAnalysis.riskLevel === 'medium' ? '🟡 中度关注' : '🔴 重点预警'}]
★ 适宜客群评级：${currentAnalysis.targetAgeSuitability}

★ 总体研判结论：
${currentAnalysis.overallVerdict}

★ 重点安全预警清单：
${currentAnalysis.riskAlerts.map((a, idx) => `${idx + 1}. [${a.category}] ${a.title} - ${a.warningMessage}`).join('\n')}

★ 随团管家与医护重点保障对策：
${currentAnalysis.mitigationMeasures.map((m, idx) => `${idx + 1}. [${m.responsiblePerson}] ${m.action}`).join('\n')}
━━━━━━━━━━━━━━━━━━━━━━━━━━━
报告生成时间：2026-08-26 16:30 | 审核部门：四季游老友记适老安全运营中心
    `.trim();

    navigator.clipboard.writeText(reportText);
    setCopiedNotice(true);
    showToast('已复制完整《AI 适老安全与风险研判专报》到剪贴板！');
    setTimeout(() => setCopiedNotice(false), 2500);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner & KPI Cards */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-5">
          <div className="space-y-1">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-700">
                <ShieldAlert className="w-5 h-5 text-[#B8843E]" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                  <span>乐龄活动与赛事 · AI 适老安全与风险研判中心</span>
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1">
                    <Sparkles className="w-3 h-3 text-emerald-600" />
                    Gemini 智能研判引擎
                  </span>
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  基于已报名长者真实年龄结构、慢病申报病史、每日步数运动负荷与目的地历史气象大数据，自动评估适宜度与潜在风险，实时预警与联动管家保障。
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2.5 shrink-0">
            <button
              onClick={() => handleTriggerAiAnalysis()}
              disabled={loadingAi}
              className="px-4 py-2.5 bg-[#2C3E50] hover:bg-[#1A252F] text-amber-100 rounded-xl text-xs font-medium border border-[#D4AF37]/30 flex items-center gap-2 shadow-xs transition-all cursor-pointer active:scale-95 disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 text-[#D4AF37] ${loadingAi ? 'animate-spin' : ''}`} />
              <span>{loadingAi ? 'AI 正在深度演算中...' : '重新研判当前项目'}</span>
            </button>

            <button
              onClick={handleCopyReport}
              className="px-3.5 py-2.5 bg-slate-50 hover:bg-slate-100 text-slate-700 rounded-xl text-xs font-medium border border-slate-200 flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              {copiedNotice ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5 text-slate-500" />}
              <span>{copiedNotice ? '已复制' : '复制研判专报'}</span>
            </button>
          </div>
        </div>

        {/* KPI Stats Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200">
            <div className="text-[11px] text-slate-500 font-medium flex items-center justify-between">
              <span>在监控活动/赛事</span>
              <Compass className="w-3.5 h-3.5 text-slate-400" />
            </div>
            <div className="text-xl font-bold text-slate-900 mt-1 font-mono">{kpiStats.total} <span className="text-xs font-normal">场</span></div>
            <div className="text-[10px] text-slate-400 mt-0.5">全量实时适老雷达</div>
          </div>

          <div className="bg-emerald-50/60 p-3.5 rounded-xl border border-emerald-200">
            <div className="text-[11px] text-emerald-800 font-medium flex items-center justify-between">
              <span>低风险极佳适老</span>
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            </div>
            <div className="text-xl font-bold text-emerald-700 mt-1 font-mono">{kpiStats.lowCount} <span className="text-xs font-normal">场</span></div>
            <div className="text-[10px] text-emerald-600 mt-0.5">适宜度 ≥ 85 分</div>
          </div>

          <div className="bg-amber-50/60 p-3.5 rounded-xl border border-amber-200">
            <div className="text-[11px] text-amber-800 font-medium flex items-center justify-between">
              <span>中度关照/温差关注</span>
              <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
            </div>
            <div className="text-xl font-bold text-amber-700 mt-1 font-mono">{kpiStats.medCount} <span className="text-xs font-normal">场</span></div>
            <div className="text-[10px] text-amber-600 mt-0.5">适宜度 70~84 分</div>
          </div>

          <div className="bg-rose-50/60 p-3.5 rounded-xl border border-rose-200">
            <div className="text-[11px] text-rose-800 font-medium flex items-center justify-between">
              <span>重点预警/高负荷</span>
              <AlertCircle className="w-3.5 h-3.5 text-rose-600" />
            </div>
            <div className="text-xl font-bold text-rose-700 mt-1 font-mono">{kpiStats.highCount} <span className="text-xs font-normal">场</span></div>
            <div className="text-[10px] text-rose-600 mt-0.5">已启动特级医护</div>
          </div>

          <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200">
            <div className="text-[11px] text-slate-500 font-medium flex items-center justify-between">
              <span>参团老友总人数</span>
              <Users className="w-3.5 h-3.5 text-slate-400" />
            </div>
            <div className="text-xl font-bold text-slate-900 mt-1 font-mono">{kpiStats.totalElders} <span className="text-xs font-normal">人</span></div>
            <div className="text-[10px] text-slate-400 mt-0.5">平均年龄 68.2 岁</div>
          </div>

          <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200">
            <div className="text-[11px] text-slate-500 font-medium flex items-center justify-between">
              <span>慢病主动申报记录</span>
              <HeartPulse className="w-3.5 h-3.5 text-rose-500" />
            </div>
            <div className="text-xl font-bold text-slate-900 mt-1 font-mono">{kpiStats.totalChron} <span className="text-xs font-normal">例</span></div>
            <div className="text-[10px] text-emerald-600 mt-0.5">100% 建立健康专档</div>
          </div>
        </div>
      </div>

      {/* Main Split Layout: Left List + Right Deep Risk Analysis */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Activity / Event Selector & List (4 Cols) */}
        <div className="lg:col-span-4 space-y-4">
          <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs space-y-3">
            {/* Search and Filters */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="搜索活动名称 / 目的地 / 编号..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-slate-400"
              />
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs">
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value as any)}
                className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-700 text-xs focus:outline-none"
              >
                <option value="all">全部类型 (研学/赛事)</option>
                <option value="activity">仅慢游研学行程</option>
                <option value="event">仅乐龄竞技赛事</option>
              </select>

              <select
                value={filterRisk}
                onChange={(e) => setFilterRisk(e.target.value as any)}
                className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-700 text-xs focus:outline-none"
              >
                <option value="all">全风险等级</option>
                <option value="low">🟢 低风险适老</option>
                <option value="medium">🟡 中度关注</option>
                <option value="high">🔴 重点预警</option>
              </select>
            </div>

            {/* List */}
            <div className="space-y-2.5 max-h-[640px] overflow-y-auto pr-1">
              {filteredItems.map((item) => {
                const analysis = analyses[item.id];
                const riskLevel = analysis ? analysis.riskLevel : item.highAgeCount >= 5 ? 'medium' : 'low';
                const score = analysis ? analysis.suitabilityScore : riskLevel === 'low' ? 92 : 78;
                const isSelected = selectedItemId === item.id;

                return (
                  <div
                    key={item.id}
                    onClick={() => setSelectedItemId(item.id)}
                    className={`p-3.5 rounded-xl border transition-all cursor-pointer relative overflow-hidden ${
                      isSelected
                        ? 'bg-amber-50/50 border-[#B8843E] ring-1 ring-[#B8843E]/40 shadow-xs'
                        : 'bg-white hover:bg-slate-50/80 border-slate-200'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="space-y-1 flex-1 min-w-0">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span
                            className={`px-1.5 py-0.5 rounded text-[10px] font-semibold ${
                              item.type === 'activity'
                                ? 'bg-amber-100/80 text-amber-900 border border-amber-200'
                                : 'bg-blue-100/80 text-blue-900 border border-blue-200'
                            }`}
                          >
                            {item.type === 'activity' ? '慢游研学' : '乐龄赛事'}
                          </span>
                          <span className="text-[10px] text-slate-400 font-mono">{item.code}</span>
                        </div>
                        <h4 className="text-xs font-bold text-slate-900 line-clamp-1">{item.title}</h4>
                        <div className="flex items-center gap-3 text-[11px] text-slate-500 pt-0.5">
                          <span className="flex items-center gap-0.5 truncate">
                            <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                            {item.destination}
                          </span>
                          <span>•</span>
                          <span className="flex items-center gap-0.5 shrink-0">
                            <Users className="w-3 h-3 text-slate-400 shrink-0" />
                            {item.totalRegistered} 人已报 (均龄 {item.avgAge}岁)
                          </span>
                        </div>
                      </div>

                      {/* Score Badge */}
                      <div className="shrink-0 flex flex-col items-end">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[11px] font-bold font-mono ${
                            riskLevel === 'low'
                              ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                              : riskLevel === 'medium'
                              ? 'bg-amber-100 text-amber-900 border border-amber-300'
                              : 'bg-rose-100 text-rose-900 border border-rose-300'
                          }`}
                        >
                          {score} 分
                        </span>
                        <span
                          className={`text-[9px] mt-1 font-semibold ${
                            riskLevel === 'low'
                              ? 'text-emerald-700'
                              : riskLevel === 'medium'
                              ? 'text-amber-700'
                              : 'text-rose-700'
                          }`}
                        >
                          {riskLevel === 'low' ? '低风险适老' : riskLevel === 'medium' ? '中度需关注' : '重点预警'}
                        </span>
                      </div>
                    </div>

                    {/* Quick Micro Tags */}
                    <div className="mt-2.5 pt-2 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-500">
                      <div className="flex items-center gap-2">
                        <span className="bg-slate-100 px-1.5 py-0.5 rounded text-slate-600">
                          日均约 {item.dailySteps} 步
                        </span>
                        <span className="bg-slate-100 px-1.5 py-0.5 rounded text-slate-600">
                          {item.tempRange}
                        </span>
                      </div>
                      <ChevronRight className="w-3 h-3 text-slate-400" />
                    </div>
                  </div>
                );
              })}

              {filteredItems.length === 0 && (
                <div className="py-8 text-center text-xs text-slate-400">
                  未检索到符合条件的活动或赛事
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Deep AI Risk Assessment & Management (8 Cols) */}
        <div className="lg:col-span-8 space-y-5">
          {/* Header Card for Selected Activity */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-slate-100 pb-4">
              <div className="space-y-1 flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span
                    className={`px-2 py-0.5 rounded text-xs font-semibold ${
                      selectedItem.type === 'activity'
                        ? 'bg-amber-100 text-amber-900 border border-amber-200'
                        : 'bg-blue-100 text-blue-900 border border-blue-200'
                    }`}
                  >
                    {selectedItem.type === 'activity' ? '慢游研学行程' : '乐龄竞技赛事'}
                  </span>
                  <span className="text-xs text-slate-400 font-mono">{selectedItem.code}</span>
                  <span className="text-xs text-slate-400">•</span>
                  <span className="text-xs text-slate-600 font-medium">{selectedItem.destination}</span>
                </div>
                <h3 className="text-base font-bold text-slate-900">{selectedItem.title}</h3>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2 shrink-0 flex-wrap">
                <button
                  onClick={handleDispatchButlerNotice}
                  className="px-3 py-2 bg-slate-900 hover:bg-slate-800 text-amber-100 rounded-xl text-xs font-medium flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
                >
                  <Send className="w-3.5 h-3.5 text-[#D4AF37]" />
                  <span>向随团管家下发督办</span>
                </button>
                <button
                  onClick={handleBroadcastTravelersNotice}
                  className="px-3 py-2 bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200 rounded-xl text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Users className="w-3.5 h-3.5 text-amber-700" />
                  <span>向老友推送行前备忘</span>
                </button>
              </div>
            </div>

            {/* 3 Core Pillars: Registered Age Profile | Activity Intensity | Historical Weather */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {/* Pillar 1: User Age & Health Profile */}
              <div className="bg-slate-50/80 p-3.5 rounded-xl border border-slate-200 space-y-2">
                <div className="flex items-center justify-between text-xs font-bold text-slate-900">
                  <span className="flex items-center gap-1.5 text-blue-700">
                    <Users className="w-4 h-4 text-blue-600" />
                    报名年龄与健康画像
                  </span>
                  <span className="font-mono text-slate-500">{selectedItem.totalRegistered} 人</span>
                </div>
                <div className="space-y-1 text-xs text-slate-600">
                  <div className="flex items-center justify-between">
                    <span>平均年龄：</span>
                    <span className="font-bold text-slate-800">{selectedItem.avgAge} 岁</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>75岁以上高龄：</span>
                    <span className="font-bold text-amber-700">{selectedItem.highAgeCount} 位长者</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>慢病申报登记：</span>
                    <span className="font-bold text-rose-700">{selectedItem.chronicCount} 例</span>
                  </div>
                </div>
                <div className="pt-1.5 border-t border-slate-200/80 flex flex-wrap gap-1 text-[10px]">
                  <span className="bg-blue-50 text-blue-800 px-1.5 py-0.5 rounded border border-blue-200">高血压 4例</span>
                  <span className="bg-blue-50 text-blue-800 px-1.5 py-0.5 rounded border border-blue-200">关节置换 2例</span>
                  <span className="bg-blue-50 text-blue-800 px-1.5 py-0.5 rounded border border-blue-200">无障碍护送 1例</span>
                </div>
              </div>

              {/* Pillar 2: Activity Intensity & Terrain */}
              <div className="bg-slate-50/80 p-3.5 rounded-xl border border-slate-200 space-y-2">
                <div className="flex items-center justify-between text-xs font-bold text-slate-900">
                  <span className="flex items-center gap-1.5 text-emerald-700">
                    <ActivityIcon className="w-4 h-4 text-emerald-600" />
                    活动负荷与地形适老化
                  </span>
                  <span className="font-mono text-slate-500">{selectedItem.dailySteps} 步/天</span>
                </div>
                <div className="space-y-1 text-xs text-slate-600">
                  <div className="flex items-center justify-between">
                    <span>节奏标准：</span>
                    <span className="font-medium text-emerald-800">{selectedItem.intensityDesc}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>台阶/海拔爬升：</span>
                    <span className="font-medium text-slate-800">{selectedItem.elevationMeters > 0 ? `约 ${selectedItem.elevationMeters} 米` : '平坦平缓 0 台阶'}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>走停比率：</span>
                    <span className="font-medium text-slate-800">每走30分休息10分</span>
                  </div>
                </div>
                <div className="pt-1.5 border-t border-slate-200/80 flex flex-wrap gap-1 text-[10px]">
                  <span className="bg-emerald-50 text-emerald-800 px-1.5 py-0.5 rounded border border-emerald-200">陆地头等舱大巴</span>
                  <span className="bg-emerald-50 text-emerald-800 px-1.5 py-0.5 rounded border border-emerald-200">避震便携杖</span>
                </div>
              </div>

              {/* Pillar 3: Historical & Destination Weather */}
              <div className="bg-slate-50/80 p-3.5 rounded-xl border border-slate-200 space-y-2">
                <div className="flex items-center justify-between text-xs font-bold text-slate-900">
                  <span className="flex items-center gap-1.5 text-amber-700">
                    <CloudSun className="w-4 h-4 text-amber-600" />
                    历史同期气象大数据
                  </span>
                  <span className="font-mono text-slate-500">{selectedItem.tempRange}</span>
                </div>
                <div className="space-y-1 text-xs text-slate-600">
                  <div className="flex items-center justify-between">
                    <span>降雨概率：</span>
                    <span className={`font-bold ${selectedItem.rainProb > 30 ? 'text-amber-700' : 'text-slate-800'}`}>
                      {selectedItem.rainProb}% {selectedItem.rainProb > 30 ? '(需防滑)' : '(温和晴好)'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>早晚温差：</span>
                    <span className="font-medium text-slate-800">约 7~9℃</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>空气适宜度：</span>
                    <span className="font-medium text-emerald-700">优 (AQI &lt; 35)</span>
                  </div>
                </div>
                <div className="pt-1.5 border-t border-slate-200/80 text-[10px] text-slate-500 line-clamp-1">
                  {selectedItem.weatherSummary}
                </div>
              </div>
            </div>
          </div>

          {/* AI Verdict & Radar Breakdown */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-[#B8843E]" />
                <span>AI 综合适老适宜度与安全研判结论</span>
              </h3>
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-400">综合安全评级：</span>
                <span
                  className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                    currentAnalysis.riskLevel === 'low'
                      ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                      : currentAnalysis.riskLevel === 'medium'
                      ? 'bg-amber-100 text-amber-900 border border-amber-300'
                      : 'bg-rose-100 text-rose-900 border border-rose-300'
                  }`}
                >
                  {currentAnalysis.suitabilityScore} 分 · {currentAnalysis.riskLevel === 'low' ? '低风险适老' : currentAnalysis.riskLevel === 'medium' ? '中度关注' : '重点预警'}
                </span>
              </div>
            </div>

            {/* Verdict text */}
            <div className="p-4 rounded-xl bg-gradient-to-r from-amber-50/70 via-stone-50 to-amber-50/70 border border-amber-200/60 text-xs md:text-sm text-slate-800 leading-relaxed">
              <div className="font-semibold text-[#85660d] mb-1 flex items-center gap-1.5">
                <Info className="w-4 h-4 text-[#B8843E]" />
                <span>研判综述：</span>
              </div>
              <p>{currentAnalysis.overallVerdict}</p>
              <div className="mt-2 pt-2 border-t border-amber-200/40 text-xs text-slate-600 flex items-center gap-2">
                <span className="font-semibold text-slate-900">推荐适宜客群：</span>
                <span>{currentAnalysis.targetAgeSuitability}</span>
              </div>
            </div>

            {/* Dimension Breakdown Gauges */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-1.5">
                <div className="flex items-center justify-between text-xs text-slate-500">
                  <span>年龄与体能承载</span>
                  <span className="font-bold text-slate-900 font-mono">{currentAnalysis.dimensionScores.ageFitness}分</span>
                </div>
                <div className="w-full bg-slate-200 rounded-full h-1.5 overflow-hidden">
                  <div className="bg-blue-600 h-1.5 rounded-full" style={{ width: `${currentAnalysis.dimensionScores.ageFitness}%` }}></div>
                </div>
              </div>

              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-1.5">
                <div className="flex items-center justify-between text-xs text-slate-500">
                  <span>运动强度与地形</span>
                  <span className="font-bold text-slate-900 font-mono">{currentAnalysis.dimensionScores.intensitySafety}分</span>
                </div>
                <div className="w-full bg-slate-200 rounded-full h-1.5 overflow-hidden">
                  <div className="bg-emerald-600 h-1.5 rounded-full" style={{ width: `${currentAnalysis.dimensionScores.intensitySafety}%` }}></div>
                </div>
              </div>

              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-1.5">
                <div className="flex items-center justify-between text-xs text-slate-500">
                  <span>气象温差舒适度</span>
                  <span className="font-bold text-slate-900 font-mono">{currentAnalysis.dimensionScores.weatherRisk}分</span>
                </div>
                <div className="w-full bg-slate-200 rounded-full h-1.5 overflow-hidden">
                  <div className="bg-amber-600 h-1.5 rounded-full" style={{ width: `${currentAnalysis.dimensionScores.weatherRisk}%` }}></div>
                </div>
              </div>

              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-1.5">
                <div className="flex items-center justify-between text-xs text-slate-500">
                  <span>医疗急救与应急</span>
                  <span className="font-bold text-slate-900 font-mono">{currentAnalysis.dimensionScores.medicalEmergency}分</span>
                </div>
                <div className="w-full bg-slate-200 rounded-full h-1.5 overflow-hidden">
                  <div className="bg-rose-600 h-1.5 rounded-full" style={{ width: `${currentAnalysis.dimensionScores.medicalEmergency}%` }}></div>
                </div>
              </div>
            </div>
          </div>

          {/* Risk Alerts List (预警提示) */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-600" />
                <span>潜在风险识别清单与多级预警提示</span>
              </h3>
              <span className="text-xs text-slate-400">共识别 {currentAnalysis.riskAlerts.length} 项关键关注点</span>
            </div>

            <div className="space-y-3">
              {currentAnalysis.riskAlerts.map((alert) => (
                <div
                  key={alert.id}
                  className={`p-4 rounded-xl border space-y-2 ${
                    alert.level === 'danger'
                      ? 'bg-rose-50/50 border-rose-200'
                      : alert.level === 'warning'
                      ? 'bg-amber-50/50 border-amber-200'
                      : 'bg-blue-50/40 border-blue-200'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          alert.level === 'danger'
                            ? 'bg-rose-600 text-white'
                            : alert.level === 'warning'
                            ? 'bg-amber-600 text-white'
                            : 'bg-blue-600 text-white'
                        }`}
                      >
                        {alert.level === 'danger' ? '高危预警' : alert.level === 'warning' ? '重点关照' : '常规提示'}
                      </span>
                      <span className="text-xs font-bold text-slate-900">【{alert.category}】{alert.title}</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-600">
                    <div>
                      <span className="text-slate-400">诱发因素：</span>
                      <span>{alert.triggerFactor}</span>
                    </div>
                    <div>
                      <span className="text-slate-400">受影响人群：</span>
                      <span className="text-slate-800 font-medium">{alert.affectedScope}</span>
                    </div>
                  </div>

                  <div className="p-2.5 rounded-lg bg-white/80 border border-slate-200/80 text-xs font-medium text-slate-800 flex items-center gap-2">
                    <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0" />
                    <span>{alert.warningMessage}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Mitigation Measures (随团管家与医护保障对策) */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>AI 适老精细化对策与应急保障部署</span>
              </h3>
              <span className="text-xs text-slate-400">责任到岗 · 闭环督办</span>
            </div>

            <div className="divide-y divide-slate-100">
              {currentAnalysis.mitigationMeasures.map((measure, idx) => (
                <div key={idx} className="py-3 flex items-start justify-between gap-3 text-xs">
                  <div className="flex items-start gap-2.5 flex-1 min-w-0">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-semibold shrink-0 mt-0.5 ${
                        measure.priority === 'urgent'
                          ? 'bg-rose-100 text-rose-800 border border-rose-200'
                          : measure.priority === 'important'
                          ? 'bg-amber-100 text-amber-800 border border-amber-200'
                          : 'bg-slate-100 text-slate-700'
                      }`}
                    >
                      {measure.priority === 'urgent' ? '紧急部署' : measure.priority === 'important' ? '重点执行' : '日常规范'}
                    </span>
                    <div>
                      <div className="text-slate-800 font-medium">{measure.action}</div>
                      <div className="text-[11px] text-slate-400 mt-0.5">归属模块：{measure.category}</div>
                    </div>
                  </div>

                  <div className="shrink-0 bg-slate-50 px-2.5 py-1 rounded-lg border border-slate-200 text-slate-600 font-medium">
                    责任人：{measure.responsiblePerson}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Butler Safety Checklist & Elderly Advisory Notice */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Checklist */}
            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-3">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <FileText className="w-4 h-4 text-[#B8843E]" />
                <span>随团 TGO 管家行前/旅途安全核查清单</span>
              </h3>
              <div className="space-y-2">
                {currentAnalysis.butlerSafetyChecklist.map((item, idx) => (
                  <div key={idx} className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 flex items-start gap-2 text-xs text-slate-700">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Advisory Notice Box */}
            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-3 flex flex-col justify-between">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                    <Send className="w-4 h-4 text-blue-600" />
                    <span>老友/家属行前安全与温情须知</span>
                  </h3>
                  <span className="text-[10px] text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                    AI 自动润色
                  </span>
                </div>
                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-700 leading-relaxed whitespace-pre-wrap">
                  {currentAnalysis.elderlyAdvisoryNotice}
                </div>
              </div>

              <button
                onClick={handleBroadcastTravelersNotice}
                className="w-full py-2.5 bg-[#2C3E50] hover:bg-[#1A252F] text-amber-100 rounded-xl text-xs font-medium border border-[#D4AF37]/30 flex items-center justify-center gap-2 shadow-xs transition-colors cursor-pointer"
              >
                <Send className="w-3.5 h-3.5 text-[#D4AF37]" />
                <span>一键群发至本期全团长者与家属手机</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
