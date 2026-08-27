// ★ 前台「起价」统一口径（与老小程序 utils/price.js 一致）：
//   大团体验 / 精品小团 取价格最低的一个为前台起价；仅有一个团型时取对应的那个。
//   priceGroup=大团价；pricePremium=小团价。>0 视为有效（0 视为未设置/免费不计入候选）。
//
// ★ 定价体系 v2：
//   大团/小团是固定特色 → 任一通道录入价格前台则显示；任一价格为 0 只显示有价格的；
//   两通道全 0 不允许后台提交（后端 normalizePriceStructure 兜底拦截）。
//   有 priceStructure 时按通道 enabled 计算起价（min 取两通道有效价的最小值）；
//   无 priceStructure 时回退旧 priceGroup/pricePremium 字段。

export function startPrice(
  a: { priceGroup?: number; pricePremium?: number; priceStructure?: any; price?: number } | null | undefined
): number {
  if (!a) return 0;
  const ps = a.priceStructure;
  if (ps && typeof ps === 'object' && ps.channels && typeof ps.channels === 'object') {
    const g = ps.channels.group || {};
    const p = ps.channels.premium || {};
    const gEnabled = !!g.enabled && (Number(g.price) || 0) > 0;
    const pEnabled = !!p.enabled && (Number(p.price) || 0) > 0;
    if (gEnabled || pEnabled) {
      const candidates: number[] = [];
      if (gEnabled) candidates.push(Number(g.price));
      if (pEnabled) candidates.push(Number(p.price));
      return Math.min(...candidates);
    }
  }
  const group = Number(a.priceGroup) || Number(a.price) || 0;
  const premium = Number(a.pricePremium) || 0;
  const candidates: number[] = [];
  if (group > 0) candidates.push(group);
  if (premium > 0) candidates.push(premium);
  if (!candidates.length) return Number(a.price) || 0;
  return Math.min(...candidates);
}

// 归一化单通道：返回 { name, enabled, price, priceTiers }（仅 enabled 且 price>0 视为有效通道）
export function normChannel(c: any): {
  name: string;
  enabled: boolean;
  price: number;
  priceTiers: { name: string; price: number; count: number }[];
} {
  c = c && typeof c === 'object' ? c : {};
  const tiers = (Array.isArray(c.priceTiers) ? c.priceTiers : [])
    .filter((t: any) => t && (Number(t.price) || 0) > 0 && (Number(t.count) || 1) >= 1)
    .map((t: any) => ({
      name: String(t.name || '').slice(0, 20),
      price: Math.round(Number(t.price) * 100) / 100,
      count: Math.max(1, Math.floor(Number(t.count) || 1)),
    }));
  const directPrice = Math.round(Number(c.price) * 100) / 100 || 0;
  let price = directPrice;
  if (!price && tiers.length) {
    price = tiers.reduce(
      (m: any, t: any) => (!m || t.price < m.price ? t : m),
      null
    ).price;
  }
  return {
    name: String(c.name || '').slice(0, 10),
    enabled: price > 0,
    price,
    priceTiers: tiers,
  };
}

// 归一化完整 priceStructure（含费用分套，feeMode: shared | separate）
export function normPriceStructure(input: any): {
  channels: {
    group: {
      name: string;
      enabled: boolean;
      price: number;
      priceTiers: { name: string; price: number; count: number }[];
    };
    premium: {
      name: string;
      enabled: boolean;
      price: number;
      priceTiers: { name: string; price: number; count: number }[];
    };
  };
  feeMode: 'shared' | 'separate';
  fee: {
    shared: { includes: { category: string; detail: string }[]; excludes: string[] };
    group: { includes: { category: string; detail: string }[]; excludes: string[] };
    premium: { includes: { category: string; detail: string }[]; excludes: string[] };
  };
} {
  const src = input && typeof input === 'object' ? input : {};
  const channels = src.channels && typeof src.channels === 'object' ? src.channels : {};
  const group = normChannel(channels.group);
  const premium = normChannel(channels.premium);
  const normFeeList = (list: any): { category: string; detail: string }[] => {
    if (!Array.isArray(list)) return [];
    return list
      .filter((f: any) => f && ((typeof f === 'string' && f.trim()) || (f.detail && f.detail.trim())))
      .map((f: any) => {
        if (typeof f === 'string') return { category: '', detail: f.trim().slice(0, 120) };
        return {
          category: String(f.category || '').slice(0, 20),
          detail: String(f.detail || '').slice(0, 120),
        };
      });
  };
  const normExcludes = (list: any): string[] => {
    if (!Array.isArray(list)) return [];
    return list
      .map((x: any) => (typeof x === 'string' ? x : (x && x.detail) || ''))
      .filter((s: string) => !!s.trim())
      .map((s: string) => s.trim().slice(0, 120));
  };
  const normFeeSet = (f: any) => ({
    includes: normFeeList(f && f.includes),
    excludes: normExcludes(f && f.excludes),
  });
  const feeMode = src.feeMode === 'separate' ? 'separate' : 'shared';
  const fee = {
    shared: normFeeSet(src.fee && src.fee.shared),
    group: normFeeSet(src.fee && src.fee.group),
    premium: normFeeSet(src.fee && src.fee.premium),
  };
  return { channels: { group, premium }, feeMode, fee };
}

// 取当前通道展示价：有档位 → 最低档位价；无档位 → 通道基准价
export function channelDisplayPrice(ch: {
  price: number;
  priceTiers: { name: string; price: number; count: number }[];
}): number {
  if (!ch) return 0;
  if (ch.priceTiers && ch.priceTiers.length) {
    return ch.priceTiers.reduce((m, t) => (!m || t.price < m.price ? t : m), null as any).price;
  }
  return ch.price || 0;
}
