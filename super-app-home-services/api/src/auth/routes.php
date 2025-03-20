<?php
/**
 * Authentication Routes
 */

use Psr\Http\Message\ResponseInterface as Response;
use Psr\Http\Message\ServerRequestInterface as Request;
use Respect\Validation\Validator as v;

/**
 * Authentication middleware
 */
$authMiddleware = function (Request $request, $handler) {
    $response = new \Slim\Psr7\Response();
    $authHeader = $request->getHeaderLine('Authorization');
    
    if (!$authHeader || !preg_match('/Bearer\s+(.*)$/i', $authHeader, $matches)) {
        $result = response(null, 401, __('unauthorized', $request->getAttribute('lang', null)));
        $response->getBody()->write(json_encode($result));
        return $response->withStatus(401)->withHeader('Content-Type', 'application/json');
    }
    
    $token = $matches[1];
    $userData = decodeJWT($token);
    
    if (!$userData) {
        $result = response(null, 401, __('invalid_token', $request->getAttribute('lang', null)));
        $response->getBody()->write(json_encode($result));
        return $response->withStatus(401)->withHeader('Content-Type', 'application/json');
    }
    
    // Set user data as request attribute
    $request = $request->withAttribute('user', $userData);
    
    return $handler->handle($request);
};

/**
 * Language middleware
 */
$languageMiddleware = function (Request $request, $handler) {
    // Get language from header or query parameter
    $lang = $request->getHeaderLine('Accept-Language') ?: 
            $request->getQueryParams()['lang'] ?? 
            config('app.default_language');
    
    // Validate language exists and is active
    $pdo = getPDO();
    $stmt = $pdo->prepare("SELECT id FROM languages WHERE code = ? AND is_active = 1");
    $stmt->execute([$lang]);
    
    // Default to configured language if requested language is not available
    if (!$stmt->fetch()) {
        $lang = config('app.default_language');
    }
    
    // Set language as request attribute
    $request = $request->withAttribute('lang', $lang);
    
    return $handler->handle($request);
};

// Apply language middleware to all routes
$app->add($languageMiddleware);

/**
 * Register a new user
 * POST /auth/register
 */
