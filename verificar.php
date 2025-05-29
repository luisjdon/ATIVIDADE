<?php
// Iniciar sessão
session_start();

// Incluir arquivo de configuração do banco de dados
require_once '../database/config.php';

// Definir cabeçalhos para JSON
header('Content-Type: application/json');

// Verificar se a requisição é POST
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    echo json_encode(['success' => false, 'message' => 'Método não permitido']);
    exit;
}

// Verificar se há um usuário temporário na sessão
if (!isset($_SESSION['temp_email']) || !isset($_SESSION['needs_verification'])) {
    echo json_encode(['success' => false, 'message' => 'Sessão inválida', 'redirect' => 'login.php']);
    exit;
}

// Obter código de verificação
$codigo = trim($_POST['codigo'] ?? '');

// Validar código
if (empty($codigo) || strlen($codigo) !== 6 || !is_numeric($codigo)) {
    echo json_encode(['success' => false, 'message' => 'Código de verificação inválido']);
    exit;
}

try {
    $conn = getDbConnection();
    
    // Verificar se o código é válido
    $stmt = $conn->prepare("
        SELECT id FROM codigos_verificacao 
        WHERE email = ? AND codigo = ? AND data_expiracao > NOW() AND utilizado = 0
    ");
    $stmt->execute([$_SESSION['temp_email'], $codigo]);
    
    if ($stmt->rowCount() === 0) {
        echo json_encode(['success' => false, 'message' => 'Código inválido ou expirado']);
        exit;
    }
    
    $codigoId = $stmt->fetchColumn();
    
    // Marcar código como utilizado
    $stmt = $conn->prepare("UPDATE codigos_verificacao SET utilizado = 1 WHERE id = ?");
    $stmt->execute([$codigoId]);
    
    // Atualizar usuário como verificado
    $stmt = $conn->prepare("UPDATE usuarios SET email_verificado = 1 WHERE id = ?");
    $stmt->execute([$_SESSION['temp_user_id']]);
    
    // Remover flags de verificação da sessão
    unset($_SESSION['needs_verification']);
    unset($_SESSION['temp_email']);
    
    // Definir usuário como autenticado
    $_SESSION['user_id'] = $_SESSION['temp_user_id'];
    unset($_SESSION['temp_user_id']);
    
    echo json_encode([
        'success' => true, 
        'message' => 'Email verificado com sucesso!',
        'redirect' => '../index.php'
    ]);
    
} catch (PDOException $e) {
    error_log("Erro na verificação: " . $e->getMessage());
    echo json_encode(['success' => false, 'message' => 'Erro ao processar a verificação. Tente novamente mais tarde.']);
}
?>
