document.addEventListener('DOMContentLoaded', () => {
    carregarCarrinho();
});

function carregarCarrinho() {
    const carrinho = JSON.parse(localStorage.getItem('carrinho')) || [];
    const container = document.getElementById('itens-carrinho');
    const resumo = document.getElementById('resumo-carrinho');
    const carrinhoVazio = document.getElementById('carrinho-vazio');

    // Limpa o conteúdo anterior
    container.innerHTML = '';

    if (carrinho.length === 0) {
        carrinhoVazio.style.display = 'block';
        resumo.style.display = 'none';
        return;
    }

    carrinhoVazio.style.display = 'none';
    resumo.style.display = 'block';

    carrinho.forEach(item => {
        // Converte o preço unitário para número, tratando o formato brasileiro (vírgula)
        const precoUnitario = parseFloat(item.preco.replace(',', '.'));
        // Calcula o subtotal deste item
        const subTotalItem = (precoUnitario * item.quantidade).toFixed(2).replace('.', ',');

        const itemElemento = document.createElement('div');
        itemElemento.classList.add('carrinho-item');
        itemElemento.innerHTML = `
            <div class="carrinho-imagem">
                <img src="${item.imagem || 'caminho/para/imagem-padrao.png'}" alt="${item.nome}">
            </div>
            <div class="carrinho-info">
                <h3>${item.nome}</h3>
                <p>Preço unitário: R$ ${item.preco}</p>
                <p class="subtotal-item">Subtotal: R$ ${subTotalItem}</p>
            </div>
            
            <div class="carrinho-quantidade">
                <div class="carrinho-quantidade-group">
                    <button class="btn-quantidade" onclick="mudarQuantidade('${item.id}', -1)">-</button>
                    <input type="text" id="qtd-${item.id}" value="${item.quantidade}" readonly>
                    <button class="btn-quantidade" onclick="mudarQuantidade('${item.id}', 1)">+</button>
                </div>
                <button class="btn-remover" onclick="removerDoCarrinho('${item.id}')">Remover</button>
            </div>
        `;
        container.appendChild(itemElemento);
    });

    calcularTotal();
}

function calcularTotal() {
    const carrinho = JSON.parse(localStorage.getItem('carrinho')) || [];
    let total = 0;

    carrinho.forEach(item => {
        total += parseFloat(item.preco.replace(',', '.')) * item.quantidade;
    });

    // TOTAL DO PEDIDO
    document.getElementById('valor-total').textContent = `R$ ${total.toFixed(2).replace('.', ',')}`;
}

function removerDoCarrinho(id) {
    let carrinho = JSON.parse(localStorage.getItem('carrinho')) || [];
    carrinho = carrinho.filter(item => item.id !== id);
    localStorage.setItem('carrinho', JSON.stringify(carrinho));
    carregarCarrinho(); // Recarrega para atualizar a lista e o total
}

// NOVO: Função para alterar a quantidade usando os botões +/-
function mudarQuantidade(id, delta) {
    let carrinho = JSON.parse(localStorage.getItem('carrinho')) || [];
    const item = carrinho.find(item => item.id === id);

    if (item) {
        let novaQuantidade = item.quantidade + delta;
        
        if (novaQuantidade > 0) {
            item.quantidade = novaQuantidade;
            localStorage.setItem('carrinho', JSON.stringify(carrinho));
        } else {
            // Se tentar ir para 0 ou menos, remove o item
            removerDoCarrinho(id);
            return; 
        }
    }
    carregarCarrinho(); // Recarrega para atualizar a interface, totais e botões
}

// OBSOLETO: A função atualizarQuantidade não é mais necessária, mas se você a mantiver, é melhor removê-la para limpar o código.
// function atualizarQuantidade(id, novaQuantidade) { ... }


// FUNÇÃO FINALIZAR PEDIDO (WHATSAPP)
function finalizarPedido() {
    const carrinho = JSON.parse(localStorage.getItem('carrinho')) || [];
    if (carrinho.length === 0) {
        alert("Seu carrinho está vazio. Adicione itens para finalizar o pedido.");
        return;
    }

    // Seu número de WhatsApp (mantenha o formato DDI + DDD + Número)
    const numeroWhatsApp = "5591991976079";
    let mensagem = "Olá, gostaria de finalizar meu pedido:%0A%0A";

    let total = 0; // Inicializa o total aqui para calcular no loop

    carrinho.forEach(item => {
        const precoItem = parseFloat(item.preco.replace(',', '.'));
        const subtotal = (precoItem * item.quantidade).toFixed(2).replace('.', ',');
        total += precoItem * item.quantidade; // Acumula o total
        
        // Conteúdo da mensagem com nome e subtotal
        mensagem += `* ${item.nome} (${item.quantidade}x) - R$ ${subtotal}%0A`;
    });

    mensagem += `%0A*Total Geral:* R$ ${total.toFixed(2).replace('.', ',')}%0A%0A`;
    mensagem += `Por favor, me informe o valor e as opções de pagamento. Obrigado!`;

    const linkWhatsApp = `https://wa.me/${numeroWhatsApp}?text=${mensagem}`;
    
    // Abre o WhatsApp em uma nova aba
    window.open(linkWhatsApp, '_blank');

    // Se quiser limpar o carrinho após o pedido, descomente as linhas abaixo
    // localStorage.removeItem('carrinho');
    // carregarCarrinho();
}