<?php
/**
 * ============================================================================
 * GEC Wayanad — Data-Driven Project Showcase Portal
 * RESTful Data Service Endpoint: api.php
 * Vanilla PHP JSON Provider
 * ============================================================================
 */

// Prevent PHP notices/warnings from corrupting the JSON response stream
ini_set('display_errors', '0');
error_reporting(0);

// Validate HTTP Request Method (only GET is supported)
$requestMethod = isset($_SERVER['REQUEST_METHOD']) ? strtoupper($_SERVER['REQUEST_METHOD']) : 'GET';

if ($requestMethod !== 'GET') {
    header('Allow: GET');
    header('Content-Type: application/json; charset=utf-8');
    http_response_code(405);
    echo json_encode([
        'error' => true,
        'message' => 'Method Not Allowed. Only GET requests are accepted.'
    ], JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    exit;
}

// Set JSON Response Headers
header('Content-Type: application/json; charset=utf-8');
header('Cache-Control: no-cache, no-store, must-revalidate');
header('Pragma: no-cache');
header('Expires: 0');
header('X-Content-Type-Options: nosniff');

// Resolve path to project dataset relative to current directory
$dataPath = __DIR__ . DIRECTORY_SEPARATOR . 'data' . DIRECTORY_SEPARATOR . 'projectdata.json';

// Verify file existence
if (!file_exists($dataPath)) {
    http_response_code(404);
    echo json_encode([
        'error' => true,
        'message' => 'Project data file not found.'
    ], JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    exit;
}

// Verify file readability
if (!is_readable($dataPath)) {
    http_response_code(500);
    echo json_encode([
        'error' => true,
        'message' => 'Unable to read project data due to server file permissions.'
    ], JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    exit;
}

// Read raw file content
$rawContent = @file_get_contents($dataPath);

if ($rawContent === false) {
    http_response_code(500);
    echo json_encode([
        'error' => true,
        'message' => 'Failed to read project data content from server storage.'
    ], JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    exit;
}

// Decode and validate JSON syntax
$decodedData = json_decode($rawContent, true);

if (json_last_error() !== JSON_ERROR_NONE || !is_array($decodedData)) {
    http_response_code(500);
    echo json_encode([
        'error' => true,
        'message' => 'Invalid JSON syntax encountered in project dataset.'
    ], JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    exit;
}

// Verify schema root contains graph array
if (!isset($decodedData['graph']) || !is_array($decodedData['graph'])) {
    http_response_code(500);
    echo json_encode([
        'error' => true,
        'message' => 'Invalid dataset format: expected root graph array is missing.'
    ], JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    exit;
}

// Success response: Output structured dataset
http_response_code(200);
echo json_encode($decodedData, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES | JSON_PRETTY_PRINT);
exit;
