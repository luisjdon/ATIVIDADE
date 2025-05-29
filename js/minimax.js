// Implementação do algoritmo Minimax com poda Alpha-Beta
// Este arquivo contém funções avançadas para análise de xadrez

// Função principal Minimax com poda Alpha-Beta
function minimax(game, depth, alpha, beta, isMaximizingPlayer) {
  // Caso base: profundidade zero ou jogo terminado
  if (depth === 0 || game.game_over()) {
    return evaluatePositionAdvanced(game);
  }

  const moves = game.moves();
  
  // Ordenar movimentos para melhorar a eficiência da poda alpha-beta
  // Capturas e xeques primeiro
  const scoredMoves = moves.map(move => {
    // Verificar se é captura
    const isCapture = move.includes('x');
    // Verificar se é xeque
    const isCheck = move.includes('+');
    // Prioridade: xeque-mate > xeque > captura > outros
    let priority = 0;
    if (move.includes('#')) priority = 30;
    else if (isCheck) priority = 20;
    else if (isCapture) priority = 10;
    
    return { move, priority };
  });
  
  // Ordenar movimentos por prioridade (maior primeiro)
  scoredMoves.sort((a, b) => b.priority - a.priority);
  const sortedMoves = scoredMoves.map(m => m.move);
  
  if (isMaximizingPlayer) {
    let maxEval = -Infinity;
    for (let move of sortedMoves) {
      game.move(move);
      const eval = minimax(game, depth - 1, alpha, beta, false);
      game.undo();
      maxEval = Math.max(maxEval, eval);
      alpha = Math.max(alpha, eval);
      if (beta <= alpha) break; // Poda alpha
    }
    return maxEval;
  } else {
    let minEval = Infinity;
    for (let move of sortedMoves) {
      game.move(move);
      const eval = minimax(game, depth - 1, alpha, beta, true);
      game.undo();
      minEval = Math.min(minEval, eval);
      beta = Math.min(beta, eval);
      if (beta <= alpha) break; // Poda beta
    }
    return minEval;
  }
}

