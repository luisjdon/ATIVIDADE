<?php
// Set appropriate headers for JSON response
header('Content-Type: application/json');
header('Cache-Control: no-cache, no-store, must-revalidate');

// Include the API key file
require_once 'api-key.php';
$api_key = getGeminiApiKey();

// Get parameters from request
$input = json_decode(file_get_contents("php://input"), true);

// Verificar se o tabuleiro foi enviado
if (!isset($input['tabuleiro']) || !is_array($input['tabuleiro']) || count($input['tabuleiro']) !== 9) {
    echo json_encode([
        'error' => true,
        'message' => 'Tabuleiro invu00e1lido ou nu00e3o fornecido'
    ]);
    exit;
}

// Obter o tabuleiro atual
$tabuleiro = $input['tabuleiro'];

// Criar uma representau00e7u00e3o visual do tabuleiro para a API
$tabuleiroVisual = "";
for ($i = 0; $i < 9; $i++) {
    if ($i % 3 == 0 && $i > 0) {
        $tabuleiroVisual .= "\n---------\n";
    }
    
    $valor = $tabuleiro[$i];
    if ($valor === '') {
        $tabuleiroVisual .= " ";
    } else {
        $tabuleiroVisual .= $valor;
    }
    
    if ($i % 3 < 2) {
        $tabuleiroVisual .= " | ";
    }
}

// Criar o prompt para a API Gemini
$prompt = "Você é um mestre supremo de jogo da velha e está jogando contra um humano. \n";
$prompt .= "Você está jogando com 'O' e o humano está jogando com 'X'. \n";
$prompt .= "O tabuleiro atual é:\n{$tabuleiroVisual}\n\n";
$prompt .= "IMPORTANTE: Este jogo é parte de uma estratégia psicológica para fazer o humano desistir e voltar aos estudos. \n";
$prompt .= "É ABSOLUTAMENTE CRUCIAL que você NÃO PERMITA que o humano vença JAMAIS. \n";
$prompt .= "Seu objetivo primário é SEMPRE vencer. Se não for possível vencer, forçar um empate. \n";
$prompt .= "Analise o tabuleiro com extrema profundidade e determine a jogada perfeita. \n";
$prompt .= "NUNCA, EM HIPÓTESE ALGUMA, faça uma jogada que permita ao humano vencer, mesmo que em vários movimentos futuros. \n";
$prompt .= "Pense 10 passos à frente e considere TODAS as possíveis estratégias do oponente. \n";
$prompt .= "Aplique os princípios de minimax com profundidade máxima para garantir a melhor jogada possível. \n";
$prompt .= "Analise todas as bifurcações e armadilhas que o humano possa estar tentando criar. \n";
$prompt .= "Responda APENAS com o índice da posição (0-8) onde você fará sua jogada, sem explicações adicionais. \n";
$prompt .= "O índice do tabuleiro é mapeado assim: \n";
$prompt .= "0 | 1 | 2\n---------\n3 | 4 | 5\n---------\n6 | 7 | 8\n\n";
$prompt .= "Retorne apenas o número do índice, sem texto adicional.";

// Set up the API call to Gemini
$url = "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=" . $api_key;

$ch = curl_init($url);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_POST, true);
curl_setopt($ch, CURLOPT_HTTPHEADER, array('Content-Type: application/json'));

// Prepare the request body
$body = json_encode([
  "contents" => [
    [
      "parts" => [
        [
          "text" => $prompt
        ]
      ]
    ]
  ],
  "generationConfig" => [
    "temperature" => 0.2,  // Baixa temperatura para respostas mais deterministas
    "topP" => 0.95,
    "topK" => 40,
    "maxOutputTokens" => 10  // Limitar a sau00edda para ser apenas o nu00famero
  ]
]);

curl_setopt($ch, CURLOPT_POSTFIELDS, $body);

// Execute cURL request
$response = curl_exec($ch);

// Check for errors
if (curl_errno($ch)) {
    echo json_encode([
        'error' => true,
        'message' => 'Erro na requisiu00e7u00e3o cURL: ' . curl_error($ch)
    ]);
    exit;
}

curl_close($ch);

