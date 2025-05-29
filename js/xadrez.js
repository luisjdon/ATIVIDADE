// Arquivo principal para o jogo de xadrez

// Variu00e1veis globais
let board = null; // Tabuleiro
let game = new Chess(); // Objeto do jogo (chess.js) - inicializado imediatamente
let $status = null; // Elemento de status
let $message = null; // Elemento de mensagem
let whiteSquareGrey = '#a9a9a9'; // Cor para destacar casas
let blackSquareGrey = '#696969'; // Cor para destacar casas
let canPlay = true; // Se o jogador pode fazer jogadas
let aiThinking = false; // Se a IA estu00e1 "pensando"
let stockfish = null; // Motor de xadrez Stockfish
let searchDepth = 3; // Profundidade de busca para o algoritmo Minimax (fixado em 3 para o nível Difícil)
let useStockfish = false; // Se deve usar o Stockfish ou o algoritmo Minimax
let difficulty = 'hard'; // Nível de dificuldade padrão (hard ou impossible)
// jogadorId é definido no xadrez.php e injetado no HTML
let playerStats = {
    wins: 0,
    losses: 0,
    draws: 0
};

// Funu00e7u00e3o para carregar estatu00edsticas do jogador
function loadPlayerStats() {
    const savedStats = localStorage.getItem('chessStats');
    if (savedStats) {
        try {
            playerStats = JSON.parse(savedStats);
        } catch (e) {
            console.error('Erro ao carregar estatu00edsticas:', e);
        }
    }
}

// Funu00e7u00e3o para salvar estatu00edsticas do jogador
function savePlayerStats() {
    localStorage.setItem('chessStats', JSON.stringify(playerStats));
}

// Funu00e7u00e3o para destacar casas possu00edveis
function removeGreySquares() {
    $('#chessboard .square-55d63').css('background', '');
}

// Funu00e7u00e3o para destacar uma casa especu00edfica
function greySquare(square) {
    const $square = $('#chessboard .square-' + square);
    
    let background = whiteSquareGrey;
    if ($square.hasClass('black-3c85d')) {
        background = blackSquareGrey;
    }
    
    $square.css('background', background);
}

// Função chamada quando o jogador tenta mover uma peça
function onDragStart(source, piece) {
    // Verificar se o jogo está inicializado
    if (!game) {
        console.error('Jogo não inicializado em onDragStart');
        return false;
    }
    
    // Não permitir mover peças se o jogo acabou ou não é a vez do jogador
    if (game.game_over() || !canPlay || aiThinking || piece.search(/^b/) !== -1 || game.turn() !== 'w') {
        return false;
    }
}

// Função chamada quando o jogador solta uma peça
function onDrop(source, target) {
    // Remover destacamentos
    removeGreySquares();
    
    // Verificar se é a vez do jogador (brancas)
    if (game.turn() !== 'w') {
        return 'snapback';
    }
    
    // Verificar se o movimento é legal
    const move = game.move({
        from: source,
        to: target,
        promotion: 'q' // Sempre promover para rainha
    });
    
    // Se o movimento for ilegal, retornar a peça para a posição original
    if (move === null) return 'snapback';
    
    // Atualizar o status
    updateStatus();
    
    // Fazer a IA jogar após um breve intervalo
    setTimeout(makeAiMove, 500);
}

// Função chamada quando o jogador tira o mouse de uma casa
function onMouseoutSquare(square, piece) {
    removeGreySquares();
}

// Função chamada quando o jogador completa um movimento
function onSnapEnd() {
    // Atualizar o tabuleiro para a posição atual do jogo
    board.position(game.fen());
}

