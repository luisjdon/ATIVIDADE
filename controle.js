/**
 * CONTROLE.JS
 * Sistema de controle administrativo para o Desafio Supremo
 * Permite definir o número de perguntas do dia como punição extra
 */

// Variáveis de controle
let modoAdminAtivo = false;
const SENHA_ADMIN = "pai123"; // Senha padrão para acesso administrativo
let questoesPadrao = 10; // Número padrão de questões por dia
let modoPunicao = false; // Status do modo punição
let materiasMistas = false; // Status do modo de matérias mistas
let modoSupremo = false; // Status do Desafio Supremo (punição + matérias mistas)

// Inicializar o sistema de controle
document.addEventListener('DOMContentLoaded', () => {
    // Verificar se já existe um número de perguntas definido
    carregarConfiguracoesAdmin();
    
    // Configurar detecção de atalho para abrir painel admin (Ctrl+Shift+A)
    document.addEventListener('keydown', detectarAtalhoAdmin);
});

/**
 * Carrega as configurações administrativas do localStorage
 */
function carregarConfiguracoesAdmin() {
    // Carregar número de perguntas configurado
    const metaPerguntas = localStorage.getItem("metaPerguntasDia");
    if (metaPerguntas) {
        totalPerguntas = parseInt(metaPerguntas);
        console.log(`Modo punição ativo: ${totalPerguntas} perguntas configuradas`);
    }
    
    // Carregar status do modo punição
    modoPunicao = localStorage.getItem('modoPunicao') === 'true';
    
    // Carregar status do modo matérias mistas
    materiasMistas = localStorage.getItem('materiasMistas') === 'true';
    
    // Carregar status do Desafio Supremo
    modoSupremo = localStorage.getItem('modoSupremo') === 'true';
}

/**
 * Detecta o atalho de teclado para abrir o painel administrativo
 * Atalho: Ctrl + Shift + A
 */
function detectarAtalhoAdmin(event) {
    // Verificar se a combinação Ctrl+Shift+A foi pressionada
    if (event.ctrlKey && event.shiftKey && event.key === 'A') {
        event.preventDefault();
        abrirPainelAdmin();
    }
}

/**
 * Abre o painel administrativo
 */
function abrirPainelAdmin() {
    // Verificar se o painel já existe
    let painelAdmin = document.getElementById('painelAdmin');
    
    if (!painelAdmin) {
        // Criar o painel administrativo
        painelAdmin = document.createElement('div');
        painelAdmin.id = 'painelAdmin';
        painelAdmin.className = 'painel-admin';
        
        // Conteúdo do painel
        painelAdmin.innerHTML = `
            <div class="painel-admin-header">
                <h3><i class="fas fa-lock"></i> Área Administrativa</h3>
                <button id="fecharPainelAdmin" class="btn-fechar">×</button>
            </div>
            <div class="painel-admin-content">
                <div class="admin-auth" id="adminAuth">
                    <p>Digite a senha para acessar:</p>
                    <input type="password" id="senhaAdmin" placeholder="Senha">
                    <button id="loginAdmin" class="btn-admin">Acessar</button>
                </div>
                <div class="admin-controls" id="adminControls" style="display: none;">
                    <div class="form-group">
                        <label for="numPerguntas">Número de perguntas do dia:</label>
                        <input type="number" id="numPerguntas" min="5" max="50" value="10">
                    </div>
                    <p class="admin-info">Aumente o número para dias de malcriação</p>
                    <div class="form-group checkbox-group">
                        <input type="checkbox" id="modo-punicao" ${modoPunicao ? 'checked' : ''}>
                        <label for="modo-punicao">Ativar Modo Punição (aumenta o número de perguntas)</label>
                    </div>
                    <div class="form-group checkbox-group">
                        <input type="checkbox" id="materias-mistas" ${materiasMistas ? 'checked' : ''}>
                        <label for="materias-mistas">Ativar Matérias Mistas (perguntas de diferentes disciplinas)</label>
                    </div>
                    <div class="form-group checkbox-group">
                        <input type="checkbox" id="modo-supremo" ${modoSupremo ? 'checked' : ''}>
                        <label for="modo-supremo">Ativar Desafio Supremo (combina punição e matérias mistas)</label>
                    </div>
                    <button id="salvarAdmin" class="btn-admin">Salvar Configurações</button>
                </div>
            </div>
        `;
        
        // Adicionar o painel ao corpo do documento
        document.body.appendChild(painelAdmin);
        
        // Configurar eventos
        document.getElementById('fecharPainelAdmin').addEventListener('click', fecharPainelAdmin);
        document.getElementById('loginAdmin').addEventListener('click', autenticarAdmin);
        document.getElementById('salvarAdmin').addEventListener('click', salvarConfigAdmin);
        
        // Pré-preencher o campo com o valor atual
        const metaPerguntas = localStorage.getItem("metaPerguntasDia") || 10;
        document.getElementById('numPerguntas').value = metaPerguntas;
    } else {
        // Se o painel já existe, apenas mostrar
        painelAdmin.style.display = 'block';
    }
}

