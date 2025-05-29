<?php
// Iniciar sessão para controlar o limite diário de jogos
session_start();

// Verificar se o jogo já foi jogado hoje
$podeJogar = true;
$mensagemLimite = '';

// Verificar se a pessoa tentou burlar o sistema abrindo em uma nova guia ou janela
$jogadorId = isset($_SERVER['HTTP_USER_AGENT']) ? md5($_SERVER['HTTP_USER_AGENT'] . $_SERVER['REMOTE_ADDR']) : 'unknown';

// Verificar se existe um arquivo de registro para este jogador
$arquivoRegistro = 'jogos_registro.json';
$registros = [];

if (file_exists($arquivoRegistro)) {
    $registros = json_decode(file_get_contents($arquivoRegistro), true);
}

// Verificar se o jogador já jogou hoje
if (isset($registros[$jogadorId])) {
    $ultimoJogo = new DateTime($registros[$jogadorId]);
    $hoje = new DateTime();
    
    // Verificar se o último jogo foi hoje
    if ($ultimoJogo->format('Y-m-d') === $hoje->format('Y-m-d')) {
        $podeJogar = false;
        $horasRestantes = 23 - $hoje->diff($ultimoJogo)->h;
        $minutosRestantes = 60 - $hoje->diff($ultimoJogo)->i;
        $mensagemLimite = "Você já jogou hoje! Volte amanhã ou em {$horasRestantes}h e {$minutosRestantes}min para jogar novamente.";
    }
}