// Função chamada quando o jogador clica em uma casa
function onMouseoverSquare(square, piece) {
    // Verificar se o jogo está inicializado
    if (!game) {
        console.error('Jogo não inicializado em onMouseoverSquare');
        return;
    }
    
    // Não mostrar movimentos possíveis se o jogo acabou ou não é a vez do jogador
    if (game.game_over() || !canPlay || aiThinking) return;
    
    // Obter movimentos possíveis para esta casa
    const moves = game.moves({
        square: square,
        verbose: true
    });
    
    // Sair se não houver movimentos possíveis
    if (moves.length === 0) return;
    
    // Destacar a casa selecionada
    greySquare(square);
    
    // Destacar os movimentos possíveis
    for (let i = 0; i < moves.length; i++) {
        greySquare(moves[i].to);
    }
}

// Função para fazer a IA jogar
function makeAiMove() {
    // Verificar se o jogo acabou ou se não é a vez da IA (pretas)
    if (game.game_over() || game.turn() === 'w') {
        return;
    }
    
    // Marcar que a IA está "pensando"
    aiThinking = true;
    $message.text('A IA está pensando...');
    
    // Adicionar animação de "pensando"
    let dots = 0;
    const thinkingInterval = setInterval(() => {
        dots = (dots + 1) % 4;
        $message.text('A IA está pensando' + '.'.repeat(dots));
    }, 500);
    
    // Escolher o algoritmo baseado na dificuldade
    const makeMove = async () => {
        let bestMove;
        
        // Verificar se há movimentos disponíveis
        const possibleMoves = game.moves();
        if (possibleMoves.length === 0) {
            clearInterval(thinkingInterval);
            aiThinking = false;
            return;
        }
        
        try {
            // Escolher um movimento baseado na dificuldade
            if (difficulty === 'impossible') {
                // Usar o algoritmo avançado para encontrar o melhor movimento
                bestMove = findBestMoveAdvanced();
                console.log('Modo Impossível - Movimento escolhido:', bestMove);
            } else {
                // No modo difícil, usar o algoritmo padrão
                bestMove = findBestMoveAdvanced();
                console.log('Modo Difícil - Movimento escolhido:', bestMove);
            }
            
            // Se não conseguiu determinar um movimento, escolher aleatório
            if (!bestMove && possibleMoves.length > 0) {
                bestMove = possibleMoves[Math.floor(Math.random() * possibleMoves.length)];
                console.log('Usando movimento aleatório:', bestMove);
            }
            
            // Verificar se o movimento é válido
            if (bestMove && possibleMoves.includes(bestMove)) {
                // Fazer a jogada
                game.move(bestMove);
                
                // Atualizar o tabuleiro e o status
                board.position(game.fen());
                updateStatus();
            } else {
                console.error('Movimento inválido:', bestMove);
                // Escolher um movimento aleatório válido
                if (possibleMoves.length > 0) {
                    bestMove = possibleMoves[Math.floor(Math.random() * possibleMoves.length)];
                    game.move(bestMove);
                    board.position(game.fen());
                    updateStatus();
                }
            }
        } catch (e) {
            console.error('Erro ao calcular movimento da IA:', e);
            // Em caso de erro, fazer um movimento aleatório
            if (possibleMoves.length > 0) {
                bestMove = possibleMoves[Math.floor(Math.random() * possibleMoves.length)];
                game.move(bestMove);
                board.position(game.fen());
                updateStatus();
            }
        } finally {
            // Limpar o intervalo de "pensando"
            clearInterval(thinkingInterval);
            
            // Resetar o estado de "pensando"
            aiThinking = false;
        }
    };
    
    // Determinar o tempo de "pensamento" baseado na dificuldade
    let thinkTime = 800; // Padrão
    
    if (difficulty === 'impossible') {
        // No modo impossível, simular um "pensamento" mais profundo
        thinkTime = 1500 + Math.random() * 1000;
    } else if (difficulty === 'hard') {
        thinkTime = 1000 + Math.random() * 500;
    }
    
    // Executar o movimento após o tempo de "pensamento"
    setTimeout(makeMove, thinkTime);
}

// Verificar se o jogador está prestes a vencer
function isPlayerAboutToWin() {
    // Esta função foi desativada para evitar problemas com o jogo
    console.log('Função isPlayerAboutToWin desativada');
    return false;
}

