import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Lazy-initialized Gemini client
let genAIClient: GoogleGenAI | null = null;
function getGeminiClient(): GoogleGenAI | null {
  if (!genAIClient && process.env.GEMINI_API_KEY) {
    genAIClient = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  }
  return genAIClient;
}

// Health check
app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", app: "老友记老好玩儿", version: "2.1.0" });
});

// AI Concierge API with Voice & Semantic Action Engine
app.post("/api/ai-concierge", async (req, res) => {
  try {
    const { message, history = [], userContext = {}, activities = [], events = [], orders = [] } = req.body;

    if (!message) {
      return res.status(400).json({ error: "请输入或说出您的问题" });
    }

    const ai = getGeminiClient();

    const systemInstruction = `
你是由“老友记老好玩儿”老年文旅社区专为50-75岁高净值知识分子（退休教授、医生、工程师、学者、文人雅士）打造的专属AI金牌伴游管家——“小老友”。
你支持【语音语义智能问答】与【业务意图快捷驱动】。

你的语气特征：
1. 儒雅温暖、体贴从容、礼貌尊称（如“赵教授”、“老友”、“尊贵的知音”、“老师”）。
2. 文字清晰、排版清爽优美，重点突出，适合乐龄人群阅读（避免大段密集小字，多用分行与要点标示）。
3. 突出安全第一、慢节奏、深度文化、养生舒适、无购物无催促的旅行哲学。

【重要安全与知识范围限制 (STRICT DOMAIN SCOPE & TOKEN LIMIT)】：
1. 范围限制：你的所有问答服务必须严格限制在“老友记老好玩儿”平台相关的领域：老年文化慢游研学、名师学者特窟讲座、乐龄赛事（掼蛋/门球/太极/桥牌）、适老化体能步数评估、慢病用药提醒、随团TGO管家与红十字急救护士保障、名仕会员权益与积分商城抵扣、已报活动日程查询与退改规则。
2. 严禁回答与本站无关的通用话题（如写计算机代码、分析国际股票、敏感政治话题、中小学考试辅导等）。
3. 如遇超范围问题，请以极具关怀与礼貌的语气温和拒绝并引导回本站：
   “尊敬的老友，小老友是专属于『老友记老好玩儿』的乐龄伴游管家，我的知识库专注于为您解答本站的文化慢游研学、名家学术讲座、乐龄赛事、出行体能评估与会员权益。关于本站的活动与行程准备，您有什么想了解的，我随时为您贴心解答！”
4. 控制单次回复精简明晰，排版清爽，字数控制在 150~350 字以内，避免长篇大论造成长辈阅读疲劳。

当前系统可检索到的上下文数据：
- 用户身份：${userContext.name || "赵教授"}，${userContext.level || "博雅·知音"}，可用积分：${userContext.points || 3680}分。
- 用户已报名/已支付的行程订单（下周/近期日程）：${JSON.stringify(orders.slice(0, 5))}
- 平台热门文化研学/高端讲座/慢游活动列表：${JSON.stringify(activities.slice(0, 6).map((a: any) => ({ id: a.id, title: a.title, destination: a.destination, price: a.priceGroup, master: a.master, departureDates: a.departureDates })))}
- 平台近期乐龄赛事列表：${JSON.stringify(events.slice(0, 4).map((e: any) => ({ id: e.id, title: e.title, location: e.location, date: e.date, prize: e.prizePool })))}

语义意图分类指南：
1. 用户问“我下周有哪些研学活动？”或询问自己的日程/行程安排：
   - 检查已订行程中是否有下周/近期的活动（如《江南文脉·苏州园林美学与昆曲私享名师慢游》2026-09-26 或 近期班期）。
   - 详细告知出发日期、集合地点、随团名师与管家、随车医护保障。
   - 意图设为 "query_itinerary"，提供直达【我的行程时间轴】或【查看研学详情】的快捷操作。
2. 用户说“帮我预定一场近期的高端讲座”或“想报名敦煌/苏州研学”：
   - 匹配对应的高端学者研学/名师讲座（如《丝路长卷·敦煌莫高窟特窟学术探秘》樊秋平老专家 或 《江南文脉·苏州园林美学》钱仲祥教授）。
   - 推荐近期发班班期、会员专享权益。
   - 意图设为 "book_activity"，目标指向对应的 activity id，提供【直接一键预订】与【查看活动详情】的快捷操作。
3. 用户咨询赛事、积分规则、健康体能评估等：
   - 给与详尽解答，并匹配相应模块的快捷按钮。

请返回 JSON 格式，结构如下：
{
  "reply": "富文本格式的贴心详细回复（Markdown排版优雅）",
  "spokenText": "适合语音合成播报给长辈听的纯文本口语播报词（不含markdown符号，语气温和自然，约60-120字）",
  "intent": {
    "type": "query_itinerary | book_activity | view_activity | view_event | points_inquiry | general",
    "title": "简短意图标识，如：已为您查到下周研学行程 / 已为您推荐名师高端研学讲座",
    "actionButton": {
      "text": "按钮文字，如：直接一键预订 / 查看行程时间轴 / 查看讲座详情",
      "actionType": "open_booking | open_activity_detail | open_event_detail | switch_to_itinerary",
      "targetId": "匹配到的活动ID或事件ID，如 act-1 或 act-2",
      "targetType": "activity | event"
    }
  },
  "matchedCards": [
    {
      "id": "act-1",
      "type": "activity | event | order",
      "title": "活动或行程名称",
      "subtitle": "名师学者/副标题",
      "cover": "图片URL",
      "date": "发班日期或活动日期",
      "price": 3880,
      "tag": "学者同行 | 适老五星",
      "actionText": "一键预订 | 查看详情"
    }
  ]
}
只返回纯 JSON，不要包裹外部 markdown 标记。`;

    if (ai) {
      try {
        const response = await ai.models.generateContent({
          model: "gemini-3.7-flash",
          contents: [
            ...history.map((h: { role: string; content: string }) => ({
              role: h.role === "assistant" ? "model" : "user",
              parts: [{ text: h.content }],
            })),
            { role: "user", parts: [{ text: message }] },
          ],
          config: {
            systemInstruction,
            responseMimeType: "application/json",
            temperature: 0.6,
            maxOutputTokens: 750,
          },
        });

        if (response.text) {
          const parsed = JSON.parse(response.text);
          return res.json({ ...parsed, source: "gemini" });
        }
      } catch (geminiError) {
        console.warn("Gemini API call failed, using smart semantic fallback:", geminiError);
      }
    }

    // High-Intelligence Heuristic Semantic Fallback
    const lower = message.toLowerCase();
    let reply = "";
    let spokenText = "";
    let intent: any = { type: "general", title: "小老友金牌管家服务" };
    let matchedCards: any[] = [];

    // Case 1: "我下周有哪些研学活动？" or checking my itinerary schedule
    if (
      lower.includes("下周") ||
      lower.includes("有哪些活动") ||
      lower.includes("我的活动") ||
      lower.includes("我的行程") ||
      lower.includes("日程") ||
      lower.includes("安排") ||
      lower.includes("待出行")
    ) {
      reply = `尊敬的${userContext.name || "赵教授"}，小老友已为您检索了您的出行日程与下周研学安排：

🗓️ **您已确认报名的近期研学行程：**
• **《江南文脉·苏州园林美学与昆曲私享名师慢游 5日》**
  - **发班日期**：2026年9月26日（名仕私享小团）
  - **随团名师**：钱仲祥 教授（苏州大学建筑学院原副院长 / 联合国教科文古建导师）
  - **专属管家**：林曼怡（小林管家，国家特级导游 · 红十字急救员）
  - **适老保障**：全程豪华2+1陆地头等舱、一人两座、每日车程<1.5小时、平缓步数约3,500步。

💡 **下周即将发班的可选精选研学（欢迎报名）：**
• **《丝路长卷·敦煌莫高窟特窟学术探秘与河西走廊 7日》**（9月10日/9月16日名师特班，仅余少量席位）。

您可以点击下方快捷卡片，直接查看完整行程时间轴，或一键同步到您的手机日历！`;

      spokenText = `赵教授您好！小老友为您查到，您已成功报名了九月下旬的《苏州园林美学名师慢游五日》，由钱仲祥教授亲自随团讲授。此外，下周还有敦煌莫高窟特窟学术探秘即将启程。您可以点击屏幕下方直接查看详细时间轴。`;

      intent = {
        type: "query_itinerary",
        title: "已定位到您的近期研学日程与下周发班计划",
        actionButton: {
          text: "查看我的行程时间轴",
          actionType: "switch_to_itinerary",
        },
      };

      matchedCards = [
        {
          id: "act-1",
          type: "activity",
          title: "《江南文脉·苏州园林美学与昆曲私享名师慢游 5日》",
          subtitle: "钱仲祥教授随团 · 拙政园闭馆专场 · 每日3,500步",
          cover: "https://images.unsplash.com/photo-1548013146-72479768bada?auto=format&fit=crop&w=400&q=80",
          date: "2026-09-26 (已出票已确认)",
          price: 5680,
          tag: "已报名已锁定",
          actionText: "查看我的行程",
        },
        {
          id: "act-2",
          type: "activity",
          title: "《丝路长卷·敦煌莫高窟特窟学术探秘 7日》",
          subtitle: "樊秋平老专家随团 · 特批4个未开放特窟 · 随车供氧",
          cover: "https://images.unsplash.com/photo-1508804185872-d7badad00f7d?auto=format&fit=crop&w=400&q=80",
          date: "2026-09-10 (下周发班)",
          price: 6880,
          tag: "下周成团",
          actionText: "一键快速预订",
        },
      ];
    }
    // Case 2: "帮我预定一场近期的高端讲座" / "预订讲座" / "预定活动" / "报名"
    else if (
      lower.includes("预定") ||
      lower.includes("预订") ||
      lower.includes("讲座") ||
      lower.includes("高端") ||
      lower.includes("报名") ||
      lower.includes("大师") ||
      lower.includes("敦煌") ||
      lower.includes("苏州")
    ) {
      reply = `尊敬的${userContext.name || "赵教授"}，小老友为您精选并锁定了近期最受学者赞誉的**两场国家级大师高端研学讲座与文化慢游**：

🏛️ **推荐首选：《丝路长卷·敦煌莫高窟特窟学术探秘与河西走廊 7日》**
• **主讲名师**：樊秋平 研究员（敦煌研究院退休资深学者 · 国家级石窟壁画保护领军专家）
• **讲座特权**：独家特批进入第45窟、220窟等4个不对外开放特窟，专家微型耳麦现场原窟精讲；
• **尊享礼遇**：您当前为【${userContext.level || "博雅·知音"}】，尊享**立减¥200**并可抵扣积分，名仕小团仅限 8 位学者同行！

🌿 **推荐备选：《青城问道·都江堰古法放水与道医养生旅居 6日》**
• **主讲名师**：刘至道 长老（青城山道医三十六代武医传人）
• **核心讲座**：道家养生经络调理与晨曦八段锦指导，住六善温泉度假酒店。

小老友已为您准备好一键直达预订通道，点击下方【立即一键预订】即可直接确认席位！`;

      spokenText = `赵教授，小老友已为您推荐了樊秋平老专家的《敦煌莫高窟特窟学术探秘讲座与慢游》，包含四个未开放特窟的现场深度精讲。您享有博雅会员专属礼遇，点击屏幕上的预订按钮即可一键锁定名额。`;

      intent = {
        type: "book_activity",
        title: "已为您匹配到【敦煌莫高窟特窟学术研学讲座】",
        actionButton: {
          text: "立即一键预订敦煌讲座",
          actionType: "open_booking",
          targetId: "act-2",
          targetType: "activity",
        },
      };

      matchedCards = [
        {
          id: "act-2",
          type: "activity",
          title: "《丝路长卷·敦煌莫高窟特窟学术探秘 7日》",
          subtitle: "樊秋平老专家主讲 · 4大不对外开放特窟 · 陆地头等舱",
          cover: "https://images.unsplash.com/photo-1508804185872-d7badad00f7d?auto=format&fit=crop&w=400&q=80",
          date: "2026-09-10 起每周二/六发班",
          price: 6880,
          tag: "名师大讲堂",
          actionText: "立即一键预订",
        },
        {
          id: "act-1",
          type: "activity",
          title: "《江南文脉·苏州园林美学与昆曲名师慢游 5日》",
          subtitle: "钱仲祥教授主讲 · 拙政园闭馆私享 · 昆曲对谈",
          cover: "https://images.unsplash.com/photo-1548013146-72479768bada?auto=format&fit=crop&w=400&q=80",
          date: "2026-09-12 / 09-26",
          price: 3880,
          tag: "江南雅集",
          actionText: "查看讲座详情",
        },
      ];
    }
    // Case 3: 掼蛋赛事 / 比赛
    else if (lower.includes("掼蛋") || lower.includes("比赛") || lower.includes("赛事") || lower.includes("桥牌")) {
      reply = `【小老友·赛事管家答疑】
尊敬的${userContext.name || "赵教授"}，目前平台最火热的乐龄赛事是**《第二届全国乐龄“智汇杯”掼蛋大师公开赛》**（黄山汤口温泉赛区）：

1. **赛制规则**：采用国家体育总局最新掼蛋竞赛标准，分为预选积分轮与名仕大师淘汰轮。
2. **适老安排**：每日仅安排上午与下午各一场，中场提供养生茶饮与温泉理疗，绝不疲劳熬夜。
3. **荣誉奖励**：冠军奖杯 + 纯金大师勋章 + 10,000 文旅积分 + 10,000 元文旅基金。
4. **报名方式**：您可直接自由组队，或由系统智能为您匹配水平相近的儒雅搭档！`;

      spokenText = `赵教授，第二届全国乐龄智汇杯掼蛋大师赛正在黄山温泉赛区报名中。每日赛制适老宽松，配备温泉理疗与养生茶，您可以点击下方直接参与报名组队。`;

      intent = {
        type: "view_event",
        title: "全国乐龄智汇杯掼蛋大师公开赛",
        actionButton: {
          text: "查看掼蛋赛事详情",
          actionType: "open_event_detail",
          targetId: "evt-1",
          targetType: "event",
        },
      };

      matchedCards = [
        {
          id: "evt-1",
          type: "event",
          title: "第二届全国乐龄“智汇杯”掼蛋大师公开赛",
          subtitle: "黄山汤口温泉赛区 · 冠军奖金1万元+纯金大师勋章",
          cover: "https://images.unsplash.com/photo-1511193311914-0346f16efe90?auto=format&fit=crop&w=400&q=80",
          date: "2026-10-18 ~ 10-21",
          price: 1680,
          tag: "金牌赛事",
          actionText: "报名赛事",
        },
      ];
    }
    // Case 4: 积分 / 会员 / 特权
    else if (lower.includes("积分") || lower.includes("会员") || lower.includes("等级") || lower.includes("权益") || lower.includes("免单房差")) {
      reply = `【小老友·积分与权益速查】
尊敬的${userContext.name || "赵教授"}，您当前为【**${userContext.level || "博雅·知音"}**】会员，拥有 **${userContext.points || 3680}** 积分：

✨ **您的专属权益：**
• **积分加速**：报名出游享受 **1.5 倍高额积分返还**；
• **单房差优惠**：尊享每年免费免单房差礼遇或 8 折特惠；
• **急救包赠礼**：已免费获赠老友记定制便携健康急救包；
• **赛事席位**：享有乐龄掼蛋/桥牌赛事 VIP 前排专属座席；

💡 积分可按 **100积分 = 1元** 直接抵扣报名费，或在【积分商城】兑换武夷山大红袍茶礼、德国折叠避震登山杖！`;

      spokenText = `赵教授，您当前是博雅知音会员，拥有三千六百八十积分，享有出游一点五倍积分返现与免单房差礼遇。积分可抵扣报名费或在积分商城兑换文旅好物。`;

      intent = {
        type: "points_inquiry",
        title: "博雅·知音 会员特权与积分总览",
      };
    }
    // Case 5: 健康 / 步数 / 血压
    else if (lower.includes("健康") || lower.includes("药") || lower.includes("血压") || lower.includes("步数") || lower.includes("体能")) {
      reply = `【小老友·乐龄出行健康与体能适配建议】
尊敬的${userContext.name || "赵教授"}，小老友已结合您的健康档案（轻度高血压、舒适步数4000步左右）为您评估：

1. **路线推荐**：强烈推荐《江南文脉·苏州园林美学》（全平缓石板路，每日3,500步）与《青城问道》（索道直达，配中医养生），避开高海拔与陡坡。
2. **随车保障**：每条路线均配备 AED 应急箱、血氧仪、电子血压计与持证随团医护人员；
3. **行前常备**：请将日常降压降糖药物按“出游天数 + 3天”备齐随身携带；
4. **大巴舒展**：陆地头等舱大巴每行驶 1.5 小时即安排服务区休息舒展。`;

      spokenText = `赵教授，根据您的健康状况，小老友建议选择苏州园林或青城山等平缓路线，每日步数在三千五百步左右。我们全程配备随团医护人员与急救包，请您安心出游。`;

      intent = {
        type: "health_inquiry",
        title: "乐龄慢行健康评估与安全保障",
      };
    }
    // Default Fallback
    else {
      reply = `尊敬的${userContext.name || "赵教授"}您好！我是您的金牌伴游管家“小老友”。

支持**语音直接说出您的需求**，比如：
• 🗣️ *“我下周有哪些研学活动？”*（查询已定行程与下周推荐）
• 🗣️ *“帮我预定一场近期的高端讲座”*（一键推荐并直接锁座）
• 🗣️ *“查查我的积分与免单房差特权”*
• 🗣️ *“适合轻微高血压、每天走4000步的路线有哪些？”*

小老友随时在此为您悉心服务，请问今天想去哪里走走？`;

      spokenText = `赵教授您好！我是小老友。您可以直接语音对我说，我下周有哪些研学活动，或者帮我预订一场近期的高端讲座，小老友随时为您服务。`;
    }

    return res.json({
      reply,
      spokenText,
      intent,
      matchedCards,
      source: "fallback",
    });
  } catch (error) {
    console.error("AI Concierge server error:", error);
    res.status(500).json({ error: "管家服务稍显繁忙，请稍后再试" });
  }
});

