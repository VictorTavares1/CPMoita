<?php
require_once 'db.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['error' => 'Método não permitido']);
    exit();
}

$body = json_decode(file_get_contents('php://input'), true);
$email          = isset($body['email'])          ? trim($body['email'])      : '';
$pwd            = isset($body['password'])        ? $body['password']         : '';
$recaptchaToken = isset($body['recaptchaToken'])  ? trim($body['recaptchaToken']) : '';

if (!$email || !$pwd) {
    http_response_code(400);
    echo json_encode(['error' => 'Email e password são obrigatórios']);
    exit();
}

// Verificar reCAPTCHA v2
$configFull2     = json_decode(file_get_contents(__DIR__ . '/../db/info.json'), true);
$recaptchaSecret = $configFull2['recaptchaSecret'] ?? '';
if (!$recaptchaToken) {
    http_response_code(400);
    echo json_encode(['error' => 'Verificação reCAPTCHA em falta']);
    exit();
}
$ch = curl_init('https://www.google.com/recaptcha/api/siteverify');
curl_setopt_array($ch, [
    CURLOPT_RETURNTRANSFER => true,
    CURLOPT_POST           => true,
    CURLOPT_POSTFIELDS     => http_build_query([
        'secret'   => $recaptchaSecret,
        'response' => $recaptchaToken,
        'remoteip' => $_SERVER['REMOTE_ADDR'] ?? '',
    ]),
    CURLOPT_TIMEOUT        => 5,
    CURLOPT_CONNECTTIMEOUT => 3,
]);
$recaptchaResp = curl_exec($ch);
curl_close($ch);
$recaptchaData = json_decode($recaptchaResp, true);
if (!($recaptchaData['success'] ?? false)) {
    http_response_code(400);
    echo json_encode(['error' => 'Verificação reCAPTCHA falhou']);
    exit();
}

// Rate limiting: max 10 tentativas por IP em 15 minutos
$ip = $_SERVER['REMOTE_ADDR'] ?? '0.0.0.0';
$conn->query("DELETE FROM login_attempts WHERE attempted_at < DATE_SUB(NOW(), INTERVAL 15 MINUTE)");
$rateStmt = $conn->prepare("SELECT COUNT(*) AS cnt FROM login_attempts WHERE ip = ?");
$rateStmt->bind_param('s', $ip);
$rateStmt->execute();
$rateRow = $rateStmt->get_result()->fetch_assoc();
if ((int)$rateRow['cnt'] >= 10) {
    http_response_code(429);
    echo json_encode(['error' => 'Demasiadas tentativas. Tente novamente em 15 minutos.']);
    exit();
}

$stmt = $conn->prepare("SELECT id, email, password FROM users WHERE email = ? AND idState = 1");
$stmt->bind_param('s', $email);
$stmt->execute();
$user = $stmt->get_result()->fetch_assoc();

// Hash sentinela: impede timing side-channel quando o email não existe
$storedHash = $user ? $user['password'] : '$2y$12$invalidhashsentinelxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxAA';

$configFull = json_decode(file_get_contents(__DIR__ . '/../db/info.json'), true);
$prefixo = $configFull['prefixo'] ?? '';
$sufixo  = $configFull['sufixo'] ?? '';

$authenticated = false;

if (password_verify($pwd, $storedHash)) {
    $authenticated = $user !== null;
} elseif ($user !== null && ($storedHash === md5($prefixo . $pwd . $sufixo) || $storedHash === md5($pwd))) {
    $newHash = password_hash($pwd, PASSWORD_BCRYPT);
    $stmtUpd = $conn->prepare("UPDATE users SET password = ? WHERE id = ?");
    $stmtUpd->bind_param('si', $newHash, $user['id']);
    $stmtUpd->execute();
    $authenticated = true;
}

if (!$authenticated) {
    $ins = $conn->prepare("INSERT INTO login_attempts (ip) VALUES (?)");
    $ins->bind_param('s', $ip);
    $ins->execute();
    http_response_code(401);
    echo json_encode(['error' => 'Credenciais inválidas']);
    exit();
}

// Login bem-sucedido — limpar tokens expirados
$conn->query("DELETE FROM admin_tokens WHERE expires_at < NOW()");

$token     = bin2hex(random_bytes(32));
$expiresAt = date('Y-m-d H:i:s', strtotime('+8 hours'));

$stmt2 = $conn->prepare("INSERT INTO admin_tokens (user_id, token, expires_at) VALUES (?, ?, ?)");
$stmt2->bind_param('iss', $user['id'], $token, $expiresAt);
$stmt2->execute();

// Cookie HttpOnly: JavaScript nunca consegue ler — imune a XSS
// Detectar HTTPS incluindo proxies reversos (X-Forwarded-Proto)
$isSecure  = (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off')
           || ($_SERVER['HTTP_X_FORWARDED_PROTO'] ?? '') === 'https';
// Derivar o path da API a partir do URL actual em vez de hardcodar
// Em dev:  /CPMoita/api/   Em produção: /api/
$scriptDir = dirname($_SERVER['SCRIPT_NAME']);
$cookiePath = rtrim($scriptDir, '/') . '/';
$cookieTtl  = 8 * 3600; // 8 horas (igual ao token na BD)
setcookie('admin_token', $token, [
    'expires'  => time() + $cookieTtl,
    'path'     => $cookiePath,
    'domain'   => '',
    'secure'   => $isSecure,
    'httponly' => true,
    'samesite' => 'Strict',
]);

// Devolver apenas email e expiração — o token não sai no body
echo json_encode([
    'email'   => $user['email'],
    'expires' => $expiresAt,
]);
