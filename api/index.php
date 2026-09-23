<?php
declare(strict_types=1);

/**
 * Front controller для Host-0 (reg.ru shared PHP + MySQL).
 * Маршруты совпадают с worker/index.ts и src/lib/api.ts.
 */

require_once __DIR__ . '/bootstrap.php';
require_once __DIR__ . '/lib/auth.php';
require_once __DIR__ . '/lib/helpers.php';
require_once __DIR__ . '/lib/ozon.php';

$method = strtoupper($_SERVER['REQUEST_METHOD'] ?? 'GET');
$uri = $_SERVER['REQUEST_URI'] ?? '/';
$path = parse_url($uri, PHP_URL_PATH) ?: '/';

// Нормализация: /api/... или /api/index.php/...
$path = preg_replace('#^/api/index\.php#', '/api', $path) ?? $path;
$path = rtrim($path, '/') ?: '/';
if ($path === '/api') {
    $path = '/api/';
}

try {
    // ---------- Public ----------
    if ($method === 'GET' && $path === '/api/products') {
        $stmt = ln_db()->query(
            'SELECT id, name, description, category, image_url, image_urls, price_rub, is_active, sort_order, created_at
             FROM products WHERE is_active = 1 ORDER BY sort_order ASC, id ASC'
        );
        $rows = $stmt->fetchAll();
        ln_json(['products' => array_map('ln_to_public_product', $rows)]);
    }

    if ($method === 'GET' && $path === '/api/categories') {
        $stmt = ln_db()->query(
            'SELECT id, label, room, short, sort_order FROM categories ORDER BY sort_order ASC, id ASC'
        );
        $rows = $stmt->fetchAll();
        if ($rows !== []) {
            ln_json(['categories' => array_map('ln_to_public_category', $rows)]);
        }
        $fallback = [];
        foreach (LN_PRODUCT_CATEGORIES as $i => $id) {
            $fallback[] = [
                'id' => $id,
                'label' => $id,
                'room' => $id,
                'short' => '',
                'sortOrder' => ($i + 1) * 10,
            ];
        }
        ln_json(['categories' => $fallback]);
    }

    if ($method === 'GET' && $path === '/api/ozon/pvz/status') {
        ln_json([
            'configured' => ln_ozon_configured(ln_config()),
            'mapUrl' => 'https://www.ozon.ru/info/map/',
        ]);
    }

    if ($method === 'GET' && $path === '/api/ozon/pvz') {
        $limited = ln_rate_limit('ozon-pvz:' . ln_client_ip(), 20);
        if (!$limited['ok']) {
            header('Retry-After: ' . $limited['retryAfterSec']);
            ln_json([
                'error' => 'Слишком много запросов к пунктам Ozon. Подождите немного или откройте карту.',
                'code' => 'rate_limited',
                'configured' => ln_ozon_configured(ln_config()),
                'mapUrl' => 'https://www.ozon.ru/info/map/',
                'points' => [],
            ], 429);
        }

        $city = trim((string) ($_GET['city'] ?? ''));
        if (mb_strlen($city) < 2) {
            ln_json(['error' => 'Укажите город для поиска пункта выдачи'], 400);
        }
        if (mb_strlen($city) > 120) {
            ln_json(['error' => 'Слишком длинное название города'], 400);
        }

        $result = ln_ozon_search_pvz(ln_config(), $city);
        if (!$result['ok']) {
            $status = ($result['code'] ?? '') === 'not_configured' ? 503 : 502;
            ln_json([
                'error' => $result['error'],
                'code' => $result['code'],
                'configured' => false,
                'mapUrl' => 'https://www.ozon.ru/info/map/',
                'points' => [],
            ], $status);
        }

        if (!empty($result['warming'])) {
            ln_json([
                'configured' => true,
                'warming' => true,
                'points' => [],
                'mapUrl' => 'https://www.ozon.ru/info/map/',
                'message' => 'Каталог пунктов Ozon обновляется. Подождите около минуты или выберите точку на карте.',
            ]);
        }

        ln_json([
            'configured' => true,
            'warming' => false,
            'points' => $result['points'],
            'mapUrl' => 'https://www.ozon.ru/info/map/',
        ]);
    }

    if ($method === 'POST' && $path === '/api/orders') {
        $limited = ln_rate_limit('orders:' . ln_client_ip(), 5);
        if (!$limited['ok']) {
            header('Retry-After: ' . $limited['retryAfterSec']);
            ln_json(['error' => 'Слишком много заявок. Подождите немного и попробуйте снова.'], 429);
        }

        $body = ln_json_body();
        $name = isset($body['name']) && is_string($body['name']) ? trim($body['name']) : '';
        $phone = isset($body['phone']) && is_string($body['phone']) ? trim($body['phone']) : '';
        $city = isset($body['city']) && is_string($body['city']) ? trim($body['city']) : '';
        $address = isset($body['address']) && is_string($body['address']) ? trim($body['address']) : '';
        $pickupPoint = isset($body['pickupPoint']) && is_string($body['pickupPoint']) ? trim($body['pickupPoint']) : '';
        $contactChannel = isset($body['contactChannel']) && is_string($body['contactChannel'])
            ? strtolower(trim($body['contactChannel']))
            : '';
        $contactHandle = isset($body['contactHandle']) && is_string($body['contactHandle'])
            ? trim($body['contactHandle'])
            : '';
        $comment = isset($body['comment']) && is_string($body['comment']) ? trim($body['comment']) : '';
        $vk = ln_parse_vk_profile($body);

        $refs = ln_parse_order_item_refs($body['items'] ?? null);
        if ($refs === []) {
            $legacyId = null;
            if (isset($body['productId']) && is_numeric($body['productId']) && (float) $body['productId'] > 0) {
                $legacyId = (int) round((float) $body['productId']);
            } elseif (isset($body['productId']) && is_string($body['productId']) && preg_match('/^\d+$/', trim($body['productId']))) {
                $legacyId = (int) trim($body['productId']);
            }
            if ($legacyId) {
                $refs = [['productId' => $legacyId, 'quantity' => 1]];
            }
        }

        if ($name === '' || mb_strlen($name) > 120) {
            ln_json(['error' => 'Укажите имя'], 400);
        }
        $digits = ln_phone_digit_count($phone);
        if ($phone === '' || mb_strlen($phone) > 40 || $digits < 10 || $digits > 15) {
            ln_json(['error' => 'Укажите корректный телефон'], 400);
        }
        if ($city === '' || mb_strlen($city) > 120) {
            ln_json(['error' => 'Укажите город получения'], 400);
        }
        if ($address === '' || mb_strlen($address) < 10 || mb_strlen($address) > 300 || !preg_match('/\d/', $address)) {
            ln_json(['error' => 'Укажите точный адрес: улица и номер дома'], 400);
        }
        if ($pickupPoint === '' || mb_strlen($pickupPoint) < 12 || mb_strlen($pickupPoint) > 400 || !preg_match('/\d/', $pickupPoint)) {
            ln_json(['error' => 'Укажите полный адрес пункта выдачи Ozon'], 400);
        }
        if (!in_array($contactChannel, LN_CONTACT_CHANNELS, true)) {
            ln_json(['error' => 'Укажите предпочтительный канал связи'], 400);
        }
        if (mb_strlen($contactHandle) > 200) {
            ln_json(['error' => 'Слишком длинный ник или ссылка для связи'], 400);
        }
        if (mb_strlen($comment) > 1000) {
            ln_json(['error' => 'Комментарий слишком длинный'], 400);
        }

        $resolved = ln_resolve_order_items(ln_db(), $refs);
        if (!$resolved['ok']) {
            ln_json(['error' => $resolved['error']], 400);
        }
        $items = $resolved['items'];
        $names = [];
        foreach ($items as $item) {
            $names[] = ($item['quantity'] ?? 1) > 1
                ? $item['productName'] . ' × ' . $item['quantity']
                : $item['productName'];
        }
        $productName = implode(', ', $names);
        if (mb_strlen($productName) > 2000) {
            ln_json(['error' => 'Слишком длинный список товаров'], 400);
        }
        $productId = count($items) === 1 ? $items[0]['productId'] : null;
        $itemsJson = json_encode($items, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);

        $stmt = ln_db()->prepare(
            'INSERT INTO orders (
                customer_name, phone, city, address, pickup_point,
                contact_channel, contact_handle,
                product_id, product_name, items_json, comment, status,
                vk_user_id, vk_first_name, vk_last_name, vk_avatar_url, vk_profile_url
            ) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)'
        );
        $stmt->execute([
            $name, $phone, $city, $address, $pickupPoint,
            $contactChannel, $contactHandle,
            $productId, $productName, $itemsJson, $comment, 'new',
            $vk['vkUserId'], $vk['vkFirstName'], $vk['vkLastName'], $vk['vkAvatarUrl'], $vk['vkProfileUrl'],
        ]);

        ln_json(['ok' => true]);
    }

    // ---------- Admin auth ----------
    if ($method === 'POST' && $path === '/api/admin/login') {
        $limited = ln_rate_limit('login:' . ln_client_ip(), 10);
        if (!$limited['ok']) {
            header('Retry-After: ' . $limited['retryAfterSec']);
            ln_json(['error' => 'Слишком много попыток входа. Подождите и попробуйте снова.'], 429);
        }

        $body = ln_json_body();
        $password = isset($body['password']) && is_string($body['password']) ? $body['password'] : '';
        $adminPassword = (string) (ln_config()['admin_password'] ?? '');
        if ($password === '' || !ln_timing_safe_equal($password, $adminPassword)) {
            ln_json(['error' => 'Неверный пароль'], 401);
        }

        $cookie = ln_create_session_cookie((string) ln_config()['session_secret'], ln_is_https());
        header('Set-Cookie: ' . $cookie);
        ln_json(['ok' => true]);
    }

    if ($method === 'POST' && $path === '/api/admin/logout') {
        header('Set-Cookie: ' . ln_clear_session_cookie(ln_is_https()));
        ln_json(['ok' => true]);
    }

    if ($method === 'GET' && $path === '/api/admin/session') {
        $valid = ln_is_session_valid((string) (ln_config()['session_secret'] ?? ''));
        ln_json(['authenticated' => $valid]);
    }

    // ---------- Protected admin ----------
    $needsAuth =
        str_starts_with($path, '/api/admin/orders')
        || str_starts_with($path, '/api/admin/products')
        || str_starts_with($path, '/api/admin/categories');

    if ($needsAuth) {
        ln_require_auth();
    }

    if ($method === 'GET' && $path === '/api/admin/orders') {
        $stmt = ln_db()->query(
            'SELECT id, customer_name, phone, city, address, pickup_point, tracking_number,
                    contact_channel, contact_handle, product_id, product_name, items_json, comment,
                    status, created_at, vk_user_id, vk_first_name, vk_last_name, vk_avatar_url, vk_profile_url
             FROM orders ORDER BY created_at DESC, id DESC'
        );
        ln_json(['orders' => array_map('ln_to_admin_order', $stmt->fetchAll())]);
    }

    if ($method === 'PATCH' && preg_match('#^/api/admin/orders/(\d+)$#', $path, $m)) {
        $id = (int) $m[1];
        $body = ln_json_body();

        if (isset($body['trackingNumber']) && is_string($body['trackingNumber'])) {
            $trackingNumber = trim($body['trackingNumber']);
            if (mb_strlen($trackingNumber) > 120) {
                ln_json(['error' => 'Слишком длинный трек-номер'], 400);
            }
            $stmt = ln_db()->prepare('UPDATE orders SET tracking_number = ? WHERE id = ?');
            $stmt->execute([$trackingNumber, $id]);
            if ($stmt->rowCount() === 0) {
                ln_json(['error' => 'Заявка не найдена'], 404);
            }
            ln_json(['ok' => true]);
        }

        $status = $body['status'] ?? null;
        if ($status !== 'new' && $status !== 'done') {
            ln_json(['error' => 'Некорректный статус'], 400);
        }
        $stmt = ln_db()->prepare('UPDATE orders SET status = ? WHERE id = ?');
        $stmt->execute([$status, $id]);
        if ($stmt->rowCount() === 0) {
            ln_json(['error' => 'Заявка не найдена'], 404);
        }
        ln_json(['ok' => true]);
    }

    if ($method === 'GET' && $path === '/api/admin/products') {
        $stmt = ln_db()->query(
            'SELECT id, name, description, category, image_url, image_urls, price_rub, is_active, sort_order, created_at
             FROM products ORDER BY sort_order ASC, id ASC'
        );
        ln_json(['products' => array_map('ln_to_admin_product', $stmt->fetchAll())]);
    }

    if ($method === 'POST' && $path === '/api/admin/products') {
        $body = ln_json_body();
        $name = isset($body['name']) && is_string($body['name']) ? trim($body['name']) : '';
        $description = isset($body['description']) && is_string($body['description']) ? trim($body['description']) : '';
        $category = $body['category'] ?? null;
        $imageUrlsSource = $body['imageUrls'] ?? (
            isset($body['imageUrl']) && $body['imageUrl'] !== null && $body['imageUrl'] !== ''
                ? [$body['imageUrl']]
                : []
        );
        $imageUrlsResult = ln_normalize_image_urls($imageUrlsSource);
        if (isset($imageUrlsResult['error'])) {
            ln_json(['error' => $imageUrlsResult['error']], 400);
        }
        $imageUrls = $imageUrlsResult;
        $imageUrl = $imageUrls[0] ?? null;
        $imageUrlsJson = $imageUrls !== [] ? json_encode($imageUrls, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES) : null;
        $priceRub = ln_parse_price_rub($body['priceRub'] ?? null);
        $isActive = ($body['isActive'] ?? true) !== false;
        $sortOrder = isset($body['sortOrder']) && is_numeric($body['sortOrder']) ? (int) $body['sortOrder'] : 0;

        if ($name === '' || mb_strlen($name) > 200) {
            ln_json(['error' => 'Укажите название товара'], 400);
        }
        if (!ln_is_valid_category(ln_db(), $category)) {
            ln_json(['error' => 'Некорректная категория'], 400);
        }
        if (mb_strlen($description) > 1000) {
            ln_json(['error' => 'Описание слишком длинное'], 400);
        }

        $stmt = ln_db()->prepare(
            'INSERT INTO products (name, description, category, image_url, image_urls, price_rub, is_active, sort_order)
             VALUES (?,?,?,?,?,?,?,?)'
        );
        $stmt->execute([
            $name, $description, $category, $imageUrl, $imageUrlsJson, $priceRub, $isActive ? 1 : 0, $sortOrder,
        ]);
        ln_json(['ok' => true, 'id' => (int) ln_db()->lastInsertId()]);
    }

    if ($method === 'PUT' && preg_match('#^/api/admin/products/(\d+)$#', $path, $m)) {
        $id = (int) $m[1];
        $body = ln_json_body();
        $name = isset($body['name']) && is_string($body['name']) ? trim($body['name']) : '';
        $description = isset($body['description']) && is_string($body['description']) ? trim($body['description']) : '';
        $category = $body['category'] ?? null;
        $imageUrlsSource = $body['imageUrls'] ?? (
            isset($body['imageUrl']) && $body['imageUrl'] !== null && $body['imageUrl'] !== ''
                ? [$body['imageUrl']]
                : []
        );
        $imageUrlsResult = ln_normalize_image_urls($imageUrlsSource);
        if (isset($imageUrlsResult['error'])) {
            ln_json(['error' => $imageUrlsResult['error']], 400);
        }
        $imageUrls = $imageUrlsResult;
        $imageUrl = $imageUrls[0] ?? null;
        $imageUrlsJson = $imageUrls !== [] ? json_encode($imageUrls, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES) : null;
        $priceRub = ln_parse_price_rub($body['priceRub'] ?? null);
        $isActive = ($body['isActive'] ?? true) !== false;
        $sortOrder = isset($body['sortOrder']) && is_numeric($body['sortOrder']) ? (int) $body['sortOrder'] : 0;

        if ($name === '' || mb_strlen($name) > 200) {
            ln_json(['error' => 'Укажите название товара'], 400);
        }
        if (!ln_is_valid_category(ln_db(), $category)) {
            ln_json(['error' => 'Некорректная категория'], 400);
        }
        if (mb_strlen($description) > 1000) {
            ln_json(['error' => 'Описание слишком длинное'], 400);
        }

        $stmt = ln_db()->prepare(
            'UPDATE products SET name=?, description=?, category=?, image_url=?, image_urls=?, price_rub=?, is_active=?, sort_order=? WHERE id=?'
        );
        $stmt->execute([
            $name, $description, $category, $imageUrl, $imageUrlsJson, $priceRub, $isActive ? 1 : 0, $sortOrder, $id,
        ]);
        if ($stmt->rowCount() === 0) {
            // rowCount can be 0 if values unchanged — check existence
            $check = ln_db()->prepare('SELECT id FROM products WHERE id = ?');
            $check->execute([$id]);
            if (!$check->fetch()) {
                ln_json(['error' => 'Товар не найден'], 404);
            }
        }
        ln_json(['ok' => true]);
    }

    if ($method === 'DELETE' && preg_match('#^/api/admin/products/(\d+)$#', $path, $m)) {
        $id = (int) $m[1];
        $stmt = ln_db()->prepare('DELETE FROM products WHERE id = ?');
        $stmt->execute([$id]);
        if ($stmt->rowCount() === 0) {
            ln_json(['error' => 'Товар не найден'], 404);
        }
        ln_json(['ok' => true]);
    }

    if ($method === 'GET' && $path === '/api/admin/categories') {
        $stmt = ln_db()->query(
            'SELECT id, label, room, short, sort_order FROM categories ORDER BY sort_order ASC, id ASC'
        );
        ln_json(['categories' => array_map('ln_to_public_category', $stmt->fetchAll())]);
    }

    if ($method === 'POST' && $path === '/api/admin/categories') {
        $body = ln_json_body();
        $label = isset($body['label']) && is_string($body['label']) ? trim($body['label']) : '';
        $room = isset($body['room']) && is_string($body['room']) && trim($body['room']) !== ''
            ? trim($body['room'])
            : $label;
        $short = isset($body['short']) && is_string($body['short']) ? trim($body['short']) : '';
        $sortOrder = isset($body['sortOrder']) && is_numeric($body['sortOrder'])
            ? (int) round((float) $body['sortOrder'])
            : 0;
        $id = isset($body['id']) && is_string($body['id']) ? strtolower(trim($body['id'])) : '';
        if ($id === '' && $label !== '') {
            $id = ln_slugify_category_id($label);
            for ($n = 2; $n < 1000 && ln_category_exists(ln_db(), $id); $n++) {
                $suffix = '-' . $n;
                $id = substr(ln_slugify_category_id($label), 0, max(1, 48 - strlen($suffix))) . $suffix;
            }
        }

        if ($label === '' || mb_strlen($label) > 80) {
            ln_json(['error' => 'Укажите название категории'], 400);
        }
        if (!preg_match('/^[a-z][a-z0-9-]{1,47}$/', $id)) {
            ln_json(['error' => 'Id категории: латиница, цифры и дефис, от 2 символов'], 400);
        }
        if (mb_strlen($room) > 80) {
            ln_json(['error' => 'Слишком длинное название комнаты'], 400);
        }
        if (mb_strlen($short) > 120) {
            ln_json(['error' => 'Слишком длинное описание'], 400);
        }

        try {
            $stmt = ln_db()->prepare(
                'INSERT INTO categories (id, label, room, short, sort_order) VALUES (?,?,?,?,?)'
            );
            $stmt->execute([$id, $label, $room, $short, $sortOrder]);
        } catch (PDOException $e) {
            ln_json(['error' => 'Категория с таким id уже есть'], 400);
        }
        ln_json(['ok' => true, 'id' => $id]);
    }

    if ($method === 'PUT' && preg_match('#^/api/admin/categories/([^/]+)$#', $path, $m)) {
        $id = rawurldecode($m[1]);
        $body = ln_json_body();
        $label = isset($body['label']) && is_string($body['label']) ? trim($body['label']) : '';
        $room = isset($body['room']) && is_string($body['room']) && trim($body['room']) !== ''
            ? trim($body['room'])
            : $label;
        $short = isset($body['short']) && is_string($body['short']) ? trim($body['short']) : '';
        $sortOrder = isset($body['sortOrder']) && is_numeric($body['sortOrder'])
            ? (int) round((float) $body['sortOrder'])
            : 0;

        if ($label === '' || mb_strlen($label) > 80) {
            ln_json(['error' => 'Укажите название категории'], 400);
        }
        if (mb_strlen($room) > 80) {
            ln_json(['error' => 'Слишком длинное название комнаты'], 400);
        }
        if (mb_strlen($short) > 120) {
            ln_json(['error' => 'Слишком длинное описание'], 400);
        }

        $stmt = ln_db()->prepare(
            'UPDATE categories SET label=?, room=?, short=?, sort_order=? WHERE id=?'
        );
        $stmt->execute([$label, $room, $short, $sortOrder, $id]);
        $check = ln_db()->prepare('SELECT id FROM categories WHERE id = ?');
        $check->execute([$id]);
        if (!$check->fetch()) {
            ln_json(['error' => 'Категория не найдена'], 404);
        }
        ln_json(['ok' => true]);
    }

    if ($method === 'DELETE' && preg_match('#^/api/admin/categories/([^/]+)$#', $path, $m)) {
        $id = rawurldecode($m[1]);
        $used = ln_db()->prepare('SELECT id FROM products WHERE category = ? LIMIT 1');
        $used->execute([$id]);
        if ($used->fetch()) {
            ln_json([
                'error' => 'Нельзя удалить: в категории есть товары. Сначала перенесите или удалите их.',
            ], 400);
        }
        $stmt = ln_db()->prepare('DELETE FROM categories WHERE id = ?');
        $stmt->execute([$id]);
        if ($stmt->rowCount() === 0) {
            ln_json(['error' => 'Категория не найдена'], 404);
        }
        ln_json(['ok' => true]);
    }

    ln_json(['error' => 'Не найдено'], 404);
} catch (Throwable $e) {
    error_log('API error: ' . $e->getMessage() . ' @ ' . $e->getFile() . ':' . $e->getLine());
    ln_json(['error' => 'Внутренняя ошибка сервера'], 500);
}
