
/* ---------- AVALIACOES: uma de cada vez, a cada 10s ---------- */
(function () {
    'use strict';
    var INTERVALO = 10000; // 10 segundos entre uma e outra
    var box = document.getElementById('avals');
    if (!box) return;

    var itens = Array.prototype.slice.call(box.querySelectorAll('.avals-item'));
    var pontos = Array.prototype.slice.call(box.querySelectorAll('.avals-ponto'));
    if (!itens.length) return;

    var atual = 0, timer = null;

    function mostrar(i) {
        atual = (i + itens.length) % itens.length;
        itens.forEach(function (el, n) { el.classList.toggle('ativa', n === atual); });
        pontos.forEach(function (el, n) { el.classList.toggle('ativo', n === atual); });
    }

    function iniciar() {
        clearInterval(timer);
        timer = setInterval(function () { mostrar(atual + 1); }, INTERVALO);
    }

    // ponto clicavel vai direto para aquela avaliacao e reinicia a contagem
    pontos.forEach(function (p, i) {
        p.addEventListener('click', function () { mostrar(i); iniciar(); });
    });

    // pausa quando a aba some: evita voltar com o indice adiantado
    document.addEventListener('visibilitychange', function () {
        if (document.hidden) clearInterval(timer); else iniciar();
    });

    mostrar(0);
    iniciar();
})();
