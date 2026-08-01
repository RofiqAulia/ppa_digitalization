<?php
require 'vendor/autoload.php';
$app = require_once 'bootstrap/app.php';
$app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap();

$logsheets = App\Models\IqfLogsheet::whereIn('id', [4, 5, 6])->get(['id', 'date', 'shift', 'product_type', 'machine'])->toArray();
echo json_encode($logsheets, JSON_PRETTY_PRINT);
