<?php
/**
 * Services Routes
 */

use Psr\Http\Message\ResponseInterface as Response;
use Psr\Http\Message\ServerRequestInterface as Request;

/**
 * Get all service categories with translations
 * GET /services/categories
 */
$app->get('/services/categories', function (Request $request, Response $response) {
    $lang = $request->getAttribute('lang');
    
    try {
        $pdo = getPDO();
        
        // Get language ID
        $stmt = $pdo->prepare("SELECT id FROM languages WHERE code = ?");
        $stmt->execute([$lang]);
        $langResult = $stmt->fetch();
        $langId = $langResult ? $langResult['id'] : null;
        
        if (!$langId) {
            // Fallback to default language
            $defaultLang = config('app.default_language');
            $stmt = $pdo->prepare("SELECT id FROM languages WHERE code = ?");
            $stmt->execute([$defaultLang]);
            $langResult = $stmt->fetch();
            $langId = $langResult['id'];
        }
        
        // Get all categories with translations
        $stmt = $pdo->prepare("
            SELECT c.id, c.parent_id, c.icon, ci.name, ci.description
            FROM categories c
            LEFT JOIN category_i18n ci ON c.id = ci.category_id AND ci.language_id = ?
            ORDER BY c.parent_id IS NULL DESC, ci.name
        ");
        $stmt->execute([$langId]);
        $categories = $stmt->fetchAll();
        
        // Organize into a hierarchical structure
        $categoriesById = [];
        $rootCategories = [];
        
        foreach ($categories as $category) {
            $categoriesById[$category['id']] = [
                'id' => $category['id'],
                'name' => $category['name'],
                'description' => $category['description'],
                'icon' => $category['icon'],
                'children' => []
            ];
            
            if ($category['parent_id'] === null) {
                $rootCategories[] = &$categoriesById[$category['id']];
            }
        }
        
        // Add children to parent categories
        foreach ($categories as $category) {
            if ($category['parent_id'] !== null && isset($categoriesById[$category['parent_id']])) {
                $categoriesById[$category['parent_id']]['children'][] = &$categoriesById[$category['id']];
            }
        }
        
        $result = response($rootCategories, 200);
        $response->getBody()->write(json_encode($result));
        return $response->withStatus(200)->withHeader('Content-Type', 'application/json');
        
    } catch (PDOException $e) {
        $result = response(null, 500, __('server_error', $lang));
        $response->getBody()->write(json_encode($result));
        return $response->withStatus(500)->withHeader('Content-Type', 'application/json');
    }
});

/**
 * Get all services or filter by category
 * GET /services?category_id=1
 */
$app->get('/services', function (Request $request, Response $response) {
    $lang = $request->getAttribute('lang');
    $params = $request->getQueryParams();
    $categoryId = isset($params['category_id']) ? (int)$params['category_id'] : null;
    
    try {
        $pdo = getPDO();
        
        // Get language ID
        $stmt = $pdo->prepare("SELECT id FROM languages WHERE code = ?");
        $stmt->execute([$lang]);
        $langResult = $stmt->fetch();
        $langId = $langResult ? $langResult['id'] : null;
        
        if (!$langId) {
            // Fallback to default language
            $defaultLang = config('app.default_language');
            $stmt = $pdo->prepare("SELECT id FROM languages WHERE code = ?");
            $stmt->execute([$defaultLang]);
            $langResult = $stmt->fetch();
            $langId = $langResult['id'];
        }
        
        // Base query
        $query = "
            SELECT 
                s.id, s.base_price, s.duration, s.provider_id,
                si.name, si.description,
                p.business_name, p.avg_rating,
                c.id as category_id, ci.name as category_name,
                pro.first_name, pro.last_name
            FROM services s
            JOIN service_i18n si ON s.id = si.service_id AND si.language_id = ?
            JOIN providers p ON s.provider_id = p.id
            JOIN categories c ON s.category_id = c.id
            JOIN category_i18n ci ON c.id = ci.category_id AND ci.language_id = ?
            JOIN profiles pro ON p.user_id = pro.user_id
            WHERE s.is_active = 1
        ";
        
        $params = [$langId, $langId];
        
        // Add category filter if provided
        if ($categoryId) {
            $query .= " AND (s.category_id = ? OR c.parent_id = ?)";
            $params[] = $categoryId;
            $params[] = $categoryId;
        }
        
        $query .= " ORDER BY p.avg_rating DESC, si.name";
        
        $stmt = $pdo->prepare($query);
        $stmt->execute($params);
        $services = $stmt->fetchAll();
        
        // Process results
        $processedServices = array_map(function($service) {
            return [
                'id' => $service['id'],
                'name' => $service['name'],
                'description' => $service['description'],
                'price' => (float)$service['base_price'],
                'duration' => (int)$service['duration'],
                'category' => [
                    'id' => $service['category_id'],
                    'name' => $service['category_name']
                ],
                'provider' => [
                    'id' => $service['provider_id'],
                    'business_name' => $service['business_name'],
                    'name' => $service['first_name'] . ' ' . $service['last_name'],
                    'rating' => (float)$service['avg_rating']
                ]
            ];
        }, $services);
        
        $result = response($processedServices, 200);
        $response->getBody()->write(json_encode($result));
        return $response->withStatus(200)->withHeader('Content-Type', 'application/json');
        
    } catch (PDOException $e) {
        $result = response(null, 500, __('server_error', $lang));
        $response->getBody()->write(json_encode($result));
        return $response->withStatus(500)->withHeader('Content-Type', 'application/json');
    }
});

/**
 * Get service details by ID
 * GET /services/{id}
 */
$app->get('/services/{id}', function (Request $request, Response $response, $args) {
    $lang = $request->getAttribute('lang');
    $serviceId = (int)$args['id'];
    
    try {
        $pdo = getPDO();
        
        // Get language ID
        $stmt = $pdo->prepare("SELECT id FROM languages WHERE code = ?");
        $stmt->execute([$lang]);
        $langResult = $stmt->fetch();
        $langId = $langResult ? $langResult['id'] : null;
        
        if (!$langId) {
            // Fallback to default language
            $defaultLang = config('app.default_language');
            $stmt = $pdo->prepare("SELECT id FROM languages WHERE code = ?");
            $stmt->execute([$defaultLang]);
            $langResult = $stmt->fetch();
            $langId = $langResult['id'];
        }
        
        // Get service details
        $stmt = $pdo->prepare("
            SELECT 
                s.id, s.base_price, s.duration, s.provider_id,
                si.name, si.description,
                p.business_name, p.description as provider_description, p.avg_rating,
                c.id as category_id, ci.name as category_name,
                pro.first_name, pro.last_name
            FROM services s
            JOIN service_i18n si ON s.id = si.service_id AND si.language_id = ?
            JOIN providers p ON s.provider_id = p.id
            JOIN categories c ON s.category_id = c.id
            JOIN category_i18n ci ON c.id = ci.category_id AND ci.language_id = ?
            JOIN profiles pro ON p.user_id = pro.user_id
            WHERE s.id = ? AND s.is_active = 1
        ");
        $stmt->execute([$langId, $langId, $serviceId]);
        $service = $stmt->fetch();
        
        if (!$service) {
            $result = response(null, 404, __('service_not_found', $lang));
            $response->getBody()->write(json_encode($result));
            return $response->withStatus(404)->withHeader('Content-Type', 'application/json');
        }
        
        // Get provider's other services
        $stmt = $pdo->prepare("
            SELECT 
                s.id, si.name, s.base_price
            FROM services s
            JOIN service_i18n si ON s.id = si.service_id AND si.language_id = ?
            WHERE s.provider_id = ? AND s.id != ? AND s.is_active = 1
            LIMIT 5
        ");
        $stmt->execute([$langId, $service['provider_id'], $serviceId]);
        $relatedServices = $stmt->fetchAll();
        
        // Format service data
        $serviceData = [
            'id' => $service['id'],
            'name' => $service['name'],
            'description' => $service['description'],
            'price' => (float)$service['base_price'],
            'duration' => (int)$service['duration'],
            'category' => [
                'id' => $service['category_id'],
                'name' => $service['category_name']
            ],
            'provider' => [
                'id' => $service['provider_id'],
                'business_name' => $service['business_name'],
                'description' => $service['provider_description'],
                'name' => $service['first_name'] . ' ' . $service['last_name'],
                'rating' => (float)$service['avg_rating']
            ],
            'related_services' => array_map(function($relatedService) {
                return [
                    'id' => $relatedService['id'],
                    'name' => $relatedService['name'],
                    'price' => (float)$relatedService['base_price']
                ];
            }, $relatedServices)
        ];
        
        $result = response($serviceData, 200);
        $response->getBody()->write(json_encode($result));
        return $response->withStatus(200)->withHeader('Content-Type', 'application/json');
        
    } catch (PDOException $e) {
        $result = response(null, 500, __('server_error', $lang));
        $response->getBody()->write(json_encode($result));
        return $response->withStatus(500)->withHeader('Content-Type', 'application/json');
    }
}); 