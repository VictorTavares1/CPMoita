<?php
header('Content-Type: application/json; charset=utf-8');

$allowedOrigins = [
    'http://localhost:4200',
    'http://localhost',
    'https://www.centroparoquialdamoita.pt',
    'https://centroparoquialdamoita.pt',
];
$origin = $_SERVER['HTTP_ORIGIN'] ?? '';
if (in_array($origin, $allowedOrigins, true)) {
    header('Access-Control-Allow-Origin: ' . $origin);
    header('Vary: Origin');
}
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');
header('X-Content-Type-Options: nosniff');
header('X-Frame-Options: DENY');
header('Referrer-Policy: strict-origin-when-cross-origin');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

$config = json_decode(file_get_contents(__DIR__ . '/../db/info.json'), true);

$conn = new mysqli(
    $config['server'],
    $config['user'],
    $config['password'],
    'centro-paroquial-moita'
);

if ($conn->connect_error) {
    http_response_code(500);
    echo json_encode(['error' => 'Erro na ligação à base de dados']);
    exit();
}

$conn->set_charset('utf8mb4');