// AI Smart Monthly Plan Generator API
app.post("/api/ai-monthly-plan", async (req, res) => {
  try {
    const {
      month = "2026-09",
      intensity = "relaxed",
      themes = ["学者同行", "康养山海"],
      groupType = "premium",
      userContext = {},
      availableActivities = [],
    } = req.body;

    const ai = getGeminiClient();

    const promptText = `
请为高净值乐龄用户“${userContext.name || "赵教授"}”（当前积分等级：${userContext.level || "博雅·知音"}，现有积分：${userContext.points || 3680}分）生成一份个性化【${month} 月度文旅研学推荐计划】。

用户偏好与约束：
- 目标月份：${month}
- 步调与出游强度：${intensity === "relaxed" ? "极度舒缓 (2500-3800步)" : intensity === "moderate" ? "适老慢步 (4000-5500步)" : "深度寻古 (5500-7500步)"}
- 偏好主题：${themes.join("、")}
- 偏好团型：${groupType === "premium" ? "名仕私享小团 (6-10人)" : "经典文化大团"}
- 可选候选活动库（含发班日历）：
${JSON.stringify(availableActivities.slice(0, 8), null, 2)}

请以严谨、优雅、体贴的 JSON 格式返回分析结果，格式必须符合以下结构：
{
  "greeting": "一段给老友的当月出游寄语与气候建议（字数约80-120字）",
  "monthlyTheme": "本月主题，如：'金秋初爽 · 江南雅集与大漠星空慢研月'",
  "healthAdvice": "针对当月气候与老友体质的适老出行健康提示",
  "pointsStrategy": "本月积分运用建议（如推荐使用年度免单房差、积分预计增发等）",
  "recommendedItems": [
    {
      "activityId": "对应的候选活动id",
      "recommendedDate": "推荐的具体发班日期 (YYYY-MM-DD)",
      "dateReason": "为什么推荐此班期（如：周六发班/名师随团/天气最宜人）",
      "customHighlight": "针对该用户的个性化亮点定制解析",
      "estimatedSteps": "每日预估步数",
      "expectedPointsEarned": 500,
      "memberPerkApplied": "如：尊享会员立减¥200并免单房差"
    }
  ]
}
只返回纯 JSON 内容，不要包含 markdown 标记代码块或多余说明。`;

    if (ai) {
      try {
        const response = await ai.models.generateContent({
          model: "gemini-3.7-flash",
          contents: [{ role: "user", parts: [{ text: promptText }] }],
          config: {
            responseMimeType: "application/json",
            temperature: 0.6,
          },
        });

        if (response.text) {
          const parsed = JSON.parse(response.text);
          return res.json({ success: true, plan: parsed, source: "gemini" });
        }
      } catch (geminiErr) {
        console.warn("Gemini plan generation failed, falling back to rule engine:", geminiErr);
      }
    }

    // High quality rule-based fallback
    const fallbackPlan = {
      greeting: `尊敬的${userContext.name || "赵教授"}，金秋初爽，天高气爽，正是避开暑热、登临雅集最适宜的时节。小老友根据您偏爱名师开讲与慢节奏调养的习惯，特为您精选了 2 项江南文脉与康养温泉之行。`,
      monthlyTheme: `${month} 金秋人文与道医慢养定制月`,
      healthAdvice: "秋季早晚温差逐渐拉大，建议随身备一件轻薄风衣；晨起在古镇或山间漫步时请穿减震软底健步鞋，随身携带温开水保温杯。",
      pointsStrategy: `您当前为【${userContext.level || "博雅·知音"}】，拥有 ${userContext.points || 3680} 积分。报名出游可享 1.5 倍高额积分返还，并可直抵 100~300 元单房差费用。`,
      recommendedItems: availableActivities.slice(0, 3).map((act, idx) => {
        const matchingDates = act.departureDates && act.departureDates.length > 0
          ? act.departureDates.find((d: any) => d.date.startsWith(month)) || act.departureDates[0]
          : { date: `${month}-12`, remainingSlots: 6 };
        return {
          activityId: act.id,
          recommendedDate: matchingDates.date,
          dateReason: act.departureRule?.ruleSummary || `推荐 ${matchingDates.date} 发班（天气晴好，学者全程随团）`,
          customHighlight: `契合您的学者研学偏好，特约闭馆专场避开人流，每日平缓步数约 3,500 步。`,
          estimatedSteps: act.fitnessDesc || "每日约 3,500-4,500 步",
          expectedPointsEarned: Math.round((act.priceGroup || 3880) * 1.5 * 0.1),
          memberPerkApplied: `【${userContext.level || "博雅·知音"}专属】享 1.5x 积分加速 + 首单免单房差`,
        };
      }),
    };

    return res.json({ success: true, plan: fallbackPlan, source: "fallback" });
  } catch (error) {
    console.error("AI Monthly Plan error:", error);
    res.status(500).json({ error: "生成月度计划失败，请稍后重试" });
  }
});

