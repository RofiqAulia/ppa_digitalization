import React, { useState } from 'react';
import { Head, useForm, router, usePage } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import { Edit2, Trash2, Monitor, ShieldCheck, Info, Copy, Check } from 'lucide-react';

const ADMIN_EMAILS = ['admin@example.com', 'mrofiqaulia@gmail.com'];

function isAdminAccount(email) {
    return ADMIN_EMAILS.includes(email?.toLowerCase()) || email?.endsWith('@gmail.com');
}

function CopyButton({ text }) {
    const [copied, setCopied] = useState(false);
    const handleCopy = (e) => {
        e.stopPropagation();
        navigator.clipboard.writeText(text).then(() => {
            setCopied(true);
            setTimeout(() => setCopied(false), 1500);
        });
    };
    return (
        <button
            onClick={handleCopy}
            title="Salin email"
            className="ml-1.5 p-0.5 text-slate-400 hover:text-slate-600 transition-colors"
        >
            {copied ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
        </button>
    );
}

export default function AdminUsersIndex({ users }) {
    const { auth, flash } = usePage().props;
    const [showForm, setShowForm] = useState(false);
    const [editingUser, setEditingUser] = useState(null);
    const [activeTab, setActiveTab] = useState('all');

    const { data, setData, post, put, processing, errors, reset, clearErrors } = useForm({
        name: '',
        email: '',
        password: '',
    });

    const openAddForm = () => {
        clearErrors();
        reset();
        setEditingUser(null);
        setShowForm(true);
    };

    const openEditForm = (user) => {
        clearErrors();
        setData({ name: user.name, email: user.email, password: '' });
        setEditingUser(user);
        setShowForm(true);
    };

    const closeForm = () => {
        reset();
        clearErrors();
        setEditingUser(null);
        setShowForm(false);
    };

    const submit = (e) => {
        e.preventDefault();
        if (editingUser) {
            put(`/admin/users/${editingUser.id}`, { onSuccess: () => closeForm() });
        } else {
            post('/admin/users', { onSuccess: () => closeForm() });
        }
    };

    const deleteUser = (id, name) => {
        if (confirm(`Hapus akun "${name}"? Tindakan ini tidak bisa dibatalkan.`)) {
            router.delete(`/admin/users/${id}`);
        }
    };

    const adminUsers    = users.filter(u => isAdminAccount(u.email));
    const operatorUsers = users.filter(u => !isAdminAccount(u.email));
    const displayUsers  = activeTab === 'admin' ? adminUsers
                        : activeTab === 'operator' ? operatorUsers
                        : users;

    const tabs = [
        { key: 'all',      label: 'Semua Akun',      count: users.length },
        { key: 'admin',    label: 'Admin Panel',      count: adminUsers.length },
        { key: 'operator', label: 'Terminal Operator', count: operatorUsers.length },
    ];

    return (
        <AppLayout>
            <Head title="Manajemen Akun" />

            {/* ── PAGE HEADER ──────────────────────────── */}
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-6 gap-4">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight text-slate-900">Manajemen Akun</h2>
                    <p className="text-muted-foreground text-sm font-medium mt-0.5">
                        Kelola akun untuk login Admin Panel & Terminal Operator.
                    </p>
                </div>
                <button
                    onClick={() => showForm ? closeForm() : openAddForm()}
                    className="flex items-center gap-2 bg-pink-500 hover:bg-pink-600 text-white font-black text-xs uppercase tracking-widest px-6 py-3 rounded-full shadow-md transition-all"
                >
                    {showForm ? '✕ Batal' : '+ Tambah Akun'}
                </button>
            </div>

            {/* ── INFO BOX (Testing Guide) ─────────────── */}
            <div className="mb-6 bg-gradient-to-r from-indigo-50 to-blue-50 border border-indigo-200 rounded-2xl p-4">
                <div className="flex items-start gap-3">
                    <div className="mt-0.5 w-8 h-8 rounded-full bg-indigo-500 flex items-center justify-center shrink-0">
                        <Info className="w-4 h-4 text-white" />
                    </div>
                    <div>
                        <p className="font-black text-indigo-800 text-sm uppercase tracking-widest mb-2">
                            Panduan Akun Testing
                        </p>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                            <div className="bg-white/70 rounded-xl p-3 border border-indigo-100">
                                <div className="flex items-center gap-2 mb-2">
                                    <ShieldCheck className="w-4 h-4 text-indigo-500" />
                                    <span className="font-bold text-indigo-700">Login Admin Panel</span>
                                </div>
                                <p className="text-xs text-slate-500 mb-1">URL: <code className="bg-slate-100 px-1 rounded">/login</code></p>
                                <div className="space-y-1 font-mono text-xs">
                                    <div className="flex items-center gap-1">
                                        <span className="text-slate-600">admin@example.com</span>
                                        <CopyButton text="admin@example.com" />
                                        <span className="text-slate-400">/ password</span>
                                    </div>
                                    <div className="flex items-center gap-1">
                                        <span className="text-slate-600">mrofiqaulia@gmail.com</span>
                                        <CopyButton text="mrofiqaulia@gmail.com" />
                                        <span className="text-slate-400">/ password123</span>
                                    </div>
                                </div>
                            </div>
                            <div className="bg-white/70 rounded-xl p-3 border border-indigo-100">
                                <div className="flex items-center gap-2 mb-2">
                                    <Monitor className="w-4 h-4 text-pink-500" />
                                    <span className="font-bold text-pink-700">Login Terminal Operator</span>
                                </div>
                                <p className="text-xs text-slate-500 mb-1">URL: <code className="bg-slate-100 px-1 rounded">/operator/login</code> (email saja)</p>
                                <div className="space-y-1 font-mono text-xs">
                                    {operatorUsers.slice(0, 3).map(u => (
                                        <div key={u.email} className="flex items-center gap-1">
                                            <span className="text-slate-600">{u.email}</span>
                                            <CopyButton text={u.email} />
                                        </div>
                                    ))}
                                    {operatorUsers.length > 3 && (
                                        <p className="text-slate-400">+{operatorUsers.length - 3} lainnya...</p>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* ── FLASH MESSAGES ───────────────────────── */}
            {flash?.success && (
                <div className="mb-4 bg-emerald-50 border border-emerald-200 text-emerald-700 font-bold px-5 py-3 rounded-2xl text-sm">
                    ✓ {flash.success}
                </div>
            )}
            {flash?.error && (
                <div className="mb-4 bg-rose-50 border border-rose-200 text-rose-700 font-bold px-5 py-3 rounded-2xl text-sm">
                    ✕ {flash.error}
                </div>
            )}

            {/* ── ADD/EDIT FORM ─────────────────────────── */}
            {showForm && (
                <div className="mb-8 bg-white border-2 border-pink-100 rounded-3xl p-6 shadow-xl shadow-pink-500/10">
                    <h3 className="text-base font-black text-slate-800 uppercase tracking-widest mb-4">
                        {editingUser ? 'Edit Akun' : 'Tambah Akun Baru'}
                    </h3>
                    <form onSubmit={submit} className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                            <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-1.5">Nama Lengkap</label>
                            <input
                                type="text"
                                value={data.name}
                                onChange={e => setData('name', e.target.value)}
                                placeholder="Contoh: Budi Santoso"
                                className="w-full border-2 border-slate-200 rounded-xl px-4 py-2.5 text-sm font-semibold text-slate-700 focus:border-pink-400 focus:ring-2 focus:ring-pink-100 outline-none transition-all"
                            />
                            {errors.name && <p className="text-rose-500 text-xs font-bold mt-1">{errors.name}</p>}
                        </div>
                        <div>
                            <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-1.5">Email</label>
                            <input
                                type="email"
                                value={data.email}
                                onChange={e => setData('email', e.target.value)}
                                placeholder="operator@email.com"
                                className="w-full border-2 border-slate-200 rounded-xl px-4 py-2.5 text-sm font-semibold text-slate-700 focus:border-pink-400 focus:ring-2 focus:ring-pink-100 outline-none transition-all"
                            />
                            {errors.email && <p className="text-rose-500 text-xs font-bold mt-1">{errors.email}</p>}
                        </div>
                        <div>
                            <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-1.5">
                                Password {editingUser && <span className="text-slate-400 font-normal lowercase">(Kosongkan jika tidak diubah)</span>}
                            </label>
                            <input
                                type="password"
                                value={data.password}
                                onChange={e => setData('password', e.target.value)}
                                placeholder={editingUser ? 'Biarkan kosong' : 'Min. 8 karakter'}
                                className="w-full border-2 border-slate-200 rounded-xl px-4 py-2.5 text-sm font-semibold text-slate-700 focus:border-pink-400 focus:ring-2 focus:ring-pink-100 outline-none transition-all"
                            />
                            {errors.password && <p className="text-rose-500 text-xs font-bold mt-1">{errors.password}</p>}
                        </div>
                        <div className="md:col-span-3 flex justify-end gap-3">
                            <button type="button" onClick={closeForm} className="bg-slate-100 hover:bg-slate-200 text-slate-600 font-black text-xs uppercase tracking-widest px-8 py-3 rounded-full transition-all">
                                Batal
                            </button>
                            <button type="submit" disabled={processing} className="bg-pink-500 hover:bg-pink-600 text-white font-black text-xs uppercase tracking-widest px-8 py-3 rounded-full shadow-md transition-all disabled:opacity-50">
                                {processing ? 'Menyimpan...' : (editingUser ? 'Simpan Perubahan' : '+ Simpan Akun')}
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* ── TABS ─────────────────────────────────── */}
            <div className="flex gap-1 mb-4 bg-slate-100 p-1 rounded-2xl w-fit">
                {tabs.map(tab => (
                    <button
                        key={tab.key}
                        onClick={() => setActiveTab(tab.key)}
                        className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${
                            activeTab === tab.key
                                ? 'bg-white text-slate-800 shadow-sm'
                                : 'text-slate-500 hover:text-slate-700'
                        }`}
                    >
                        {tab.label}
                        <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-black ${
                            activeTab === tab.key ? 'bg-pink-500 text-white' : 'bg-slate-200 text-slate-500'
                        }`}>
                            {tab.count}
                        </span>
                    </button>
                ))}
            </div>

            {/* ── USERS TABLE ──────────────────────────── */}
            <div className="bg-white border-2 border-slate-100 rounded-3xl overflow-hidden shadow-lg">
                <table className="w-full text-sm">
                    <thead>
                        <tr className="bg-slate-50 border-b border-slate-100">
                            <th className="px-6 py-4 text-left font-black uppercase tracking-widest text-xs text-slate-500">Nama</th>
                            <th className="px-6 py-4 text-left font-black uppercase tracking-widest text-xs text-slate-500">Email</th>
                            <th className="px-6 py-4 text-left font-black uppercase tracking-widest text-xs text-slate-500">Tipe Akun</th>
                            <th className="px-6 py-4 text-left font-black uppercase tracking-widest text-xs text-slate-500">Bergabung</th>
                            <th className="px-6 py-4 text-right font-black uppercase tracking-widest text-xs text-slate-500">Aksi</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                        {displayUsers.map((user) => {
                            const isAdmin = isAdminAccount(user.email);
                            return (
                                <tr key={user.id} className="hover:bg-slate-50/50 transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-black text-xs shadow-sm bg-gradient-to-br ${isAdmin ? 'from-indigo-400 to-blue-500' : 'from-pink-400 to-rose-500'}`}>
                                                {user.name?.charAt(0).toUpperCase()}
                                            </div>
                                            <div className="flex flex-col">
                                                <span className="font-bold text-slate-800">
                                                    {user.name}
                                                    {auth?.user?.id === user.id && (
                                                        <span className="text-[10px] bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded ml-2 uppercase">Anda</span>
                                                    )}
                                                </span>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-slate-600 font-medium">
                                        <div className="flex items-center gap-1">
                                            {user.email}
                                            <CopyButton text={user.email} />
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        {isAdmin ? (
                                            <span className="inline-flex items-center gap-1.5 text-[11px] font-black px-2.5 py-1 rounded-full bg-indigo-100 text-indigo-700 uppercase tracking-widest">
                                                <ShieldCheck className="w-3 h-3" /> Admin Panel
                                            </span>
                                        ) : (
                                            <span className="inline-flex items-center gap-1.5 text-[11px] font-black px-2.5 py-1 rounded-full bg-pink-100 text-pink-700 uppercase tracking-widest">
                                                <Monitor className="w-3 h-3" /> Operator
                                            </span>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 text-slate-400 font-medium text-xs">
                                        {new Date(user.created_at).toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric' })}
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex items-center justify-end gap-2">
                                            <button
                                                onClick={() => openEditForm(user)}
                                                className="p-2 text-blue-500 hover:bg-blue-50 rounded-full transition-colors"
                                                title="Edit Akun"
                                            >
                                                <Edit2 className="w-4 h-4" />
                                            </button>
                                            <button
                                                onClick={() => deleteUser(user.id, user.name)}
                                                className="p-2 text-rose-500 hover:bg-rose-50 rounded-full transition-colors"
                                                title="Hapus Akun"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
                {displayUsers.length === 0 && (
                    <div className="text-center py-16 text-slate-400 font-bold">Tidak ada akun di kategori ini.</div>
                )}
            </div>
        </AppLayout>
    );
}
