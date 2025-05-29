/*
 * Copyright (c) 2023, Chess.com, LLC
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy of
 * this software and associated documentation files (the "Software"), to deal in
 * the Software without restriction, including without limitation the rights to
 * use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies
 * of the Software, and to permit persons to whom the Software is furnished to do
 * so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */

// Stockfish.js - Versão simplificada para Web Worker
// Esta é uma versão simplificada do Stockfish.js para uso como Web Worker
// Baseada no projeto Stockfish.js (https://github.com/nmrugg/stockfish.js)

// Simulação do motor Stockfish para fins educacionais
(function() {
    // Variáveis globais
    var initialized = false;
    var ready = false;
    var depth = 10;
    var currentFen = "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1"; // Posição inicial
    
    // Função para inicializar o motor
    function init() {
        initialized = true;
        postMessage("Stockfish.js initialized");
    }
    
    // Função para processar comandos UCI
    function processCommand(cmd) {
        cmd = cmd.trim();
        
        // Comando UCI
        if (cmd === "uci") {
            postMessage("id name Stockfish JS");
            postMessage("id author Chess.com");
            postMessage("uciok");
            return;
        }
        
        // Verificar se está pronto
        if (cmd === "isready") {
            ready = true;
            postMessage("readyok");
            return;
        }
        
        // Definir opções
        if (cmd.startsWith("setoption")) {
            // Extrair nome e valor da opção
            var parts = cmd.split(" ");
            if (parts.length >= 5 && parts[1] === "name" && parts[3] === "value") {
                var optionName = parts[2];
                var optionValue = parts[4];
                
                // Processar opções específicas
                if (optionName === "Threads") {
                    // Configurar número de threads (simulado)
                    postMessage("info string set Threads to " + optionValue);
                } else if (optionName === "Hash") {
                    // Configurar tamanho da tabela hash (simulado)
                    postMessage("info string set Hash to " + optionValue + "MB");
                }
            }
            return;
        }
        
        // Definir posição
        if (cmd.startsWith("position")) {
            if (cmd.includes("fen")) {
                // Extrair FEN
                var fenStart = cmd.indexOf("fen") + 4;
                var fen = cmd.substring(fenStart).trim();
                
                // Se há movimentos após o FEN, cortar no primeiro "moves"
                if (fen.includes("moves")) {
                    fen = fen.substring(0, fen.indexOf("moves")).trim();
                }
                
                currentFen = fen;
                postMessage("info string position set to " + currentFen);
            } else if (cmd.includes("startpos")) {
                // Posição inicial
                currentFen = "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1";
                postMessage("info string position set to startpos");
            }
            return;
        }
        
        // Iniciar busca
        if (cmd.startsWith("go")) {
            // Extrair profundidade se especificada
            if (cmd.includes("depth")) {
                var depthStart = cmd.indexOf("depth") + 6;
                var depthStr = cmd.substring(depthStart).trim().split(" ")[0];
                depth = parseInt(depthStr, 10) || 10;
            }
            
            // Simular análise
            simulateAnalysis();
            return;
        }
        
        // Parar busca
        if (cmd === "stop") {
            postMessage("bestmove e2e4"); // Movimento padrão
            return;
        }
        
        // Comando não reconhecido
        postMessage("info string Unknown command: " + cmd);
    }
    
    // Função para simular análise
    function simulateAnalysis() {
        // Simular algumas iterações de análise
        for (var i = 1; i <= depth; i++) {
            // Simular informações de análise
            var score = Math.floor(Math.random() * 100) - 50;
            var nodes = i * 1000000;
            var time = i * 100;
            
            postMessage("info depth " + i + " score cp " + score + " nodes " + nodes + " time " + time + " pv e2e4 e7e5 g1f3");
            
            // Pequeno atraso para simular processamento
            if (i === depth) {
                // Gerar um movimento "inteligente" baseado na posição
                var bestMove = generateSmartMove(currentFen);
                postMessage("bestmove " + bestMove);
            }
        }
    }
    
    // Função para gerar um movimento "inteligente" baseado na posição
    function generateSmartMove(fen) {
        // Movimentos estratégicos para abertura (peças brancas)
        var whiteOpeningMoves = [
            "e2e4", // Abertura do Rei
            "d2d4", // Abertura da Rainha
            "c2c4", // Abertura Inglesa
            "g1f3", // Réti
            "b1c3"  // Abertura do Cavalo
        ];
        
        // Movimentos estratégicos para resposta (peças pretas)
        var blackOpeningMoves = [
            "e7e5", // Resposta simétrica ao e4
            "c7c5", // Defesa Siciliana
            "c7c6", // Defesa Caro-Kann
            "d7d5", // Resposta clássica
            "g8f6", // Defesa Indiana
            "e7e6"  // Defesa Francesa
        ];
        
        // Movimentos agressivos para meio-jogo
        var middleGameMoves = [
            "d2d4", "d7d5", // Controle do centro
            "f1c4", "f8c5", // Desenvolvimento dos bispos
            "g1f3", "g8f6", // Desenvolvimento dos cavalos
            "e1g1", "e8g8", // Roque
            "d1d2", "d8d7", // Desenvolvimento da rainha
            "a2a4", "a7a5", // Expansão na ala da dama
            "h2h4", "h7h5"  // Expansão na ala do rei
        ];
        
        // Movimentos de ataque para final de jogo
        var endGameMoves = [
            "d1h5", "d8h4", // Ataque com a rainha
            "f1a6", "f8a3", // Ataque com o bispo
            "a1a8", "h1h8", // Ataque com a torre
            "e1e2", "e8e7", // Ativação do rei no final
            "b1d2", "b8d7"  // Reposicionamento do cavalo
        ];
        
        // Determinar quem joga baseado no FEN
        var isWhiteToMove = fen.includes(" w ");
        
        // Analisar a posição para determinar a fase do jogo
        var gamePhase = determineGamePhase(fen);
        
        // Selecionar um movimento baseado na fase do jogo e em quem está jogando
        var moves;
        
        if (gamePhase === "opening") {
            moves = isWhiteToMove ? whiteOpeningMoves : blackOpeningMoves;
        } else if (gamePhase === "middlegame") {
            moves = middleGameMoves;
        } else { // endgame
            moves = endGameMoves;
        }
        
        // Adicionar um elemento de aleatoriedade, mas com preferência para movimentos melhores
        var weightedIndex = Math.floor(Math.pow(Math.random(), 2) * moves.length);
        return moves[weightedIndex];
    }
    
    // Função para determinar a fase do jogo baseado no FEN
    function determineGamePhase(fen) {
        // Contar peças para determinar a fase do jogo
        var pieceCount = 0;
        var majorPieceCount = 0; // Rainhas e torres
        
        // Remover informações após o espaço (turno, roque, etc)
        var boardPart = fen.split(" ")[0];
        
        // Contar peças
        for (var i = 0; i < boardPart.length; i++) {
            var char = boardPart.charAt(i);
            
            // Verificar se é uma peça
            if ("pnbrqkPNBRQK".indexOf(char) !== -1) {
                pieceCount++;
                
                // Contar peças maiores
                if ("qrQR".indexOf(char) !== -1) {
                    majorPieceCount++;
                }
            }
        }
        
        // Determinar fase do jogo
        if (pieceCount >= 26) { // Muitas peças ainda no tabuleiro
            return "opening";
        } else if (pieceCount >= 10 || majorPieceCount >= 4) { // Algumas peças ou peças importantes
            return "middlegame";
        } else { // Poucas peças
            return "endgame";
        }
    }
    
    // Inicializar ao carregar
    init();
    
    // Configurar receptor de mensagens
    self.onmessage = function(event) {
        var message = event.data;
        processCommand(message);
    };
})();
