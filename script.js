// Função para extrair o ID do produto da URL
function getProdutoIdFromUrl() {
    const urlParams = new URLSearchParams(window.location.search);
    // Retorna a string do ID (Ex: "bolo", "expresso")
    return urlParams.get('id'); 
}

// Função para buscar os dados do produto no arquivo JSON
async function carregarDadosDoProduto(produtoId) {
    // CORRIGIDO: O ID é tratado como string, o que é compatível com seu produtos.json
    const idString = produtoId; 

    try {
        const response = await fetch('produtos.json');
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const produtos = await response.json();
        
        // CORRIGIDO: Retorna o produto que corresponde ao ID de string
        return produtos.find(p => p.id === idString);
        
    } catch (error) {
        console.error('Erro ao carregar os dados dos produtos:', error);
        // Chama a função de exibição com 'null' para mostrar a mensagem de erro
        exibirDetalhesDoProduto(null);
        return null; 
    }
}

// NOVO: Função para construir o HTML e preencher a página
function exibirDetalhesDoProduto(produto) {
    const container = document.getElementById('detalhes-produto-container');
    
    // 1. Tratamento de erro (Produto não encontrado)
    if (!produto) {
        container.innerHTML = `
            <div style="text-align: center; padding: 50px; width: 100%;">
                <h2>Produto não encontrado.</h2>
                <p>Desculpe, este produto não está disponível no momento.</p>
                <a href="index.html" class="btn" style="margin-top: 20px;">Voltar ao Cardápio</a>
            </div>
        `;
        return;
    }

    // 2. Formatação dos dados
    // Mantém a lógica de substituir ponto por vírgula no preço para exibição
    const precoFormatado = produto.preco.replace('.', ','); 
    const descricao = produto.descricao || "Produto delicioso da nossa cafeteria, veja os detalhes abaixo!";
    
    // 3. Renderização da nova estrutura de 2 COLUNAS
    container.innerHTML = `
        <img id="imagem-produto" src="${produto.imagem}" alt="Imagem do ${produto.nome}">
        
        <div class="expresso-content">
            <h2>${produto.nome}</h2>
            
            <p id="descricao-longa">${descricao}</p>
            
            <p style="font-size: 1.5rem; color: var(--cor-principal); font-weight: bold; margin-bottom: 20px;">
                Preço: <span id="preco-produto">R$ ${precoFormatado}</span>
            </p>

            <div class="pedido-section">
                <h3>Faça seu pedido</h3>
                <label for="quantidade-produto">Selecione a quantidade:</label>
                <input type="number" id="quantidade-produto" name="quantidade-produto" value="1" min="1">
                
                <button class="btn" onclick="adicionarAoCarrinho()">ADICIONAR AO CARRINHO</button>
            </div>
        </div>
    `;

    // Atualiza o Título da Aba do Navegador
    document.getElementById('titulo-pagina').textContent = `${produto.nome} - Cafeteria Elegante`;
}


// Função para adicionar o item ao carrinho (chamada pelo botão onclick)
function adicionarAoCarrinho() {
    // produtoId é obtido como string (Ex: "bolo")
    const produtoId = getProdutoIdFromUrl();
    
    // Garante que a quantidade seja um número inteiro e no mínimo 1
    const quantidadeInput = document.getElementById("quantidade-produto");
    const quantidade = Math.max(1, parseInt(quantidadeInput.value || '1', 10)); 
    
    quantidadeInput.value = quantidade;


    carregarDadosDoProduto(produtoId).then(produto => {
        if (produto) {
            const carrinho = JSON.parse(localStorage.getItem('carrinho')) || [];
            
            // A comparação de ID aqui funciona corretamente para strings e números
            const itemExistente = carrinho.find(item => item.id === produto.id);

            if (itemExistente) {
                itemExistente.quantidade += quantidade;
            } else {
                // Adiciona novo item. O ID é a string ("expresso", "bolo", etc.)
                carrinho.push({
                    id: produto.id,
                    nome: produto.nome,
                    // Garante que o preço seja salvo no formato do seu JSON (com vírgula)
                    preco: produto.preco.replace('.', ','), 
                    imagem: produto.imagem,
                    quantidade: quantidade
                });
            }

            localStorage.setItem('carrinho', JSON.stringify(carrinho));

            alert(`${quantidade} ${produto.nome}(s) adicionado(s) ao carrinho!`);

        } else {
            alert('Não foi possível adicionar o produto ao carrinho. Dados ausentes.');
        }
    });
}

// Inicia o processo quando a página é carregada
document.addEventListener('DOMContentLoaded', async () => {
    const produtoId = getProdutoIdFromUrl();
    if (produtoId) {
        const produto = await carregarDadosDoProduto(produtoId);
        exibirDetalhesDoProduto(produto);
    } else {
        // Trata o caso de acesso direto sem ID na URL
        exibirDetalhesDoProduto(null);
    }
});