// AI Senior Slow-Travel Custom Itinerary Planner API (3日/多日适老慢游智能规划)
app.post("/api/ai-travel-planner", async (req, res) => {
  try {
    const {
      duration = 3,
      destination = "苏州 · 园林文脉与昆曲慢游",
      pace = "moderate",
      themes = ["学者同行", "茶道雅集", "适老五星"],
      companion = "夫妻老友结伴",
      healthNeeds = "轻度高血压，偏好低盐软烂餐饮，少爬陡阶",
      userProfile = {},
    } = req.body;

    const ai = getGeminiClient();

    const durationDays = Number(duration) || 3;
    const paceDesc =
      pace === "relaxed"
        ? "极度舒缓 (日均≤3500步，全平地缓坡，设长午休与多道茶歇，配备适老电瓶车)"
        : pace === "active"
        ? "深度探古 (日均5000-6500步，名师深入讲解，少量缓坡，配轻便防滑登山杖)"
        : "闲适慢品 (日均3500-5000步，平缓石板路，避开高峰，随车医护巡测)";

    const systemInstruction = `
你是由“老友记老好玩儿”老年文旅社区专为50~75岁长辈打造的首席【AI 乐龄慢游行程规划大师】“小老友”。
你的职责是为长辈定制一份极致贴心、儒雅清爽、适老五星标准的【${durationDays}天${durationDays - 1}晚 个性化慢游研学行程】。

【输入参数】：
- 目的地：${destination}
- 天数：${durationDays}天${durationDays - 1}晚
- 出游节奏：${paceDesc}
- 偏好主题：${(themes || []).join("、")}
- 同行人员：${companion}
- 健康关怀：${healthNeeds}
- 用户身份：${userProfile.name || "赵教授"}，${userProfile.level || "博雅·知音"}

【乐龄慢游六大黄金铁律 (ELDERLY SLOW-TRAVEL PRINCIPLES)】：
1. 慢节奏精游：上午专注游览1个核心文脉点（避开早高峰，特约VIP免排队通道），下午安排1个悠闲雅集（听曲/品茗/非遗）。
2. 必备午间休整：每天中午 13:00~15:00 必须安排 1.5~2 小时酒店或茶肆静卧午休（老年人体力恢复的关键）。
3. 适老餐饮标准：严选“少油、低盐、低糖、软烂易咀嚼”的当地老字号养生药膳分餐。
4. 医疗急救与用药提醒：行程全程随车配备便携 AED 与三甲护士，每日标注文明用药提醒（早餐后降压、晚间泡脚）。
5. 适老步数控制：每日严格标注预估步数（平缓路段），每走 25-30 分钟必须安排休息软椅茶歇。
6. 名师学者与金牌管家：配置国家级文博导师解构历史，配置持有红十字急救证的 TGO 管家全程照料。

请返回纯 JSON 格式：
{
  "itineraryTitle": "行程主标题（如：姑苏秋韵 · 3日江南园林文脉与昆曲私享慢游）",
  "subtitle": "副标题（如：特邀文博博导现场解构 · 适老五星舒缓节奏 · 随团医护与AED双重护航）",
  "destination": "${destination}",
  "durationDays": ${durationDays},
  "durationNights": ${durationDays > 1 ? durationDays - 1 : 0},
  "paceType": "${pace}",
  "avgDailySteps": ${pace === "relaxed" ? 3400 : pace === "active" ? 5600 : 4200},
  "themeTags": ["学者同行", "茶道雅集", "适老五星", "纯玩慢行"],
  "elderPhilosophy": "一段80-120字的慢游哲学寄语与适老设计说明",
  "assignedMaster": {
    "name": "名师姓名",
    "title": "名师职称与荣誉",
    "avatar": "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80",
    "speechTheme": "现场讲座/导赏主题"
  },
  "assignedTgo": {
    "name": "专属管家姓名",
    "cert": "红十字急救员认证 / 适老化高级护理",
    "motto": "以侍父母之心，守候老友慢游"
  },
  "medicalAssurance": [
    "随团配备专业急救护士与便携式 AED 除颤仪",
    "随车配备折叠观光坐凳、防滑轻便登山手杖",
    "入住五星级适老化养生酒店（配安全防滑扶手与紧急呼叫铃）",
    "根据老友慢性病史定制少油低盐软烂分餐"
  ],
  "days": [
    {
      "day": 1,
      "dateLabel": "第 1 天",
      "title": "单日主题与核心亮点",
      "theme": "慢游副主题",
      "estimatedSteps": "约 3,500 步 (平缓平地)",
      "morning": {
        "time": "09:00 - 11:30",
        "title": "上午行程（避开人流的高品质文博/名园参观）",
        "desc": "详细描述（名师解构、休息节奏、观景亮点）",
        "elderCare": "适老关怀（如无障碍通道、平缓坡道、随身温水）"
      },
      "lunch": {
        "time": "12:00 - 13:00",
        "restaurant": "老字号养生餐厅",
        "menu": "代表性软烂低盐养生菜品名"
      },
      "noonRest": {
        "time": "13:30 - 15:30",
        "desc": "返回五星酒店进行 2 小时静卧午休，恢复体力"
      },
      "afternoon": {
        "time": "16:00 - 17:30",
        "title": "下午行程（古茶室品茗、名师沙龙或非遗私享）",
        "desc": "详细描述",
        "elderCare": "室内雅座配护腰软椅"
      },
      "dinner": {
        "time": "18:00 - 19:30",
        "restaurant": "时令药膳晚宴",
        "menu": "代表性滋补清淡菜肴"
      },
      "evening": {
        "time": "20:00 自由休憩",
        "desc": "酒店提供草本足浴包与温热安神汤，管家晚间巡访与次日服药提醒"
      },
      "hotel": "精选五星级适老化养生度假酒店",
      "medicationTip": "早餐后按时服用日常降压药，晚间请勿饮浓茶，泡脚水温控制在40℃"
    }
  ],
  "spokenSummary": "适合慢速语音朗读给长辈听的温润口语（200-280字，涵盖亮点、步数、午休与医护保障）",
  "estimatedPrice": ${durationDays * 1280}
}
`;

    if (ai) {
      try {
        const response = await ai.models.generateContent({
          model: "gemini-3.7-flash",
          contents: [{ role: "user", parts: [{ text: `请为${userProfile.name || "老友"}生成${durationDays}天定制行程。` }] }],
          config: {
            systemInstruction,
            responseMimeType: "application/json",
            temperature: 0.5,
            maxOutputTokens: 1800,
          },
        });

        if (response.text) {
          const parsed = JSON.parse(response.text);
          return res.json({ success: true, plan: parsed, source: "gemini" });
        }
      } catch (geminiErr) {
        console.warn("Gemini travel planner failed, falling back:", geminiErr);
      }
    }

    // High quality Senior 3-day heuristic fallback tailored to destination
    const isSuzhou = destination.includes("苏州") || destination.includes("园林") || destination.includes("江南");
    const isHuangshan = destination.includes("黄山") || destination.includes("徽州");
    const isDunhuang = destination.includes("敦煌") || destination.includes("莫高窟") || destination.includes("丝绸之路");
    const isXiAn = destination.includes("西安") || destination.includes("唐") || destination.includes("陕");

    const destTitle = isSuzhou
      ? "苏州 · 园林文脉与昆曲慢游"
      : isHuangshan
      ? "黄山 · 徽州古村与温泉旅居"
      : isDunhuang
      ? "敦煌 · 莫高特窟与大漠星空"
      : isXiAn
      ? "西安 · 盛唐古建与陕博专享"
      : `${destination} · 适老文脉慢游定制`;

    const masterName = isSuzhou ? "周元白 教授 (古典园林学者)" : isHuangshan ? "程建国 导师 (徽派建筑文史专家)" : isDunhuang ? "樊教授 (敦煌石窟艺术博导)" : "李守仁 馆长 (文博研究员)";

    const generatedDays = [];
    for (let d = 1; d <= durationDays; d++) {
      if (d === 1) {
        generatedDays.push({
          day: 1,
          dateLabel: "第 1 天",
          title: isSuzhou
            ? "名园初探 · 拙政园VIP闭馆专场与昆曲晨曲"
            : isHuangshan
            ? "名仕集结 · 宏村静谧晨雾与徽州砖雕私享"
            : isDunhuang
            ? "丝路启程 · 敦煌石窟特级专家导学"
            : "古都初遇 · VIP文博导赏与老字号洗尘",
          theme: "避开人流高峰 · 专属名师现场解构文脉",
          estimatedSteps: pace === "relaxed" ? "约 3,200 步 (全程平地)" : "约 4,200 步 (平缓石板道)",
          morning: {
            time: "09:00 - 11:30",
            title: isSuzhou
              ? "拙政园名师专属闭馆私享导赏"
              : isHuangshan
              ? "宏村月沼水系漫步与古民居造境"
              : isDunhuang
              ? "莫高窟VIP特窟专属开放与专家解构"
              : "省文博特聘专家带队深度赏析",
            desc: `VIP绿色通道免排队，${masterName}现场解构历史造境美学，沿途每隔20分钟在回廊木椅静坐品评。`,
            elderCare: "全程平缓无障碍通道，随团大巴免费提供轻量防滑手杖与折叠坐凳。",
          },
          lunch: {
            time: "12:00 - 13:00",
            restaurant: "老字号养生分餐精选",
            menu: isSuzhou
              ? "清蒸太湖白鱼（去细刺）、手剥松仁虾仁、莼菜银鱼羹、软糯菜饭"
              : isHuangshan
              ? "清炖石耳土鸡汤、徽州问政山笋、太白豆腐煲（低盐少油）"
              : "精选清真养生手抓羊肉（软烂低脂）、当季时蔬清炒、百合甜汤",
          },
          noonRest: {
            time: "13:30 - 15:30",
            desc: "入住五星级适老化养生度假酒店，安排充足的 2 小时静卧午休，客房备有荞麦降压枕与隔音降噪系统。",
          },
          afternoon: {
            time: "16:00 - 17:30",
            title: isSuzhou
              ? "古茶肆私享雅集与昆曲名段清唱"
              : isHuangshan
              ? "黄山毛峰开汤品鉴与新安医道养生"
              : "丝路壁画临摹工坊体验与学者座谈",
            desc: "临水古茶室专场，特邀非遗传承人现场献艺，品当季明前香茗与低糖手工茶点。",
            elderCare: "室内雅座配备人体工学护腰软椅，温热白开水随时供应。",
          },
          dinner: {
            time: "18:00 - 19:30",
            restaurant: "时令药膳养生晚宴",
            menu: "砂锅百合老鸭煲、清炒鸡头米、素烧荷塘小炒（滋阴润燥标准）",
          },
          evening: {
            time: "20:00 自由休整",
            desc: "客房供应草本温热足浴包与安神酸枣仁茶，TGO管家晚间巡访并提示次日天气与服药要点。",
          },
          hotel: "五星级适老化养生度假酒店（配浴室防滑把手与应急呼叫）",
          medicationTip: "早餐后请按时服用降压药；睡前请勿饮浓茶，泡脚水温建议控制在40℃以内。",
        });
      } else if (d === 2) {
        generatedDays.push({
          day: 2,
          dateLabel: "第 2 天",
          title: isSuzhou
            ? "水乡留痕 · 艺圃听泉与留园冠云峰慢步"
            : isHuangshan
            ? "新安山居 · 呈坎八卦古村与温泉道医理疗"
            : isDunhuang
            ? "大漠鸣沙 · 月牙泉适老电瓶观光与夕阳摄影"
            : "文脉雅集 · 碑林拓印体验与古琴雅聚",
          theme: "慢步寻幽 · 诗意茶席与舒缓身心",
          estimatedSteps: pace === "relaxed" ? "约 3,500 步 (缓坡木栈道)" : "约 4,500 步 (平缓步道)",
          morning: {
            time: "09:30 - 11:30",
            title: isSuzhou
              ? "艺圃小品慢赏与延光阁水榭品茗"
              : isHuangshan
              ? "呈坎八卦古村易经文化走读"
              : "榆林窟壁画特展与莫高学堂座谈",
            desc: "推迟半小时出发，长辈从容享受丰盛热早餐。名师带您漫步静谧庭院，慢赏建筑空间精妙。",
            elderCare: "大巴车程仅20分钟，车内恒温24℃，配有低踏板与适老扶手。",
          },
          lunch: {
            time: "12:00 - 13:00",
            restaurant: "江南私房养生素食馆",
            menu: "罗汉斋煲、鲜鲍汁煨竹荪、时令秋葵炒鲜百合、杂粮养生粥",
          },
          noonRest: {
            time: "13:30 - 15:30",
            desc: "回酒店进行 2 小时静心午睡，或在酒店恒温水疗池进行温和足部放松。",
          },
          afternoon: {
            time: "16:00 - 17:30",
            title: isSuzhou
              ? "留园冠云峰奇石赏析与苏绣名家工坊"
              : isHuangshan
              ? "黄山温泉理疗中心 · 中药泡池舒缓关节"
              : "鸣沙山夕阳观景台（乘无颠簸电瓶车直达）",
            desc: "近距离观摩大师刺绣针法与天然奇石，随团医生巡访长辈体能状态。",
            elderCare: "配备无障碍观光车，免除长途徒步，舒适安全。",
          },
          dinner: {
            time: "18:00 - 19:30",
            restaurant: "名厨定制苏式家宴",
            menu: "松鼠桂鱼（微酸少甜软嫩）、清炒太湖菜薹、鲜炖菌菇汤",
          },
          evening: {
            time: "20:00 夜话风雅",
            desc: "老友茶话会或庭院听风，TGO管家协助整理当日精美跟拍照片并冲印实体相册。",
          },
          hotel: "五星级适老化养生度假酒店",
          medicationTip: "温泉或足浴时间单次不超过15分钟；糖尿病长辈睡前请少量饮用温水并监测血糖。",
        });
      } else {
        generatedDays.push({
          day: d,
          dateLabel: `第 ${d} 天`,
          title: isSuzhou
            ? "平江文脉 · 耦园枕波与老友结业欢送"
            : isHuangshan
            ? "古道诗意 · 屯溪老街非遗墨庄探秘与返程"
            : isDunhuang
            ? "沙州告别 · 敦煌书局茶歇与尊享返程"
            : "圆满结业 · 雅集证书颁发与舒适送站",
          theme: "慢享余韵 · 馈赠佳品与专车平安返程",
          estimatedSteps: "约 2,800 步 (极度轻松)",
          morning: {
            time: "09:30 - 11:30",
            title: isSuzhou ? "耦园佳偶天成雅集与结业赠礼" : "非遗墨庄拓印体验与老友茶话会",
            desc: "颁发名师签名的研学结业荣誉证书，赠送老友定制文创伴手礼盒与精装合影相册。",
            elderCare: "行李已由TGO管家提前安放于专车，长辈一身轻松无负担。",
          },
          lunch: {
            time: "12:00 - 13:00",
            restaurant: "老友欢送养生午宴",
            menu: "清炖狮子头、芦蒿炒香干、养生山药排骨汤（少盐软烂）",
          },
          noonRest: {
            time: "13:30 - 14:30",
            desc: "午后于贵宾休息室从容休整，品尝温热养生茶饮，准备启程。",
          },
          afternoon: {
            time: "14:30 - 16:00",
            title: "适老专车管家式送站",
            desc: "金牌管家与专车护送长辈直达高铁站/机场VIP商务通道，协助行李托运与安检，平安返程。",
            elderCare: "全程行李免搬运，提供一对一搀扶与绿色通道陪同。",
          },
          evening: {
            time: "18:00 - 20:00",
            desc: "平安抵家，TGO管家微信致电回访，确认安好。",
          },
          dinner: {
            time: "18:00",
            restaurant: "抵家后家常清淡晚膳",
            menu: "清粥小菜或温馨家宴",
          },
          hotel: "平安返程家中",
          medicationTip: "乘车期间请随身携带保温杯与常备口服药，坐姿适度活动踝关节。",
        });
      }
    }

    const fallbackCustomPlan = {
      itineraryTitle: `${destTitle} · ${durationDays}日慢游研学`,
      subtitle: `名师学者闭馆专场导赏 · 适老五星舒缓节奏 · 随团急救护士与AED全程护航`,
      destination: destTitle,
      durationDays,
      durationNights: durationDays > 1 ? durationDays - 1 : 0,
      paceType: pace,
      avgDailySteps: pace === "relaxed" ? 3400 : pace === "active" ? 5500 : 4100,
      themeTags: themes,
      elderPhilosophy: `针对${userProfile.name || "赵教授"}的体能节奏与文化偏好精心定制：全程纯玩无购物，每日单点精研，下午必安排2小时静卧午休，餐饮低盐少油软烂可口，红十字急救护士随团护航。`,
      assignedMaster: {
        name: masterName,
        title: "国家级文博研究学者 / 名誉博导",
        avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80",
        speechTheme: "《江南造园的文人退隐意趣与造境心法》",
      },
      assignedTgo: {
        name: "林婉茹 (金牌TGO管家)",
        cert: "红十字急救员认证 / 适老化高级护理",
        motto: "以侍父母之心，守候老友慢游",
      },
      medicalAssurance: [
        "随团随车配备专业急救护士与便携式 AED 除颤仪",
        "随车配备轻量防滑手杖、折叠观光坐凳与全天温热水壶",
        "精选五星级适老化养生酒店（配卫生间防滑扶手、紧急呼叫铃）",
        "餐饮严格遵行少油低盐、软烂易消化标准，按需分餐定制",
      ],
      days: generatedDays,
      spokenSummary: `尊敬的${userProfile.name || "老友"}，已为您量身定制好${durationDays}天${destTitle}行程。本行程每日步数平缓控制在四千步以内，避开人流高峰，中午均安排两小时酒店静卧午休，全程配备红十字急救护士与AED设备，餐饮低盐少油软烂可口，非常惬意舒缓！`,
      estimatedPrice: durationDays * 1280,
    };

    return res.json({ success: true, plan: fallbackCustomPlan, source: "fallback" });
  } catch (error) {
    console.error("AI Travel Planner error:", error);
    res.status(500).json({ error: "生成慢游规划失败，请稍后重试" });
  }
});

