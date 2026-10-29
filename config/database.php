<?php
/**
 * ============================================================================
 * GEC Wayanad — Data-Driven Project Showcase Portal
 * KTU CST463 Web Programming Assignment 3
 * Database Connection Module: config/database.php
 * Secure PDO Provider with UTF-8 and Exception-Based Handling
 * ============================================================================
 */

// Shield internal PHP errors from leaking into the output stream
ini_set('display_errors', '0');
error_reporting(E_ALL);

function getDBConnection() {
    static $pdoInstance = null;
    if ($pdoInstance !== null) {
        return $pdoInstance;
    }

    // Configurable credentials via environment variables or sensible local defaults
    $host = getenv('DB_HOST') ?: '127.0.0.1';
    $port = getenv('DB_PORT') ?: '3306';
    $dbname = getenv('DB_NAME') ?: 'gec_assignment3';
    $user = getenv('DB_USER') ?: 'root';
    
    // Candidates for password: env var first, then common local/XAMPP configurations
    $envPass = getenv('DB_PASS');
    $passwordsToTry = [];
    if ($envPass !== false && $envPass !== null) {
        $passwordsToTry[] = $envPass;
    }
    // Local environment password discovered, plus empty password for standard XAMPP
    $passwordsToTry[] = 'rahulthulasi';
    $passwordsToTry[] = '';
    $passwordsToTry[] = 'root';

    $options = [
        PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
        PDO::ATTR_EMULATE_PREPARES   => false,
        PDO::MYSQL_ATTR_INIT_COMMAND => "SET NAMES utf8mb4 COLLATE utf8mb4_unicode_ci"
    ];

    $lastException = null;
    foreach ($passwordsToTry as $candidatePass) {
        try {
            $dsn = "mysql:host={$host};port={$port};dbname={$dbname};charset=utf8mb4";
            $pdo = new PDO($dsn, $user, $candidatePass, $options);
            $pdoInstance = $pdo;
            return $pdoInstance;
        } catch (PDOException $e) {
            $lastException = $e;
            continue;
        }
    }

    // If all connection attempts fail, log safely and emit JSON response without leaking secrets
    error_log('[GEC Wayanad Portal DB Error] ' . ($lastException ? $lastException->getMessage() : 'Unknown database error'));

    if (php_sapi_name() !== 'cli') {
        header('Content-Type: application/json; charset=utf-8');
        http_response_code(500);
        echo json_encode([
            'success' => false,
            'message' => 'Institutional database connection failed. Please ensure MySQL service is running and configured.'
        ], JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
        exit;
    } else {
        throw new RuntimeException("Database connection failed: " . ($lastException ? $lastException->getMessage() : ''));
    }
}

// Global variable for scripts that directly reference $pdo
$pdo = getDBConnection();
