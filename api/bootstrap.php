<?php
declare(strict_types=1);

/**
 * Bootstrap: config + PDO. Zero Composer deps.
 */

function ln_config(): array
{
    static $config = null;
    if ($config !== null) {
        return $config;
    }

    $path = __DIR__ . '/config.php';
    if (!is_file($path)) {
        http_response_code(500);
        header('Content-Type: application/json; charset=utf-8');
        echo json_encode([
            'error' => 'Нет api/config.php — скопируйте api/config.example.php и заполните.',
        ], JSON_UNESCAPED_UNICODE);
        exit;
    }

    $loaded = require $path;
    if (!is_array($loaded)) {
        http_response_code(500);
        header('Content-Type: application/json; charset=utf-8');
        echo json_encode(['error' => 'api/config.php должен возвращать массив'], JSON_UNESCAPED_UNICODE);
        exit;
    }

    $config = $loaded;
    return $config;
}

function ln_db(): PDO
{
    static $pdo = null;
    if ($pdo instanceof PDO) {
        return $pdo;
    }

    $c = ln_config();
    $dsn = sprintf(
        'mysql:host=%s;dbname=%s;charset=%s',
        $c['db_host'] ?? 'localhost',
        $c['db_name'] ?? '',
        $c['db_charset'] ?? 'utf8mb4'
    );

    try {
        $pdo = new PDO($dsn, (string) ($c['db_user'] ?? ''), (string) ($c['db_pass'] ?? ''), [
            PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
            PDO::ATTR_EMULATE_PREPARES => false,
        ]);
    } catch (Throwable $e) {
        error_log('PDO connect failed: ' . $e->getMessage());
        http_response_code(500);
        header('Content-Type: application/json; charset=utf-8');
        echo json_encode(['error' => 'Не удалось подключиться к базе данных'], JSON_UNESCAPED_UNICODE);
        exit;
    }

    return $pdo;
}

function ln_json_body(): array
{
    $raw = file_get_contents('php://input');
    if ($raw === false || $raw === '') {
        return [];
    }
    $decoded = json_decode($raw, true);
    return is_array($decoded) ? $decoded : [];
}

function ln_json(mixed $data, int $status = 200): void
{
    http_response_code($status);
    header('Content-Type: application/json; charset=utf-8');
    header('Cache-Control: no-store');
    echo json_encode($data, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    exit;
}

function ln_is_https(): bool
{
    if (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off') {
        return true;
    }
    $proto = $_SERVER['HTTP_X_FORWARDED_PROTO'] ?? '';
    return strtolower((string) $proto) === 'https';
}

function ln_client_ip(): string
{
    $candidates = [
        $_SERVER['HTTP_CF_CONNECTING_IP'] ?? '',
        $_SERVER['HTTP_X_FORWARDED_FOR'] ?? '',
        $_SERVER['REMOTE_ADDR'] ?? '',
    ];
    foreach ($candidates as $raw) {
        $raw = trim((string) $raw);
        if ($raw === '') {
            continue;
        }
        // X-Forwarded-For: first hop
        if (str_contains($raw, ',')) {
            $raw = trim(explode(',', $raw)[0]);
        }
        return $raw;
    }
    $ua = substr((string) ($_SERVER['HTTP_USER_AGENT'] ?? ''), 0, 96);
    return $ua !== '' ? 'ua:' . $ua : 'anon';
}

/**
 * Простой file-based rate limit (shared hosting).
 * @return array{ok:true}|array{ok:false,retryAfterSec:int}
 */
function ln_rate_limit(string $key, int $max, int $windowSec = 600): array
{
    $dir = __DIR__ . '/cache/ratelimit';
    if (!is_dir($dir)) {
        @mkdir($dir, 0755, true);
    }
    $file = $dir . '/' . hash('sha256', $key) . '.json';
    $now = time();
    $data = ['count' => 0, 'resetAt' => $now + $windowSec];

    if (is_file($file)) {
        $raw = @file_get_contents($file);
        $parsed = $raw !== false ? json_decode($raw, true) : null;
        if (is_array($parsed) && isset($parsed['count'], $parsed['resetAt'])) {
            $data = $parsed;
        }
    }

    if (($data['resetAt'] ?? 0) <= $now) {
        $data = ['count' => 1, 'resetAt' => $now + $windowSec];
        @file_put_contents($file, json_encode($data), LOCK_EX);
        return ['ok' => true];
    }

    if (($data['count'] ?? 0) >= $max) {
        return ['ok' => false, 'retryAfterSec' => max(1, (int) $data['resetAt'] - $now)];
    }

    $data['count'] = (int) $data['count'] + 1;
    @file_put_contents($file, json_encode($data), LOCK_EX);
    return ['ok' => true];
}