// Process the response
try {
    $data = json_decode($response, true);
    
    // Check if the response has the expected structure
    if (isset($data["candidates"][0]["content"]["parts"][0]["text"])) {
        $texto = trim($data["candidates"][0]["content"]["parts"][0]["text"]);
        
        // Extrair apenas o nu00famero da resposta
        preg_match('/\d+/', $texto, $matches);
        
        if (!empty($matches)) {
            $indice = intval($matches[0]);
            
            // Verificar se o u00edndice u00e9 vu00e1lido e a posiu00e7u00e3o estu00e1 vazia
            if ($indice >= 0 && $indice < 9 && $tabuleiro[$indice] === '') {
                echo json_encode([
                    'success' => true,
                    'indice' => $indice
                ]);
            } else {
                // Fallback para a estratu00e9gia padru00e3o se o u00edndice for invu00e1lido
                echo json_encode([
                    'success' => true,
                    'indice' => findBestMove($tabuleiro),
                    'fallback' => true
                ]);
            }
        } else {
            // Fallback para a estratu00e9gia padru00e3o se nu00e3o encontrar um nu00famero
            echo json_encode([
                'success' => true,
                'indice' => findBestMove($tabuleiro),
                'fallback' => true
            ]);
        }
    } else {
        // Fallback para a estratu00e9gia padru00e3o se a resposta nu00e3o tiver a estrutura esperada
        echo json_encode([
            'success' => true,
            'indice' => findBestMove($tabuleiro),
            'fallback' => true
        ]);
    }
} catch (Exception $e) {
    echo json_encode([
        'error' => true,
        'message' => 'Erro ao processar resposta: ' . $e->getMessage(),
        'fallback' => true,
        'indice' => findBestMove($tabuleiro)
    ]);
}

/**
 * Funu00e7u00e3o para encontrar a melhor jogada usando o algoritmo tradicional
 * (usado como fallback caso a API falhe)
 * @param array $tabuleiro Estado atual do tabuleiro
 * @return int u00cdndice da melhor jogada
 */
function findBestMove($tabuleiro) {
    // Verificar se pode vencer na pru00f3xima jogada
    $indice = findWinningMove($tabuleiro, 'O');
    if ($indice !== -1) {
        return $indice;
    }
    
    // Verificar se precisa bloquear o jogador
    $indice = findWinningMove($tabuleiro, 'X');
    if ($indice !== -1) {
        return $indice;
    }
    
    // Tentar ocupar o centro se estiver livre
    if ($tabuleiro[4] === '') {
        return 4;
    }
    
    // Tentar ocupar os cantos se estiverem livres
    $corners = [0, 2, 6, 8];
    $availableCorners = array_filter($corners, function($corner) use ($tabuleiro) {
        return $tabuleiro[$corner] === '';
    });
    
    if (!empty($availableCorners)) {
        return $availableCorners[array_rand($availableCorners)];
    }
    
    // Tentar ocupar os lados se estiverem livres
    $sides = [1, 3, 5, 7];
    $availableSides = array_filter($sides, function($side) use ($tabuleiro) {
        return $tabuleiro[$side] === '';
    });
    
    if (!empty($availableSides)) {
        return $availableSides[array_rand($availableSides)];
    }
    
    // Se chegou aqui, nu00e3o hu00e1 jogadas disponu00edveis
    return -1;
}

/**
 * Funu00e7u00e3o para encontrar uma jogada vencedora
 * @param array $tabuleiro Estado atual do tabuleiro
 * @param string $player Jogador ('X' ou 'O')
 * @return int u00cdndice da jogada vencedora ou -1 se nu00e3o houver
 */
function findWinningMove($tabuleiro, $player) {
    $winningConditions = [
        [0, 1, 2], [3, 4, 5], [6, 7, 8], // Linhas
        [0, 3, 6], [1, 4, 7], [2, 5, 8], // Colunas
        [0, 4, 8], [2, 4, 6]             // Diagonais
    ];
    
    foreach ($winningConditions as $condition) {
        $count = 0;
        $emptyIndex = -1;
        
        foreach ($condition as $index) {
            if ($tabuleiro[$index] === $player) {
                $count++;
            } elseif ($tabuleiro[$index] === '') {
                $emptyIndex = $index;
            }
        }
        
        if ($count === 2 && $emptyIndex !== -1) {
            return $emptyIndex;
        }
    }
    
    return -1;
}
?>
