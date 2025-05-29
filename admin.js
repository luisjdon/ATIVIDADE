/**
 * Gerenciamento da área administrativa do Desafio Supremo
 */

// Senha para acessar a área administrativa
const ADMIN_PASSWORD = "admin123"; // Altere para uma senha segura em produção

// Função para abrir a área administrativa
function abrirAreaAdmin() {
    // Tocar som de clique
    if (typeof tocarSom === 'function') {
        tocarSom('clickSound');
    }
    
    // Mostrar o modal administrativo
    document.getElementById('adminModal').style.display = 'block';
    
    // Focar no campo de senha
    document.getElementById('adminPassword').focus();
    
    // Carregar configurações atuais
    carregarConfiguracoesAdmin();
}

// Função para verificar a senha administrativa
function verificarSenhaAdmin() {
    const senha = document.getElementById('adminPassword').value;
    const errorElement = document.getElementById('adminLoginError');
    
    if (senha === ADMIN_PASSWORD) {
        // Senha correta, mostrar controles administrativos
        document.getElementById('adminLogin').style.display = 'none';
        document.getElementById('adminControls').style.display = 'block';
        
        // Limpar senha e erro
        document.getElementById('adminPassword').value = '';
        errorElement.textContent = '';
        
        // Atualizar estado dos botões com base nas configurações atuais
        atualizarBotoesAdmin();
    } else {
        // Senha incorreta, mostrar erro
        errorElement.textContent = 'Senha incorreta. Tente novamente.';
        document.getElementById('adminPassword').value = '';
        document.getElementById('adminPassword').focus();
    }
}

// Função para carregar as configurações administrativas
function carregarConfiguracoesAdmin() {
    // Carregar número de questões
    const questoesLimite = parseInt(localStorage.getItem('questoesHoje') || localStorage.getItem('questoesPadrao') || localStorage.getItem('totalPerguntas') || '10');
    document.getElementById('questoesLimite').value = questoesLimite;
    
    // Carregar limite de erros
    const errosLimite = parseInt(localStorage.getItem('limiteErros') || '4');
    document.getElementById('errosLimite').value = errosLimite;
    
    // Atualizar o total de perguntas na interface
    const totalPerguntasElement = document.getElementById('totalPerguntas');
    if (totalPerguntasElement) {
        totalPerguntasElement.textContent = questoesLimite;
    }
}

// Função para atualizar o estado dos botões administrativos
function atualizarBotoesAdmin() {
    // Verificar estados atuais
    const modoSupremo = localStorage.getItem('modoSupremo') === 'true';
    const modoPunicao = localStorage.getItem('modoPunicao') === 'true';
    const materiasMistas = localStorage.getItem('materiasMistas') === 'true';
    
    // Atualizar botões
    const btnDesafioSupremo = document.getElementById('btnDesafioSupremo');
    const btnModoPunicao = document.getElementById('btnModoPunicao');
    const btnMateriasMistas = document.getElementById('btnMateriasMistas');
    
    if (btnDesafioSupremo) {
        btnDesafioSupremo.classList.toggle('ativo', modoSupremo);
        btnDesafioSupremo.innerHTML = modoSupremo ? 
            '<i class="fas fa-crown"></i> Desativar Desafio Supremo' : 
            '<i class="fas fa-crown"></i> Ativar Desafio Supremo';
    }
    
    if (btnModoPunicao) {
        btnModoPunicao.classList.toggle('ativo', modoPunicao);
        btnModoPunicao.innerHTML = modoPunicao ? 
            '<i class="fas fa-exclamation-triangle"></i> Desativar Modo Punição' : 
            '<i class="fas fa-exclamation-triangle"></i> Ativar Modo Punição';
    }
    
    if (btnMateriasMistas) {
        btnMateriasMistas.classList.toggle('ativo', materiasMistas);
        btnMateriasMistas.innerHTML = materiasMistas ? 
            '<i class="fas fa-random"></i> Desativar Matérias Mistas' : 
            '<i class="fas fa-random"></i> Ativar Matérias Mistas';
    }
}

// Função para salvar o limite de questões
function salvarLimiteQuestoes() {
    const questoesLimite = parseInt(document.getElementById('questoesLimite').value);
    
    if (questoesLimite >= 10 && questoesLimite <= 30) {
        localStorage.setItem('questoesPadrao', questoesLimite.toString());
        localStorage.setItem('questoesHoje', questoesLimite.toString());
        localStorage.setItem('totalPerguntas', questoesLimite.toString());
        
        // Atualizar a interface
        document.getElementById('totalPerguntas').textContent = questoesLimite;
        
        // Mostrar mensagem de sucesso
        mostrarMensagemAdmin('Número de questões atualizado com sucesso!');
    } else {
        // Mostrar mensagem de erro
        mostrarMensagemAdmin('O número de questões deve estar entre 5 e 30.', true);
    }
}

