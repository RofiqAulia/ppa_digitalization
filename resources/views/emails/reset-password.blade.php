<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Reset Password</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
            font-family: 'Segoe UI', Arial, sans-serif;
            background-color: #f0f2f5;
            padding: 32px 16px;
        }
        .wrapper {
            max-width: 580px;
            margin: 0 auto;
        }
        /* ── HEADER ── */
        .header {
            background: linear-gradient(135deg, #b00020 0%, #7b0015 60%, #420009 100%);
            border-radius: 16px 16px 0 0;
            padding: 36px 40px 28px;
            text-align: center;
        }
        .logo-row {
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 14px;
            margin-bottom: 18px;
        }
        .logo-badge {
            background: #fff;
            border-radius: 10px;
            padding: 8px 14px;
            display: inline-block;
        }
        .logo-badge img {
            height: 36px;
            width: auto;
            display: block;
        }
        .brand-title {
            color: #fff;
            font-size: 13px;
            font-weight: 600;
            text-align: left;
            line-height: 1.4;
            letter-spacing: 0.3px;
        }
        .brand-title span {
            display: block;
            font-size: 10px;
            font-weight: 400;
            color: rgba(255,255,255,0.75);
            text-transform: uppercase;
            letter-spacing: 1.2px;
        }
        .header-icon {
            background: rgba(255,255,255,0.15);
            border: 2px solid rgba(255,255,255,0.3);
            border-radius: 50%;
            width: 64px;
            height: 64px;
            margin: 0 auto 12px;
            display: flex;
            align-items: center;
            justify-content: center;
        }
        .header-icon svg {
            width: 32px;
            height: 32px;
            fill: #fff;
        }
        .header h1 {
            color: #fff;
            font-size: 22px;
            font-weight: 700;
            letter-spacing: -0.3px;
        }
        .header p {
            color: rgba(255,255,255,0.8);
            font-size: 13px;
            margin-top: 6px;
        }
        /* ── BODY ── */
        .body {
            background: #ffffff;
            padding: 40px 40px 32px;
        }
        .greeting {
            font-size: 16px;
            font-weight: 700;
            color: #1a1a1a;
            margin-bottom: 10px;
        }
        .body p {
            font-size: 14px;
            color: #4a4a4a;
            line-height: 1.7;
            margin-bottom: 14px;
        }
        /* ── BUTTON ── */
        .btn-wrap {
            text-align: center;
            margin: 28px 0;
        }
        .btn {
            display: inline-block;
            background: linear-gradient(135deg, #b00020 0%, #7b0015 100%);
            color: #fff !important;
            text-decoration: none;
            font-size: 15px;
            font-weight: 700;
            padding: 14px 40px;
            border-radius: 10px;
            letter-spacing: 0.3px;
            box-shadow: 0 4px 15px rgba(176, 0, 32, 0.35);
        }
        /* ── INFO BOX ── */
        .info-box {
            background: #fff8e1;
            border: 1px solid #ffe082;
            border-left: 4px solid #f59e0b;
            border-radius: 8px;
            padding: 14px 18px;
            margin-bottom: 18px;
        }
        .info-box p {
            font-size: 13px;
            color: #78510a;
            margin: 0;
        }
        .divider {
            border: none;
            border-top: 1px solid #eeeeee;
            margin: 28px 0;
        }
        .url-fallback {
            font-size: 12px;
            color: #888;
            line-height: 1.6;
            word-break: break-all;
        }
        .url-fallback a {
            color: #b00020;
            word-break: break-all;
        }
        /* ── FOOTER ── */
        .footer {
            background: #1a0004;
            border-radius: 0 0 16px 16px;
            padding: 22px 40px;
            text-align: center;
        }
        .footer p {
            font-size: 11px;
            color: rgba(255,255,255,0.45);
            line-height: 1.6;
        }
        .footer .brand {
            color: rgba(255,255,255,0.7);
            font-weight: 600;
            font-size: 12px;
            margin-bottom: 4px;
        }
    </style>
</head>
<body>
<div class="wrapper">

    <!-- HEADER -->
    <div class="header">
        <div class="logo-row">
            <div class="logo-badge">
                <img src="{{ asset('images/LogoMieGacoan.png') }}" alt="Logo Gacoan" />
            </div>
            <div class="brand-title">
                <span>Sistem Digitalisasi</span>
                Divisi Produksi
            </div>
        </div>
        <div class="header-icon">
            <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm-6 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm3.1-9H8.9V6c0-1.71 1.39-3.1 3.1-3.1 1.71 0 3.1 1.39 3.1 3.1v2z"/>
            </svg>
        </div>
        <h1>Permintaan Reset Password</h1>
        <p>Sistem Digitalisasi Produksi — PT. Pesta Pora Abadi</p>
    </div>

    <!-- BODY -->
    <div class="body">
        <p class="greeting">Halo, {{ $notifiable->name }}!</p>

        <p>
            Kami menerima permintaan untuk mereset password akun Anda di sistem
            <strong>Digitalisasi Produksi Divisi IQF</strong>.
        </p>
        <p>
            Klik tombol di bawah ini untuk membuat password baru Anda. Jika Anda tidak merasa
            melakukan permintaan ini, abaikan email ini dan akun Anda akan tetap aman.
        </p>

        <div class="btn-wrap">
            <a href="{{ $resetUrl }}" class="btn">🔐 Reset Password Saya</a>
        </div>

        <div class="info-box">
            <p>
                ⏱ <strong>Perhatian:</strong> Tautan reset password ini hanya berlaku selama
                <strong>60 menit</strong>. Setelah itu, Anda perlu mengajukan permintaan baru.
            </p>
        </div>

        <p>
            Jika Anda tidak mengajukan permintaan reset password, tidak diperlukan tindakan lebih lanjut.
        </p>

        <p>Salam hangat,<br /><strong>Tim Digitalisasi Produksi — Gacoan</strong></p>

        <hr class="divider" />

        <p class="url-fallback">
            Jika tombol di atas tidak berfungsi, salin dan tempel tautan berikut ke browser Anda:<br />
            <a href="{{ $resetUrl }}">{{ $resetUrl }}</a>
        </p>
    </div>

    <!-- FOOTER -->
    <div class="footer">
        <p class="brand">PT. Pesta Pora Abadi — Mie Gacoan</p>
        <p>Email ini dikirim secara otomatis oleh sistem. Mohon jangan membalas email ini.<br />
        &copy; {{ date('Y') }} Digitalisasi Divisi Produksi. Hak cipta dilindungi.</p>
    </div>

</div>
</body>
</html>
