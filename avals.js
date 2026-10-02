/* ---------- AVALIACOES: uma de cada vez, a cada 10s ----------
   O cms.js monta os itens depois que este arquivo carrega, entao nao
   posso prender listener neles: a cada troca ele recria o HTML. Aqui
   os cliques usam delegacao no container e a lista e lida de novo a
   cada giro, que e o que mantem tudo vivo depois do render. */
(function () {
    'use strict';

    var INTERVALO = 10000;      // 10 segundos entre uma e outra
    var INTERVALO_MIN = 4000;   // teto quando a aba esta escondida

    function iniciar() {
        var box = document.getElementById('avals');
        if (!box) return;

        var trilho = box.querySelector('.avals-trilho');
        if (!trilho) return;

        // espera o cms.js ter montado os itens
        function itens() {
            return Array.prototype.slice.call(trilho.querySelectorAll('.avals-item'));
        }
        function pontos() {
            return Array.prototype.slice.call(box.querySelectorAll('.avals-ponto'));
        }

        if (!itens().length) {
            // o cms pode ainda estar buscando o JSON: tenta de novo em breve
            setTimeout(iniciar, 400);
            return;
        }

        var atual = -1;
        var timer = null;

        function mostrar(i) {
            var its = itens();
            if (!its.length) return;
            atual = ((i % its.length) + its.length) % its.length;
            its.forEach(function (el, n) { el.classList.toggle('ativa', n === atual); });
            pontos().forEach(function (el, n) { el.classList.toggle('ativo', n === atual); });
            ajustarAltura();
        }

        // o trilho e absoluto: precisa de altura para caber o item mais alto
        function ajustarAltura() {
            var its = itens();
            var alto = 0;
            its.forEach(function (el) {
                // mede com visibility:hidden para nao piscar a tela
                var anterior = el.style.cssText;
                el.style.cssText += ';visibility:hidden;opacity:0;position:static;display:flex;';
                alto = Math.max(alto, el.offsetHeight);
                el.style.cssText = anterior;
            });
            var t = trilho.querySelector('.avals-trilho') || trilho;
            if (t.style) t.style.minHeight = (alto + 8) + 'px';
        }

        function girar() { mostrar(atual + 1); }

        function comecar() {
            parar();
            timer = setInterval(girar, INTERVALO);
        }
        function parar() {
            if (timer) clearInterval(timer);
            timer = null;
        }

        // clique por delegacao: sobrevive ao cms reescrever os botoes
        box.addEventListener('click', function (ev) {
            var p = ev.target.closest ? ev.target.closest('.avals-ponto') : null;
            if (!p) return;
            var alvo = parseInt(p.getAttribute('data-i'), 10);
            if (isNaN(alvo)) return;
            mostrar(alvo);
            comecar();
        });

        // pausa quando a aba some: evita voltar com o indice adiantado
        document.addEventListener('visibilitychange', function () {
            if (document.hidden) parar(); else comecar();
        });

        // redimensionou, a altura do texto muda
        addEventListener('resize', ajustarAltura, { passive: true });

        mostrar(0);
        ajustarAltura();
        // corrige a altura depois que as fontes carregarem
        if (document.fonts && document.fonts.ready) {
            document.fonts.ready.then(function () { ajustarAltura(); });
        }
        setTimeout(ajustarAltura, 600);
        comecar();
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', iniciar);
    } else {
        iniciar();
    }
})();