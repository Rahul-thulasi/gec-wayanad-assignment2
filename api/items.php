<?php
/**
 * ============================================================================
 * GEC Wayanad — Data-Driven Project Showcase Portal
 * KTU CST463 Web Programming Assignment 3
 * REST API Endpoint: api/items.php
 * Handles GET (public list & live search), POST (create), PUT (update)
 * ============================================================================
 */

require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/helpers.php';

initSecureSession();

$method = strtoupper($_SERVER['REQUEST_METHOD'] ?? 'GET');

// Allow method overriding via X-HTTP-Method-Override header or _method query parameter
if ($method === 'POST' && isset($_SERVER['HTTP_X_HTTP_METHOD_OVERRIDE'])) {
    $method = strtoupper($_SERVER['HTTP_X_HTTP_METHOD_OVERRIDE']);
} elseif ($method === 'POST' && isset($_GET['_method'])) {
    $method = strtoupper($_GET['_method']);
}

switch ($method) {
    case 'GET':
        handleGetItems($pdo);
        break;

    case 'POST':
        handleCreateItem($pdo);
        break;

    case 'PUT':
        handleUpdateItem($pdo);
        break;

    default:
        header('Allow: GET, POST, PUT');
        sendJsonResponse(405, [
            'success' => false,
            'message' => "Method {$method} Not Allowed. Supported methods: GET, POST, PUT."
        ]);
        break;
}

/**
 * Handle GET /api/items
 * Publicly accessible list and live search endpoint
 */
function handleGetItems(PDO $pdo) {
    $searchKeyword = isset($_GET['q']) ? trim((string)$_GET['q']) : null;
    $singleId = isset($_GET['id']) ? trim((string)$_GET['id']) : null;

    $filters = [
        'domain'     => $_GET['domain'] ?? 'all',
        'department' => $_GET['department'] ?? 'all',
        'year'       => $_GET['year'] ?? 'all',
        'status'     => $_GET['status'] ?? 'all'
    ];

    try {
        $projects = fetchProjectsFromDB($pdo, $searchKeyword, $filters);

        // If specific ID was requested
        if ($singleId !== null && $singleId !== '') {
            $matched = null;
            foreach ($projects as $p) {
                if ($p['id'] === $singleId) {
                    $matched = $p;
                    break;
                }
            }
            if (!$matched) {
                sendJsonResponse(404, [
                    'success' => false,
                    'message' => "Project record with ID '{$singleId}' not found."
                ]);
            }
            sendJsonResponse(200, [
                'success' => true,
                'message' => "Project record retrieved successfully",
                'data'    => $matched
            ]);
        }

        // Return collection
        sendJsonResponse(200, [
            'success' => true,
            'message' => 'Records retrieved successfully',
            'total'   => count($projects),
            'data'    => $projects,
            'graph'   => $projects // Backward compatibility for Assignment 2 graph consumers
        ]);
    } catch (Exception $e) {
        error_log('[API Error GET /items] ' . $e->getMessage());
        sendJsonResponse(500, [
            'success' => false,
            'message' => 'Failed to retrieve project records from the institutional database.'
        ]);
    }
}

/**
 * Handle POST /api/items
 * Authenticated record creation endpoint
 */
