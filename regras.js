/**
 * REGRAS.JS
 * Sistema de regras para o Desafio Supremo
 * Gerencia as regras diárias e exibe explicações para o usuário
 */

// Variáveis de controle das regras
let limiteErros = 4;
let totalPerguntas = 10;
let regrasExibidas = false;

// Inicializar o sistema de regras
document.addEventListener('DOMContentLoaded', () => {
    // Carregar configurações salvas
    carregarRegras();
    
    // Configurar botão de ajuda/regras se existir
    const btnRegras = document.getElementById('btnRegras');
    if (btnRegras) {
        btnRegras.addEventListener('click', exibirRegras);
    }
});

/**
 * Carrega as regras configuradas do localStorage
 */
function carregarRegras() {
    // Carregar número de perguntas configurado (modo punição)
    const metaPerguntas = localStorage.getItem("metaPerguntasDia");
    if (metaPerguntas) {
        totalPerguntas = parseInt(metaPerguntas);
    }
    
    // Verificar se as regras devem ser exibidas automaticamente
    const ultimaExibicao = localStorage.getItem("ultimaExibicaoRegras");
    const hoje = new Date().toDateString();
    
    if (ultimaExibicao !== hoje) {
        // Se não foram exibidas hoje, mostrar automaticamente
        setTimeout(() => {
            exibirRegras(true);
        }, 1000);
    }
}

/**
 * Exibe as regras do desafio em um modal
 * @param {boolean} automatico - Se a exibição é automática ou solicitada pelo usuário
 */
function exibirRegras(automatico = false) {
    // Verificar se o modal já existe
    let modalRegras = document.getElementById('modalRegras');
    
    if (!modalRegras) {
        // Criar o modal de regras
        modalRegras = document.createElement('div');
        modalRegras.id = 'modalRegras';
        modalRegras.className = 'modal';
        
        // Conteúdo do modal
        modalRegras.innerHTML = `
            <div class="modal-content regras-content">
                <span class="close" id="fecharRegras">&times;</span>
                <div class="regras-header">
                    <i class="fas fa-scroll"></i>
                    <h2>Regras do Desafio</h2>
                </div>
                <div class="regras-body">
                    <div class="regra-item">
                        <div class="regra-icon"><i class="fas fa-question-circle"></i></div>
                        <div class="regra-texto">
                            <h3>Perguntas</h3>
                            <p>Hoje você precisa responder <strong id="numPerguntasRegra">${totalPerguntas}</strong> perguntas de diferentes matérias.</p>
                        </div>
                    </div>
                    <div class="regra-item">
                        <div class="regra-icon"><i class="fas fa-times-circle"></i></div>
                        <div class="regra-texto">
                            <h3>Limite de Erros</h3>
                            <p>Você pode errar no máximo <strong>${limiteErros}</strong> perguntas.</p>
                            <p class="regra-aviso">Se errar ${limiteErros} perguntas, seu celular será bloqueado até amanhã!</p>
                        </div>
                    </div>
                    <div class="regra-item">
                        <div class="regra-icon"><i class="fas fa-random"></i></div>
                        <div class="regra-texto">
                            <h3>Matérias Variadas</h3>
                            <p>As perguntas serão de diferentes matérias e tópicos.</p>
                            <p>Você não pode escolher a matéria.</p>
                        </div>
                    </div>
                    <div class="regra-item">
                        <div class="regra-icon"><i class="fas fa-coins"></i></div>
                        <div class="regra-texto">
                            <h3>Recompensas</h3>
                            <p>Ganhe moedas por cada acerto para desbloquear itens especiais.</p>
                        </div>
                    </div>
                </div>
                <div class="regras-footer">
                    <button id="entendidoRegras" class="btn-entendido">Entendido!</button>
                </div>
            </div>
        `;
        
        // Adicionar o modal ao corpo do documento
        document.body.appendChild(modalRegras);
        
        // Configurar eventos
        document.getElementById('fecharRegras').addEventListener('click', fecharRegras);
        document.getElementById('entendidoRegras').addEventListener('click', fecharRegras);
    } else {
        // Se o modal já existe, apenas atualizar o número de perguntas
        document.getElementById('numPerguntasRegra').textContent = totalPerguntas;
    }
    
    // Exibir o modal
    modalRegras.style.display = 'block';
    
    // Registrar que as regras foram exibidas hoje
    if (automatico) {
        localStorage.setItem("ultimaExibicaoRegras", new Date().toDateString());
        regrasExibidas = true;
    }
}

/**
 * Fecha o modal de regras
 */
function fecharRegras() {
    const modalRegras = document.getElementById('modalRegras');
    if (modalRegras) {
        modalRegras.style.display = 'none';
    }
}

/**
 * Atualiza o número de perguntas nas regras
 * @param {number} numero - Novo número de perguntas
 */
function atualizarNumeroPerguntas(numero) {
    totalPerguntas = numero;
    const numPerguntasRegra = document.getElementById('numPerguntasRegra');
    if (numPerguntasRegra) {
        numPerguntasRegra.textContent = numero;
    }
}

/**
 * Retorna o número total de perguntas configurado
 */
function getNumeroTotalPerguntas() {
    return totalPerguntas;
}

/**
 * Retorna o limite de erros configurado
 */
function getLimiteErros() {
    return limiteErros;
}