// Ajustar sutilmente o tabuleiro quando o jogador está prestes a vencer
function subtlyAdjustBoard() {
    // Esta função foi desativada para evitar problemas com peças se movendo sozinhas
    console.log('Função subtlyAdjustBoard desativada');
    return false;
}

// Função para encontrar o melhor movimento com um algoritmo mais avançado
function findBestMoveAdvanced() {
    // Verificar se é a vez da IA (pretas)
    if (game.turn() !== 'b') {
        console.error('Tentativa de calcular movimento da IA quando não é sua vez!');
        // Retornar um movimento aleatório como fallback
        const possibleMoves = game.moves();
        return possibleMoves[Math.floor(Math.random() * possibleMoves.length)];
    }
    
    // Obter apenas os movimentos válidos para as peças pretas (IA)
    const possibleMoves = game.moves({ verbose: true }).filter(move => {
        const piece = game.get(move.from);
        return piece && piece.color === 'b';
    });
    
    // Converter para formato simples para compatibilidade
    const simpleMoves = possibleMoves.map(move => move.san);
    
    let bestMove = null;
    let bestMoveScore = -Infinity;
    
    // Avaliar cada movimento possível
    for (const move of simpleMoves) {
        try {
            // Fazer o movimento
            const moveObj = game.move(move);
            
            // Calcular a pontuação do movimento
            const moveScore = evaluatePosition();
            
            // Desfazer o movimento
            game.undo();
            
            // Se este movimento é melhor que o melhor até agora, atualizar
            if (moveScore > bestMoveScore) {
                bestMoveScore = moveScore;
                bestMove = move;
            }
        } catch (e) {
            console.error('Erro ao avaliar movimento:', move, e);
            // Continuar com o próximo movimento
        }
    }
    
    // Se não encontrou um bom movimento, escolher um aleatório
    if (bestMove === null && simpleMoves.length > 0) {
        bestMove = simpleMoves[Math.floor(Math.random() * simpleMoves.length)];
    } else if (simpleMoves.length === 0) {
        // Fallback para qualquer movimento válido
        const allMoves = game.moves();
        bestMove = allMoves[Math.floor(Math.random() * allMoves.length)];
    }
    
    return bestMove;
}