function handleCreateItem(PDO $pdo) {
    // 1. Enforce PHP Session Authentication
    $user = requireAuthentication();

    // 2. Parse and Validate Request JSON
    $body = getJsonRequestBody();

    $title       = trim((string)($body['title'] ?? ''));
    $domain      = trim((string)($body['domain'] ?? ''));
    $description = trim((string)($body['description'] ?? ''));
    $year        = (int)($body['year'] ?? 0);
    $department  = trim((string)($body['department'] ?? ''));
    $guide       = trim((string)($body['guide'] ?? $body['guide_id'] ?? ''));
    $status      = trim((string)($body['status'] ?? 'Prototype'));
    $technologies = is_array($body['technologies'] ?? null) ? $body['technologies'] : [];
    $team         = is_array($body['team'] ?? null) ? $body['team'] : [];

    // Validation
    $errors = [];
    if ($title === '') $errors[] = 'Title is required.';
    if ($domain === '') $errors[] = 'Domain is required.';
    if ($description === '') $errors[] = 'Description is required.';
    if ($year < 1999 || $year > 2099) $errors[] = 'Valid academic year between 1999 and 2099 is required.';
    if ($department === '') $errors[] = 'Department is required.';
    if ($guide === '') $errors[] = 'Faculty guide is required.';
    if (!in_array($status, ['Prototype', 'Development', 'Completed'], true)) {
        $errors[] = 'Status must be one of: Prototype, Development, Completed.';
    }

    if (!empty($errors)) {
        sendJsonResponse(400, [
            'success' => false,
            'message' => 'Validation error',
            'errors'  => $errors
        ]);
    }

    // Generate or format project ID (e.g. project-011)
    $projectId = trim((string)($body['id'] ?? ''));
    if ($projectId === '') {
        $stmtMax = $pdo->query("SELECT id FROM projects WHERE id LIKE 'project-%' ORDER BY id DESC LIMIT 1");
        $lastId = $stmtMax->fetchColumn();
        if ($lastId && preg_match('/project-(\d+)/', $lastId, $m)) {
            $nextNum = str_pad((int)$m[1] + 1, 3, '0', STR_PAD_LEFT);
            $projectId = "project-{$nextNum}";
        } else {
            $projectId = 'project-' . uniqid();
        }
    }

    // 3. Execute Multi-Table Insert within Transaction
    try {
        $pdo->beginTransaction();

        // Ensure faculty exists
        $stmtF = $pdo->prepare("INSERT IGNORE INTO faculty (id, name, department) VALUES (:id, :name, :dept)");
        $stmtF->execute([
            'id'   => $guide,
            'name' => $guide,
            'dept' => $department
        ]);

        // Insert project
        $stmtP = $pdo->prepare("
            INSERT INTO projects (id, title, domain, description, year, department, guide_id, status)
            VALUES (:id, :title, :domain, :description, :year, :department, :guide_id, :status)
        ");
        $stmtP->execute([
            'id'          => $projectId,
            'title'       => $title,
            'domain'      => $domain,
            'description' => $description,
            'year'        => $year,
            'department'  => $department,
            'guide_id'    => $guide,
            'status'      => $status
        ]);

        // Insert / link technologies
        $stmtFindTech = $pdo->prepare("SELECT id FROM technologies WHERE name = :name");
        $stmtInsertTech = $pdo->prepare("INSERT IGNORE INTO technologies (name) VALUES (:name)");
        $stmtLinkTech = $pdo->prepare("INSERT IGNORE INTO project_technologies (project_id, technology_id) VALUES (:pid, :tid)");

        foreach ($technologies as $t) {
            $tName = trim((string)$t);
            if ($tName === '') continue;
            $stmtInsertTech->execute(['name' => $tName]);
            $stmtFindTech->execute(['name' => $tName]);
            $tId = $stmtFindTech->fetchColumn();
            if ($tId) {
                $stmtLinkTech->execute(['pid' => $projectId, 'tid' => $tId]);
            }
        }

        // Insert / link team members (students)
        $stmtInsertStudent = $pdo->prepare("INSERT IGNORE INTO students (id, name, department) VALUES (:id, :name, :dept)");
        $stmtLinkMember = $pdo->prepare("INSERT IGNORE INTO project_members (project_id, student_id) VALUES (:pid, :sid)");

        foreach ($team as $m) {
            $mName = trim((string)$m);
            if ($mName === '') continue;
            $stmtInsertStudent->execute(['id' => $mName, 'name' => $mName, 'dept' => $department]);
            $stmtLinkMember->execute(['pid' => $projectId, 'sid' => $mName]);
        }

        $pdo->commit();

        // Fetch newly created record
        $createdList = fetchProjectsFromDB($pdo, null, []);
        $createdRecord = null;
        foreach ($createdList as $p) {
            if ($p['id'] === $projectId) {
                $createdRecord = $p;
                break;
            }
        }

        sendJsonResponse(201, [
            'success' => true,
            'message' => 'Project record created successfully',
            'data'    => $createdRecord ?: ['id' => $projectId, 'title' => $title]
        ]);

    } catch (Exception $e) {
        if ($pdo->inTransaction()) {
            $pdo->rollBack();
        }
        error_log('[API Error POST /items] ' . $e->getMessage());
        sendJsonResponse(500, [
            'success' => false,
            'message' => 'Failed to create institutional project record: ' . $e->getMessage()
        ]);
    }
}

/**
 * Handle PUT /api/items/:id
 * Authenticated record update endpoint
 */
function handleUpdateItem(PDO $pdo) {
    // 1. Enforce PHP Session Authentication
    $user = requireAuthentication();

    // 2. Resolve Target ID
    $targetId = trim((string)($_GET['id'] ?? ''));
    $body = getJsonRequestBody();

    if ($targetId === '' && !empty($body['id'])) {
        $targetId = trim((string)$body['id']);
    }

    if ($targetId === '') {
        sendJsonResponse(400, [
            'success' => false,
            'message' => 'Project record ID is required for update operation.'
        ]);
    }

    // 3. Verify record exists
    $checkStmt = $pdo->prepare("SELECT id FROM projects WHERE id = :id");
    $checkStmt->execute(['id' => $targetId]);
    if (!$checkStmt->fetch()) {
        sendJsonResponse(404, [
            'success' => false,
            'message' => "Project record '{$targetId}' does not exist."
        ]);
    }

    // 4. Validate fields
    $title       = trim((string)($body['title'] ?? ''));
    $domain      = trim((string)($body['domain'] ?? ''));
    $description = trim((string)($body['description'] ?? ''));
    $year        = (int)($body['year'] ?? 0);
    $department  = trim((string)($body['department'] ?? ''));
    $guide       = trim((string)($body['guide'] ?? $body['guide_id'] ?? ''));
    $status      = trim((string)($body['status'] ?? ''));
    $technologies = isset($body['technologies']) && is_array($body['technologies']) ? $body['technologies'] : null;
    $team         = isset($body['team']) && is_array($body['team']) ? $body['team'] : null;

    $errors = [];
    if ($title === '') $errors[] = 'Title cannot be empty.';
    if ($domain === '') $errors[] = 'Domain cannot be empty.';
    if ($description === '') $errors[] = 'Description cannot be empty.';
    if ($year < 1999 || $year > 2099) $errors[] = 'Valid academic year between 1999 and 2099 is required.';
    if ($department === '') $errors[] = 'Department cannot be empty.';
    if ($guide === '') $errors[] = 'Faculty guide cannot be empty.';
    if (!in_array($status, ['Prototype', 'Development', 'Completed'], true)) {
        $errors[] = 'Status must be one of: Prototype, Development, Completed.';
    }

    if (!empty($errors)) {
        sendJsonResponse(400, [
            'success' => false,
            'message' => 'Validation error',
            'errors'  => $errors
        ]);
    }

    // 5. Execute Update within Transaction
    try {
        $pdo->beginTransaction();

        // Ensure faculty exists
        $stmtF = $pdo->prepare("INSERT IGNORE INTO faculty (id, name, department) VALUES (:id, :name, :dept)");
        $stmtF->execute([
            'id'   => $guide,
            'name' => $guide,
            'dept' => $department
        ]);

        // Update core project table
        $stmtUpdate = $pdo->prepare("
            UPDATE projects 
            SET title = :title,
                domain = :domain,
                description = :description,
                year = :year,
                department = :department,
                guide_id = :guide_id,
                status = :status
            WHERE id = :id
        ");
        $stmtUpdate->execute([
            'id'          => $targetId,
            'title'       => $title,
            'domain'      => $domain,
            'description' => $description,
            'year'        => $year,
            'department'  => $department,
            'guide_id'    => $guide,
            'status'      => $status
        ]);

        // Update technologies if provided
        if ($technologies !== null) {
            $pdo->prepare("DELETE FROM project_technologies WHERE project_id = :pid")->execute(['pid' => $targetId]);

            $stmtFindTech = $pdo->prepare("SELECT id FROM technologies WHERE name = :name");
            $stmtInsertTech = $pdo->prepare("INSERT IGNORE INTO technologies (name) VALUES (:name)");
            $stmtLinkTech = $pdo->prepare("INSERT INTO project_technologies (project_id, technology_id) VALUES (:pid, :tid)");

            foreach ($technologies as $t) {
                $tName = trim((string)$t);
                if ($tName === '') continue;
                $stmtInsertTech->execute(['name' => $tName]);
                $stmtFindTech->execute(['name' => $tName]);
                $tId = $stmtFindTech->fetchColumn();
                if ($tId) {
                    $stmtLinkTech->execute(['pid' => $targetId, 'tid' => $tId]);
                }
            }
        }

        // Update team members if provided
        if ($team !== null) {
            $pdo->prepare("DELETE FROM project_members WHERE project_id = :pid")->execute(['pid' => $targetId]);

            $stmtInsertStudent = $pdo->prepare("INSERT IGNORE INTO students (id, name, department) VALUES (:id, :name, :dept)");
            $stmtLinkMember = $pdo->prepare("INSERT INTO project_members (project_id, student_id) VALUES (:pid, :sid)");

            foreach ($team as $m) {
                $mName = trim((string)$m);
                if ($mName === '') continue;
                $stmtInsertStudent->execute(['id' => $mName, 'name' => $mName, 'dept' => $department]);
                $stmtLinkMember->execute(['pid' => $targetId, 'sid' => $mName]);
            }
        }

        $pdo->commit();

        // Fetch updated record
        $all = fetchProjectsFromDB($pdo, null, []);
        $updatedRecord = null;
        foreach ($all as $p) {
            if ($p['id'] === $targetId) {
                $updatedRecord = $p;
                break;
            }
        }

        sendJsonResponse(200, [
            'success' => true,
            'message' => "Project record '{$targetId}' updated successfully",
            'data'    => $updatedRecord
        ]);

    } catch (Exception $e) {
        if ($pdo->inTransaction()) {
            $pdo->rollBack();
        }
        error_log('[API Error PUT /items] ' . $e->getMessage());
        sendJsonResponse(500, [
            'success' => false,
            'message' => 'Failed to update project record: ' . $e->getMessage()
        ]);
    }
}