// Função avançada de avaliação de posição
function evaluatePositionAdvanced(game) {
  let score = 0;
  
  // 1. Material (valores padrão de peças)
  const pieceValues = {
    'p': 100,   // Peão
    'n': 320,   // Cavalo
    'b': 330,   // Bispo
    'r': 500,   // Torre
    'q': 900,   // Rainha
    'k': 20000  // Rei (valor muito alto para priorizar sua segurança)
  };
  
  // 2. Tabelas de valor posicional para cada peça
  // Estas tabelas incentivam posicionamento estratégico
  
  // Peões - incentiva avanço e controle do centro
  const pawnTable = [
    [0,  0,  0,  0,  0,  0,  0,  0],
    [50, 50, 50, 50, 50, 50, 50, 50],
    [10, 10, 20, 30, 30, 20, 10, 10],
    [5,  5, 10, 25, 25, 10,  5,  5],
    [0,  0,  0, 20, 20,  0,  0,  0],
    [5, -5,-10,  0,  0,-10, -5,  5],
    [5, 10, 10,-20,-20, 10, 10,  5],
    [0,  0,  0,  0,  0,  0,  0,  0]
  ];
  
  // Cavalos - incentiva posições centrais e evita bordas
  const knightTable = [
    [-50,-40,-30,-30,-30,-30,-40,-50],
    [-40,-20,  0,  0,  0,  0,-20,-40],
    [-30,  0, 10, 15, 15, 10,  0,-30],
    [-30,  5, 15, 20, 20, 15,  5,-30],
    [-30,  0, 15, 20, 20, 15,  0,-30],
    [-30,  5, 10, 15, 15, 10,  5,-30],
    [-40,-20,  0,  5,  5,  0,-20,-40],
    [-50,-40,-30,-30,-30,-30,-40,-50]
  ];
  
  // Bispos - incentiva diagonais e evita cantos
  const bishopTable = [
    [-20,-10,-10,-10,-10,-10,-10,-20],
    [-10,  0,  0,  0,  0,  0,  0,-10],
    [-10,  0, 10, 10, 10, 10,  0,-10],
    [-10,  5,  5, 10, 10,  5,  5,-10],
    [-10,  0,  5, 10, 10,  5,  0,-10],
    [-10, 10, 10, 10, 10, 10, 10,-10],
    [-10,  5,  0,  0,  0,  0,  5,-10],
    [-20,-10,-10,-10,-10,-10,-10,-20]
  ];
  
  // Torres - incentiva colunas abertas e 7ª fileira
  const rookTable = [
    [0,  0,  0,  0,  0,  0,  0,  0],
    [5, 10, 10, 10, 10, 10, 10,  5],
    [-5,  0,  0,  0,  0,  0,  0, -5],
    [-5,  0,  0,  0,  0,  0,  0, -5],
    [-5,  0,  0,  0,  0,  0,  0, -5],
    [-5,  0,  0,  0,  0,  0,  0, -5],
    [-5,  0,  0,  0,  0,  0,  0, -5],
    [0,  0,  0,  5,  5,  0,  0,  0]
  ];
  
  // Rainha - combina elementos de torre e bispo
  const queenTable = [
    [-20,-10,-10, -5, -5,-10,-10,-20],
    [-10,  0,  0,  0,  0,  0,  0,-10],
    [-10,  0,  5,  5,  5,  5,  0,-10],
    [-5,   0,  5,  5,  5,  5,  0, -5],
    [0,    0,  5,  5,  5,  5,  0, -5],
    [-10,  5,  5,  5,  5,  5,  0,-10],
    [-10,  0,  5,  0,  0,  0,  0,-10],
    [-20,-10,-10, -5, -5,-10,-10,-20]
  ];
  
  // Rei - incentiva segurança no início/meio do jogo
  const kingMiddleTable = [
    [-30,-40,-40,-50,-50,-40,-40,-30],
    [-30,-40,-40,-50,-50,-40,-40,-30],
    [-30,-40,-40,-50,-50,-40,-40,-30],
    [-30,-40,-40,-50,-50,-40,-40,-30],
    [-20,-30,-30,-40,-40,-30,-30,-20],
    [-10,-20,-20,-20,-20,-20,-20,-10],
    [20,  20,  0,  0,  0,  0, 20, 20],
    [20,  30, 10,  0,  0, 10, 30, 20]
  ];
  
  // Rei - incentiva centralização no final do jogo
  const kingEndTable = [
    [-50,-40,-30,-20,-20,-30,-40,-50],
    [-30,-20,-10,  0,  0,-10,-20,-30],
    [-30,-10, 20, 30, 30, 20,-10,-30],
    [-30,-10, 30, 40, 40, 30,-10,-30],
    [-30,-10, 30, 40, 40, 30,-10,-30],
    [-30,-10, 20, 30, 30, 20,-10,-30],
    [-30,-30,  0,  0,  0,  0,-30,-30],
    [-50,-30,-30,-30,-30,-30,-30,-50]
  ];
  
  // Mapear tipos de peças para suas tabelas
  const pieceSquareTables = {
    'p': pawnTable,
    'n': knightTable,
    'b': bishopTable,
    'r': rookTable,
    'q': queenTable,
    'k': kingMiddleTable // Padrão para meio de jogo
  };
  
  // Verificar se estamos no final do jogo
  // (menos de 10 peças no tabuleiro ou sem rainhas)
  const board = game.board();
  let pieceCount = 0;
  let hasQueens = false;
  
  for (let i = 0; i < 8; i++) {
    for (let j = 0; j < 8; j++) {
      const piece = board[i][j];
      if (piece) {
        pieceCount++;
        if (piece.type === 'q') hasQueens = true;
      }
    }
  }
  
  const isEndgame = pieceCount <= 10 || !hasQueens;
  
  // Se for final de jogo, usar tabela específica para o rei
  if (isEndgame) {
    pieceSquareTables['k'] = kingEndTable;
  }
  
  // Calcular pontuação baseada em material e posição
  for (let i = 0; i < 8; i++) {
    for (let j = 0; j < 8; j++) {
      const piece = board[i][j];
      if (piece) {
        // Valor base da peça
        const value = pieceValues[piece.type];
        
        // Valor posicional
        let posValue = 0;
        if (pieceSquareTables[piece.type]) {
          // Para peças brancas, lemos a tabela de baixo para cima
          if (piece.color === 'w') {
            posValue = pieceSquareTables[piece.type][7-i][j];
          } else {
            // Para peças pretas, lemos a tabela normalmente
            posValue = pieceSquareTables[piece.type][i][j];
          }
        }
        
        // Adicionar ao score (positivo para IA, negativo para jogador)
        if (piece.color === 'b') { // IA (pretas)
          score += value + posValue;
        } else { // Jogador (brancas)
          score -= value + posValue;
        }
      }
    }
  }
  
  // 3. Mobilidade - número de movimentos legais
  // Salvar o FEN atual
  const originalFen = game.fen();
  const currentTurn = game.turn();
  
  // Contar movimentos para a IA
  if (currentTurn === 'w') {
    game.load(originalFen.replace(/ w /, ' b '));
  }
  const aiMoves = game.moves().length;
  score += aiMoves * 5; // Bônus por mobilidade
  
  // Contar movimentos para o jogador
  if (currentTurn === 'b') {
    game.load(originalFen.replace(/ b /, ' w '));
  } else {
    game.load(originalFen); // Voltar ao estado original
  }
  const playerMoves = game.moves().length;
  score -= playerMoves * 5;
  
  // Restaurar posição original
  game.load(originalFen);
  
  // 4. Estrutura de peões
  // Peões dobrados (penalidade)
  // Peões isolados (penalidade)
  // Peões passados (bônus)
  
  // 5. Segurança do rei
  // Rei exposto (penalidade)
  // Rei protegido por peões (bônus)
  
  // 6. Controle do centro
  const centerSquares = ['d4', 'd5', 'e4', 'e5'];
  for (const square of centerSquares) {
    const piece = game.get(square);
    if (piece) {
      if (piece.color === 'b') { // IA (pretas)
        score += 30;
      } else { // Jogador (brancas)
        score -= 30;
      }
    }
    
    // Controle do centro (mesmo sem peça lá)
    // Verificar ataques ao centro
    const attacks = getAttacksOnSquare(game, square);
    score += attacks.b * 10; // Bônus para ataques da IA
    score -= attacks.w * 10; // Penalidade para ataques do jogador
  }
  
  // 7. Desenvolvimento de peças (início do jogo)
  if (!isEndgame && pieceCount > 20) {
    // Penalidade por peças não desenvolvidas
    const homeSquares = {
      'b': ['c8', 'f8'], // Bispos
      'n': ['b8', 'g8'], // Cavalos
      'q': ['d8']        // Rainha
    };
    
    // Verificar peças não desenvolvidas
    for (const [pieceType, squares] of Object.entries(homeSquares)) {
      for (const square of squares) {
        const piece = game.get(square);
        if (piece && piece.type === pieceType) {
          if (piece.color === 'b') { // IA (pretas)
            score -= 30; // Penalidade por não desenvolver
          } else { // Jogador (brancas)
            score += 30; // Bônus se o jogador não desenvolver
          }
        }
      }
    }
  }
  
  // 8. Xeque e xeque-mate
  if (game.in_check()) {
    if (game.turn() === 'w') { // Jogador em xeque
      score += 50;
    } else { // IA em xeque
      score -= 50;
    }
  }
  
  if (game.in_checkmate()) {
    if (game.turn() === 'w') { // Jogador em xeque-mate
      return 100000; // Valor muito alto para priorizar xeque-mate
    } else { // IA em xeque-mate
      return -100000;
    }
  }
  
  // 9. Empate (evitar em posição vantajosa, buscar em posição desvantajosa)
  if (game.in_draw()) {
    return 0; // Valor neutro para empate
  }
  
  return score;
}

