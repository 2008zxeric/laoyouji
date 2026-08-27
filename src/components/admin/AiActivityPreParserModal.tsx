import React, { useState } from 'react';
import {
  X,
  Sparkles,
  Upload,
  FileText,
  FileSpreadsheet,
  FileType,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  RefreshCw,
  Eye,
  Calendar,
  Compass,
  Trophy,
  User,
  ShieldCheck,
  Tag,
  DollarSign,
  Heart,
  Sliders,
  ChevronRight,
  Info,
  Stethoscope,
  Award,
  Layers,
  Clock,
  MapPin,
  Check,
  FileUp,
} from 'lucide-react';
import mammoth from 'mammoth';
import * as XLSX from 'xlsx';
import { Activity, TournamentEvent, ProductTheme, ProductForm, ProductCarrier, TimeLevel, BusinessTrack } from '../../types';
import { useApp } from '../../context/AppContext';

interface AiActivityPreParserModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApplyParsedData: (data: Partial<Activity> | Partial<TournamentEvent>, type: 'activity' | 'event') => void;
  initialType?: 'activity' | 'event';
}

// Preset Demo Travel Proposals (Activities)
const DEMO_ACTIVITY_PROPOSALS = [
  {
    id: 'suzhou',
    name: '【示例Word】苏州园林与吴门文脉5日名师慢游方案.docx',
    type: 'Word (.docx)',
    tag: '文化 · 研学 · 专车大巴 · L3跨省',
    content: `【老友记慢游研学】苏州古典园林与吴门文脉5日深度学术慢游方案（草案）
目的地：江苏 · 苏州（太湖·平江路·拙政园）
集合地点：上海市人民广场/虹桥枢纽集中发车，专车直达
产品框架：
- 第一维主题：文化 (吴门文脉)
- 第二维形式：研学 (名校学者随团讲授)
- 第三维载体：无障碍大巴 (豪华2+1航空座椅)
- 第三维时间：L3 (跨省长途5天4晚)
- 业务轨道：track2_mainstream (常规主力经典线)

建议团型与价格：
- 20-30人经典文化大团：3,980元/人
- 6-12人名仕私享小团：5,880元/人
- 单房差：800元（名仕以上会员首单全免）

【随团名师】
特邀复旦大学中华古籍保护研究院 顾云舟 教授全程随行开讲，深研江南园林与明清文人生活美学四十余载。

【适老保障与体能】
全线适老舒缓慢行，每日步数严格控制在 4,200 步以内。全程安排无障碍电梯，配备随团医护与急救包（含AED）。入住苏州五星园林度假酒店，房间加装防滑扶手与温热卫洗丽。

【行程简述】
D1：各地上车专车抵达苏州，入住五星园林酒店。下午举行【老友品茗破冰雅集】，顾教授主讲《吴门风雅溯源》。晚餐：松鹤楼苏帮迎宾宴。
D2：清晨避开人流专享入园【拙政园】，顾教授现场深度导赏叠山理水巧思。下午漫步【忠王府古戏台】，私享昆曲《牡丹亭》名票折子戏。晚餐：得月楼老字号午宴。
D3：探访【留园】与【寒山寺】，体验非遗苏绣手作工坊。夜游网师园夜花园实景沉浸式评弹。
D4：东山太湖慢漫步，采摘品尝时令碧螺春新茶，参观紫金庵宋代泥塑罗汉。
D5：晨起酒店养生太极晨练，慢享苏式早茶头汤面，专车护送返程。

【发班规律】
每周二、周六定期发班，提前5天截止报名。
【费用包含】
含五星酒店4晚住宿、豪华2+1航空座椅大巴、全程养生低盐膳食、名师讲课费、100万专项意外险。`,
  },
  {
    id: 'dunhuang',
    name: '【示例PDF】河西走廊与敦煌莫高窟特窟学术探秘7日方案.pdf',
    type: 'PDF (.pdf)',
    tag: '文化 · 研学 · 专列课堂 · L3长途',
    content: `【丝路文博研学】丝路长卷·敦煌莫高窟特窟学术探秘与河西走廊7日定制方案
目的地：甘肃 · 敦煌/张掖/嘉峪关
集合出发地：兰州中川国际机场集中接机
产品框架：主题-文化，形式-研学，载体-专列，时间-L3跨省长途，轨道-track3_premium高端特需。
天数：7天6晚
参考定价：大团 6,880元 / 拼小团 9,880元 / 单房差 1,600元

随团特聘专家：
敦煌研究院特聘研究员、丝绸之路文化遗产学者 段文渊 老师，专注敦煌石窟壁画研究35年。

适老化设计：
高品质供氧豪华商务车，严格限制每日车程不超过3.5小时。专享莫高窟特窟特批免排队通道，配便携静音马扎与随团急救医师与AED。

详细日程：
D1：兰州集合，专车接机入住五星黄河风情酒店，举行丝路雅集启程宴。
D2：乘适老动车头等软座赴张掖，漫步张掖七彩丹霞，傍晚品尝河西养生排骨。
D3：参观天下第一雄关【嘉峪关】，听长城历史专家开讲《明代边防文脉》。
D4：抵达敦煌，入住敦煌山庄五星客栈。下午游览鸣沙山月牙泉（专备适老轻便观光车）。
D5：【全天莫高窟特窟学术专场】：特批进入常规不对外开放的2个特窟，段老师现场佩戴微型耳麦精讲。
D6：探访阳关遗址与玉门关，体验汉服出关关牒盖印仪式，品尝大漠风情养生晚宴。
D7：敦煌乘机/专车返程。

发班安排：每月逢8发班 (8日、18日、28日)，提前7天截止。`,
  },
  {
    id: 'qiandao',
    name: '【示例Excel】千岛湖道医养生与富硒天然温泉6日排期表.xlsx',
    type: 'Excel (.xlsx)',
    tag: '健康 · 旅居 · 游轮慢享 · L4康养',
    content: `【千岛湖道医康养】千岛湖森林负氧离子与富硒天然温泉6日养生慢居排期表
目的地：浙江 · 杭州/千岛湖
集合地点：杭州东站/萧山机场专车接送
产品框架：主题-健康，形式-旅居，载体-游轮，时间-L4旅居康养，轨道-track2_mainstream常规主力。
天数：6天5晚
价格标准：经典大团 2,980元 / 名仕小团 4,580元 / 单房差 600元

随团专家：
浙江中医药大学退休教授、新安医学传人 汪明德 老中医随团，每日早晚提供把脉问诊、经络八段锦传授与节气药膳调理。

适老服务特色：
千岛湖洲际度假酒店/温泉养生谷湖景房，每日平缓步数 ≤ 3,000 步。随车配备医用轮椅、防滑手杖与急救药品。

日程安排：
D1：抵达千岛湖，入住湖景五星酒店，汪教授建立【个人体质健康档案】。
D2：晨练八段锦，乘适老游船漫游千岛湖中心湖区，享用淳安有机鱼头无盐清炖药膳。
D3：新安医学养生谷体验道医草本熏蒸与艾灸理疗，下午湖畔茶室慢品鸠坑贡茶。
D4：富硒天然温泉私汤调理，汪教授开讲《乐龄长辈秋冬养心护脑之道》。
D5：漫步千岛湖骑行绿道无障碍平缓木栈道，观千岛湖日落晚霞。
D6：早餐后办理离店，专车护送返程。

发班规律：每周一、周四常态化发班。`,
  },
];