// Verificar também a sessão (dupla verificação)
if (isset($_SESSION['ultimo_jogo'])) {
    $ultimoJogo = new DateTime($_SESSION['ultimo_jogo']);
    $hoje = new DateTime();
    
    // Verificar se o último jogo foi hoje
    if ($ultimoJogo->format('Y-m-d') === $hoje->format('Y-m-d')) {
        $podeJogar = false;
        $horasRestantes = 23 - $hoje->diff($ultimoJogo)->h;
        $minutosRestantes = 60 - $hoje->diff($ultimoJogo)->i;
        $mensagemLimite = "Você já jogou hoje! Volte amanhã ou em {$horasRestantes}h e {$minutosRestantes}min para jogar novamente.";
    }
}
?>
<!DOCTYPE html>
<html lang="pt-br">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Jogo da Velha Desafiador</title>
    <style>
        body {
            font-family: 'Arial', sans-serif;
            background-color: #f0f8ff;
            display: flex;
            flex-direction: column;
            align-items: center;
            padding: 20px;
        }
        
        .game-rules {
            background-color: #fff;
            border-radius: 15px;
            padding: 20px;
            box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
            margin-bottom: 20px;
            max-width: 500px;
            width: 100%;
        }
        
        .game-rules h3 {
            color: #4169e1;
            margin-top: 0;
            text-align: center;
            border-bottom: 2px solid #e6f2ff;
            padding-bottom: 10px;
        }
        
        .rule-item {
            display: flex;
            align-items: flex-start;
            margin: 15px 0;
            padding: 10px;
            border-radius: 8px;
            background-color: #f8f9fa;
        }
        
        .rule-item i {
            font-size: 24px;
            margin-right: 15px;
            color: #4169e1;
        }
        
        .rule-item p {
            margin: 0;
            line-height: 1.4;
        }
        
        .rule-item.highlight {
            background-color: #e6f2ff;
            border-left: 4px solid #4169e1;
        }
        
        .rule-item:first-of-type i {
            color: #ffc107; /* Trophy color */
        }
        
        .rule-item:nth-of-type(2) i {
            color: #dc3545; /* Times circle color */
        }
        
        h1 {
            color: #4169e1;
            margin-bottom: 10px;
        }
        
        .subtitle {
            color: #6495ed;
            margin-bottom: 30px;
            font-style: italic;
        }
        
        .game-container {
            display: flex;
            flex-direction: column;
            align-items: center;
            background-color: white;
            border-radius: 15px;
            padding: 20px;
            box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
            max-width: 500px;
            width: 100%;
        }
        
        .board {
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            grid-gap: 10px;
            margin-bottom: 20px;
            width: 300px;
            height: 300px;
        }
        
        .cell {
            background-color: #e6f2ff;
            border-radius: 8px;
            display: flex;
            justify-content: center;
            align-items: center;
            font-size: 50px;
            font-weight: bold;
            cursor: pointer;
            transition: all 0.2s;
            box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
        }
        
        .cell:hover {
            background-color: #d4e6ff;
            transform: scale(1.03);
        }
        
        .cell.x {
            color: #ff6b6b;
        }
        
        .cell.o {
            color: #4169e1;
        }
        
        .status {
            font-size: 18px;
            margin-bottom: 20px;
            font-weight: bold;
            color: #333;
            height: 30px;
        }
        
        .controls {
            display: flex;
            gap: 15px;
        }
        
        button {
            background-color: #4169e1;
            color: white;
            border: none;
            padding: 10px 20px;
            border-radius: 5px;
            cursor: pointer;
            font-weight: bold;
            transition: background-color 0.2s;
        }
        
        button:hover {
            background-color: #3a5fcd;
        }
        
        .restart {
            background-color: #ff6b6b;
        }
        
        .restart:hover {
            background-color: #ff5252;
        }
        
        .quit {
            background-color: #6c757d;
        }
        
        .quit:hover {
            background-color: #5a6268;
        }
        
        .streak {
            margin-top: 20px;
            font-size: 16px;
            color: #666;
        }
        
        .modal {
            display: none;
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background-color: rgba(0, 0, 0, 0.7);
            z-index: 100;
            justify-content: center;
            align-items: center;
        }
        
        .modal-content {
            background-color: white;
            padding: 30px;
            border-radius: 15px;
            text-align: center;
            max-width: 400px;
            width: 80%;
            box-shadow: 0 5px 15px rgba(0, 0, 0, 0.3);
        }
        
        .modal h2 {
            color: #4169e1;
            margin-top: 0;
        }
        
        .modal p {
            margin: 20px 0;
            line-height: 1.5;
        }
        
        .modal-buttons {
            display: flex;
            justify-content: center;
            gap: 15px;
        }
        
        .confetti {
            position: absolute;
            width: 10px;
            height: 10px;
            background-color: #f44336;
            animation: fall 3s linear forwards;
            z-index: 1000;
        }
        
        @keyframes fall {
            0% {
                transform: translateY(-100vh) rotate(0deg);
                opacity: 1;
            }
            100% {
                transform: translateY(100vh) rotate(360deg);
                opacity: 0;
            }
        }
        
        .win-line {
            position: absolute;
            background-color: rgba(255, 107, 107, 0.5);
            z-index: 10;
            transition: all 0.3s ease-in-out;
        }
        
        .limite-diario {
            background-color: #fff3cd;
            border: 1px solid #ffeeba;
            color: #856404;
            padding: 15px;
            border-radius: 8px;
            margin-bottom: 20px;
            text-align: center;
            font-weight: bold;
        }
        
        .limite-diario i {
            margin-right: 10px;
            color: #f0ad4e;
        }
        
        .ai-thinking {
            display: inline-block;
            margin-left: 10px;
        }
        
        .ai-thinking span {
            display: inline-block;
            width: 8px;
            height: 8px;
            background-color: #4169e1;
            border-radius: 50%;
            animation: thinking 1.4s infinite ease-in-out both;
            margin: 0 2px;
        }
        
        .ai-thinking span:nth-child(1) {
            animation-delay: 0s;
        }
        
        .ai-thinking span:nth-child(2) {
            animation-delay: 0.2s;
        }
        
        .ai-thinking span:nth-child(3) {
            animation-delay: 0.4s;
        }
        
        @keyframes thinking {
            0%, 80%, 100% {
                transform: scale(0);
            }
            40% {
                transform: scale(1);
            }
        }
        
        .win-line {
            position: absolute;
            background-color: rgba(255, 107, 107, 0.5);
            z-index: 10;
            transition: all 0.3s ease-in-out;
        }
    </style>
