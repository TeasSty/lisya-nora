<?php
/**
 * Скопируйте в config.php и заполните значениями из панели Host-0.
 * config.php в git не коммитится.
 *
 * Host-0 → Базы данных MySQL → хост обычно localhost, имя БД/логин/пароль из панели.
 *
 * Пароль админа: сгенерируйте hash на ПК или сервере:
 *   php api/hash-password.php 'ваш-пароль'
 * и вставьте результат в admin_password_hash.
 * Plaintext admin_password поддерживается только для одноразовой миграции
 * (при первом успешном входе PHP попытается сам заменить его на hash).
 */
return [
    'db_host' => 'localhost',
    'db_name' => 'uXXXXXX_lisya',
    'db_user' => 'uXXXXXX_lisya',
    'db_pass' => 'ЗАМЕНИТЕ_ПАРОЛЬ_БД',
    'db_charset' => 'utf8mb4',

    /**
     * bcrypt/argon2 hash пароля входа на /admin.
     * Получить: php api/hash-password.php 'пароль'
     */
    'admin_password_hash' => '$2y$10$REPLACE_WITH_OUTPUT_OF_hash-password.php',

    /**
     * Устарело: plaintext только для миграции со старых деплоев.
     * Не задавайте на новых установках. Если остался — удалите после
     * первого успешного входа (или сразу замените на admin_password_hash).
     */
    // 'admin_password' => '',

    /** Длинная случайная строка для подписи cookie-сессии (≥ 16 символов) */
    'session_secret' => 'ЗАМЕНИТЕ_ДЛИННОЙ_СЛУЧАЙНОЙ_СТРОКОЙ',

    /**
     * Ozon Delivery for Business (не Seller Api-Key).
     * Оставьте пустыми — на форме останется ссылка на карту Ozon.
     */
    'ozon_delivery_client_id' => '',
    'ozon_delivery_client_secret' => '',
    'ozon_delivery_scope' => 'delivery-api.all',

    /**
     * true только если перед PHP стоит доверенный прокси (Cloudflare / nginx),
     * который выставляет X-Forwarded-Proto / CF-Connecting-IP.
     * На обычном Host-0 оставьте false — иначе клиент подделает IP и обойдёт rate limit.
     */
    'trust_proxy' => false,
];
