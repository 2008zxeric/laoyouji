import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  X,
  Star,
  Camera,
  Image as ImageIcon,
  CheckCircle2,
  Gift,
  Sparkles,
  Heart,
  ShieldCheck,
} from 'lucide-react';
import { useApp } from '../context/AppContext';

export const ReviewModal: React.FC = () => {
  const {
    isReviewModalOpen,
    closeWriteReview,
    reviewTargetActivity,
    submitReview,
    isLargeFont,
  } = useApp();

  const [rating, setRating] = useState<number>(5);
  const [content, setContent] = useState<string>('');
  const [images, setImages] = useState<string[]>([
    'https://images.unsplash.com/photo-1548013146-72479768bada?auto=format&fit=crop&w=400&q=80',
  ]);

  if (!isReviewModalOpen || !reviewTargetActivity) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;
    submitReview(reviewTargetActivity.id, rating, content.trim(), images);
  };

  const addSamplePhoto = () => {
    if (images.length >= 3) return;
    const samplePool = [
      'https://images.unsplash.com/photo-1584467541268-b040f83be3fd?auto=format&fit=crop&w=400&q=80',
      'https://images.unsplash.com/photo-1528702748617-c64d49f918af?auto=format&fit=crop&w=400&q=80',
      'https://images.unsplash.com/photo-1508804185872-d7badad00f7d?auto=format&fit=crop&w=400&q=80',
    ];
    setImages((prev) => [...prev, samplePool[prev.length % samplePool.length]]);
  };

  const removePhoto = (idx: number) => {
    setImages((prev) => prev.filter((_, i) => i !== idx));
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-stone-900/70 backdrop-blur-sm overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative w-full max-w-xl bg-stone-50 rounded-2xl sm:rounded-3xl shadow-2xl overflow-hidden border border-stone-200 my-4 max-h-[92vh] flex flex-col"
        >
          {/* Header */}
          <div className="bg-stone-900 text-stone-100 p-5 relative shrink-0">
            <button
              onClick={closeWriteReview}
              className="absolute top-4 right-4 p-2 rounded-full bg-stone-800 hover:bg-stone-700 text-stone-300 hover:text-white transition-colors"
              aria-label="关闭"
            >
              <X className="w-5 h-5" />
            </button>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/20 border border-amber-400/40 text-amber-300 text-xs font-medium mb-2">
              <Gift className="w-3.5 h-3.5" />
              <span>评价审核通过立得 50 积分 · 晒图再赠 50 积分</span>
            </div>
            <h2 className={`font-serif font-bold text-amber-200 ${isLargeFont ? 'text-xl sm:text-2xl' : 'text-lg sm:text-xl'}`}>
              老友出游真实点评与晒图
            </h2>
            <p className="text-stone-300 text-xs truncate mt-0.5">
              行程：{reviewTargetActivity.title}
            </p>
          </div>

          {/* Form Content */}
          <form onSubmit={handleSubmit} className="p-4 sm:p-6 overflow-y-auto space-y-4 flex-1">
            {/* Star Rating */}
            <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-sm text-center">
              <div className="text-xs text-stone-500 font-medium mb-2">为本次出游体验打分 (适老标准)</div>
              <div className="flex items-center justify-center gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    className="p-1 hover:scale-110 transition-transform"
                  >
                    <Star
                      className={`w-8 h-8 ${
                        star <= rating
                          ? 'text-amber-500 fill-amber-500'
                          : 'text-stone-300'
                      }`}
                    />
                  </button>
                ))}
              </div>
              <div className="text-xs font-bold text-amber-800 mt-2">
                {rating === 5 ? '五星极佳 · 慢节奏无负担，学者讲得好，医护周到' : `${rating} 星体验`}
              </div>
            </div>

            {/* Textarea */}
            <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-sm space-y-2">
              <label className="block text-xs font-medium text-stone-700">
                出游心得与老友寄语 <span className="text-stone-400 font-normal">(分享您的真实感受)</span>
              </label>
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="说说学者老师的讲解、大巴车的舒适度、随团医护的照顾或是晚上打掼蛋的趣事吧..."
                rows={4}
                required
                className="w-full p-3 bg-stone-50 border border-stone-200 rounded-xl text-sm focus:outline-none focus:border-amber-600 focus:bg-white resize-none text-stone-800"
              />
              <div className="flex justify-between items-center text-xs text-stone-400">
                <span>真实点评将展示在活动详情页中帮助其他老友参考</span>
                <span>{content.length} 字</span>
              </div>
            </div>

            {/* Photo Attachments */}
            <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-sm space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-xs font-medium text-stone-700 flex items-center gap-1.5">
                  <Camera className="w-4 h-4 text-amber-700" />
                  <span>添加游玩美照 <span className="text-amber-700 font-bold">(晒图额外赠 +50 积分)</span></span>
                </label>
                <span className="text-xs text-stone-400">{images.length}/3 张</span>
              </div>

              <div className="flex items-center gap-3 flex-wrap">
                {images.map((img, idx) => (
                  <div key={idx} className="relative w-20 h-20 rounded-xl overflow-hidden border border-stone-200 group">
                    <img src={img} alt="出游照片" className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => removePhoto(idx)}
                      className="absolute top-1 right-1 p-1 bg-stone-900/80 rounded-full text-white hover:bg-rose-600 transition-colors"
                      title="移除照片"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}

                {images.length < 3 && (
                  <button
                    type="button"
                    onClick={addSamplePhoto}
                    className="w-20 h-20 rounded-xl border-2 border-dashed border-stone-300 hover:border-amber-500 bg-stone-50 flex flex-col items-center justify-center text-stone-400 hover:text-amber-700 text-xs gap-1 transition-colors"
                  >
                    <ImageIcon className="w-5 h-5" />
                    <span>添加照片</span>
                  </button>
                )}
              </div>
            </div>

            {/* Reward summary reminder */}
            <div className="bg-amber-50 border border-amber-200/80 rounded-xl p-3 flex items-center justify-between text-xs text-amber-950">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-600" />
                <span>本次评价预计可获得：</span>
              </div>
              <span className="font-bold text-amber-800 text-sm">
                +{images.length > 0 ? '100' : '50'} 积分 (可抵 ¥{images.length > 0 ? '1.0' : '0.5'} 元)
              </span>
            </div>

            {/* Footer Buttons */}
            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={closeWriteReview}
                className="flex-1 py-2.5 rounded-xl border border-stone-300 text-stone-700 text-sm font-medium hover:bg-stone-100 transition-colors"
              >
                取消
              </button>
              <button
                type="submit"
                disabled={!content.trim()}
                className="flex-1 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 disabled:opacity-50 text-white text-sm font-medium transition-colors shadow-sm"
              >
                提交评价审核
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
