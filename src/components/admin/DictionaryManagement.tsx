import React, { useState, useMemo } from 'react';
import {
  BookOpen,
  Plus,
  Search,
  Edit2,
  Trash2,
  CheckCircle2,
  XCircle,
  Tag,
  Compass,
  Layers,
  HeartHandshake,
  Trophy,
  Building2,
  Award,
  Sparkles,
  ArrowUpDown,
  Filter,
  Check,
  AlertCircle,
  HelpCircle,
  Palette,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { DictCategory, DictItem } from '../../types';

const COLOR_OPTIONS = [
  { label: '翡翠绿 (Emerald)', value: 'emerald', bg: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  { label: '暖琥珀 (Amber)', value: 'amber', bg: 'bg-amber-50 text-amber-700 border-amber-200' },
  { label: '霁蓝青 (Blue)', value: 'blue', bg: 'bg-blue-50 text-blue-700 border-blue-200' },
  { label: '朱砂红 (Rose)', value: 'rose', bg: 'bg-rose-50 text-rose-700 border-rose-200' },
  { label: '靛青紫 (Indigo)', value: 'indigo', bg: 'bg-indigo-50 text-indigo-700 border-indigo-200' },
  { label: '暮色紫 (Purple)', value: 'purple', bg: 'bg-purple-50 text-purple-700 border-purple-200' },
  { label: '松石青 (Teal)', value: 'teal', bg: 'bg-teal-50 text-teal-700 border-teal-200' },
  { label: '青石蓝 (Cyan)', value: 'cyan', bg: 'bg-cyan-50 text-cyan-700 border-cyan-200' },
];

export const DictionaryManagement: React.FC = () => {
  const {
    dictCategories,
    dictItems,
    addDictCategory,
    updateDictCategory,
    deleteDictCategory,
    addDictItem,
    updateDictItem,
    deleteDictItem,
    toggleDictItemStatus,
    showToast,
    hasPermission,
  } = useApp();

  const canManageDict = hasPermission('dictionaries.manage');

  const [selectedCategoryCode, setSelectedCategoryCode] = useState<string>('trip_forms');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'disabled'>('all');

  // Modals
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<DictCategory | null>(null);
  const [categoryForm, setCategoryForm] = useState<{ code: string; name: string; description: string; icon: string }>({
    code: '',
    name: '',
    description: '',
    icon: 'Layers',
  });

  const [isItemModalOpen, setIsItemModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<DictItem | null>(null);
  const [itemForm, setItemForm] = useState<{
    code: string;
    name: string;
    categoryCode: string;
    sort: number;
    color: string;
    description: string;
    status: 'active' | 'disabled';
  }>({
    code: '',
    name: '',
    categoryCode: 'trip_forms',
    sort: 1,
    color: 'emerald',
    description: '',
    status: 'active',
  });

  const activeCategory = useMemo(() => {
    return dictCategories.find((c) => c.code === selectedCategoryCode) || dictCategories[0];
  }, [dictCategories, selectedCategoryCode]);

  const currentCategoryItems = useMemo(() => {
    if (!activeCategory) return [];
    return dictItems
      .filter((i) => i.categoryCode === activeCategory.code)
      .filter((i) => {
        if (filterStatus !== 'all' && i.status !== filterStatus) return false;
        if (searchTerm.trim()) {
          const matchName = i.name.toLowerCase().includes(searchTerm.toLowerCase());
          const matchCode = i.code.toLowerCase().includes(searchTerm.toLowerCase());
          const matchDesc = (i.description || '').toLowerCase().includes(searchTerm.toLowerCase());
          return matchName || matchCode || matchDesc;
        }
        return true;
      })
      .sort((a, b) => a.sort - b.sort);
  }, [dictItems, activeCategory, filterStatus, searchTerm]);

  // Open Category Create/Edit
  const handleOpenCategoryModal = (cat?: DictCategory) => {
    if (cat) {
      setEditingCategory(cat);
      setCategoryForm({
        code: cat.code,
        name: cat.name,
        description: cat.description,
        icon: cat.icon || 'Layers',
      });
    } else {
      setEditingCategory(null);
      setCategoryForm({
        code: '',
        name: '',
        description: '',
        icon: 'Layers',
      });
    }
    setIsCategoryModalOpen(true);
  };

  const handleSaveCategory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!categoryForm.name.trim()) {
      showToast('请输入字典类型名称');
      return;
    }
    if (!categoryForm.code.trim()) {
      showToast('请输入字典类型编码 (仅英文字母/下划线)');
      return;
    }

    if (editingCategory) {
      updateDictCategory(editingCategory.id, {
        name: categoryForm.name,
        description: categoryForm.description,
        icon: categoryForm.icon,
      });
    } else {
      // Check duplicate code
      if (dictCategories.some((c) => c.code === categoryForm.code)) {
        showToast('字典编码已存在，请使用唯一编码');
        return;
      }
      addDictCategory({
        code: categoryForm.code,
        name: categoryForm.name,
        description: categoryForm.description,
        isSystem: false,
        icon: categoryForm.icon,
      });
      setSelectedCategoryCode(categoryForm.code);
    }
    setIsCategoryModalOpen(false);
  };

  // Open Item Create/Edit
  const handleOpenItemModal = (item?: DictItem) => {
    if (item) {
      setEditingItem(item);
      setItemForm({
        code: item.code,
        name: item.name,
        categoryCode: item.categoryCode,
        sort: item.sort,
        color: item.color || 'emerald',
        description: item.description || '',
        status: item.status,
      });
    } else {
      setEditingItem(null);
      const maxSort = currentCategoryItems.reduce((max, cur) => Math.max(max, cur.sort), 0);
      setItemForm({
        code: '',
        name: '',
        categoryCode: activeCategory?.code || 'trip_forms',
        sort: maxSort + 1,
        color: 'emerald',
        description: '',
        status: 'active',
      });
    }
    setIsItemModalOpen(true);
  };

  const handleSaveItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!itemForm.name.trim()) {
      showToast('请输入字典项显示名称');
      return;
    }
    if (!itemForm.code.trim()) {
      showToast('请输入字典项编码');
      return;
    }

    if (editingItem) {
      updateDictItem(editingItem.id, {
        name: itemForm.name,
        code: itemForm.code,
        sort: Number(itemForm.sort),
        color: itemForm.color,
        description: itemForm.description,
        status: itemForm.status,
      });
    } else {
      addDictItem({
        name: itemForm.name,
        code: itemForm.code,
        categoryCode: activeCategory.code,
        sort: Number(itemForm.sort),
        color: itemForm.color,
        description: itemForm.description,
        status: itemForm.status,
        isDefault: false,
      });
    }
    setIsItemModalOpen(false);
  };

  const getCategoryIcon = (code: string) => {
    switch (code) {
      case 'trip_forms':
        return <Compass className="w-4 h-4" />;
      case 'tags':
        return <Tag className="w-4 h-4" />;
      case 'activity_categories':
        return <Layers className="w-4 h-4" />;
      case 'senior_care_services':
        return <HeartHandshake className="w-4 h-4" />;
      case 'tournament_categories':
        return <Trophy className="w-4 h-4" />;
      case 'merchant_types':
        return <Building2 className="w-4 h-4" />;
      case 'member_perk_types':
        return <Award className="w-4 h-4" />;
      default:
        return <BookOpen className="w-4 h-4" />;
    }
  };

  const renderColorBadge = (colorName: string, text: string) => {
    const matched = COLOR_OPTIONS.find((c) => c.value === colorName) || COLOR_OPTIONS[0];
    return (
      <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-semibold border ${matched.bg}`}>
        {text}
      </span>
    );
  };

  return (
    <div id="dictionary-management-root" className="space-y-6">
      {/* Top Header Card */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200/90 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 bg-emerald-50 text-emerald-700 rounded-xl border border-emerald-200">
              <BookOpen className="w-5 h-5" />
            </span>
            <h2 className="text-xl font-bold text-slate-800">业务数据字典与标签库管理</h2>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200">
              共 {dictCategories.length} 个字典大类 · {dictItems.length} 个配置项
            </span>
          </div>
          <p className="text-sm text-slate-500 mt-1.5 leading-relaxed">
            集中维护适老行程形态（观光、体验、研学、赛事、旅居、社交）、前台标签库、主题品类及适老化保障服务项。支持动态增删改查与排序。
          </p>
        </div>

        <div className="flex items-center gap-3">
          {canManageDict && (
            <>
              <button
                id="btn-add-dict-category"
                onClick={() => handleOpenCategoryModal()}
                className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-medium transition-colors flex items-center gap-1.5 border border-slate-200 cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                新增字典类型
              </button>
              <button
                id="btn-add-dict-item"
                onClick={() => handleOpenItemModal()}
                className="px-4 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-sm font-medium shadow-sm transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                在【{activeCategory?.name || '当前类'}】下新增字典项
              </button>
            </>
          )}
        </div>
      </div>

      {/* Main Grid: Left Categories List, Right Items List */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Dictionary Categories */}
        <div className="lg:col-span-4 space-y-3">
          <div className="bg-white rounded-2xl p-4 border border-slate-200/90 shadow-xs">
            <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-100">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">字典大类分类</span>
              <span className="text-xs text-slate-400">点击切换查看</span>
            </div>

            <div className="space-y-1.5">
              {dictCategories.map((cat) => {
                const isSelected = selectedCategoryCode === cat.code;
                const count = dictItems.filter((i) => i.categoryCode === cat.code).length;
                return (
                  <div
                    key={cat.id}
                    onClick={() => setSelectedCategoryCode(cat.code)}
                    className={`group w-full p-3 rounded-xl transition-all flex items-center justify-between cursor-pointer border ${
                      isSelected
                        ? 'bg-emerald-50/80 border-emerald-300 text-emerald-900 shadow-xs'
                        : 'bg-white hover:bg-slate-50/80 border-transparent hover:border-slate-200 text-slate-700'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div
                        className={`p-2 rounded-lg ${
                          isSelected ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-600 group-hover:bg-slate-200'
                        }`}
                      >
                        {getCategoryIcon(cat.code)}
                      </div>
                      <div className="truncate text-left">
                        <div className="text-sm font-semibold truncate flex items-center gap-1.5">
                          {cat.name}
                          {cat.isSystem && (
                            <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-200/60 text-slate-600">
                              核心
                            </span>
                          )}
                        </div>
                        <div className="text-xs text-slate-400 truncate mt-0.5">code: {cat.code}</div>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      <span
                        className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                          isSelected
                            ? 'bg-emerald-200/70 text-emerald-800'
                            : 'bg-slate-100 text-slate-500 group-hover:bg-slate-200'
                        }`}
                      >
                        {count} 项
                      </span>
                      {canManageDict && !cat.isSystem && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            if (window.confirm(`确定删除自定义字典【${cat.name}】及其全部字典项吗？`)) {
                              deleteDictCategory(cat.id);
                            }
                          }}
                          className="opacity-0 group-hover:opacity-100 p-1 hover:text-rose-600 text-slate-400 transition-opacity"
                          title="删除字典分类"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Quick Notice Card */}
          <div className="bg-amber-50/70 border border-amber-200/80 rounded-2xl p-4 text-xs text-amber-800 space-y-1.5">
            <div className="font-semibold flex items-center gap-1.5 text-amber-900">
              <Sparkles className="w-4 h-4 text-amber-600" />
              业务联动说明
            </div>
            <p className="leading-relaxed">
              此处维护的<strong>「行程形态」</strong>与<strong>「标签库」</strong>
              将实时注入到活动录入、AI预录解析、前台多维度筛选及海报生成的下拉字典项中。
            </p>
          </div>
        </div>

        {/* Right Column: Dictionary Items Details Table */}
        <div className="lg:col-span-8 space-y-4">
          <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-xs space-y-4">
            {/* Header info of active category */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-lg font-bold text-slate-800">{activeCategory?.name}</h3>
                  <span className="text-xs px-2 py-0.5 rounded bg-slate-100 text-slate-600 font-mono">
                    {activeCategory?.code}
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-1">{activeCategory?.description}</p>
              </div>

              {/* Filters */}
              <div className="flex items-center gap-2">
                <div className="relative">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="搜索名称或编码..."
                    className="pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white w-36 sm:w-48"
                  />
                </div>

                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value as any)}
                  className="px-2.5 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-700 focus:outline-none"
                >
                  <option value="all">全部状态</option>
                  <option value="active">已启用</option>
                  <option value="disabled">已停用</option>
                </select>
              </div>
            </div>

            {/* Items Table */}
            <div className="overflow-x-auto rounded-xl border border-slate-100">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-50/80 text-slate-500 border-b border-slate-200/80 font-medium">
                    <th className="py-3 px-3 w-14 text-center">排序</th>
                    <th className="py-3 px-4">字典项显示名称</th>
                    <th className="py-3 px-3">唯一编码 (Code)</th>
                    <th className="py-3 px-3">标签预览色</th>
                    <th className="py-3 px-4">业务描述 / 备注</th>
                    <th className="py-3 px-3 text-center">状态</th>
                    <th className="py-3 px-3 text-right">操作</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {currentCategoryItems.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-12 text-center text-slate-400">
                        <div className="flex flex-col items-center justify-center gap-2">
                          <BookOpen className="w-8 h-8 text-slate-300 stroke-1" />
                          <span>暂无匹配的字典项</span>
                          {canManageDict && (
                            <button
                              onClick={() => handleOpenItemModal()}
                              className="mt-1 text-xs text-emerald-600 hover:text-emerald-700 underline font-medium"
                            >
                              立即添加第一项
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ) : (
                    currentCategoryItems.map((item) => (
                      <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-3 px-3 text-center font-mono text-slate-500 font-semibold">{item.sort}</td>
                        <td className="py-3 px-4 font-semibold text-slate-800">
                          <div className="flex items-center gap-1.5">
                            {item.name}
                            {item.isDefault && (
                              <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-100 text-slate-500 font-normal">
                                预置
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="py-3 px-3 font-mono text-slate-600">{item.code}</td>
                        <td className="py-3 px-3">{renderColorBadge(item.color || 'emerald', item.name)}</td>
                        <td className="py-3 px-4 text-slate-500 max-w-xs truncate" title={item.description}>
                          {item.description || '-'}
                        </td>
                        <td className="py-3 px-3 text-center">
                          <button
                            onClick={() => canManageDict && toggleDictItemStatus(item.id)}
                            disabled={!canManageDict}
                            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium transition-colors ${
                              item.status === 'active'
                                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                : 'bg-slate-100 text-slate-400 border border-slate-200'
                            }`}
                          >
                            {item.status === 'active' ? (
                              <>
                                <CheckCircle2 className="w-3 h-3 text-emerald-600" /> 启用中
                              </>
                            ) : (
                              <>
                                <XCircle className="w-3 h-3 text-slate-400" /> 已停用
                              </>
                            )}
                          </button>
                        </td>
                        <td className="py-3 px-3 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            {canManageDict && (
                              <>
                                <button
                                  onClick={() => handleOpenItemModal(item)}
                                  className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-600 hover:text-emerald-700 transition-colors"
                                  title="编辑字典项"
                                >
                                  <Edit2 className="w-3.5 h-3.5" />
                                </button>
                                {!item.isDefault && (
                                  <button
                                    onClick={() => {
                                      if (window.confirm(`确定删除字典项【${item.name}】吗？`)) {
                                        deleteDictItem(item.id);
                                      }
                                    }}
                                    className="p-1.5 hover:bg-rose-50 rounded-lg text-slate-400 hover:text-rose-600 transition-colors"
                                    title="删除"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                )}
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            <div className="flex items-center justify-between text-xs text-slate-400 pt-2">
              <span>展示当前分类共 {currentCategoryItems.length} 条数据</span>
              <span>字典项按【排序】数值由小到大排列</span>
            </div>
          </div>
        </div>
      </div>

      {/* Modal: Add / Edit Dictionary Category */}
      {isCategoryModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-slate-200 space-y-5 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-slate-800">
                {editingCategory ? '编辑字典分类' : '新建字典分类大类'}
              </h3>
              <button
                onClick={() => setIsCategoryModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 text-lg"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveCategory} className="space-y-4 text-xs">
              <div>
                <label className="block font-medium text-slate-700 mb-1">字典类型名称 *</label>
                <input
                  type="text"
                  required
                  placeholder="如：出游交通方式、特色餐饮口味"
                  value={categoryForm.name}
                  onChange={(e) => setCategoryForm({ ...categoryForm, name: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">唯一类型编码 (Code) *</label>
                <input
                  type="text"
                  required
                  disabled={!!editingCategory}
                  placeholder="如：transport_types, meal_flavors"
                  value={categoryForm.code}
                  onChange={(e) => setCategoryForm({ ...categoryForm, code: e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, '') })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none font-mono disabled:bg-slate-100"
                />
                <p className="text-[11px] text-slate-400 mt-1">仅支持小写字母与下划线，创建后不可修改编码</p>
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">业务用途说明</label>
                <textarea
                  rows={3}
                  placeholder="说明此字典在系统中的业务场景和关联模块..."
                  value={categoryForm.description}
                  onChange={(e) => setCategoryForm({ ...categoryForm, description: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none resize-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsCategoryModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium"
                >
                  取消
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-medium shadow-sm"
                >
                  保存
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Add / Edit Dictionary Item */}
      {isItemModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-xl border border-slate-200 space-y-5 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-base font-bold text-slate-800">
                  {editingItem ? '编辑字典项' : `在【${activeCategory?.name}】中新增字典项`}
                </h3>
                <span className="text-xs text-slate-400 font-mono">归属分类: {activeCategory?.code}</span>
              </div>
              <button
                onClick={() => setIsItemModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 text-lg"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveItem} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-slate-700 mb-1">显示名称 (中文) *</label>
                  <input
                    type="text"
                    required
                    placeholder="如：观光游、名师随团"
                    value={itemForm.name}
                    onChange={(e) => setItemForm({ ...itemForm, name: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none font-medium"
                  />
                </div>

                <div>
                  <label className="block font-medium text-slate-700 mb-1">项标识码 (Code) *</label>
                  <input
                    type="text"
                    required
                    placeholder="如：sightseeing, study"
                    value={itemForm.code}
                    onChange={(e) => setItemForm({ ...itemForm, code: e.target.value.replace(/[^a-zA-Z0-9_-]/g, '') })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-slate-700 mb-1">排序权重 (越小越靠前)</label>
                  <input
                    type="number"
                    min={1}
                    max={999}
                    value={itemForm.sort}
                    onChange={(e) => setItemForm({ ...itemForm, sort: Number(e.target.value) })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-medium text-slate-700 mb-1">启用状态</label>
                  <select
                    value={itemForm.status}
                    onChange={(e) => setItemForm({ ...itemForm, status: e.target.value as any })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none bg-white"
                  >
                    <option value="active">启用 (正常展示)</option>
                    <option value="disabled">停用 (隐藏不选)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">视觉标签色彩风格</label>
                <div className="grid grid-cols-4 gap-2">
                  {COLOR_OPTIONS.map((c) => {
                    const isSelected = itemForm.color === c.value;
                    return (
                      <button
                        type="button"
                        key={c.value}
                        onClick={() => setItemForm({ ...itemForm, color: c.value })}
                        className={`p-2 rounded-xl border text-center transition-all flex items-center justify-between text-xs cursor-pointer ${
                          c.bg
                        } ${isSelected ? 'ring-2 ring-slate-800 font-bold shadow-xs' : 'opacity-80 hover:opacity-100'}`}
                      >
                        <span className="truncate">{c.label.split(' ')[0]}</span>
                        {isSelected && <Check className="w-3.5 h-3.5 ml-1 shrink-0" />}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Tag Preview Box */}
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
                <span className="text-slate-500 text-xs">前台标签渲染预览：</span>
                {renderColorBadge(itemForm.color, itemForm.name || '标签预览文案')}
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">业务说明 / 适老化保障细节</label>
                <textarea
                  rows={3}
                  placeholder="输入此项在活动或适老行程中的标准说明..."
                  value={itemForm.description}
                  onChange={(e) => setItemForm({ ...itemForm, description: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none resize-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsItemModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium"
                >
                  取消
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-medium shadow-sm"
                >
                  保存字典项
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
