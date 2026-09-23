<?php
declare(strict_types=1);

/**
 * Генерация bcrypt-хеша для api/config.php → admin_password_hash.
 *
 * Только CLI (через веб закрыто .htaccess):
 *   php api/hash-password.php 'ваш-пароль'
 *   php api/hash-password.php   # пароль спросит интерактивно
 *
 * Вставьте вывод в config.php:
 *   'admin_password_hash' => '$2y$...',
 * и удалите ключ admin_password, если он ещё есть.
 */

if (PHP_SAPI !== 'cli') {
    http_response_code(403);
    header('Content-Type: text/plain; charset=utf-8');
    echo "Только из командной строки: php api/hash-password.php\n";
    exit(1);
}

$password = $argv[1] ?? null;
if ($password === null || $password === '') {
    echo "Введите пароль админа (не отображается): ";
    if (strncasecmp(PHP_OS, 'WIN', 3) === 0) {
        $password = trim((string) fgets(STDIN));
    } else {
        system('stty -echo');
        $password = trim((string) fgets(STDIN));
        system('stty echo');
        echo "\n";
    }
}

if ($password === '') {
    fwrite(STDERR, "Пустой пароль.\n");
    exit(1);
}

$hash = password_hash($password, PASSWORD_DEFAULT);
if ($hash === false) {
    fwrite(STDERR, "password_hash не удался.\n");
    exit(1);
}

echo $hash . "\n";
echo "\nВставьте в api/config.php:\n";
echo "  'admin_password_hash' => '" . $hash . "',\n";
echo "и удалите строку 'admin_password' (plaintext).\n";