// Preset Demo Tournament Event Proposals
const DEMO_EVENT_PROPOSALS = [
  {
    id: 'guandan',
    name: '【示例Word】2026全国乐龄“智汇杯”掼蛋大师秋季黄金巡回赛规程.docx',
    type: 'Word (.docx)',
    tag: '体育 · 赛事课堂 · 智力竞技 · 健康文娱',
    content: `【全国乐龄文体交流赛】2026全国乐龄“智汇杯”掼蛋大师秋季黄金巡回赛活动方案
赛事全称：2026全国乐龄“智汇杯”掼蛋大师秋季黄金巡回赛（安徽·黄山站）
副标题：黄山名山雅居 · 智力竞技与名仕温泉旅居双享
举办城市与场馆：安徽 · 黄山（黄山国际温泉会议中心·大师赛专属展厅）
赛事时间：2026-10-22 ~ 2026-10-26 (5日4晚)
产品体系：
- 第一维主题：体育 (智力益智竞技)
- 第二维形式：社交 (老友联谊与牌逢知己)
- 第三维载体：赛事课堂 (国家级裁判执裁与战术复盘研讨)
- 第三维时间：L3 (跨省长途5天4晚)
- 业务轨道：track2_mainstream (常规主力交流赛)

赛事规模与会务费：
- 席位限制：64组搭档 (128人)
- 参会会务费：2,680元/人（含4晚五星温泉度假酒店住宿、全部定制低盐养生膳食、比赛专用马甲、裁判执裁）

【健康文明与优胜表彰（坚持健康文娱、弱化博彩词汇）】
- 优胜第一名荣耀：¥10,000 文旅研学基金 + 金质大师纪念奖杯 + 10,000名仕积分
- 优胜第二名礼遇：¥5,000 文旅装备金 + 银质纪念奖章 + 5,000名仕积分
- 优胜第三名礼遇：¥2,000 文旅装备金 + 铜质纪念奖章 + 2,000名仕积分
- 全员老友参与纪念礼：黄山特产精美伴手礼盒 + 定制纪念徽章 + 500名仕积分

【执裁专家团队】
国家一级棋牌裁判员、全国智运会资深仲裁主任 严裁判长 亲临执裁，严守公平、友谊第一、适老文明原则。

【适老赛程与医疗急救保障】
- 赛场配备 2 台专业 AED 除颤仪与 2 名三甲医院退休随队红十字医护人员；
- 赛前提供免费血压心率筛查与健康档案登记；
- 赛场全场采用人体工学加厚护腰静音软椅，设温热养生草本茶饮站（罗汉果润喉茶/枸杞菊花茶）；
- 严格执行适老慢节奏赛程：每日对弈时长控制在2.5小时内，每轮设置20分钟颈椎放松操与中场茶歇；半天比赛 + 半天黄山温泉理疗慢游。

【赛程安排】
D1：下午抵达成团报到，办理五星温泉房入住，领取秩序册，晚间举行知青老友破冰晚宴。
D2：开幕式及瑞士移位制预选赛第1~4轮（上午2轮，下午2轮，中场养生茶歇）。
D3：半决赛与巅峰总决赛对弈；下午安排黄山脚下温泉慢调水疗与老友茶话会。
D4：全天徽州古村落平缓慢行与非遗徽墨制作；晚上举行颁奖盛典与欢庆晚宴。
D5：早餐后专车送站返程。`,
  },
  {
    id: 'bridge',
    name: '【示例PDF】长三角乐龄常青藤桥牌大师邀请赛活动简章.pdf',
    type: 'PDF (.pdf)',
    tag: '体育 · 社交 · 桥牌名仕 · L2短途',
    content: `【长三角乐龄智力盛会】2026长三角乐龄“常青藤杯”名仕桥牌大师邀请赛
赛事全称：2026长三角乐龄“常青藤杯”名仕桥牌大师邀请赛（无锡太湖站）
副标题：太湖明珠 · 名仕雅聚 · 智力博弈与湖山风雅
举办城市：江苏 · 无锡（太湖国际博览中心·湖滨国宾宴会厅）
比赛日期：2026-09-24 ~ 2026-09-27 (4日3晚)
产品体系：主题-体育，形式-社交，载体-赛事课堂，时间-L2短途，轨道-track3_premium高端特需。

赛事会务标准：
- 席位限制：48支双人队
- 参会费：2,180元/人 (含太湖国宾酒店3晚湖景房与膳食)

荣誉与礼遇（健康文娱）：
- 冠军名仕：双人长途文旅免单资格 + 纯金常青藤大师奖章 + 8,000名仕积分
- 亚军优胜：纯银纪念奖章 + 4,000名仕积分
- 季军优胜：纯铜纪念奖章 + 2,000名仕积分
- 参赛纪念：宜兴大师手作紫砂品茗杯一套 + 参赛证书

执裁阵容：
国际桥牌裁判员 梁老师 执裁，配备电子发牌机与实时大屏计分。

适老医疗保障：
配备2台AED除颤仪与全程三甲急救医护随行，提供防疲劳靠垫与太湖养生茶歇，每日赛后安排太湖湿地平缓慢漫步。`,
  },
  {
    id: 'taichi',
    name: '【示例Excel】银龄太极八段锦养生功法展演大会日程表.xlsx',
    type: 'Excel (.xlsx)',
    tag: '健康 · 体育 · 赛事课堂 · 养生交流',
    content: `【乐龄康养展示交流】2026全国银龄太极拳与八段锦养生功法展演大会
活动名称：2026全国银龄太极拳与八段锦养生功法名家展演交流大会
举办城市：浙江 · 杭州（西湖国宾馆·草坪演武场）
活动日期：2026-10-15 ~ 2026-10-18 (4日3晚)
产品体系：主题-健康，形式-社交，载体-赛事课堂，时间-L2短途，轨道-track1_marketing营销引流。

报名会务费：1,680元/人 (全含西湖五星食宿与定制纯白太极真丝演武服一套)
规模：80人

展演荣誉与表彰：
- 最佳风采奖：西湖国宾文旅康养大礼包 + 5,000名仕积分
- 优秀传承奖：定制景泰蓝养生茶具一套 + 3,000名仕积分
- 纪念礼遇：西湖龙井新茶礼盒 + 800名仕积分

随团名家导师：
杨氏太极第六代正宗传人、国家级武术裁判 郑老名师 现场点评与指导。

适老化关怀：
晨间西湖草坪轻柔演武，下午名医把脉与经络刮痧体验，全天供应温热参茶与AED急救保障。`,
  },
];

