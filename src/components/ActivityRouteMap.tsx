import React, { useState, useMemo, useEffect, useRef } from 'react';
import * as d3 from 'd3';
import { Activity, DayItinerary } from '../types';
import {
  MapPin,
  Compass,
  Play,
  Pause,
  RotateCcw,
  Footprints,
  Clock,
  Car,
  ShieldCheck,
  Award,
  ChevronRight,
  ChevronLeft,
  Sparkles,
  Info,
  Maximize2,
  Minimize2,
  BedDouble,
  Utensils,
  Layers,
  TrendingUp,
  X,
  Volume2,
  VolumeX,
  Camera,
  BookOpen,
  Share2,
  CheckCircle2,
  ExternalLink,
  Navigation,
  Eye,
  Heart,
} from 'lucide-react';

interface ActivityRouteMapProps {
  activity: Activity;
  initialSelectedDay?: number;
  onSelectDay?: (day: number) => void;
}

export interface WaypointData {
  day: number;
  name: string;
  theme: string;
  x: number; // Percentage 0 - 100
  y: number; // Percentage 0 - 100
  elevation: number; // Meters
  steps: string;
  category: 'heritage' | 'nature' | 'tea_culture' | 'hotel' | 'museum';
  categoryLabel: string;
  icon: string;
  morning: string;
  afternoon: string;
  evening: string;
  hotel: string;
  dining: string;
  driveTime: string;
  highlightTag: string;
  // Enhanced Cultural & Photo Properties
  culturalTitle: string;
  culturalStory: string;
  culturalTip: string;
  poetry?: {
    verse: string;
    author: string;
    dynasty: string;
  };
  photos: {
    url: string;
    caption: string;
    tag: string;
  }[];
  masterQuote: string;
  masterName?: string;
  seniorPacingInfo: {
    gradient: string; // e.g. "平缓无台阶石板路"
    restPoints: string; // e.g. "每百米设长廊茶亭"
    shadeRate: string; // e.g. "林荫覆盖率 85%"
    amenities: string; // e.g. "配备无障碍坡道与乐龄休息椅"
  };
}

// Rich Preset Geo Topologies with Cultural Stories and Photo Sets
const ROUTE_PRESETS: Record<
  string,
  {
    spanKm: number;
    maxDriveMins: number;
    regionTag: string;
    points: (Partial<WaypointData> & {
      name: string;
      x: number;
      y: number;
      elevation: number;
      category: WaypointData['category'];
      icon: string;
      highlightTag: string;
      driveTime: string;
      culturalTitle: string;
      culturalStory: string;
      culturalTip: string;
      photos: { url: string; caption: string; tag: string }[];
    })[];
  }
