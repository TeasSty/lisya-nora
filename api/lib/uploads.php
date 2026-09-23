<?php
declare(strict_types=1);

/** Макс. размер файла на диске после сжатия на клиенте (~600 КБ). */
const LN_UPLOAD_MAX_BYTES = 600_000;

/** Допустимые MIME → расширение. */
const LN_UPLOAD_MIME_EXT = [
    'image/jpeg' => 'jpg',
    'image/png' => 'png',
    'image/webp' => 'webp',
    'image/gif' => 'gif',
];

/**
 * Корень загрузок: public_html/uploads (рядом с api/).
 */
function ln_uploads_root(): string
{
    return dirname(__DIR__) . DIRECTORY_SEPARATOR . '..' . DIRECTORY_SEPARATOR . 'uploads';
}

/**
 * @return string|array{error:string} абсолютный путь к uploads/products
 */
function ln_ensure_product_uploads_dir(): string|array
{
    $dir = ln_uploads_root() . DIRECTORY_SEPARATOR . 'products';
    if (!is_dir($dir)) {
        if (!@mkdir($dir, 0755, true) && !is_dir($dir)) {
            return ['error' => 'Не удалось создать папку uploads/products на сервере'];
        }
    }
    if (!is_writable($dir)) {
        return ['error' => 'Папка uploads/products недоступна для записи. Выставьте права 755/775.'];
    }
    return $dir;
}

/**
 * @return string|array{error:string} публичный путь /uploads/products/...
 */
function ln_store_image_bytes(string $bytes, string $mime): string|array
{
    $mime = strtolower(trim($mime));
    if (!isset(LN_UPLOAD_MIME_EXT[$mime])) {
        return ['error' => 'Допустимы только JPEG, PNG, WebP или GIF'];
    }
    $len = strlen($bytes);
    if ($len < 24) {
        return ['error' => 'Файл изображения пустой или повреждён'];
    }
    if ($len > LN_UPLOAD_MAX_BYTES) {
        return ['error' => 'Фото слишком большое после сжатия (макс. ~600 КБ)'];
    }

    $detected = ln_detect_image_mime($bytes);
    if ($detected === null || $detected !== $mime) {
        // Доверяем сигнатуре файла, а не заявленному MIME клиента.
        if ($detected === null || !isset(LN_UPLOAD_MIME_EXT[$detected])) {
            return ['error' => 'Содержимое файла не похоже на изображение'];
        }
        $mime = $detected;
    }

    $dir = ln_ensure_product_uploads_dir();
    if (is_array($dir)) {
        return $dir;
    }

    $ext = LN_UPLOAD_MIME_EXT[$mime];
    $name = bin2hex(random_bytes(16)) . '.' . $ext;
    $abs = $dir . DIRECTORY_SEPARATOR . $name;
    if (file_put_contents($abs, $bytes) === false) {
        return ['error' => 'Не удалось сохранить файл на сервере'];
    }

    return '/uploads/products/' . $name;
}

function ln_detect_image_mime(string $bytes): ?string
{
    if (strncmp($bytes, "\xFF\xD8\xFF", 3) === 0) {
        return 'image/jpeg';
    }
    if (strncmp($bytes, "\x89PNG\r\n\x1A\n", 8) === 0) {
        return 'image/png';
    }
    if (strncmp($bytes, 'GIF87a', 6) === 0 || strncmp($bytes, 'GIF89a', 6) === 0) {
        return 'image/gif';
    }
    if (strlen($bytes) >= 12 && strncmp($bytes, 'RIFF', 4) === 0 && substr($bytes, 8, 4) === 'WEBP') {
        return 'image/webp';
    }
    return null;
}

/**
 * @return string|array{error:string}
 */
function ln_store_data_url(string $dataUrl): string|array
{
    if (!preg_match('#^data:(image/(?:jpeg|png|webp|gif));base64,([A-Za-z0-9+/=\s]+)$#', $dataUrl, $m)) {
        return ['error' => 'Некорректный data URL изображения'];
    }
    $mime = strtolower($m[1]);
    $raw = base64_decode(preg_replace('/\s+/', '', $m[2]) ?? '', true);
    if ($raw === false) {
        return ['error' => 'Не удалось декодировать изображение'];
    }
    return ln_store_image_bytes($raw, $mime);
}

/**
 * Сохранить файл из $_FILES['file'].
 * @param array{name?:string,type?:string,tmp_name?:string,error?:int,size?:int} $file
 * @return string|array{error:string}
 */
function ln_store_uploaded_file(array $file): string|array
{
    $err = (int) ($file['error'] ?? UPLOAD_ERR_NO_FILE);
    if ($err !== UPLOAD_ERR_OK) {
        return ['error' => ln_upload_err_message($err)];
    }
    $tmp = (string) ($file['tmp_name'] ?? '');
    if ($tmp === '' || !is_uploaded_file($tmp)) {
        return ['error' => 'Некорректная загрузка файла'];
    }
    $size = (int) ($file['size'] ?? 0);
    if ($size <= 0 || $size > LN_UPLOAD_MAX_BYTES) {
        return ['error' => 'Фото слишком большое (макс. ~600 КБ после сжатия)'];
    }
    $bytes = file_get_contents($tmp);
    if ($bytes === false) {
        return ['error' => 'Не удалось прочитать загруженный файл'];
    }
    $mime = ln_detect_image_mime($bytes) ?? '';
    if ($mime === '') {
        return ['error' => 'Допустимы только JPEG, PNG, WebP или GIF'];
    }
    return ln_store_image_bytes($bytes, $mime);
}

function ln_upload_err_message(int $code): string
{
    return match ($code) {
        UPLOAD_ERR_INI_SIZE, UPLOAD_ERR_FORM_SIZE => 'Файл превышает лимит загрузки сервера',
        UPLOAD_ERR_PARTIAL => 'Файл загружен частично. Попробуйте ещё раз.',
        UPLOAD_ERR_NO_FILE => 'Файл не выбран',
        UPLOAD_ERR_NO_TMP_DIR => 'На сервере нет временной папки для загрузок',
        UPLOAD_ERR_CANT_WRITE => 'Сервер не смог записать файл на диск',
        UPLOAD_ERR_EXTENSION => 'Загрузка заблокирована расширением PHP',
        default => 'Ошибка загрузки файла',
    };
}

/**
 * data URL → файл на диске; http(s) и локальные пути оставить.
 * @param list<string> $urls
 * @return list<string>|array{error:string}
 */
function ln_materialize_image_urls(array $urls): array
{
    $out = [];
    foreach ($urls as $url) {
        if (!is_string($url)) {
            return ['error' => 'Некорректная ссылка на фото'];
        }
        $trimmed = trim($url);
        if ($trimmed === '') {
            continue;
        }
        if (str_starts_with($trimmed, 'data:image/')) {
            $stored = ln_store_data_url($trimmed);
            if (is_array($stored)) {
                return $stored;
            }
            $out[] = $stored;
            continue;
        }
        if (preg_match('#^https?://#i', $trimmed) || str_starts_with($trimmed, '/uploads/')) {
            $out[] = $trimmed;
            continue;
        }
        // Прочие относительные пути (статика /images/…) — только безопасные символы.
        if (str_starts_with($trimmed, '/') && !str_contains($trimmed, '..') && preg_match('#^/[\w./\-]+$#u', $trimmed)) {
            $out[] = $trimmed;
            continue;
        }
        return ['error' => 'Укажите файл, http(s)-ссылку или путь /uploads/…'];
    }
    return $out;
}
