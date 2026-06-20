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

// GET - retorna dados do perfil atual
if ($method === 'GET') {
    $stmt = $conn->prepare("SELECT id, email FROM users WHERE id = ?");
    $stmt->bind_param('i', $user['user_id']);
    $stmt->execute();
    $row = $stmt->get_result()->fetch_assoc();
    echo json_encode(['id' => (int)$row['id'], 'email' => $row['email']]);
    exit();
}

// PUT - atualiza nome e/ou password
if ($method === 'PUT') {
    $data = json_decode(file_get_contents('php://input'), true);

    $novaPwd      = $data['novaPwd'] ?? '';
    $confirmarPwd = $data['confirmarPwd'] ?? '';
    $pwdAtual     = $data['pwdAtual'] ?? '';

    if ($novaPwd || $confirmarPwd || $pwdAtual) {
        if (!$pwdAtual) {
            http_response_code(400);
            echo json_encode(['error' => 'Introduza a palavra-passe atual']);
            exit();
        }

        $stmt = $conn->prepare("SELECT password FROM users WHERE id = ?");
        $stmt->bind_param('i', $user['user_id']);
        $stmt->execute();
        $row = $stmt->get_result()->fetch_assoc();

        if (!password_verify($pwdAtual, $row['password'])) {
            http_response_code(400);
            echo json_encode(['error' => 'Palavra-passe atual incorreta']);
            exit();
        }

        if ($novaPwd !== $confirmarPwd) {
            http_response_code(400);
            echo json_encode(['error' => 'As palavras-passe não coincidem']);
            exit();
        }

        $len = strlen($novaPwd);
        if ($len < 8 || $len > 32 ||
            !preg_match('/[A-Z]/', $novaPwd) ||
            !preg_match('/[0-9]/', $novaPwd) ||
            !preg_match('/[!@#$%^&*()\-_+=]/', $novaPwd)) {
            http_response_code(400);
            echo json_encode(['error' => 'A password deve ter entre 8 e 32 caracteres, incluir pelo menos 1 letra maiúscula, 1 dígito e 1 caractere especial']);
            exit();
        }

        $hash = password_hash($novaPwd, PASSWORD_BCRYPT);
        $stmt = $conn->prepare("UPDATE users SET password = ? WHERE id = ?");
        $stmt->bind_param('si', $hash, $user['user_id']);
        $stmt->execute();
    }

    echo json_encode(['success' => true]);
    exit();
}

http_response_code(405);
echo json_encode(['error' => 'Método não permitido']);
