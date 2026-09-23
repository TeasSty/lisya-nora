<?php
declare(strict_types=1);

/**
 * Ozon Delivery for Business — поиск ПВЗ.
 * Кэш каталога в api/cache/ozon-pvz.json (shared hosting, без Cache API).
 */

const LN_OZON_TOKEN_URL = 'https://xapi.ozon.ru/oauth/token';
const LN_OZON_API_BASE = 'https://api-delivery.ozon.ru';
const LN_OZON_CATALOG_REFRESH_SEC = 86400;
const LN_OZON_LIST_PAGE_LIMIT = 100;
const LN_OZON_INFO_BATCH = 100;
const LN_OZON_MAX_LIST_PAGES = 80;
const LN_OZON_SEARCH_LIMIT = 40;

function ln_ozon_configured(array $config): bool
{
    $id = trim((string) ($config['ozon_delivery_client_id'] ?? ''));
    $secret = trim((string) ($config['ozon_delivery_client_secret'] ?? ''));
    return $id !== '' && $secret !== '';
}

function ln_ozon_scopes(array $config): array
{
    $raw = trim((string) ($config['ozon_delivery_scope'] ?? ''));
    if ($raw === '') {
        return ['delivery-api.all'];
    }
    return array_values(array_filter(preg_split('/[\s,]+/', $raw) ?: []));
}

function ln_ozon_token_cache_path(): string
{
    return __DIR__ . '/../cache/ozon-token.json';
}

function ln_ozon_catalog_cache_path(): string
{
    return __DIR__ . '/../cache/ozon-pvz.json';
}

function ln_ozon_get_access_token(array $config): string
{
    $cachePath = ln_ozon_token_cache_path();
    $now = (int) (microtime(true) * 1000);
    if (is_file($cachePath)) {
        $cached = json_decode((string) file_get_contents($cachePath), true);
        if (
            is_array($cached)
            && isset($cached['accessToken'], $cached['expiresAtMs'])
            && (int) $cached['expiresAtMs'] - $now > 60_000
        ) {
            return (string) $cached['accessToken'];
        }
    }

    $payload = json_encode([
        'client_id' => trim((string) $config['ozon_delivery_client_id']),
        'client_secret' => trim((string) $config['ozon_delivery_client_secret']),
        'grant_type' => 'client_credentials',
        'scope' => ln_ozon_scopes($config),
    ], JSON_UNESCAPED_UNICODE);

    $ch = curl_init(LN_OZON_TOKEN_URL);
    curl_setopt_array($ch, [
        CURLOPT_POST => true,
        CURLOPT_HTTPHEADER => ['Content-Type: application/json'],
        CURLOPT_POSTFIELDS => $payload,
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_TIMEOUT => 30,
    ]);
    $body = curl_exec($ch);
    $status = (int) curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);

    $data = is_string($body) ? json_decode($body, true) : null;
    if ($status < 200 || $status >= 300 || !is_array($data) || !isset($data['access_token'])) {
        $detail = is_array($data) && isset($data['message']) ? (string) $data['message'] : "HTTP $status";
        throw new RuntimeException("Ozon OAuth: $detail");
    }

    $expiresIn = $data['expires_in'] ?? null;
    if (is_numeric($expiresIn)) {
        $expiresIn = (float) $expiresIn;
        $expiresAtMs = $expiresIn > 1_000_000_000 ? (int) ($expiresIn * 1000) : $now + (int) ($expiresIn * 1000);
    } else {
        $expiresAtMs = $now + 50 * 60 * 1000;
    }

    $dir = dirname($cachePath);
    if (!is_dir($dir)) {
        @mkdir($dir, 0755, true);
    }
    @file_put_contents($cachePath, json_encode([
        'accessToken' => $data['access_token'],
        'expiresAtMs' => $expiresAtMs,
    ]), LOCK_EX);

    return (string) $data['access_token'];
}