// Função para salvar o limite de erros
function salvarLimiteErros() {
    const errosLimite = parseInt(document.getElementById('errosLimite').value);
    
    if (errosLimite >= 1 && errosLimite <= 10) {
        localStorage.setItem('limiteErros', errosLimite.toString());
        
        // Atualizar a variável global
        window.limiteErros = errosLimite;
        
        // Mostrar mensagem de sucesso
        mostrarMensagemAdmin('Limite de erros atualizado com sucesso!');
    } else {
        // Mostrar mensagem de erro
        mostrarMensagemAdmin('O limite de erros deve estar entre 1 e 10.', true);
    }
}

// Função para mostrar mensagem na área administrativa
function mostrarMensagemAdmin(mensagem, isError = false) {
    // Criar elemento de mensagem
    const msgElement = document.createElement('div');
    msgElement.className = `admin-message ${isError ? 'admin-error' : 'admin-success'}`;
    msgElement.textContent = mensagem;
    
    // Adicionar à área administrativa
    const adminControls = document.getElementById('adminControls');
    adminControls.appendChild(msgElement);
    
    // Remover após 3 segundos
    setTimeout(() => {
        msgElement.classList.add('fade-out');
        setTimeout(() => {
            adminControls.removeChild(msgElement);
        }, 500);
    }, 3000);
}

// Configurar eventos dos botões quando o documento estiver pronto
document.addEventListener('DOMContentLoaded', function() {
    // Configurar botão de Desafio Supremo
    const btnDesafioSupremo = document.getElementById('btnDesafioSupremo');
    if (btnDesafioSupremo) {
        btnDesafioSupremo.addEventListener('click', function() {
            // Tocar som de clique
            if (typeof tocarSom === 'function') {
                tocarSom('clickSound');
            }
            
            // Obter estado atual
            const modoSupremo = localStorage.getItem('modoSupremo') === 'true';
            
            // Alternar estado
            localStorage.setItem('modoSupremo', (!modoSupremo).toString());
            
            // Se estiver ativando, ativar também matérias mistas
            if (!modoSupremo) {
                localStorage.setItem('materiasMistas', 'true');
            }
            
            // Atualizar botões
            atualizarBotoesAdmin();
            
            // Recarregar a página para aplicar as mudanças
            setTimeout(() => {
                location.reload();
            }, 500);
        });
    }
    
    // Configurar botão de Modo Punição
    const btnModoPunicao = document.getElementById('btnModoPunicao');
    if (btnModoPunicao) {
        btnModoPunicao.addEventListener('click', function() {
            // Tocar som de clique
            if (typeof tocarSom === 'function') {
                tocarSom('clickSound');
            }
            
            // Obter estado atual
            const modoPunicao = localStorage.getItem('modoPunicao') === 'true';
            
            // Alternar estado
            localStorage.setItem('modoPunicao', (!modoPunicao).toString());
            
            // Atualizar botões
            atualizarBotoesAdmin();
            
            // Recarregar a página para aplicar as mudanças
            setTimeout(() => {
                location.reload();
            }, 500);
        });
    }
    
    // Configurar botão de Matérias Mistas
    const btnMateriasMistas = document.getElementById('btnMateriasMistas');
    if (btnMateriasMistas) {
        btnMateriasMistas.addEventListener('click', function() {
            // Tocar som de clique
            if (typeof tocarSom === 'function') {
                tocarSom('clickSound');
            }
            
            // Obter estado atual
            const materiasMistas = localStorage.getItem('materiasMistas') === 'true';
            
            // Alternar estado
            localStorage.setItem('materiasMistas', (!materiasMistas).toString());
            
            // Se estiver desativando matérias mistas, desativar também o desafio supremo
            if (materiasMistas) {
                localStorage.setItem('modoSupremo', 'false');
            }
            
            // Atualizar botões
            atualizarBotoesAdmin();
            
            // Recarregar a página para aplicar as mudanças
            setTimeout(() => {
                location.reload();
            }, 500);
        });
    }
    
    // Configurar tecla Enter no campo de senha
    const adminPassword = document.getElementById('adminPassword');
    if (adminPassword) {
        adminPassword.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                verificarSenhaAdmin();
            }
        });
    }
    
    // Atualizar botões administrativos
    atualizarBotoesAdmin();
});
