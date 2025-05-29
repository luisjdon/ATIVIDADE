<?php
// Iniciar sessão para controlar o limite diário de jogos
session_start();

// Identificar o jogador
$jogadorId = isset($_SERVER['HTTP_USER_AGENT']) ? md5($_SERVER['HTTP_USER_AGENT'] . $_SERVER['REMOTE_ADDR']) : 'unknown';

// Verificar se o jogador pode jogar hoje (máximo 100 jogos por dia)
$podeJogar = true;
$mensagemLimite = '';
$jogosHoje = 0;
$jogosRestantes = 100;

// Verificar se existe um arquivo de registro para este jogador
$arquivoRegistro = 'xadrez_registro.json';
$registros = [];

if (file_exists($arquivoRegistro)) {
    $registros = json_decode(file_get_contents($arquivoRegistro), true);
}

// Verificar quantos jogos o jogador já jogou hoje
$hoje = date('Y-m-d');

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
$jogosRestantes = 100 - $jogosHoje;
$podeJogar = $jogosRestantes > 0;

if (!$podeJogar) {
    $mensagemLimite = "Você já jogou 4 vezes hoje! Volte amanhã para jogar novamente.";
} else if ($jogosHoje > 0) {
    $mensagemLimite = "Você tem $jogosRestantes jogo(s) restante(s) hoje.";
}
?>
<!DOCTYPE html>
<html lang="pt-br">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Aprenda Xadrez - Desafio Impossível</title>
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.3/css/all.min.css">
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/chessboard-element@1.0.0/dist/chessboard-1.0.0.min.css">
    <style>
        :root {
            --primary-color: #3498db;
            --secondary-color: #2ecc71;
            --dark-color: #2c3e50;
            --light-color: #ecf0f1;
            --danger-color: #e74c3c;
            --warning-color: #f39c12;
        }
        
        * {
            box-sizing: border-box;
            margin: 0;
            padding: 0;
        }
        
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            line-height: 1.6;
            background-color: var(--light-color);
            color: var(--dark-color);
            min-height: 100vh;
            display: flex;
            flex-direction: column;
        }
        
        .container {
            width: 100%;
            max-width: 1200px;
            margin: 0 auto;
            padding: 20px;
            flex: 1;
        }
        
        header {
            background-color: var(--dark-color);
            color: white;
            padding: 1rem;
            text-align: center;
        }
        
        h1 {
            margin-bottom: 0.5rem;
        }
        
        .tabs {
            display: flex;
            margin-bottom: 20px;
            border-bottom: 2px solid var(--primary-color);
        }
        
        .tab {
            padding: 10px 20px;
            cursor: pointer;
            background-color: #f1f1f1;
            border: none;
            outline: none;
            font-size: 16px;
            font-weight: bold;
            transition: 0.3s;
        }
        
        .tab.active {
            background-color: var(--primary-color);
            color: white;
        }
        
        .tab-content {
            display: none;
            padding: 20px;
            border: 1px solid #ddd;
            border-top: none;
            animation: fadeIn 0.5s;
        }
        
        .tab-content.active {
            display: block;
        }
        
        @keyframes fadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
        }
        
        #chessboard {
            width: 100%;
            max-width: 600px;
            margin: 0 auto;
        }
        
        .game-info {
            margin-top: 20px;
            padding: 15px;
            background-color: #f8f9fa;
            border-radius: 5px;
            box-shadow: 0 2px 5px rgba(0,0,0,0.1);
        }
        
        .status {
            font-size: 18px;
            font-weight: bold;
            margin-bottom: 10px;
        }
        
        .message {
            padding: 10px;
            margin: 10px 0;
            border-radius: 5px;
        }
        
        .message.info {
            background-color: #d1ecf1;
            color: #0c5460;
        }
        
        .message.warning {
            background-color: #fff3cd;
            color: #856404;
        }
        
        .message.error {
            background-color: #f8d7da;
            color: #721c24;
        }
        
        .message.success {
            background-color: #d4edda;
            color: #155724;
        }
        
        .btn {
            display: inline-block;
            padding: 10px 20px;
            background-color: var(--primary-color);
            color: white;
            border: none;
            border-radius: 5px;
            cursor: pointer;
            font-size: 16px;
            transition: background-color 0.3s;
            margin-right: 10px;
            margin-bottom: 10px;
        }
        
        .btn:hover {
            background-color: #2980b9;
        }
        
        .btn.secondary {
            background-color: var(--secondary-color);
        }
        
        .btn.secondary:hover {
            background-color: #27ae60;
        }
        
        .btn.danger {
            background-color: var(--danger-color);
        }
        
        .btn.danger:hover {
            background-color: #c0392b;
        }
        
        .tutorial-step {
            margin-bottom: 30px;
            padding: 20px;
            background-color: white;
            border-radius: 5px;
            box-shadow: 0 2px 5px rgba(0,0,0,0.1);
        }
        
        .tutorial-step h3 {
            margin-bottom: 15px;
            color: var(--primary-color);
        }
        
        .piece-info {
            display: flex;
            align-items: center;
            margin-bottom: 15px;
        }
        
        .piece-image {
            width: 50px;
            height: 50px;
            margin-right: 15px;
        }
        
        .piece-description {
            flex: 1;
        }
        
        .limit-message {
            background-color: var(--warning-color);
            color: white;
            padding: 15px;
            border-radius: 5px;
            margin-bottom: 20px;
            text-align: center;
            font-weight: bold;
        }
        
        .rules-container {
            position: fixed;
            right: 20px;
            top: 100px;
            width: 250px;
            background-color: white;
            padding: 15px;
            border-radius: 5px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
            z-index: 100;
        }
        
        .rules-container h3 {
            color: var(--primary-color);
            margin-bottom: 10px;
            text-align: center;
        }
        
        .rules-container p {
            margin-bottom: 15px;
        }
        
        .rules-container .icon {
            color: var(--warning-color);
            margin-right: 5px;
        }
        
        @media (max-width: 768px) {
            .rules-container {
                position: static;
                width: 100%;
                margin-bottom: 20px;
            }
        }
        
        footer {
            background-color: var(--dark-color);
            color: white;
            text-align: center;
            padding: 1rem;
            margin-top: auto;
        }
        
        .back-btn {
            display: block;
            margin: 20px auto;
            padding: 10px 20px;
            background-color: var(--dark-color);
            color: white;
            border: none;
            border-radius: 5px;
            cursor: pointer;
            font-size: 16px;
            transition: background-color 0.3s;
            text-align: center;
            text-decoration: none;
            width: fit-content;
        }
        
        .back-btn:hover {
            background-color: #1a252f;
        }
        
        /* Estilos para seletor de dificuldade */
        .difficulty-selector {
            margin: 20px 0;
            padding: 15px;
            background-color: #f8f9fa;
            border-radius: 8px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        
        .difficulty-selector h4 {
            margin-bottom: 10px;
            color: var(--dark-color);
        }
        
        .difficulty-options {
            display: flex;
            flex-wrap: wrap;
            gap: 10px;
        }
        
        .difficulty-option {
            display: flex;
            align-items: center;
            cursor: pointer;
            padding: 8px 15px;
            border-radius: 20px;
            background-color: #e9ecef;
            transition: all 0.3s ease;
        }
        
        .difficulty-option:hover {
            background-color: #dee2e6;
        }
        
        .difficulty-option input {
            margin-right: 8px;
        }
        
        .difficulty-option span {
            font-weight: 500;
        }
        
        /* Cores específicas para cada nível de dificuldade */
        #difficultyEasy:checked + span {
            color: #28a745;
        }
        
        #difficultyMedium:checked + span {
            color: #ffc107;
        }
        
        #difficultyHard:checked + span {
            color: #fd7e14;
        }
        
        #difficultyImpossible:checked + span {
            color: #dc3545;
        }
        
        /* Indicador de "pensamento" da IA */
        .ai-thinking {
            margin-top: 20px;
            padding: 15px;
            background-color: #e8f4f8;
            border-radius: 8px;
            display: flex;
            align-items: center;
            justify-content: center;
            flex-direction: column;
        }
        
        .thinking-indicator {
            display: flex;
            gap: 8px;
            margin-bottom: 10px;
        }
        
        .dot {
            width: 12px;
            height: 12px;
            background-color: var(--primary-color);
            border-radius: 50%;
            animation: pulse 1.5s infinite ease-in-out;
        }
        
        .dot:nth-child(2) {
            animation-delay: 0.5s;
        }
        
        .dot:nth-child(3) {
            animation-delay: 1s;
        }
        
        @keyframes pulse {
            0%, 100% {
                transform: scale(0.8);
                opacity: 0.5;
            }
            50% {
                transform: scale(1.2);
                opacity: 1;
            }
        }
    </style>