// Função para avaliar a posição atual do tabuleiro
function evaluatePosition() {
    let score = 0;
    
    // 1. Avaliar material (peças)
    const pieceValues = {
        'p': 10,  // Peão
        'n': 30,  // Cavalo
        'b': 30,  // Bispo
        'r': 50,  // Torre
        'q': 90,  // Rainha
        'k': 900  // Rei
    };
    
    // Mapas de posição para cada peça (bom para peões estarem no centro, etc.)
    const pawnPositionValues = [
        [0, 0, 0, 0, 0, 0, 0, 0],
        [50, 50, 50, 50, 50, 50, 50, 50],
        [10, 10, 20, 30, 30, 20, 10, 10],
        [5, 5, 10, 25, 25, 10, 5, 5],
        [0, 0, 0, 20, 20, 0, 0, 0],
        [5, -5, -10, 0, 0, -10, -5, 5],
        [5, 10, 10, -20, -20, 10, 10, 5],
        [0, 0, 0, 0, 0, 0, 0, 0]
    ];
    
    const knightPositionValues = [
        [-50, -40, -30, -30, -30, -30, -40, -50],
        [-40, -20, 0, 0, 0, 0, -20, -40],
        [-30, 0, 10, 15, 15, 10, 0, -30],
        [-30, 5, 15, 20, 20, 15, 5, -30],
        [-30, 0, 15, 20, 20, 15, 0, -30],
        [-30, 5, 10, 15, 15, 10, 5, -30],
        [-40, -20, 0, 5, 5, 0, -20, -40],
        [-50, -40, -30, -30, -30, -30, -40, -50]
    ];
    
    const bishopPositionValues = [
        [-20, -10, -10, -10, -10, -10, -10, -20],
        [-10, 0, 0, 0, 0, 0, 0, -10],
        [-10, 0, 10, 10, 10, 10, 0, -10],
        [-10, 5, 5, 10, 10, 5, 5, -10],
        [-10, 0, 5, 10, 10, 5, 0, -10],
        [-10, 10, 10, 10, 10, 10, 10, -10],
        [-10, 5, 0, 0, 0, 0, 5, -10],
        [-20, -10, -10, -10, -10, -10, -10, -20]
    ];
    
    const rookPositionValues = [
        [0, 0, 0, 0, 0, 0, 0, 0],
        [5, 10, 10, 10, 10, 10, 10, 5],
        [-5, 0, 0, 0, 0, 0, 0, -5],
        [-5, 0, 0, 0, 0, 0, 0, -5],
        [-5, 0, 0, 0, 0, 0, 0, -5],
        [-5, 0, 0, 0, 0, 0, 0, -5],
        [-5, 0, 0, 0, 0, 0, 0, -5],
        [0, 0, 0, 5, 5, 0, 0, 0]
    ];
    
    const queenPositionValues = [
        [-20, -10, -10, -5, -5, -10, -10, -20],
        [-10, 0, 0, 0, 0, 0, 0, -10],
        [-10, 0, 5, 5, 5, 5, 0, -10],
        [-5, 0, 5, 5, 5, 5, 0, -5],
        [0, 0, 5, 5, 5, 5, 0, -5],
        [-10, 5, 5, 5, 5, 5, 0, -10],
        [-10, 0, 5, 0, 0, 0, 0, -10],
        [-20, -10, -10, -5, -5, -10, -10, -20]
    ];
    
    const kingPositionValues = [
        [-30, -40, -40, -50, -50, -40, -40, -30],
        [-30, -40, -40, -50, -50, -40, -40, -30],
        [-30, -40, -40, -50, -50, -40, -40, -30],
        [-30, -40, -40, -50, -50, -40, -40, -30],
        [-20, -30, -30, -40, -40, -30, -30, -20],
        [-10, -20, -20, -20, -20, -20, -20, -10],
        [20, 20, 0, 0, 0, 0, 20, 20],
        [20, 30, 10, 0, 0, 10, 30, 20]
    ];
    
    const positionValues = {
        'p': pawnPositionValues,
        'n': knightPositionValues,
        'b': bishopPositionValues,
        'r': rookPositionValues,
        'q': queenPositionValues,
        'k': kingPositionValues
    };
    
    // Percorrer o tabuleiro e avaliar cada peça
    const board = game.board();
    for (let i = 0; i < 8; i++) {
        for (let j = 0; j < 8; j++) {
            const square = board[i][j];
            if (square) {
                // Valor base da peça
                const value = pieceValues[square.type];
                
                // Bônus de posição
                let positionValue = 0;
                if (positionValues[square.type]) {
                    if (square.color === 'b') { // IA (pretas)
                        positionValue = positionValues[square.type][i][j];
                    } else { // Jogador (brancas)
                        positionValue = positionValues[square.type][7-i][j];
                    }
                }
                
                // Adicionar ao score total (positivo para IA, negativo para jogador)
                if (square.color === 'b') { // IA (pretas)
                    score += value + positionValue;
                } else { // Jogador (brancas)
                    score -= value + positionValue;
                }
            }
        }
    }
    
    // 2. Avaliar controle do centro
    const centerSquares = ['d4', 'd5', 'e4', 'e5'];
    for (const square of centerSquares) {
        const piece = game.get(square);
        if (piece) {
            if (piece.color === 'b') { // IA (pretas)
                score += 10;
            } else { // Jogador (brancas)
                score -= 10;
            }
        }
    }
    
    // 3. Avaliar mobilidade (número de movimentos possíveis)
    // Desativado temporariamente para evitar problemas com a troca de turnos
    /*
    const currentTurn = game.turn();
    const originalFen = game.fen();
    
    // Contar movimentos para a IA
    game.load(originalFen.replace(/ w /, ' b '));
    const aiMoves = game.moves().length;
    score += aiMoves * 0.1;
    
    // Contar movimentos para o jogador
    game.load(originalFen.replace(/ b /, ' w '));
    const playerMoves = game.moves().length;
    score -= playerMoves * 0.1;
    
    // Restaurar a posição original
    game.load(originalFen);
    */
    
    // 4. Bônus para xeque
    if (game.in_check()) {
        if (game.turn() === 'w') { // Jogador em xeque
            score += 50;
        } else { // IA em xeque
            score -= 50;
        }
    }
    
    // 5. Bônus para xeque-mate
    if (game.in_checkmate()) {
        if (game.turn() === 'w') { // Jogador em xeque-mate
            score += 10000;
        } else { // IA em xeque-mate
            score -= 10000;
        }
    }
    
    return score;
}

