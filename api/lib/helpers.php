<?php
declare(strict_types=1);

const LN_MAX_IMAGE_URL_CHARS = 700_000;
const LN_MAX_IMAGE_URLS = 12;
const LN_PRODUCT_CATEGORIES = [
    'seeds', 'ceramics', 'forge', 'dolls', 'jewelry', 'perfume', 'wood', 'candles', 'highlights',
];
const LN_CONTACT_CHANNELS = ['vk', 'telegram', 'whatsapp', 'call', 'sms'];

function ln_parse_image_urls(?string $raw, ?string $fallback): array
{
    if ($raw) {
        $parsed = json_decode($raw, true);
        if (is_array($parsed)) {
            $urls = [];
            foreach ($parsed as $item) {
                if (is_string($item) && trim($item) !== '') {
                    $urls[] = $item;
                }
            }
            if ($urls !== []) {
                return $urls;
            }
        }
    }
    return $fallback ? [$fallback] : [];
}

function ln_normalize_image_url(mixed $value): string|null|array
{
    if ($value === null || $value === '') {
        return null;
    }
    if (!is_string($value)) {
        return ['error' => 'Некорректная ссылка на фото'];
    }
    $trimmed = trim($value);
    if ($trimmed === '') {
        return null;
    }
    if (strlen($trimmed) > LN_MAX_IMAGE_URL_CHARS) {
        return ['error' => 'Фото слишком большое. Выберите файл поменьше или сожмите изображение.'];
    }
    if (
        str_starts_with($trimmed, 'data:image/')
        || preg_match('#^https?://#i', $trimmed)
        || str_starts_with($trimmed, '/')
    ) {
        return $trimmed;
    }
    return ['error' => 'Укажите файл, http(s)-ссылку или путь к фото'];
}

function ln_normalize_image_urls(mixed $value): array
{
    if ($value === null || $value === '') {
        return [];
    }
    if (!is_array($value)) {
        return ['error' => 'Некорректный список фото'];
    }
    if (count($value) > LN_MAX_IMAGE_URLS) {
        return ['error' => 'Слишком много фото (максимум ' . LN_MAX_IMAGE_URLS . ')'];
    }
    $urls = [];
    foreach ($value as $entry) {
        $result = ln_normalize_image_url($entry);
        if (is_array($result) && isset($result['error'])) {
            return $result;
        }
        if (is_string($result)) {
            $urls[] = $result;
        }
    }
    return $urls;
}

function ln_to_public_product(array $row): array
{
    $imageUrls = ln_parse_image_urls($row['image_urls'] ?? null, $row['image_url'] ?? null);
    return [
        'id' => (int) $row['id'],
        'name' => $row['name'],
        'description' => $row['description'],
        'category' => $row['category'],
        'imageUrl' => $imageUrls[0] ?? ($row['image_url'] ?? null),
        'imageUrls' => $imageUrls,
        'priceRub' => $row['price_rub'] !== null ? (int) $row['price_rub'] : null,
    ];
}

function ln_to_admin_product(array $row): array
{
    $imageUrls = ln_parse_image_urls($row['image_urls'] ?? null, $row['image_url'] ?? null);
    return [
        'id' => (int) $row['id'],
        'name' => $row['name'],
        'description' => $row['description'],
        'category' => $row['category'],
        'imageUrl' => $imageUrls[0] ?? ($row['image_url'] ?? null),
        'imageUrls' => $imageUrls,
        'priceRub' => $row['price_rub'] !== null ? (int) $row['price_rub'] : null,
        'isActive' => ((int) $row['is_active']) === 1,
        'sortOrder' => (int) $row['sort_order'],
        'createdAt' => $row['created_at'],
    ];
}

function ln_parse_price_rub(mixed $value): ?int
{
    if ($value === null || $value === '') {
        return null;
    }
    if (!is_numeric($value)) {
        return null;
    }
    $num = (float) $value;
    if (!is_finite($num) || $num < 0) {
        return null;
    }
    return (int) round($num);
}