// AI Document & Proposal Parsing API for Admin Activity Pre-entry
app.post("/api/ai-parse-activity", async (req, res) => {
  try {
    const { documentText, fileName, fileType } = req.body;

    if (!documentText || !documentText.trim()) {
      return res.status(400).json({ error: "请提供需要解析的文旅活动方案文本或文档内容" });
    }

    const ai = getGeminiClient();

    const systemInstruction = `
你是由“老友记老好玩儿”老年文旅社区打造的顶级文旅产品AI专家与结构化解析引擎。
你的任务是将用户上传的Word方案、PDF简报、Excel排期表或文本草案解析成专为50~75岁乐龄知识分子定制的完整结构化活动数据。

请根据文档内容提取并推导如下字段（返回严格合法的JSON对象）：
1. title: 活动主标题（突出文化慢游雅韵）
2. subtitle: 副标题（简短有力，如“特邀名师随团 · 纯玩无购物 · 适老慢行”）
3. destination: 核心目的地（如“江苏·苏州/太湖”、“甘肃·敦煌/莫高窟”、“浙江·杭州/千岛湖”）
4. departureCity: 集合出发地（如“上海市人民广场/虹桥枢纽集中专车接驳”）
5. category: 必须从以下选项中匹配一个："慢游雅居" | "学者同行" | "茶道文博" | "康养山海"
6. form: 必须从以下选项中匹配一个："慢调旅居" | "雅集沙龙" | "名校名师研学" | "体验游" | "赛事游"
7. level: 必须从以下选项中匹配一个："典雅舒适" | "尊享名仕" | "黑金私享"
8. tripCategory: "local" (同城) | "domestic" (跨省国内) | "outbound" (出境专线)
9. productTheme: "文化" | "健康" | "艺术" | "体育" | "旅居"
10. productForm: "研学" | "旅居" | "观光" | "体验" | "社交" | "赛事"
11. productCarrier: "无障碍大巴" | "专列" | "游轮" | "赛事课堂" | "自驾" | "徒步"
12. timeLevel: "L1" | "L2" | "L3" | "L4"
13. businessTrack: "track1_marketing" | "track2_mainstream" | "track3_premium"
14. durationDays: 行程天数（整数，如 5）
15. durationNights: 住宿晚数（整数，如 4）
16. priceGroup: 经典文化大团价格（整数，如 3980）
17. pricePremium: 名仕私享小团价格（整数，如 5880）
18. singleSupplement: 单房差费用（整数，如 800）
19. fitnessLevel: 适老体能难度（1-5，1最轻松，3适中，5高难度）
20. fitnessDesc: 适老体能与医疗保障描述（如“平缓慢行·适老五星·配随团医护与急救包”）
21. features: 核心亮点列表（数组，4~5项，每项以【】开头，如【名师随行】...、【适老慢行】...）
22. master: 名师学者信息 { name: "...", title: "...", badge: "...", intro: "...", avatar: "..." }
23. tgo: 乐龄管家信息 { name: "...", roleTitle: "...", badge: "...", serviceRating: 5.0, tags: ["..."], motto: "..." }
24. itinerary: 每日行程数组 [{ day: 1, title: "...", theme: "...", morning: "...", afternoon: "...", evening: "...", dining: { breakfast: "...", lunch: "...", dinner: "..." }, hotel: "...", stepsEstimated: "约 3,500 步" }]
25. departureRule: 发班规律 { type: "weekly_day" | "monthly_day" | "daily", ruleSummary: "...", weeklyDays: [2, 6], monthlyDays: [5, 15, 25], advanceBookingDays: 5 }
26. feeIncludes: 费用包含列表 [{ category: "住", detail: "..." }, { category: "行", detail: "..." }, { category: "食", detail: "..." }, { category: "享", detail: "..." }]
27. feeExcludes: 费用不含列表（字符串数组）
28. packingTips: 行前携带建议（字符串数组）
29. notice: 预订须知与适老健康告知（字符串数组）
30. suggestedImages: 3张匹配主题的高清图片推荐URL（字符串数组）
31. aiSummary: AI对本次解析的简要评析与关键适老优化建议（字符串）

必须返回标准JSON，不要包含Markdown代码块或多余解释。`;

    if (ai) {
      try {
        const response = await ai.models.generateContent({
          model: "gemini-3.7-flash",
          contents: [
            {
              role: "user",
              parts: [
                {
                  text: `请解析以下文旅慢游方案内容（来源文件名：${fileName || "方案草案"}，格式：${fileType || "文本"}）：\n\n${documentText}`,
                },
              ],
            },
          ],
          config: {
            systemInstruction,
            responseMimeType: "application/json",
            temperature: 0.3,
          },
        });

        if (response.text) {
          const parsed = JSON.parse(response.text);
          return res.json({ success: true, parsedActivity: parsed, source: "gemini" });
        }
      } catch (geminiError) {
        console.warn("Gemini parse activity failed, falling back to smart heuristic parser:", geminiError);
      }
    }

    // High Quality Heuristic Rule Fallback Parser
    const lines = documentText.split("\n").map((l: string) => l.trim()).filter(Boolean);
    const title = lines[0]?.replace(/^[#\s*【】]+/, "") || "江南名士慢游研学定制之旅";
    const isDunhuang = documentText.includes("敦煌") || documentText.includes("莫高窟");
    const isQiandao = documentText.includes("千岛湖") || documentText.includes("温泉") || documentText.includes("道医");
    const isWuyi = documentText.includes("武夷山") || documentText.includes("大红袍");

    const fallbackParsed = {
      title: title.slice(0, 40),
      subtitle: "适老慢行 · 特邀名师随团 · 纯玩无购物 · 赠双重意外险",
      destination: isDunhuang ? "甘肃 · 敦煌/张掖/嘉峪关" : isQiandao ? "浙江 · 杭州/千岛湖" : isWuyi ? "福建 · 武夷山/九曲溪" : "江苏 · 苏州/太湖",
      departureCity: isDunhuang ? "兰州中川机场专车接送" : isQiandao ? "杭州东站/萧山机场专车接送" : "上海市人民广场/虹桥枢纽集中发车",
      category: isDunhuang ? "学者同行" : isQiandao ? "康养山海" : isWuyi ? "茶道文博" : "慢游雅居",
      form: isQiandao ? "慢调旅居" : "名校名师研学",
      level: "尊享名仕",
      tripCategory: "domestic",
      productTheme: isQiandao ? "健康" : isWuyi ? "文化" : "文化",
      productForm: isQiandao ? "旅居" : "研学",
      productCarrier: isDunhuang ? "专列" : isQiandao ? "游轮" : "无障碍大巴",
      timeLevel: isDunhuang ? "L3" : isQiandao ? "L4" : "L3",
      businessTrack: isDunhuang ? "track3_premium" : "track2_mainstream",
      durationDays: isDunhuang ? 7 : isQiandao ? 6 : 5,
      durationNights: isDunhuang ? 6 : isQiandao ? 5 : 4,
      priceGroup: isDunhuang ? 6880 : isQiandao ? 2980 : 3980,
      pricePremium: isDunhuang ? 9880 : isQiandao ? 4580 : 5880,
      singleSupplement: isDunhuang ? 1600 : isQiandao ? 600 : 800,
      fitnessLevel: isDunhuang ? 2 : 1,
      fitnessDesc: isDunhuang ? "平缓慢行 · 随车供氧 · 随队医生随行" : "平缓慢行·适老五星·配随团医护与急救包",
      features: isDunhuang
        ? [
            "【特窟专场】特批进入莫高窟2个常规不对外开放特窟，专家微型耳麦精讲",
            "【适老长途】高品质供氧豪华商务车，每日车程严格控制在 3.5 小时内",
            "【丝路盛宴】专享敦煌山庄五星客栈，享用大漠风情养生清补宴",
            "【名师同行】特邀丝绸之路文博学者段老师全程讲授，深度导赏",
          ]
        : isQiandao
        ? [
            "【道医养生】浙江中医药大学退休老中医随团把脉，传授养生八段锦",
            "【富硒温泉】私享千岛湖中心湖景五星温泉度假酒店，配备无障碍扶手",
            "【湖鲜药膳】定制无盐低糖清炖千岛湖淳安有机鱼头膳食",
            "【舒缓步道】每日行走 ≤ 3,000 步，全程游船与轻便电瓶观光车",
          ]
        : [
            "【名师随行】特邀高校文博系教授全程同行开讲，深度导赏园林美学",
            "【适老节奏】每日行程步数严格控制在 4,200 步以内，平缓无台阶",
            "【尊享下榻】全程严选五星级适老化园林度假酒店，配备防滑设施",
            "【养生膳食】定制低糖少盐温热膳食，严选当地有机时鲜慢火细炖",
          ],
      master: {
        name: isDunhuang ? "段文渊 老师 (敦煌特聘)" : isQiandao ? "汪明德 教授 (新安医学传人)" : "顾云舟 教授 (文博美学导师)",
        title: "国家级文博研究专家 / 资深学者 · 从事传统文化研究40余年",
        badge: isDunhuang ? "丝路文博名家" : isQiandao ? "道医养生名家" : "国家文博名家",
        intro: "讲学深入浅出、风趣幽默，深谙乐龄长辈学术与文化偏好。",
        avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=400&q=80",
      },
      tgo: {
        name: "林晨 (晨晨)",
        roleTitle: "四季游金牌乐龄慢游管家",
        badge: "国家一级导游 · 红十字高级急救员",
        serviceRating: 5.0,
        tags: ["适老急救", "耐心细致", "大件行李送房", "单反跟拍"],
        motto: "把每位长辈当自己的父母悉心照料，让每一段旅途充满安心与温情。",
      },
      itinerary: [
        {
          day: 1,
          title: "名仕初抵 · 专车接送与洗尘雅集",
          theme: "温馨接驳与老友迎宾晚宴",
          morning: "适老专车于机场/高铁站迎接，管家协助搬运行李并办理入住",
          afternoon: "酒店茶室举行【老友品茗破冰雅集】，名师开讲前瞻背景",
          evening: "享用养生迎宾晚宴，发布适老出行指南与常备药品核对",
          dining: { breakfast: "温馨自理", lunch: "精选中式定食", dinner: "特色非遗养生宴" },
          hotel: "五星级适老化养生度假酒店 (加装防滑扶手)",
          stepsEstimated: "约 2,800 步",
        },
        {
          day: 2,
          title: "名胜漫步 · 名师私享闭馆导赏",
          theme: "避开人流高峰·慢节奏品读文脉",
          morning: "专享VIP通道入园漫步，名师现场解构建筑历史与文化意象",
          afternoon: "古戏台品茶听曲，中场安排养生茶歇与自由休憩",
          evening: "漫步特色老街，品尝当地地道药膳安睡",
          dining: { breakfast: "酒店五星自助", lunch: "老字号招牌午宴", dinner: "苏式滋补清汤" },
          hotel: "五星级适老化养生度假酒店",
          stepsEstimated: "约 3,900 步",
        },
      ],
      departureRule: {
        type: "weekly_day",
        ruleSummary: "每周二、周六固定发班 (提前5天截止)",
        weeklyDays: [2, 6],
        monthlyDays: [5, 15, 25],
        advanceBookingDays: 5,
      },
      feeIncludes: [
        { category: "住", detail: "行程所列五星标准适老化酒店双人标准间" },
        { category: "行", detail: "全程豪华2+1宽体航空大巴，配备低踏板与适老扶手" },
        { category: "食", detail: "全程养生清淡膳食（低糖少盐软烂可口）" },
        { category: "享", detail: "特邀名师讲座、金牌管家全程陪护、100万乐龄专项旅游意外险" },
      ],
      feeExcludes: [
        "单房差（如单人独住需补交，名仕及以上会员每年享减免礼遇）",
        "个人自愿消费与个人私人物品购买",
        "因不可抗力导致的额外费用",
      ],
      packingTips: [
        "携带本人二代身份证原件",
        "备齐常备慢性病个人药品及保温水杯",
        "穿着轻便防滑软底健步鞋与防风外套",
      ],
      notice: [
        "本行程专为50~75岁乐龄人群研发，全程不进购物店、不推自费项目、纯玩慢行。",
        "随团配备专业急救箱与AED除颤仪，如有严重心脑血管疾病请行前如实告知并签署告知书。",
      ],
      suggestedImages: [
        "https://images.unsplash.com/photo-1548013146-72479768bada?auto=format&fit=crop&w=800&q=80",
        "https://images.unsplash.com/photo-1508804185872-d7badad00f7d?auto=format&fit=crop&w=800&q=80",
        "https://images.unsplash.com/photo-1512813195386-6cf811ad3542?auto=format&fit=crop&w=800&q=80",
      ],
      aiSummary: "已自动将文档内容提炼为符合老友记标准的适老文旅产品，已自动补齐适老步数测算、名师信息及双团型价格配置。",
    };

    return res.json({ success: true, parsedActivity: fallbackParsed, source: "fallback" });
  } catch (error) {
    console.error("AI Parse Activity error:", error);
    res.status(500).json({ error: "AI文档解析失败，请检查输入或稍后重试" });
  }
});

// AI Document & Proposal Parsing API for Admin Tournament Events Pre-entry
app.post("/api/ai-parse-event", async (req, res) => {
  try {
    const { documentText, fileName, fileType } = req.body;

    if (!documentText || !documentText.trim()) {
      return res.status(400).json({ error: "请提供需要解析的乐龄赛事方案文本或文档内容" });
    }

    const ai = getGeminiClient();

    const systemInstruction = `
你是由“老友记老好玩儿”老年文旅社区打造的顶级文体赛事AI专家与结构化解析引擎。
你的任务是将用户上传的Word竞赛规程、PDF赛事简章、Excel排期表或草案，解析成专为50~75岁乐龄长辈定制的规范化赛事数据。

请严格遵守乐龄赛事健康文明准则：
- 坚持健康文娱、智力益智、友谊第一，弱化并杜绝现金博彩类词汇（转换为“文旅研学基金”、“大师荣誉金”、“名仕积分”、“特产伴手礼”等）。
- 提取并补齐适老赛程节奏（每日对弈限时、中场颈椎放松操、养生茶歇）与赛场医疗急救保障（配备2台专业AED、随队三甲医护、赛前血压筛查、护腰静音软椅）。

请根据文档内容提取并推导如下字段（返回严格合法的JSON对象）：
1. title: 赛事全称（如“2026全国乐龄‘智汇杯’掼蛋大师秋季黄金巡回赛”）
2. subtitle: 副标题与特色（如“黄山名山雅居 · 智力竞技与名仕温泉旅居双享”）
3. category: 赛事项目（如“掼蛋大师赛” | “常青藤桥牌” | “太极养生功” | “中国象棋” | “乐龄摄影”）
4. productTheme: "文化" | "健康" | "体育" | "艺术" | "旅居"
5. productForm: "观光" | "体验" | "研学" | "赛事" | "旅居" | "社交"
6. productCarrier: "赛事课堂" | "无障碍大巴" | "专列" | "游轮"
7. timeLevel: "L1" | "L2" | "L3" | "L4"
8. businessTrack: "track1_marketing" | "track2_mainstream" | "track3_premium"
9. city: 举办省市（如“安徽 · 黄山”）
10. venue: 举办场馆（如“黄山国际温泉会议中心 · 大师赛专属展厅”）
11. registrationFee: 报名会务费（整数，如 2680，单位：元/人 或 元/队）
12. maxTeams: 最大参赛席位/组数（整数，如 64）
13. startDate: 开始日期 (YYYY-MM-DD，如 2026-10-22)
14. endDate: 结束日期 (YYYY-MM-DD，如 2026-10-26)
15. prizePool: 健康文娱优胜表彰对象 {
      "first": "优胜第一名礼遇 (如：¥10,000 文旅研学基金 + 金质大师纪念奖杯 + 10,000名仕积分)",
      "second": "优胜第二名礼遇",
      "third": "优胜第三名礼遇",
      "participation": "全员纪念礼遇",
      "points": 10000
    }
16. referee: 执裁团队与仲裁专家 { "name": "...", "title": "...", "badge": "国家级执裁", "intro": "...", "avatar": "..." }
17. medicalAssurance: 适老医疗急救与健康保障（4项字符串数组，包含AED配备、三甲随队医护、赛前血压筛查、护腰软椅、草本茶歇等）
18. schedule: 赛事日程安排数组 [{ "time": "Day 1 下午", "title": "...", "desc": "..." }, ...]
19. rules: 竞赛规程与计分规则（字符串数组）
20. perks: 参赛尊享礼遇（字符串数组）
21. suggestedCover: 匹配赛事的封面图片URL（字符串）
22. aiSummary: AI对本次赛事的适老化解析总结与合规建议（字符串）

必须返回标准JSON，不要包含Markdown代码块或多余解释。`;

    if (ai) {
      try {
        const response = await ai.models.generateContent({
          model: "gemini-3.7-flash",
          contents: [
            {
              role: "user",
              parts: [
                {
                  text: `请解析以下乐龄赛事活动方案（来源文件名：${fileName || "赛事规程"}，格式：${fileType || "文本"}）：\n\n${documentText}`,
                },
              ],
            },
          ],
          config: {
            systemInstruction,
            responseMimeType: "application/json",
            temperature: 0.3,
          },
        });

        if (response.text) {
          const parsed = JSON.parse(response.text);
          return res.json({ success: true, parsedEvent: parsed, source: "gemini" });
        }
      } catch (geminiError) {
        console.warn("Gemini parse event failed, falling back to heuristic parser:", geminiError);
      }
    }

    // Heuristic Fallback
    const isBridge = documentText.includes("桥牌");
    const isTaichi = documentText.includes("太极") || documentText.includes("八段锦");

    const fallbackParsed = {
      title: isBridge
        ? "2026长三角乐龄“常青藤杯”名仕桥牌大师邀请赛"
        : isTaichi
        ? "2026全国银龄太极拳与八段锦养生功法展演大会"
        : "2026全国乐龄“智汇杯”掼蛋大师秋季黄金巡回赛",
      subtitle: isBridge
        ? "太湖明珠 · 名仕雅聚 · 智力博弈与湖山风雅双享"
        : isTaichi
        ? "西湖秀色 · 颐养天年 · 名师指导与养生功法大展"
        : "黄山名山雅居 · 智力竞技与名仕温泉旅居双享",
      category: isBridge ? "常青藤桥牌" : isTaichi ? "太极养生功" : "掼蛋大师赛",
      productTheme: isTaichi ? "健康" : "体育",
      productForm: "社交",
      productCarrier: "赛事课堂",
      timeLevel: isBridge || isTaichi ? "L2" : "L3",
      businessTrack: isBridge ? "track3_premium" : isTaichi ? "track1_marketing" : "track2_mainstream",
      city: isBridge ? "江苏 · 无锡" : isTaichi ? "浙江 · 杭州" : "安徽 · 黄山",
      venue: isBridge
        ? "太湖国际博览中心 · 湖滨国宾宴会厅"
        : isTaichi
        ? "西湖国宾馆 · 草坪演武场与国宾茶室"
        : "黄山国际温泉会议中心 · 大师赛专属展厅",
      registrationFee: isBridge ? 2180 : isTaichi ? 1680 : 2680,
      maxTeams: isBridge ? 48 : isTaichi ? 80 : 64,
      startDate: isBridge ? "2026-09-24" : isTaichi ? "2026-10-15" : "2026-10-22",
      endDate: isBridge ? "2026-09-27" : isTaichi ? "2026-10-18" : "2026-10-26",
      prizePool: {
        first: isBridge
          ? "双人长途文旅免单资格 + 纯金常青藤大师奖章 + 8,000名仕积分"
          : isTaichi
          ? "西湖国宾文旅康养大礼包 + 5,000名仕积分"
          : "¥10,000 文旅研学基金 + 金质大师纪念奖杯 + 10,000名仕积分",
        second: "¥5,000 文旅装备金 + 银质纪念奖章 + 5,000名仕积分",
        third: "¥2,000 文旅装备金 + 铜质纪念奖章 + 2,000名仕积分",
        participation: "老友定制精美伴手礼盒 + 纯铜参赛纪念徽章 + 500名仕积分",
        points: isBridge ? 8000 : isTaichi ? 5000 : 10000,
      },
      referee: {
        name: isBridge ? "梁启文 老师" : isTaichi ? "郑明德 导师" : "严裁判长",
        title: isBridge
          ? "国际桥牌裁判员 / 长三角智力运动会资深仲裁"
          : isTaichi
          ? "杨氏太极第六代传人 / 国家级武术裁判"
          : "国家一级棋牌裁判员 / 智力运动会资深仲裁主任",
        badge: "国家级执裁",
        intro: "执裁多年，坚持公平公正、友谊第一、适老文明慢赛原则。",
        avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80",
      },
      schedule: [
        { time: "Day 1 下午", title: "名仕签到与开幕破冰", desc: "入住五星温泉度假酒店，领取定制参赛马甲及秩序册，晚间老友洗尘晚宴" },
        { time: "Day 2 全天", title: "预选积分赛 (设中场颈椎操与茶歇)", desc: "瑞士移位制积分赛，每场50分钟设20分钟适老茶歇，避免疲劳" },
        { time: "Day 3 上午", title: "半决赛与巅峰总决赛", desc: "冠亚季军荣誉赛；下午名胜园林慢游理疗与温泉调理" },
        { time: "Day 4 晚上", title: "颁奖盛典与知青欢庆晚宴", desc: "颁发荣誉证书、非遗奖品与老友知青欢庆晚宴" },
        { time: "Day 5 舒适返程", title: "专车护送返程", desc: "适老专车管家护送至高铁站/机场，平安温馨返程" },
      ],
      rules: [
        "执行国家体育总局最新审定文体交流规则，坚持健康文娱、杜绝违规博彩",
        "双人搭档瑞士移位积分循环赛，每轮严格限时，杜绝超时疲劳",
        "全程配备国家级裁判长执裁与随队红十字医疗急救保障",
      ],
      perks: [
        "全程入住五星温泉度假酒店养生房（含防滑扶手）",
        "定制老友防风保暖参赛马甲与大师秩序册",
        "赛场提供专业AED配备、随队医生与养生草本茶饮站",
        "专属专业跟拍摄影并赠送实体纪念相册",
      ],
      medicalAssurance: [
        "配备 2 台专业 AED 除颤仪与随队三甲急救护士",
        "赛前提供免费血压、脉搏健康筛查与健康档案建立",
        "赛场全场采用加厚人体工学护腰软椅与绿色无障碍通道",
        "全天供应温热养生草本茶饮（罗汉果茶、枸杞菊花茶）",
      ],
      suggestedCover: isBridge
        ? "https://images.unsplash.com/photo-1511193311914-0346f16efe90?auto=format&fit=crop&w=800&q=80"
        : isTaichi
        ? "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?auto=format&fit=crop&w=800&q=80"
        : "https://images.unsplash.com/photo-1511512578047-dfb367046420?auto=format&fit=crop&w=800&q=80",
      aiSummary: "已智能提炼赛事时间、场馆地点、报名费用与健康优胜礼遇，自动补齐2台AED与三甲急救护士医疗守护配置。",
    };

    return res.json({ success: true, parsedEvent: fallbackParsed, source: "fallback" });
  } catch (error) {
    console.error("AI Parse Event error:", error);
    res.status(500).json({ error: "AI赛事文档解析失败，请稍后重试" });
  }
});

// AI Itinerary Planning & Health Advisory API for Booked Trips
app.post("/api/ai-itinerary-tips", async (req, res) => {
  try {
    const { tripTitle, destination, startDate, days, category, travelers = [], isEvent = false } = req.body;

    const ai = getGeminiClient();

    const systemInstruction = `
你是由“老友记老好玩儿”老年文旅社区专为50~75岁长辈打造的金牌AI伴游管家“小老友”。
针对用户已报名的行程【${tripTitle || "慢游研学"}】（目的地：${destination || "江南"}，出发时间：${startDate || "近期"}，时长：${days || 5}天，类型：${isEvent ? "乐龄赛事" : "学术慢游"}），
请生成一份极具关怀、细致入微、格式美观的【AI 行程管家定制备忘与行前建议】。

包含：
1. weatherForecast: 出发地至目的地的气候气温预测与穿衣指数（适老防风、防晒建议）
2. healthNotice: 针对心脑血管/关节慢病的用药与每日步数节奏调适要点
3. packingChecklist: 分类行李准备清单（证件类、常备药类、舒适衣物装备类、生活文创类）
4. butlerGreeting: 伴游管家致老友的一段温暖寄语（80-120字）

返回纯 JSON 格式：
{
  "weatherForecast": "...",
  "healthNotice": "...",
  "packingChecklist": ["...", "..."],
  "butlerGreeting": "..."
}
`;

    if (ai) {
      try {
        const response = await ai.models.generateContent({
          model: "gemini-3.7-flash",
          contents: [{ role: "user", parts: [{ text: "请为我的已报名行程生成专属管家建议与行前备忘。" }] }],
          config: {
            systemInstruction,
            responseMimeType: "application/json",
            temperature: 0.6,
          },
        });

        if (response.text) {
          const parsed = JSON.parse(response.text);
          return res.json({ success: true, tips: parsed, source: "gemini" });
        }
      } catch (geminiErr) {
        console.warn("Gemini itinerary tips failed, falling back:", geminiErr);
      }
    }

    const fallbackTips = {
      weatherForecast: `【气候与着装】${destination || "目的地"}近日常态气温在 19℃~26℃ 之间，早晚清爽、午后微温。建议携带轻便防风连帽薄外套、透气纯棉内搭以及折叠遮阳帽。`,
      healthNotice: `【健康与步数节奏】本行程步道平坦平缓，每日步调约 3,800~4,500 步。随团配有持证医护人员与 AED 急救包。请务必随身携带降压/降糖等常备慢病药品，并备好温水保温杯。`,
      packingChecklist: [
        "本人二代身份证原件及老年优待证/优惠证件",
        "个人慢性病常备口服药（建议多备3天用量）与便携药盒",
        "防滑软底减震健步鞋（请勿穿未磨合的新硬鞋）",
        "防风轻便外套与遮阳帽/雨伞",
        "手机大容量充电宝、老花镜与随身保温杯",
        "常用洗漱自用小毛巾及便携湿巾",
      ],
      butlerGreeting: `尊敬的老友，您报名的《${tripTitle || "研学慢游"}》已由TGO金牌管家与随团学者团队准备就绪！我们将秉承“纯玩无购物、慢节奏深体验、安全第一”的服务标准，期待与您在旅途中相聚畅叙！`,
    };

    return res.json({ success: true, tips: fallbackTips, source: "fallback" });
  } catch (error) {
    console.error("AI Itinerary Tips error:", error);
    res.status(500).json({ error: "获取行程贴士失败" });
  }
});

// AI Activity & Event Specific Senior QA API (适老行程/赛事专项智能答疑)
app.post("/api/ai-activity-qa", async (req, res) => {
  try {
    const {
      itemTitle,
      destination,
      durationDays = 5,
      fitnessDesc = "每日步数约4000步，平缓步道",
      masterName,
      tgoName,
      question,
      userProfile = {},
      isEvent = false,
    } = req.body;

    if (!question) {
      return res.status(400).json({ error: "请输入您想了解的问题" });
    }

    const ai = getGeminiClient();

    const systemInstruction = `
你是由“老友记老好玩儿”老年文旅社区专为50~75岁长辈打造的金牌AI伴游管家“小老友”。
针对当前长辈正在浏览的【${isEvent ? "乐龄赛事" : "慢游研学活动"}】：
- 标题：《${itemTitle || "文化研学慢游"}》
- 目的地/城市：${destination || "江南"}
- 天数：${durationDays}天
- 体能要求：${fitnessDesc}
- 随团名师：${masterName || "国家级文博学者"}
- 专属管家：${tgoName || "金牌TGO管家"}
- 当前咨询长辈情况：${userProfile.name || "老友"}，年龄约 ${userProfile.age || 68} 岁，慢性病史：${JSON.stringify(userProfile.healthProfile || { hasHypertension: true })}

【知识范围与Token限制】：
1. 你的回答必须严格围绕本行程/赛事展开：适老化节奏、步数与路面坡度、随团急救护士与AED保障、餐饮清淡低糖安排、慢性病服药与防寒防晒衣物准备、退改与行程须知。
2. 严禁回答超出本行程及老年文旅健康范围的话题。
3. 语气儒雅温和、体贴入微、字数在 120~250 字以内，条理分明。

请返回纯 JSON 格式：
{
  "answer": "条理清晰、排版优美的贴心文字回复（支持Markdown分点）",
  "spokenText": "适合朗读给长辈听的温润口语（不含特殊符号，60-100字）",
  "suitabilityScore": 95, // 0-100 整数，对该长辈的适老契合度
  "comfortTips": ["要点1", "要点2"]
}
`;

    if (ai) {
      try {
        const response = await ai.models.generateContent({
          model: "gemini-3.7-flash",
          contents: [{ role: "user", parts: [{ text: `长辈问：${question}` }] }],
          config: {
            systemInstruction,
            responseMimeType: "application/json",
            temperature: 0.5,
            maxOutputTokens: 500,
          },
        });

        if (response.text) {
          const parsed = JSON.parse(response.text);
          return res.json({ success: true, ...parsed, source: "gemini" });
        }
      } catch (geminiErr) {
        console.warn("Gemini activity QA failed, falling back:", geminiErr);
      }
    }

    // Heuristic Fallback for Activity QA
    const qLower = (question || "").toLowerCase();
    let ans = `尊敬的${userProfile.name || "老友"}，针对《${itemTitle || "文化慢游"}》：本行程全程坚持“纯玩无购物、慢节奏深体验”原则。每日步行节奏控制在 3,500~4,500 步左右，沿途设有休息茶歇，随车配备持证急救护士与便携式 AED，用餐均以少油少盐软烂可口为主。`;
    let spoken = `老友您好，本行程每日步数平缓在四千步左右，全程随团配备红十字急救医护人员与AED除颤仪，餐饮清淡可口，非常适合您的体能节奏！`;
    const tips = ["随身带好常备慢病药物", "穿着防滑软底健步鞋", "随车随时供应温开水"];

    if (qLower.includes("高血压") || qLower.includes("心脏") || qLower.includes("药") || qLower.includes("病")) {
      ans = `尊敬的${userProfile.name || "老友"}：\n1. **医疗急救**：随团配有红十字会认证急救员与便携 AED，每日早晚提供免费血压/脉搏监测；\n2. **用药提醒**：TGO管家会在早餐及晚餐后温馨提醒按时服药，建议随身携带多备3天的常备降压/降糖药；\n3. **步道平缓**：无陡坡急阶，行走每25分钟驻足休息5分钟，长辈完全可以安心参与。`;
      spoken = `老友请放心，随团随车配有专业医护和AED，早晚巡测血压，管家贴心提醒服药，步道平坦无陡坡，完全适合慢病长辈安心出行！`;
    } else if (qLower.includes("步") || qLower.includes("累") || qLower.includes("走") || qLower.includes("坡")) {
      ans = `尊敬的${userProfile.name || "老友"}：\n1. **步数适中**：日均步数预估在 3,800~4,200 步，全程石阶均有无障碍缓坡或轮椅通道备用；\n2. **坐凳手杖**：随团大巴免费提供轻量防滑手杖与折叠观光坐凳；\n3. **车程舒适**：单次车程严格控制在 90 分钟以内，中途均设有卫生间适老停靠点。`;
      spoken = `本行程日均步数在四千步以内，路面平缓，大巴配备轻便登山杖与休息折叠坐凳，单次车程不超过一个半小时，非常惬意舒缓。`;
    } else if (qLower.includes("吃") || qLower.includes("餐") || qLower.includes("菜") || qLower.includes("糖")) {
      ans = `尊敬的${userProfile.name || "老友"}：\n1. **适老餐饮**：精选当地高品质养生膳食，严格执行“少油、低盐、无添加高糖、软烂易咀嚼”标准；\n2. **忌口定制**：如您有痛风、糖尿病或清真素食等特殊饮食需求，出发前管家将一对一录入系统并为餐厅单独定制分餐。`;
      spoken = `餐饮方面均选用当地当季新鲜养生食材，低盐少油软烂易嚼，如果您有忌口或低糖需求，随团管家会为您单独定制分餐！`;
    }

    return res.json({
      success: true,
      answer: ans,
      spokenText: spoken,
      suitabilityScore: 96,
      comfortTips: tips,
      source: "fallback",
    });
  } catch (error) {
    console.error("AI Activity QA error:", error);
    res.status(500).json({ error: "获取AI适老答疑失败" });
  }
});

// AI TGO Companion Senior Matching API (TGO专属管家适老匹配度测评)
app.post("/api/ai-tgo-match", async (req, res) => {
  try {
    const { tgoName, tgoTitle, tgoSpecialties = [], tgoMotto, userProfile = {} } = req.body;

    const ai = getGeminiClient();

    const systemInstruction = `
你是由“老友记老好玩儿”设立的【AI 金牌伴游管家匹配专家】。
针对长者用户（${userProfile.name || "退休教授"}，爱好文史慢游/戏曲/摄影/健康养生）正在浏览的 TGO 伴游管家【${tgoName || "金牌管家"}】（${tgoTitle || "国家级特聘研学导师"}，特长：${(tgoSpecialties || []).join("、")}，服务格言：“${tgoMotto || "慢游随心，如侍父母"}”），
给出 1 份针对老年用户的【适老陪伴契合度分析】。

【限制与要求】：
1. 范围局限在老年出游照护、文博学术修养、应急急救保障、贴心适老照料。
2. 语言儒雅真诚，字数 100~160 字。
3. 返回纯 JSON：
{
  "matchRate": 98, // 85-99 的百分比
  "highlightTitle": "...", // 如“文史深厚 · 红十字急救双认证”
  "matchReason": "...", // 100-140字分析
  "recommendedTopic": "..." // 推荐长辈旅途中可与该管家交流探讨的话题
}
`;

    if (ai) {
      try {
        const response = await ai.models.generateContent({
          model: "gemini-3.7-flash",
          contents: [{ role: "user", parts: [{ text: "请生成适老陪伴匹配度报告。" }] }],
          config: {
            systemInstruction,
            responseMimeType: "application/json",
            temperature: 0.5,
            maxOutputTokens: 400,
          },
        });

        if (response.text) {
          // Robust parsing: extract content within first { and last }
          const text = response.text.trim();
          const jsonStart = text.indexOf('{');
          const jsonEnd = text.lastIndexOf('}');
          
          if (jsonStart !== -1 && jsonEnd !== -1) {
            const cleanText = text.substring(jsonStart, jsonEnd + 1).replace(/```json\s*/g, '').replace(/```\s*/g, '').trim();
            const parsed = JSON.parse(cleanText);
            return res.json({ success: true, ...parsed, source: "gemini" });
          }
          throw new Error("No valid JSON found in response");
        }
      } catch (geminiErr) {
        console.warn("Gemini TGO Match failed, falling back:", geminiErr);
      }
    }

    const fallbackMatch = {
      matchRate: 98,
      highlightTitle: "文史博雅 · 持证急救双重护航",
      matchReason: `【${tgoName || "管家"}】老师不仅具备丰富的古典园林与文史深度沉淀，更持有红十字急救证与适老化护理认证。带团节奏温缓从容、上下车必主动搀扶，与您喜好高品质深度慢游、注重安全细节的出行需求高度契合。`,
      recommendedTopic: "明清江南造园哲学、昆曲曲牌赏析、旅途慢性病清淡饮食调理",
    };

    return res.json({ success: true, ...fallbackMatch, source: "fallback" });
  } catch (error) {
    console.error("AI TGO Match error:", error);
    res.status(500).json({ error: "获取管家匹配分析失败" });
  }
});

// AI Booking Senior Checklist & Safety Advisor API (报名下单适老智能贴士)
app.post("/api/ai-booking-helper", async (req, res) => {
  try {
    const { title, selectedDate, travelerCount = 1, pointsUsed = 0, finalPrice = 0, userHealth = {} } = req.body;

    const ai = getGeminiClient();

    const systemInstruction = `
你是由“老友记老好玩儿”设立的【AI 乐龄报名核对与安全管家】。
针对长者即将确认报名的订单（《${title}》，出发班期：${selectedDate}，人数：${travelerCount}位，实付：¥${finalPrice}，已抵扣积分：${pointsUsed}分），
生成一份极简温暖的【AI 报名适老核对备忘】（3条核心要点）。

返回纯 JSON：
{
  "safetyReminder": "...", // 50-80字慢病与出行温馨叮嘱
  "pointsAdvice": "...", // 30-50字积分抵扣与升级提示
  "checklist": [
    "身份证原件与老年优待证",
    "日常慢病口服药（多备3天用量）",
    "防滑软底鞋与随身保温水杯"
  ]
}
`;

    if (ai) {
      try {
        const response = await ai.models.generateContent({
          model: "gemini-3.7-flash",
          contents: [{ role: "user", parts: [{ text: "请生成报名核对备忘。" }] }],
          config: {
            systemInstruction,
            responseMimeType: "application/json",
            temperature: 0.5,
            maxOutputTokens: 400,
          },
        });

        if (response.text) {
          try {
            const cleanText = response.text.replace(/```json\s*/g, '').replace(/```\s*/g, '').trim();
            const parsed = JSON.parse(cleanText);
            return res.json({ success: true, ...parsed, source: "gemini" });
          } catch (e) {
            console.error("Booking Helper JSON parse failed:", e);
            throw new Error("Invalid JSON structure");
          }
        }
      } catch (geminiErr) {
        console.warn("Gemini booking helper failed, falling back:", geminiErr);
      }
    }

    const fallbackBooking = {
      safetyReminder: `您的订单已包含随团专业医护保障与适老意外险。请您出发前将日常慢病药品放在随身包中，勿放入大件托运行李。`,
      pointsAdvice: pointsUsed > 0 ? `已为您启用名仕积分抵扣，本次出游还将累积新积分！` : `您可在下方勾选积分抵扣以享受现金减免。`,
      checklist: [
        "本人身份证原件及老年优待证",
        "日常慢病口服药（建议随身携带多备3天）",
        "防滑软底健步鞋与保温水杯",
      ],
    };

    return res.json({ success: true, ...fallbackBooking, source: "fallback" });
  } catch (error) {
    console.error("AI booking helper error:", error);
    res.status(500).json({ error: "获取下单贴士失败" });
  }
});

// AI Activity & Event Risk Assessment API (管理员后台智能风险分析)
app.post("/api/ai-risk-analysis", async (req, res) => {
  try {
    const {
      activityTitle,
      destination,
      startDate,
      durationDays = 5,
      intensityLevel = "适中",
      dailySteps = 4200,
      elevationMeters = 50,
      ageDistribution = {
        below55: 1,
        age55to64: 6,
        age65to74: 10,
        age75to84: 4,
        above85: 1,
        totalTravelers: 22,
        avgAge: 68.5,
      },
      chronicConditionsSummary = {
        hypertension: 8,
        diabetes: 5,
        jointIssue: 4,
        heartDisease: 2,
        wheelchairAssistance: 1,
        totalWithConditions: 14,
      },
      weatherData = {
        season: "秋季",
        avgTempRange: "18℃~26℃",
        rainProbability: 25,
        historicalWeatherSummary: "多云微风，早晚温差约8℃，无极端强对流气象",
        extremeWeatherRisk: "低",
      },
      isEvent = false,
    } = req.body;

    const ai = getGeminiClient();

    const systemInstruction = `
你是由“老友记老好玩儿”老年文旅及赛事平台设立的【乐龄文旅与赛事安全风险研判首席AI专家】。
你精通老年医学、气象灾害防御、适老化体育与应急救援保障。

任务：针对给定的活动/赛事数据（包括：报名的老年用户年龄段结构、慢性病申报概况、活动运动强度与每日步数地形、目的地历史与同期气象数据），自动进行多维度综合安全与适宜度研判，给出量化评分、潜在风险警示清单、管家保障对策与预警提示。

【待分析活动参数】
- 名称：${activityTitle || "慢游研学"}
- 目的地：${destination || "江南"}
- 出发时段：${startDate || "近期"} (${durationDays}天)
- 类型：${isEvent ? "乐龄竞技赛事" : "文化慢游研学"}
- 强度/步数：${intensityLevel} / 预计每日约 ${dailySteps} 步，海拔/爬升 ${elevationMeters} 米
- 报名年龄分布：总人数 ${ageDistribution.totalTravelers || 20} 人，平均年龄 ${ageDistribution.avgAge || 67} 岁（<55岁: ${ageDistribution.below55 || 0}人, 55~64岁: ${ageDistribution.age55to64 || 0}人, 65~74岁: ${ageDistribution.age65to74 || 0}人, 75~84岁: ${ageDistribution.age75to84 || 0}人, 85岁以上: ${ageDistribution.above85 || 0}人）
- 慢病申报：高血压 ${chronicConditionsSummary.hypertension || 0} 人，糖尿病 ${chronicConditionsSummary.diabetes || 0} 人，关节及下肢 ${chronicConditionsSummary.jointIssue || 0} 人，心血管支架/病史 ${chronicConditionsSummary.heartDisease || 0} 人，轮椅/手杖辅助 ${chronicConditionsSummary.wheelchairAssistance || 0} 人
- 气象环境：${weatherData.season || "常态"}，气温 ${weatherData.avgTempRange || "18~26℃"}，降雨概率 ${weatherData.rainProbability || 20}%，气象摘要：${weatherData.historicalWeatherSummary || "常态温和"}

请严格返回以下 JSON 格式（不要包含任何 markdown 代码块外部字符）：
{
  "suitabilityScore": 88, // 0~100 整数，综合适老化安全适宜度分值
  "riskLevel": "low" | "medium" | "high", // low=低风险安全, medium=中度关注, high=高风险重点预警
  "overallVerdict": "...", // 总体研判结论 (120-160字)，客观中肯、突出重点
  "targetAgeSuitability": "...", // 适宜年龄段评价，如“最适宜55~72岁活力长者，75岁以上高龄长辈需安排专人陪护”
  "dimensionScores": {
    "ageFitness": 85, // 年龄与体力承载力 (0-100)
    "intensitySafety": 90, // 运动强度与步道地形安全度 (0-100)
    "weatherRisk": 82, // 气象气候舒适度 (0-100)
    "medicalEmergency": 92 // 慢病管理与医疗应急保障度 (0-100)
  },
  "riskAlerts": [
    {
      "id": "alert-1",
      "level": "danger" | "warning" | "info",
      "category": "气候温差" | "步道地形" | "年龄慢病" | "强度疲劳" | "应急通道",
      "title": "...",
      "triggerFactor": "...",
      "affectedScope": "...",
      "potentialHazard": "...",
      "warningMessage": "..."
    }
  ],
  "mitigationMeasures": [
    {
      "priority": "urgent" | "important" | "routine",
      "category": "管家随行" | "医疗急救" | "行程微调" | "物资装备" | "会员告知",
      "action": "...",
      "responsiblePerson": "随团TGO管家" | "随团随车医护" | "运营调度处" | "客服中心"
    }
  ],
  "butlerSafetyChecklist": [
    "...",
    "..."
  ],
  "elderlyAdvisoryNotice": "..." // 供管理员一键向已报名老友/家属推送的行前安全与温情提示短文
}
`;

    if (ai) {
      try {
        const response = await ai.models.generateContent({
          model: "gemini-3.7-flash",
          contents: [{ role: "user", parts: [{ text: "请基于活动报名老友数据、运动强度和气象数据，生成专业AI风险评估与安全预警分析。" }] }],
          config: {
            systemInstruction,
            responseMimeType: "application/json",
            temperature: 0.5,
          },
        });

        if (response.text) {
          const parsed = JSON.parse(response.text);
          return res.json({ success: true, analysis: parsed, source: "gemini" });
        }
      } catch (geminiErr) {
        console.warn("Gemini risk analysis failed, falling back:", geminiErr);
      }
    }

    // Dynamic Rule-based Fallback Generator
    const highAgeCount = (ageDistribution.age75to84 || 0) + (ageDistribution.above85 || 0);
    const hasHeartIssue = (chronicConditionsSummary.heartDisease || 0) > 0;
    const isStepHigh = dailySteps > 5000;
    const isRainHigh = (weatherData.rainProbability || 0) > 40;

    let score = 88;
    let level: "low" | "medium" | "high" = "low";
    if (highAgeCount >= 4 || isStepHigh || isRainHigh || hasHeartIssue) {
      score = 76;
      level = "medium";
    }
    if (highAgeCount >= 8 && isStepHigh && isRainHigh) {
      score = 62;
      level = "high";
    }

    const fallbackAnalysis = {
      suitabilityScore: score,
      riskLevel: level,
      overallVerdict: `本行程【${activityTitle}】整体适老化设计较完备，目的地【${destination}】气候较为温和。当前已报名人员平均年龄为 ${ageDistribution.avgAge || 68} 岁，其中 75 岁以上长者 ${highAgeCount} 人，申报慢病 ${chronicConditionsSummary.totalWithConditions || 10} 例。重点需防范早晚温差引起的血压波动，以及部分青石板路段可能的湿滑风险，建议随团管家增配便携坐凳，随团医护每日晨晚量测血压。`,
      targetAgeSuitability: `最适宜 55~74 岁活力乐龄长者；75 岁以上长者建议随团安排专人结对陪护，80 岁以上建议由直系亲属同行。`,
      dimensionScores: {
        ageFitness: Math.max(60, 92 - highAgeCount * 3),
        intensitySafety: Math.max(65, 95 - Math.floor(dailySteps / 500)),
        weatherRisk: Math.max(70, 95 - (weatherData.rainProbability || 20)),
        medicalEmergency: 94,
      },
      riskAlerts: [
        {
          id: "alert-weather",
          level: (weatherData.rainProbability || 0) > 30 ? "warning" : "info",
          category: "气候温差",
          title: "早晚温差及局部微气气候影响",
          triggerFactor: `早晚温差预计达 7~9℃，降雨概率约 ${weatherData.rainProbability || 25}%`,
          affectedScope: "心脑血管慢性病长者、呼吸道敏感人群",
          potentialHazard: "气温骤降易引发血管收缩、血压波动或着凉感冒",
          warningMessage: "【黄色预警】提醒老友携带轻薄防风防寒外衫与保温水杯，晨间出发前适度热身。",
        },
        {
          id: "alert-steps",
          level: isStepHigh ? "warning" : "info",
          category: "步道地形",
          title: "每日步数与下肢关节疲劳度",
          triggerFactor: `日均预估步数 ${dailySteps} 步，局部景区含少量缓坡及石阶`,
          affectedScope: "膝关节退行性病变、腰椎不适及70岁以上长者",
          potentialHazard: "持续行走易致关节酸胀、下肢疲劳或轻微跌绊",
          warningMessage: "【适老管控】执行“每行走30分钟驻足休息5~8分钟”节奏，随团备足便携防滑登山杖与折叠坐凳。",
        },
        {
          id: "alert-chronic",
          level: hasHeartIssue || highAgeCount > 3 ? "warning" : "info",
          category: "年龄慢病",
          title: "高龄与心血管慢病用药监测",
          triggerFactor: `团内登记高血压/心脏病史共 ${(chronicConditionsSummary.hypertension || 0) + (chronicConditionsSummary.heartDisease || 0)} 人`,
          affectedScope: "已申报心脑血管慢病史的长辈",
          potentialHazard: "旅途作息变化可能遗漏每日服药时间",
          warningMessage: "【医疗保障】随团持证护士提供每日晨间血压心率巡测，TGO管家在早餐时段温馨提醒定时服药。",
        },
      ],
      mitigationMeasures: [
        {
          priority: "urgent",
          category: "医疗急救",
          action: "随团医护重点清点便携 AED 除颤仪、多参数血压计与速效救心丸、硝酸甘油常备急救包。",
          responsiblePerson: "随团随车医护",
        },
        {
          priority: "important",
          category: "管家随行",
          action: `为 ${highAgeCount} 名 75 岁以上长者分配 1 对 1 重点跟进管家，上下接驳车时予以稳妥搀扶。`,
          responsiblePerson: "随团TGO管家",
        },
        {
          priority: "important",
          category: "物资装备",
          action: "旅游大巴与接驳车内常备热姜茶/枸杞温水、防滑鞋套、防晒遮阳伞及一次性雨衣。",
          responsiblePerson: "运营调度处",
        },
        {
          priority: "routine",
          category: "会员告知",
          action: "出团前 48 小时通过系统向报名长辈及紧急联系人推送《适老穿衣与行前常备药核对须知》。",
          responsiblePerson: "客服中心",
        },
      ],
      butlerSafetyChecklist: [
        "出团前逐一核对长者日常慢病口服药是否备足（建议多备3天用量）",
        "大巴接驳启动前确认每位长者已系好安全带，车速保持平稳无急刹",
        "进入景区步道前由导游/管家带领进行 3 分钟脚踝膝关节轻柔拉伸",
        "午后 13:30~14:30 安排室内文化品茗或静息，避开直射暴晒与疲劳驾驶",
        "每日晚餐后由随团医生在酒店大堂设立健康咨询台，提供免费血压脉搏复测",
      ],
      elderlyAdvisoryNotice: `【老友记行前安全与温情提示】尊敬的老友，您即将启程的《${activityTitle}》已由专家团队完成适老安全评估。目的地近期温和舒适，为保障您的舒心体验，请随身带齐常用降压/降糖药品（放入随身包，勿托运），穿着防滑软底鞋。随团专属 TGO 管家与急救医护人员已全员就位，全程为您保驾护航！`,
    };

    return res.json({ success: true, analysis: fallbackAnalysis, source: "fallback" });
  } catch (error) {
    console.error("AI Risk Analysis error:", error);
    res.status(500).json({ error: "活动风险评估研判失败" });
  }
});

// Vite middleware in dev or static server in prod
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (_req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`老友记老好玩儿 Server running on port ${PORT}`);
  });
}

startServer();
