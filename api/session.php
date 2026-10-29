<?php
/**
 * ============================================================================
 * GEC Wayanad — Data-Driven Project Showcase Portal
 * KTU CST463 Web Programming Assignment 3
 * Session Status Endpoint: api/session.php
 * Checks Active Authentication State for Frontend Hydration
 * ============================================================================
 */

require_once __DIR__ . '/helpers.php';

initSecureSession();

if (!empty($_SESSION['authenticated']) && !empty($_SESSION['user'])) {
    sendJsonResponse(200, [
        'success'       => true,
        'authenticated' => true,
        'user'          => $_SESSION['user']
    ]);
} else {
    sendJsonResponse(200, [
        'success'       => true,
        'authenticated' => false,
        'user'          => null
    ]);
}