function ln_parse_order_item_refs(mixed $raw): array
{
    if (!is_array($raw)) {
        return [];
    }
    $refs = [];
    foreach ($raw as $entry) {
        if (!is_array($entry)) {
            continue;
        }
        $productId = null;
        if (isset($entry['productId']) && is_numeric($entry['productId'])) {
            $productId = (int) round((float) $entry['productId']);
        } elseif (isset($entry['productId']) && is_string($entry['productId']) && preg_match('/^\d+$/', trim($entry['productId']))) {
            $productId = (int) trim($entry['productId']);
        }
        if ($productId === null || $productId <= 0) {
            continue;
        }
        $quantity = 1;
        if (isset($entry['quantity']) && is_numeric($entry['quantity']) && (float) $entry['quantity'] > 0) {
            $quantity = min(99, (int) round((float) $entry['quantity']));
        }
        $refs[] = ['productId' => $productId, 'quantity' => $quantity];
    }
    return $refs;
}

function ln_parse_stored_order_items(mixed $raw): array
{
    if (!is_array($raw)) {
        return [];
    }
    $items = [];
    foreach ($raw as $entry) {
        if (!is_array($entry)) {
            continue;
        }
        $productName = isset($entry['productName']) && is_string($entry['productName'])
            ? trim($entry['productName'])
            : '';
        if ($productName === '' || strlen($productName) > 200) {
            continue;
        }
        $productId = isset($entry['productId']) && is_numeric($entry['productId'])
            ? (int) $entry['productId']
            : null;
        $quantity = 1;
        if (isset($entry['quantity']) && is_numeric($entry['quantity']) && (float) $entry['quantity'] > 0) {
            $quantity = min(99, (int) round((float) $entry['quantity']));
        }
        $items[] = [
            'productId' => $productId,
            'productName' => $productName,
            'priceRub' => ln_parse_price_rub($entry['priceRub'] ?? null),
            'quantity' => $quantity,
        ];
    }
    return $items;
}

function ln_parse_items_json(?string $raw): ?array
{
    if (!$raw) {
        return null;
    }
    $parsed = json_decode($raw, true);
    $items = ln_parse_stored_order_items($parsed);
    return $items !== [] ? $items : null;
}

function ln_resolve_order_items(PDO $db, array $refs): array
{
    if ($refs === []) {
        return ['ok' => false, 'error' => 'Не выбран товар'];
    }
    if (count($refs) > 30) {
        return ['ok' => false, 'error' => 'Слишком много позиций в заявке'];
    }

    $uniqueIds = array_values(array_unique(array_map(static fn ($r) => $r['productId'], $refs)));
    $placeholders = implode(',', array_fill(0, count($uniqueIds), '?'));
    $stmt = $db->prepare(
        "SELECT id, name, price_rub FROM products WHERE is_active = 1 AND id IN ($placeholders)"
    );
    $stmt->execute($uniqueIds);
    $byId = [];
    foreach ($stmt->fetchAll() as $row) {
        $byId[(int) $row['id']] = $row;
    }

    $items = [];
    foreach ($refs as $ref) {
        $row = $byId[$ref['productId']] ?? null;
        if ($row === null) {
            return [
                'ok' => false,
                'error' => 'Один или несколько товаров недоступны. Обновите каталог и попробуйте снова.',
            ];
        }
        $items[] = [
            'productId' => (int) $row['id'],
            'productName' => $row['name'],
            'priceRub' => $row['price_rub'] !== null ? (int) $row['price_rub'] : null,
            'quantity' => $ref['quantity'],
        ];
    }
    return ['ok' => true, 'items' => $items];
}

function ln_normalize_optional_text(mixed $value, int $maxLen): ?string
{
    if (!is_string($value)) {
        return null;
    }
    $trimmed = trim($value);
    if ($trimmed === '') {
        return null;
    }
    return mb_substr($trimmed, 0, $maxLen);
}

function ln_parse_vk_profile(array $body): array
{
    $vkUserId = ln_normalize_optional_text($body['vkUserId'] ?? null, 64);
    if ($vkUserId === null || !preg_match('/^\d{1,20}$/', $vkUserId)) {
        return [
            'vkUserId' => null,
            'vkFirstName' => null,
            'vkLastName' => null,
            'vkAvatarUrl' => null,
            'vkProfileUrl' => null,
        ];
    }

    $vkAvatarUrl = ln_normalize_optional_text($body['vkAvatarUrl'] ?? null, 1000);
    if ($vkAvatarUrl !== null && !preg_match('#^https://#i', $vkAvatarUrl)) {
        $vkAvatarUrl = null;
    }

    $vkProfileUrl = ln_normalize_optional_text($body['vkProfileUrl'] ?? null, 300);
    if ($vkProfileUrl !== null && !preg_match('#^https://(m\.)?vk\.(com|ru)/#i', $vkProfileUrl)) {
        $vkProfileUrl = 'https://vk.com/id' . $vkUserId;
    } elseif ($vkProfileUrl === null) {
        $vkProfileUrl = 'https://vk.com/id' . $vkUserId;
    }

    return [
        'vkUserId' => $vkUserId,
        'vkFirstName' => ln_normalize_optional_text($body['vkFirstName'] ?? null, 120),
        'vkLastName' => ln_normalize_optional_text($body['vkLastName'] ?? null, 120),
        'vkAvatarUrl' => $vkAvatarUrl,
        'vkProfileUrl' => $vkProfileUrl,
    ];
}

