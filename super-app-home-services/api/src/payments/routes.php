<?php
/**
 * Payment Routes
 */

use Psr\Http\Message\ResponseInterface as Response;
use Psr\Http\Message\ServerRequestInterface as Request;

/**
 * Create payment intent for a booking
 * POST /payments/create-intent
 */
$app->post('/payments/create-intent', function (Request $request, Response $response) {
    $lang = $request->getAttribute('lang');
    $userData = $request->getAttribute('user');
    $data = $request->getParsedBody();
    
    // Validate input
    if (!isset($data['booking_id']) || empty($data['booking_id'])) {
        $result = response(null, 400, __('booking_id_required', $lang));
        $response->getBody()->write(json_encode($result));
        return $response->withStatus(400)->withHeader('Content-Type', 'application/json');
    }
    
    // Validate user is a customer
    if ($userData['user_type'] !== 'customer') {
        $result = response(null, 403, __('only_customers_can_pay', $lang));
        $response->getBody()->write(json_encode($result));
        return $response->withStatus(403)->withHeader('Content-Type', 'application/json');
    }
    
    try {
        $pdo = getPDO();
        
        // Get booking details and check if it belongs to the user
        $stmt = $pdo->prepare("
            SELECT b.*, s.base_price, p.stripe_account_id, p.business_name, si.name as service_name
            FROM bookings b
            JOIN services s ON b.service_id = s.id
            JOIN providers p ON b.provider_id = p.id
            JOIN service_i18n si ON s.id = si.service_id 
            JOIN languages l ON si.language_id = l.id
            WHERE b.id = ? AND b.customer_id = ? AND l.code = ?
        ");
        $stmt->execute([$data['booking_id'], $userData['id'], $lang]);
        $booking = $stmt->fetch();
        
        if (!$booking) {
            $result = response(null, 404, __('booking_not_found', $lang));
            $response->getBody()->write(json_encode($result));
            return $response->withStatus(404)->withHeader('Content-Type', 'application/json');
        }
        
        // Check if booking already has a transaction
        $stmt = $pdo->prepare("SELECT id FROM transactions WHERE booking_id = ?");
        $stmt->execute([$booking['id']]);
        if ($stmt->fetch()) {
            $result = response(null, 409, __('booking_already_paid', $lang));
            $response->getBody()->write(json_encode($result));
            return $response->withStatus(409)->withHeader('Content-Type', 'application/json');
        }
        
        // Check if provider has a Stripe account
        if (empty($booking['stripe_account_id'])) {
            $result = response(null, 400, __('provider_no_stripe_account', $lang));
            $response->getBody()->write(json_encode($result));
            return $response->withStatus(400)->withHeader('Content-Type', 'application/json');
        }
        
        // Initialize Stripe
        \Stripe\Stripe::setApiKey(config('stripe.secret_key'));
        
        // Calculate amounts
        $amount = (float)$booking['base_price'] * 100; // Convert to cents
        $appFee = calculatePlatformFee((float)$booking['base_price']) * 100; // Convert to cents
        
        // Create payment intent
        $intent = \Stripe\PaymentIntent::create([
            'amount' => (int)$amount,
            'currency' => 'hrk', // Croatian Kuna
            'application_fee_amount' => (int)$appFee,
            'transfer_data' => [
                'destination' => $booking['stripe_account_id'],
            ],
            'metadata' => [
                'booking_id' => $booking['id'],
                'customer_id' => $userData['id'],
                'provider_id' => $booking['provider_id'],
                'service_name' => $booking['service_name'],
                'booking_number' => $booking['booking_number']
            ]
        ]);
        
        // Begin transaction
        $pdo->beginTransaction();
        
        // Create transaction record
        $stmt = $pdo->prepare("
            INSERT INTO transactions (booking_id, amount, commission, provider_amount, status, stripe_payment_id)
            VALUES (?, ?, ?, ?, 'pending', ?)
        ");
        $stmt->execute([
            $booking['id'],
            $booking['base_price'],
            calculatePlatformFee((float)$booking['base_price']),
            $booking['base_price'] - calculatePlatformFee((float)$booking['base_price']),
            $intent->id
        ]);
        
        // Commit transaction
        $pdo->commit();
        
        $result = response([
            'client_secret' => $intent->client_secret,
            'payment_intent_id' => $intent->id,
            'amount' => $amount / 100, // Convert back to decimal
            'currency' => 'hrk'
        ], 200);
        
        $response->getBody()->write(json_encode($result));
        return $response->withStatus(200)->withHeader('Content-Type', 'application/json');
        
    } catch (\Stripe\Exception\ApiErrorException $e) {
        // Rollback transaction on error
        if ($pdo->inTransaction()) {
            $pdo->rollBack();
        }
        
        $result = response(null, 500, $e->getMessage());
        $response->getBody()->write(json_encode($result));
        return $response->withStatus(500)->withHeader('Content-Type', 'application/json');
        
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
 * Confirm a payment (after client-side payment is completed)
 * POST /payments/confirm
 */
$app->post('/payments/confirm', function (Request $request, Response $response) {
    $lang = $request->getAttribute('lang');
    $userData = $request->getAttribute('user');
    $data = $request->getParsedBody();
    
    // Validate input
    if (!isset($data['payment_intent_id']) || empty($data['payment_intent_id'])) {
        $result = response(null, 400, __('payment_intent_required', $lang));
        $response->getBody()->write(json_encode($result));
        return $response->withStatus(400)->withHeader('Content-Type', 'application/json');
    }
    
    try {
        $pdo = getPDO();
        
        // Check if payment intent exists in our database
        $stmt = $pdo->prepare("
            SELECT t.*, b.customer_id, b.booking_number
            FROM transactions t
            JOIN bookings b ON t.booking_id = b.id
            WHERE t.stripe_payment_id = ?
        ");
        $stmt->execute([$data['payment_intent_id']]);
        $transaction = $stmt->fetch();
        
        if (!$transaction) {
            $result = response(null, 404, __('transaction_not_found', $lang));
            $response->getBody()->write(json_encode($result));
            return $response->withStatus(404)->withHeader('Content-Type', 'application/json');
        }
        
        // Verify customer owns this transaction
        if ($transaction['customer_id'] != $userData['id']) {
            $result = response(null, 403, __('transaction_access_denied', $lang));
            $response->getBody()->write(json_encode($result));
            return $response->withStatus(403)->withHeader('Content-Type', 'application/json');
        }
        
        // Initialize Stripe
        \Stripe\Stripe::setApiKey(config('stripe.secret_key'));
        
        // Check payment intent status
        $intent = \Stripe\PaymentIntent::retrieve($data['payment_intent_id']);
        
        // Begin transaction
        $pdo->beginTransaction();
        
        // Update transaction status
        $newStatus = 'pending';
        
        if ($intent->status === 'succeeded') {
            $newStatus = 'completed';
        } else if ($intent->status === 'canceled') {
            $newStatus = 'failed';
        }
        
        $stmt = $pdo->prepare("
            UPDATE transactions 
            SET status = ?, updated_at = NOW()
            WHERE id = ?
        ");
        $stmt->execute([$newStatus, $transaction['id']]);
        
        // If payment succeeded, update booking status to confirmed
        if ($newStatus === 'completed') {
            $stmt = $pdo->prepare("
                UPDATE bookings 
                SET status = 'confirmed', updated_at = NOW()
                WHERE id = ?
            ");
            $stmt->execute([$transaction['booking_id']]);
        }
        
        // Commit transaction
        $pdo->commit();
        
        $result = response([
            'status' => $newStatus,
            'booking_id' => $transaction['booking_id'],
            'booking_number' => $transaction['booking_number'],
            'amount' => (float)$transaction['amount']
        ], 200, __('payment_status_updated', $lang));
        
        $response->getBody()->write(json_encode($result));
        return $response->withStatus(200)->withHeader('Content-Type', 'application/json');
        
    } catch (\Stripe\Exception\ApiErrorException $e) {
        // Rollback transaction on error
        if ($pdo->inTransaction()) {
            $pdo->rollBack();
        }
        
        $result = response(null, 500, $e->getMessage());
        $response->getBody()->write(json_encode($result));
        return $response->withStatus(500)->withHeader('Content-Type', 'application/json');
        
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
 * Webhook for Stripe events
 * POST /payments/webhook
 */
$app->post('/payments/webhook', function (Request $request, Response $response) {
    $payload = $request->getBody()->getContents();
    $sigHeader = $request->getHeaderLine('Stripe-Signature');
    $endpointSecret = config('stripe.webhook_secret');
    
    try {
        // Initialize Stripe
        \Stripe\Stripe::setApiKey(config('stripe.secret_key'));
        
        // Verify webhook signature
        $event = \Stripe\Webhook::constructEvent(
            $payload, $sigHeader, $endpointSecret
        );
        
        // Handle specific event types
        switch ($event->type) {
            case 'payment_intent.succeeded':
                $paymentIntent = $event->data->object;
                handleSuccessfulPayment($paymentIntent);
                break;
                
            case 'payment_intent.payment_failed':
                $paymentIntent = $event->data->object;
                handleFailedPayment($paymentIntent);
                break;
        }
        
        $result = response(['status' => 'success'], 200);
        $response->getBody()->write(json_encode($result));
        return $response->withStatus(200)->withHeader('Content-Type', 'application/json');
        
    } catch (\UnexpectedValueException $e) {
        // Invalid payload
        $result = response(null, 400, 'Invalid payload');
        $response->getBody()->write(json_encode($result));
        return $response->withStatus(400)->withHeader('Content-Type', 'application/json');
        
    } catch (\Stripe\Exception\SignatureVerificationException $e) {
        // Invalid signature
        $result = response(null, 400, 'Invalid signature');
        $response->getBody()->write(json_encode($result));
        return $response->withStatus(400)->withHeader('Content-Type', 'application/json');
        
    } catch (Exception $e) {
        // Server error
        $result = response(null, 500, $e->getMessage());
        $response->getBody()->write(json_encode($result));
        return $response->withStatus(500)->withHeader('Content-Type', 'application/json');
    }
});

/**
 * Handle successful payment from webhook
 */
function handleSuccessfulPayment($paymentIntent) {
    try {
        $pdo = getPDO();
        
        // Begin transaction
        $pdo->beginTransaction();
        
        // Update transaction status
        $stmt = $pdo->prepare("
            UPDATE transactions 
            SET status = 'completed', updated_at = NOW(), stripe_transfer_id = ?
            WHERE stripe_payment_id = ?
        ");
        $stmt->execute([$paymentIntent->transfer, $paymentIntent->id]);
        
        // Get booking ID
        $stmt = $pdo->prepare("
            SELECT booking_id FROM transactions WHERE stripe_payment_id = ?
        ");
        $stmt->execute([$paymentIntent->id]);
        $transaction = $stmt->fetch();
        
        if ($transaction) {
            // Update booking status to confirmed
            $stmt = $pdo->prepare("
                UPDATE bookings 
                SET status = 'confirmed', updated_at = NOW()
                WHERE id = ?
            ");
            $stmt->execute([$transaction['booking_id']]);
        }
        
        // Commit transaction
        $pdo->commit();
        
    } catch (PDOException $e) {
        // Rollback transaction on error
        if ($pdo->inTransaction()) {
            $pdo->rollBack();
        }
        
        // Log error
        error_log('Payment webhook error: ' . $e->getMessage());
    }
}

/**
 * Handle failed payment from webhook
 */
function handleFailedPayment($paymentIntent) {
    try {
        $pdo = getPDO();
        
        // Update transaction status
        $stmt = $pdo->prepare("
            UPDATE transactions 
            SET status = 'failed', updated_at = NOW()
            WHERE stripe_payment_id = ?
        ");
        $stmt->execute([$paymentIntent->id]);
        
    } catch (PDOException $e) {
        // Log error
        error_log('Payment webhook error: ' . $e->getMessage());
    }
} 