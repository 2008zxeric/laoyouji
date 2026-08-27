import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { PointsProduct, PointsRedemption } from '../types';
import { X, Gift, Sparkles, Truck, MapPin, Package, Copy, Check, Clock, ChevronRight } from 'lucide-react';

export const PointsMallModal: React.FC = () => {
  const {
    isPointsMallOpen,
    setIsPointsMallOpen,
    pointsProducts,
    pointsRedemptions,
    userProfile,
    redeemProduct,
    showToast,
  } = useApp();

  const [activeTab, setActiveTab] = useState<'products' | 'orders'>('products');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [redeemTarget, setRedeemTarget] = useState<PointsProduct | null>(null);
  const [shippingAddress, setShippingAddress] = useState<string>(
    '上海市黄浦区复兴中路507弄8号302室 (赵教授收 13801236688)'
  );
  const [copiedTracking, setCopiedTracking] = useState<string | null>(null);
  const [viewTraceItem, setViewTraceItem] = useState<PointsRedemption | null>(null);

  if (!isPointsMallOpen) return null;

  const categories = [
    { id: 'all', label: '全部甄选' },
    { id: '非遗名茶', label: '非遗名茶' },
    { id: '文旅装备', label: '文旅装备' },
    { id: '乐龄赛事', label: '乐龄赛事' },
    { id: '出游礼券', label: '出游礼券' },
    { id: '文创典籍', label: '文创典籍' },
  ];

  const filtered =
    selectedCategory === 'all'
      ? pointsProducts
      : pointsProducts.filter((p) => p.category === selectedCategory);

  const handleConfirmRedeem = () => {
    if (!redeemTarget) return;
    const res = redeemProduct(redeemTarget, shippingAddress);
    if (res.success) {
      showToast(res.message);
      setRedeemTarget(null);
      setActiveTab('orders'); // Jump to redemption orders tab so user sees their logistics tracking number
    } else {
      showToast(res.message);
    }
  };

  const handleCopyTracking = (trackingNo: string) => {
    navigator.clipboard.writeText(trackingNo);
    setCopiedTracking(trackingNo);
    showToast(`快递单号 ${trackingNo} 已复制！可至顺丰官网或微信小程序查询全程物流`);
    setTimeout(() => setCopiedTracking(null), 2500);
  };

  return (
    <div className="fixed inset-0 z-60 bg-black/75 backdrop-blur-sm flex justify-center items-end sm:items-center p-0 sm:p-4 animate-fadeIn">
      <div className="bg-[#FAF9F6] rounded-t-3xl sm:rounded-3xl w-full max-w-xl max-h-[92vh] overflow-y-auto shadow-2xl flex flex-col border border-[#EAE6DF]">
        {/* Sticky Header */}
        <div className="sticky top-0 z-20 bg-[#2C3E50] text-[#FAF9F6] px-5 py-3.5 flex items-center justify-between shadow-md border-b border-[#D4AF37]/30">
          <div className="flex items-center space-x-2.5">
            <Gift className="w-5 h-5 text-[#D4AF37]" />
            <div>
              <h3 className="font-serif italic font-bold text-base md:text-lg text-amber-50">
                老友名仕 · 积分礼遇商城
              </h3>
              <div className="text-xs text-stone-300 flex items-center gap-1.5 mt-0.5">
                <span>我的可用积分：</span>
                <span className="font-bold text-[#D4AF37] text-sm">{userProfile.points}</span>
                <span>分</span>
              </div>
            </div>
          </div>

          <button
            onClick={() => setIsPointsMallOpen(false)}
            className="w-8 h-8 rounded-full bg-black/20 hover:bg-black/40 flex items-center justify-center text-white transition-transform active:scale-95 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Top Navigation Tabs: Products vs My Logistics / Redemptions */}
        <div className="bg-stone-100 p-1.5 flex gap-1 border-b border-[#EAE6DF]">
          <button
            onClick={() => setActiveTab('products')}
            className={`flex-1 py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
              activeTab === 'products'
                ? 'bg-white text-[#2C3E50] shadow-xs border border-[#EAE6DF]'
                : 'text-stone-600 hover:text-[#2C3E50]'
            }`}
          >
            <Gift className="w-4 h-4 text-[#D4AF37]" />
            <span>甄选好物兑换</span>
          </button>

          <button
            onClick={() => setActiveTab('orders')}
            className={`flex-1 py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer relative ${
              activeTab === 'orders'
                ? 'bg-white text-[#2C3E50] shadow-xs border border-[#EAE6DF]'
                : 'text-stone-600 hover:text-[#2C3E50]'
            }`}
          >
            <Truck className="w-4 h-4 text-[#D4AF37]" />
            <span>我的兑换与快递单号</span>
            {pointsRedemptions.length > 0 && (
              <span className="bg-[#2C3E50] text-[#D4AF37] text-[10px] px-1.5 py-0.2 rounded-full font-serif font-bold">
                {pointsRedemptions.length}
              </span>
            )}
          </button>
        </div>

        {activeTab === 'products' ? (
          <>
            {/* Category Filter Chips - Fixed overflow & padding to prevent truncation */}
            <div className="px-4 py-2.5 bg-white border-b border-[#EAE6DF] flex items-center gap-2 overflow-x-auto no-scrollbar scroll-smooth">
              {categories.map((c) => (
                <button
                  key={c.id}
                  onClick={() => setSelectedCategory(c.id)}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-bold shrink-0 transition-all cursor-pointer ${
                    selectedCategory === c.id
                      ? 'bg-[#2C3E50] text-[#D4AF37] border border-[#D4AF37]/50 shadow-xs'
                      : 'bg-[#FAF9F6] text-stone-600 border border-[#EAE6DF] hover:border-stone-300 hover:text-stone-900'
                  }`}
                >
                  {c.label}
                </button>
              ))}
            </div>

            {/* Product Grid */}
            <div className="p-4 grid grid-cols-1 sm:grid-cols-2 gap-3.5 flex-1">
              {filtered.map((prod) => {
                const canAfford = userProfile.points >= prod.pointsCost;

                return (
                  <div
                    key={prod.id}
                    className="bg-white rounded-2xl p-3 border border-[#EAE6DF] shadow-xs flex flex-col justify-between space-y-3 hover:border-[#D4AF37]/40 transition-colors"
                  >
                    <div className="space-y-2">
                      <div className="relative aspect-[4/3] rounded-xl overflow-hidden bg-stone-100">
                        <img
                          src={prod.cover}
                          alt={prod.name}
                          className="w-full h-full object-cover"
                          loading="lazy"
                        />
                        <div className="absolute top-2 left-2 bg-[#2C3E50]/90 backdrop-blur-md text-[#D4AF37] text-[10px] px-2 py-0.5 rounded-full border border-[#D4AF37]/30 font-serif">
                          市价 ¥{prod.originalPrice}
                        </div>
                        <div className="absolute bottom-2 right-2 bg-black/60 backdrop-blur-md text-white text-[9px] px-1.5 py-0.5 rounded-full flex items-center gap-1">
                          <Truck className="w-2.5 h-2.5 text-emerald-400" />
                          <span>顺丰包邮</span>
                        </div>
                      </div>

                      <div>
                        <h4 className="font-serif italic font-bold text-xs md:text-sm text-[#2C3E50] line-clamp-1">
                          {prod.name}
                        </h4>
                        <p className="text-[11px] text-stone-500 line-clamp-2 mt-0.5">
                          {prod.description}
                        </p>
                      </div>
                    </div>

                    <div className="pt-2 border-t border-stone-100 flex items-center justify-between">
                      <div>
                        <div className="flex items-baseline gap-1 text-[#85660d] font-bold">
                          <Sparkles className="w-3.5 h-3.5 text-[#D4AF37]" />
                          <span className="text-base font-serif">{prod.pointsCost}</span>
                          <span className="text-[11px] text-stone-500 font-sans font-normal">积分</span>
                        </div>
                        <div className="text-[10px] text-stone-400">仅余 {prod.stock} 件</div>
                      </div>

                      <button
                        onClick={() => setRedeemTarget(prod)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all active:scale-95 shadow-xs cursor-pointer ${
                          canAfford
                            ? 'bg-[#2C3E50] hover:bg-[#1a252f] text-[#D4AF37] border border-[#D4AF37]/30'
                            : 'bg-stone-200 text-stone-500 hover:bg-stone-300'
                        }`}
                      >
                        {canAfford ? '立即兑换' : '积分不足'}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        ) : (
          /* Redemption Orders & Logistics Tracking */
          <div className="p-4 space-y-3.5 flex-1">
            <div className="bg-amber-50/80 rounded-2xl p-3 border border-amber-200 text-xs text-stone-700 flex items-start gap-2">
              <Truck className="w-4 h-4 text-[#85660d] shrink-0 mt-0.5" />
              <div>
                <div className="font-bold text-[#2C3E50]">积分礼遇顺丰全额包邮承诺</div>
                <div className="text-[11px] text-stone-500 mt-0.5">
                  所有礼遇均由平台专属定制并发货，配顺丰特快保价及防震礼盒，发货后将在此实时同步快递单号与派件轨迹。
                </div>
              </div>
            </div>

            {pointsRedemptions.length === 0 ? (
              <div className="text-center py-12 text-stone-400 space-y-2">
                <Package className="w-12 h-12 mx-auto text-stone-300 stroke-1" />
                <p className="text-xs">暂无礼品兑换记录</p>
                <button
                  onClick={() => setActiveTab('products')}
                  className="px-4 py-1.5 rounded-xl bg-[#2C3E50] text-[#D4AF37] text-xs font-bold"
                >
                  去逛积分礼遇
                </button>
              </div>
            ) : (
              pointsRedemptions.map((red) => {
                const statusMap: Record<string, { label: string; color: string }> = {
                  pending_shipment: { label: '仓库备货中', color: 'bg-amber-100 text-amber-800 border-amber-200' },
                  shipped: { label: '顺丰已发货', color: 'bg-blue-100 text-blue-800 border-blue-200' },
                  delivered: { label: '已签收', color: 'bg-emerald-100 text-emerald-800 border-emerald-200' },
                };
                const statusInfo = statusMap[red.status] || { label: '处理中', color: 'bg-stone-100 text-stone-700 border-stone-200' };

                return (
                  <div
                    key={red.id}
                    className="bg-white rounded-2xl p-3.5 border border-[#EAE6DF] shadow-xs space-y-3"
                  >
                    {/* Header info */}
                    <div className="flex items-center justify-between border-b border-stone-100 pb-2 text-xs">
                      <span className="text-stone-400 font-mono text-[11px]">
                        兑换单号：{red.redemptionNo}
                      </span>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${statusInfo.color}`}>
                        {statusInfo.label}
                      </span>
                    </div>

                    {/* Product & Points */}
                    <div className="flex space-x-3 items-center">
                      <img
                        src={red.productCover}
                        alt={red.productName}
                        className="w-16 h-16 rounded-xl object-cover border border-[#EAE6DF] shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="font-serif italic font-bold text-xs md:text-sm text-[#2C3E50] line-clamp-1">
                          {red.productName}
                        </div>
                        <div className="text-xs text-[#85660d] font-bold mt-1 flex items-center gap-1">
                          <Sparkles className="w-3 h-3 text-[#D4AF37]" />
                          <span>已抵扣 {red.pointsCost} 积分</span>
                        </div>
                        <div className="text-[10px] text-stone-400 mt-0.5">
                          兑换时间：{red.createdAt}
                        </div>
                      </div>
                    </div>

                    {/* Logistics Tracking Box */}
                    <div className="bg-[#FAF9F6] rounded-xl p-3 border border-[#EAE6DF] space-y-2 text-xs">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5 text-stone-700">
                          <Truck className="w-3.5 h-3.5 text-[#D4AF37]" />
                          <span className="font-bold text-[#2C3E50]">{red.courierName || '顺丰速运'}</span>
                          <span className="font-mono text-stone-600">{red.trackingNumber || '单号生成中'}</span>
                        </div>

                        {red.trackingNumber && (
                          <button
                            onClick={() => handleCopyTracking(red.trackingNumber!)}
                            className="flex items-center gap-1 text-[11px] text-[#85660d] bg-amber-50 hover:bg-amber-100 px-2 py-0.5 rounded-lg border border-amber-200 font-medium transition-all active:scale-95 cursor-pointer"
                          >
                            {copiedTracking === red.trackingNumber ? (
                              <Check className="w-3 h-3 text-emerald-600" />
                            ) : (
                              <Copy className="w-3 h-3" />
                            )}
                            <span>{copiedTracking === red.trackingNumber ? '已复制单号' : '复制单号'}</span>
                          </button>
                        )}
                      </div>

                      {/* Recipient Address */}
                      <div className="text-[11px] text-stone-500 flex items-start gap-1">
                        <MapPin className="w-3 h-3 text-stone-400 shrink-0 mt-0.5" />
                        <span>收货人：{red.recipientName}（{red.recipientPhone}）{red.shippingAddress}</span>
                      </div>

                      {/* Trace Logs preview */}
                      {red.logisticsTrace && red.logisticsTrace.length > 0 && (
                        <div className="pt-2 border-t border-stone-200/60">
                          <div className="text-[11px] font-medium text-[#2C3E50] flex items-center justify-between">
                            <span className="flex items-center gap-1">
                              <Clock className="w-3 h-3 text-[#D4AF37]" />
                              <span>最新物流动态：</span>
                            </span>
                            <button
                              onClick={() => setViewTraceItem(red)}
                              className="text-[#85660d] text-[10px] hover:underline flex items-center gap-0.5 cursor-pointer"
                            >
                              <span>查看完整轨迹</span>
                              <ChevronRight className="w-3 h-3" />
                            </button>
                          </div>
                          <div className="text-[10px] text-stone-600 mt-1 line-clamp-1 bg-white p-1.5 rounded-lg border border-stone-200/50">
                            <span className="font-mono text-stone-400 mr-1">{red.logisticsTrace[red.logisticsTrace.length - 1].time}</span>
                            <span>{red.logisticsTrace[red.logisticsTrace.length - 1].detail}</span>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}

        {/* SUB-MODAL: Redeem Confirmation */}
        {redeemTarget && (
          <div className="fixed inset-0 z-70 bg-black/75 flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl w-full max-w-sm p-5 space-y-4 shadow-2xl animate-fadeIn border border-[#EAE6DF]">
              <div className="flex items-center justify-between border-b border-stone-100 pb-2.5">
                <h4 className="font-serif italic font-bold text-[#2C3E50] text-base">
                  确认兑换礼品
                </h4>
                <button
                  onClick={() => setRedeemTarget(null)}
                  className="text-stone-400 hover:text-stone-700 cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="flex space-x-3 items-center bg-[#FAF9F6] p-3 rounded-2xl border border-[#EAE6DF]">
                <img
                  src={redeemTarget.cover}
                  alt={redeemTarget.name}
                  className="w-14 h-14 rounded-xl object-cover border border-[#EAE6DF]"
                />
                <div className="flex-1">
                  <div className="font-serif italic font-bold text-xs text-[#2C3E50] line-clamp-1">
                    {redeemTarget.name}
                  </div>
                  <div className="text-xs text-[#85660d] font-bold mt-0.5">
                    消耗 {redeemTarget.pointsCost} 积分
                  </div>
                </div>
              </div>

              {/* Shipping Address */}
              <div className="space-y-1.5 text-xs text-stone-700">
                <label className="font-bold flex items-center gap-1 text-[#2C3E50]">
                  <MapPin className="w-3.5 h-3.5 text-[#D4AF37]" />
                  <span>顺丰包邮配送地址：</span>
                </label>
                <textarea
                  rows={2}
                  value={shippingAddress}
                  onChange={(e) => setShippingAddress(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-stone-300 text-xs focus:outline-none focus:border-[#2C3E50]"
                />
              </div>

              <div className="flex items-center gap-1.5 text-[11px] text-[#2C3E50] bg-[#FAF9F6] p-2 rounded-xl border border-[#EAE6DF]">
                <Truck className="w-3.5 h-3.5 text-[#D4AF37] shrink-0" />
                <span>顺丰特快保价包邮，生成运单号后3个工作日内送达</span>
              </div>

              <div className="pt-2 flex space-x-2">
                <button
                  onClick={() => setRedeemTarget(null)}
                  className="flex-1 py-2.5 rounded-xl border border-stone-300 text-stone-700 text-xs font-semibold hover:bg-stone-50 cursor-pointer"
                >
                  取消
                </button>
                <button
                  onClick={handleConfirmRedeem}
                  disabled={userProfile.points < redeemTarget.pointsCost}
                  className="flex-1 py-2.5 rounded-xl bg-[#2C3E50] text-[#D4AF37] border border-[#D4AF37]/30 text-xs font-bold shadow-xs hover:bg-[#1a252f] cursor-pointer"
                >
                  确认扣减积分兑换
                </button>
              </div>
            </div>
          </div>
        )}

        {/* SUB-MODAL: Full Logistics Trace Detail */}
        {viewTraceItem && (
          <div className="fixed inset-0 z-70 bg-black/75 flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl w-full max-w-sm p-5 space-y-4 shadow-2xl animate-fadeIn border border-[#EAE6DF] max-h-[85vh] overflow-y-auto">
              <div className="flex items-center justify-between border-b border-stone-100 pb-2.5">
                <div className="flex items-center gap-2">
                  <Truck className="w-5 h-5 text-[#D4AF37]" />
                  <h4 className="font-serif italic font-bold text-[#2C3E50] text-sm">
                    顺丰速运 · 物流轨迹跟踪
                  </h4>
                </div>
                <button
                  onClick={() => setViewTraceItem(null)}
                  className="text-stone-400 hover:text-stone-700 cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="bg-[#FAF9F6] p-3 rounded-2xl border border-[#EAE6DF] text-xs space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-stone-500">快递单号：</span>
                  <span className="font-mono font-bold text-[#2C3E50]">{viewTraceItem.trackingNumber}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-stone-500">礼品名称：</span>
                  <span className="font-serif font-bold text-[#2C3E50] line-clamp-1">{viewTraceItem.productName}</span>
                </div>
              </div>

              {/* Step Timeline */}
              <div className="space-y-3 pl-2 relative border-l-2 border-[#D4AF37]/40 ml-2.5 py-1">
                {(viewTraceItem.logisticsTrace || []).map((step, idx) => (
                  <div key={idx} className="relative pl-4 space-y-0.5">
                    <div className="absolute -left-[17px] top-1 w-2.5 h-2.5 rounded-full bg-[#2C3E50] border-2 border-[#D4AF37]" />
                    <div className="font-bold text-xs text-[#2C3E50]">{step.title}</div>
                    <div className="text-[11px] text-stone-600">{step.detail}</div>
                    <div className="text-[9px] text-stone-400 font-mono">{step.time}</div>
                  </div>
                ))}
              </div>

              <button
                onClick={() => setViewTraceItem(null)}
                className="w-full py-2.5 rounded-xl bg-[#2C3E50] text-[#D4AF37] text-xs font-bold cursor-pointer"
              >
                关闭
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
