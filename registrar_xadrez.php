<?php
// Iniciar sessão para controlar o limite diário de jogos
session_start();

// Definir headers para JSON
header('Content-Type: application/json');
header('Cache-Control: no-cache, no-store, must-revalidate');

// Obter dados da requisição
$input = json_decode(file_get_contents("php://input"), true);

// Verificar a ação solicitada
if (isset($input['acao']) && $input['acao'] === 'registrar') {
    // Obter o ID do jogador ou gerar um novo baseado no User-Agent e IP
    $jogadorId = isset($input['jogadorId']) ? $input['jogadorId'] : 
                 (isset($_SERVER['HTTP_USER_AGENT']) ? md5($_SERVER['HTTP_USER_AGENT'] . $_SERVER['REMOTE_ADDR']) : 'unknown');
    
    // Arquivo de registro
    $arquivoRegistro = 'xadrez_registro.json';
    $registros = [];
    
    // Carregar registros existentes se o arquivo existir
    if (file_exists($arquivoRegistro)) {
        $registros = json_decode(file_get_contents($arquivoRegistro), true);
    }
    
    // Verificar se já existe um registro para o jogador hoje
    $hoje = date('Y-m-d');
    $jogosHoje = 0;
    
    if (isset($registros[$jogadorId])) {
        // Se o registro for um array, significa que já está no novo formato
        if (is_array($registros[$jogadorId])) {
            foreach ($registros[$jogadorId] as $data) {
                if (substr($data, 0, 10) === $hoje) {
                    $jogosHoje++;
                }
            }
        } else {
            // Formato antigo - converter para o novo formato
            $dataAntiga = $registros[$jogadorId];
            $registros[$jogadorId] = [$dataAntiga];
            
            if (substr($dataAntiga, 0, 10) === $hoje) {
                $jogosHoje = 1;
            }
        }
    } else {
        // Criar um novo array para o jogador
        $registros[$jogadorId] = [];
    }
    
    // Registrar o horário atual como um novo jogo
    $dataHora = date('Y-m-d H:i:s');
    $registros[$jogadorId][] = $dataHora;
    
    // Atualizar a sessão com o número de jogos hoje
    $_SESSION['xadrez_jogos_hoje'] = $jogosHoje + 1;
    
    // Salvar os registros atualizados
    file_put_contents($arquivoRegistro, json_encode($registros));
    
    // Retornar sucesso
    echo json_encode([
        'success' => true,
        'message' => 'Jogo registrado com sucesso',
        'data' => $dataHora,
        'jogadorId' => $jogadorId,
        'jogosHoje' => $jogosHoje + 1,
        'jogosRestantes' => 100 - ($jogosHoje + 1)
    ]);
} else if (isset($input['acao']) && $input['acao'] === 'verificar') {
    // Obter o ID do jogador
    $jogadorId = isset($input['jogadorId']) ? $input['jogadorId'] : 
                 (isset($_SERVER['HTTP_USER_AGENT']) ? md5($_SERVER['HTTP_USER_AGENT'] . $_SERVER['REMOTE_ADDR']) : 'unknown');
    
    // Arquivo de registro
    $arquivoRegistro = 'xadrez_registro.json';
    $registros = [];
    
    // Carregar registros existentes se o arquivo existir
    if (file_exists($arquivoRegistro)) {
        $registros = json_decode(file_get_contents($arquivoRegistro), true);
    }
    
    // Verificar quantos jogos o jogador já jogou hoje
    $hoje = date('Y-m-d');
    $jogosHoje = 0;
    
    if (isset($registros[$jogadorId])) {
        // Se o registro for um array, significa que já está no novo formato
        if (is_array($registros[$jogadorId])) {
            foreach ($registros[$jogadorId] as $data) {
                if (substr($data, 0, 10) === $hoje) {
                    $jogosHoje++;
                }
            }
        } else {
            // Formato antigo - converter para o novo formato
            if (substr($registros[$jogadorId], 0, 10) === $hoje) {
                $jogosHoje = 1;
            }
        }
    }
    
    // Atualizar a sessão com o número de jogos hoje
    $_SESSION['xadrez_jogos_hoje'] = $jogosHoje;
    
    // Verificar se o jogador ainda pode jogar hoje
    $podeJogar = $jogosHoje < 100;
    
    // Retornar o resultado
    echo json_encode([
        'success' => true,
        'podeJogar' => $podeJogar,
        'jogosHoje' => $jogosHoje,
        'jogosRestantes' => 100 - $jogosHoje
    ]);
} else {
    // Retornar erro se a ação não for reconhecida
    echo json_encode([
        'error' => true,
        'message' => 'Ação não reconhecida'
    ]);
}
?>