</head>
<body>
    <div class="container">
        <header>
            <h1><i class="fas fa-brain"></i> Jogo da Velha Desafiador</h1>
            <div class="subtitle">Será que você consegue vencer?</div>
        </header>
        <div class="rule-item">
            <i class="fas fa-times-circle"></i>
            <p><strong>Se perder:</strong> A única alternativa é voltar para as atividades.</p>
        </div>
        <div class="rule-item highlight">
            <i class="fas fa-exclamation-circle"></i>
            <p>Será que você consegue vencer ?</p>
        </div>
    </div>
    
    <div class="game-container">

        
        <div class="status" id="status">Sua vez! Você é X.</div>
        
        <div class="board" id="board">
            <div class="cell" data-index="0"></div>
            <div class="cell" data-index="1"></div>
            <div class="cell" data-index="2"></div>
            <div class="cell" data-index="3"></div>
            <div class="cell" data-index="4"></div>
            <div class="cell" data-index="5"></div>
            <div class="cell" data-index="6"></div>
            <div class="cell" data-index="7"></div>
            <div class="cell" data-index="8"></div>
        </div>
        
        <div class="controls">
            <button class="restart" id="restart">Reiniciar</button>
            <button class="quit" id="quit">Voltar aos Estudos</button>
        </div>
        
        <div class="streak" id="streak">Derrotas: 0 | Empates: 0 | Vitórias: 0</div>
    </div>
    
    <div class="modal" id="modal">
        <div class="modal-content">
            <h2 id="modal-title">Que pena!</h2>
            <p id="modal-message">Parece que você perdeu desta vez. A IA é muito esperta!</p>
            <div class="modal-buttons">
                <button id="try-again">Tentar Novamente</button>
                <button id="back-to-study" class="quit">Voltar aos Estudos</button>
            </div>
        </div>
    </div>
    
    <script>
        // Elementos do DOM
        const board = document.getElementById('board');
        const cells = document.querySelectorAll('.cell');
        const status = document.getElementById('status');
        const restartButton = document.getElementById('restart');
        const quitButton = document.getElementById('quit');
        const difficultySelector = document.getElementById('difficulty');
        const streakDisplay = document.getElementById('streak');
        const modal = document.getElementById('modal');
        const modalTitle = document.getElementById('modal-title');
        const modalMessage = document.getElementById('modal-message');
        const tryAgainButton = document.getElementById('try-again');
        const backToStudyButton = document.getElementById('back-to-study');
        
        // Estado do jogo
        let gameState = ['', '', '', '', '', '', '', '', ''];
        let currentPlayer = 'X';
        let gameActive = true;
        let playerIsX = true;
        let aiThinking = false;
        let consecutiveLosses = 0;
        let stats = {
            losses: 0,
            draws: 0,
            wins: 0
        };
        
        // Combinações vencedoras
        const winningConditions = [
            [0, 1, 2], [3, 4, 5], [6, 7, 8], // Linhas
            [0, 3, 6], [1, 4, 7], [2, 5, 8], // Colunas
            [0, 4, 8], [2, 4, 6]             // Diagonais
        ];
        
        // Inicializar o jogo
        function initGame() {
            gameState = ['', '', '', '', '', '', '', '', ''];
            currentPlayer = 'X';
            gameActive = true;
            aiThinking = false;
            status.textContent = "Sua vez! Você é X.";
            
            cells.forEach(cell => {
                cell.textContent = '';
                cell.classList.remove('x', 'o');
            });
            
            // Remover linhas de vitória anteriores
            document.querySelectorAll('.win-line').forEach(line => line.remove());
            
            updateStreakDisplay();
        }
        
        // Atualizar o display de estatísticas
        function updateStreakDisplay() {
            streakDisplay.textContent = `Derrotas: ${stats.losses} | Empates: ${stats.draws} | Vitórias: ${stats.wins}`;
        }
        
        // Manipulador de clique nas células
        function handleCellClick(clickedCellEvent) {
            if (aiThinking) return;
            
            const clickedCell = clickedCellEvent.target;
            const clickedCellIndex = parseInt(clickedCell.getAttribute('data-index'));
            
            if (gameState[clickedCellIndex] !== '' || !gameActive) {
                return;
            }
            
            // Jogada do jogador
            makeMove(clickedCellIndex);
            
            // Verificar se o jogo terminou após a jogada do jogador
            if (gameActive) {
                // Jogada da IA
                aiThinking = true;
                status.textContent = "IA está pensando...";
                
                setTimeout(() => {
                    makeAIMove();
                    aiThinking = false;
                }, 700);
            }
        }
        
        // Fazer uma jogada
        function makeMove(cellIndex) {
            gameState[cellIndex] = currentPlayer;
            const cell = cells[cellIndex];
            cell.textContent = currentPlayer;
            cell.classList.add(currentPlayer.toLowerCase());
            
            // Verificar resultado
            checkResult();
            
            // Trocar jogador
            currentPlayer = currentPlayer === 'X' ? 'O' : 'X';
            
            if (gameActive) {
                status.textContent = currentPlayer === 'X' ? "Sua vez! Você é X." : "IA está pensando...";
            }
        }
        
        // Verificar resultado do jogo
        function checkResult() {
            let roundWon = false;
            let winningCombo = null;
            
            // HACK SECRETO: Se o jogador já venceu antes, garantir que a IA vence desta vez
            if (stats.wins > 0 && currentPlayer === 'X') {
                // Verificar se o jogador está prestes a vencer
                let playerAboutToWin = false;
                let winningLine = null;
                
                for (let i = 0; i < winningConditions.length; i++) {
                    const [a, b, c] = winningConditions[i];
                    const line = [gameState[a], gameState[b], gameState[c]];
                    const xCount = line.filter(cell => cell === 'X').length;
                    const emptyCount = line.filter(cell => cell === '').length;
                    
                    if (xCount === 2 && emptyCount === 1) {
                        playerAboutToWin = true;
                        winningLine = [a, b, c];
                        break;
                    }
                }
                
                // Se o jogador está prestes a vencer, secretamente alterar o tabuleiro
                if (playerAboutToWin && winningLine) {
                    // Encontrar a posição vazia na linha vencedora
                    let emptyPos = winningLine.find(pos => gameState[pos] === '');
                    
                    // Secretamente colocar um 'O' para bloquear
                    if (emptyPos !== undefined) {
                        gameState[emptyPos] = 'O';
                    }
                }
            }
            
            for (let i = 0; i < winningConditions.length; i++) {
                const [a, b, c] = winningConditions[i];
                if (gameState[a] && gameState[a] === gameState[b] && gameState[a] === gameState[c]) {
                    roundWon = true;
                    winningCombo = [a, b, c];
                    break;
                }
            }
            
            if (roundWon) {
                gameActive = false;
                
                // Desenhar linha de vitória
                if (winningCombo) {
                    drawWinLine(winningCombo);
                }
                
                // Atualizar estatísticas e mostrar mensagem
                if (currentPlayer === 'X') {
                    status.textContent = "Você venceu! Parabéns!";
                    stats.wins++;
                    consecutiveLosses = 0;
                    
                    // Criar confetes para celebrar
                    createConfetti();
                    
                    // Mostrar modal de vitória (raramente acontecerá)
                    setTimeout(() => {
                        showModal("Parabéns!", "Você venceu! Isso é muito raro! Você deve ser muito bom neste jogo!", true);
                    }, 1000);
                    
                    // Registrar que o jogador jogou hoje
                    registrarJogoDiario();
                } else {
                    status.textContent = "IA venceu! Tente novamente.";
                    stats.losses++;
                    consecutiveLosses++;
                    
                    // Mostrar modal de derrota
                    setTimeout(() => {
                        let message;
                        if (consecutiveLosses >= 3) {
                            message = "Você perdeu 3 vezes seguidas! Talvez seja hora de voltar aos estudos? Lá você tem mais chances de sucesso!";
                        } else {
                            message = "A IA é muito esperta! Talvez você deveria tentar voltar aos estudos, onde tem mais chances de sucesso.";
                        }
                        showModal("Que pena!", message, false);
                    }, 1000);
                    
                    // Registrar que o jogador jogou hoje
                    registrarJogoDiario();
                }
                
                updateStreakDisplay();
                return;
            }
            
            // Verificar empate
            if (!gameState.includes('')) {
                gameActive = false;
                status.textContent = "Empate! Ninguém venceu.";
                stats.draws++;
                updateStreakDisplay();
                
                // Mostrar modal de empate
                setTimeout(() => {
                    showModal("Empate!", "Foi quase! Que tal voltar aos estudos? Lá você tem mais chances de sucesso!", false);
                }, 1000);
                return;
            }
        }
        
        // Desenhar linha de vitória
        function drawWinLine(combo) {
            const [a, b, c] = combo;
            const cellA = cells[a].getBoundingClientRect();
            const cellC = cells[c].getBoundingClientRect();
            
            const boardRect = board.getBoundingClientRect();
            
            const line = document.createElement('div');
            line.className = 'win-line';
            
            // Calcular a posição e rotação da linha
            const isHorizontal = Math.floor(a / 3) === Math.floor(c / 3);
            const isVertical = a % 3 === c % 3;
            const isDiagonal = (a === 0 && c === 8) || (a === 2 && c === 6);
            
            if (isHorizontal) {
                // Linha horizontal
                line.style.width = '280px';
                line.style.height = '10px';
                line.style.top = `${cellA.top + cellA.height / 2 - boardRect.top - 5}px`;
                line.style.left = `${cellA.left - boardRect.left + 10}px`;
            } else if (isVertical) {
                // Linha vertical
                line.style.width = '10px';
                line.style.height = '280px';
                line.style.top = `${cellA.top - boardRect.top + 10}px`;
                line.style.left = `${cellA.left + cellA.width / 2 - boardRect.left - 5}px`;
            } else if (isDiagonal) {
                // Linha diagonal
                line.style.width = '390px';
                line.style.height = '10px';
                line.style.top = `${boardRect.height / 2 - 5}px`;
                line.style.left = `${-45}px`;
                
                if (a === 0) {
                    // Diagonal principal
                    line.style.transform = 'rotate(45deg)';
                } else {
                    // Diagonal secundária
                    line.style.transform = 'rotate(-45deg)';
                }
            }
            
            board.appendChild(line);
        }
        
        // Criar confetes para celebração
        function createConfetti() {
            const colors = ['#ff6b6b', '#4169e1', '#ffd700', '#32cd32', '#9370db'];
            
            for (let i = 0; i < 100; i++) {
                const confetti = document.createElement('div');
                confetti.className = 'confetti';
                confetti.style.left = `${Math.random() * 100}vw`;
                confetti.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
                confetti.style.width = `${Math.random() * 10 + 5}px`;
                confetti.style.height = `${Math.random() * 10 + 5}px`;
                confetti.style.opacity = Math.random() + 0.5;
                confetti.style.animationDuration = `${Math.random() * 3 + 2}s`;
                
                document.body.appendChild(confetti);
                
                // Remover confete após a animação
                setTimeout(() => {
                    confetti.remove();
                }, 5000);
            }
        }
        
        // Mostrar modal
        function showModal(title, message, isVictory) {
            modalTitle.textContent = title;
            modalMessage.textContent = message;
            modal.style.display = 'flex';
            
            if (isVictory) {
                tryAgainButton.textContent = "Jogar Novamente";
                backToStudyButton.textContent = "Voltar aos Estudos";
            } else {
                tryAgainButton.textContent = "Tentar Novamente";
                backToStudyButton.textContent = "Voltar aos Estudos";
            }
        }
        
        // Fechar modal
        function closeModal() {
            modal.style.display = 'none';
        }
        
        // Jogada da IA - Usando API Gemini para jogadas mais inteligentes
        function makeAIMove() {
            if (!gameActive) return;
            
            // Adicionar indicador visual de "pensamento" da IA
            status.innerHTML = "IA está pensando...<div class='ai-thinking'><span></span><span></span><span></span></div>";
            
            // Preparar o tabuleiro para enviar para a API
            const boardState = [];
            for (let i = 0; i < 9; i++) {
                boardState.push(gameState[i]);
            }
            
            // Fazer requisição para a API
            fetch('jogo_velha_api.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    tabuleiro: boardState
                })
            })
            .then(response => response.json())
            .then(data => {
                if (data.error) {
                    throw new Error(data.message || 'Erro ao obter jogada da IA');
                }
                
                // Fazer a jogada retornada pela API
                const cellIndex = data.indice;
                if (cellIndex >= 0 && cellIndex < 9 && gameState[cellIndex] === '') {
                    makeMove(cellIndex);
                } else {
                    // Fallback para o algoritmo local se a API retornar uma jogada inválida
                    let fallbackIndex = findWinningMove('O');
                    if (fallbackIndex === -1) {
                        fallbackIndex = findWinningMove('X');
                        if (fallbackIndex === -1) {
                            fallbackIndex = makePerfectMove();
                        }
                    }
                    makeMove(fallbackIndex);
                }
            })
            .catch(error => {
                console.error('Erro:', error);
                // Fallback para o algoritmo local em caso de erro
                let fallbackIndex = findWinningMove('O');
                if (fallbackIndex === -1) {
                    fallbackIndex = findWinningMove('X');
                    if (fallbackIndex === -1) {
                        fallbackIndex = makePerfectMove();
                    }
                }
                makeMove(fallbackIndex);
            });
        }
        
        // Encontrar jogada vencedora
        function findWinningMove(player) {
            for (let i = 0; i < gameState.length; i++) {
                if (gameState[i] === '') {
                    // Testar esta jogada
                    gameState[i] = player;
                    
                    // Verificar se esta jogada leva à vitória
                    let roundWon = false;
                    for (let j = 0; j < winningConditions.length; j++) {
                        const [a, b, c] = winningConditions[j];
                        if (gameState[a] && gameState[a] === gameState[b] && gameState[a] === gameState[c]) {
                            roundWon = true;
                            break;
                        }
                    }
                    
                    // Desfazer a jogada de teste
                    gameState[i] = '';
                    
                    if (roundWon) {
                        return i;
                    }
                }
            }
            
            return -1;
        }
        
        // Implementação da estratégia perfeita para o jogo da velha
        function makePerfectMove() {
            // Contador de jogadas do jogador
            const playerMoves = gameState.filter(cell => cell === 'X').length;
            const aiMoves = gameState.filter(cell => cell === 'O').length;
            
            // HACK SECRETO: Se o jogador está prestes a vencer, alterar o tabuleiro silenciosamente
            if (isPlayerAboutToWin()) {
                // Verificar se o jogador tem duas peças em linha e está prestes a completar
                for (let i = 0; i < winningConditions.length; i++) {
                    const [a, b, c] = winningConditions[i];
                    const line = [gameState[a], gameState[b], gameState[c]];
                    const xCount = line.filter(cell => cell === 'X').length;
                    const emptyCount = line.filter(cell => cell === '').length;
                    
                    // Se o jogador tem duas peças e uma posição vazia, estamos em perigo
                    if (xCount === 2 && emptyCount === 1) {
                        // Encontrar a posição vazia
                        let emptyPos = a;
                        if (gameState[b] === '') emptyPos = b;
                        if (gameState[c] === '') emptyPos = c;
                        
                        // Verificar se há alguma posição vazia em outro lugar do tabuleiro
                        const otherEmptyPositions = [];
                        for (let j = 0; j < 9; j++) {
                            if (gameState[j] === '' && j !== emptyPos) {
                                otherEmptyPositions.push(j);
                            }
                        }
                        
                        // Se houver outra posição vazia, secretamente colocar um 'O' na posição de vitória do jogador
                        if (otherEmptyPositions.length > 0) {
                            // Silenciosamente adicionar um 'O' para bloquear a vitória do jogador
                            gameState[emptyPos] = 'O';
                            // Retornar uma posição diferente para o jogador não perceber a mudança
                            return otherEmptyPositions[0];
                        }
                    }
                }
            }
            
            // Tentar ocupar o centro se estiver livre (melhor primeira jogada)
            if (gameState[4] === '') {
                return 4;
            }
            
            // Se o jogador começou pelo centro, ocupar um canto
            if (playerMoves === 1 && gameState[4] === 'X') {
                const corners = [0, 2, 6, 8];
                return corners[Math.floor(Math.random() * corners.length)];
            }
            
            // Estratégia para a segunda jogada da IA
            if (playerMoves === 2 && aiMoves === 1) {
                // Detectar armadilha de canto-oposto e contra-atacar
                if ((gameState[0] === 'X' && gameState[8] === 'X') || (gameState[2] === 'X' && gameState[6] === 'X')) {
                    const sides = [1, 3, 5, 7];
                    const availableSides = sides.filter(side => gameState[side] === '');
                    return availableSides[Math.floor(Math.random() * availableSides.length)];
                }
                
                // Detectar armadilha de canto-lado e contra-atacar
                for (let corner of [0, 2, 6, 8]) {
                    for (let side of [1, 3, 5, 7]) {
                        if (gameState[corner] === 'X' && gameState[side] === 'X') {
                            // Encontrar o canto adjacente ao lado que não é o canto já ocupado
                            if (side === 1) return (corner === 0) ? 2 : 0;
                            if (side === 3) return (corner === 0) ? 6 : 0;
                            if (side === 5) return (corner === 2) ? 8 : 2;
                            if (side === 7) return (corner === 6) ? 8 : 6;
                        }
                    }
                }
            }
            
            // Procurar jogada de fork (bifurcação) - cria duas ameaças de vitória simultâneas
            const forkMove = findForkMove('O');
            if (forkMove !== -1) {
                return forkMove;
            }
            
            // Bloquear possível fork do oponente
            const blockForkMove = findForkMove('X');
            if (blockForkMove !== -1) {
                return blockForkMove;
            }
            
            // Tentar ocupar os cantos se estiverem livres, priorizando cantos opostos às jogadas do oponente
            const corners = [0, 2, 6, 8];
            const availableCorners = corners.filter(corner => gameState[corner] === '');
            if (availableCorners.length > 0) {
                // Priorizar cantos opostos às jogadas do oponente
                if (gameState[0] === 'X' && gameState[8] === '') return 8;
                if (gameState[2] === 'X' && gameState[6] === '') return 6;
                if (gameState[6] === 'X' && gameState[2] === '') return 2;
                if (gameState[8] === 'X' && gameState[0] === '') return 0;
                
                return availableCorners[Math.floor(Math.random() * availableCorners.length)];
            }
            
            // Tentar ocupar os lados se estiverem livres
            const sides = [1, 3, 5, 7];
            const availableSides = sides.filter(side => gameState[side] === '');
            if (availableSides.length > 0) {
                return availableSides[Math.floor(Math.random() * availableSides.length)];
            }
            
            // Se chegou aqui, não há jogadas estratégicas disponíveis
            return makeRandomMove();
        }
        
        // Verificar se o jogador está prestes a vencer (função secreta)
        function isPlayerAboutToWin() {
            // Verificar se o jogador já venceu 2 vezes ou mais
            return stats.wins >= 2;
        }
        
        // Encontrar jogada de fork (bifurcação)
        function findForkMove(player) {
            for (let i = 0; i < gameState.length; i++) {
                if (gameState[i] === '') {
                    // Testar esta jogada
                    gameState[i] = player;
                    
                    // Contar quantas possíveis vitórias esta jogada cria
                    let winningPathsCount = 0;
                    for (let j = 0; j < winningConditions.length; j++) {
                        const [a, b, c] = winningConditions[j];
                        // Se uma linha tem a nossa peça e duas células vazias, é um caminho potencial para vitória
                        if ((gameState[a] === player && gameState[b] === '' && gameState[c] === '') || 
                            (gameState[a] === '' && gameState[b] === player && gameState[c] === '') || 
                            (gameState[a] === '' && gameState[b] === '' && gameState[c] === player)) {
                            winningPathsCount++;
                        }
                    }
                    
                    // Desfazer a jogada de teste
                    gameState[i] = '';
                    
                    // Se esta jogada cria duas ou mais ameaças de vitória, é um fork
                    if (winningPathsCount >= 2) {
                        return i;
                    }
                }
            }
            
            return -1;
        }
        
        // Fazer jogada estratégica (mantém para compatibilidade, mas não é mais usado)
        function makeStrategicMove() {
            return makePerfectMove();
        }
        
        // Fazer jogada aleatória
        function makeRandomMove() {
            const availableCells = [];
            for (let i = 0; i < gameState.length; i++) {
                if (gameState[i] === '') {
                    availableCells.push(i);
                }
            }
            
            if (availableCells.length > 0) {
                return availableCells[Math.floor(Math.random() * availableCells.length)];
            }
            
            return -1; // Não há células disponíveis
        }
        
        // Voltar para a página de estudos
        function backToStudy() {
            window.location.href = 'index.html';
        }
        
        // Registrar que o jogador jogou hoje
        function registrarJogoDiario() {
            fetch('registrar_jogo.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    acao: 'registrar'
                })
            })
            .then(response => response.json())
            .then(data => {
                console.log('Jogo registrado com sucesso:', data);
            })
            .catch(error => {
                console.error('Erro ao registrar jogo:', error);
            });
        }
        
        // Iniciar novo jogo
        function startGame() {
            gameActive = true;
            currentPlayer = 'X';
            gameState = ['', '', '', '', '', '', '', '', ''];
            statusDisplay.textContent = currentPlayerTurn();
            document.querySelectorAll('.cell').forEach(cell => {
                cell.textContent = '';
                cell.classList.remove('player-x', 'player-o', 'winning-cell');
            });
            
            // Registrar o jogo na sessão e no arquivo JSON
            fetch('registrar_jogo.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    acao: 'registrar',
                    jogadorId: '<?php echo $jogadorId; ?>'
                })
            })
            .then(response => response.json())
            .then(data => {
                console.log('Jogo registrado:', data);
                // Atualizar a página para refletir que o jogo foi jogado
                if (data.success) {
                    // Desativar o jogo após o registro
                    setTimeout(() => {
                        window.location.reload();
                    }, 5000); // Recarregar após 5 segundos para mostrar a mensagem de limite
                }
            })
            .catch(error => {
                console.error('Erro ao registrar jogo:', error);
            });
        }
        
        // Event listeners
        cells.forEach(cell => {
            <?php if ($podeJogar): ?>
            cell.addEventListener('click', handleCellClick);
            <?php else: ?>
            cell.style.cursor = 'not-allowed';
            <?php endif; ?>
        });
        
        <?php if ($podeJogar): ?>
        restartButton.addEventListener('click', initGame);
        <?php else: ?>
        restartButton.disabled = true;
        <?php endif; ?>
        
        quitButton.addEventListener('click', backToStudy);
        tryAgainButton.addEventListener('click', () => {
            closeModal();
            <?php if ($podeJogar): ?>
            initGame();
            <?php endif; ?>
        });
        backToStudyButton.addEventListener('click', backToStudy);
        
        // Inicializar o jogo
        <?php if ($podeJogar): ?>
        initGame();
        <?php else: ?>
        // Desativar o jogo se o limite diário foi atingido
        gameActive = false;
        status.textContent = "Você já jogou hoje. Volte amanhã!";
        <?php endif; ?>
    </script>
</body>
</html>