> = {
  '苏州': {
    spanKm: 180,
    maxDriveMins: 45,
    regionTag: '吴门文脉 · 姑苏园林太湖生态圈',
    points: [
      {
        name: '苏州古城 · 拙政园/苏博',
        x: 22,
        y: 35,
        elevation: 12,
        category: 'heritage',
        icon: '🏛️',
        highlightTag: '独家晨光包场',
        driveTime: '专车抵苏接送',
        culturalTitle: '江南园林之母与贝氏光影美学',
        culturalStory:
          '拙政园建于明正德初年，御史王献臣取晋代潘岳《闲居赋》“筑室种树，灌园鬻蔬，是亦拙者之为政也”之意命名。水面占全园五分之三，以水见长，借景北寺塔，尽显吴门文人“不出城郭而获山林之怡”的隐逸意境。相邻的苏州博物馆由贝聿铭大师操刀，以粉墙黛瓦与现代几何光影对话，白墙为纸，叠石为画。',
        culturalTip:
          '💡 名家游赏提示：晨光 08:30 是拙政园光影最佳时刻，晨雾初散，水面倒影如明镜。三十六鸳鸯馆内的蓝色花窗在阳光穿透时，会在地面投下幽蓝波光，是拍摄苏式静谧的绝佳机位。',
        poetry: {
          verse: '绝怜人境无车马，信有山林在市城。',
          author: '文徵明',
          dynasty: '明代',
        },
        photos: [
          {
            url: 'https://images.unsplash.com/photo-1548013146-72479768bada?auto=format&fit=crop&w=800&q=80',
            caption: '拙政园与见山楼荷风倒影',
            tag: '江南园林',
          },
          {
            url: 'https://images.unsplash.com/photo-1599839575945-a9e5af0c3fa5?auto=format&fit=crop&w=800&q=80',
            caption: '苏州博物馆中庭片石假山与现代几何池亭',
            tag: '贝聿铭杰作',
          },
          {
            url: 'https://images.unsplash.com/photo-1584646098378-0874589d76b1?auto=format&fit=crop&w=800&q=80',
            caption: '晨光穿透三十六鸳鸯馆彩色琉璃花窗',
            tag: '光影细节',
          },
        ],
        masterQuote: '“苏州园林不是用来看的，而是用来‘住’和‘居’的文人心境。” —— 阮仪三教授',
        seniorPacingInfo: {
          gradient: '全园铺设平整回廊石板路，无陡坡',
          restPoints: '全廊每隔 30 米设有美人靠与木质长椅',
          shadeRate: '古树与游廊遮阴率达 90%',
          amenities: '园内配备无障碍通道及乐龄电瓶车',
        },
      },
      {
        name: '平江路 · 耦园昆曲雅集',
        x: 38,
        y: 46,
        elevation: 10,
        category: 'museum',
        icon: '🎭',
        highlightTag: '闭馆夜游评弹',
        driveTime: '慢步观光车 15分钟',
        culturalTitle: '耦园住佳偶，城曲筑诗楼',
        culturalStory:
          '耦园三面环水，原名涉园，清同治年间按察使沈秉成携才女严永华隐居于此，重修并易名“耦园”，寓意夫妻双双归田偕隐。园内一宅两园，东西各有一园，格局对称，暗合“夫妇偕隐”之和美。夜幕降临时，闭馆私享水阁昆曲《牡丹亭》浅唱低吟，吴侬软语，恍若穿越百年。',
        culturalTip:
          '💡 非遗欣赏小贴士：评弹与昆曲讲究“字正腔圆，水磨腔调”。在水阁听曲时，注意听笛师与琵琶的过门间隙，古人借水面回声形成天然混响，无需扬声器即可余音绕梁。',
        poetry: {
          verse: '情不知所起，一往而深。生者可以死，死可以生。',
          author: '汤显祖《牡丹亭》',
          dynasty: '明代',
        },
        photos: [
          {
            url: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=800&q=80',
            caption: '平江路沿河水巷与摇橹船',
            tag: '姑苏水巷',
          },
          {
            url: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?auto=format&fit=crop&w=800&q=80',
            caption: '水阁闭馆评弹非遗名家专场品茗',
            tag: '非遗昆曲',
          },
          {
            url: 'https://images.unsplash.com/photo-1513415564515-763d91423bdd?auto=format&fit=crop&w=800&q=80',
            caption: '耦园东花园黄石假山与月下曲桥',
            tag: '造园艺术',
          },
        ],
        masterQuote: '“昆曲是声音的丝绸，耦园是立体的抒情诗。” —— 评弹国家级非遗传承人',
        seniorPacingInfo: {
          gradient: '平江古街石板平整，耦园内部设有防滑木地台',
          restPoints: '茶舍与水阁全程提供软垫太师椅',
          shadeRate: '室内水阁与沿河古木遮蔽良好',
          amenities: '提供温热茉莉花茶与低糖苏式糕点',
        },
      },
      {
        name: '吴中 · 洞庭东山雕花楼',
        x: 55,
        y: 65,
        elevation: 65,
        category: 'heritage',
        icon: '🏯',
        highlightTag: '江南香山帮木作',
        driveTime: '陆地头等舱大巴 40分钟',
        culturalTitle: '江南第一楼与香山帮千年绝技',
        culturalStory:
          '东山雕花楼建于民国初年，由香山帮匠人历时三年精雕细琢而成，被誉为“江南第一楼”。全楼砖雕、木雕、石雕巧夺天工，无处不雕，无处不刻，题材涵盖二十四孝、三国演义及百鸟朝凤。雕花楼融合了西洋巴洛克铁艺与传统苏派大木作，展现了中国近代建筑艺术的巅峰。',
        culturalTip:
          '💡 建筑鉴赏秘诀：观察“凤凰牡丹”透雕时，请看花瓣的翻卷厚度，薄如纸片却历经百年不朽。主楼暗藏秘密通道与避难金库，展现了民国商贾的智巧安防布局。',
        poetry: {
          verse: '洞庭山水翠微中，雕梁画栋映晴空。',
          author: '沈周',
          dynasty: '明代',
        },
        photos: [
          {
            url: 'https://images.unsplash.com/photo-1569154941061-e231b4725ef1?auto=format&fit=crop&w=800&q=80',
            caption: '雕花楼九进天井精美木雕与飞檐',
            tag: '香山帮绝艺',
          },
          {
            url: 'https://images.unsplash.com/photo-1508807526345-15e9b5f4eaff?auto=format&fit=crop&w=800&q=80',
            caption: '镂空砖雕门楼与百寿图细节',
            tag: '非遗砖雕',
          },
        ],
        masterQuote: '“无雕不成楼，香山帮匠人用一把刻刀雕刻了整个江南的灵魂。”',
        seniorPacingInfo: {
          gradient: '庭院平坦，二楼设有宽缓实木扶手楼梯',
          restPoints: '每进院落均设品茶休憩雅座',
          shadeRate: '古宅高墙深院，阴凉通风宜人',
          amenities: '全程专业领队搀扶导引，放慢步调',
        },
      },
      {
        name: '太湖三山岛 · 慢度茶叙',
        x: 72,
        y: 78,
        elevation: 35,
        category: 'tea_culture',
        icon: '🍵',
        highlightTag: '碧螺春茶山品茗',
        driveTime: '专属慢速游船 25分钟',
        culturalTitle: '太湖蓬莱与洞庭碧螺春原产地',
        culturalStory:
          '太湖三山岛宛若太湖明珠，因一岛三峰而得名，古称蓬莱。这里果茶交错种植，茶吸果香，花窨茶味，成就了洞庭碧螺春“吓煞人香”的独特白毫香韵。泛舟湖上，波光浩渺，名茶大师现场演示“手不离茶，茶不离锅”的古法炒青技艺。',
        culturalTip:
          '💡 品茗养生小知识：冲泡洞庭原产碧螺春，宜采用“上投法”——先注入 80℃ 纯净水，再投茶芽。芽叶缓缓下沉如白云翻滚，汤色碧绿清澈，滋味鲜爽回甘。',
        poetry: {
          verse: '入山无处不浓翠，碧螺春香入云端。',
          author: '清·康熙帝南巡御赐',
          dynasty: '清代',
        },
        photos: [
          {
            url: 'https://images.unsplash.com/photo-1576092768241-dec231879fc3?auto=format&fit=crop&w=800&q=80',
            caption: '太湖三山岛碧水茶园与远山帆影',
            tag: '湖山茶境',
          },
          {
            url: 'https://images.unsplash.com/photo-1531973576160-7125cd663d86?auto=format&fit=crop&w=800&q=80',
            caption: '非遗大师柴火铁锅手工炒制明前碧螺春',
            tag: '大师茶道',
          },
        ],
        masterQuote: '“一杯碧螺春，半部太湖史。慢下脚步，才能品出茶中果木之清甘。”',
        seniorPacingInfo: {
          gradient: '岛上环湖道路为纯平慢行木栈道',
          restPoints: '茶寮临湖而建，提供舒适竹椅与遮阳伞',
          shadeRate: '湖风拂面，绿植覆盖率高',
          amenities: '游船配备稳舵减震系统，上下船有专人接应',
        },
      },
      {
        name: '同里退思园 · 水乡归程',
        x: 86,
        y: 52,
        elevation: 8,
        category: 'nature',
        icon: '🛶',
        highlightTag: '世界文化遗产私享',
        driveTime: '舒适接驳 35分钟',
        culturalTitle: '退思补过与贴水造园的极致',
        culturalStory:
          '退思园建于清光绪年间，园主任兰生取《左传》“进思尽忠，退思补过”之意命名。全园简朴淡雅，水面贴近地面，建筑仿佛浮于水面之上，被称为“贴水园”。园内的眠云亭、闹红一舸各具巧思，是江南水乡园林中唯一入选世界文化遗产的典范。',
        culturalTip:
          '💡 摄影打卡建议：站在闹红一舸船头向退思草堂望去，窗框如画框，将倒影、曲桥与睡莲尽收眼底。傍晚微风吹拂，水光跃金，是行程圆满闭幕的最佳留影处。',
        poetry: {
          verse: '林泉之趣，莫过退思。水木清华，景胜天开。',
          author: '同里古镇题额',
          dynasty: '清代',
        },
        photos: [
          {
            url: 'https://images.unsplash.com/photo-1528127269322-539801943592?auto=format&fit=crop&w=800&q=80',
            caption: '退思园闹红一舸旱船与贴水回廊',
            tag: '世界文化遗产',
          },
          {
            url: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&w=800&q=80',
            caption: '同里三桥水乡古韵与夕阳摇橹',
            tag: '江南水乡',
          },
        ],
        masterQuote: '“退一步海阔天空，思长远心如止水。水乡园林给长辈最好的养分是松弛。”',
        seniorPacingInfo: {
          gradient: '青石板路平整无台阶，沿河设置实木护栏',
          restPoints: '全园多处临水茶廊，随时可以坐憩',
          shadeRate: '古树参天，水气充沛湿润',
          amenities: '提供行李专车直送高铁站/机场服务',
        },
      },
    ],
  },
  '敦煌': {
    spanKm: 520,
    maxDriveMins: 80,
    regionTag: '丝路梵华 · 河西走廊莫高窟特窟环线',
    points: [
      {
        name: '敦煌绿洲 · 莫高学社',
        x: 18,
        y: 58,
        elevation: 1140,
        category: 'heritage',
        icon: '🏛️',
        highlightTag: '院长亲授首讲',
        driveTime: 'VIP专车接机 20分钟',
        culturalTitle: '千年莫高与大漠精神启蒙',
        culturalStory:
          '莫高学社坐落在宕泉河畔，正对莫高窟三层楼。这里是敦煌研究院特设的高端学术研学基地，由资深研究员亲自开讲《莫高窟的前世今生》，带领老友们在进窟前建立完整的石窟分期与艺术认知体系。',
        culturalTip:
          '💡 研学要点：了解“九色鹿本生”与“飞天”在北魏、隋、盛唐时期的演变规律，能够帮助您在特窟内看懂壁画中的线条韵律与矿物颜料沉淀。',
        photos: [
          {
            url: 'https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?auto=format&fit=crop&w=800&q=80',
            caption: '莫高窟九层楼巍峨矗立于三危山下',
            tag: '世界文化遗存',
          },
          {
            url: 'https://images.unsplash.com/photo-1544644181-1484b3fdfc62?auto=format&fit=crop&w=800&q=80',
            caption: '莫高学社名师学术讲座与原样壁画摹本研讨',
            tag: '专家私享',
          },
        ],
        masterQuote: '“敦煌是历史留给人类最浪漫的一封长信。”',
        seniorPacingInfo: {
          gradient: '室内阶梯平缓，配备无障碍电梯',
          restPoints: '学术报告厅配备人体工学舒适座椅',
          shadeRate: '全天候恒温空调与绿洲杨树遮阴',
          amenities: '备有枸杞罗汉果润喉茶与大漠防尘装备',
        },
      },
      {
        name: '莫高窟特窟 · 第45/57窟',
        x: 36,
        y: 40,
        elevation: 1220,
        category: 'museum',
        icon: '🎨',
        highlightTag: '专家级特窟观摩',
        driveTime: '研学专车 25分钟',
        culturalTitle: '盛唐彩塑巅峰与“美人菩萨”真容',
        culturalStory:
          '莫高窟第45窟被公认为盛唐彩塑艺术的皇冠明珠，佛陀、阿难、迦叶、菩萨与天王形神兼备，衣纹如出水清莲。第57窟更以“美人菩萨”名动天下，沥粉贴金技法勾勒出菩萨慈悲柔美的面容，千年之后依然金光流转。',
        culturalTip:
          '💡 特窟观赏须知：窟内使用专业冷光源手电，避免强光损伤壁画。请跟随研究员指引，细细观察菩萨头冠上的微型化佛与璎珞垂饰。',
        photos: [
          {
            url: 'https://images.unsplash.com/photo-1563245372-f21724e3856d?auto=format&fit=crop&w=800&q=80',
            caption: '莫高窟唐代彩塑菩萨立像慈悲庄严',
            tag: '特窟珍品',
          },
        ],
        masterQuote: '“看一眼45窟的阿难，你就明白了什么是盛唐的从容自信。”',
        seniorPacingInfo: {
          gradient: '木栈道平坦，无高台阶',
          restPoints: '窟区各层通道设有休息长廊',
          shadeRate: '崖体自然遮阳，通风良好',
          amenities: '佩戴高保真无线蓝牙耳麦，轻语即可清晰听讲',
        },
      },
    ],
  },
};

