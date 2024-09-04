// Exemplo de funcionalidade JavaScript para o botão de doação
document.getElementById('donateButton').addEventListener('click', function() {
    alert('Obrigado por considerar uma doação!');
});


// Função para verificar se o elemento está visível na tela
function isElementInViewport(el) {
    const rect = el.getBoundingClientRect();
    return (
        rect.top >= 0 &&
        rect.left >= 0 &&
        rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
        rect.right <= (window.innerWidth || document.documentElement.clientWidth)
    );
}

// Função para adicionar a classe de animação quando o elemento estiver visível
function handleScroll() {
    const elements = document.querySelectorAll('.fade-in-up');
    elements.forEach(element => {
        if (isElementInViewport(element)) {
            element.classList.add('animated');
        }
    });
}

// Adicionar evento de scroll para verificar a visibilidade
window.addEventListener('scroll', handleScroll);

// Aplicar a animação inicial para os elementos visíveis no carregamento da página
window.addEventListener('load', handleScroll);