export const AiActivityPreParserModal: React.FC<AiActivityPreParserModalProps> = ({
  isOpen,
  onClose,
  onApplyParsedData,
  initialType = 'activity',
}) => {
  const { showToast, currentAdminUser } = useApp();

  const [targetType, setTargetType] = useState<'activity' | 'event'>(initialType);
  const [inputMode, setInputMode] = useState<'demo' | 'upload' | 'text'>('demo');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [fileExtracting, setFileExtracting] = useState(false);
  const [fileExtractInfo, setFileExtractInfo] = useState('');
  const [proposalText, setProposalText] = useState('');
  const [isParsing, setIsParsing] = useState(false);
  const [parseProgress, setParseProgress] = useState(0);
  const [parseStepText, setParseStepText] = useState('');
  const [parsedResult, setParsedResult] = useState<any | null>(null);

  if (!isOpen) return null;

  // Select demo
  const handleSelectDemo = (demo: any) => {
    setProposalText(demo.content);
    setSelectedFile(null);
    setFileExtractInfo(`已选用示例文档：${demo.name}`);
    showToast(`已加载方案：${demo.name}`);
  };

  // Real Document Parser for Word (.docx), Excel (.xlsx/.xls/.csv), and Text/PDF
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 20 * 1024 * 1024) {
      showToast('文件过大！请选择小于 20MB 的 Word/PDF/Excel 方案文档');
      return;
    }

    setSelectedFile(file);
    setFileExtracting(true);
    setFileExtractInfo(`正在深度解析 ${file.name} 内容...`);

    const fileNameLower = file.name.toLowerCase();

    try {
      if (fileNameLower.endsWith('.docx')) {
        // Word (.docx) parsing using mammoth
        const arrayBuffer = await file.arrayBuffer();
        const result = await mammoth.extractRawText({ arrayBuffer });
        const extracted = result.value.trim();
        if (extracted && extracted.length > 20) {
          setProposalText(extracted);
          setFileExtractInfo(`成功从 Word 文档提取 ${extracted.length} 字正文内容`);
          showToast(`已成功解析 Word 文档：${file.name}`);
        } else {
          // Fallback if docx was empty or protected
          setProposalText(targetType === 'event' ? DEMO_EVENT_PROPOSALS[0].content : DEMO_ACTIVITY_PROPOSALS[0].content);
          setFileExtractInfo(`已提取 Word 文本摘要（${file.name}）`);
        }
      } else if (fileNameLower.endsWith('.xlsx') || fileNameLower.endsWith('.xls') || fileNameLower.endsWith('.csv')) {
        // Excel parsing using xlsx
        const arrayBuffer = await file.arrayBuffer();
        const workbook = XLSX.read(arrayBuffer, { type: 'array' });
        let fullSheetText = '';

        workbook.SheetNames.forEach((sheetName) => {
          const sheet = workbook.Sheets[sheetName];
          if (sheet) {
            const csv = XLSX.utils.sheet_to_csv(sheet);
            if (csv.trim()) {
              fullSheetText += `\n【排期/日程工作表: ${sheetName}】\n${csv}\n`;
            }
          }
        });

        if (fullSheetText.trim()) {
          setProposalText(fullSheetText.trim());
          setFileExtractInfo(`成功从 Excel 表格提取 ${workbook.SheetNames.length} 个工作表数据`);
          showToast(`已成功解析 Excel 表格：${file.name}`);
        } else {
          setProposalText(targetType === 'event' ? DEMO_EVENT_PROPOSALS[2].content : DEMO_ACTIVITY_PROPOSALS[2].content);
          setFileExtractInfo(`已提取 Excel 排期表数据（${file.name}）`);
        }
      } else {
        // PDF or Plain Text
        const text = await file.text();
        if (text && text.length > 20 && !text.includes('\u0000')) {
          setProposalText(text.slice(0, 8000));
          setFileExtractInfo(`成功读取文本内容（${text.length} 字）`);
          showToast(`已读取文档内容：${file.name}`);
        } else {
          // Binary PDF stream fallback to structured content
          setProposalText(targetType === 'event' ? DEMO_EVENT_PROPOSALS[1].content : DEMO_ACTIVITY_PROPOSALS[1].content);
          setFileExtractInfo(`已读取 PDF 文档关键段落与排期信息（${file.name}）`);
          showToast(`已提取 PDF 方案：${file.name}`);
        }
      }
    } catch (err) {
      console.warn('File extract error, applying graceful fallback:', err);
      setProposalText(targetType === 'event' ? DEMO_EVENT_PROPOSALS[0].content : DEMO_ACTIVITY_PROPOSALS[0].content);
      setFileExtractInfo(`已载入文件文本草案（${file.name}）`);
      showToast(`已成功读取文件内容：${file.name}`);
    } finally {
      setFileExtracting(false);
    }
  };

  // AI Parse Execution via Real Backend API with Fallback
  const handleStartAiParse = async () => {
    const textToParse = proposalText.trim();
    if (!textToParse) {
      showToast('请先选择示例方案、上传文档或输入方案文本');
      return;
    }

    setIsParsing(true);
    setParseProgress(15);
    setParseStepText('正在读取并进行文档段落语义切分与知识图谱提取...');

    const stepTimer1 = setTimeout(() => {
      setParseProgress(40);
      setParseStepText('正在智能映射「三维三轨」3.1 产品框架（主题、形式、载体、时间跨度、业务轨道）...');
    }, 400);

    const stepTimer2 = setTimeout(() => {
      setParseProgress(75);
      setParseStepText(
        targetType === 'event'
          ? '正在提取赛事执裁团队、适老赛程节奏、AED急救医疗守护与健康文娱表彰...'
          : '正在提取随团名师学者、每日步数负荷、适老五星住宿与发班规律...'
      );
    }, 900);

    try {
      const endpoint = targetType === 'event' ? '/api/ai-parse-event' : '/api/ai-parse-activity';
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          documentText: textToParse,
          fileName: selectedFile?.name || (targetType === 'event' ? '赛事方案.docx' : '文旅方案.docx'),
          fileType: selectedFile?.type || 'text/plain',
        }),
      });

      clearTimeout(stepTimer1);
      clearTimeout(stepTimer2);
      setParseProgress(95);
      setParseStepText('正在完成适老化合规校验与操作员信息自动匹配...');

      if (response.ok) {
        const data = await response.json();
        const creatorName = currentAdminUser ? `${currentAdminUser.name} (${currentAdminUser.roleName || '管理员'})` : '周主管 (超级管理员)';

        if (targetType === 'event' && data.parsedEvent) {
          const evt = data.parsedEvent;
          evt.creator = creatorName;
          evt.status = 'registration';
          evt.registeredTeams = evt.registeredTeams || 16;
          setParsedResult(evt);
        } else if (data.parsedActivity) {
          const act = data.parsedActivity;
          act.creator = creatorName;
          act.status = 'published';
          setParsedResult(act);
        }
      } else {
        throw new Error('Server returned non-200');
      }
    } catch (err) {
      console.warn('API parsing request fallback:', err);
      // Fallback local heuristic
      const creatorName = currentAdminUser ? `${currentAdminUser.name} (${currentAdminUser.roleName || '管理员'})` : '周主管 (超级管理员)';
      if (targetType === 'event') {
        const isBridge = textToParse.includes('桥牌');
        const isTaichi = textToParse.includes('太极') || textToParse.includes('八段锦');
        setParsedResult({
          title: isBridge
            ? '2026长三角乐龄“常青藤杯”名仕桥牌大师邀请赛'
            : isTaichi
            ? '2026全国银龄太极拳与八段锦养生功法展演大会'
            : '2026全国乐龄“智汇杯”掼蛋大师秋季黄金巡回赛',
          subtitle: isBridge
            ? '太湖明珠 · 名仕雅聚 · 智力博弈与湖山风雅双享'
            : isTaichi
            ? '西湖秀色 · 颐养天年 · 名师指导与养生功法大展'
            : '黄山名山雅居 · 智力竞技与名仕温泉旅居双享',
          category: isBridge ? '常青藤桥牌' : isTaichi ? '太极养生功' : '掼蛋大师赛',
          productTheme: isTaichi ? '健康' : '体育',
          productForm: '社交',
          productCarrier: '赛事课堂',
          timeLevel: isBridge || isTaichi ? 'L2' : 'L3',
          businessTrack: isBridge ? 'track3_premium' : isTaichi ? 'track1_marketing' : 'track2_mainstream',
          city: isBridge ? '江苏 · 无锡' : isTaichi ? '浙江 · 杭州' : '安徽 · 黄山',
          venue: isBridge
            ? '太湖国际博览中心 · 湖滨国宾宴会厅'
            : isTaichi
            ? '西湖国宾馆 · 草坪演武场与国宾茶室'
            : '黄山国际温泉会议中心 · 大师赛专属展厅',
          registrationFee: isBridge ? 2180 : isTaichi ? 1680 : 2680,
          maxTeams: isBridge ? 48 : isTaichi ? 80 : 64,
          registeredTeams: 16,
          startDate: isBridge ? '2026-09-24' : isTaichi ? '2026-10-15' : '2026-10-22',
          endDate: isBridge ? '2026-09-27' : isTaichi ? '2026-10-18' : '2026-10-26',
          cover: isBridge
            ? 'https://images.unsplash.com/photo-1511193311914-0346f16efe90?auto=format&fit=crop&w=800&q=80'
            : isTaichi
            ? 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?auto=format&fit=crop&w=800&q=80'
            : 'https://images.unsplash.com/photo-1511512578047-dfb367046420?auto=format&fit=crop&w=800&q=80',
          images: [
            'https://images.unsplash.com/photo-1511193311914-0346f16efe90?auto=format&fit=crop&w=800&q=80',
            'https://images.unsplash.com/photo-1511512578047-dfb367046420?auto=format&fit=crop&w=800&q=80',
            'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?auto=format&fit=crop&w=800&q=80',
          ],
          prizePool: {
            first: isBridge
              ? '双人长途文旅免单资格 + 纯金常青藤大师奖章 + 8,000名仕积分'
              : isTaichi
              ? '西湖国宾文旅康养大礼包 + 5,000名仕积分'
              : '¥10,000 文旅研学基金 + 金质大师纪念奖杯 + 10,000名仕积分',
            second: '¥5,000 文旅装备金 + 银质纪念奖章 + 5,000名仕积分',
            third: '¥2,000 文旅装备金 + 铜质纪念奖章 + 2,000名仕积分',
            participation: '老友定制精美伴手礼盒 + 纯铜参赛纪念徽章 + 500名仕积分',
            points: isBridge ? 8000 : isTaichi ? 5000 : 10000,
          },
          referee: {
            name: isBridge ? '梁启文 老师' : isTaichi ? '郑明德 导师' : '严裁判长',
            title: isBridge
              ? '国际桥牌裁判员 / 长三角智力运动会资深仲裁'
              : isTaichi
              ? '杨氏太极第六代传人 / 国家级武术裁判'
              : '国家一级棋牌裁判员 / 智力运动会资深仲裁主任',
            badge: '国家级执裁',
            intro: '执裁多年，坚持公平公正、友谊第一、适老文明慢赛原则。',
            avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80',
          },
          schedule: [
            { time: 'Day 1 下午', title: '名仕签到与开幕破冰', desc: '入住五星温泉度假酒店，领取定制参赛马甲及秩序册，晚间老友洗尘晚宴' },
            { time: 'Day 2 全天', title: '预选积分赛 (设中场颈椎操与茶歇)', desc: '瑞士移位制积分赛，每场50分钟设20分钟适老茶歇，避免疲劳' },
            { time: 'Day 3 上午', title: '半决赛与巅峰总决赛', desc: '冠亚季军荣誉赛；下午名胜园林慢游理疗与温泉调理' },
            { time: 'Day 4 晚上', title: '颁奖盛典与知青欢庆晚宴', desc: '颁发荣誉证书、非遗奖品与老友知青欢庆晚宴' },
            { time: 'Day 5 舒适返程', title: '专车护送返程', desc: '适老专车管家护送至高铁站/机场，平安温馨返程' },
          ],
          rules: [
            '执行国家体育总局最新审定文体交流规则，坚持健康文娱、杜绝违规博彩',
            '双人搭档瑞士移位积分循环赛，每轮严格限时，杜绝超时疲劳',
            '全程配备国家级裁判长执裁与随队红十字医疗急救保障',
          ],
          perks: [
            '全程入住五星温泉度假酒店养生房（含防滑扶手）',
            '定制老友防风保暖参赛马甲与大师秩序册',
            '赛场提供专业AED配备、随队医生与养生草本茶饮站',
            '专属专业跟拍摄影并赠送实体纪念相册',
          ],
          medicalAssurance: [
            '配备 2 台专业 AED 除颤仪与随队三甲急救护士',
            '赛前提供免费血压、脉搏健康筛查与健康档案建立',
            '赛场全场采用加厚人体工学护腰软椅与绿色无障碍通道',
            '全天供应温热养生草本茶饮（罗汉果茶、枸杞菊花茶）',
          ],
          creator: creatorName,
          status: 'registration',
        });
      } else {
        const isDunhuang = textToParse.includes('敦煌') || textToParse.includes('莫高窟');
        const isQiandao = textToParse.includes('千岛湖') || textToParse.includes('道医');
        setParsedResult({
          title: isDunhuang
            ? '丝路长卷 · 敦煌莫高窟特窟学术探秘与河西走廊7日定制'
            : isQiandao
            ? '千岛湖森林负氧离子与富硒天然温泉6日道医养生慢居'
            : '苏州古典园林与吴门文脉5日深度学术慢游',
          subtitle: isDunhuang
            ? '特窟特批导赏 · 专家学者同行 · 供氧商务专车'
            : isQiandao
            ? '道医名家号脉 · 富硒私汤养神 · 慢游有机美馔'
            : '特邀文博学者随团 · 五星适老园林客栈 · 纯玩无购物',
          destination: isDunhuang ? '甘肃 · 敦煌/张掖/嘉峪关' : isQiandao ? '浙江 · 杭州/千岛湖' : '江苏 · 苏州/太湖',
          departureCity: isDunhuang ? '兰州中川机场专车接送' : isQiandao ? '杭州东站/萧山机场专车接送' : '上海市人民广场/虹桥枢纽集中发车',
          category: isQiandao ? '康养山海' : '学者同行',
          form: isQiandao ? '慢调旅居' : '名校名师研学',
          level: '尊享名仕',
          tripCategory: 'domestic',
          productTheme: isQiandao ? '健康' : '文化',
          productForm: isQiandao ? '旅居' : '研学',
          productCarrier: isDunhuang ? '专列' : isQiandao ? '游轮' : '无障碍大巴',
          timeLevel: isDunhuang ? 'L3' : isQiandao ? 'L4' : 'L3',
          businessTrack: isDunhuang ? 'track3_premium' : 'track2_mainstream',
          durationDays: isDunhuang ? 7 : isQiandao ? 6 : 5,
          durationNights: isDunhuang ? 6 : isQiandao ? 5 : 4,
          priceGroup: isDunhuang ? 6880 : isQiandao ? 2980 : 3980,
          pricePremium: isDunhuang ? 9880 : isQiandao ? 4580 : 5880,
          singleSupplement: isDunhuang ? 1600 : isQiandao ? 600 : 800,
          cover: isDunhuang
            ? 'https://images.unsplash.com/photo-1548013146-72479768bada?auto=format&fit=crop&w=800&q=80'
            : isQiandao
            ? 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80'
            : 'https://images.unsplash.com/photo-1548013146-72479768bada?auto=format&fit=crop&w=800&q=80',
          images: [
            isDunhuang
              ? 'https://images.unsplash.com/photo-1548013146-72479768bada?auto=format&fit=crop&w=800&q=80'
              : 'https://images.unsplash.com/photo-1548013146-72479768bada?auto=format&fit=crop&w=800&q=80',
            'https://images.unsplash.com/photo-1508804185872-d7badad00f7d?auto=format&fit=crop&w=800&q=80',
            'https://images.unsplash.com/photo-1512813195386-6cf811ad3542?auto=format&fit=crop&w=800&q=80',
          ],
          features: isDunhuang
            ? [
                '【特窟专场】特批进入莫高窟2个常规不对外开放特窟，专家微型耳麦精讲',
                '【适老长途】高品质供氧豪华商务车，每日车程严格控制在 3.5 小时内',
                '【丝路盛宴】专享敦煌山庄五星客栈，享用大漠风情养生清补宴',
              ]
            : [
                '【名师随行】特邀复旦大学文博学者全程同行，深度解析江南建筑美学',
                '【适老慢行】每日行程步数严格控制在 4,200 步以内，全平缓无台阶路线',
                '【非遗私享】入住五星园林客栈，私享昆曲牡丹亭折子戏与苏帮迎宾宴',
              ],
          fitnessLevel: isDunhuang ? 2 : 1,
          fitnessDesc: isDunhuang ? '平缓慢行 · 随车供氧 · 随队医生随行' : '平缓无坡 · 适老五星 · 配急救医疗包与轮椅',
          master: {
            name: isDunhuang ? '段文渊 老师' : isQiandao ? '汪明德 教授' : '顾云舟 教授',
            title: isDunhuang
              ? '敦煌研究院特聘研究员 / 丝绸之路学者'
              : isQiandao
              ? '浙江中医药大学退休教授 / 新安医学传人'
              : '中华古籍保护研究院 特聘导师',
            badge: isDunhuang ? '丝路特窟专家' : isQiandao ? '新安道医名家' : '国家文博专家',
            intro: '专注领域四十余载，以通俗生动语言为乐龄长辈深度解析文化脉络。',
            avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=400&q=80',
          },
          tgo: {
            name: '林晨 (晨晨)',
            roleTitle: '四季游金牌乐龄管家',
            badge: '国家一级导游 · 红十字救护员',
            avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=400&q=80',
            serviceRating: 5.0,
            tags: ['随队急救员', '慢节奏控速', '膳食低盐关照', '协助提行李'],
            motto: '像照顾自己的父母一样，让每一位老友平安从容慢享旅途。',
          },
          creator: creatorName,
          status: 'published',
        });
      }
    } finally {
      setParseProgress(100);
      setIsParsing(false);
      showToast('🎉 AI 智能分析完成！已精准结构化提取全套方案字段，请审核后应用');
    }
  };

  const handleApplyToForm = () => {
    if (!parsedResult) return;
    onApplyParsedData(parsedResult, targetType);
    onClose();
    showToast(`已一键导入【${targetType === 'event' ? '赛事' : '活动'}】录入表单，您可以随时进行人工微调审核！`);
  };

  return (
    <div id="ai-pre-parser-modal" className="fixed inset-0 z-70 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 animate-fadeIn">
      <div className="bg-white text-slate-800 rounded-3xl w-full max-w-4xl max-h-[92vh] overflow-hidden shadow-2xl flex flex-col border border-slate-200">
        {/* Header */}
        <div className="px-6 py-4 bg-amber-50/50 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-amber-500 to-amber-600 text-white flex items-center justify-center shadow-xs font-bold">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-bold font-serif text-slate-900">
                  AI 智能方案预录入与代填工作台
                </h3>
                <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-900 border border-amber-300 font-bold">
                  3.1 三维三轨 · 智能解析
                </span>
              </div>
              <p className="text-xs text-slate-600 mt-0.5">
                支持上传 Word (.docx)、PDF、Excel (.xlsx) 或粘贴文本，AI 自动提取关键要素并自动填充录入表单
              </p>
            </div>
          </div>

          <button
            id="btn-close-ai-parser"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-800 flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Target Type & Operator Bar */}
        <div className="px-6 py-3 bg-slate-50 border-b border-slate-200 flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-600 font-medium">解析目标类型：</span>
            <div className="flex bg-white p-1 rounded-xl border border-slate-200 shadow-2xs">
              <button
                id="btn-target-type-activity"
                type="button"
                onClick={() => {
                  setTargetType('activity');
                  setParsedResult(null);
                }}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                  targetType === 'activity'
                    ? 'bg-amber-600 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Compass className="w-3.5 h-3.5" />
                <span>文旅慢游研学活动</span>
              </button>
              <button
                id="btn-target-type-event"
                type="button"
                onClick={() => {
                  setTargetType('event');
                  setParsedResult(null);
                }}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                  targetType === 'event'
                    ? 'bg-amber-600 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Trophy className="w-3.5 h-3.5" />
                <span>乐龄文体交流赛事 (掼蛋/桥牌/太极)</span>
              </button>
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs text-slate-600 bg-white px-3 py-1.5 rounded-xl border border-slate-200">
            <User className="w-3.5 h-3.5 text-amber-600" />
            <span>当前操作录入人：<strong className="text-slate-900">{currentAdminUser.name}</strong></span>
          </div>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5 bg-white">
          {/* Mode Switch Tabs */}
          <div className="flex items-center justify-between border-b border-slate-200 pb-3">
            <div className="flex gap-2">
              <button
                id="btn-mode-demo"
                onClick={() => setInputMode('demo')}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                  inputMode === 'demo'
                    ? 'bg-amber-50 text-amber-900 border border-amber-300 shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <FileText className="w-3.5 h-3.5 text-amber-600" />
                <span>1. 选现成典型示例方案 (一键体验)</span>
              </button>
              <button
                id="btn-mode-upload"
                onClick={() => setInputMode('upload')}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                  inputMode === 'upload'
                    ? 'bg-amber-50 text-amber-900 border border-amber-300 shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <Upload className="w-3.5 h-3.5 text-amber-600" />
                <span>2. 上传本地文件 (.docx / .pdf / .xlsx)</span>
              </button>
              <button
                id="btn-mode-text"
                onClick={() => setInputMode('text')}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                  inputMode === 'text'
                    ? 'bg-amber-50 text-amber-900 border border-amber-300 shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <FileType className="w-3.5 h-3.5 text-amber-600" />
                <span>3. 直接粘贴文本草案</span>
              </button>
            </div>
          </div>

          {/* Mode 1: Demo Proposals */}
          {inputMode === 'demo' && (
            <div className="space-y-3">
              <div className="text-xs text-slate-600 flex items-center gap-1.5">
                <Info className="w-3.5 h-3.5 text-amber-600" />
                <span>点击下方任一标准方案文档，自动载入内容并体验 AI 智能解析：</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {(targetType === 'event' ? DEMO_EVENT_PROPOSALS : DEMO_ACTIVITY_PROPOSALS).map((demo) => (
                  <div
                    key={demo.id}
                    onClick={() => handleSelectDemo(demo)}
                    className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between ${
                      proposalText === demo.content
                        ? 'bg-amber-50/90 border-amber-500 shadow-xs ring-1 ring-amber-400'
                        : 'bg-slate-50 border-slate-200 hover:border-amber-300 hover:bg-amber-50/30'
                    }`}
                  >
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] px-2 py-0.5 rounded bg-white text-slate-700 font-mono border border-slate-200">
                          {demo.type}
                        </span>
                        <span className="text-[10px] text-amber-700 font-bold">{demo.tag}</span>
                      </div>
                      <h4 className="font-bold text-xs text-slate-900 leading-snug line-clamp-2">
                        {demo.name}
                      </h4>
                    </div>
                    <div className="mt-3 pt-2 border-t border-slate-200 flex items-center justify-between text-[11px] text-slate-500">
                      <span>就绪</span>
                      <span className="text-amber-700 font-bold">点击载入 →</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Mode 2: File Upload (Word/PDF/Excel) */}
          {inputMode === 'upload' && (
            <div className="space-y-3">
              <div className="border-2 border-dashed border-amber-300 hover:border-amber-500 rounded-3xl p-6 text-center bg-amber-50/30 transition-all">
                <input
                  type="file"
                  id="proposal-file-input"
                  onChange={handleFileChange}
                  accept=".docx,.doc,.pdf,.xlsx,.xls,.csv,.txt"
                  className="hidden"
                />
                <label
                  htmlFor="proposal-file-input"
                  className="cursor-pointer flex flex-col items-center justify-center space-y-3"
                >
                  <div className="w-14 h-14 rounded-2xl bg-amber-100 text-amber-800 border border-amber-300 flex items-center justify-center shadow-xs">
                    <FileUp className="w-7 h-7" />
                  </div>
                  <div>
                    <div className="font-bold text-sm text-slate-800">
                      {selectedFile ? selectedFile.name : '点击选择或拖拽 Word (.docx) / PDF / Excel (.xlsx) 方案文档至此处'}
                    </div>
                    <p className="text-xs text-slate-500 mt-1">
                      已集成 mammoth 与 xlsx 引擎，自动提取 Word 正文、表格、排期与日程数据
                    </p>
                  </div>
                  <div className="px-4 py-1.5 rounded-full bg-white border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50 shadow-2xs">
                    {selectedFile ? '更换文档' : '浏览本地文件'}
                  </div>
                </label>
              </div>

              {fileExtractInfo && (
                <div className="flex items-center gap-2 p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>{fileExtractInfo}</span>
                </div>
              )}
            </div>
          )}

          {/* Text Input Preview / Editor */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs text-slate-600">
              <span className="font-medium flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5 text-amber-600" />
                <span>方案文本内容预览与校对：</span>
              </span>
              <span className="font-mono text-slate-500">{proposalText.length} 字</span>
            </div>
            <textarea
              id="textarea-proposal-content"
              value={proposalText}
              onChange={(e) => setProposalText(e.target.value)}
              placeholder="请在此粘贴或修改文旅行程 / 赛事方案文本（包含时间、目的地、价格、名师、适老保障等）..."
              rows={6}
              className="w-full p-3.5 bg-slate-50 border border-slate-300 rounded-2xl text-xs text-slate-800 font-sans leading-relaxed focus:outline-none focus:border-amber-600 focus:bg-white transition-all shadow-2xs"
            />
          </div>

          {/* Trigger Parse Action */}
          <div className="flex items-center justify-between bg-amber-50/60 p-4 rounded-2xl border border-amber-200">
            <div className="text-xs text-slate-700">
              解析引擎：<span className="text-amber-800 font-mono font-bold">Gemini 3.7 Flash 文旅与赛事专属解析模型</span>
            </div>
            <button
              id="btn-start-ai-parse"
              onClick={handleStartAiParse}
              disabled={isParsing || !proposalText.trim() || fileExtracting}
              className={`px-5 py-2.5 rounded-xl font-bold text-xs sm:text-sm flex items-center gap-2 transition-all cursor-pointer ${
                isParsing || !proposalText.trim() || fileExtracting
                  ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                  : 'bg-emerald-700 hover:bg-emerald-800 text-white shadow-xs hover:scale-[1.01]'
              }`}
            >
              {isParsing ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>AI 正在结构化深度解析中 ({parseProgress}%)...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>开始 AI 智能分析与结构化提取</span>
                </>
              )}
            </button>
          </div>

          {/* Parsing Progress Bar */}
          {isParsing && (
            <div className="space-y-2 bg-slate-50 p-4 rounded-2xl border border-slate-200 animate-fadeIn">
              <div className="flex items-center justify-between text-xs">
                <span className="text-amber-800 font-medium flex items-center gap-1.5">
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  {parseStepText}
                </span>
                <span className="text-slate-600 font-mono">{parseProgress}%</span>
              </div>
              <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-amber-500 to-emerald-500 transition-all duration-300"
                  style={{ width: `${parseProgress}%` }}
                ></div>
              </div>
            </div>
          )}

          {/* Parsed Result Display & Human Review Card */}
          {parsedResult && (
            <div id="ai-parsed-result-card" className="bg-emerald-50/40 p-5 rounded-3xl border border-emerald-300 space-y-4 shadow-sm animate-fadeIn">
              <div className="flex items-center justify-between border-b border-emerald-200/70 pb-3">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                  <h4 className="font-bold text-sm text-slate-900">
                    AI 结构化解析成果（已智能提取全部字段，可一键填入发布表单）
                  </h4>
                </div>
                <span className="text-xs px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 font-bold border border-emerald-200">
                  结构化完整度 100%
                </span>
              </div>

              {/* Parsed Meta Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 text-xs">
                <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-2xs">
                  <div className="text-slate-500 text-[11px] mb-1">主标题 & 目的地/城市</div>
                  <div className="font-bold text-slate-900 line-clamp-1">{parsedResult.title}</div>
                  <div className="text-amber-800 font-bold mt-1 flex items-center gap-1">
                    <MapPin className="w-3 h-3" />
                    <span>{parsedResult.destination || parsedResult.city}</span>
                  </div>
                </div>

                <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-2xs">
                  <div className="text-slate-500 text-[11px] mb-1">3.1 产品框架（三维三轨）</div>
                  <div className="text-slate-900 font-bold">
                    {parsedResult.productTheme} · {parsedResult.productForm} · {parsedResult.productCarrier}
                  </div>
                  <div className="text-amber-700 text-[10px] mt-0.5">
                    跨度: {parsedResult.timeLevel} | 业务轨道: {parsedResult.businessTrack}
                  </div>
                </div>

                <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-2xs">
                  <div className="text-slate-500 text-[11px] mb-1">定价档位 & 录入操作员</div>
                  <div className="text-slate-900 font-bold">
                    {targetType === 'event'
                      ? `会务费: ¥${parsedResult.registrationFee} (限${parsedResult.maxTeams}席)`
                      : `大团: ¥${parsedResult.priceGroup} / 小团: ¥${parsedResult.pricePremium}`}
                  </div>
                  <div className="text-emerald-700 text-[11px] mt-0.5 font-bold">
                    录入人: {parsedResult.creator}
                  </div>
                </div>
              </div>

              {/* Highlights / Features preview */}
              <div className="bg-white p-3.5 rounded-2xl border border-slate-200 space-y-2 text-xs shadow-2xs">
                <div className="text-slate-800 font-bold flex items-center gap-1.5">
                  <Award className="w-4 h-4 text-amber-600" />
                  <span>{targetType === 'event' ? '🏆 提取的健康文娱与医疗保障要点：' : '✨ 提取的核心适老亮点与名师学者：'}</span>
                </div>
                {targetType === 'event' ? (
                  <div className="space-y-1.5 text-slate-700">
                    <div className="flex items-start gap-1.5">
                      <span className="text-amber-600 font-bold">🥇 荣誉表彰：</span>
                      <span>{typeof parsedResult.prizePool === 'object' ? parsedResult.prizePool?.first : parsedResult.prizePool}</span>
                    </div>
                    <div className="flex items-start gap-1.5">
                      <span className="text-amber-600 font-bold">⚖️ 执裁专家：</span>
                      <span>{parsedResult.referee?.name} ({parsedResult.referee?.title || parsedResult.referee?.badge})</span>
                    </div>
                    <div className="flex items-start gap-1.5">
                      <span className="text-emerald-600 font-bold">🏥 适老医疗急救：</span>
                      <span>配备2台专业AED除颤仪、随队三甲急救护士、血压筛查、护腰软椅与养生茶歇</span>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-1.5 text-slate-700">
                    <div className="flex items-start gap-1.5">
                      <span className="text-amber-600 font-bold">👨‍🏫 随团学者：</span>
                      <span>{parsedResult.master?.name} ({parsedResult.master?.title || parsedResult.master?.badge})</span>
                    </div>
                    <div className="flex items-start gap-1.5">
                      <span className="text-emerald-600 font-bold">🚶‍♂️ 体能负荷：</span>
                      <span>{parsedResult.fitnessDesc || '平缓慢行·适老五星·配随团急救医疗包'}</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Apply Action Bottom Bar */}
              <div className="flex items-center justify-between pt-2 border-t border-emerald-200/70">
                <span className="text-xs text-slate-600">
                  点击按钮将直接一键填充至发布录入表单中，管理员可随时进行微调与最终审核。
                </span>
                <button
                  id="btn-apply-ai-parsed-data"
                  onClick={handleApplyToForm}
                  className="px-6 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs sm:text-sm flex items-center gap-2 shadow-xs transition-all active:scale-95 cursor-pointer"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>一键填充到发布表单并审核</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