function ln_to_admin_order(array $row): array
{
    $items = ln_parse_items_json($row['items_json'] ?? null);
    $out = [
        'id' => (int) $row['id'],
        'name' => $row['customer_name'],
        'phone' => $row['phone'],
        'city' => $row['city'] ?? '',
        'address' => $row['address'] ?? '',
        'pickupPoint' => $row['pickup_point'] ?? '',
        'trackingNumber' => $row['tracking_number'] ?? '',
        'contactChannel' => $row['contact_channel'] ?? '',
        'contactHandle' => $row['contact_handle'] ?? '',
        'productId' => $row['product_id'] !== null ? (int) $row['product_id'] : null,
        'productName' => $row['product_name'],
        'comment' => $row['comment'],
        'status' => $row['status'],
        'createdAt' => $row['created_at'],
        'vkUserId' => $row['vk_user_id'],
        'vkFirstName' => $row['vk_first_name'],
        'vkLastName' => $row['vk_last_name'],
        'vkAvatarUrl' => $row['vk_avatar_url'],
        'vkProfileUrl' => $row['vk_profile_url'],
    ];
    if ($items !== null) {
        $out['items'] = $items;
    }
    return $out;
}

function ln_to_public_category(array $row): array
{
    return [
        'id' => $row['id'],
        'label' => $row['label'],
        'room' => $row['room'],
        'short' => $row['short'],
        'sortOrder' => (int) $row['sort_order'],
    ];
}

function ln_slugify_category_id(string $label): string
{
    $map = [
        'а' => 'a', 'б' => 'b', 'в' => 'v', 'г' => 'g', 'д' => 'd', 'е' => 'e', 'ё' => 'e',
        'ж' => 'zh', 'з' => 'z', 'и' => 'i', 'й' => 'y', 'к' => 'k', 'л' => 'l', 'м' => 'm',
        'н' => 'n', 'о' => 'o', 'п' => 'p', 'р' => 'r', 'с' => 's', 'т' => 't', 'у' => 'u',
        'ф' => 'f', 'х' => 'h', 'ц' => 'ts', 'ч' => 'ch', 'ш' => 'sh', 'щ' => 'sch',
        'ъ' => '', 'ы' => 'y', 'ь' => '', 'э' => 'e', 'ю' => 'yu', 'я' => 'ya',
    ];
    $lower = mb_strtolower(trim($label), 'UTF-8');
    $out = '';
    $len = mb_strlen($lower, 'UTF-8');
    for ($i = 0; $i < $len; $i++) {
        $ch = mb_substr($lower, $i, 1, 'UTF-8');
        if (isset($map[$ch])) {
            $out .= $map[$ch];
        } elseif (preg_match('/[a-z0-9]/', $ch)) {
            $out .= $ch;
        } elseif ($ch === ' ' || $ch === '-' || $ch === '_') {
            $out .= '-';
        }
    }
    $out = preg_replace('/-+/', '-', $out) ?? '';
    $out = trim($out, '-');
    $out = substr($out, 0, 48);
    return $out !== '' ? $out : 'category';
}

function ln_category_exists(PDO $db, string $id): bool
{
    $stmt = $db->prepare('SELECT id FROM categories WHERE id = ? LIMIT 1');
    $stmt->execute([$id]);
    if ($stmt->fetch()) {
        return true;
    }
    return in_array($id, LN_PRODUCT_CATEGORIES, true);
}

function ln_is_valid_category(PDO $db, mixed $value): bool
{
    return is_string($value)
        && $value !== ''
        && strlen($value) <= 48
        && ln_category_exists($db, $value);
}

function ln_phone_digit_count(string $phone): int
{
    return strlen(preg_replace('/\D/', '', $phone) ?? '');
}