function ln_ozon_post(array $config, string $path, array $payload, ?string $cookieHeader = null): array
{
    $token = ln_ozon_get_access_token($config);
    $headers = [
        'Authorization: Bearer ' . $token,
        'Content-Type: application/json',
    ];
    if ($cookieHeader) {
        $headers[] = 'Cookie: ' . $cookieHeader;
    }

    $ch = curl_init(LN_OZON_API_BASE . $path);
    curl_setopt_array($ch, [
        CURLOPT_POST => true,
        CURLOPT_HTTPHEADER => $headers,
        CURLOPT_POSTFIELDS => json_encode($payload, JSON_UNESCAPED_UNICODE),
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_HEADER => true,
        CURLOPT_TIMEOUT => 60,
        CURLOPT_FOLLOWLOCATION => false,
    ]);
    $raw = curl_exec($ch);
    $status = (int) curl_getinfo($ch, CURLINFO_HTTP_CODE);
    $headerSize = (int) curl_getinfo($ch, CURLINFO_HEADER_SIZE);
    curl_close($ch);

    if (!is_string($raw)) {
        throw new RuntimeException("Ozon API $path: empty response");
    }

    $headerBlob = substr($raw, 0, $headerSize);
    $body = substr($raw, $headerSize);

    if ($status === 302 || $status === 307) {
        if (!preg_match('/^Set-Cookie:\s*([^\r\n]+)/mi', $headerBlob, $m)) {
            throw new RuntimeException('Ozon testcookie redirect без Set-Cookie');
        }
        $cookie = explode(';', $m[1])[0];
        return ln_ozon_post($config, $path, $payload, $cookie);
    }

    $data = json_decode($body, true);
    if ($status < 200 || $status >= 300 || !is_array($data)) {
        $message = 'HTTP ' . $status;
        if (is_array($data)) {
            if (isset($data['message']) && is_string($data['message'])) {
                $message = $data['message'];
            } elseif (isset($data['error']['message']) && is_string($data['error']['message'])) {
                $message = $data['error']['message'];
            }
        }
        throw new RuntimeException("Ozon API $path: $message");
    }

    return $data;
}

function ln_ozon_parse_point(array $row): ?array
{
    $id = $row['delivery_point_id'] ?? null;
    $name = $row['name'] ?? null;
    $address = $row['full_address'] ?? null;
    $type = $row['type'] ?? null;
    $isActive = $row['is_active'] ?? null;
    if (!is_int($id) && !(is_numeric($id) && (int) $id == $id)) {
        return null;
    }
    if (!is_string($name) || !is_string($address) || !is_string($type) || !is_bool($isActive)) {
        return null;
    }

    $lat = null;
    $lon = null;
    $coordinates = $row['coordinates'] ?? null;
    if (is_array($coordinates)
        && isset($coordinates['latitude'], $coordinates['longitude'])
        && is_numeric($coordinates['latitude'])
        && is_numeric($coordinates['longitude'])
    ) {
        $lat = (float) $coordinates['latitude'];
        $lon = (float) $coordinates['longitude'];
    }

    return [
        'id' => (int) $id,
        'name' => $name,
        'address' => $address,
        'type' => $type,
        'isActive' => $isActive,
        'lat' => $lat,
        'lon' => $lon,
    ];
}

function ln_ozon_list_page_ids(array $config, ?string $cursor): array
{
    $data = ln_ozon_post($config, '/v1/delivery-point/list', [
        'pagination' => ['cursor' => $cursor, 'limit' => LN_OZON_LIST_PAGE_LIMIT],
    ]);
    $ids = [];
    $raw = $data['delivery_points'] ?? null;
    if (is_array($raw)) {
        foreach ($raw as $item) {
            if (!is_array($item)) {
                continue;
            }
            $id = $item['delivery_point_id'] ?? null;
            if (is_numeric($id) && (int) $id > 0) {
                $ids[] = (int) $id;
            }
        }
    }
    $next = $data['next_cursor'] ?? null;
    return [
        'ids' => $ids,
        'nextCursor' => is_string($next) && $next !== '' ? $next : null,
    ];
}

function ln_ozon_info_points(array $config, array $ids): array
{
    if ($ids === []) {
        return [];
    }
    $data = ln_ozon_post($config, '/v1/delivery-point/info', [
        'delivery_point_ids' => $ids,
    ]);
    $points = [];
    $raw = $data['delivery_points'] ?? null;
    if (!is_array($raw)) {
        return $points;
    }
    foreach ($raw as $item) {
        if (!is_array($item)) {
            continue;
        }
        $point = ln_ozon_parse_point($item);
        if ($point) {
            $points[] = $point;
        }
    }
    return $points;
}

function ln_ozon_build_catalog(array $config): array
{
    $points = [];
    $cursor = null;
    for ($page = 0; $page < LN_OZON_MAX_LIST_PAGES; $page++) {
        $pageData = ln_ozon_list_page_ids($config, $cursor);
        $ids = $pageData['ids'];
        if ($ids === []) {
            break;
        }
        for ($i = 0; $i < count($ids); $i += LN_OZON_INFO_BATCH) {
            $batch = array_slice($ids, $i, LN_OZON_INFO_BATCH);
            foreach (ln_ozon_info_points($config, $batch) as $point) {
                if ($point['isActive']) {
                    $points[] = $point;
                }
            }
        }
        if ($pageData['nextCursor'] === null) {
            break;
        }
        $cursor = $pageData['nextCursor'];
    }
    return $points;
}

