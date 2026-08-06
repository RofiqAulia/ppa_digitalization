import React, { useState } from 'react';
import { Head, useForm, router, usePage } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import { Edit2, Trash2 } from 'lucide-react';

export default function AdminUsersIndex({ users, flash }) {
    const { auth } = usePage().props;
    const [showForm, setShowForm] = useState(false);
    const [editingUser, setEditingUser] = useState(null);

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
        setData({
            name: user.name,
            email: user.email,
            password: '', // Leave blank for edit unless they want to change
        });
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
            put(`/admin/users/${editingUser.id}`, {
                onSuccess: () => closeForm(),
            });
        } else {
            post('/admin/users', {
                onSuccess: () => closeForm(),
            });
        }
    };

    const deleteUser = (id, name) => {
        if (confirm(`Hapus admin "${name}"? Tindakan ini tidak bisa dibatalkan.`)) {
            router.delete(`/admin/users/${id}`);
        }
    };

    return (
        <AppLayout>
            <Head title="Manajemen Admin" />

            <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-6 gap-4">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight text-slate-900">Manajemen Admin</h2>
                    <p className="text-muted-foreground text-sm font-medium">Kelola akun admin yang dapat mengakses panel ini.</p>
                </div>
                <button
                    onClick={() => showForm ? closeForm() : openAddForm()}
                    className="flex items-center gap-2 bg-pink-500 hover:bg-pink-600 text-white font-black text-xs uppercase tracking-widest px-6 py-3 rounded-full shadow-md transition-all"
                >
                    {showForm ? '✕ Batal' : '+ Tambah Admin'}
                </button>
            </div>

            {/* Success/error flash */}
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

            {/* Form (Add / Edit) */}
            {showForm && (
                <div className="mb-8 bg-white border-2 border-pink-100 rounded-3xl p-6 shadow-xl shadow-pink-500/10">
                    <h3 className="text-base font-black text-slate-800 uppercase tracking-widest mb-4">
                        {editingUser ? 'Edit Admin' : 'Tambah Admin Baru'}
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
                                placeholder="admin@email.com"
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
                                placeholder={editingUser ? "Biarkan kosong" : "Min. 8 karakter"}
                                className="w-full border-2 border-slate-200 rounded-xl px-4 py-2.5 text-sm font-semibold text-slate-700 focus:border-pink-400 focus:ring-2 focus:ring-pink-100 outline-none transition-all"
                            />
                            {errors.password && <p className="text-rose-500 text-xs font-bold mt-1">{errors.password}</p>}
                        </div>
                        <div className="md:col-span-3 flex justify-end gap-3">
                            <button
                                type="button"
                                onClick={closeForm}
                                className="bg-slate-100 hover:bg-slate-200 text-slate-600 font-black text-xs uppercase tracking-widest px-8 py-3 rounded-full transition-all"
                            >
                                Batal
                            </button>
                            <button
                                type="submit"
                                disabled={processing}
                                className="bg-pink-500 hover:bg-pink-600 text-white font-black text-xs uppercase tracking-widest px-8 py-3 rounded-full shadow-md transition-all disabled:opacity-50"
                            >
                                {processing ? 'Menyimpan...' : (editingUser ? 'Simpan Perubahan' : '+ Simpan Admin')}
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* Users Table */}
            <div className="bg-white border-2 border-slate-100 rounded-3xl overflow-hidden shadow-lg">
                <table className="w-full text-sm">
                    <thead>
                        <tr className="bg-slate-50 border-b border-slate-100">
                            <th className="px-6 py-4 text-left font-black uppercase tracking-widest text-xs text-slate-500">Nama</th>
                            <th className="px-6 py-4 text-left font-black uppercase tracking-widest text-xs text-slate-500">Email</th>
                            <th className="px-6 py-4 text-left font-black uppercase tracking-widest text-xs text-slate-500">Bergabung</th>
                            <th className="px-6 py-4 text-right font-black uppercase tracking-widest text-xs text-slate-500">Aksi</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                        {users.map((user) => (
                            <tr key={user.id} className="hover:bg-slate-50/50 transition-colors">
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-pink-400 to-cyan-400 flex items-center justify-center text-white font-black text-xs shadow-sm">
                                            {user.name?.charAt(0).toUpperCase()}
                                        </div>
                                        <div className="flex flex-col">
                                            <span className="font-bold text-slate-800">
                                                {user.name} {auth?.user?.id === user.id && <span className="text-[10px] bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded ml-2 uppercase">Anda</span>}
                                            </span>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-4 text-slate-600 font-medium">{user.email}</td>
                                <td className="px-6 py-4 text-slate-400 font-medium text-xs">
                                    {new Date(user.created_at).toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric' })}
                                </td>
                                <td className="px-6 py-4 text-right">
                                    <div className="flex items-center justify-end gap-2">
                                        <button
                                            onClick={() => openEditForm(user)}
                                            className="p-2 text-blue-500 hover:bg-blue-50 rounded-full transition-colors"
                                            title="Edit Admin"
                                        >
                                            <Edit2 className="w-4 h-4" />
                                        </button>
                                        <button
                                            onClick={() => deleteUser(user.id, user.name)}
                                            className="p-2 text-rose-500 hover:bg-rose-50 rounded-full transition-colors"
                                            title="Hapus Admin"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {users.length === 0 && (
                    <div className="text-center py-16 text-slate-400 font-bold">Belum ada admin terdaftar.</div>
                )}
            </div>
        </AppLayout>
    );
}
