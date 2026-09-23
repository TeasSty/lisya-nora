<?php
declare(strict_types=1);

const LN_SESSION_COOKIE = 'ln_admin_session';
const LN_SESSION_TTL = 60 * 60 * 8;

function ln_timing_safe_equal(string $a, string $b): bool
{
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
    $secret = (string) (ln_config()['session_secret'] ?? '');
    if ($secret === '' || !ln_is_session_valid($secret)) {
        ln_json(['error' => 'Требуется вход'], 401);
    }
}
