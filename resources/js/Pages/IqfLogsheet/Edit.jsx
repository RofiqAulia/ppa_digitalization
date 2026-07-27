import React from 'react';
import { Head, useForm, Link } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft, Save } from 'lucide-react';

export default function Edit({ iqfLogsheet }) {
    const { data, setData, put, processing, errors } = useForm({
        date: iqfLogsheet.date,
        shift: String(iqfLogsheet.shift),
        product_type: iqfLogsheet.product_type,
        machine: iqfLogsheet.machine,
        batch_number: iqfLogsheet.batch_number || '',
        planning_qty: iqfLogsheet.planning_qty || 0,
        unplanned_stop: iqfLogsheet.unplanned_stop || '',
        status: iqfLogsheet.status || 'ongoing'
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        put(`/iqf-logsheet/${iqfLogsheet.id}`);
    };

    return (
        <AppLayout>
            <Head title="Edit Header Logsheet IQF" />
            
            <div className="flex items-center gap-4 mb-6">
                <Link href="/iqf-logsheet">
                    <Button variant="ghost" size="icon">
                        <ArrowLeft className="h-5 w-5" />
                    </Button>
                </Link>
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Edit Header Logsheet IQF</h2>
                    <p className="text-muted-foreground">Ubah informasi utama logsheet (Data detail diedit di halaman tabel).</p>
                </div>
            </div>

            <form onSubmit={handleSubmit}>
                <Card className="mb-6">
                    <CardHeader>
                        <CardTitle>Informasi Utama</CardTitle>
                    </CardHeader>
                    <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <Label htmlFor="date">Tanggal</Label>
                            <Input 
                                id="date" type="date" value={data.date} 
                                onChange={e => setData('date', e.target.value)} required 
                            />
                            {errors.date && <p className="text-sm text-red-500">{errors.date}</p>}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="shift">Shift</Label>
                            <Select value={data.shift} onValueChange={v => setData('shift', v)} required>
                                <SelectTrigger><SelectValue placeholder="Pilih Shift" /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="1">Shift 1</SelectItem>
                                    <SelectItem value="2">Shift 2</SelectItem>
                                    <SelectItem value="3">Shift 3</SelectItem>
                                </SelectContent>
                            </Select>
                            {errors.shift && <p className="text-sm text-red-500">{errors.shift}</p>}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="product_type">Jenis Produk</Label>
                            <Select value={data.product_type} onValueChange={v => setData('product_type', v)} required>
                                <SelectTrigger><SelectValue placeholder="Pilih Produk" /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="siomay">Siomay</SelectItem>
                                    <SelectItem value="pentol">Pentol</SelectItem>
                                    <SelectItem value="lumpia">Lumpia</SelectItem>
                                    <SelectItem value="adonan_pangsit">Adonan Pangsit</SelectItem>
                                </SelectContent>
                            </Select>
                            {errors.product_type && <p className="text-sm text-red-500">{errors.product_type}</p>}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="machine">Mesin IQF</Label>
                            <Select value={data.machine} onValueChange={v => setData('machine', v)} required>
                                <SelectTrigger><SelectValue placeholder="Pilih Mesin" /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="IQF 1">IQF 1</SelectItem>
                                    <SelectItem value="IQF 2">IQF 2</SelectItem>
                                </SelectContent>
                            </Select>
                            {errors.machine && <p className="text-sm text-red-500">{errors.machine}</p>}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="batch_number">Batch Number</Label>
                            <Input 
                                id="batch_number" type="text" value={data.batch_number} 
                                onChange={e => setData('batch_number', e.target.value)} 
                            />
                            {errors.batch_number && <p className="text-sm text-red-500">{errors.batch_number}</p>}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="planning_qty">Planning Qty</Label>
                            <Input 
                                id="planning_qty" type="number" min="0" value={data.planning_qty} 
                                onChange={e => setData('planning_qty', e.target.value)} required 
                            />
                            {errors.planning_qty && <p className="text-sm text-red-500">{errors.planning_qty}</p>}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="status">Status</Label>
                            <Select value={data.status} onValueChange={v => setData('status', v)} required>
                                <SelectTrigger><SelectValue placeholder="Pilih Status" /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="ongoing">Ongoing</SelectItem>
                                    <SelectItem value="completed">Completed</SelectItem>
                                </SelectContent>
                            </Select>
                            {errors.status && <p className="text-sm text-red-500">{errors.status}</p>}
                        </div>

                        <div className="space-y-2 md:col-span-2">
                            <Label htmlFor="unplanned_stop">Unplanned Stop</Label>
                            <textarea 
                                id="unplanned_stop" rows={3} value={data.unplanned_stop} 
                                onChange={e => setData('unplanned_stop', e.target.value)} 
                                className="flex min-h-[80px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                            />
                            {errors.unplanned_stop && <p className="text-sm text-red-500">{errors.unplanned_stop}</p>}
                        </div>
                    </CardContent>
                </Card>

                <div className="flex justify-end gap-3 mb-10">
                    <Link href="/iqf-logsheet">
                        <Button variant="outline" type="button">Batal</Button>
                    </Link>
                    <Button type="submit" disabled={processing} className="bg-indigo-600 hover:bg-indigo-700">
                        <Save className="w-4 h-4 mr-2" />
                        Simpan Perubahan
                    </Button>
                </div>
            </form>
        </AppLayout>
    );
}
