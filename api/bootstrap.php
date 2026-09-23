<?php
declare(strict_types=1);

/**
 * Bootstrap: config + PDO. Zero Composer deps.
 */

/**
 * Базовые security-заголовки для API-ответов.
 * CSP для HTML-страниц SPA задаётся в public/.htaccess (mod_headers).
 */
function ln_send_security_headers(): void
{
    static $sent = false;
    if ($sent) {
        return;
    }
    $sent = true;
    header('X-Content-Type-Options: nosniff');
    header('Referrer-Policy: strict-origin-when-cross-origin');
    header('X-Frame-Options: SAMEORIGIN');
    header('Permissions-Policy: geolocation=(), microphone=(), camera=(), payment=()');
    // API отдаёт только JSON — жёсткий CSP на всякий случай.
    header("Content-Security-Policy: default-src 'none'; frame-ancestors 'none'; base-uri 'none'");
}

function ln_config(): array
{
    static $config = null;
    if ($config !== null) {
        return $config;
    }

    $path = __DIR__ . '/config.php';
    if (!is_file($path)) {
        ln_send_security_headers();
        http_response_code(500);
        header('Content-Type: application/json; charset=utf-8');
        echo json_encode([
            'error' => 'Нет api/config.php — скопируйте api/config.example.php и заполните.',
        ], JSON_UNESCAPED_UNICODE);
        exit;
    }

    $loaded = require $path;
    if (!is_array($loaded)) {
        ln_send_security_headers();
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
        ln_send_security_headers();
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
    ln_send_security_headers();
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
    // X-Forwarded-Proto только если явно разрешено в config (иначе клиент может подделать).
    $trustProxy = !empty(ln_config()['trust_proxy'] ?? false);
    if ($trustProxy) {
        $proto = $_SERVER['HTTP_X_FORWARDED_PROTO'] ?? '';
        return strtolower((string) $proto) === 'https';
    }
    return false;
}

/**
 * IP для rate limit. По умолчанию только REMOTE_ADDR —
 * X-Forwarded-For / CF-Connecting-IP легко подделать без доверенного прокси.
 */
function ln_client_ip(): string
{
    $trustProxy = !empty(ln_config()['trust_proxy'] ?? false);
    if ($trustProxy) {
        $candidates = [
            $_SERVER['HTTP_CF_CONNECTING_IP'] ?? '',
            $_SERVER['HTTP_X_FORWARDED_FOR'] ?? '',
        ];
        foreach ($candidates as $raw) {
            $raw = trim((string) $raw);
            if ($raw === '') {
                continue;
            }
            if (str_contains($raw, ',')) {
                $raw = trim(explode(',', $raw)[0]);
            }
            if (filter_var($raw, FILTER_VALIDATE_IP)) {
                return $raw;
            }
        }
    }

    $remote = trim((string) ($_SERVER['REMOTE_ADDR'] ?? ''));
    if ($remote !== '' && filter_var($remote, FILTER_VALIDATE_IP)) {
        return $remote;
    }
    $ua = substr((string) ($_SERVER['HTTP_USER_AGENT'] ?? ''), 0, 96);
    return $ua !== '' ? 'ua:' . $ua : 'anon';
}

/**
 * Простой file-based rate limit (shared hosting) с flock.
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

    $fh = @fopen($file, 'c+');
    if ($fh === false) {
        // Нет кэша — не блокируем запросы (fail-open), иначе сломаем сайт.
        return ['ok' => true];
    }

    try {
        if (!flock($fh, LOCK_EX)) {
            return ['ok' => true];
        }

        $raw = stream_get_contents($fh);
        $data = ['count' => 0, 'resetAt' => $now + $windowSec];
        if (is_string($raw) && $raw !== '') {
            $parsed = json_decode($raw, true);
            if (is_array($parsed) && isset($parsed['count'], $parsed['resetAt'])) {
                $data = $parsed;
            }
        }

        if (($data['resetAt'] ?? 0) <= $now) {
            $data = ['count' => 1, 'resetAt' => $now + $windowSec];
            ftruncate($fh, 0);
            rewind($fh);
            fwrite($fh, json_encode($data));
            fflush($fh);
            return ['ok' => true];
        }

        if (($data['count'] ?? 0) >= $max) {
            return ['ok' => false, 'retryAfterSec' => max(1, (int) $data['resetAt'] - $now)];
        }

        $data['count'] = (int) $data['count'] + 1;
        ftruncate($fh, 0);
        rewind($fh);
        fwrite($fh, json_encode($data));
        fflush($fh);
        return ['ok' => true];
    } finally {
        flock($fh, LOCK_UN);
        fclose($fh);
    }
}

/**
 * Same-origin для cookie-сессии: защита от CSRF при state-changing запросах.
 * fetch() с same-origin всегда шлёт Origin; старые клиенты — Referer.
 */
function ln_request_is_same_origin(): bool
{
    $hostHeader = (string) ($_SERVER['HTTP_HOST'] ?? '');
    if ($hostHeader === '') {
        return false;
    }

    $expectedHost = strtolower($hostHeader);
    $check = static function (string $url) use ($expectedHost): bool {
        $parts = parse_url($url);
        if ($parts === false || !isset($parts['host'])) {
            return false;
        }
        $host = strtolower((string) $parts['host']);
        if (isset($parts['port'])) {
            $host .= ':' . $parts['port'];
        }
        return $host === $expectedHost;
    };

    $origin = trim((string) ($_SERVER['HTTP_ORIGIN'] ?? ''));
    if ($origin !== '') {
        return $check($origin);
    }

    $referer = trim((string) ($_SERVER['HTTP_REFERER'] ?? ''));
    if ($referer !== '') {
        return $check($referer);
    }

    // Нет Origin/Referer — не браузерный same-origin fetch; отклоняем для cookie-auth.
    return false;
}

function ln_require_same_origin(): void
{
    $method = strtoupper((string) ($_SERVER['REQUEST_METHOD'] ?? 'GET'));
    if (!in_array($method, ['POST', 'PUT', 'PATCH', 'DELETE'], true)) {
        return;
    }
    if (!ln_request_is_same_origin()) {
        ln_json(['error' => 'Некорректный источник запроса'], 403);
    }
}
