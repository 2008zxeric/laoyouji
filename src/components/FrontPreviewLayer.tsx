import React from 'react';
import { ArrowLeft, Smartphone } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { ActivityDetailModal } from './ActivityDetailModal';
import { EventDetailModal } from './EventDetailModal';

/**
 * 预览错误兜底：即使详情组件渲染崩溃，返回管理后台也永远可用
 */
class PreviewBoundary extends React.Component<any, { hasError: boolean }> {
  props: any;
  state: { hasError: boolean } = { hasError: false };
  static getDerivedStateFromError() {
    return { hasError: true };
  }
  render() {
    if (this.state.hasError) {
      return (
        <div className="fixed inset-0 z-[100] bg-[#F8F4EE] flex flex-col items-center justify-center gap-5 p-6">
          <div className="text-center space-y-2">
            <div className="text-4xl">🧭</div>
            <p className="text-stone-600 font-medium">预览内容渲染异常</p>
            <p className="text-xs text-stone-400">建议先到编辑页补全行程与费用信息</p>
          </div>
          <button
            onClick={this.props.onClose}
            className="flex items-center gap-1.5 px-5 py-2.5 rounded-full bg-[#D96C5A] hover:bg-[#C2553F] text-white text-sm font-bold shadow-lg transition-colors active:scale-95 cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            返回管理后台
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

/**
 * 后台页内完整前台预览层
 */
export const FrontPreviewLayer: React.FC = () => {
  const { previewTarget, closeFrontPreview } = useApp();
  if (!previewTarget) return null;
  const { activity, event } = previewTarget;

  return (
    <PreviewBoundary onClose={closeFrontPreview}>
      {event ? (
        <EventDetailModal event={event} onClose={closeFrontPreview} />
      ) : activity ? (
        <ActivityDetailModal activity={activity} onClose={closeFrontPreview} />
      ) : null}

      <div className="fixed bottom-4 right-4 z-[70] flex flex-col items-end gap-2">
        <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#2C3E50]/95 text-white text-xs font-bold shadow-lg border border-[#D4AF37]/60">
          <Smartphone className="w-3.5 h-3.5 text-[#D4AF37]" />
          H5 前台页面真实预览中
        </span>
        <button
          onClick={closeFrontPreview}
          className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-[#D96C5A] hover:bg-[#C2553F] text-white text-xs font-bold shadow-lg transition-colors active:scale-95 cursor-pointer"
          title="关闭预览，返回管理后台"
        >
          <ArrowLeft className="w-4 h-4" />
          返回管理后台
        </button>
      </div>
    </PreviewBoundary>
  );
};

export default FrontPreviewLayer;
