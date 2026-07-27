import React from 'react';
import { Head, Link } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Printer, Download } from 'lucide-react';

export default function Show({ header }) {
    const products = ['siomay', 'pentol', 'lumpia'];

    const getDetail = (relation, type, field) => {
        if (!header || !header[relation]) return '-';
        const item = header[relation].find(i => (i.product_type === type || i.material_type === type || i.waste_type === type));
        if (!item) return '-';
        return item[field] !== null ? item[field] : '-';
    };

    const getTopping = (field) => {
        if (!header || !header.toppings || header.toppings.length === 0) return '-';
        return header.toppings[0][field] !== null ? header.toppings[0][field] : '-';
    };

    return (
        <AppLayout>
            <Head title="Detail Prepare Produksi" />
            
            <div className="flex items-center justify-between mb-6 print:hidden">
                <div className="flex items-center gap-4">
                    <Link href="/prepare-produksi">
                        <Button variant="ghost" size="icon">
                            <ArrowLeft className="h-5 w-5" />
                        </Button>
                    </Link>
                    <div>
                        <h2 className="text-3xl font-bold tracking-tight">Detail Prepare Produksi</h2>
                        <p className="text-muted-foreground">Logsheet hasil prepare shift.</p>
                    </div>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" onClick={() => window.print()}>
                        <Printer className="mr-2 h-4 w-4" /> Cetak
                    </Button>
                    {/* Simplified download for demo */}
                    <Button variant="destructive" onClick={() => window.print()}>
                        <Download className="mr-2 h-4 w-4" /> Download PDF
                    </Button>
                </div>
            </div>

            <div id="printable-area" className="bg-white p-8 rounded-xl shadow-sm border max-w-5xl mx-auto text-black">
                {/* Header Information */}
                <div className="text-center border-b-2 border-black pb-4 mb-6">
                    <h1 className="text-2xl font-bold uppercase">PT Pesta Pora Abadi</h1>
                    <h2 className="text-xl font-bold uppercase mt-1">Laporan Logsheet Prepare Produksi</h2>
                </div>

                <div className="grid grid-cols-4 gap-4 mb-8">
                    <div>
                        <div className="text-xs font-bold text-gray-500 uppercase">Tanggal</div>
                        <div className="font-bold">{header.date}</div>
                    </div>
                    <div>
                        <div className="text-xs font-bold text-gray-500 uppercase">Shift</div>
                        <div className="font-bold">{header.shift}</div>
                    </div>
                    <div>
                        <div className="text-xs font-bold text-gray-500 uppercase">Supervisor</div>
                        <div className="font-bold">{header.spv_name}</div>
                    </div>
                    <div>
                        <div className="text-xs font-bold text-gray-500 uppercase">Total Resep Plan</div>
                        <div className="font-bold">{header.total_recipe_plan} batch</div>
                    </div>
                </div>

                <h3 className="font-bold uppercase mb-2">1. Rincian Produksi</h3>
                <Table className="mb-8 border">
                    <TableHeader className="bg-gray-100">
                        <TableRow>
                            <TableHead className="border border-gray-300 text-black">Produk</TableHead>
                            <TableHead className="border border-gray-300 text-center text-black">Plan</TableHead>
                            <TableHead className="border border-gray-300 text-center text-black">Real</TableHead>
                            <TableHead className="border border-gray-300 text-center text-black">Dikichi</TableHead>
                            <TableHead className="border border-gray-300 text-center text-black">Adonan Akhir</TableHead>
                            <TableHead className="border border-gray-300 text-center text-black">Adonan Masuk</TableHead>
                            <TableHead className="border border-gray-300 text-center text-black">Selisih</TableHead>
                            <TableHead className="border border-gray-300 text-center text-black">Waste (gr)</TableHead>
                            <TableHead className="border border-gray-300 text-center text-black">Retur (gr)</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {products.map(prod => {
                            const plan = getDetail('productDetails', prod, 'recipe_plan');
                            const real = getDetail('productDetails', prod, 'recipe_real');
                            const selisih = (plan !== '-' && real !== '-') ? (parseFloat(real) - parseFloat(plan)) : '-';
                            return (
                                <TableRow key={prod}>
                                    <TableCell className="border border-gray-300 font-bold capitalize">{prod}</TableCell>
                                    <TableCell className="border border-gray-300 text-center">{plan}</TableCell>
                                    <TableCell className="border border-gray-300 text-center font-bold">{real}</TableCell>
                                    <TableCell className="border border-gray-300 text-center">{getDetail('productDetails', prod, 'dikichi')}</TableCell>
                                    <TableCell className="border border-gray-300 text-center">{getDetail('productDetails', prod, 'adonan_akhir_gr')}</TableCell>
                                    <TableCell className="border border-gray-300 text-center">{getDetail('productDetails', prod, 'adonan_masuk_gr')}</TableCell>
                                    <TableCell className="border border-gray-300 text-center font-bold">{selisih}</TableCell>
                                    <TableCell className="border border-gray-300 text-center">{getDetail('productDetails', prod, 'waste_gr')}</TableCell>
                                    <TableCell className="border border-gray-300 text-center">{getDetail('productDetails', prod, 'retur_gr')}</TableCell>
                                </TableRow>
                            );
                        })}
                        <TableRow className="bg-gray-50">
                            <TableCell className="border border-gray-300 font-bold">Total Realisasi</TableCell>
                            <TableCell colSpan={8} className="border border-gray-300 font-bold text-center">{header.total_recipe_real || '-'} batch</TableCell>
                        </TableRow>
                    </TableBody>
                </Table>

                <div className="grid grid-cols-2 gap-8 mb-8">
                    <div>
                        <h3 className="font-bold uppercase mb-2">2. Serah Terima (gr)</h3>
                        <Table className="border">
                            <TableBody>
                                <TableRow>
                                    <TableCell className="border border-gray-300">Topping</TableCell>
                                    <TableCell className="border border-gray-300 text-center font-bold">{getTopping('topping_weight_gr')}</TableCell>
                                </TableRow>
                                {products.map(prod => (
                                    <TableRow key={prod}>
                                        <TableCell className="border border-gray-300 capitalize">{prod} (Retur)</TableCell>
                                        <TableCell className="border border-gray-300 text-center font-bold">{getDetail('returDetails', prod, 'serah_terima_retur_gr')}</TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                    <div>
                        <h3 className="font-bold uppercase mb-2">3. Pencatatan Waste (gr)</h3>
                        <Table className="border">
                            <TableBody>
                                {['plastik', 'ham_adonan', 'bowlcutter_dimsum'].map(waste => (
                                    <TableRow key={waste}>
                                        <TableCell className="border border-gray-300 capitalize">{waste.replace('_', ' ')}</TableCell>
                                        <TableCell className="border border-gray-300 text-center font-bold">{getDetail('wasteLogs', waste, 'weight_gr')}</TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                </div>

                <h3 className="font-bold uppercase mb-2">4. Penggunaan Bahan Kulit</h3>
                <Table className="mb-8 border">
                    <TableHeader className="bg-gray-100">
                        <TableRow>
                            <TableHead className="border border-gray-300 text-black">Jenis Kulit</TableHead>
                            <TableHead className="border border-gray-300 text-center text-black">Masuk</TableHead>
                            <TableHead className="border border-gray-300 text-center text-black">Sisa Pack</TableHead>
                            <TableHead className="border border-gray-300 text-center text-black">Sisa Unit</TableHead>
                            <TableHead className="border border-gray-300 text-center text-black">W. Manual</TableHead>
                            <TableHead className="border border-gray-300 text-center text-black">W. Tandon</TableHead>
                            <TableHead className="border border-gray-300 text-center text-black">Retur Pro-WH</TableHead>
                            <TableHead className="border border-gray-300 text-center text-black">Retur WH-Pro</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {['kulit_siomay', 'kulit_tahu'].map(skin => (
                            <TableRow key={skin}>
                                <TableCell className="border border-gray-300 font-bold capitalize">{skin.replace('_', ' ')}</TableCell>
                                <TableCell className="border border-gray-300 text-center">{getDetail('skinMaterials', skin, 'masuk')}</TableCell>
                                <TableCell className="border border-gray-300 text-center">{getDetail('skinMaterials', skin, 'sisa_pack')}</TableCell>
                                <TableCell className="border border-gray-300 text-center">{getDetail('skinMaterials', skin, 'sisa_unit')}</TableCell>
                                <TableCell className="border border-gray-300 text-center">{getDetail('skinMaterials', skin, 'waste_manual_gr')}</TableCell>
                                <TableCell className="border border-gray-300 text-center">{getDetail('skinMaterials', skin, 'waste_tandon_gr')}</TableCell>
                                <TableCell className="border border-gray-300 text-center">{getDetail('skinMaterials', skin, 'retur_pro_wh')}</TableCell>
                                <TableCell className="border border-gray-300 text-center">{getDetail('skinMaterials', skin, 'retur_wh_pro')}</TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>

                <h3 className="font-bold uppercase mb-2">5. Catatan / Keterangan</h3>
                <div className="border border-gray-300 p-4 min-h-[80px] italic mb-8 whitespace-pre-line">
                    {header.notes || 'Tidak ada catatan tambahan.'}
                </div>

                <div className="text-right text-sm mb-2 mt-4">
                    Malang, {new Date(header.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                </div>
                <div className="grid grid-cols-3 gap-4 text-center">
                    <div>
                        <p className="mb-1">Dibuat Oleh,</p>
                        <p className="font-bold mb-4">Admin Produksi</p>
                        <div className="h-16 border border-dashed border-gray-400 flex items-center justify-center mx-8">
                            <span className="text-gray-400 text-xs">Menunggu Validasi</span>
                        </div>
                    </div>
                    <div>
                        <p className="mb-1">Diperiksa Oleh,</p>
                        <p className="font-bold mb-4">SPV Prepare Produksi</p>
                        <div className="h-16 flex flex-col items-center justify-center relative">
                            <span className="font-signature text-2xl -rotate-6 block mb-2">{header.spv_name}</span>
                            <span className="text-green-600 text-[10px] font-bold absolute bottom-0 right-10">✓ Verified</span>
                        </div>
                        <p className="font-bold mt-2 uppercase">{header.spv_name}</p>
                    </div>
                    <div>
                        <p className="mb-1">Diketahui Oleh,</p>
                        <p className="font-bold mb-4">Manager Produksi</p>
                        <div className="h-16 border border-dashed border-gray-400 flex items-center justify-center mx-8">
                            <span className="text-gray-400 text-xs">Menunggu Validasi</span>
                        </div>
                    </div>
                </div>
                
                <style>{`
                    @import url('https://fonts.googleapis.com/css2?family=Dancing+Script:wght@700&display=swap');
                    .font-signature { font-family: 'Dancing Script', cursive; }
                    @media print {
                        body * { visibility: hidden; }
                        #printable-area, #printable-area * { visibility: visible; }
                        #printable-area { position: absolute; left: 0; top: 0; width: 100%; box-shadow: none; border: none; padding: 0; }
                    }
                `}</style>
            </div>
        </AppLayout>
    );
}
