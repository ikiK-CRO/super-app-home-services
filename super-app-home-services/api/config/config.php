<?php
/**
 * Configuration settings for the API
 */

return [
    'db' => [
        'host' => getenv('DB_HOST') ?: 'localhost',
        'name' => getenv('DB_NAME') ?: 'super_app',
        'user' => getenv('DB_USER') ?: 'root',
        'pass' => getenv('DB_PASS') ?: '',
        'charset' => 'utf8mb4',
        'collation' => 'utf8mb4_unicode_ci'
    ],
    'jwt' => [
        'secret' => getenv('JWT_SECRET') ?: 'your-secret-key',
        'expiry' => 86400 * 30, // 30 days
    ],
    'stripe' => [
        'secret_key' => getenv('STRIPE_SECRET_KEY') ?: '',
        'publishable_key' => getenv('STRIPE_PUBLISHABLE_KEY') ?: '',
        'webhook_secret' => getenv('STRIPE_WEBHOOK_SECRET') ?: '',
        'platform_fee_percentage' => 15 // 15% commission
    ],
    'app' => [
        'default_language' => 'hr',
        'debug' => filter_var(getenv('APP_DEBUG') ?: false, FILTER_VALIDATE_BOOLEAN),
        'base_url' => getenv('APP_URL') ?: 'http://localhost:8080'
    ]
]; 