// Função auxiliar para contar ataques a uma casa
function getAttacksOnSquare(game, square) {
  const attacks = { w: 0, b: 0 };
  const moves = game.moves({ verbose: true });
  
  for (const move of moves) {
    if (move.to === square) {
      attacks[game.turn()]++;
    }
  }
  
  return attacks;
}

// Função para encontrar o melhor movimento usando Minimax
function findBestMoveWithMinimax(game, depth) {
  const possibleMoves = game.moves();
  let bestMove = null;
  let bestScore = -Infinity;
  
  // Verificar se é a vez da IA (pretas)
  if (game.turn() !== 'b') {
    console.error('Tentativa de calcular movimento da IA quando não é sua vez!');
    return possibleMoves[Math.floor(Math.random() * possibleMoves.length)];
  }
  
  // Avaliar cada movimento possível
  for (const move of possibleMoves) {
    // Fazer o movimento
    game.move(move);
    
    // Calcular pontuação usando Minimax
    const score = minimax(game, depth - 1, -Infinity, Infinity, false);
    
    // Desfazer o movimento
    game.undo();
    
    // Atualizar melhor movimento
    if (score > bestScore) {
      bestScore = score;
      bestMove = move;
    }
  }
  
  // Se não encontrou um bom movimento, escolher aleatório
  if (bestMove === null && possibleMoves.length > 0) {
    bestMove = possibleMoves[Math.floor(Math.random() * possibleMoves.length)];
  }
  
  return bestMove;
}

// Função para integração com Stockfish
let stockfishReady = false;
let stockfishEngine = null;
let stockfishCallback = null;

// Inicializar Stockfish
function initStockfishEngine() {
  if (stockfishEngine) return;
  
  try {
    stockfishEngine = new Worker('js/stockfish.js');
    
    stockfishEngine.onmessage = function(event) {
      const message = event.data;
      
      if (message === 'uciok') {
        stockfishReady = true;
        console.log('Stockfish inicializado com sucesso');
      }
      
      if (message.startsWith('bestmove') && stockfishCallback) {
        const bestMove = message.split(' ')[1];
        stockfishCallback(bestMove);
        stockfishCallback = null;
      }
    };
    
    stockfishEngine.postMessage('uci');
    stockfishEngine.postMessage('setoption name Threads value 4');
    stockfishEngine.postMessage('setoption name Hash value 32');
    stockfishEngine.postMessage('isready');
  } catch (error) {
    console.error('Erro ao inicializar Stockfish:', error);
    stockfishReady = false;
  }
}

// Obter melhor movimento do Stockfish
function getStockfishMove(game, depth = 15) {
  return new Promise((resolve) => {
    if (!stockfishEngine || !stockfishReady) {
      initStockfishEngine();
      // Se ainda não estiver pronto, usar alternativa
      if (!stockfishReady) {
        resolve(findBestMoveWithMinimax(game, 4));
        return;
      }
    }
    
    stockfishCallback = resolve;
    
    // Enviar posição atual para o Stockfish
    stockfishEngine.postMessage('position fen ' + game.fen());
    stockfishEngine.postMessage('go depth ' + depth);
  });
}
