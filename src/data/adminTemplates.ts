export interface TemplateItem {
  id: string;
  title: string;
  category: string;
  tag: string;
  items: string[];
}

// 1. 注意事项与健康告知模板库
export const NOTICE_TEMPLATES: TemplateItem[] = [
  {
    id: 'standard_senior_health',
    title: '【标准适老健康出行公约与安全告知】',
    category: '健康安全',
    tag: '全团通用',
    items: [
      '本行程专为 50-75 岁乐龄长辈定制研发，全程纯玩慢游，不进购物店、不推自费加点。',
      '随团配备红十字认证急救员与急救药箱（含 AED）；有高血压、心脑血管等慢病的长辈请如实告知健康状况并签署告知书。',
      '70岁以上长辈参团须有家属知情同意，全程由金牌乐龄管家提供一对一关怀照料。',
      '行程中每日安排健康晨检与体能适度提醒，如遇身体不适请随时报告管家安排静养。',
    ],
  },
  {
    id: 'culture_museum_guidelines',
    title: '【江南名师文博与非遗研学出行须知】',
    category: '文化研学',
    tag: '名师随团',
    items: [
      '古典园林与文博场馆请保持静雅，特邀名师开讲时请佩戴由主办方统一发放的无线降噪导赏耳麦。',
      '园林石板路偶有微湿，请务必穿着轻便防滑软底健步鞋，避开青苔地面。',
      '昆曲与非遗手作工坊请准时入座，随团管家提供全程单反跟拍并免费赠送相册底片。',
    ],
  },
  {
    id: 'hotspring_health_care',
    title: '【温泉道医康养与山海旅居须知】',
    category: '康养疗休',
    tag: '温泉道医',
    items: [
      '泡天然温泉建议每次不超过 15-20 分钟，饭后半小时内不宜入浴，入浴前请补充温开水。',
      '新安医学/道医把脉理疗请配合专家建议，理疗后避免吹冷风受凉。',
      '晨练八段锦或太极养生功请量力而行，以微汗舒畅为度。',
    ],
  },
  {
    id: 'cross_provincial_train',
    title: '【跨省高铁与长途专线证件行李须知】',
    category: '长途交通',
    tag: '跨省专线',
    items: [
      '务必随身携带本人有效二代身份证原件，以便进站及酒店办理适老绿色通道登记。',
      '行李由管家全程协助办理大件托运与送房，个人贵重物品及常备药请随身携带。',
      '如需轮椅或上下车升降协助，请提前 3 天与专属管家报备预约。',
    ],
  },
  {
    id: 'refund_and_single_room',
    title: '【退改政策与单房差拼房原则】',
    category: '政策与退改',
    tag: '费用条款',
    items: [
      '出发前 5 天（含）以上可无损取消或免费改期；出发前 3 天取消扣除实际车房损耗。',
      '单人报名者我们将优先安排同性乐龄老友免费拼房；若需独享一间房需补交单房差（名仕及以上会员每年享单房差减免礼遇）。',
      '遇不可抗力（台风、极端暴雨等）导致行程微调，将在确保长辈安全前提下协商优化。',
    ],
  },
];

// 2. 行前准备携带提示模板库
export const PACKING_TEMPLATES: TemplateItem[] = [
  {
    id: 'standard_packing',
    title: '【经典乐龄四季出行必备清单】',
    category: '必备通用',
    tag: '推荐必备',
    items: [
      '携带本人有效二代身份证原件',
      '备齐常备慢性病个人药品（降压药/降糖药/心脑血管药7日量）及保温水杯',
      '穿着轻便防滑软底健步鞋与防风保暖外套',
      '随身携带适老便携晴雨伞',
    ],
  },
  {
    id: 'photo_art_packing',
    title: '【摄影雅集与文博赏析专备清单】',
    category: '文化摄影',
    tag: '雅集文博',
    items: [
      '二代身份证原件及老年优待证',
      '微单/单反相机、充电器、大容量内存卡',
      '便携轻量折叠小马扎、老花镜',
      '透气棉麻衣物与防滑软底布鞋',
    ],
  },
  {
    id: 'wellness_spa_packing',
    title: '【温泉水疗与山海康养专备清单】',
    category: '康养温泉',
    tag: '温泉旅居',
    items: [
      '温泉泳衣/适老温泉服、个人防滑拖鞋',
      '宽松棉质晨练服、便携保温水杯',
      '个人惯用护肤润肤霜、防风轻薄外套',
    ],
  },
];

