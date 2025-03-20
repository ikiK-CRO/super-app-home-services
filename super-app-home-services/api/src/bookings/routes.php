<?php
/**
 * Booking Routes
 */

use Psr\Http\Message\ResponseInterface as Response;
use Psr\Http\Message\ServerRequestInterface as Request;

/**
 * Create a new booking
 * POST /bookings
 */
$app->post('/bookings', function (Request $request, Response $response) {
    $lang = $request->getAttribute('lang');
    $userData = $request->getAttribute('user');
    $data = $request->getParsedBody();
    
    // Validate input
    $requiredFields = ['service_id', 'date_time'];
    foreach ($requiredFields as $field) {
        if (!isset($data[$field]) || empty($data[$field])) {
            $result = response(null, 400, __('field_required', $lang, ['field' => $field]));
            $response->getBody()->write(json_encode($result));
            return $response->withStatus(400)->withHeader('Content-Type', 'application/json');
        }
    }
    
    // Validate user is a customer
    if ($userData['user_type'] !== 'customer') {
        $result = response(null, 403, __('only_customers_can_book', $lang));
        $response->getBody()->write(json_encode($result));
        return $response->withStatus(403)->withHeader('Content-Type', 'application/json');
    }
    
    try {
        $pdo = getPDO();
        
        // Get service details
        $stmt = $pdo->prepare("
            SELECT s.*, p.user_id as provider_user_id
            FROM services s
            JOIN providers p ON s.provider_id = p.id
            WHERE s.id = ? AND s.is_active = 1
        ");
        $stmt->execute([$data['service_id']]);
        $service = $stmt->fetch();
        
        if (!$service) {
            $result = response(null, 404, __('service_not_found', $lang));
            $response->getBody()->write(json_encode($result));
            return $response->withStatus(404)->withHeader('Content-Type', 'application/json');
        }
        
        // Validate booking date (must be in the future)
        $bookingTime = strtotime($data['date_time']);
        if ($bookingTime <= time()) {
            $result = response(null, 400, __('booking_time_past', $lang));
            $response->getBody()->write(json_encode($result));
            return $response->withStatus(400)->withHeader('Content-Type', 'application/json');
        }
        
        // Check if the provider is available at that time
        $bookingDate = date('Y-m-d', $bookingTime);
        $bookingTime = date('H:i:s', $bookingTime);
        $dayOfWeek = date('w', strtotime($bookingDate)); // 0 (Sunday) to 6 (Saturday)
        
        // Check if provider has availability for this day of week
        $stmt = $pdo->prepare("
            SELECT * FROM availability 
            WHERE provider_id = ? AND day_of_week = ?
            AND ? BETWEEN start_time AND end_time
        ");
        $stmt->execute([$service['provider_id'], $dayOfWeek, $bookingTime]);
        $availability = $stmt->fetch();
        
        if (!$availability) {
            $result = response(null, 400, __('provider_not_available', $lang));
            $response->getBody()->write(json_encode($result));
            return $response->withStatus(400)->withHeader('Content-Type', 'application/json');
        }
        
        // Check for booking conflicts
        $bookingEndTime = date('H:i:s', strtotime($bookingTime) + ($service['duration'] * 60));
        
        $stmt = $pdo->prepare("
            SELECT COUNT(*) as count
            FROM bookings
            WHERE provider_id = ?
            AND DATE(date_time) = ?
            AND (
                (TIME(date_time) <= ? AND ADDTIME(TIME(date_time), SEC_TO_TIME(duration * 60)) > ?)
                OR
                (TIME(date_time) < ? AND ADDTIME(TIME(date_time), SEC_TO_TIME(duration * 60)) >= ?)
            )
            AND status IN ('pending', 'confirmed')
        ");
        $stmt->execute([
            $service['provider_id'],
            $bookingDate,
            $bookingEndTime,
            $bookingTime,
            $bookingTime,
            $bookingEndTime
        ]);
        $conflicts = $stmt->fetch()['count'];
        
        if ($conflicts > 0) {
            $result = response(null, 409, __('time_slot_taken', $lang));
            $response->getBody()->write(json_encode($result));
            return $response->withStatus(409)->withHeader('Content-Type', 'application/json');
        }
        
        // Generate booking number
        $bookingNumber = 'BK' . time() . rand(1000, 9999);
        
        // Begin transaction
        $pdo->beginTransaction();
        
        // Insert booking
        $stmt = $pdo->prepare("
            INSERT INTO bookings (booking_number, customer_id, service_id, provider_id, date_time, notes, status)
            VALUES (?, ?, ?, ?, ?, ?, 'pending')
        ");
        $stmt->execute([
            $bookingNumber,
            $userData['id'],
            $service['id'],
            $service['provider_id'],
            $data['date_time'],
            $data['notes'] ?? null
        ]);
        
        $bookingId = $pdo->lastInsertId();
        
        // Commit transaction
        $pdo->commit();
        
        $bookingData = [
            'id' => $bookingId,
            'booking_number' => $bookingNumber,
            'service_id' => $service['id'],
            'provider_id' => $service['provider_id'],
            'date_time' => $data['date_time'],
            'status' => 'pending',
            'price' => (float)$service['base_price']
        ];
        
        $result = response($bookingData, 201, __('booking_created', $lang));
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
})->add($authMiddleware);

/**
 * Get user's bookings
 * GET /bookings
 */
$app->get('/bookings', function (Request $request, Response $response) {
    $lang = $request->getAttribute('lang');
    $userData = $request->getAttribute('user');
    $params = $request->getQueryParams();
    $status = isset($params['status']) ? $params['status'] : null;
    
    try {
        $pdo = getPDO();
        
        // Get language ID for translations
        $stmt = $pdo->prepare("SELECT id FROM languages WHERE code = ?");
        $stmt->execute([$lang]);
        $langResult = $stmt->fetch();
        $langId = $langResult ? $langResult['id'] : null;
        
        if (!$langId) {
            $defaultLang = config('app.default_language');
            $stmt = $pdo->prepare("SELECT id FROM languages WHERE code = ?");
            $stmt->execute([$defaultLang]);
            $langResult = $stmt->fetch();
            $langId = $langResult['id'];
        }
        
        // Base query
        $query = "
            SELECT 
                b.id, b.booking_number, b.status, b.date_time, b.notes,
                s.id as service_id, s.base_price, s.duration,
                si.name as service_name,
                p.id as provider_id, p.business_name,
                t.id as transaction_id, t.status as payment_status
            FROM bookings b
            JOIN services s ON b.service_id = s.id
            JOIN service_i18n si ON s.id = si.service_id AND si.language_id = ?
            JOIN providers p ON b.provider_id = p.id
            LEFT JOIN transactions t ON b.id = t.booking_id
        ";
        
        $params = [$langId];
        
        // Add filters based on user type
        if ($userData['user_type'] === 'customer') {
            $query .= " WHERE b.customer_id = ?";
            $params[] = $userData['id'];
        } else if ($userData['user_type'] === 'provider') {
            // Get provider ID from user ID
            $stmt = $pdo->prepare("SELECT id FROM providers WHERE user_id = ?");
            $stmt->execute([$userData['id']]);
            $provider = $stmt->fetch();
            
            if (!$provider) {
                $result = response([], 200);
                $response->getBody()->write(json_encode($result));
                return $response->withStatus(200)->withHeader('Content-Type', 'application/json');
            }
            
            $query .= " WHERE b.provider_id = ?";
            $params[] = $provider['id'];
        }
        
        // Add status filter if provided
        if ($status && in_array($status, ['pending', 'confirmed', 'completed', 'cancelled'])) {
            $query .= " AND b.status = ?";
            $params[] = $status;
        }
        
        $query .= " ORDER BY b.date_time DESC";
        
        $stmt = $pdo->prepare($query);
        $stmt->execute($params);
        $bookings = $stmt->fetchAll();
        
        // Process bookings
        $processedBookings = array_map(function($booking) {
            return [
                'id' => $booking['id'],
                'booking_number' => $booking['booking_number'],
                'status' => $booking['status'],
                'date_time' => $booking['date_time'],
                'notes' => $booking['notes'],
                'service' => [
                    'id' => $booking['service_id'],
                    'name' => $booking['service_name'],
                    'price' => (float)$booking['base_price'],
                    'duration' => (int)$booking['duration']
                ],
                'provider' => [
                    'id' => $booking['provider_id'],
                    'business_name' => $booking['business_name']
                ],
                'payment' => [
                    'id' => $booking['transaction_id'],
                    'status' => $booking['payment_status']
                ]
            ];
        }, $bookings);
        
        $result = response($processedBookings, 200);
        $response->getBody()->write(json_encode($result));
        return $response->withStatus(200)->withHeader('Content-Type', 'application/json');
        
    } catch (PDOException $e) {
        $result = response(null, 500, __('server_error', $lang));
        $response->getBody()->write(json_encode($result));
        return $response->withStatus(500)->withHeader('Content-Type', 'application/json');
    }
})->add($authMiddleware);

/**
 * Get booking details
 * GET /bookings/{id}
 */
$app->get('/bookings/{id}', function (Request $request, Response $response, $args) {
    $lang = $request->getAttribute('lang');
    $userData = $request->getAttribute('user');
    $bookingId = (int)$args['id'];
    
    try {
        $pdo = getPDO();
        
        // Get language ID for translations
        $stmt = $pdo->prepare("SELECT id FROM languages WHERE code = ?");
        $stmt->execute([$lang]);
        $langResult = $stmt->fetch();
        $langId = $langResult ? $langResult['id'] : null;
        
        if (!$langId) {
            $defaultLang = config('app.default_language');
            $stmt = $pdo->prepare("SELECT id FROM languages WHERE code = ?");
            $stmt->execute([$defaultLang]);
            $langResult = $stmt->fetch();
            $langId = $langResult['id'];
        }
        
        // Get booking details
        $stmt = $pdo->prepare("
            SELECT 
                b.*, 
                s.base_price, s.duration,
                si.name as service_name, si.description as service_description,
                p.business_name, p.avg_rating,
                c.id as customer_id, CONCAT(cp.first_name, ' ', cp.last_name) as customer_name,
                t.id as transaction_id, t.amount, t.status as payment_status,
                t.stripe_payment_id
            FROM bookings b
            JOIN services s ON b.service_id = s.id
            JOIN service_i18n si ON s.id = si.service_id AND si.language_id = ?
            JOIN providers p ON b.provider_id = p.id
            JOIN users c ON b.customer_id = c.id
            JOIN profiles cp ON c.id = cp.user_id
            LEFT JOIN transactions t ON b.id = t.booking_id
            WHERE b.id = ?
        ");
        $stmt->execute([$langId, $bookingId]);
        $booking = $stmt->fetch();
        
        if (!$booking) {
            $result = response(null, 404, __('booking_not_found', $lang));
            $response->getBody()->write(json_encode($result));
            return $response->withStatus(404)->withHeader('Content-Type', 'application/json');
        }
        
        // Check if user has access to this booking
        if ($userData['user_type'] === 'customer' && $booking['customer_id'] != $userData['id']) {
            $result = response(null, 403, __('booking_access_denied', $lang));
            $response->getBody()->write(json_encode($result));
            return $response->withStatus(403)->withHeader('Content-Type', 'application/json');
        } else if ($userData['user_type'] === 'provider') {
            // Get provider ID
            $stmt = $pdo->prepare("SELECT id FROM providers WHERE user_id = ?");
            $stmt->execute([$userData['id']]);
            $provider = $stmt->fetch();
            
            if (!$provider || $booking['provider_id'] != $provider['id']) {
                $result = response(null, 403, __('booking_access_denied', $lang));
                $response->getBody()->write(json_encode($result));
                return $response->withStatus(403)->withHeader('Content-Type', 'application/json');
            }
        }
        
        // Format booking data
        $bookingData = [
            'id' => $booking['id'],
            'booking_number' => $booking['booking_number'],
            'status' => $booking['status'],
            'date_time' => $booking['date_time'],
            'notes' => $booking['notes'],
            'created_at' => $booking['created_at'],
            'service' => [
                'id' => $booking['service_id'],
                'name' => $booking['service_name'],
                'description' => $booking['service_description'],
                'price' => (float)$booking['base_price'],
                'duration' => (int)$booking['duration']
            ],
            'provider' => [
                'id' => $booking['provider_id'],
                'business_name' => $booking['business_name'],
                'rating' => (float)$booking['avg_rating']
            ],
            'customer' => [
                'id' => $booking['customer_id'],
                'name' => $booking['customer_name']
            ],
            'payment' => $booking['transaction_id'] ? [
                'id' => $booking['transaction_id'],
                'amount' => (float)$booking['amount'],
                'status' => $booking['payment_status'],
                'stripe_payment_id' => $booking['stripe_payment_id']
            ] : null
        ];
        
        $result = response($bookingData, 200);
        $response->getBody()->write(json_encode($result));
        return $response->withStatus(200)->withHeader('Content-Type', 'application/json');
        
    } catch (PDOException $e) {
        $result = response(null, 500, __('server_error', $lang));
        $response->getBody()->write(json_encode($result));
        return $response->withStatus(500)->withHeader('Content-Type', 'application/json');
    }
})->add($authMiddleware);

/**
 * Update booking status
 * PATCH /bookings/{id}/status
 */
$app->patch('/bookings/{id}/status', function (Request $request, Response $response, $args) {
    $lang = $request->getAttribute('lang');
    $userData = $request->getAttribute('user');
    $bookingId = (int)$args['id'];
    $data = $request->getParsedBody();
    
    if (!isset($data['status']) || !in_array($data['status'], ['confirmed', 'completed', 'cancelled'])) {
        $result = response(null, 400, __('invalid_status', $lang));
        $response->getBody()->write(json_encode($result));
        return $response->withStatus(400)->withHeader('Content-Type', 'application/json');
    }
    
    try {
        $pdo = getPDO();
        
        // Get booking
        $stmt = $pdo->prepare("
            SELECT b.*, p.user_id as provider_user_id
            FROM bookings b
            JOIN providers p ON b.provider_id = p.id
            WHERE b.id = ?
        ");
        $stmt->execute([$bookingId]);
        $booking = $stmt->fetch();
        
        if (!$booking) {
            $result = response(null, 404, __('booking_not_found', $lang));
            $response->getBody()->write(json_encode($result));
            return $response->withStatus(404)->withHeader('Content-Type', 'application/json');
        }
        
        // Check permissions
        $canUpdateStatus = false;
        
        if ($userData['user_type'] === 'provider' && $booking['provider_user_id'] == $userData['id']) {
            // Providers can confirm or complete bookings
            if (in_array($data['status'], ['confirmed', 'completed'])) {
                $canUpdateStatus = true;
            }
        } else if ($userData['user_type'] === 'customer' && $booking['customer_id'] == $userData['id']) {
            // Customers can only cancel their bookings
            if ($data['status'] === 'cancelled') {
                $canUpdateStatus = true;
            }
        } else if ($userData['user_type'] === 'admin') {
            // Admins can update to any status
            $canUpdateStatus = true;
        }
        
        if (!$canUpdateStatus) {
            $result = response(null, 403, __('status_update_not_allowed', $lang));
            $response->getBody()->write(json_encode($result));
            return $response->withStatus(403)->withHeader('Content-Type', 'application/json');
        }
        
        // Update booking status
        $stmt = $pdo->prepare("UPDATE bookings SET status = ?, updated_at = NOW() WHERE id = ?");
        $stmt->execute([$data['status'], $bookingId]);
        
        $result = response(['status' => $data['status']], 200, __('booking_status_updated', $lang));
        $response->getBody()->write(json_encode($result));
        return $response->withStatus(200)->withHeader('Content-Type', 'application/json');
        
    } catch (PDOException $e) {
        $result = response(null, 500, __('server_error', $lang));
        $response->getBody()->write(json_encode($result));
        return $response->withStatus(500)->withHeader('Content-Type', 'application/json');
    }
})->add($authMiddleware); 