$app->post('/auth/register', function (Request $request, Response $response) {
    $data = $request->getParsedBody();
    $lang = $request->getAttribute('lang');
    
    // Validate input
    $requiredFields = ['email', 'password', 'first_name', 'last_name', 'user_type'];
    foreach ($requiredFields as $field) {
        if (!isset($data[$field]) || empty($data[$field])) {
            $result = response(null, 400, __('field_required', $lang, ['field' => $field]));
            $response->getBody()->write(json_encode($result));
            return $response->withStatus(400)->withHeader('Content-Type', 'application/json');
        }
    }
    
    // Validate email format
    if (!v::email()->validate($data['email'])) {
        $result = response(null, 400, __('invalid_email', $lang));
        $response->getBody()->write(json_encode($result));
        return $response->withStatus(400)->withHeader('Content-Type', 'application/json');
    }
    
    // Validate password (minimum 8 characters)
    if (!v::stringType()->length(8, null)->validate($data['password'])) {
        $result = response(null, 400, __('password_too_short', $lang));
        $response->getBody()->write(json_encode($result));
        return $response->withStatus(400)->withHeader('Content-Type', 'application/json');
    }
    
    // Validate user type
    if (!in_array($data['user_type'], ['customer', 'provider'])) {
        $result = response(null, 400, __('invalid_user_type', $lang));
        $response->getBody()->write(json_encode($result));
        return $response->withStatus(400)->withHeader('Content-Type', 'application/json');
    }
    
    try {
        $pdo = getPDO();
        
        // Check if email already exists
        $stmt = $pdo->prepare("SELECT id FROM users WHERE email = ?");
        $stmt->execute([$data['email']]);
        
        if ($stmt->fetch()) {
            $result = response(null, 409, __('email_taken', $lang));
            $response->getBody()->write(json_encode($result));
            return $response->withStatus(409)->withHeader('Content-Type', 'application/json');
        }
        
        // Begin transaction
        $pdo->beginTransaction();
        
        // Hash password
        $passwordHash = password_hash($data['password'], PASSWORD_DEFAULT);
        
        // Insert user
        $stmt = $pdo->prepare("
            INSERT INTO users (email, password, user_type) 
            VALUES (?, ?, ?)
        ");
        $stmt->execute([
            $data['email'],
            $passwordHash,
            $data['user_type']
        ]);
        
        $userId = $pdo->lastInsertId();
        
        // Insert profile
        $stmt = $pdo->prepare("
            INSERT INTO profiles (user_id, first_name, last_name, phone) 
            VALUES (?, ?, ?, ?)
        ");
        $stmt->execute([
            $userId,
            $data['first_name'],
            $data['last_name'],
            $data['phone'] ?? null
        ]);
        
        // If user is a provider, create provider record
        if ($data['user_type'] === 'provider') {
            $stmt = $pdo->prepare("
                INSERT INTO providers (user_id, business_name, business_address) 
                VALUES (?, ?, ?)
            ");
            $stmt->execute([
                $userId,
                $data['business_name'] ?? $data['first_name'] . ' ' . $data['last_name'],
                $data['business_address'] ?? ''
            ]);
        }
        
        // Commit transaction
        $pdo->commit();
        
        // Generate token for the new user
        $userData = [
            'id' => $userId,
            'email' => $data['email'],
            'user_type' => $data['user_type'],
            'first_name' => $data['first_name'],
            'last_name' => $data['last_name']
        ];
        
        $token = generateJWT($userData);
        
        $result = response([
            'token' => $token,
            'user' => $userData
        ], 201, __('registration_success', $lang));
        
        $response->getBody()->write(json_encode($result));
        return $response->withStatus(201)->withHeader('Content-Type', 'application/json');
        
    } catch (PDOException $e) {
        // Rollback transaction on error
        if ($pdo->inTransaction()) {
            $pdo->rollBack();
        }
        
        $result = response(null, 500, __('server_error', $lang));
        $response->getBody()->write(json_encode($result));
        return $response->withStatus(500)->withHeader('Content-Type', 'application/json');
    }
});

/**
 * Login user
 * POST /auth/login
 */
$app->post('/auth/login', function (Request $request, Response $response) {
    $data = $request->getParsedBody();
    $lang = $request->getAttribute('lang');
    
    // Validate required fields
    if (!isset($data['email']) || !isset($data['password'])) {
        $result = response(null, 400, __('email_password_required', $lang));
        $response->getBody()->write(json_encode($result));
        return $response->withStatus(400)->withHeader('Content-Type', 'application/json');
    }
    
    try {
        $pdo = getPDO();
        
        // Get user by email
        $stmt = $pdo->prepare("
            SELECT u.*, p.first_name, p.last_name
            FROM users u
            JOIN profiles p ON u.id = p.user_id
            WHERE u.email = ? AND u.is_active = 1
        ");
        $stmt->execute([$data['email']]);
        $user = $stmt->fetch();
        
        // Check if user exists and password is correct
        if (!$user || !password_verify($data['password'], $user['password'])) {
            $result = response(null, 401, __('invalid_credentials', $lang));
            $response->getBody()->write(json_encode($result));
            return $response->withStatus(401)->withHeader('Content-Type', 'application/json');
        }
        
        // Create user data for token
        $userData = [
            'id' => $user['id'],
            'email' => $user['email'],
            'user_type' => $user['user_type'],
            'first_name' => $user['first_name'],
            'last_name' => $user['last_name']
        ];
        
        // Generate token
        $token = generateJWT($userData);
        
        $result = response([
            'token' => $token,
            'user' => $userData
        ], 200, __('login_success', $lang));
        
        $response->getBody()->write(json_encode($result));
        return $response->withStatus(200)->withHeader('Content-Type', 'application/json');
        
    } catch (PDOException $e) {
        $result = response(null, 500, __('server_error', $lang));
        $response->getBody()->write(json_encode($result));
        return $response->withStatus(500)->withHeader('Content-Type', 'application/json');
    }
});

/**
 * Get user profile
 * GET /auth/profile
 */
$app->get('/auth/profile', function (Request $request, Response $response) {
    $lang = $request->getAttribute('lang');
    $userData = $request->getAttribute('user');
    
    try {
        $pdo = getPDO();
        
        // Get full user profile
        $stmt = $pdo->prepare("
            SELECT u.id, u.email, u.user_type, p.*
            FROM users u
            JOIN profiles p ON u.id = p.user_id
            WHERE u.id = ?
        ");
        $stmt->execute([$userData['id']]);
        $profile = $stmt->fetch();
        
        // If user is a provider, get provider details
        if ($userData['user_type'] === 'provider') {
            $stmt = $pdo->prepare("SELECT * FROM providers WHERE user_id = ?");
            $stmt->execute([$userData['id']]);
            $providerDetails = $stmt->fetch();
            
            if ($providerDetails) {
                $profile = array_merge($profile, $providerDetails);
            }
        }
        
        // Remove sensitive information
        unset($profile['password']);
        
        $result = response($profile, 200);
        $response->getBody()->write(json_encode($result));
        return $response->withStatus(200)->withHeader('Content-Type', 'application/json');
        
    } catch (PDOException $e) {
        $result = response(null, 500, __('server_error', $lang));
        $response->getBody()->write(json_encode($result));
        return $response->withStatus(500)->withHeader('Content-Type', 'application/json');
    }
})->add($authMiddleware); 