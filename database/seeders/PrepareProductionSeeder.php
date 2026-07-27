<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\PrepareHeader;
use Carbon\Carbon;

class PrepareProductionSeeder extends Seeder
{
    public function run(): void
    {
        // 1. Data Planned (Belum disubmit admin)
        $header1 = PrepareHeader::create([
            'date' => Carbon::today()->toDateString(),
            'shift' => '1',
            'spv_name' => 'ROFI',
            'status' => 'planned',
            'total_recipe_plan' => 150.50,
            'total_recipe_real' => null,
            'notes' => 'Tolong persiapkan bahan lebih awal.'
        ]);

        $products = ['siomay', 'pentol', 'lumpia'];
        foreach ($products as $product) {
            $header1->productDetails()->create([
                'product_type' => $product,
                'recipe_plan' => 50.15,
            ]);
        }

        // 2. Data Completed (Sudah disubmit admin)
        $header2 = PrepareHeader::create([
            'date' => Carbon::yesterday()->toDateString(),
            'shift' => '2',
            'spv_name' => 'JERE',
            'status' => 'completed',
            'total_recipe_plan' => 200.00,
            'total_recipe_real' => 195.50,
            'notes' => 'Ada retur sedikit di siomay.'
        ]);

        foreach ($products as $product) {
            $header2->productDetails()->create([
                'product_type' => $product,
                'recipe_plan' => 66.66,
                'recipe_real' => 65.10,
                'dikichi' => 2000,
                'adonan_akhir_gr' => 2500,
                'adonan_masuk_gr' => 500,
                'waste_gr' => 10,
                'retur_gr' => 5,
            ]);
            
            $header2->returDetails()->create([
                'product_type' => $product,
                'serah_terima_retur_gr' => 15,
                'retur_prepare_to_produksi_gr' => 5,
            ]);
        }

        $skins = ['kulit_siomay', 'kulit_tahu'];
        foreach ($skins as $skin) {
            $header2->skinMaterials()->create([
                'material_type' => $skin,
                'masuk' => 100,
                'sisa_pack' => 2,
                'sisa_unit' => 0.5,
                'waste_manual_gr' => 10,
                'waste_tandon_gr' => 5,
                'retur_pro_wh' => 2,
                'retur_wh_pro' => 1,
            ]);
        }
        
        $wastes = ['plastik', 'ham_adonan', 'bowlcutter_dimsum'];
        foreach ($wastes as $waste) {
            $header2->wasteLogs()->create([
                'waste_type' => $waste,
                'weight_gr' => 12.5,
            ]);
        }

        $header2->toppings()->create([
            'topping_weight_gr' => 250.75,
        ]);
        
        // 3. Data Planned 2
        $header3 = PrepareHeader::create([
            'date' => Carbon::now()->subDays(2)->toDateString(),
            'shift' => '3',
            'spv_name' => 'IS',
            'status' => 'planned',
            'total_recipe_plan' => 300,
            'total_recipe_real' => null,
            'notes' => ''
        ]);

        foreach ($products as $product) {
            $header3->productDetails()->create([
                'product_type' => $product,
                'recipe_plan' => 100,
            ]);
        }
    }
}