// Função para atualizar o status do jogo
function updateStatus() {
    // Verificar se o jogo está inicializado
    if (!game) {
        console.error('Jogo não inicializado em updateStatus');
        return;
    }
    
    let status = '';
    
    try {
        // Verificar se o jogo acabou
        if (game.in_checkmate()) {
            status = 'Fim de jogo, ' + (game.turn() === 'w' ? 'você perdeu' : 'você venceu') + ' por xeque-mate.';
            
            // Atualizar estatísticas
            if (game.turn() === 'w') {
                playerStats.losses++;
                $message.text('Você perdeu! A IA venceu por xeque-mate.');
                $message.removeClass('info').addClass('error');
            } else {
                playerStats.wins++;
                $message.text('Parabéns! Você venceu por xeque-mate!');
                $message.removeClass('info').addClass('success');
            }
            
            savePlayerStats();
        } else if (game.in_draw()) {
            status = 'Fim de jogo, empate';
            
            // Verificar o tipo de empate
            if (game.in_stalemate()) {
                status += ' (afogamento)';
                $message.text('Empate por afogamento!');
            } else if (game.in_threefold_repetition()) {
                status += ' (repetição)';
                $message.text('Empate por repetição!');
            } else if (game.insufficient_material()) {
                status += ' (material insuficiente)';
                $message.text('Empate por material insuficiente!');
            } else {
                status += ' (regra dos 50 movimentos)';
                $message.text('Empate pela regra dos 50 movimentos!');
            }
            
            $message.removeClass('info').removeClass('error').addClass('warning');
            
            // Atualizar estatísticas
            playerStats.draws++;
            savePlayerStats();
        } else {
            // Verificar se é xeque
            status = game.in_check() ? 'Xeque!' : '';
            
            // Indicar de quem é a vez
            status += ' Vez das ' + (game.turn() === 'w' ? 'brancas' : 'pretas');
            
            // Se for a vez do jogador, mostrar mensagem
            if (game.turn() === 'w') {
                $message.text(game.in_check() ? 'Você está em xeque!' : 'Sua vez de jogar.');
                $message.removeClass('success').removeClass('error');
                if (game.in_check()) {
                    $message.removeClass('info').addClass('warning');
                } else {
                    $message.removeClass('warning').addClass('info');
                }
            }
        }
        
        $status.text(status);
        
        // Atualizar botões
        $('#undoBtn').prop('disabled', game.history().length < 2 || game.game_over());
        $('#resignBtn').prop('disabled', game.game_over());
    } catch (error) {
        console.error('Erro ao atualizar status:', error);
    }
}

// Função para registrar o jogo
function registrarJogo() {
    fetch('registrar_xadrez.php', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            acao: 'registrar',
            jogadorId: jogadorId
        })
    })
    .then(response => response.json())
    .then(data => {
        console.log('Jogo registrado:', data);
    })
    .catch(error => {
        console.error('Erro ao registrar jogo:', error);
    });
}

