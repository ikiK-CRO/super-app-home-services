<?php
/**
 * Helper functions for the API
 * Using functional programming principles
 */

/**
 * Get configuration values
 * 
 * @param string $key Dot notation key (e.g., 'db.host')
 * @param mixed $default Default value if key not found
 * @return mixed Configuration value
 */
function config(string $key, $default = null) {
    static $config = null;
    
    if ($config === null) {
        $config = require __DIR__ . '/../config/config.php';
    }
    
    $parts = explode('.', $key);
    $value = $config;
    
    foreach ($parts as $part) {
        if (!isset($value[$part])) {
            return $default;
        }
        $value = $value[$part];
    }
    
    return $value;
}

/**
 * Get translation for a key in the specified language
 * 
 * @param string $key Translation key
 * @param string $lang Language code (default: from config)
 * @param array $params Parameters to replace in the translation
 * @return string Translated text
 */
function __($key, $lang = null, $params = []) {
    $lang = $lang ?: config('app.default_language');
    
    // Get translation from database or cache
    $translation = getTranslation($key, $lang);
    
    // Replace parameters if any
    if (!empty($params)) {
        foreach ($params as $param => $value) {
            $translation = str_replace(':' . $param, $value, $translation);
        }
    }
    
    return $translation ?: $key;
}

/**
 * Get translation from database or cache
 * 
 * @param string $key Translation key
 * @param string $lang Language code
 * @return string|null Translation or null if not found
 */
function getTranslation($key, $lang) {
    static $translations = [];
    
    // Check if we already have this translation in memory
    if (isset($translations[$lang][$key])) {
        return $translations[$lang][$key];
    }
    
    // Try to get from database
    try {
        $pdo = getPDO();
        $stmt = $pdo->prepare("
            SELECT t.value 
            FROM translations t
            JOIN languages l ON t.language_id = l.id
            WHERE l.code = ? AND t.key = ?
        ");
        $stmt->execute([$lang, $key]);
        $result = $stmt->fetch(PDO::FETCH_ASSOC);
        
        if ($result) {
            // Cache the result
            $translations[$lang][$key] = $result['value'];
            return $result['value'];
        }
        
        // If not found and language is not default, try default language
        if ($lang !== config('app.default_language')) {
            return getTranslation($key, config('app.default_language'));
        }
        
        return null;
    } catch (PDOException $e) {
        // Log error
        error_log("Translation error: " . $e->getMessage());
        return null;
    }
}

/**
 * Get PDO database connection
 * 
 * @return PDO Database connection
 */
function getPDO() {
    static $pdo = null;
    
    if ($pdo === null) {
        $dbConfig = config('db');
        $dsn = "mysql:host={$dbConfig['host']};dbname={$dbConfig['name']};charset={$dbConfig['charset']}";
        $options = [
            PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
            PDO::ATTR_EMULATE_PREPARES => false,
            PDO::MYSQL_ATTR_INIT_COMMAND => "SET NAMES {$dbConfig['charset']} COLLATE {$dbConfig['collation']}"
        ];
        
        try {
            $pdo = new PDO($dsn, $dbConfig['user'], $dbConfig['pass'], $options);
        } catch (PDOException $e) {
            throw new Exception("Database connection failed: " . $e->getMessage());
        }
    }
    
    return $pdo;
}

/**
 * Generate JWT token for a user
 * 
 * @param array $userData User data to include in the token
 * @return string JWT token
 */
function generateJWT(array $userData) {
    $issuedAt = time();
    $expire = $issuedAt + config('jwt.expiry');
    
    $payload = [
        'iat' => $issuedAt,
        'exp' => $expire,
        'data' => $userData
    ];
    
    return \Firebase\JWT\JWT::encode($payload, config('jwt.secret'), 'HS256');
}

/**
 * Decode JWT token
 * 
 * @param string $token JWT token
 * @return array|null Decoded token data or null if invalid
 */
function decodeJWT($token) {
    try {
        $decoded = \Firebase\JWT\JWT::decode($token, config('jwt.secret'), ['HS256']);
        return (array) $decoded->data;
    } catch (Exception $e) {
        return null;
    }
}

/**
 * Response wrapper
 * 
 * @param mixed $data Response data
 * @param int $status HTTP status code
 * @param string $message Optional message
 * @return array Response array
 */
function response($data = null, $status = 200, $message = '') {
    return [
        'status' => $status,
        'message' => $message,
        'data' => $data
    ];
}

/**
 * Calculate platform fee
 * 
 * @param float $amount Total amount
 * @return float Platform fee amount
 */
function calculatePlatformFee($amount) {
    $percentage = config('stripe.platform_fee_percentage');
    return round($amount * ($percentage / 100), 2);
} 