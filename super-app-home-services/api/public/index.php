<?php
/**
 * Super App for Home Services - API Entry Point
 */

use Slim\Factory\AppFactory;
use Slim\Psr7\Response;
use DI\Container;
use Slim\Exception\HttpNotFoundException;

// Include Composer autoloader
require __DIR__ . '/../vendor/autoload.php';

// Load environment variables
$dotenv = Dotenv\Dotenv::createImmutable(__DIR__ . '/../');
$dotenv->safeLoad();

// Create Container
$container = new Container();
AppFactory::setContainer($container);

// Initialize App
$app = AppFactory::create();

// Add middleware for parsing JSON
$app->addBodyParsingMiddleware();

// Add middleware for CORS
$app->add(function ($request, $handler) {
    $response = $handler->handle($request);
    return $response
        ->withHeader('Access-Control-Allow-Origin', '*')
        ->withHeader('Access-Control-Allow-Headers', 'X-Requested-With, Content-Type, Accept, Origin, Authorization')
        ->withHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
});

// Set base path
$app->setBasePath('/api');

// Define routes
$app->get('/', function ($request, $response) {
    $result = response([
        'app' => 'Super App for Home Services API',
        'version' => '1.0.0',
        'status' => 'running'
    ]);
    return $response->withJson($result);
});

// Import route files
require __DIR__ . '/../src/auth/routes.php';
require __DIR__ . '/../src/services/routes.php';
require __DIR__ . '/../src/bookings/routes.php';
require __DIR__ . '/../src/payments/routes.php';

// Add custom error handler
$customErrorHandler = function ($request, $exception, $displayErrorDetails, $logErrors, $logErrorDetails) use ($app) {
    $response = $app->getResponseFactory()->createResponse();
    
    // Determine status code
    $statusCode = 500;
    if ($exception instanceof HttpNotFoundException) {
        $statusCode = 404;
    }
    
    $error = [
        'status' => $statusCode,
        'message' => $exception->getMessage()
    ];
    
    if (config('app.debug') && !($exception instanceof HttpNotFoundException)) {
        $error['trace'] = $exception->getTraceAsString();
    }
    
    $response = $response->withStatus($statusCode);
    $response = $response->withHeader('Content-Type', 'application/json');
    $response->getBody()->write(json_encode(response(null, $statusCode, $exception->getMessage())));
    
    return $response;
};

// Add Error Middleware
$errorMiddleware = $app->addErrorMiddleware(config('app.debug'), true, true);
$errorMiddleware->setDefaultErrorHandler($customErrorHandler);

// Run the app
$app->run(); 