function ln_ozon_read_catalog(): ?array
{
    $path = ln_ozon_catalog_cache_path();
    if (!is_file($path)) {
        return null;
    }
    $data = json_decode((string) file_get_contents($path), true);
    if (!is_array($data) || !isset($data['points']) || !is_array($data['points']) || $data['points'] === []) {
        return null;
    }
    $fetchedAtMs = isset($data['fetchedAt']) ? (int) (strtotime((string) $data['fetchedAt']) * 1000) : 0;
    if ($fetchedAtMs <= 0) {
        $fetchedAtMs = (int) (filemtime($path) * 1000);
    }
    return ['points' => $data['points'], 'fetchedAtMs' => $fetchedAtMs];
}

function ln_ozon_write_catalog(array $points): void
{
    if ($points === []) {
        return;
    }
    $path = ln_ozon_catalog_cache_path();
    $dir = dirname($path);
    if (!is_dir($dir)) {
        @mkdir($dir, 0755, true);
    }
    @file_put_contents($path, json_encode([
        'fetchedAt' => gmdate('c'),
        'points' => $points,
    ], JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES), LOCK_EX);
}

function ln_ozon_normalize_search(string $value): string
{
    $v = mb_strtolower(trim($value), 'UTF-8');
    return preg_replace('/\s+/u', ' ', $v) ?? $v;
}

function ln_ozon_filter_by_city(array $points, string $city): array
{
    $needle = ln_ozon_normalize_search($city);
    if (mb_strlen($needle) < 2) {
        return [];
    }
    $scored = [];
    foreach ($points as $point) {
        if (!is_array($point)) {
            continue;
        }
        $hay = ln_ozon_normalize_search(($point['address'] ?? '') . ' ' . ($point['name'] ?? ''));
        if (!str_contains($hay, $needle)) {
            continue;
        }
        $addrScore = str_contains(ln_ozon_normalize_search((string) ($point['address'] ?? '')), $needle) ? 2 : 1;
        $scored[] = ['point' => $point, 'score' => $addrScore];
    }
    usort($scored, static function ($a, $b) {
        if ($a['score'] !== $b['score']) {
            return $b['score'] <=> $a['score'];
        }
        return strcmp((string) ($a['point']['address'] ?? ''), (string) ($b['point']['address'] ?? ''));
    });
    $out = [];
    foreach (array_slice($scored, 0, LN_OZON_SEARCH_LIMIT) as $row) {
        $out[] = $row['point'];
    }
    return $out;
}

/**
 * @return array{ok:true,points:array,warming?:bool}|array{ok:false,error:string,code:string}
 */
function ln_ozon_search_pvz(array $config, string $city): array
{
    if (!ln_ozon_configured($config)) {
        return ['ok' => false, 'error' => 'API Ozon Delivery не настроен', 'code' => 'not_configured'];
    }

    $cached = ln_ozon_read_catalog();
    if ($cached !== null) {
        $ageSec = (time() * 1000 - $cached['fetchedAtMs']) / 1000;
        if ($ageSec > LN_OZON_CATALOG_REFRESH_SEC) {
            ln_ozon_schedule_catalog_refresh($config);
        }
        return [
            'ok' => true,
            'points' => ln_ozon_filter_by_city($cached['points'], $city),
        ];
    }

    // Нет кэша — запускаем прогрев в shutdown и сразу warming (как CF waitUntil).
    ln_ozon_schedule_catalog_refresh($config);
    return ['ok' => true, 'points' => [], 'warming' => true];
}

function ln_ozon_schedule_catalog_refresh(array $config): void
{
    static $scheduled = false;
    if ($scheduled) {
        return;
    }
    $lock = ln_ozon_catalog_cache_path() . '.warming';
    if (is_file($lock) && time() - (int) filemtime($lock) < 300) {
        return;
    }
    @file_put_contents($lock, (string) time(), LOCK_EX);
    $scheduled = true;

    register_shutdown_function(static function () use ($config, $lock): void {
        try {
            @set_time_limit(300);
            @ignore_user_abort(true);
            if (function_exists('fastcgi_finish_request')) {
                @fastcgi_finish_request();
            }
            $points = ln_ozon_build_catalog($config);
            ln_ozon_write_catalog($points);
        } catch (Throwable $e) {
            error_log('Ozon PVZ catalog refresh failed: ' . $e->getMessage());
        } finally {
            @unlink($lock);
        }
    });
}
