import React, { useState, useEffect } from 'react';
import { Head, useForm } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export default function Form({ header }) {
    const isEdit = !!header.id;
    
    // Setup initial products data based on existing DB relations or default zero
    const getProductPlan = (type) => {
        if (!isEdit) return 0;
        const prod = header.product_details?.find(p => p.product_type === type);
        return prod ? prod.recipe_plan : 0;
    };
    
    const getProductReal = (type) => {
        if (!isEdit) return '';
        const prod = header.product_details?.find(p => p.product_type === type);
        return prod ? prod.recipe_real : '';
    };

    const getProductField = (type, field) => {
        if (!isEdit) return '';
        const prod = header.product_details?.find(p => p.product_type === type);
        return prod ? (prod[field] || '') : '';
    };

    const getSkinField = (type, field) => {
        if (!isEdit) return '';
        const skin = header.skin_materials?.find(s => s.material_type === type);
        return skin ? (skin[field] || '') : '';
    };

    const getWasteField = (type, field) => {
        if (!isEdit) return '';
        const waste = header.waste_logs?.find(w => w.waste_type === type);
        return waste ? (waste[field] || '') : '';
    };

    const getReturField = (type, field) => {
        if (!isEdit) return '';
        const retur = header.retur_details?.find(r => r.product_type === type);
        return retur ? (retur[field] || '') : '';
    };

    const getToppingField = (field) => {
        if (!isEdit) return '';
        const top = header.toppings && header.toppings.length > 0 ? header.toppings[0] : null;
        return top ? (top[field] || '') : '';
    };

    const { data, setData, post, put, processing, errors } = useForm({
        date: header.date || '',
        shift: header.shift || '',
        spv_name: header.spv_name || '',
        total_recipe_plan: header.total_recipe_plan || 0,
        total_recipe_real: header.total_recipe_real || '',
        notes: header.notes || '',
        pin: '',
        products: {
            siomay: {
                recipe_plan: getProductPlan('siomay'),
                recipe_real: getProductReal('siomay'),
                dikichi: getProductField('siomay', 'dikichi'),
                adonan_akhir_gr: getProductField('siomay', 'adonan_akhir_gr'),
                adonan_masuk_gr: getProductField('siomay', 'adonan_masuk_gr'),
                waste_gr: getProductField('siomay', 'waste_gr'),
                retur_gr: getProductField('siomay', 'retur_gr'),
            },
            pentol: {
                recipe_plan: getProductPlan('pentol'),
                recipe_real: getProductReal('pentol'),
                dikichi: getProductField('pentol', 'dikichi'),
                adonan_akhir_gr: getProductField('pentol', 'adonan_akhir_gr'),
                adonan_masuk_gr: getProductField('pentol', 'adonan_masuk_gr'),
                waste_gr: getProductField('pentol', 'waste_gr'),
                retur_gr: getProductField('pentol', 'retur_gr'),
            },
            lumpia: {
                recipe_plan: getProductPlan('lumpia'),
                recipe_real: getProductReal('lumpia'),
                dikichi: getProductField('lumpia', 'dikichi'),
                adonan_akhir_gr: getProductField('lumpia', 'adonan_akhir_gr'),
                adonan_masuk_gr: getProductField('lumpia', 'adonan_masuk_gr'),
                waste_gr: getProductField('lumpia', 'waste_gr'),
                retur_gr: getProductField('lumpia', 'retur_gr'),
            }
        },
        skins: {
            kulit_siomay: { masuk: getSkinField('kulit_siomay', 'masuk'), sisa_pack: getSkinField('kulit_siomay', 'sisa_pack'), sisa_unit: getSkinField('kulit_siomay', 'sisa_unit'), waste_manual_gr: getSkinField('kulit_siomay', 'waste_manual_gr'), waste_tandon_gr: getSkinField('kulit_siomay', 'waste_tandon_gr'), retur_pro_wh: getSkinField('kulit_siomay', 'retur_pro_wh'), retur_wh_pro: getSkinField('kulit_siomay', 'retur_wh_pro') },
            kulit_tahu: { masuk: getSkinField('kulit_tahu', 'masuk'), sisa_pack: getSkinField('kulit_tahu', 'sisa_pack'), sisa_unit: getSkinField('kulit_tahu', 'sisa_unit'), waste_manual_gr: getSkinField('kulit_tahu', 'waste_manual_gr'), waste_tandon_gr: getSkinField('kulit_tahu', 'waste_tandon_gr'), retur_pro_wh: getSkinField('kulit_tahu', 'retur_pro_wh'), retur_wh_pro: getSkinField('kulit_tahu', 'retur_wh_pro') }
        },
        wastes: {
            plastik: { weight_gr: getWasteField('plastik', 'weight_gr') },
            ham_adonan: { weight_gr: getWasteField('ham_adonan', 'weight_gr') },
            bowlcutter_dimsum: { weight_gr: getWasteField('bowlcutter_dimsum', 'weight_gr') }
        },
        returs: {
            siomay: { serah_terima_retur_gr: getReturField('siomay', 'serah_terima_retur_gr'), retur_prepare_to_produksi_gr: getReturField('siomay', 'retur_prepare_to_produksi_gr') },
            pentol: { serah_terima_retur_gr: getReturField('pentol', 'serah_terima_retur_gr'), retur_prepare_to_produksi_gr: getReturField('pentol', 'retur_prepare_to_produksi_gr') },
            lumpia: { serah_terima_retur_gr: getReturField('lumpia', 'serah_terima_retur_gr'), retur_prepare_to_produksi_gr: getReturField('lumpia', 'retur_prepare_to_produksi_gr') },
        },
        toppings: {
            topping_weight_gr: getToppingField('topping_weight_gr')
        }
    });

    useEffect(() => {
        const s = parseFloat(data.products.siomay.recipe_plan) || 0;
        const p = parseFloat(data.products.pentol.recipe_plan) || 0;
        const l = parseFloat(data.products.lumpia.recipe_plan) || 0;
        setData('total_recipe_plan', s + p + l);
    }, [data.products.siomay.recipe_plan, data.products.pentol.recipe_plan, data.products.lumpia.recipe_plan]);

    const handleSubmit = (e) => {
        e.preventDefault();
        if (isEdit) {
            put(`/prepare-produksi/${header.id}`);
        } else {
            post('/prepare-produksi');
        }
    };

    const handleProductChange = (product, field, value) => {
        setData('products', {
            ...data.products,
            [product]: {
                ...data.products[product],
                [field]: value
            }
        });
    };

    return (
        <AppLayout>
            <Head title={isEdit ? "Edit Prepare Produksi" : "Tambah Prepare Produksi"} />
            
            <div className="mb-6">
                <h2 className="text-3xl font-bold tracking-tight">{isEdit ? "Update Realisasi Prepare" : "Buat Plan Prepare"}</h2>
            </div>

            <form onSubmit={handleSubmit}>
                <Tabs defaultValue="info" className="w-full">
                    <TabsList className="mb-4">
                        <TabsTrigger value="info">Info Header</TabsTrigger>
                        <TabsTrigger value="produk">Produk Utama</TabsTrigger>
                        {isEdit && (
                            <>
                                <TabsTrigger value="bahan">Bahan Kulit & Topping</TabsTrigger>
                                <TabsTrigger value="waste">Waste & Retur Tambahan</TabsTrigger>
                                <TabsTrigger value="review">Review & Submit</TabsTrigger>
                            </>
                        )}
                    </TabsList>
                    
                    <TabsContent value="info">
                        <Card>
                            <CardHeader><CardTitle>Informasi Header</CardTitle></CardHeader>
                            <CardContent className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>Tanggal</Label>
                                    <Input type="date" value={data.date} onChange={e => setData('date', e.target.value)} disabled={isEdit} />
                                </div>
                                <div className="space-y-2">
                                    <Label>Shift</Label>
                                    <Select value={String(data.shift)} onValueChange={v => setData('shift', v)} disabled={isEdit}>
                                        <SelectTrigger><SelectValue placeholder="Pilih Shift" /></SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="1">Shift 1</SelectItem>
                                            <SelectItem value="2">Shift 2</SelectItem>
                                            <SelectItem value="3">Shift 3</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label>SPV Name</Label>
                                    <Select value={data.spv_name} onValueChange={v => setData('spv_name', v)} disabled={isEdit}>
                                        <SelectTrigger><SelectValue placeholder="Pilih SPV" /></SelectTrigger>
                                        <SelectContent>
                                            {['IS', 'ROFI', 'JERE', 'IMAN', 'MUN', 'KA', 'ABDI', 'APRI'].map(spv => (
                                                <SelectItem key={spv} value={spv}>{spv}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label>Total Resep Plan</Label>
                                    <Input type="number" value={data.total_recipe_plan} disabled />
                                </div>
                                {isEdit && (
                                    <div className="space-y-2 col-span-2">
                                        <Label className="text-primary">Total Resep Real (Admin)</Label>
                                        <Input type="number" step="0.01" value={data.total_recipe_real} onChange={e => setData('total_recipe_real', e.target.value)} />
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="produk">
                        <Card>
                            <CardHeader><CardTitle>Produk Utama</CardTitle></CardHeader>
                            <CardContent className="space-y-6">
                                {['siomay', 'pentol', 'lumpia'].map(prod => (
                                    <div key={prod} className="border p-4 rounded-lg">
                                        <h4 className="font-bold capitalize mb-4">{prod}</h4>
                                        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                                            <div className="space-y-2">
                                                <Label>Resep Plan</Label>
                                                <Input type="number" step="0.01" value={data.products[prod].recipe_plan} onChange={e => handleProductChange(prod, 'recipe_plan', e.target.value)} disabled={isEdit} />
                                            </div>
                                            {isEdit && (
                                                <>
                                                    <div className="space-y-2">
                                                        <Label className="text-primary">Resep Realisasi</Label>
                                                        <Input type="number" step="0.01" value={data.products[prod].recipe_real} onChange={e => handleProductChange(prod, 'recipe_real', e.target.value)} />
                                                    </div>
                                                    <div className="space-y-2">
                                                        <Label>Dikichi (gr)</Label>
                                                        <Input type="number" step="0.01" value={data.products[prod].dikichi} onChange={e => handleProductChange(prod, 'dikichi', e.target.value)} />
                                                    </div>
                                                    <div className="space-y-2">
                                                        <Label>Adonan Akhir (gr)</Label>
                                                        <Input type="number" step="0.01" value={data.products[prod].adonan_akhir_gr} onChange={e => handleProductChange(prod, 'adonan_akhir_gr', e.target.value)} />
                                                    </div>
                                                    <div className="space-y-2">
                                                        <Label>Adonan Masuk (gr)</Label>
                                                        <Input type="number" step="0.01" value={data.products[prod].adonan_masuk_gr} onChange={e => handleProductChange(prod, 'adonan_masuk_gr', e.target.value)} />
                                                    </div>
                                                    <div className="space-y-2">
                                                        <Label>Waste (gr)</Label>
                                                        <Input type="number" step="0.01" value={data.products[prod].waste_gr} onChange={e => handleProductChange(prod, 'waste_gr', e.target.value)} />
                                                    </div>
                                                </>
                                            )}
                                        </div>
                                    </div>
                                ))}
                                {!isEdit && (
                                    <div className="flex justify-end mt-4">
                                        <Button type="submit" disabled={processing}>Simpan Plan</Button>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* Basic Implementation for Other Tabs */}
                    {isEdit && (
                        <>
                            <TabsContent value="bahan">
                                <Card>
                                    <CardHeader><CardTitle>Bahan Kulit & Topping</CardTitle></CardHeader>
                                    <CardContent className="space-y-6">
                                        <div className="border p-4 rounded-lg">
                                            <h4 className="font-bold mb-4">Penggunaan Topping</h4>
                                            <div className="space-y-2 max-w-sm">
                                                <Label>Serah Terima Topping (gr)</Label>
                                                <Input type="number" step="0.01" value={data.toppings.topping_weight_gr} onChange={e => setData('toppings', { topping_weight_gr: e.target.value })} />
                                            </div>
                                        </div>
                                        {['kulit_siomay', 'kulit_tahu'].map(skin => (
                                            <div key={skin} className="border p-4 rounded-lg">
                                                <h4 className="font-bold capitalize mb-4">{skin.replace('_', ' ')}</h4>
                                                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
                                                    <div className="space-y-2">
                                                        <Label>Masuk</Label>
                                                        <Input type="number" step="0.01" value={data.skins[skin].masuk} onChange={e => setData('skins', {...data.skins, [skin]: {...data.skins[skin], masuk: e.target.value}})} />
                                                    </div>
                                                    <div className="space-y-2">
                                                        <Label>Sisa Pack</Label>
                                                        <Input type="number" step="0.01" value={data.skins[skin].sisa_pack} onChange={e => setData('skins', {...data.skins, [skin]: {...data.skins[skin], sisa_pack: e.target.value}})} />
                                                    </div>
                                                    <div className="space-y-2">
                                                        <Label>Sisa Unit</Label>
                                                        <Input type="number" step="0.01" value={data.skins[skin].sisa_unit} onChange={e => setData('skins', {...data.skins, [skin]: {...data.skins[skin], sisa_unit: e.target.value}})} />
                                                    </div>
                                                    <div className="space-y-2">
                                                        <Label>W. Manual</Label>
                                                        <Input type="number" step="0.01" value={data.skins[skin].waste_manual_gr} onChange={e => setData('skins', {...data.skins, [skin]: {...data.skins[skin], waste_manual_gr: e.target.value}})} />
                                                    </div>
                                                    <div className="space-y-2">
                                                        <Label>W. Tandon</Label>
                                                        <Input type="number" step="0.01" value={data.skins[skin].waste_tandon_gr} onChange={e => setData('skins', {...data.skins, [skin]: {...data.skins[skin], waste_tandon_gr: e.target.value}})} />
                                                    </div>
                                                    <div className="space-y-2">
                                                        <Label>Retur PRO-WH</Label>
                                                        <Input type="number" step="0.01" value={data.skins[skin].retur_pro_wh} onChange={e => setData('skins', {...data.skins, [skin]: {...data.skins[skin], retur_pro_wh: e.target.value}})} />
                                                    </div>
                                                    <div className="space-y-2">
                                                        <Label>Retur WH-PRO</Label>
                                                        <Input type="number" step="0.01" value={data.skins[skin].retur_wh_pro} onChange={e => setData('skins', {...data.skins, [skin]: {...data.skins[skin], retur_wh_pro: e.target.value}})} />
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </CardContent>
                                </Card>
                            </TabsContent>
                            <TabsContent value="waste">
                                <Card>
                                    <CardHeader><CardTitle>Waste & Retur Tambahan</CardTitle></CardHeader>
                                    <CardContent className="space-y-6">
                                        <div className="grid md:grid-cols-2 gap-6">
                                            <div className="border p-4 rounded-lg">
                                                <h4 className="font-bold mb-4">Pencatatan Waste Khusus</h4>
                                                <div className="space-y-4">
                                                    {['plastik', 'ham_adonan', 'bowlcutter_dimsum'].map(w => (
                                                        <div key={w} className="space-y-2">
                                                            <Label className="capitalize">{w.replace('_', ' ')} (gr)</Label>
                                                            <Input type="number" step="0.01" value={data.wastes[w].weight_gr} onChange={e => setData('wastes', {...data.wastes, [w]: { weight_gr: e.target.value }})} />
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                            <div className="border p-4 rounded-lg">
                                                <h4 className="font-bold mb-4">Retur Tambahan</h4>
                                                <div className="space-y-4">
                                                    {['siomay', 'pentol', 'lumpia'].map(prod => (
                                                        <div key={prod} className="space-y-2 border-b pb-4 mb-2">
                                                            <Label className="capitalize font-bold text-primary">{prod}</Label>
                                                            <div className="grid grid-cols-2 gap-2 mt-2">
                                                                <div>
                                                                    <Label className="text-xs">Serah Terima (gr)</Label>
                                                                    <Input type="number" step="0.01" value={data.returs[prod].serah_terima_retur_gr} onChange={e => setData('returs', {...data.returs, [prod]: {...data.returs[prod], serah_terima_retur_gr: e.target.value}})} />
                                                                </div>
                                                                <div>
                                                                    <Label className="text-xs">Prepare to Prod (gr)</Label>
                                                                    <Input type="number" step="0.01" value={data.returs[prod].retur_prepare_to_produksi_gr} onChange={e => setData('returs', {...data.returs, [prod]: {...data.returs[prod], retur_prepare_to_produksi_gr: e.target.value}})} />
                                                                </div>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            </TabsContent>
                            <TabsContent value="review">
                                <Card>
                                    <CardHeader><CardTitle>Review & Submit</CardTitle></CardHeader>
                                    <CardContent className="space-y-6">
                                        <div className="space-y-2">
                                            <Label>Catatan Tambahan (Opsional)</Label>
                                            <textarea 
                                                className="w-full min-h-[100px] border border-gray-300 rounded-md p-2" 
                                                value={data.notes} 
                                                onChange={e => setData('notes', e.target.value)}
                                            ></textarea>
                                        </div>
                                        <div className="space-y-2 max-w-sm">
                                            <Label>PIN Otorisasi SPV</Label>
                                            <Input type="password" value={data.pin} onChange={e => setData('pin', e.target.value)} required />
                                            {errors.pin && <p className="text-sm text-red-500">{errors.pin}</p>}
                                        </div>
                                        <Button type="submit" disabled={processing} className="w-full sm:w-auto">Submit Realisasi</Button>
                                    </CardContent>
                                </Card>
                            </TabsContent>
                        </>
                    )}
                </Tabs>
            </form>
        </AppLayout>
    );
}
