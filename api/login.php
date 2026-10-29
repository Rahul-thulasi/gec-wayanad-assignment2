<?php
/**
 * ============================================================================
 * GEC Wayanad — Data-Driven Project Showcase Portal
 * KTU CST463 Web Programming Assignment 3
 * Authentication Endpoint: api/login.php
 * Session-Based Login with HttpOnly Cookies & Credential Verification
 * ============================================================================
 */

require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/helpers.php';

initSecureSession();

$method = strtoupper($_SERVER['REQUEST_METHOD'] ?? 'GET');

if ($method !== 'POST') {
    header('Allow: POST');
    sendJsonResponse(405, [
        'success' => false,
        'message' => 'Method Not Allowed. Only POST requests are accepted for authentication.'
    ]);
}

$body = getJsonRequestBody();

$username = trim((string)($body['username'] ?? ''));
$password = trim((string)($body['password'] ?? ''));

// Validate request structure
if ($username === '' || $password === '') {
    sendJsonResponse(400, [
        'success' => false,
        'message' => 'Invalid request structure: both username and password are required.'
    ]);
}

try {
    // Check credentials against users table
    $stmt = $pdo->prepare("SELECT id, username, password, role FROM users WHERE username = :u LIMIT 1");
    $stmt->execute(['u' => $username]);
    $userRow = $stmt->fetch(PDO::FETCH_ASSOC);

    // Demonstration comparison mechanism (plain text as required by Assignment 3 instructions)
    if (!$userRow || $userRow['password'] !== $password) {
        sendJsonResponse(401, [
            'success' => false,
            'message' => 'Invalid username or password. Local evaluation demo accounts: admin / admin123 or demo_user / demo_pass.'
        ]);
    }

    // Authentication succeeded: Regenerate session ID to prevent session fixation
    session_regenerate_id(true);

    $sessionData = [
        'id'       => $userRow['id'],
        'username' => $userRow['username'],
        'role'     => $userRow['role']
    ];

    $_SESSION['authenticated'] = true;
    $_SESSION['user'] = $sessionData;

    sendJsonResponse(200, [
        'success' => true,
        'message' => 'Administrative authentication successful',
        'user'    => $sessionData
    ]);

} catch (Exception $e) {
    error_log('[API Error /login] ' . $e->getMessage());
    sendJsonResponse(500, [
        'success' => false,
        'message' => 'Authentication service error occurred.'
    ]);
}
