<?php
require_once 'db.php';
require_once 'auth-check.php';

$user = validateToken($conn);
if (!$user) {
    http_response_code(401);
    echo json_encode(['error' => 'Não autorizado']);
    exit();
}

$method = $_SERVER['REQUEST_METHOD'];

// GET - list all admins
if ($method === 'GET') {
    $result = $conn->query("SELECT id, email, idState FROM users ORDER BY id ASC");
    $admins = [];
    while ($row = $result->fetch_assoc()) {
        $admins[] = [
            'id'      => (int)$row['id'],
            'email'   => $row['email'],
            'idState' => (int)$row['idState'],
        ];
    }
    echo json_encode($admins);
    exit();
}

// POST - add new admin
if ($method === 'POST') {
    $data = json_decode(file_get_contents('php://input'), true);
    $email    = trim($data['email'] ?? '');
    $password = $data['password'] ?? '';

    if (!$email || !$password) {
        http_response_code(400);
        echo json_encode(['error' => 'Email e password são obrigatórios']);
        exit();
    }

    if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
        http_response_code(400);
        echo json_encode(['error' => 'Email inválido']);
        exit();
    }

    $len = strlen($password);
    if ($len < 8 || $len > 32 ||
        !preg_match('/[A-Z]/', $password) ||
        !preg_match('/[0-9]/', $password) ||
        !preg_match('/[!@#$%^&*()\-_+=]/', $password)) {
        http_response_code(400);
        echo json_encode(['error' => 'A password deve ter entre 8 e 32 caracteres, incluir pelo menos 1 letra maiúscula, 1 dígito e 1 caractere especial']);
        exit();
    }

    $stmt = $conn->prepare("SELECT id FROM users WHERE email = ?");
    $stmt->bind_param('s', $email);
    $stmt->execute();
    if ($stmt->get_result()->num_rows > 0) {
        http_response_code(409);
        echo json_encode(['error' => 'Este email já existe como administrador']);
        exit();
    }

    $hash = md5($password);
    $stmt = $conn->prepare("INSERT INTO users (email, password, idState) VALUES (?, ?, 1)");
    $stmt->bind_param('ss', $email, $hash);
    $stmt->execute();
    $newId = $conn->insert_id;

    $uid = $user['user_id']; $opId = 6;
    $stmt2 = $conn->prepare("INSERT INTO logs (idUser, idOperation, idAdmin) VALUES (?, ?, ?)");
    $stmt2->bind_param('iii', $uid, $opId, $newId);
    $stmt2->execute();

    echo json_encode(['success' => true, 'id' => $newId]);
    exit();
}

// DELETE - toggle state (cannot delete admin@cpm.com)
if ($method === 'DELETE') {
    $id = (int)($_GET['id'] ?? 0);
    if (!$id) { http_response_code(400); echo json_encode(['error' => 'ID inválido']); exit(); }

    $stmt = $conn->prepare("SELECT email FROM users WHERE id = ?");
    $stmt->bind_param('i', $id);
    $stmt->execute();
    $row = $stmt->get_result()->fetch_assoc();

    if (!$row) { http_response_code(404); echo json_encode(['error' => 'Administrador não encontrado']); exit(); }
    if ($id === (int)$user['user_id']) {
        http_response_code(403);
        echo json_encode(['error' => 'Não pode desativar a sua própria conta']);
        exit();
    }

    $stmt = $conn->prepare("UPDATE users SET idState = CASE WHEN idState = 1 THEN 2 ELSE 1 END WHERE id = ?");
    $stmt->bind_param('i', $id);
    $stmt->execute();

    $uid = $user['user_id']; $opId = 7;
    $stmt2 = $conn->prepare("INSERT INTO logs (idUser, idOperation, idAdmin) VALUES (?, ?, ?)");
    $stmt2->bind_param('iii', $uid, $opId, $id);
    $stmt2->execute();

    echo json_encode(['success' => true]);
    exit();
}

http_response_code(405);
echo json_encode(['error' => 'Método não permitido']);
