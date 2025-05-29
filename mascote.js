/**
 * Funções para gerenciar o mascote interativo
 */

/**
 * Exibe o mascote com mensagens específicas para diferentes modos do sistema
 * @param {string} modo - O modo para exibir (boas_vindas, punicao, materias_mistas, desafio_supremo)
 */
function exibirMascote(modo) {
  // Carregar dados do mascote
  fetch('assets/mascotes.json')
    .then(response => response.json())
    .then(data => {
      // Obter o mascote atual
      const mascoteAtual = localStorage.getItem('mascoteAtual') || 'panda';
      const mascote = data[mascoteAtual];
      
      if (mascote && mascote.frases && mascote.frases[modo]) {
        // Selecionar uma frase aleatória para o modo
        const frases = mascote.frases[modo];
        const mensagemAleatoria = frases[Math.floor(Math.random() * frases.length)];
        
        // Exibir a mensagem
        mostrarMensagemMascote(mensagemAleatoria);
        
        // Atualizar a imagem do mascote com base no modo
        let estadoMascote = 'normal';
        
        switch(modo) {
          case 'desafio_supremo':
            estadoMascote = 'surpreso';
            break;
          case 'punicao':
            estadoMascote = 'triste';
            break;
          case 'materias_mistas':
            estadoMascote = 'feliz';
            break;
          default:
            estadoMascote = 'normal';
        }
        
        atualizarAparenciaMascote(estadoMascote);
      }
    })
    .catch(error => console.error('Erro ao carregar dados do mascote:', error));
}

/**
 * Atualiza o DOM para inicializar o sistema do Desafio Supremo
 * Deve ser chamado quando o documento estiver pronto
 */
function inicializarDesafioSupremoUI() {
  // Verificar se o modo Desafio Supremo está ativo
  const modoSupremo = localStorage.getItem('modoSupremo') === 'true';
  const materiasMistas = localStorage.getItem('materiasMistas') === 'true';
  const modoPunicao = localStorage.getItem('modoPunicao') === 'true';
  
  // Configurar os botões do Desafio Supremo
  const btnDesafioSupremo = document.getElementById('btnDesafioSupremo');
  const btnModoPunicao = document.getElementById('btnModoPunicao');
  const btnMateriasMistas = document.getElementById('btnMateriasMistas');
  
  if (btnDesafioSupremo) {
    btnDesafioSupremo.classList.toggle('ativo', modoSupremo);
    btnDesafioSupremo.textContent = modoSupremo ? 'Desativar Desafio Supremo' : 'Ativar Desafio Supremo';
  }
  
  if (btnModoPunicao) {
    btnModoPunicao.classList.toggle('ativo', modoPunicao);
    btnModoPunicao.textContent = modoPunicao ? 'Desativar Modo Punição' : 'Ativar Modo Punição';
  }
  
  if (btnMateriasMistas) {
    btnMateriasMistas.classList.toggle('ativo', materiasMistas);
    btnMateriasMistas.textContent = materiasMistas ? 'Desativar Matérias Mistas' : 'Ativar Matérias Mistas';
  }
  
  // Aplicar classes CSS ao body com base nos modos ativos
  if (modoSupremo) {
    document.body.classList.add('modo-supremo');
    document.body.classList.add('desafio-supremo-ativo');
    
    // Mostrar mensagem do mascote para o Desafio Supremo
    setTimeout(() => {
      exibirMascote('desafio_supremo');
    }, 1000);
  } else if (modoPunicao) {
    document.body.classList.add('modo-punicao');
    
    // Mostrar mensagem do mascote para o modo punição
    setTimeout(() => {
      exibirMascote('punicao');
    }, 1000);
  } else if (materiasMistas) {
    document.body.classList.add('materias-mistas');
    
    // Mostrar mensagem do mascote para matérias mistas
    setTimeout(() => {
      exibirMascote('materias_mistas');
    }, 1000);
  }
}

// Exportar funções para o escopo global
window.exibirMascote = exibirMascote;
window.inicializarDesafioSupremoUI = inicializarDesafioSupremoUI;

// Inicializar quando o documento estiver pronto
document.addEventListener('DOMContentLoaded', () => {
  // Inicializar a interface do Desafio Supremo
  inicializarDesafioSupremoUI();
});
