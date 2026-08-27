import React, { useState, useMemo } from 'react';
import {
  ShieldCheck,
  ShieldAlert,
  UserCheck,
  Users,
  Plus,
  Edit,
  Trash2,
  CheckCircle2,
  XCircle,
  Key,
  Lock,
  Unlock,
  Check,
  Search,
  Building2,
  Phone,
  Clock,
  Sparkles,
  Layers,
  ArrowRight,
  AlertTriangle,
  Info,
  Sliders,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { AdminUser, AdminRoleType } from '../../types';
import {
  ALL_SYSTEM_PERMISSIONS,
  getDefaultPermissionsByRole,
} from '../../data/dictionariesData';

const ROLE_DEFINITIONS: {
  role: AdminRoleType;
  title: string;
  badge: string;
  badgeBg: string;
  desc: string;
  scope: string;
}[] = [
  {
    role: 'superAdmin',
    title: '超级管理员 (全部权限)',
    badge: '超级管理员 · 最高全权',
    badgeBg: 'bg-rose-50 text-rose-700 border-rose-200',
    desc: '享有系统最高管理权限，包括所有业务模块、底层系统配置与积分系数修改、管理员权限分配。',
    scope: '全部功能与配置 (100%)',
  },
  {
    role: 'admin',
    title: '管理员 (除系统设置)',
    badge: '管理员 · 业务总管',
    badgeBg: 'bg-amber-50 text-amber-700 border-amber-200',
    desc: '掌管全部业务运营功能（活动、赛事、订单、会员、营销、商城、审核、客服、字典等），除底层敏感系统参数与账号分配。',
    scope: '全部业务模块 (除底层系统设置)',
  },
  {
    role: 'operations',
    title: '运营员 (业务综合运营)',
    badge: '运营员 · 业务强关联',
    badgeBg: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    desc: '专注活动录入与排班、赛事报名、订单履约、会员积分调账、免费营销方案、文创发货与评价审核等全链路运营。',
    scope: '活动 / 赛事 / 订单 / 会员 / 积分 / 商城 / 营销',
  },
  {
    role: 'operator',
    title: '操作员 (按子类细分子权限)',
    badge: '操作员 · 细分子项配置',
    badgeBg: 'bg-blue-50 text-blue-700 border-blue-200',
    desc: '自定义细分权限（例如：仅能录入发布活动，或仅能发货填快递单，或仅能查看订单），勾选几项就赋予几项精确权限。',
    scope: '按勾选细分权限动态判定 (灵活可控)',
  },
];

export const AdminRolesManagement: React.FC = () => {
  const {
    adminUsers,
    currentAdminUser,
    setCurrentAdminUser,
    addAdminUser,
    updateAdminUser,
    deleteAdminUser,
    showToast,
    hasPermission,
  } = useApp();

  const isSuperAdmin = currentAdminUser.role === 'superAdmin';
  const canManageAdmins = hasPermission('admins.manage');

  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState<string>('all');

  // Modals
  const [isUserModalOpen, setIsUserModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<AdminUser | null>(null);

  // Form State
  const [userForm, setUserForm] = useState<{
    name: string;
    account: string;
    phone: string;
    department: string;
    role: AdminRoleType;
    status: 'active' | 'disabled';
    note: string;
    permissions: string[];
  }>({
    name: '',
    account: '',
    phone: '',
    department: '路线研发部 · 资料采编组',
    role: 'operator',
    status: 'active',
    note: '',
    permissions: ['activities.view', 'activities.create', 'activities.edit'],
  });

  // Grouped system permissions by category for the checkboxes
  const permissionCategories = useMemo(() => {
    const map = new Map<string, typeof ALL_SYSTEM_PERMISSIONS>();
    ALL_SYSTEM_PERMISSIONS.forEach((p) => {
      const list = map.get(p.category) || [];
      list.push(p);
      map.set(p.category, list);
    });
    return Array.from(map.entries()).map(([category, items]) => ({ category, items }));
  }, []);

  const filteredUsers = useMemo(() => {
    return adminUsers.filter((u) => {
      if (filterRole !== 'all' && u.role !== filterRole) return false;
      if (searchTerm.trim()) {
        const matchName = u.name.toLowerCase().includes(searchTerm.toLowerCase());
        const matchAccount = u.account.toLowerCase().includes(searchTerm.toLowerCase());
        const matchDept = (u.department || '').toLowerCase().includes(searchTerm.toLowerCase());
        const matchPhone = u.phone.includes(searchTerm);
        return matchName || matchAccount || matchDept || matchPhone;
      }
      return true;
    });
  }, [adminUsers, filterRole, searchTerm]);

  // Open Modal to Add/Edit User
  const handleOpenUserModal = (user?: AdminUser) => {
    if (user) {
      setEditingUser(user);
      setUserForm({
        name: user.name,
        account: user.account,
        phone: user.phone,
        department: user.department || '',
        role: user.role,
        status: user.status,
        note: user.note || '',
        permissions: user.permissions || getDefaultPermissionsByRole(user.role),
      });
    } else {
      setEditingUser(null);
      setUserForm({
        name: '',
        account: '',
        phone: '',
        department: '路线研发部 · 资料采编组',
        role: 'operator',
        status: 'active',
        note: '',
        permissions: ['activities.view', 'activities.create', 'activities.edit'],
      });
    }
    setIsUserModalOpen(true);
  };

  // Handle Role Change in Form
  const handleRoleChange = (role: AdminRoleType) => {
    setUserForm((prev) => ({
      ...prev,
      role,
      permissions: getDefaultPermissionsByRole(role),
    }));
  };

  // Toggle single permission checkbox
  const handleTogglePermission = (permId: string) => {
    setUserForm((prev) => {
      const exists = prev.permissions.includes(permId);
      const newPerms = exists ? prev.permissions.filter((p) => p !== permId) : [...prev.permissions, permId];
      return {
        ...prev,
        permissions: newPerms,
      };
    });
  };

  // Select all in category
  const handleToggleCategory = (perms: typeof ALL_SYSTEM_PERMISSIONS) => {
    setUserForm((prev) => {
      const allSelected = perms.every((p) => prev.permissions.includes(p.id));
      let newPerms: string[];
      if (allSelected) {
        // remove all in category
        const removeIds = new Set(perms.map((p) => p.id));
        newPerms = prev.permissions.filter((p) => !removeIds.has(p));
      } else {
        // add all in category
        const addIds = perms.map((p) => p.id);
        newPerms = Array.from(new Set([...prev.permissions, ...addIds]));
      }
      return {
        ...prev,
        permissions: newPerms,
      };
    });
  };

  const handleSaveUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!userForm.name.trim()) {
      showToast('请输入姓名');
      return;
    }
    if (!userForm.account.trim()) {
      showToast('请输入登录账号');
      return;
    }

    if (editingUser) {
      updateAdminUser(editingUser.id, {
        name: userForm.name,
        account: userForm.account,
        phone: userForm.phone,
        department: userForm.department,
        role: userForm.role,
        status: userForm.status,
        note: userForm.note,
        permissions: userForm.permissions,
      });
    } else {
      if (adminUsers.some((u) => u.account === userForm.account)) {
        showToast('该登录账号已存在，请换一个');
        return;
      }
      addAdminUser({
        name: userForm.name,
        account: userForm.account,
        phone: userForm.phone,
        department: userForm.department,
        role: userForm.role,
        status: userForm.status,
        lastLogin: '从未登录',
        note: userForm.note,
        permissions: userForm.permissions,
      });
    }
    setIsUserModalOpen(false);
  };

  const getRoleBadge = (role: AdminRoleType) => {
    const found = ROLE_DEFINITIONS.find((r) => r.role === role) || ROLE_DEFINITIONS[3];
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${found.badgeBg}`}>
        {found.badge.split(' · ')[0]}
      </span>
    );
  };

  return (
    <div id="admin-roles-management-root" className="space-y-6">
      {/* Current Logged-in Simulator & Header Card */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200/90 shadow-xs space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-indigo-50 text-indigo-700 rounded-xl border border-indigo-200">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold text-slate-800">管理员权限与角色分级管理</h2>
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200">
                  共 {adminUsers.length} 位后台人员
                </span>
              </div>
              <p className="text-sm text-slate-500 mt-1">
                支持<strong>超级管理员</strong>、<strong>管理员</strong>、<strong>运营员</strong>与
                <strong>操作员（细分子权限勾选）</strong>4 级权限划分，实现最小权限原则与安全风控。
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {canManageAdmins && (
              <button
                id="btn-add-admin-user"
                onClick={() => handleOpenUserModal()}
                className="px-4 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-sm font-medium shadow-sm transition-all flex items-center gap-2 cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                新增管理员账号
              </button>
            )}
          </div>
        </div>

        {/* Real-time Current Logged-in Identity Switcher */}
        <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="flex items-center gap-2.5 text-xs text-slate-700">
            <span className="font-semibold text-slate-800 flex items-center gap-1.5">
              <UserCheck className="w-4 h-4 text-emerald-600" />
              当前登录账号：
            </span>
            <span className="font-bold text-slate-900">{currentAdminUser.name}</span>
            <span className="font-mono text-slate-500">(@{currentAdminUser.account})</span>
            {getRoleBadge(currentAdminUser.role)}
            <span className="text-slate-400">· {currentAdminUser.department}</span>
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto text-xs">
            <span className="text-slate-400 shrink-0">快捷切换身份体验权限：</span>
            {adminUsers.map((u) => {
              const isCurrent = currentAdminUser.id === u.id;
              return (
                <button
                  key={u.id}
                  onClick={() => {
                    setCurrentAdminUser(u);
                    showToast(`已切换为【${u.name}】(${u.role}) 身份`);
                  }}
                  className={`px-2.5 py-1 rounded-lg font-medium transition-all shrink-0 cursor-pointer ${
                    isCurrent
                      ? 'bg-emerald-700 text-white shadow-xs'
                      : 'bg-white hover:bg-slate-200 text-slate-700 border border-slate-200'
                  }`}
                >
                  {u.name.split(' ')[0]} ({u.role === 'superAdmin' ? '超管' : u.role === 'admin' ? '管理员' : u.role === 'operations' ? '运营' : '操作员'})
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* 4 Role Categories Architecture Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {ROLE_DEFINITIONS.map((r) => {
          const userCount = adminUsers.filter((u) => u.role === r.role).length;
          return (
            <div
              key={r.role}
              className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-xs flex flex-col justify-between space-y-3"
            >
              <div>
                <div className="flex items-center justify-between">
                  <span className={`text-xs px-2.5 py-0.5 rounded-md font-semibold border ${r.badgeBg}`}>
                    {r.title.split(' ')[0]}
                  </span>
                  <span className="text-xs font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">
                    {userCount} 人
                  </span>
                </div>
                <div className="text-sm font-bold text-slate-800 mt-2">{r.title}</div>
                <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">{r.desc}</p>
              </div>

              <div className="pt-2 border-t border-slate-100 text-[11px] text-slate-600 font-medium flex items-center justify-between">
                <span className="text-slate-400">权限覆盖：</span>
                <span className="truncate max-w-[170px]" title={r.scope}>{r.scope}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Admin Users List Card */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <h3 className="text-base font-bold text-slate-800">后台管理员账号与权限明细</h3>
            <span className="text-xs text-slate-400">({filteredUsers.length} 位)</span>
          </div>

          {/* Search & Filter */}
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="搜索姓名、账号、部门..."
                className="pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white w-40 sm:w-56"
              />
            </div>

            <select
              value={filterRole}
              onChange={(e) => setFilterRole(e.target.value)}
              className="px-2.5 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-700 focus:outline-none"
            >
              <option value="all">全部角色</option>
              <option value="superAdmin">超级管理员</option>
              <option value="admin">管理员</option>
              <option value="operations">运营员</option>
              <option value="operator">操作员 (细分子类)</option>
            </select>
          </div>
        </div>

        {/* Users Table */}
        <div className="overflow-x-auto rounded-xl border border-slate-100">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50/80 text-slate-500 border-b border-slate-200/80 font-medium">
                <th className="py-3 px-4">管理员姓名</th>
                <th className="py-3 px-3">登录账号</th>
                <th className="py-3 px-3">系统角色</th>
                <th className="py-3 px-4">所属部门 / 业务组</th>
                <th className="py-3 px-4">细分权限清单 (Perms)</th>
                <th className="py-3 px-3">联系手机</th>
                <th className="py-3 px-3">最后登录</th>
                <th className="py-3 px-3 text-center">状态</th>
                <th className="py-3 px-4 text-right">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredUsers.map((user) => {
                const isCurrent = currentAdminUser.id === user.id;
                const permsCount = user.permissions ? user.permissions.length : 0;
                return (
                  <tr
                    key={user.id}
                    className={`hover:bg-slate-50/80 transition-colors ${
                      isCurrent ? 'bg-emerald-50/30' : ''
                    }`}
                  >
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-slate-100 text-slate-700 flex items-center justify-center font-bold text-xs border border-slate-200">
                          {user.name.slice(0, 1)}
                        </div>
                        <div>
                          <div className="font-semibold text-slate-800 flex items-center gap-1.5">
                            {user.name}
                            {isCurrent && (
                              <span className="text-[10px] px-1.5 py-0.2 rounded bg-emerald-100 text-emerald-800 font-normal">
                                当前在线
                              </span>
                            )}
                          </div>
                          {user.note && <div className="text-[11px] text-slate-400 mt-0.5">{user.note}</div>}
                        </div>
                      </div>
                    </td>

                    <td className="py-3 px-3 font-mono font-medium text-slate-700">@{user.account}</td>
                    <td className="py-3 px-3">{getRoleBadge(user.role)}</td>
                    <td className="py-3 px-4 text-slate-600">{user.department || '-'}</td>

                    <td className="py-3 px-4">
                      <div className="flex items-center gap-1.5 flex-wrap max-w-xs">
                        {user.role === 'superAdmin' ? (
                          <span className="text-[11px] px-2 py-0.5 rounded bg-rose-50 text-rose-700 font-semibold border border-rose-200">
                            全部最高权限 (ALL)
                          </span>
                        ) : user.role === 'admin' ? (
                          <span className="text-[11px] px-2 py-0.5 rounded bg-amber-50 text-amber-700 font-semibold border border-amber-200">
                            全业务权限 (除系统设置)
                          </span>
                        ) : user.role === 'operations' ? (
                          <span className="text-[11px] px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 font-semibold border border-emerald-200">
                            全链路综合运营权限 ({permsCount} 项)
                          </span>
                        ) : (
                          <div className="flex items-center gap-1 flex-wrap">
                            {(user.permissions || []).slice(0, 3).map((p) => {
                              const found = ALL_SYSTEM_PERMISSIONS.find((item) => item.id === p);
                              return (
                                <span
                                  key={p}
                                  className="text-[10px] px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 border border-slate-200"
                                >
                                  {found ? found.name.split(' ')[0] : p}
                                </span>
                              );
                            })}
                            {permsCount > 3 && (
                              <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-200 text-slate-600 font-bold">
                                +{permsCount - 3} 项
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                    </td>

                    <td className="py-3 px-3 font-mono text-slate-600">{user.phone}</td>
                    <td className="py-3 px-3 text-slate-500">{user.lastLogin}</td>

                    <td className="py-3 px-3 text-center">
                      <span
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium ${
                          user.status === 'active'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : 'bg-slate-100 text-slate-400 border border-slate-200'
                        }`}
                      >
                        {user.status === 'active' ? '正常' : '已禁用'}
                      </span>
                    </td>

                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => {
                            setCurrentAdminUser(user);
                            showToast(`已切换为【${user.name}】(${user.role}) 身份`);
                          }}
                          className={`px-2 py-1 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                            isCurrent
                              ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                              : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200'
                          }`}
                          disabled={isCurrent}
                        >
                          {isCurrent ? '当前登录' : '切换身份'}
                        </button>

                        {canManageAdmins && (
                          <>
                            <button
                              onClick={() => handleOpenUserModal(user)}
                              className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-600 hover:text-emerald-700 transition-colors"
                              title="编辑账号与权限"
                            >
                              <Edit className="w-3.5 h-3.5" />
                            </button>
                            {user.role !== 'superAdmin' && (
                              <button
                                onClick={() => {
                                  if (window.confirm(`确定删除管理员【${user.name}】吗？`)) {
                                    deleteAdminUser(user.id);
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
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal: Add / Edit Admin User with Granular Checkboxes */}
      {isUserModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-xl border border-slate-200 space-y-5 my-8 max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-emerald-50 text-emerald-700">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-800">
                    {editingUser ? '编辑管理员账号与权限配置' : '创建新管理员账号与角色分配'}
                  </h3>
                  <p className="text-xs text-slate-400">设置角色级别及操作员细分权限勾选</p>
                </div>
              </div>
              <button onClick={() => setIsUserModalOpen(false)} className="text-slate-400 hover:text-slate-600 text-lg">
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveUser} className="space-y-5 text-xs">
              {/* Basic Info */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block font-medium text-slate-700 mb-1">姓名 / 称号 *</label>
                  <input
                    type="text"
                    required
                    placeholder="如：张可可 (线路采编)"
                    value={userForm.name}
                    onChange={(e) => setUserForm({ ...userForm, name: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none font-medium"
                  />
                </div>

                <div>
                  <label className="block font-medium text-slate-700 mb-1">登录账号 *</label>
                  <input
                    type="text"
                    required
                    disabled={!!editingUser}
                    placeholder="如：operator_zhang"
                    value={userForm.account}
                    onChange={(e) => setUserForm({ ...userForm, account: e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, '') })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none font-mono disabled:bg-slate-100"
                  />
                </div>

                <div>
                  <label className="block font-medium text-slate-700 mb-1">所属部门 / 业务组</label>
                  <input
                    type="text"
                    placeholder="如：路线研发部 · 资料采编组"
                    value={userForm.department}
                    onChange={(e) => setUserForm({ ...userForm, department: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-medium text-slate-700 mb-1">手机号码</label>
                  <input
                    type="text"
                    placeholder="如：13800000006"
                    value={userForm.phone}
                    onChange={(e) => setUserForm({ ...userForm, phone: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none font-mono"
                  />
                </div>
              </div>

              {/* Role Selection (4 cards) */}
              <div>
                <label className="block font-bold text-slate-700 mb-2">选择角色级别 *</label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {ROLE_DEFINITIONS.map((r) => {
                    const isSelected = userForm.role === r.role;
                    return (
                      <div
                        key={r.role}
                        onClick={() => handleRoleChange(r.role)}
                        className={`p-3 rounded-xl border transition-all cursor-pointer flex flex-col justify-between ${
                          isSelected
                            ? 'bg-emerald-50/90 border-emerald-500 ring-2 ring-emerald-500/20 shadow-xs'
                            : 'bg-white hover:bg-slate-50 border-slate-200'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className={`text-[11px] px-2 py-0.5 rounded-md font-semibold border ${r.badgeBg}`}>
                            {r.title.split(' ')[0]}
                          </span>
                          {isSelected && <Check className="w-4 h-4 text-emerald-700" />}
                        </div>
                        <div className="font-semibold text-slate-800 mt-1">{r.title}</div>
                        <p className="text-[11px] text-slate-500 mt-1 line-clamp-2">{r.desc}</p>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Granular Checkbox Permissions Group */}
              <div className="bg-slate-50/80 p-4 rounded-2xl border border-slate-200 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <Sliders className="w-4 h-4 text-emerald-700" />
                    <span className="font-bold text-slate-800">
                      细粒度子权限配置 {userForm.role === 'operator' ? '(操作员细化勾选)' : '(当前角色包含权限)'}
                    </span>
                  </div>
                  <span className="text-xs text-emerald-700 font-bold">
                    已勾选 {userForm.permissions.length} / {ALL_SYSTEM_PERMISSIONS.length} 项权限
                  </span>
                </div>

                <div className="space-y-3.5">
                  {permissionCategories.map(({ category, items }) => {
                    const allCatSelected = items.every((p) => userForm.permissions.includes(p.id));
                    const someCatSelected = items.some((p) => userForm.permissions.includes(p.id));
                    return (
                      <div key={category} className="bg-white p-3 rounded-xl border border-slate-200 space-y-2">
                        <div className="flex items-center justify-between pb-1.5 border-b border-slate-100">
                          <span className="font-semibold text-slate-800">{category}</span>
                          <button
                            type="button"
                            onClick={() => handleToggleCategory(items)}
                            className="text-[11px] text-emerald-700 hover:text-emerald-800 font-medium"
                          >
                            {allCatSelected ? '取消本组全选' : '全选本组'}
                          </button>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                          {items.map((perm) => {
                            const isChecked = userForm.permissions.includes(perm.id);
                            return (
                              <label
                                key={perm.id}
                                className={`flex items-start gap-2 p-2 rounded-lg border transition-all cursor-pointer ${
                                  isChecked
                                    ? 'bg-emerald-50/50 border-emerald-300 text-slate-800'
                                    : 'bg-white border-slate-100 hover:border-slate-200 text-slate-600'
                                }`}
                              >
                                <input
                                  type="checkbox"
                                  checked={isChecked}
                                  onChange={() => handleTogglePermission(perm.id)}
                                  className="mt-0.5 rounded text-emerald-600 focus:ring-emerald-500"
                                />
                                <div className="text-left">
                                  <div className="font-medium text-xs text-slate-800">{perm.name}</div>
                                  <div className="text-[10px] text-slate-400 mt-0.5">{perm.description}</div>
                                </div>
                              </label>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">备注说明</label>
                <input
                  type="text"
                  placeholder="如：仅负责江浙沪路线录入与发班排期审核"
                  value={userForm.note}
                  onChange={(e) => setUserForm({ ...userForm, note: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsUserModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium"
                >
                  取消
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-medium shadow-sm"
                >
                  保存管理员配置
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
