import React, { useState, useEffect } from 'react';
import { Head, Link } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ArrowLeft, Send } from 'lucide-react';
import axios from 'axios';

export default function Show({ iqfLogsheet }) {
    const [currentTime, setCurrentTime] = useState(new Date().toLocaleTimeString('id-ID', { hour12: false }));
    const [trayCount, setTrayCount] = useState('');
    const [suhuPanel, setSuhuPanel] = useState('');
    const [suhuProduk, setSuhuProduk] = useState('');
    const [rak, setRak] = useState('');
    
    const [details, setDetails] = useState(iqfLogsheet.details || []);
    const [totalAchieve, setTotalAchieve] = useState(iqfLogsheet.details.reduce((sum, item) => sum + item.tray_count, 0));
    
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState(null);

    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentTime(new Date().toLocaleTimeString('id-ID', { hour12: false }));
        }, 1000);
        return () => clearInterval(timer);
    }, []);

    const planningQty = iqfLogsheet.planning_qty || 0;
    const konversi = (totalAchieve / 150).toFixed(2);
    const persentase = planningQty > 0 ? ((totalAchieve / planningQty) * 100).toFixed(1) + '% dari Planning' : 'Planning 0';
    const isPack = ['lumpia', 'adonan_pangsit'].includes(iqfLogsheet.product_type);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage(null);
        
        try {
            const response = await axios.post(`/iqf-logsheet/${iqfLogsheet.id}/detail`, {
                tray_count: trayCount,
                suhu_panel: suhuPanel,
                suhu_produk: suhuProduk,
                rak: rak
            });
            
            setMessage({ type: 'success', text: response.data.success });
            setDetails([response.data.detail, ...details]);
            setTotalAchieve(response.data.total_achieve);
            
            // Reset input
            setTrayCount('');
            setRak('');
        } catch (error) {
            setMessage({ type: 'error', text: error.response?.data?.message || error.message });
        } finally {
            setLoading(false);
        }
    };

    return (
        <AppLayout>
            <Head title="Logsheet IQF Operator" />
            
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
                <div className="flex items-center gap-4">
                    <Link href="/logsheet-iqf">
                        <Button variant="ghost" size="icon">
                            <ArrowLeft className="h-5 w-5" />
                        </Button>
                    </Link>
                    <div>
                        <h2 className="text-3xl font-bold tracking-tight">Logsheet IQF Operator</h2>
                        <p className="text-muted-foreground">Input data aktual secara real-time.</p>
                    </div>
                </div>
                <div className="bg-primary text-primary-foreground px-6 py-3 rounded-lg shadow-md font-mono text-xl font-bold">
                    {currentTime}
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
                <Card>
                    <CardContent className="p-4">
                        <p className="text-xs text-muted-foreground uppercase font-bold tracking-wider">Informasi Logsheet</p>
                        <p className="text-lg font-bold mt-1">{iqfLogsheet.date} | Shift {iqfLogsheet.shift}</p>
                        <p className="text-sm capitalize">{iqfLogsheet.product_type.replace('_', ' ')} - {iqfLogsheet.machine}</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-4">
                        <p className="text-xs text-muted-foreground uppercase font-bold tracking-wider">Planning Qty</p>
                        <p className="text-2xl font-black text-blue-600 mt-1">{planningQty}</p>
                        <p className="text-xs text-muted-foreground">{isPack ? 'pack' : 'loyang'}</p>
                    </CardContent>
                </Card>
                <Card className="border-l-4 border-l-green-500">
                    <CardContent className="p-4">
                        <p className="text-xs text-muted-foreground uppercase font-bold tracking-wider">Total Achieve</p>
                        <p className="text-2xl font-black text-green-600 mt-1">{totalAchieve}</p>
                        <p className="text-xs text-green-500 font-semibold">{persentase}</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-4">
                        <p className="text-xs text-muted-foreground uppercase font-bold tracking-wider">Konversi Resep</p>
                        <p className="text-2xl font-black text-purple-600 mt-1">{konversi}</p>
                        <p className="text-xs text-muted-foreground">Achieve / 150</p>
                    </CardContent>
                </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-1">
                    <Card className="sticky top-6">
                        <CardHeader>
                            <CardTitle>Input Data Masuk</CardTitle>
                        </CardHeader>
                        <CardContent>
                            {message && (
                                <div className={`mb-4 p-3 rounded text-sm font-medium ${message.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                    {message.text}
                                </div>
                            )}
                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div className="grid grid-cols-2 gap-3">
                                    <div className="space-y-1">
                                        <Label>Suhu Panel</Label>
                                        <Input value={suhuPanel} onChange={e => setSuhuPanel(e.target.value)} className="text-center" />
                                    </div>
                                    <div className="space-y-1">
                                        <Label>Suhu Produk</Label>
                                        <Input value={suhuProduk} onChange={e => setSuhuProduk(e.target.value)} className="text-center" />
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-3">
                                    <div className="space-y-1">
                                        <Label>{isPack ? 'Rongga' : 'Rak'}</Label>
                                        <Input type="number" value={rak} onChange={e => setRak(e.target.value)} className="text-center font-bold text-lg" required />
                                    </div>
                                    <div className="space-y-1">
                                        <Label>Qty {isPack ? 'Pack' : 'Loyang'}</Label>
                                        <Input type="number" min="1" value={trayCount} onChange={e => setTrayCount(e.target.value)} className="text-center font-bold text-lg" required />
                                    </div>
                                </div>
                                <Button type="submit" className="w-full" disabled={loading}>
                                    {loading ? 'Menyimpan...' : <><Send className="w-4 h-4 mr-2" /> Catat Sekarang</>}
                                </Button>
                            </form>
                        </CardContent>
                    </Card>
                </div>

                <div className="lg:col-span-2">
                    <Card>
                        <CardHeader className="bg-muted/50 pb-4">
                            <CardTitle className="text-lg">Riwayat Input Hari Ini</CardTitle>
                        </CardHeader>
                        <div className="max-h-[600px] overflow-y-auto">
                            <Table>
                                <TableHeader className="sticky top-0 bg-background shadow-sm">
                                    <TableRow>
                                        <TableHead>Jam</TableHead>
                                        <TableHead className="text-center">{isPack ? 'Rongga' : 'Rak'}</TableHead>
                                        <TableHead className="text-center">Suhu Panel</TableHead>
                                        <TableHead className="text-center">Suhu Produk</TableHead>
                                        <TableHead className="text-right">Qty</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {details.map((detail, index) => (
                                        <TableRow key={index}>
                                            <TableCell className="font-mono">{detail.time}</TableCell>
                                            <TableCell className="text-center font-bold">{detail.rak || '-'}</TableCell>
                                            <TableCell className="text-center text-muted-foreground">{detail.suhu_panel || '-'}</TableCell>
                                            <TableCell className="text-center text-muted-foreground">{detail.suhu_produk || '-'}</TableCell>
                                            <TableCell className="text-right font-bold text-green-600">{detail.tray_count}</TableCell>
                                        </TableRow>
                                    ))}
                                    {details.length === 0 && (
                                        <TableRow>
                                            <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                                                Belum ada data input.
                                            </TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </div>
                    </Card>
                </div>
            </div>
        </AppLayout>
    );
}
