<?php

namespace App\Services;

use Illuminate\Http\Client\PendingRequest;
use Illuminate\Support\Facades\Http;
use RuntimeException;

class GoogleSheetsClient
{
    private ?string $accessToken = null;

    public function __construct(
        private readonly string $serviceAccountEmail,
        private readonly string $privateKey,
    ) {
    }

    public function ensureSheet(string $spreadsheetId, string $sheetName): void
    {
        $spreadsheet = $this->request()->get(
            "https://sheets.googleapis.com/v4/spreadsheets/{$spreadsheetId}",
            ['fields' => 'sheets.properties.title']
        )->throw()->json();

        $exists = collect($spreadsheet['sheets'] ?? [])
            ->contains(fn (array $sheet) => ($sheet['properties']['title'] ?? null) === $sheetName);

        if ($exists) {
            return;
        }

        $this->request()->post(
            "https://sheets.googleapis.com/v4/spreadsheets/{$spreadsheetId}:batchUpdate",
            [
                'requests' => [
                    ['addSheet' => ['properties' => ['title' => $sheetName]]],
                ],
            ]
        )->throw();
    }

    public function updateValues(string $spreadsheetId, string $range, array $values): void
    {
        $this->request()->put(
            "https://sheets.googleapis.com/v4/spreadsheets/{$spreadsheetId}/values/".rawurlencode($range),
            [
                'range' => $range,
                'majorDimension' => 'ROWS',
                'values' => $values,
            ]
        )->throw();
    }


    public function clearValues(string $spreadsheetId, string $range): void
    {
        $this->request()->post(
            "https://sheets.googleapis.com/v4/spreadsheets/{$spreadsheetId}/values/".rawurlencode($range).':clear',
            new \stdClass()
        )->throw();
    }
    public function appendValues(string $spreadsheetId, string $range, array $values): void
    {
        if ($values === []) {
            return;
        }

        $url = "https://sheets.googleapis.com/v4/spreadsheets/{$spreadsheetId}/values/"
            .rawurlencode($range)
            .':append';

        $this->request()->post($url.'?valueInputOption=USER_ENTERED&insertDataOption=INSERT_ROWS', [
            'range' => $range,
            'majorDimension' => 'ROWS',
            'values' => $values,
        ])->throw();
    }

    private function request(): PendingRequest
    {
        return Http::withToken($this->getAccessToken())
            ->acceptJson()
            ->asJson()
            ->timeout(30)
            ->retry(2, 500);
    }

    private function getAccessToken(): string
    {
        if ($this->accessToken) {
            return $this->accessToken;
        }

        if ($this->serviceAccountEmail === '' || $this->privateKey === '') {
            throw new RuntimeException('Google service account email/private key belum dikonfigurasi.');
        }

        $now = time();
        $jwt = $this->base64UrlEncode(json_encode(['alg' => 'RS256', 'typ' => 'JWT']))
            .'.'.$this->base64UrlEncode(json_encode([
                'iss' => $this->serviceAccountEmail,
                'scope' => 'https://www.googleapis.com/auth/spreadsheets',
                'aud' => 'https://oauth2.googleapis.com/token',
                'iat' => $now,
                'exp' => $now + 3600,
            ]));

        $key = str_replace('\\n', "\n", $this->privateKey);
        $signature = '';
        $signed = openssl_sign($jwt, $signature, $key, OPENSSL_ALGO_SHA256);

        if (!$signed) {
            throw new RuntimeException('Gagal membuat signature service account. Periksa GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY.');
        }

        $assertion = $jwt.'.'.$this->base64UrlEncode($signature);

        $response = Http::asForm()
            ->timeout(30)
            ->post('https://oauth2.googleapis.com/token', [
                'grant_type' => 'urn:ietf:params:oauth:grant-type:jwt-bearer',
                'assertion' => $assertion,
            ])
            ->throw()
            ->json();

        return $this->accessToken = $response['access_token'];
    }

    private function base64UrlEncode(string $value): string
    {
        return rtrim(strtr(base64_encode($value), '+/', '-_'), '=');
    }
}