export const ActivityRouteMap: React.FC<ActivityRouteMapProps> = ({
  activity,
  initialSelectedDay = 1,
  onSelectDay,
}) => {
  const [selectedDay, setSelectedDay] = useState<number>(initialSelectedDay);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [viewMode, setViewMode] = useState<'map' | 'profile'>('map');
  const [activeSpotlightNode, setActiveSpotlightNode] = useState<WaypointData | null>(null);
  const [hoveredWaypoint, setHoveredWaypoint] = useState<WaypointData | null>(null);
  const [hoverPos, setHoverPos] = useState<{ x: number; y: number } | null>(null);
  const [selectedTransitLeg, setSelectedTransitLeg] = useState<{ from: WaypointData; to: WaypointData; idx: number } | null>(null);
  const [currentPhotoIdx, setCurrentPhotoIdx] = useState(0);
  const [isReadingAudio, setIsReadingAudio] = useState(false);

  const svgRef = useRef<SVGSVGElement | null>(null);

  // Sync external day selection
  useEffect(() => {
    if (initialSelectedDay) {
      setSelectedDay(initialSelectedDay);
    }
  }, [initialSelectedDay]);

  // Find best matching preset or generate dynamic
  const presetKey =
    Object.keys(ROUTE_PRESETS).find(
      (key) => activity.destination.includes(key) || activity.title.includes(key)
    ) || '苏州';

  const routePreset = ROUTE_PRESETS[presetKey] || ROUTE_PRESETS['苏州'];

  // Construct complete waypoints for all itinerary days with rich cultural background
  const waypoints: WaypointData[] = useMemo(() => {
    const itinerary: DayItinerary[] =
      activity.itinerary && activity.itinerary.length > 0
        ? activity.itinerary
        : [
            {
              day: 1,
              title: '初抵江南 · 名师见面',
              theme: '文脉启程',
              morning: '专车抵苏入住五星酒店',
              afternoon: '苏博/拙政园闭馆私享',
              evening: '评弹欢迎晚宴',
              dining: { breakfast: '酒店自助', lunch: '苏帮特色', dinner: '松鹤楼私房' },
              hotel: '苏州金鸡湖凯宾斯基酒店',
              stepsEstimated: '3,200 步',
            },
            {
              day: 2,
              title: '耦园琴音 · 昆曲雅集',
              theme: '非遗昆曲',
              morning: '慢游平江路文人古巷',
              afternoon: '耦园包场品茗听曲',
              evening: '古运河夜游船',
              dining: { breakfast: '酒店自助', lunch: '得月楼老字号', dinner: '耦园雅宴' },
              hotel: '苏州金鸡湖凯宾斯基酒店',
              stepsEstimated: '3,800 步',
            },
            {
              day: 3,
              title: '太湖烟波 · 洞庭东山',
              theme: '山水慢步',
              morning: '东山雕花楼木雕研习',
              afternoon: '陆巷古村碧螺春采品',
              evening: '太湖湖畔温泉放松',
              dining: { breakfast: '酒店自助', lunch: '太湖三白水鲜', dinner: '养生汤膳' },
              hotel: '东山涵村精品温泉度假酒店',
              stepsEstimated: '4,100 步',
            },
            {
              day: 4,
              title: '水乡退思 · 古桥寻幽',
              theme: '水乡古建',
              morning: '同里退思园造园美学',
              afternoon: '名家理学漫谈与总结',
              evening: '知己老友惜别晚宴',
              dining: { breakfast: '酒店自助', lunch: '同里状元蹄', dinner: '五星欢送宴' },
              hotel: '东山涵村精品温泉度假酒店',
              stepsEstimated: '3,500 步',
            },
            {
              day: 5,
              title: '圆满结业 · 专车赋归',
              theme: '知音同行',
              morning: '结业仪式颁发研学证书',
              afternoon: '专车送站温馨返程',
              evening: '平安到家温馨回访',
              dining: { breakfast: '酒店自助', lunch: '轻食便餐', dinner: '家中' },
              hotel: '温馨的家',
              stepsEstimated: '2,000 步',
            },
          ];

    return itinerary.map((item, idx) => {
      const presetPoint = routePreset.points[idx % routePreset.points.length];
      const progress = itinerary.length > 1 ? idx / (itinerary.length - 1) : 0.5;
      const calcX = 15 + progress * 70 + (idx % 2 === 1 ? 5 : -5);
      const calcY = 30 + Math.sin(progress * Math.PI) * 45 + (idx % 2 === 0 ? -4 : 6);

      const diningSummary =
        typeof item.dining === 'object'
          ? `早: ${item.dining.breakfast} | 午: ${item.dining.lunch} | 晚: ${item.dining.dinner}`
          : String(item.dining || '精选全包乐龄膳食');

      const defPhotos = [
        {
          url: activity.cover || 'https://images.unsplash.com/photo-1548013146-72479768bada?auto=format&fit=crop&w=800&q=80',
          caption: `${item.title} 研学全景观摩`,
          tag: '实景照片',
        },
        {
          url: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=800&q=80',
          caption: '慢步文化古巷风貌',
          tag: '人文景致',
        },
      ];

      return {
        day: item.day || idx + 1,
        name: presetPoint?.name || `D${idx + 1} · ${item.title}`,
        theme: item.theme || '名师慢游研学',
        x: presetPoint?.x ?? Math.max(12, Math.min(88, calcX)),
        y: presetPoint?.y ?? Math.max(20, Math.min(80, calcY)),
        elevation: presetPoint?.elevation ?? 120 + idx * 40,
        steps: item.stepsEstimated || '3,500 步 (乐龄平缓)',
        category: presetPoint?.category || 'heritage',
        categoryLabel:
          presetPoint?.category === 'museum'
            ? '重点展馆'
            : presetPoint?.category === 'tea_culture'
            ? '非遗茶艺'
            : presetPoint?.category === 'nature'
            ? '山水生态'
            : '文化遗产',
        icon: presetPoint?.icon || '🏛️',
        morning: item.morning || '专车乐龄舒缓接驳，开启文化品鉴',
        afternoon: item.afternoon || '名师随团深度讲解，漫步平缓步道',
        evening: item.evening || '甄选美馔养生晚餐，温泉入住放松',
        hotel: item.hotel || '甄选五星乐龄静音酒店',
        dining: diningSummary,
        driveTime: presetPoint?.driveTime || '单程车程 ≤ 40 分钟',
        highlightTag: presetPoint?.highlightTag || '名师专场私享',
        culturalTitle: presetPoint?.culturalTitle || `${item.title} 文化源流与美学沉淀`,
        culturalStory:
          presetPoint?.culturalStory ||
          `${item.title} 承载着深厚的地方文脉与历史积淀。在此处慢步研学，名师将深入浅出剖析建筑美学、历史典故与民间非遗技艺，为长辈带来沉浸式的精神滋养。`,
        culturalTip:
          presetPoint?.culturalTip ||
          `💡 乐龄慢游小贴士：此处环境清幽静谧，建议放慢呼吸，细细品味砖木石雕与光影变化。随团医护与领队全程陪同，提供充足休息与热茶补给。`,
        poetry: presetPoint?.poetry || {
          verse: '山光悦鸟性，潭影空人心。',
          author: '常建',
          dynasty: '唐代',
        },
        photos: presetPoint?.photos && presetPoint.photos.length > 0 ? presetPoint.photos : defPhotos,
        masterQuote:
          presetPoint?.masterQuote ||
          `“走得慢一点，看得深一点，旅行就是与历史对话的雅事。” —— 文化随团名师`,
        seniorPacingInfo: presetPoint?.seniorPacingInfo || {
          gradient: '全线步道平缓，无陡坡急坎',
          restPoints: '每隔 50-100 米设有休息亭或茶亭',
          shadeRate: '绿荫遮蔽率约 80%',
          amenities: '全程无障碍轮椅通道及急救随行包',
        },
      };
    });
  }, [activity, routePreset]);

  const activeWaypoint = waypoints.find((w) => w.day === selectedDay) || waypoints[0];

  // Auto-play itinerary trajectory animation
  useEffect(() => {
    let timer: NodeJS.Timeout | null = null;
    if (isPlaying) {
      timer = setInterval(() => {
        setSelectedDay((prev) => {
          const next = prev >= waypoints.length ? 1 : prev + 1;
          if (onSelectDay) onSelectDay(next);
          return next;
        });
      }, 2400);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [isPlaying, waypoints.length, onSelectDay]);

  // Audio Reading Voice Simulation / Speech Synthesis
  const handleToggleVoiceAudio = (text: string) => {
    if (isReadingAudio) {
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
      setIsReadingAudio(false);
      return;
    }

    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'zh-CN';
      utterance.rate = 0.9; // Slow, soothing cadence for seniors
      utterance.pitch = 1.0;
      utterance.onend = () => setIsReadingAudio(false);
      utterance.onerror = () => setIsReadingAudio(false);
      window.speechSynthesis.speak(utterance);
      setIsReadingAudio(true);
    } else {
      // Mock toggle if API not supported
      setIsReadingAudio(true);
      setTimeout(() => setIsReadingAudio(false), 5000);
    }
  };

  // Clean up audio on unmount or node change
  useEffect(() => {
    return () => {
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, [activeSpotlightNode]);

  // Generate D3 Smooth Curve Path (SVG d string)
  const pathD = useMemo(() => {
    if (waypoints.length === 0) return '';
    const pointsData: [number, number][] = waypoints.map((w) => [
      (w.x / 100) * 1000,
      (w.y / 100) * 600,
    ]);

    const lineGenerator = d3
      .line()
      .x((d) => d[0])
      .y((d) => d[1])
      .curve(d3.curveCatmullRom.alpha(0.5));

    return lineGenerator(pointsData) || '';
  }, [waypoints]);

  // Elevation Profile Path Generator for Profile View
  const elevationProfileD = useMemo(() => {
    if (waypoints.length === 0) return { areaD: '', lineD: '' };
    const maxElev = Math.max(...waypoints.map((w) => w.elevation), 200);
    const minElev = Math.min(...waypoints.map((w) => w.elevation), 0);
    const range = Math.max(maxElev - minElev, 100);

    const points: [number, number][] = waypoints.map((w, idx) => {
      const x = 60 + (idx / Math.max(1, waypoints.length - 1)) * 880;
      const normalizedY = 220 - ((w.elevation - minElev) / range) * 140;
      return [x, normalizedY];
    });

    const lineGen = d3.line().curve(d3.curveMonotoneX);
    const lineStr = lineGen(points) || '';

    const areaGen = d3
      .area()
      .x((d) => d[0])
      .y0(250)
      .y1((d) => d[1])
      .curve(d3.curveMonotoneX);

    const areaStr = areaGen(points) || '';
    return { areaD: areaStr, lineD: lineStr };
  }, [waypoints]);

  // Point Click Handler (Opens Cultural Spotlight Modal & Sets Day)
  const handlePointClick = (w: WaypointData) => {
    setSelectedDay(w.day);
    setActiveSpotlightNode(w);
    setCurrentPhotoIdx(0);
    setSelectedTransitLeg(null);
    if (onSelectDay) onSelectDay(w.day);
  };

  // Leg / Route segment click handler
  const handleLegClick = (from: WaypointData, to: WaypointData, idx: number) => {
    setSelectedTransitLeg({ from, to, idx });
    setActiveSpotlightNode(null);
  };

  return (
    <div
      className={`bg-gradient-to-br from-[#FAF8F5] via-[#FFFDF9] to-[#F5EFE6] rounded-3xl border border-[#D4AF37]/40 shadow-sm overflow-hidden transition-all duration-300 relative ${
        isExpanded ? 'p-5 ring-2 ring-[#D4AF37]/50' : 'p-4 sm:p-5'
      }`}
    >
      {/* 1. Header Bar: Title, Region Span Tag, View Toggle & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-amber-200/60 pb-3.5">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="w-8 h-8 rounded-xl bg-[#2C3E50] text-[#D4AF37] border border-[#D4AF37]/40 flex items-center justify-center font-bold shadow-2xs">
              <Compass className="w-4 h-4" />
            </span>
            <div>
              <h3 className="font-serif italic font-bold text-base md:text-lg text-[#2C3E50] flex items-center gap-2">
                <span>研学地理跨度与慢行路径地图</span>
                <span className="bg-[#D4AF37]/20 text-[#85660d] text-[10px] font-sans font-bold px-2 py-0.5 rounded-full border border-[#D4AF37]/30">
                  D3 交互式文化导览
                </span>
              </h3>
            </div>
          </div>
          <p className="text-xs text-stone-600 font-sans ml-10 flex items-center gap-2">
            <span className="text-[#85660d] font-semibold">📍 {routePreset.regionTag}</span>
            <span className="text-stone-300">|</span>
            <span className="text-amber-800 font-medium flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-[#D4AF37]" />
              点击节点探秘文化小贴士与高清实景
            </span>
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2 self-start sm:self-auto">
          {/* Map vs Elevation Profile View Toggle */}
          <div className="bg-stone-200/80 p-0.5 rounded-xl flex text-xs font-bold">
            <button
              onClick={() => setViewMode('map')}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer flex items-center gap-1 ${
                viewMode === 'map'
                  ? 'bg-white text-[#2C3E50] shadow-xs'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>地理轨迹图</span>
            </button>
            <button
              onClick={() => setViewMode('profile')}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer flex items-center gap-1 ${
                viewMode === 'profile'
                  ? 'bg-white text-[#2C3E50] shadow-xs'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              <TrendingUp className="w-3.5 h-3.5" />
              <span>慢行海拔剖面</span>
            </button>
          </div>

          {/* Trajectory Playback Button */}
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-transform active:scale-95 flex items-center gap-1 shadow-2xs border cursor-pointer ${
              isPlaying
                ? 'bg-amber-600 text-white border-amber-700'
                : 'bg-[#2C3E50] text-amber-100 border-[#D4AF37]/40 hover:bg-[#1a252f]'
            }`}
            title={isPlaying ? '暂停回放' : '逐日回放轨迹'}
          >
            {isPlaying ? (
              <>
                <Pause className="w-3.5 h-3.5 animate-pulse" />
                <span>回放中</span>
              </>
            ) : (
              <>
                <Play className="w-3.5 h-3.5 text-[#D4AF37]" />
                <span>回放轨迹</span>
              </>
            )}
          </button>

          {/* Expand/Collapse */}
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-1.5 bg-white hover:bg-stone-100 text-stone-600 border border-stone-200 rounded-xl transition-colors cursor-pointer"
            title={isExpanded ? '收起地图' : '放大全图'}
          >
            {isExpanded ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* 2. Top Senior Comfort Metrics Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 my-3 text-xs">
        <div className="bg-white/90 rounded-2xl p-2.5 border border-amber-200/70 shadow-2xs flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-amber-50 text-[#85660d] border border-amber-200 flex items-center justify-center shrink-0">
            <Compass className="w-4 h-4" />
          </div>
          <div>
            <div className="text-[10px] text-stone-500">研学全线跨度</div>
            <div className="font-serif font-bold text-xs sm:text-sm text-[#2C3E50]">
              约 {routePreset.spanKm} 公里
            </div>
          </div>
        </div>

        <div className="bg-white/90 rounded-2xl p-2.5 border border-amber-200/70 shadow-2xs flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-800 border border-blue-200 flex items-center justify-center shrink-0">
            <Car className="w-4 h-4" />
          </div>
          <div>
            <div className="text-[10px] text-stone-500">单次车程上限</div>
            <div className="font-serif font-bold text-xs sm:text-sm text-[#2C3E50]">
              ≤ {routePreset.maxDriveMins} 分钟平缓
            </div>
          </div>
        </div>

        <div className="bg-white/90 rounded-2xl p-2.5 border border-amber-200/70 shadow-2xs flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-200 flex items-center justify-center shrink-0">
            <Footprints className="w-4 h-4" />
          </div>
          <div>
            <div className="text-[10px] text-stone-500">乐龄慢行节奏</div>
            <div className="font-serif font-bold text-xs sm:text-sm text-emerald-900">
              日均 3,600 步
            </div>
          </div>
        </div>

        <div className="bg-white/90 rounded-2xl p-2.5 border border-amber-200/70 shadow-2xs flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-800 border border-purple-200 flex items-center justify-center shrink-0">
            <Award className="w-4 h-4" />
          </div>
          <div>
            <div className="text-[10px] text-stone-500">独家特邀节点</div>
            <div className="font-serif font-bold text-xs sm:text-sm text-purple-950">
              {waypoints.length} 处文化小贴士
            </div>
          </div>
        </div>
      </div>

      {/* 3. Interactive Visual Map Canvas Area */}
      {viewMode === 'map' ? (
        <div className="relative w-full rounded-2xl overflow-hidden bg-[#1E293B] border border-stone-800 shadow-inner">
          {/* Stylized Topographic Canvas */}
          <div className="relative w-full aspect-[16/10] sm:aspect-[21/10] select-none">
            <svg
              ref={svgRef}
              viewBox="0 0 1000 600"
              className="w-full h-full object-cover"
              preserveAspectRatio="xMidYMid slice"
            >
              <defs>
                {/* Gradient for regional terrain */}
                <radialGradient id="mapTerrainGlow" cx="50%" cy="50%" r="60%">
                  <stop offset="0%" stopColor="#334155" stopOpacity="0.8" />
                  <stop offset="60%" stopColor="#1e293b" stopOpacity="0.9" />
                  <stop offset="100%" stopColor="#0f172a" stopOpacity="1" />
                </radialGradient>

                {/* Cultural Route Line Gold Gradient */}
                <linearGradient id="routeGoldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#F59E0B" />
                  <stop offset="50%" stopColor="#D4AF37" />
                  <stop offset="100%" stopColor="#FBBF24" />
                </linearGradient>

                {/* Pulsing Active Node Filter */}
                <filter id="goldGlow" x="-20%" y="-20%" width="140%" height="140%">
                  <feGaussianBlur stdDeviation="4" result="blur" />
                  <feComposite in="SourceGraphic" in2="blur" operator="over" />
                </filter>
              </defs>

              {/* Background Cartography Grid & Contours */}
              <rect width="1000" height="600" fill="url(#mapTerrainGlow)" />

              {/* Soft decorative terrain topographic contour rings */}
              <g opacity="0.15" stroke="#94a3b8" strokeWidth="1" fill="none">
                <circle cx="200" cy="300" r="140" strokeDasharray="4 6" />
                <circle cx="200" cy="300" r="220" />
                <circle cx="650" cy="250" r="160" strokeDasharray="3 5" />
                <circle cx="650" cy="250" r="280" />
                <path d="M 0,450 Q 250,400 500,480 T 1000,430" stroke="#38bdf8" strokeWidth="2" opacity="0.3" />
                <path d="M 0,470 Q 250,420 500,500 T 1000,450" stroke="#38bdf8" strokeWidth="1.5" opacity="0.2" />
              </g>

              {/* Waterway / Mountain Shading Decorative Labels */}
              <text x="70" y="70" fill="#64748b" fontSize="13" fontFamily="serif" letterSpacing="4">
                ✦ 研学慢游地理全景 · 点击节点探索文化故事与实景
              </text>
              <text x="820" y="560" fill="#64748b" fontSize="12" fontFamily="sans-serif">
                北纬 31°18' · 东经 120°37'
              </text>

              {/* Base Route Shadow / Ambient Glow */}
              <path
                d={pathD}
                fill="none"
                stroke="#D4AF37"
                strokeWidth="12"
                strokeOpacity="0.22"
                strokeLinecap="round"
                strokeLinejoin="round"
                filter="url(#goldGlow)"
              />

              {/* Main Connecting Route Curve (Clickable to trigger route transit tips) */}
              <path
                d={pathD}
                fill="none"
                stroke="url(#routeGoldGrad)"
                strokeWidth="4"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="cursor-pointer hover:stroke-amber-300 transition-colors"
                onClick={() => {
                  if (waypoints.length > 1) {
                    handleLegClick(waypoints[0], waypoints[1], 0);
                  }
                }}
              />

              {/* Animated Glowing Vehicle Transit Dash Line */}
              <path
                d={pathD}
                fill="none"
                stroke="#FAF9F6"
                strokeWidth="2.5"
                strokeDasharray="8 12"
                strokeLinecap="round"
              >
                <animate
                  attributeName="stroke-dashoffset"
                  from="200"
                  to="0"
                  dur="4s"
                  repeatCount="indefinite"
                />
              </path>

              {/* Day Segment Transit Buttons along the Route */}
              {waypoints.slice(0, -1).map((w, idx) => {
                const nextW = waypoints[idx + 1];
                const midX = ((w.x + nextW.x) / 2 / 100) * 1000;
                const midY = ((w.y + nextW.y) / 2 / 100) * 600 - 12;
                const isLegActive = selectedTransitLeg?.idx === idx;

                return (
                  <g
                    key={`leg-${idx}`}
                    onClick={() => handleLegClick(w, nextW, idx)}
                    className="cursor-pointer group"
                  >
                    <rect
                      x={midX - 42}
                      y={midY - 11}
                      width="84"
                      height="22"
                      rx="11"
                      fill={isLegActive ? '#D4AF37' : '#0f172a'}
                      fillOpacity={isLegActive ? 0.95 : 0.85}
                      stroke={isLegActive ? '#FFFFFF' : '#64748b'}
                      strokeWidth={isLegActive ? 1.5 : 1}
                      className="transition-all duration-200 group-hover:stroke-amber-400 group-hover:scale-105"
                    />
                    <text
                      x={midX}
                      y={midY + 4}
                      fill={isLegActive ? '#0f172a' : '#e2e8f0'}
                      fontSize="10"
                      fontWeight={isLegActive ? 'bold' : 'normal'}
                      fontFamily="sans-serif"
                      textAnchor="middle"
                    >
                      🚌 {nextW.driveTime.split(' ')[0] || '乐龄车程'}
                    </text>
                  </g>
                );
              })}

              {/* Interactive Waypoint Nodes */}
              {waypoints.map((w) => {
                const cx = (w.x / 100) * 1000;
                const cy = (w.y / 100) * 600;
                const isSelected = w.day === selectedDay;
                const isHovered = hoveredWaypoint?.day === w.day;

                return (
                  <g
                    key={w.day}
                    onClick={() => handlePointClick(w)}
                    onMouseEnter={(e) => {
                      setHoveredWaypoint(w);
                      const rect = svgRef.current?.getBoundingClientRect();
                      if (rect) {
                        setHoverPos({
                          x: (w.x / 100) * rect.width,
                          y: (w.y / 100) * rect.height,
                        });
                      }
                    }}
                    onMouseLeave={() => setHoveredWaypoint(null)}
                    className="cursor-pointer transition-all duration-300 group"
                  >
                    {/* Pulsing Ripple if selected */}
                    {isSelected && (
                      <>
                        <circle
                          cx={cx}
                          cy={cy}
                          r="28"
                          fill="#D4AF37"
                          fillOpacity="0.3"
                          className="animate-ping"
                        />
                        <circle
                          cx={cx}
                          cy={cy}
                          r="22"
                          fill="none"
                          stroke="#F59E0B"
                          strokeWidth="2.5"
                          strokeDasharray="4 4"
                        />
                      </>
                    )}

                    {/* Outer Circle Ring */}
                    <circle
                      cx={cx}
                      cy={cy}
                      r={isSelected ? 18 : isHovered ? 16 : 14}
                      fill={isSelected ? '#D4AF37' : '#1E293B'}
                      stroke={isSelected ? '#FFFFFF' : '#D4AF37'}
                      strokeWidth={isSelected ? 3 : 2}
                      className="transition-all duration-300 group-hover:scale-125 shadow-lg"
                    />

                    {/* Day Number inside Pin */}
                    <text
                      x={cx}
                      y={cy + (isSelected ? 5 : 4)}
                      fill={isSelected ? '#0f172a' : '#FAF9F6'}
                      fontSize={isSelected ? '12' : '10'}
                      fontWeight="bold"
                      fontFamily="serif"
                      textAnchor="middle"
                    >
                      D{w.day}
                    </text>

                    {/* Cultural Camera / Info Icon floating tag */}
                    <g transform={`translate(${cx + 10}, ${cy - 12})`}>
                      <circle cx="0" cy="0" r="7" fill="#F59E0B" stroke="#FFFFFF" strokeWidth="1" />
                      <text x="0" y="3" fontSize="8" textAnchor="middle" fill="#FFFFFF">📷</text>
                    </g>

                    {/* Landmark Name Label Card */}
                    <g transform={`translate(${cx}, ${cy + (isSelected ? 28 : 24)})`}>
                      <rect
                        x="-75"
                        y="0"
                        width="150"
                        height="26"
                        rx="7"
                        fill={isSelected ? '#1E293B' : '#0F172A'}
                        fillOpacity="0.94"
                        stroke={isSelected ? '#D4AF37' : '#475569'}
                        strokeWidth={isSelected ? 1.5 : 1}
                      />
                      <text
                        x="0"
                        y="17"
                        fill={isSelected ? '#FDE68A' : '#E2E8F0'}
                        fontSize="11.5"
                        fontWeight={isSelected ? 'bold' : 'normal'}
                        fontFamily="serif"
                        textAnchor="middle"
                      >
                        {w.icon} {w.name.split('·')[0].trim().slice(0, 8)}
                      </text>
                    </g>
                  </g>
                );
              })}
            </svg>

            {/* Quick Day Stepper Selector Floating in Map */}
            <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between gap-2 bg-stone-950/75 backdrop-blur-md p-1.5 sm:p-2 rounded-2xl border border-white/10 overflow-x-auto no-scrollbar">
              <div className="flex items-center gap-1.5 shrink-0">
                <span className="text-[11px] font-serif text-[#D4AF37] px-1 hidden sm:inline">
                  研学点导航：
                </span>
                {waypoints.map((w) => (
                  <button
                    key={w.day}
                    onClick={() => handlePointClick(w)}
                    className={`px-3 py-1 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer flex items-center gap-1 ${
                      w.day === selectedDay
                        ? 'bg-[#D4AF37] text-stone-950 shadow-md scale-105'
                        : 'text-stone-300 hover:text-white bg-white/5 hover:bg-white/10'
                    }`}
                  >
                    <span>D{w.day}</span>
                    <span className="hidden sm:inline font-light text-[10px] opacity-90">
                      {w.name.split('·')[0].slice(0, 4)}
                    </span>
                  </button>
                ))}
              </div>

              <button
                onClick={() => {
                  const curr = waypoints.find((w) => w.day === selectedDay) || waypoints[0];
                  setActiveSpotlightNode(curr);
                }}
                className="bg-amber-500/90 hover:bg-amber-500 text-stone-950 text-xs font-bold px-3 py-1 rounded-xl flex items-center gap-1 shrink-0 transition-colors shadow-2xs cursor-pointer"
              >
                <BookOpen className="w-3.5 h-3.5" />
                <span>探索 D{selectedDay} 文化故事</span>
              </button>
            </div>
          </div>
        </div>
      ) : (
        /* 4. Elevation and Pacing Profile Chart */
        <div className="bg-white rounded-2xl p-4 border border-[#EAE6DF] shadow-xs space-y-3">
          <div className="flex items-center justify-between text-xs text-stone-600 border-b border-stone-100 pb-2">
            <span className="font-bold text-[#2C3E50] flex items-center gap-1.5">
              <TrendingUp className="w-4 h-4 text-[#85660d]" />
              <span>全线每日慢行步数与海拔地貌平缓度剖面</span>
            </span>
            <span className="text-[11px] text-emerald-700 font-medium">
              ✓ 全程无险峰爬阶 · 乐龄指数 ★★★★★
            </span>
          </div>

          <div className="relative w-full aspect-[21/8] select-none">
            <svg viewBox="0 0 1000 280" className="w-full h-full">
              <defs>
                <linearGradient id="elevAreaGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#D4AF37" stopOpacity="0.4" />
                  <stop offset="100%" stopColor="#FAF9F6" stopOpacity="0.05" />
                </linearGradient>
              </defs>

              {/* Grid Lines */}
              <line x1="60" y1="80" x2="940" y2="80" stroke="#f1f5f9" strokeWidth="1" strokeDasharray="3 3" />
              <line x1="60" y1="150" x2="940" y2="150" stroke="#f1f5f9" strokeWidth="1" strokeDasharray="3 3" />
              <line x1="60" y1="220" x2="940" y2="220" stroke="#f1f5f9" strokeWidth="1" />

              {/* Area Fill & Curve */}
              <path d={elevationProfileD.areaD} fill="url(#elevAreaGrad)" />
              <path d={elevationProfileD.lineD} fill="none" stroke="#D4AF37" strokeWidth="3" />

              {/* Data points */}
              {waypoints.map((w, idx) => {
                const maxElev = Math.max(...waypoints.map((x) => x.elevation), 200);
                const minElev = Math.min(...waypoints.map((x) => x.elevation), 0);
                const range = Math.max(maxElev - minElev, 100);
                const cx = 60 + (idx / Math.max(1, waypoints.length - 1)) * 880;
                const cy = 220 - ((w.elevation - minElev) / range) * 140;
                const isSelected = w.day === selectedDay;

                return (
                  <g
                    key={w.day}
                    onClick={() => handlePointClick(w)}
                    className="cursor-pointer group"
                  >
                    <circle
                      cx={cx}
                      cy={cy}
                      r={isSelected ? 8 : 5}
                      fill={isSelected ? '#2C3E50' : '#D4AF37'}
                      stroke="#FFFFFF"
                      strokeWidth={isSelected ? 3 : 2}
                      className="group-hover:scale-125 transition-transform"
                    />
                    <text
                      x={cx}
                      y={cy - 12}
                      fill="#2C3E50"
                      fontSize="11"
                      fontWeight="bold"
                      textAnchor="middle"
                    >
                      D{w.day} · {w.elevation}m
                    </text>
                    <text
                      x={cx}
                      y="265"
                      fill="#64748b"
                      fontSize="11"
                      textAnchor="middle"
                    >
                      👣 {w.steps}
                    </text>
                  </g>
                );
              })}
            </svg>
          </div>
        </div>
      )}

      {/* Transit Leg Info Banner (When user clicks on connection line) */}
      {selectedTransitLeg && (
        <div className="mt-3 p-3 bg-gradient-to-r from-blue-50 to-indigo-50/70 rounded-2xl border border-blue-200 text-xs text-blue-900 flex flex-col sm:flex-row sm:items-center justify-between gap-2 shadow-xs animate-fadeIn">
          <div className="flex items-center gap-2.5">
            <span className="w-7 h-7 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold">
              🚌
            </span>
            <div>
              <div className="font-bold flex items-center gap-2">
                <span>
                  第 {selectedTransitLeg.from.day} 天 ({selectedTransitLeg.from.name.split('·')[0]}) → 第 {selectedTransitLeg.to.day} 天 ({selectedTransitLeg.to.name.split('·')[0]})
                </span>
                <span className="bg-blue-200/80 text-blue-900 text-[10px] px-2 py-0.5 rounded-full font-semibold">
                  {selectedTransitLeg.to.driveTime}
                </span>
              </div>
              <p className="text-blue-800 text-[11px] mt-0.5">
                配备 2+1 陆地头等舱大巴，气压减震座椅与恒温空调，途经风景廊道中途安排茶歇与适老洗手间停靠。
              </p>
            </div>
          </div>
          <button
            onClick={() => setSelectedTransitLeg(null)}
            className="self-end sm:self-auto text-blue-600 hover:text-blue-800 font-bold cursor-pointer text-xs p-1"
          >
            关闭提示
          </button>
        </div>
      )}

      {/* 5. Selected Day Deep Exploration & Cultural Highlights Card */}
      <div className="mt-4 bg-white rounded-2xl p-4 border border-[#EAE6DF] shadow-xs space-y-3.5">
        {/* Day Header Info */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-stone-100 pb-3">
          <div className="flex items-center space-x-3">
            <span className="w-10 h-10 rounded-2xl bg-[#2C3E50] text-[#D4AF37] border border-[#D4AF37]/30 font-serif font-bold text-lg flex items-center justify-center shadow-2xs shrink-0">
              D{activeWaypoint.day}
            </span>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h4 className="font-serif italic font-bold text-base md:text-lg text-[#2C3E50]">
                  {activeWaypoint.name}
                </h4>
                <span className="bg-amber-50 text-[#85660d] border border-amber-200 text-[11px] font-bold px-2.5 py-0.5 rounded-full">
                  ★ {activeWaypoint.highlightTag}
                </span>
                <span className="bg-stone-100 text-stone-700 text-[11px] px-2 py-0.5 rounded font-medium">
                  {activeWaypoint.categoryLabel}
                </span>
              </div>
              <p className="text-xs text-stone-500 mt-0.5">
                研学主题：{activeWaypoint.theme} · 核心景致：{activeWaypoint.culturalTitle}
              </p>
            </div>
          </div>

          {/* Quick Action Buttons */}
          <div className="flex items-center gap-2 text-xs self-start sm:self-auto">
            <button
              onClick={() => setActiveSpotlightNode(activeWaypoint)}
              className="bg-amber-500 hover:bg-amber-600 text-stone-950 font-bold px-3 py-1.5 rounded-xl border border-amber-600 flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5 text-stone-950" />
              <span>查看文化小贴士与实景</span>
            </button>
          </div>
        </div>

        {/* Real Scenic Snapshot Preview Strip */}
        <div className="bg-[#FAF9F6] p-3 rounded-2xl border border-[#EAE6DF] space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="font-bold text-[#2C3E50] flex items-center gap-1.5">
              <Camera className="w-3.5 h-3.5 text-[#85660d]" />
              <span>该研学点实景照片与文化快照</span>
            </span>
            <button
              onClick={() => setActiveSpotlightNode(activeWaypoint)}
              className="text-[#85660d] hover:text-[#5c4609] font-medium flex items-center gap-0.5 cursor-pointer"
            >
              <span>放大全屏图文</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
            {activeWaypoint.photos.map((photo, pIdx) => (
              <div
                key={pIdx}
                onClick={() => {
                  setCurrentPhotoIdx(pIdx);
                  setActiveSpotlightNode(activeWaypoint);
                }}
                className="relative rounded-xl overflow-hidden aspect-[16/10] group cursor-pointer border border-stone-200 shadow-2xs"
              >
                <img
                  src={photo.url}
                  alt={photo.caption}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-transparent to-transparent flex flex-col justify-end p-2">
                  <span className="text-[10px] text-amber-200 font-medium">#{photo.tag}</span>
                  <span className="text-xs text-white font-bold truncate">{photo.caption}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Cultural Background Summary Snippet */}
        <div className="bg-amber-50/50 p-3 rounded-xl border border-amber-200/60 text-xs space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="font-bold text-[#85660d] flex items-center gap-1">
              <BookOpen className="w-3.5 h-3.5" />
              <span>文化背景小贴士速览</span>
            </span>
            <span className="text-[10px] text-stone-500 font-serif italic">
              {activeWaypoint.poetry?.verse} —— {activeWaypoint.poetry?.author}
            </span>
          </div>
          <p className="text-stone-700 leading-relaxed text-xs">
            {activeWaypoint.culturalStory.slice(0, 130)}...
          </p>
        </div>

        {/* Detailed Itinerary Schedule Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5 text-xs">
          <div className="bg-[#FAF9F6] p-2.5 rounded-xl border border-[#EAE6DF] space-y-1">
            <div className="font-bold text-[#2C3E50] flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-[#2C3E50]"></span>
              <span>上午安排</span>
            </div>
            <p className="text-stone-700 leading-relaxed">{activeWaypoint.morning}</p>
          </div>

          <div className="bg-amber-50/40 p-2.5 rounded-xl border border-amber-200/50 space-y-1">
            <div className="font-bold text-[#85660d] flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-[#D4AF37]"></span>
              <span>下午核心研学</span>
            </div>
            <p className="text-stone-700 leading-relaxed">{activeWaypoint.afternoon}</p>
          </div>

          <div className="bg-[#FAF9F6] p-2.5 rounded-xl border border-[#EAE6DF] space-y-1">
            <div className="font-bold text-stone-700 flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-stone-400"></span>
              <span>晚间养生与住宿</span>
            </div>
            <p className="text-stone-700 leading-relaxed">{activeWaypoint.evening}</p>
          </div>
        </div>

        {/* Dining & Hotel Quality Details */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs pt-0.5">
          <div className="flex items-center gap-2 p-2.5 rounded-xl bg-stone-50 border border-stone-100">
            <Utensils className="w-4 h-4 text-[#85660d] shrink-0" />
            <div className="truncate">
              <span className="font-bold text-stone-800">精选膳食：</span>
              <span className="text-stone-600">{activeWaypoint.dining}</span>
            </div>
          </div>

          <div className="flex items-center gap-2 p-2.5 rounded-xl bg-stone-50 border border-stone-100">
            <BedDouble className="w-4 h-4 text-[#2C3E50] shrink-0" />
            <div className="truncate">
              <span className="font-bold text-stone-800">甄选入住：</span>
              <span className="text-[#2C3E50] font-semibold">{activeWaypoint.hotel}</span>
            </div>
          </div>
        </div>
      </div>

      {/* ⭐ 6. CULTURAL SPOTLIGHT MODAL (点击节点弹出的文化背景小贴士与高清照片全屏卡片) */}
      {activeSpotlightNode && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-3 sm:p-5 animate-fadeIn">
          <div
            className="bg-[#FAF9F6] w-full max-w-2xl max-h-[90vh] rounded-3xl border border-[#D4AF37] shadow-2xl overflow-hidden flex flex-col animate-scaleUp relative text-stone-800"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="bg-[#2C3E50] text-[#FAF9F6] p-4 flex items-center justify-between border-b border-[#D4AF37]/30">
              <div className="flex items-center space-x-2.5">
                <span className="w-9 h-9 rounded-xl bg-[#D4AF37] text-stone-900 font-serif font-bold text-base flex items-center justify-center shadow-xs">
                  D{activeSpotlightNode.day}
                </span>
                <div>
                  <h3 className="font-serif italic font-bold text-base sm:text-lg text-white flex items-center gap-2">
                    <span>{activeSpotlightNode.name}</span>
                    <span className="bg-[#D4AF37]/30 text-[#D4AF37] text-xs font-sans px-2 py-0.5 rounded-full border border-[#D4AF37]/40">
                      {activeSpotlightNode.highlightTag}
                    </span>
                  </h3>
                  <p className="text-xs text-stone-300 font-light">
                    {activeSpotlightNode.culturalTitle}
                  </p>
                </div>
              </div>

              <button
                onClick={() => {
                  if ('speechSynthesis' in window) window.speechSynthesis.cancel();
                  setIsReadingAudio(false);
                  setActiveSpotlightNode(null);
                }}
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-stone-300 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Scrollable Content Body */}
            <div className="p-4 sm:p-5 overflow-y-auto space-y-4 text-xs sm:text-sm">
              {/* Photo Carousel Banner */}
              <div className="relative rounded-2xl overflow-hidden aspect-[16/9] bg-stone-900 shadow-md">
                <img
                  src={activeSpotlightNode.photos[currentPhotoIdx]?.url || activeSpotlightNode.photos[0]?.url}
                  alt={activeSpotlightNode.photos[currentPhotoIdx]?.caption}
                  className="w-full h-full object-cover transition-all duration-300"
                />

                <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent flex flex-col justify-between p-3.5">
                  <div className="flex items-center justify-between">
                    <span className="bg-[#D4AF37] text-stone-950 font-bold text-[11px] px-2.5 py-0.5 rounded-full shadow-xs">
                      #{activeSpotlightNode.photos[currentPhotoIdx]?.tag || '实景'}
                    </span>
                    <span className="bg-black/60 backdrop-blur-md text-white text-xs px-2.5 py-0.5 rounded-full">
                      {currentPhotoIdx + 1} / {activeSpotlightNode.photos.length}
                    </span>
                  </div>

                  <div className="space-y-1">
                    <h4 className="font-serif font-bold text-sm sm:text-base text-white">
                      {activeSpotlightNode.photos[currentPhotoIdx]?.caption}
                    </h4>
                  </div>
                </div>

                {/* Carousel Prev/Next Buttons */}
                {activeSpotlightNode.photos.length > 1 && (
                  <>
                    <button
                      onClick={() =>
                        setCurrentPhotoIdx((prev) =>
                          prev === 0 ? activeSpotlightNode.photos.length - 1 : prev - 1
                        )
                      }
                      className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/50 hover:bg-black/80 text-white flex items-center justify-center transition-colors cursor-pointer"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() =>
                        setCurrentPhotoIdx((prev) =>
                          prev === activeSpotlightNode.photos.length - 1 ? 0 : prev + 1
                        )
                      }
                      className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/50 hover:bg-black/80 text-white flex items-center justify-center transition-colors cursor-pointer"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </>
                )}
              </div>

              {/* Photo Thumbnails Switcher */}
              {activeSpotlightNode.photos.length > 1 && (
                <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
                  {activeSpotlightNode.photos.map((p, idx) => (
                    <button
                      key={idx}
                      onClick={() => setCurrentPhotoIdx(idx)}
                      className={`relative w-16 sm:w-20 aspect-[16/10] rounded-xl overflow-hidden border-2 transition-all shrink-0 cursor-pointer ${
                        currentPhotoIdx === idx ? 'border-[#D4AF37] scale-105' : 'border-stone-200 opacity-60'
                      }`}
                    >
                      <img src={p.url} alt={p.caption} className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}

              {/* Voice Guide Player Bar */}
              <div className="bg-amber-50/70 border border-amber-200 rounded-2xl p-3 flex items-center justify-between gap-3 shadow-2xs">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-[#2C3E50] text-[#D4AF37] flex items-center justify-center shrink-0">
                    <Volume2 className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="font-bold text-xs sm:text-sm text-[#2C3E50]">
                      随团文化名师语音导览
                    </div>
                    <div className="text-[11px] text-[#85660d]">
                      {isReadingAudio ? '正在为长辈朗读文化故事...' : '乐龄慢速语音 · 点击开启伴随式聆听'}
                    </div>
                  </div>
                </div>

                <button
                  onClick={() =>
                    handleToggleVoiceAudio(
                      `${activeSpotlightNode.name}。${activeSpotlightNode.culturalStory}。${activeSpotlightNode.culturalTip}`
                    )
                  }
                  className={`px-3 py-1.5 rounded-xl font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer shadow-xs ${
                    isReadingAudio
                      ? 'bg-rose-600 text-white animate-pulse'
                      : 'bg-[#D4AF37] hover:bg-amber-500 text-stone-950'
                  }`}
                >
                  {isReadingAudio ? (
                    <>
                      <VolumeX className="w-3.5 h-3.5" />
                      <span>停止朗读</span>
                    </>
                  ) : (
                    <>
                      <Volume2 className="w-3.5 h-3.5" />
                      <span>听名师讲解</span>
                    </>
                  )}
                </button>
              </div>

              {/* Cultural Story & Historical Anecdotes */}
              <div className="bg-white rounded-2xl p-4 border border-[#EAE6DF] space-y-2.5 shadow-2xs">
                <div className="flex items-center justify-between border-b border-stone-100 pb-2">
                  <h4 className="font-serif font-bold text-[#2C3E50] text-sm sm:text-base flex items-center gap-1.5">
                    <BookOpen className="w-4 h-4 text-[#D4AF37]" />
                    <span>文化源流与美学解析</span>
                  </h4>
                  {activeSpotlightNode.poetry && (
                    <span className="text-[11px] text-stone-500 font-serif italic">
                      “{activeSpotlightNode.poetry.verse}”
                    </span>
                  )}
                </div>
                <p className="text-stone-700 leading-relaxed text-xs sm:text-sm">
                  {activeSpotlightNode.culturalStory}
                </p>
              </div>

              {/* Cultural Tip & Photography Secrets ("文化背景小贴士") */}
              <div className="bg-gradient-to-r from-amber-50 via-yellow-50 to-orange-50/40 rounded-2xl p-4 border border-amber-200/80 space-y-2 shadow-2xs">
                <h4 className="font-bold text-[#85660d] text-xs sm:text-sm flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-[#D4AF37]" />
                  <span>研学名师独家小贴士与观赏秘诀</span>
                </h4>
                <p className="text-stone-800 leading-relaxed text-xs sm:text-sm font-medium">
                  {activeSpotlightNode.culturalTip}
                </p>
                <div className="text-[11px] text-stone-500 italic pt-1 border-t border-amber-200/50">
                  {activeSpotlightNode.masterQuote}
                </div>
              </div>

              {/* Senior Walking Pacing & Comfort Assurance */}
              <div className="bg-[#FAF9F6] rounded-2xl p-3.5 border border-[#EAE6DF] space-y-2 text-xs">
                <div className="font-bold text-[#2C3E50] flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-700" />
                  <span>乐龄慢行与舒适度指标</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-stone-600">
                  <div className="flex items-center gap-1.5">
                    <span className="font-semibold text-stone-800">👣 路面坡度：</span>
                    <span>{activeSpotlightNode.seniorPacingInfo.gradient}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="font-semibold text-stone-800">🪑 歇脚设置：</span>
                    <span>{activeSpotlightNode.seniorPacingInfo.restPoints}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="font-semibold text-stone-800">🌳 绿荫覆盖：</span>
                    <span>{activeSpotlightNode.seniorPacingInfo.shadeRate}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="font-semibold text-stone-800">🏥 保障设施：</span>
                    <span>{activeSpotlightNode.seniorPacingInfo.amenities}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Bottom Footer Actions */}
            <div className="p-3.5 bg-white border-t border-stone-200 flex items-center justify-between gap-2">
              <span className="text-xs text-stone-500">
                当前研学点：第 {activeSpotlightNode.day} 天 · {activeSpotlightNode.name.split('·')[0]}
              </span>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    if (onSelectDay) onSelectDay(activeSpotlightNode.day);
                    setSelectedDay(activeSpotlightNode.day);
                    if ('speechSynthesis' in window) window.speechSynthesis.cancel();
                    setIsReadingAudio(false);
                    setActiveSpotlightNode(null);
                  }}
                  className="bg-[#2C3E50] hover:bg-[#1a252f] text-white text-xs font-bold px-4 py-2 rounded-xl transition-colors cursor-pointer flex items-center gap-1"
                >
                  <span>查看当日行程</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