</head>
<body>
    <header>
        <h1>Aprenda Xadrez - Desafio Impossível</h1>
        <p>Aprenda a jogar e teste suas habilidades contra a IA!</p>
    </header>
    
    <div class="container">
        <?php if (!empty($mensagemLimite)): ?>
            <div class="limit-message">
                <i class="fas fa-clock"></i> <?php echo $mensagemLimite; ?>
            </div>
        <?php endif; ?>
        
        <div class="tabs">
            <button class="tab active" onclick="openTab(event, 'tutorial')">Tutorial</button>
            <button class="tab" onclick="openTab(event, 'game')">Jogar</button>
        </div>
        
        <div id="tutorial" class="tab-content active">
            <div class="tutorial-step">
                <h3>Bem-vindo ao Xadrez!</h3>
                <p>O xadrez é um jogo de estratégia para dois jogadores. O objetivo é dar "xeque-mate" no rei adversário, o que significa que o rei está ameaçado e não tem como escapar.</p>
                <p>Vamos aprender sobre as peças e como elas se movem!</p>
            </div>
            
            <div class="tutorial-step">
                <h3>O Tabuleiro</h3>
                <p>O tabuleiro de xadrez tem 64 casas (8x8), alternando entre cores claras e escuras. As peças são posicionadas sempre da mesma forma no início do jogo.</p>
                <div id="board-intro" style="width: 400px; margin: 0 auto;"></div>
            </div>
            
            <div class="tutorial-step">
                <h3>As Peças</h3>
                
                <div class="piece-info">
                    <img src="https://images.chesscomfiles.com/chess-themes/pieces/neo/150/wp.png" alt="Peão" class="piece-image">
                    <div class="piece-description">
                        <h4>Peão</h4>
                        <p>Move-se uma casa para frente. No primeiro movimento, pode avançar duas casas. Captura peças na diagonal. Quando chega ao outro lado do tabuleiro, pode ser promovido a qualquer outra peça (exceto o rei).</p>
                    </div>
                </div>
                
                <div class="piece-info">
                    <img src="https://images.chesscomfiles.com/chess-themes/pieces/neo/150/wr.png" alt="Torre" class="piece-image">
                    <div class="piece-description">
                        <h4>Torre</h4>
                        <p>Move-se em linha reta horizontalmente ou verticalmente, quantas casas quiser.</p>
                    </div>
                </div>
                
                <div class="piece-info">
                    <img src="https://images.chesscomfiles.com/chess-themes/pieces/neo/150/wn.png" alt="Cavalo" class="piece-image">
                    <div class="piece-description">
                        <h4>Cavalo</h4>
                        <p>Move-se em forma de "L": duas casas em uma direção e depois uma casa em ângulo reto. É a única peça que pode pular sobre outras peças.</p>
                    </div>
                </div>
                
                <div class="piece-info">
                    <img src="https://images.chesscomfiles.com/chess-themes/pieces/neo/150/wb.png" alt="Bispo" class="piece-image">
                    <div class="piece-description">
                        <h4>Bispo</h4>
                        <p>Move-se na diagonal, quantas casas quiser.</p>
                    </div>
                </div>
                
                <div class="piece-info">
                    <img src="https://images.chesscomfiles.com/chess-themes/pieces/neo/150/wq.png" alt="Rainha" class="piece-image">
                    <div class="piece-description">
                        <h4>Rainha</h4>
                        <p>A peça mais poderosa. Combina os movimentos da torre e do bispo: pode mover-se em linha reta ou na diagonal, quantas casas quiser.</p>
                    </div>
                </div>
                
                <div class="piece-info">
                    <img src="https://images.chesscomfiles.com/chess-themes/pieces/neo/150/wk.png" alt="Rei" class="piece-image">
                    <div class="piece-description">
                        <h4>Rei</h4>
                        <p>Move-se uma casa em qualquer direção. É a peça mais importante - se for capturado (xeque-mate), o jogo termina.</p>
                    </div>
                </div>
            </div>
            
            <div class="tutorial-step">
                <h3>Regras Básicas</h3>
                <ul>
                    <li>As peças brancas sempre começam.</li>
                    <li>Jogadores se alternam, movendo uma peça por vez.</li>
                    <li>Não é permitido mover uma peça para uma casa ocupada por uma peça da mesma cor.</li>
                    <li>Quando uma peça é movida para uma casa ocupada por uma peça adversária, a peça adversária é capturada e removida do tabuleiro.</li>
                    <li>O objetivo é dar xeque-mate no rei adversário.</li>
                </ul>
            </div>
            
            <div class="tutorial-step">
                <h3>Termos Importantes</h3>
                <ul>
                    <li><strong>Xeque:</strong> Quando o rei está ameaçado por uma peça adversária. O jogador deve mover o rei, capturar a peça ameaçadora ou bloquear o ataque.</li>
                    <li><strong>Xeque-mate:</strong> Quando o rei está em xeque e não há movimento legal para escapar. O jogo termina.</li>
                    <li><strong>Roque:</strong> Um movimento especial que envolve o rei e uma torre, usado para proteger o rei e ativar a torre.</li>
                    <li><strong>En passant:</strong> Uma captura especial de peão que só pode ocorrer imediatamente após um peão adversário avançar duas casas.</li>
                </ul>
            </div>
            
            <div class="tutorial-step">
                <h3>Pronto para jogar?</h3>
                <p>Agora que você conhece as regras básicas, está pronto para tentar jogar contra a IA!</p>
                <button class="btn" onclick="openTab(null, 'game')">Ir para o jogo</button>
            </div>
        </div>
        
        <div id="game" class="tab-content">
            <div class="rules-container">
                <h3>Regras Especiais</h3>
                <p><i class="fas fa-trophy icon"></i> Se você vencer a IA, ganhará uso livre do celular por 1 dia!</p>
                <p><i class="fas fa-exclamation-triangle icon"></i> Se perder, terá que voltar aos estudos imediatamente.</p>
                <p><i class="fas fa-clock icon"></i> Você só pode jogar uma vez por dia.</p>
            </div>
            
            <div id="chessboard"></div>
            
            <div class="game-info">
                <div class="status" id="status">Carregando jogo...</div>
                <div class="message info" id="message">As peças brancas são suas. Faça o primeiro movimento!</div>
                
                <div class="difficulty-selector">
                    <div class="difficulty-options">
                        <label class="difficulty-option">
                            <input type="radio" name="difficulty" value="hard" id="difficultyHard" checked>
                            <span>Difícil</span>
                        </label>
                        <label class="difficulty-option">
                            <input type="radio" name="difficulty" value="impossible" id="difficultyImpossible">
                            <span>Impossível</span>
                        </label>
                    </div>
                </div>
                
                <div class="controls">
                    <button class="btn" id="startBtn" <?php echo !$podeJogar ? 'disabled' : ''; ?>>Iniciar Novo Jogo</button>
                    <button class="btn secondary" id="undoBtn" disabled>Desfazer Jogada</button>
                    <button class="btn danger" id="resignBtn" disabled>Desistir</button>
                </div>
                
                <div class="ai-thinking" id="aiThinking" style="display: none;">
                    <div class="thinking-indicator">
                        <div class="dot"></div>
                        <div class="dot"></div>
                        <div class="dot"></div>
                    </div>
                    <p>A IA está calculando o melhor movimento...</p>
                </div>
            </div>
        </div>
        
        <a href="index.html" class="back-btn"><i class="fas fa-arrow-left"></i> Voltar aos Estudos</a>
    </div>
    
    <footer>
        <p>&copy; 2025 Desafio de Matemática - Todos os direitos reservados</p>
    </footer>

    <!-- Scripts necessários para o jogo de xadrez -->
    <script src="https://code.jquery.com/jquery-3.6.0.min.js"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/chess.js/0.10.3/chess.min.js"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/chessboard-js/1.0.0/chessboard-1.0.0.min.js"></script>
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/chessboard-js/1.0.0/chessboard-1.0.0.min.css" />
    
    <!-- Variável para passar o ID do jogador para o JavaScript -->
    <script>
        const jogadorId = '<?php echo $jogadorId; ?>';
        const canPlayToday = <?php echo $podeJogar ? 'true' : 'false'; ?>;
    </script>
    
    <!-- Nosso código JavaScript -->
    <script src="js/xadrez.js"></script>
    
    <!-- Script para controle das abas -->
    <script>
        function openTab(evt, tabName) {
            var i, tabContent, tabLinks;
            
            // Esconde todos os conteúdos das abas
            tabContent = document.getElementsByClassName("tab-content");
            for (i = 0; i < tabContent.length; i++) {
                tabContent[i].classList.remove("active");
            }
            
            // Remove a classe "active" de todos os botões
            tabLinks = document.getElementsByClassName("tab");
            for (i = 0; i < tabLinks.length; i++) {
                tabLinks[i].classList.remove("active");
            }
            
            // Mostra o conteúdo da aba atual e adiciona a classe "active" ao botão
            document.getElementById(tabName).classList.add("active");
            if (evt) {
                evt.currentTarget.classList.add("active");
            } else {
                // Se não houver evento (chamada direta da função), encontre o botão correto
                for (i = 0; i < tabLinks.length; i++) {
                    if (tabLinks[i].textContent.toLowerCase().includes(tabName.toLowerCase())) {
                        tabLinks[i].classList.add("active");
                    }
                }
            }
        }
    </script>
</body>
</html>
