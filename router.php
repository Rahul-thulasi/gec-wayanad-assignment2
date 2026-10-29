<?php
/**
 * ============================================================================
 * GEC Wayanad — Data-Driven Project Showcase Portal
 * Built-in PHP CLI Server Router: router.php
 * Usage: php -S localhost:8000 router.php
 * ============================================================================
 */

$uri = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);

// Serve static assets directly if they exist on the filesystem
$filePath = __DIR__ . $uri;
if ($uri !== '/' && file_exists($filePath) && !is_dir($filePath)) {
    // If it's a php file, include it
    if (pathinfo($filePath, PATHINFO_EXTENSION) === 'php') {
        require $filePath;
        return true;
    }
    return false; // Let PHP built-in server handle static asset (css, js, png, etc.)
}

// REST API Route mapping
if (preg_match('#^/api/items(?:/(project-[a-zA-Z0-9_-]+))?#', $uri, $matches)) {
    if (!empty($matches[1])) {
        $_GET['id'] = $matches[1];
    }
    require __DIR__ . '/api/items.php';
    return true;
}

if ($uri === '/api/login') {
    require __DIR__ . '/api/login.php';
    return true;
}

if ($uri === '/api/logout') {
    require __DIR__ . '/api/logout.php';
    return true;
}

if ($uri === '/api/session') {
    require __DIR__ . '/api/session.php';
    return true;
}

// Fallback to index.html for root or unknown paths
if ($uri === '/' || $uri === '/index.html') {
    require __DIR__ . '/index.html';
    return true;
}

// 404 for unknown endpoints
http_response_code(404);
header('Content-Type: application/json; charset=utf-8');
echo json_encode([
    'success' => false,
    'message' => 'Resource endpoint not found.'
]);
return true;
