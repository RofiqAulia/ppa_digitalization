<?php

namespace App\Http\Controllers;

use App\Models\PrepareHeader;
use App\Models\PrepareProductDetail;
use App\Models\PrepareReturDetail;
use App\Models\PrepareSkinMaterial;
use App\Models\PrepareTopping;
use App\Models\PrepareWasteLog;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class PrepareProductionController extends Controller
{
    public function index()
    {
        $headers = PrepareHeader::with(['productDetails', 'skinMaterials', 'wasteLogs', 'returDetails', 'toppings'])->latest()->get();
        return Inertia::render('PrepareProduksi/Index', ['headers' => $headers]);
    }

    public function create()
    {
        return Inertia::render('PrepareProduksi/Form', ['header' => new PrepareHeader()]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'date' => 'required|date',
            'shift' => 'required|in:1,2,3',
            'spv_name' => 'required|in:IS,ROFI,JERE,IMAN,MUN,KA,ABDI,APRI',
            'total_recipe_plan' => 'required|numeric|min:0',
            'products' => 'required|array',
            'products.*.recipe_plan' => 'required|numeric|min:0',
        ]);

        try {
            DB::beginTransaction();

            $header = PrepareHeader::create([
                'date' => $request->date,
                'shift' => $request->shift,
                'spv_name' => $request->spv_name,
                'status' => 'planned',
                'total_recipe_plan' => $request->total_recipe_plan,
            ]);

            foreach ($request->products as $type => $data) {
                if (in_array($type, ['siomay', 'pentol', 'lumpia'])) {
                    PrepareProductDetail::create([
                        'prepare_header_id' => $header->id,
                        'product_type' => $type,
                        'recipe_plan' => $data['recipe_plan'] ?? 0,
                    ]);
                }
            }

            DB::commit();

            return redirect()->route('prepare-produksi.index')->with('success', 'Plan data saved successfully.');

        } catch (\Exception $e) {
            DB::rollBack();
            return back()->withInput()->with('error', 'Failed to save data: ' . $e->getMessage());
        }
    }

    public function show(PrepareHeader $prepareProduksi)
    {
        $prepareProduksi->load(['productDetails', 'skinMaterials', 'wasteLogs', 'returDetails', 'toppings']);
        return Inertia::render('PrepareProduksi/Show', ['header' => $prepareProduksi]);
    }

    public function edit(PrepareHeader $prepareProduksi)
    {
        $prepareProduksi->load(['productDetails', 'skinMaterials', 'wasteLogs', 'returDetails', 'toppings']);
        return Inertia::render('PrepareProduksi/Form', ['header' => $prepareProduksi]);
    }

    public function update(Request $request, PrepareHeader $prepareProduksi)
    {
        if ($request->pin !== '123456') {
            return back()->withInput()->with('error', 'Invalid PIN Code.');
        }

        $request->validate([
            'total_recipe_real' => 'required|numeric|min:0',
            'notes' => 'nullable|string',
            'products' => 'required|array',
        ]);

        try {
            DB::beginTransaction();

            $prepareProduksi->update([
                'total_recipe_real' => $request->total_recipe_real,
                'notes' => $request->notes,
                'status' => 'completed'
            ]);

            if ($request->has('products')) {
                foreach ($request->products as $type => $data) {
                    $detail = PrepareProductDetail::where('prepare_header_id', $prepareProduksi->id)
                                ->where('product_type', $type)->first();
                    if ($detail) {
                        $detail->update([
                            'recipe_real' => $data['recipe_real'] ?? null,
                            'dikichi' => $data['dikichi'] ?? null,
                            'adonan_akhir_gr' => $data['adonan_akhir_gr'] ?? null,
                            'adonan_masuk_gr' => $data['adonan_masuk_gr'] ?? null,
                            'waste_gr' => $data['waste_gr'] ?? null,
                            'retur_gr' => $data['retur_gr'] ?? null,
                        ]);
                    } else {
                         PrepareProductDetail::create([
                            'prepare_header_id' => $prepareProduksi->id,
                            'product_type' => $type,
                            'recipe_plan' => 0,
                            'recipe_real' => $data['recipe_real'] ?? null,
                            'dikichi' => $data['dikichi'] ?? null,
                            'adonan_akhir_gr' => $data['adonan_akhir_gr'] ?? null,
                            'adonan_masuk_gr' => $data['adonan_masuk_gr'] ?? null,
                            'waste_gr' => $data['waste_gr'] ?? null,
                            'retur_gr' => $data['retur_gr'] ?? null,
                         ]);
                    }
                }
            }

            if ($request->has('skins')) {
                foreach ($request->skins as $type => $data) {
                    PrepareSkinMaterial::updateOrCreate(
                        ['prepare_header_id' => $prepareProduksi->id, 'material_type' => $type],
                        [
                            'masuk' => $data['masuk'] ?? null,
                            'sisa_pack' => $data['sisa_pack'] ?? null,
                            'sisa_unit' => $data['sisa_unit'] ?? null,
                            'waste_manual_gr' => $data['waste_manual_gr'] ?? null,
                            'waste_tandon_gr' => $data['waste_tandon_gr'] ?? null,
                            'retur_pro_wh' => $data['retur_pro_wh'] ?? null,
                            'retur_wh_pro' => $data['retur_wh_pro'] ?? null,
                        ]
                    );
                }
            }

            if ($request->has('wastes')) {
                foreach ($request->wastes as $type => $data) {
                    PrepareWasteLog::updateOrCreate(
                        ['prepare_header_id' => $prepareProduksi->id, 'waste_type' => $type],
                        ['weight_gr' => $data['weight_gr'] ?? null]
                    );
                }
            }

            if ($request->has('returs')) {
                foreach ($request->returs as $type => $data) {
                    PrepareReturDetail::updateOrCreate(
                        ['prepare_header_id' => $prepareProduksi->id, 'product_type' => $type],
                        [
                            'serah_terima_retur_gr' => $data['serah_terima_retur_gr'] ?? null,
                            'retur_prepare_to_produksi_gr' => $data['retur_prepare_to_produksi_gr'] ?? null,
                        ]
                    );
                }
            }

            if ($request->has('toppings')) {
                 PrepareTopping::updateOrCreate(
                        ['prepare_header_id' => $prepareProduksi->id],
                        ['topping_weight_gr' => $request->toppings['topping_weight_gr'] ?? null]
                 );
            }

            DB::commit();

            return redirect()->route('prepare-produksi.index')->with('success', 'Realization data saved successfully.');

        } catch (\Exception $e) {
            DB::rollBack();
            return back()->withInput()->with('error', 'Failed to save data: ' . $e->getMessage());
        }
    }
}