// 3. 适老化特点与体能保障套餐模板库
export const SENIOR_FEATURE_PACKAGES = [
  {
    id: 'medical_care',
    name: '五星随团医护与急救全保套餐',
    desc: '随团配红十字认证急救医护与AED急救箱 · 每日早晚健康监测 · 轮椅随车备用',
    fitnessLevel: 1,
    fitnessDesc: '极度舒缓·全医护随团·配AED与随车轮椅',
    tags: ['随团医护+AED', '每日健康监测', '医用轮椅随车', '绿色急救通道'],
  },
  {
    id: 'gentle_walking',
    name: '极度舒缓平缓步道套餐',
    desc: '每日平缓步数 ≤ 3,500 步 · 全程无障碍电梯与坡道 · 每走30分钟设置茶歇休憩',
    fitnessLevel: 1,
    fitnessDesc: '平缓无台阶·每日≤3500步·半天游半天休',
    tags: ['每日≤3500步', '全程无台阶', '定时茶歇长椅', '专车点对点'],
  },
  {
    id: 'luxury_hotel_bath',
    name: '五星适老防滑静音套房套餐',
    desc: '严选五星级适老化园林酒店 · 浴室加装防滑扶手与坐凳 · 夜间柔光地灯 · 专人行李送房',
    fitnessLevel: 2,
    fitnessDesc: '五星适老下榻·加装防滑扶手·大件行李送房',
    tags: ['防滑卫浴扶手', '淋浴坐凳', '夜间地灯', '1对1行李送房'],
  },
  {
    id: 'vip_coach',
    name: '宽体2+1航空头等舱大巴套餐',
    desc: '豪华2+1宽体航空座椅 · 140度电动调角 · 一级低踏板上下车随车踏凳',
    fitnessLevel: 2,
    fitnessDesc: '2+1航空座椅大巴·低踏板踏凳·平稳减震',
    tags: ['2+1航空大巴', '一级低踏板', '车内温水供应', 'USB便捷充电'],
  },
  {
    id: 'healthy_diet',
    name: '清淡少盐适老养生美馔套餐',
    desc: '甄选当地有机食材 · 低糖低嘌呤定制餐 · 软烂易咀嚼 · 常备温热养生茶饮',
    fitnessLevel: 2,
    fitnessDesc: '少盐低糖膳食·软烂易咀嚼·滋补药膳',
    tags: ['低糖少盐', '软烂易消化', '时令养生汤', '分餐公筷公勺'],
  },
];

// 4. 精选适老研学高清主图相册图库 (3张/组)
export const PRESET_GALLERY_PHOTOS = [
  {
    category: '江南园林与水乡',
    name: '苏州古典园林与平江水乡',
    images: [
      'https://images.unsplash.com/photo-1548013146-72479768bada?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1508804185872-d7badad00f7d?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1512813195386-6cf811ad3542?auto=format&fit=crop&w=800&q=80',
    ],
  },
  {
    category: '敦煌丝路与文博',
    name: '河西走廊与莫高窟特窟',
    images: [
      'https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=800&q=80',
    ],
  },
  {
    category: '名山康养与温泉',
    name: '千岛湖与黄山温泉养生谷',
    images: [
      'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=800&q=80',
    ],
  },
  {
    category: '茶道与非遗雅集',
    name: '武夷岩茶与徽州古村落',
    images: [
      'https://images.unsplash.com/photo-1576092768241-dec231879fc3?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1511193311914-0346f16efe90?auto=format&fit=crop&w=800&q=80',
    ],
  },
];
