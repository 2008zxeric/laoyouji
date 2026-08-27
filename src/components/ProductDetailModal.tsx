import React, { useState } from 'react';
import { X, Sparkles, Truck, Minus, Plus, ShoppingCart, CheckCircle2 } from 'lucide-react';
import type { PointsProduct } from '../types';
import { MOCK_POINTS_PRODUCTS } from '../data/mockData';
import { useApp } from '../context/AppContext';

export const ProductDetailModal: React.FC<{
  product: PointsProduct;
  onClose: () => void;
  onAddToCart?: (p: PointsProduct) => void;
  onDirectRedeem?: (p: PointsProduct, count: number) => void;
}> = ({ product: initial, onClose, onAddToCart, onDirectRedeem }) => {
  const { userProfile, showToast } = useApp();
  const [product, setProduct] = useState<PointsProduct>(initial);
  const [qty, setQty] = useState(1);

  const related = MOCK_POINTS_PRODUCTS.filter(
    (p) => p.id !== product.id && p.category === product.category
  )
    .concat(MOCK_POINTS_PRODUCTS.filter((p) => p.id !== product.id && p.category !== product.category))
    .slice(0, 4);

  const NOTICES = [
    '兑换成功后，实物商品 7 个工作日内寄出（顺丰包邮保价）',
    '出游礼券类商品实时发放至您的名仕会员账户，报名时自动抵扣',
    '商品收到后如有任何破损或质量问题，平台提供 7 天专人跟进换新',
    '一经兑换扣除相应名仕积分，积分商城全平台通用',
  ];

  return (
    <div className="fixed inset-0 z-[70] bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-fadeIn">
      <div className="bg-[#FAF9F6] rounded-3xl w-full max-w-md max-h-[92vh] flex flex-col shadow-2xl border border-[#EAE6DF] overflow-hidden relative">
        {/* 顶栏 */}
        <div className="sticky top-0 bg-[#2C3E50] text-white px-5 py-4 flex items-center justify-between border-b border-[#D4AF37]/30 z-10">
          <h3 className="font-serif font-bold text-base text-amber-50 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-[#D4AF37]" /> 名仕礼遇 · 商品详情
          </h3>
          <button onClick={onClose} className="p-1 rounded-full hover:bg-white/10 text-stone-300 hover:text-white cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto pb-24 space-y-3">
          {/* 大图 */}
          <div className="relative aspect-[4/3] bg-stone-100 overflow-hidden">
            <img src={product.cover} alt={product.name} className="w-full h-full object-cover" />
            <div className="absolute top-3 left-3 bg-[#2C3E50]/90 text-[#D4AF37] text-[10px] px-2.5 py-1 rounded-full border border-[#D4AF37]/40 font-bold backdrop-blur-xs">
              {product.category}
            </div>
            <div className="absolute bottom-3 right-3 bg-black/60 text-white text-[10px] px-2.5 py-1 rounded-full flex items-center gap-1 backdrop-blur-xs">
              <Truck className="w-3.5 h-3.5 text-emerald-400" /> 顺丰速运 · 包邮保价
            </div>
          </div>

          {/* 价格与名称 */}
          <div className="bg-white rounded-2xl border border-[#EAE6DF] p-4 mx-4 shadow-xs">
            <div className="flex items-baseline gap-1.5">
              <span className="text-[#85660d] text-2xl font-serif font-bold">{product.pointsCost.toLocaleString()}</span>
              <span className="text-xs text-stone-500 font-bold">名仕积分</span>
              {product.originalPrice ? (
                <span className="text-xs text-stone-400 line-through ml-2">市价 ¥{product.originalPrice}</span>
              ) : null}
            </div>
            <h4 className="font-serif font-bold text-sm md:text-base text-[#2C3E50] mt-2 leading-relaxed">
              {product.name}
            </h4>
            <div className="text-[11px] text-stone-500 mt-1 flex items-center gap-2">
              <span>已成功兑换 {product.sales || 0} 件</span>
              <span>·</span>
              <span>库存余 {product.stock} 件</span>
            </div>
            <div className="flex flex-wrap gap-1.5 mt-3">
              {product.tags?.map((t) => (
                <span key={t} className="text-[10px] bg-[#D4AF37]/10 text-[#85660d] border border-[#D4AF37]/30 px-2 py-0.5 rounded-full font-medium">
                  {t}
                </span>
              ))}
            </div>
          </div>

          {/* 商品介绍 */}
          <div className="bg-white rounded-2xl border border-[#EAE6DF] p-4 mx-4 shadow-xs">
            <div className="font-serif font-bold text-xs text-[#2C3E50] mb-2 flex items-center gap-1.5">
              <span className="w-1.5 h-3 bg-[#2C3E50] rounded-full"></span>
              <span>礼品品鉴说明</span>
            </div>
            <p className="text-xs text-stone-600 leading-relaxed">{product.description}</p>
          </div>

          {/* 兑换须知 */}
          <div className="bg-white rounded-2xl border border-[#EAE6DF] p-4 mx-4 shadow-xs">
            <div className="font-serif font-bold text-xs text-[#2C3E50] mb-2 flex items-center gap-1.5">
              <span className="w-1.5 h-3 bg-[#2C3E50] rounded-full"></span>
              <span>兑换须知与服务保障</span>
            </div>
            <div className="space-y-1.5">
              {NOTICES.map((n, i) => (
                <div key={i} className="text-[11px] text-stone-500 leading-relaxed flex items-start gap-1.5">
                  <span className="text-[#D4AF37]">•</span>
                  <span>{n}</span>
                </div>
              ))}
            </div>
          </div>

          {/* 同类推荐 */}
          <div className="bg-white rounded-2xl border border-[#EAE6DF] p-4 mx-4 shadow-xs">
            <div className="font-serif font-bold text-xs text-[#2C3E50] mb-3">更多老友心水甄选</div>
            <div className="grid grid-cols-2 gap-2.5">
              {related.map((p) => (
                <button
                  key={p.id}
                  onClick={() => {
                    setProduct(p);
                    setQty(1);
                  }}
                  className="text-left bg-[#FAF9F6] rounded-xl p-2 border border-[#EAE6DF] hover:border-[#D4AF37] transition-colors cursor-pointer"
                >
                  <img src={p.cover} alt={p.name} className="w-full aspect-[4/3] object-cover rounded-lg" />
                  <div className="text-[11px] font-bold text-[#2C3E50] mt-1.5 line-clamp-1">{p.name}</div>
                  <div className="text-[#85660d] text-xs font-serif font-bold mt-0.5">
                    {p.pointsCost.toLocaleString()} 分
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* 底部兑换栏 */}
        <div className="absolute bottom-0 left-0 right-0 bg-white/95 backdrop-blur-md border-t border-[#EAE6DF] p-3 flex items-center gap-3">
          <div className="flex items-center gap-2 bg-[#FAF9F6] rounded-xl px-2.5 py-1 border border-stone-200">
            <button
              onClick={() => setQty(Math.max(1, qty - 1))}
              className="w-6 h-6 rounded-lg bg-white border border-stone-200 flex items-center justify-center text-stone-600 font-bold hover:bg-stone-50 cursor-pointer"
            >
              <Minus className="w-3 h-3" />
            </button>
            <span className="text-xs font-bold text-[#2C3E50] min-w-4 text-center">{qty}</span>
            <button
              onClick={() => setQty(Math.min(product.stock, qty + 1))}
              className="w-6 h-6 rounded-lg bg-white border border-stone-200 flex items-center justify-center text-stone-600 font-bold hover:bg-stone-50 cursor-pointer"
            >
              <Plus className="w-3 h-3" />
            </button>
          </div>

          <button
            onClick={() => {
              if (onAddToCart) onAddToCart(product);
              showToast(`已将 ${qty} 件 ${product.name} 加入兑换清单`);
              onClose();
            }}
            className="flex-1 py-2.5 rounded-xl bg-[#2C3E50] text-[#D4AF37] font-bold text-xs shadow-md hover:brightness-110 active:scale-95 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <ShoppingCart className="w-4 h-4" />
            <span>立即兑换 ({ (product.pointsCost * qty).toLocaleString() } 分)</span>
          </button>
        </div>
      </div>
    </div>
  );
};
