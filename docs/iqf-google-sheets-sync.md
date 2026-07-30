# IQF Google Sheets Sync

Integrasi ini menjalankan sync dari MySQL production ke Google Sheets tanpa Google Apps Script.

Alur:

```text
Operator -> Website Laravel -> MySQL -> Laravel command -> Google Sheets API -> RAW_DATA -> Report existing
```

MySQL tetap menjadi source of truth. Command hanya membaca tabel `iqf_logsheets` dan `iqf_logsheet_details`, lalu menulis hasil transform ke sheet `RAW_DATA`.

## Sheet

Spreadsheet:

```text
1ul3PXJZjHrV6iSPJpoONlrl-Ag2loSPI4pcIn0K3hok
```

Report existing:

```text
(form biru)REPORT IQF DIMSUM
```

RAW data:

```text
RAW_DATA
```

Struktur `RAW_DATA`:

```text
ID | TGL | SHIFT | JENIS | NO_IQF | WAKTU | JAM | JUMLAH | SYNCED_AT
```

## Mapping

```text
iqf_logsheet_details.id         -> ID
iqf_logsheets.date              -> TGL
iqf_logsheets.shift             -> SHIFT
iqf_logsheets.product_type      -> JENIS
iqf_logsheets.machine           -> NO_IQF
iqf_logsheet_details.time       -> WAKTU
floor(iqf_logsheet_details.time)-> JAM
iqf_logsheet_details.tray_count -> JUMLAH
```

Transform produk:

```text
siomay         -> SIOMAY
pentol         -> PENTOL
lumpia         -> LUMPIA
adonan_pangsit -> ADONAN
```

## Setup Google Service Account

1. Buat project di Google Cloud Console.
2. Enable Google Sheets API.
3. Buat Service Account.
4. Buat JSON key untuk service account.
5. Share spreadsheet ke email service account sebagai Editor.

Contoh email service account:

```text
iqf-sync@nama-project.iam.gserviceaccount.com
```

## Environment

Tambahkan ke `.env` production:

```env
GOOGLE_SHEETS_IQF_SPREADSHEET_ID=1ul3PXJZjHrV6iSPJpoONlrl-Ag2loSPI4pcIn0K3hok
GOOGLE_SHEETS_IQF_RAW_SHEET=RAW_DATA
GOOGLE_SHEETS_IQF_REPORT_SHEET="(form biru)REPORT IQF DIMSUM"
GOOGLE_SHEETS_IQF_BATCH_SIZE=500

GOOGLE_SERVICE_ACCOUNT_EMAIL=isi-client-email-dari-json
GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nisi-private-key-dari-json\n-----END PRIVATE KEY-----\n"
```

Jangan commit `.env` atau file JSON credential.

## Command

Dry run tanpa menulis ke Google Sheets:

```bash
php artisan iqf:sync-google-sheets --dry-run
```

Initial sync:

```bash
php artisan iqf:sync-google-sheets --initial
```

Sync incremental:

```bash
php artisan iqf:sync-google-sheets
```

State last synced ID disimpan di:

```text
storage/app/iqf-google-sheets-sync.json
```

## Cron 5 Menit

Di Hostinger cron job:

```bash
cd /path/to/project && php artisan iqf:sync-google-sheets >> storage/logs/iqf-google-sheets-sync.log 2>&1
```

Jadwal:

```text
*/5 * * * *
```

## Formula Report

Untuk kolom jam pertama di report, contoh `G8`:

```gs
=IFERROR(SUMIFS(RAW_DATA!$H:$H,RAW_DATA!$B:$B,$B8,RAW_DATA!$C:$C,$F8,RAW_DATA!$D:$D,$C8,RAW_DATA!$E:$E,"IQF "&$D8,RAW_DATA!$G:$G,G$2),0)
```

Copy ke kanan sampai kolom jam terakhir dan ke bawah semua baris report.

Kolom `Achieve`, contoh `AE8`:

```gs
=SUM(G8:AD8)
```

## Testing Aman

1. Share spreadsheet test ke service account.
2. Ubah sementara `GOOGLE_SHEETS_IQF_SPREADSHEET_ID` ke spreadsheet test.
3. Jalankan `php artisan iqf:sync-google-sheets --dry-run`.
4. Jalankan `php artisan iqf:sync-google-sheets --initial` di spreadsheet test.
5. Cek `RAW_DATA`.
6. Setelah benar, arahkan kembali ke spreadsheet production.

## Catatan Penting

Incremental sync saat ini memakai `iqf_logsheet_details.id > last_synced_id`.

Jika data lama diedit atau dihapus setelah pernah tersinkron, perubahan itu belum otomatis mengubah `RAW_DATA`. Bila report harus mengikuti edit/delete lama, tambahkan mekanisme rolling resync untuk 1-2 hari terakhir dengan dedupe berdasarkan `ID`.