// Função para desfazer a última jogada
function undoLastMove() {
    // Desfazer as duas últimas jogadas (jogador e IA)
    game.undo(); // Desfazer jogada da IA
    game.undo(); // Desfazer jogada do jogador
    
    // Atualizar o tabuleiro e o status
    board.position(game.fen());
    updateStatus();
}

// Função para desistir do jogo
function resignGame() {
    if (confirm('Tem certeza que deseja desistir?')) {
        // Atualizar estatísticas
        playerStats.losses++;
        savePlayerStats();
        
        // Atualizar status
        $status.text('Fim de jogo, você desistiu.');
        $message.text('Você desistiu! Volte aos estudos para melhorar suas habilidades.');
        
        // Desativar controles
        canPlay = false;
        $('#undoBtn').prop('disabled', true);
        $('#resignBtn').prop('disabled', true);
    }
}

// Inicialização quando o DOM estiver pronto
$(document).ready(function() {
    // Inicializar elementos
    $status = $('#status');
    $message = $('#message');
    
    // Carregar o script do minimax.js
    const minimaxScript = document.createElement('script');
    minimaxScript.src = 'js/minimax.js';
    minimaxScript.async = true;
    document.head.appendChild(minimaxScript);
    
    // Inicializar o Stockfish para o modo impossível
    try {
        initStockfishEngine();
    } catch (e) {
        console.error('Erro ao inicializar Stockfish:', e);
    }
    
    // Configurar os ouvintes de eventos para os botões de dificuldade
    const difficultyOptions = document.querySelectorAll('input[name="difficulty"]');
    
    difficultyOptions.forEach(option => {
        option.addEventListener('change', function() {
            difficulty = this.value;
            console.log('Dificuldade alterada para:', difficulty);
            
            // Atualizar a mensagem com base na dificuldade
            if (difficulty === 'impossible') {
                $message.text('Modo Impossível ativado! Boa sorte... você vai precisar.');
                $message.removeClass('info').addClass('warning');
                useStockfish = true;
            } else {
                $message.text('Modo Difícil ativado. A IA usará estratégias avançadas.');
                $message.removeClass('warning').addClass('info');
                useStockfish = false;
            }
        });
    });

    // Carregar estatísticas do jogador
    loadPlayerStats();
    
    // Definir função para inicializar o Stockfish
    function initStockfish() {
        // Verificar se o Stockfish já está inicializado
        if (stockfish) {
            return;
        }
        
        try {
            // Criar um novo Web Worker para o Stockfish
            stockfish = new Worker('js/stockfish.js');
            
            // Configurar o Stockfish
            stockfish.postMessage('uci');
            stockfish.postMessage('setoption name Threads value 4');
            stockfish.postMessage('setoption name Hash value 16');
            stockfish.postMessage('isready');
            
            console.log('Stockfish inicializado com sucesso');
        } catch (error) {
            console.error('Erro ao inicializar Stockfish:', error);
            useStockfish = false;
        }
    }
    
    // Tentar inicializar Stockfish
    try {
        initStockfish();
        console.log('Stockfish inicializado com sucesso');
    } catch (e) {
        console.error('Erro ao inicializar Stockfish:', e);
        useStockfish = false;
    }
    
    // Definir função startNewGame
    function startNewGame() {
        // Verificar se o jogador pode jogar
        if (!canPlay) {
            $message.text('Você atingiu o limite de jogos diários. Volte amanhã!');
            return;
        }
        
        // Habilitar botões
        $('#undoBtn').prop('disabled', false);
        $('#resignBtn').prop('disabled', false);
        
        try {
            // Inicializar o jogo
            game = new Chess();
            
            // Configurar o tabuleiro
            const config = {
                draggable: true,
                position: 'start',
                pieceTheme: 'https://chessboardjs.com/img/chesspieces/wikipedia/{piece}.png',
                onDragStart: onDragStart,
                onDrop: onDrop,
                onMouseoverSquare: onMouseoverSquare,
                onMouseoutSquare: onMouseoutSquare,
                onSnapEnd: onSnapEnd
            };
            
            // Criar o tabuleiro
            board = ChessBoard('chessboard', config);
            
            // Obter a dificuldade selecionada
            const difficultyRadios = document.querySelectorAll('input[name="difficulty"]');
            let selectedDifficulty = 'hard'; // Padrão
            
            for (const radio of difficultyRadios) {
                if (radio.checked) {
                    selectedDifficulty = radio.value;
                    break;
                }
            }
            
            difficulty = selectedDifficulty;
            
            // Configurar com base na dificuldade
            if (difficulty === 'impossible') {
                // Para o nível "Impossível", usar algoritmo mais avançado
                useStockfish = true;
                console.log('Modo Impossível ativado');
                $message.text('Modo Impossível ativado! Boa sorte... você vai precisar.');
                $message.removeClass('info').addClass('warning');
            } else {
                // Para o nível "Difícil", usar o algoritmo mais simples
                useStockfish = false;
                console.log('Modo Difícil ativado');
                $message.text('Modo Difícil ativado. A IA usará estratégias avançadas.');
                $message.removeClass('warning').addClass('info');
            }
            
            // Registrar o jogo
            registrarJogo();
            
            // Atualizar status
            updateStatus();
        } catch (error) {
            console.error('Erro ao iniciar novo jogo:', error);
        }
    }
    
    // Configurar botões
    $('#startBtn').on('click', startNewGame);
    $('#undoBtn').on('click', undoLastMove);
    $('#resignBtn').on('click', resignGame);
    
    // Adicionar controles de dificuldade
    const difficultyControls = `
        <div class="form-group mt-3">
            <label for="difficultySelect">Nível de Dificuldade:</label>
            <select id="difficultySelect" class="form-control">
                <option value="3" selected>Difícil</option>
                <option value="stockfish">Impossível</option>
            </select>
        </div>
    `;
    
    // Inserir controles de dificuldade após os botões
    $('#game-controls').append(difficultyControls);
    
    // Configurar evento de mudança de dificuldade
    $('#difficultySelect').on('change', function() {
        const value = $(this).val();
        if (value === 'stockfish') {
            useStockfish = true;
            $message.text('Modo Impossível ativado! Boa sorte!');
        } else {
            useStockfish = false;
            searchDepth = 3; // Sempre usar profundidade 3 para o nível Difícil
            $message.text('Dificuldade alterada para: Difícil');
        }
    });
    
    // O tabuleiro de introdução para mostrar a posição inicial
    
    // Inicializar o tabuleiro de introdução
    const introBoard = ChessBoard('board-intro', {
        position: 'start',
        draggable: false,
        pieceTheme: 'https://chessboardjs.com/img/chesspieces/wikipedia/{piece}.png'
    });
    
    // Verificar quantos jogos o jogador já jogou hoje
    fetch('registrar_xadrez.php', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            acao: 'verificar',
            jogadorId: jogadorId
        })
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            // Atualizar a interface com o número de jogos restantes
            if (data.podeJogar) {
                if (data.jogosHoje > 0) {
                    $message.text(`Você tem ${data.jogosRestantes} jogo(s) restante(s) hoje.`);
                }
                // Iniciar um novo jogo automaticamente se o jogador puder jogar
                setTimeout(startNewGame, 1000);
            } else {
                $status.text('Limite de jogos atingido!');
                $message.text('Você já jogou 100 vezes hoje! Volte amanhã para jogar novamente.');
                $('#startBtn').prop('disabled', true);
            }
        }
    })
    .catch(error => {
        console.error('Erro ao verificar jogos:', error);
        // Iniciar um novo jogo por padru00e3o em caso de erro
        if (canPlay) {
            setTimeout(startNewGame, 1000);
        }
    });
});
