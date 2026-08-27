import React, { useState } from 'react';
import { X, Truck, Package, CheckCircle2, Clock, MapPin, Copy, Check } from 'lucide-react';
import { PointsRedemption } from '../../types';
import { useApp } from '../../context/AppContext';

interface LogisticsTrackingModalProps {
  isOpen: boolean;
  onClose: () => void;
  redemption: PointsRedemption | null;
}

export const LogisticsTrackingModal: React.FC<LogisticsTrackingModalProps> = ({
  isOpen,
  onClose,
  redemption,
}) => {
  const { updateRedemptionTracking, showToast } = useApp();

  const [courierName, setCourierName] = useState(redemption?.courierName || '顺丰速运');
  const [trackingNumber, setTrackingNumber] = useState(
    redemption?.trackingNumber || `SF${Date.now().toString().slice(-10)}`
  );
  const [status, setStatus] = useState<'pending_shipment' | 'shipped' | 'delivered'>(
    redemption?.status || 'shipped'
  );
  const [newTraceDetail, setNewTraceDetail] = useState('');

  if (!isOpen || !redemption) return null;

  const handleSave = () => {
    if (!trackingNumber.trim()) {
      showToast('请输入快递单号');
      return;
    }

    updateRedemptionTracking(
      redemption.id,
      courierName,
      trackingNumber.trim(),
      status,
      newTraceDetail.trim() ? newTraceDetail.trim() : undefined
    );

    showToast(`已成功为兑换单 ${redemption.redemptionNo} 更新物流与运单号信息！`);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-70 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 animate-fadeIn">
      <div className="bg-white text-slate-800 rounded-3xl w-full max-w-lg shadow-2xl flex flex-col border border-slate-200 overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center justify-center">
              <Truck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold font-serif text-slate-900">
                录入 / 更新积分礼品快递单号
              </h3>
              <p className="text-[11px] text-slate-500">
                兑换单号：{redemption.redemptionNo}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-600 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4 text-xs">
          {/* Target Product summary */}
          <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-2xl border border-slate-200">
            <img
              src={redemption.productCover}
              alt={redemption.productName}
              className="w-14 h-14 rounded-xl object-cover border border-slate-200 shrink-0"
            />
            <div>
              <div className="font-serif font-bold text-sm text-slate-900 line-clamp-1">
                {redemption.productName}
              </div>
              <div className="text-amber-700 font-bold text-xs mt-0.5">
                抵扣 {redemption.pointsCost} 积分
              </div>
              <div className="text-[11px] text-slate-500 mt-0.5">
                收货人：{redemption.recipientName} ({redemption.recipientPhone})
              </div>
            </div>
          </div>

          {/* Courier Selection */}
          <div className="space-y-1">
            <label className="font-bold text-slate-700">承运快递公司：</label>
            <select
              value={courierName}
              onChange={(e) => setCourierName(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-slate-800 focus:outline-none focus:border-emerald-600"
            >
              <option value="顺丰速运">顺丰速运 (SF Express · 推荐保价)</option>
              <option value="京东快递">京东快递 (JD Logistics)</option>
              <option value="中国邮政EMS">中国邮政 EMS 特快专递</option>
              <option value="德邦快递">德邦快递</option>
            </select>
          </div>

          {/* Tracking Number Input */}
          <div className="space-y-1">
            <label className="font-bold text-slate-800">快递运单号 (必填)：</label>
            <input
              type="text"
              value={trackingNumber}
              onChange={(e) => setTrackingNumber(e.target.value)}
              placeholder="例如：SF168892018899"
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm font-mono text-slate-900 focus:outline-none focus:border-emerald-600 font-bold"
            />
          </div>

          {/* Status */}
          <div className="space-y-1">
            <label className="font-bold text-slate-700">发货与物流状态：</label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: 'pending_shipment', label: '待发货备货' },
                { id: 'shipped', label: '已发货运输中' },
                { id: 'delivered', label: '已签收送达' },
              ].map((st) => (
                <button
                  key={st.id}
                  type="button"
                  onClick={() => setStatus(st.id as any)}
                  className={`py-2 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                    status === st.id
                      ? 'bg-emerald-50 text-emerald-800 border-emerald-300 shadow-xs'
                      : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  {st.label}
                </button>
              ))}
            </div>
          </div>

          {/* Append New Trace Entry */}
          <div className="space-y-1">
            <label className="font-bold text-slate-700">追加最新物流节点动态 (选填)：</label>
            <input
              type="text"
              value={newTraceDetail}
              onChange={(e) => setNewTraceDetail(e.target.value)}
              placeholder="例如：快件已到达【上海黄浦区分拨中心】，正在派送中"
              className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-emerald-600"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl border border-slate-300 text-slate-700 text-xs font-semibold hover:bg-slate-100 cursor-pointer"
          >
            取消
          </button>

          <button
            onClick={handleSave}
            className="px-5 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold shadow-xs transition-all active:scale-95 flex items-center gap-1 cursor-pointer"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>保存快递信息</span>
          </button>
        </div>
      </div>
    </div>
  );
};