/**
 * Fecha o painel administrativo
 */
function fecharPainelAdmin() {
    const painelAdmin = document.getElementById('painelAdmin');
    if (painelAdmin) {
        painelAdmin.style.display = 'none';
    }
    modoAdminAtivo = false;
}

/**
 * Autentica o administrador com a senha
 */
function autenticarAdmin() {
    const senha = document.getElementById('senhaAdmin').value;
    
    if (senha === SENHA_ADMIN) {
        // Mostrar controles administrativos
        document.getElementById('adminAuth').style.display = 'none';
        document.getElementById('adminControls').style.display = 'block';
        modoAdminAtivo = true;
        
        // Limpar campo de senha
        document.getElementById('senhaAdmin').value = '';
    } else {
        alert('Senha incorreta!');
    }
}

/**
 * Salva as configurações administrativas
 */
function salvarConfigAdmin() {
    const numPerguntas = document.getElementById('numPerguntas').value;
    
    // Obter os valores dos checkboxes
    const modoPunicaoNovo = document.getElementById('modo-punicao').checked;
    const materiasMistasNovo = document.getElementById('materias-mistas').checked;
    const modoSupremoNovo = document.getElementById('modo-supremo').checked;
    
    if (numPerguntas && parseInt(numPerguntas) >= 5) {
        // Salvar o número de perguntas
        localStorage.setItem('questoesPadrao', numPerguntas);
        
        // Calcular o número real de perguntas para hoje
        let perguntasHoje = parseInt(numPerguntas);
        if (modoPunicaoNovo || modoSupremoNovo) {
            perguntasHoje += 5; // Adiciona 5 perguntas extras no modo punição
        }
        localStorage.setItem('questoesHoje', perguntasHoje.toString());
        
        // Salvar configurações do Desafio Supremo
        localStorage.setItem('modoPunicao', modoPunicaoNovo);
        localStorage.setItem('materiasMistas', materiasMistasNovo);
        localStorage.setItem('modoSupremo', modoSupremoNovo);
        
        // Atualizar variáveis globais
        modoPunicao = modoPunicaoNovo;
        materiasMistas = materiasMistasNovo;
        modoSupremo = modoSupremoNovo;
        
        console.log(`Configuração salva: ${perguntasHoje} perguntas para hoje`);
        console.log(`Modo Punição: ${modoPunicao}, Matérias Mistas: ${materiasMistas}, Desafio Supremo: ${modoSupremo}`);
        
        // Fechar o modal
        document.getElementById('painelAdmin').style.display = 'none';
        
        // Atualizar interface
        atualizarInterface();
        
        // Exibir mensagem de sucesso
        alert(`Configuração salva: ${perguntasHoje} perguntas para hoje`);
        
        // Recarregar a página para aplicar as alterações
        location.reload();
    } else {
        alert("Por favor, defina um número válido de perguntas (mínimo 5).");
    }
}

/**
 * Retorna o número de perguntas configurado
 */
function getNumeroPerguntas() {
    return parseInt(localStorage.getItem("metaPerguntasDia")) || 10;
}
