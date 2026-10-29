<?php
/**
 * ============================================================================
 * GEC Wayanad — Data-Driven Project Showcase Portal
 * KTU CST463 Web Programming Assignment 3
 * Logout Endpoint: api/logout.php
 * Terminates PHP Session & Clears Session Cookies
 * ============================================================================
 */

require_once __DIR__ . '/helpers.php';

initSecureSession();

// Clear session variables
$_SESSION = [];

// Clear session cookie in browser
if (ini_get("session.use_cookies")) {
    $params = session_get_cookie_params();
    setcookie(
        session_name(),
        '',
        time() - 42000,
        $params["path"],
        $params["domain"],
        $params["secure"],
        $params["httponly"]
    );
}

// Destroy session on server
session_destroy();

sendJsonResponse(200, [
    'success' => true,
    'message' => 'Institutional session terminated successfully'
]);
