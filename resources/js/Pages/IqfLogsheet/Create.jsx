import React from 'react';
import { Head, useForm, Link } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft } from 'lucide-react';

export default function Create() {
    const today = new Date().toISOString().split('T')[0];
    
    const { data, setData, post, processing, errors } = useForm({
        date: today,
        shift: '1',
        product_type: 'siomay',
        machine: 'IQF 1',
        batch_number: '',
        planning_qty: 0,
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        post('/iqf-logsheet');
    };

    return (
        <AppLayout>
            <Head title="Buat Logsheet IQF Baru" />
            
            <div className="flex items-center gap-4 mb-6">
                <Link href="/iqf-logsheet">
                    <Button variant="ghost" size="icon">
                        <ArrowLeft className="h-5 w-5" />
                    </Button>
                </Link>
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Buat Logsheet IQF Baru</h2>
                    <p className="text-muted-foreground">
                        Isi data awal logsheet oleh SPV.
                    </p>
                </div>
            </div>

            <Card className="max-w-4xl">
                <CardHeader>
                    <CardTitle>Formulir Inisialisasi IQF</CardTitle>
                    <CardDescription>Target produksi dan detail mesin untuk shift ini.</CardDescription>
                </CardHeader>
                <form onSubmit={handleSubmit}>
                    <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <Label htmlFor="date">Tanggal</Label>
                            <Input 
                                id="date" 
                                type="date" 
                                value={data.date} 
                                onChange={e => setData('date', e.target.value)} 
                                required 
                            />
                            {errors.date && <p className="text-sm text-red-500">{errors.date}</p>}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="shift">Shift</Label>
                            <Select value={data.shift} onValueChange={v => setData('shift', v)} required>
                                <SelectTrigger>
                                    <SelectValue placeholder="Pilih Shift" />
                                </SelectTrigger>
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
                                <SelectTrigger>
                                    <SelectValue placeholder="Pilih Produk" />
                                </SelectTrigger>
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
                                <SelectTrigger>
                                    <SelectValue placeholder="Pilih Mesin" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="IQF 1">IQF 1</SelectItem>
                                    <SelectItem value="IQF 2">IQF 2</SelectItem>
                                </SelectContent>
                            </Select>
                            {errors.machine && <p className="text-sm text-red-500">{errors.machine}</p>}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="batch_number">No. Batch</Label>
                            <Input 
                                id="batch_number" 
                                type="number" 
                                value={data.batch_number} 
                                onChange={e => setData('batch_number', e.target.value)} 
                            />
                            {errors.batch_number && <p className="text-sm text-red-500">{errors.batch_number}</p>}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="planning_qty">Planning Qty (loyang/keranjang)</Label>
                            <Input 
                                id="planning_qty" 
                                type="number" 
                                min="0" 
                                value={data.planning_qty} 
                                onChange={e => setData('planning_qty', e.target.value)} 
                                required 
                            />
                            {errors.planning_qty && <p className="text-sm text-red-500">{errors.planning_qty}</p>}
                        </div>

                        <div className="md:col-span-2 flex justify-end mt-4">
                            <Button type="submit" disabled={processing} className="w-full md:w-auto">
                                Simpan & Buat Logsheet
                            </Button>
                        </div>
                    </CardContent>
                </form>
            </Card>
        </AppLayout>
    );
}
