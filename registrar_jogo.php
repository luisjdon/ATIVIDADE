<?php
// Iniciar sessu00e3o para controlar o limite diu00e1rio de jogos
session_start();

// Definir headers para JSON
header('Content-Type: application/json');
header('Cache-Control: no-cache, no-store, must-revalidate');

// Obter dados da requisiu00e7u00e3o
$input = json_decode(file_get_contents("php://input"), true);

// Verificar a au00e7u00e3o solicitada
if (isset($input['acao']) && $input['acao'] === 'registrar') {
    // Registrar o horu00e1rio atual como o u00faltimo jogo
    $dataHora = date('Y-m-d H:i:s');
    $_SESSION['ultimo_jogo'] = $dataHora;
    
    // Obter o ID do jogador ou gerar um novo baseado no User-Agent e IP
    $jogadorId = isset($input['jogadorId']) ? $input['jogadorId'] : 
                 (isset($_SERVER['HTTP_USER_AGENT']) ? md5($_SERVER['HTTP_USER_AGENT'] . $_SERVER['REMOTE_ADDR']) : 'unknown');
    
    // Arquivo de registro
    $arquivoRegistro = 'jogos_registro.json';
    $registros = [];
    
    // Carregar registros existentes se o arquivo existir
    if (file_exists($arquivoRegistro)) {
        $registros = json_decode(file_get_contents($arquivoRegistro), true);
    }
    
    // Adicionar/atualizar o registro do jogador
    $registros[$jogadorId] = $dataHora;
    
    // Salvar os registros atualizados
    file_put_contents($arquivoRegistro, json_encode($registros));
    
    // Retornar sucesso
    echo json_encode([
        'success' => true,
        'message' => 'Jogo registrado com sucesso',
        'data' => $dataHora,
        'jogadorId' => $jogadorId
    ]);
} else {
    // Retornar erro se a au00e7u00e3o nu00e3o for reconhecida
    echo json_encode([
        'error' => true,
        'message' => 'Au00e7u00e3o nu00e3o reconhecida'
    ]);
}
?>
