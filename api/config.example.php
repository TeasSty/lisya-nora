<?php
/**
 * Скопируйте в config.php и заполните значениями из панели Host-0.
 * config.php в git не коммитится.
 *
 * Host-0 → Базы данных MySQL → хост обычно localhost, имя БД/логин/пароль из панели.
 */
return [
    'db_host' => 'localhost',
    'db_name' => 'uXXXXXX_lisya',
    'db_user' => 'uXXXXXX_lisya',
    'db_pass' => 'ЗАМЕНИТЕ_ПАРОЛЬ_БД',
    'db_charset' => 'utf8mb4',

    /** Пароль входа в /admin */
    'admin_password' => 'ЗАМЕНИТЕ_ПАРОЛЬ_АДМИНА',

    /** Длинная случайная строка для подписи cookie-сессии */
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
