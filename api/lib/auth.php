<?php
declare(strict_types=1);

const LN_SESSION_COOKIE = 'ln_admin_session';
const LN_SESSION_TTL = 60 * 60 * 8;

function ln_timing_safe_equal(string $a, string $b): bool
{
    if (function_exists('hash_equals')) {
        return hash_equals($a, $b);
    }
    $len = max(strlen($a), strlen($b));
    $diff = strlen($a) === strlen($b) ? 0 : 1;
    for ($i = 0; $i < $len; $i++) {
        $ca = $i < strlen($a) ? ord($a[$i]) : 0;
        $cb = $i < strlen($b) ? ord($b[$i]) : 0;
        $diff |= $ca ^ $cb;
    }
    return $diff === 0;
}

function ln_hmac_hex(string $secret, string $message): string
{
    return hash_hmac('sha256', $message, $secret);
}

function ln_read_cookie(string $name): ?string
{
    if (!isset($_COOKIE[$name])) {
        return null;
    }
    $v = $_COOKIE[$name];
    return is_string($v) && $v !== '' ? $v : null;
}

function ln_session_secret(): string
{
    return trim((string) (ln_config()['session_secret'] ?? ''));
}

/** bcrypt/argon2 hash из config (предпочтительно). */
function ln_admin_password_hash(): string
{
    return trim((string) (ln_config()['admin_password_hash'] ?? ''));
}

/**
 * Устаревший plaintext из config (только миграция).
 * Не использовать как постоянный способ хранения.
 */
function ln_admin_password_legacy(): string
{
    return (string) (ln_config()['admin_password'] ?? '');
}

function ln_is_password_hash(string $hash): bool
{
    if ($hash === '') {
        return false;
    }
    return str_starts_with($hash, '$2y$')
        || str_starts_with($hash, '$2a$')
        || str_starts_with($hash, '$2b$')
        || str_starts_with($hash, '$argon2i$')
        || str_starts_with($hash, '$argon2id$');
}

/** Секрет и пароль (hash или legacy plaintext) настроены. */
function ln_secrets_configured(): bool
{
    $secret = ln_session_secret();
    if ($secret === '' || strlen($secret) < 16) {
        return false;
    }
    $hash = ln_admin_password_hash();
    if (ln_is_password_hash($hash)) {
        return true;
    }
    return ln_admin_password_legacy() !== '';
}

function ln_verify_admin_password(string $password): bool
{
    if ($password === '') {
        return false;
    }
    $hash = ln_admin_password_hash();
    if (ln_is_password_hash($hash)) {
        return password_verify($password, $hash);
    }
    $legacy = ln_admin_password_legacy();
    if ($legacy === '') {
        return false;
    }
    return ln_timing_safe_equal($password, $legacy);
}

/**
 * После успешного входа по legacy plaintext: записать admin_password_hash
 * и убрать plaintext из config.php (если файл доступен на запись).
 * Не блокирует вход, если переписать не удалось.
 */
function ln_try_migrate_admin_password_hash(string $plainPassword): bool
{
    if (ln_is_password_hash(ln_admin_password_hash())) {
        return false;
    }
    $legacy = ln_admin_password_legacy();
    if ($legacy === '' || !ln_timing_safe_equal($plainPassword, $legacy)) {
        return false;
    }

    $configPath = dirname(__DIR__) . DIRECTORY_SEPARATOR . 'config.php';
    if (!is_file($configPath) || !is_writable($configPath)) {
        error_log('ln: не удалось мигрировать admin_password — config.php недоступен для записи');
        return false;
    }

    $config = ln_config();
    if (!is_array($config)) {
        return false;
    }
    $config['admin_password_hash'] = password_hash($plainPassword, PASSWORD_DEFAULT);
    unset($config['admin_password']);

    $export = var_export($config, true);
    $content = "<?php\ndeclare(strict_types=1);\n\n/** Авто-миграция: plaintext admin_password заменён на hash. */\nreturn " . $export . ";\n";

    $tmp = $configPath . '.tmp.' . bin2hex(random_bytes(4));
    if (file_put_contents($tmp, $content, LOCK_EX) === false) {
        return false;
    }
    if (!rename($tmp, $configPath)) {
        @unlink($tmp);
        return false;
    }
    return true;
}

function ln_create_session_cookie(string $secret, bool $secure): string
{
    $exp = (string) (time() + LN_SESSION_TTL);
    $sig = ln_hmac_hex($secret, $exp);
    $value = $exp . '.' . $sig;
    $parts = [
        LN_SESSION_COOKIE . '=' . $value,
        'Path=/',
        'HttpOnly',
        'SameSite=Lax',
        'Max-Age=' . LN_SESSION_TTL,
    ];
    if ($secure) {
        $parts[] = 'Secure';
    }
    return implode('; ', $parts);
}

function ln_clear_session_cookie(bool $secure): string
{
    $parts = [LN_SESSION_COOKIE . '=', 'Path=/', 'HttpOnly', 'SameSite=Lax', 'Max-Age=0'];
    if ($secure) {
        $parts[] = 'Secure';
    }
    return implode('; ', $parts);
}

function ln_is_session_valid(string $secret): bool
{
    if ($secret === '' || strlen($secret) < 16) {
        return false;
    }
    $value = ln_read_cookie(LN_SESSION_COOKIE);
    if ($value === null) {
        return false;
    }
    $dot = strpos($value, '.');
    if ($dot === false) {
        return false;
    }
    $expPart = substr($value, 0, $dot);
    $sigPart = substr($value, $dot + 1);
    $exp = (int) $expPart;
    if ($exp < time()) {
        return false;
    }
    $expected = ln_hmac_hex($secret, $expPart);
    return ln_timing_safe_equal($sigPart, $expected);
}

function ln_require_auth(): void
{
    if (!ln_secrets_configured() || !ln_is_session_valid(ln_session_secret())) {
        ln_json(['error' => 'Требуется вход'], 401);
    }
    ln_require_same_origin();
}
