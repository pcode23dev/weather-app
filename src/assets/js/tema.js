const body = document.querySelector("body");
const btnTema = document.getElementById("mudarTema");


btnTema.addEventListener("click", () => {
    const temaAtual = body.getAttribute("class");
    const novoTema = temaAtual === "modo-escuro" ? "modo-claro" : "modo-escuro";
    
    body.setAttribute("class", novoTema);
    localStorage.setItem("temaPreferido", novoTema); // salva o tema
});

// Ao carregar a página, verifica se já existe tema salvo
window.addEventListener("DOMContentLoaded", () => {
    const temaSalvo = localStorage.getItem("temaPreferido");
    if (temaSalvo) {
        body.setAttribute("class", temaSalvo);
    }
});
