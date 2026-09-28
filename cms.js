/* Lion Force CMS — renderiza conteúdo editável da pasta /conteudo */
(function () {
    'use strict';

    var io = new IntersectionObserver(function (entries) {
        entries.forEach(function (e) {
            if (e.isIntersecting) { e.target.classList.add('is-visible'); io.unobserve(e.target); }
        });
    }, { threshold: 0.12 });

    function refresh(root) {
        if (window.lucide) lucide.createIcons();
        root.querySelectorAll('.reveal:not(.is-visible)').forEach(function (el) { io.observe(el); });
    }

    function getJSON(path) {
        return fetch(path, { cache: 'no-store' }).then(function (r) {
            if (!r.ok) throw new Error('HTTP ' + r.status);
            return r.json();
        });
    }

    function esc(s) {
        return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
            return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
        });
    }

    /* ---------- PLANOS (index + planos) ---------- */
    function planCard(p) {
        var feats = (p.recursos || []).map(function (f) {
            return '<li><i data-lucide="check" class="icon"></i>' + esc(f) + '</li>';
        }).join('');
        return '<article class="plan reveal' + (p.destaque ? ' plan--featured' : '') + '" tabindex="0">' +
            (p.tag ? '<span class="plan-tag">' + esc(p.tag) + '</span>' : '') +
            '<h3>' + esc(p.nome) + '</h3>' +
            '<p class="plan-desc">' + esc(p.descricao) + '</p>' +
            '<div class="price">' + esc(p.preco) + '<small>,' + esc(p.valor) + esc(p.parcelas) + '</small></div>' +
            '<ul>' + feats + '</ul>' +
            '<a class="btn' + (p.destaque ? '' : ' btn--dark') + '" href="contato.html">Escolher ' + esc(p.nome.toLowerCase()) + '</a>' +
            '</article>';
    }

    function renderPlans() {
        var grid = document.getElementById('planosGrid');
        if (!grid) return;
        getJSON('conteudo/planos.json').then(function (data) {
            grid.innerHTML = (data.planos || []).map(planCard).join('');
            grid.querySelectorAll('.plan').forEach(function (card) {
                var pick = function () {
                    grid.querySelectorAll('.plan').forEach(function (c) { c.style.outline = c === card ? '2px solid var(--red)' : 'none'; });
                };
                card.addEventListener('click', pick);
                card.addEventListener('keydown', function (e) {
                    if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); pick(); }
                });
            });
            refresh(grid);
        }).catch(function () { /* mantém conteúdo estático de reserva */ });
    }

    /* ---------- DEPOIMENTOS (index) ---------- */
    function renderQuotes() {
        var box = document.getElementById('quotes');
        if (!box) return;
        getJSON('conteudo/depoimentos.json').then(function (data) {
            var textos = data.depoimentos || [], fotos = data.fotos || [], html = '', ti = 0, fi = 0, i = 0;
            var pattern = ['foto', 'texto', 'texto', 'foto', 'texto'];
            while (ti < textos.length || fi < fotos.length) {
                var kind = pattern[i % pattern.length];
                if (kind === 'foto' && fi < fotos.length) {
                    var f = fotos[fi++];
                    html += '<article class="quote quote--photo reveal"><img src="' + esc(f.src) + '" alt="' + esc(f.alt || 'Lion Force') + '" loading="lazy"></article>';
                } else if (ti < textos.length) {
                    var t = textos[ti++];
                    html += '<article class="quote reveal"><div class="stars" aria-label="5 de 5 estrelas">★★★★★</div><p>"' + esc(t.texto) + '"</p>' +
                        '<footer><div class="who"><div><strong>' + esc(t.nome) + '</strong><span>' + esc(t.unidade || '') + '</span></div></div>' +
                        (t.foto ? '<img class="avatar-photo" src="' + esc(t.foto) + '" alt="Foto de ' + esc(t.nome) + '" loading="lazy" onerror="this.style.display=\'none\'">' : '') +
                        '</footer></article>';
                } else if (fi < fotos.length) {
                    var f2 = fotos[fi++];
                    html += '<article class="quote quote--photo reveal"><img src="' + esc(f2.src) + '" alt="' + esc(f2.alt || 'Lion Force') + '" loading="lazy"></article>';
                }
                i++;
                if (i > 60) break;
            }
            if (html) { box.innerHTML = html; refresh(box); }
        }).catch(function () {});
    }

    /* ---------- GALERIA (jardim-das-fontes) ---------- */
    function renderGaleria() {
        var grid = document.getElementById('galeriaGrid');
        if (!grid) return;
        getJSON('conteudo/galeria.json').then(function (data) {
            var fotos = data.fotos || [];
            if (!fotos.length) return;
            grid.innerHTML = fotos.map(function (f) {
                return '<img src="' + esc(f.src) + '" alt="' + esc(f.alt || 'Lion Force Academia') + '" loading="lazy">';
            }).join('');
            refresh(grid);
        }).catch(function () {});
    }

    /* ---------- EQUIPE (equipe) ---------- */
    function renderEquipe() {
        var grid = document.getElementById('equipeGrid');
        if (!grid) return;
        getJSON('conteudo/equipe.json').then(function (data) {
            var membros = data.membros || [];
            if (!membros.length) {
                grid.innerHTML = '<article class="person person--original reveal"><h3>Equipe em montagem</h3><p>Os perfis dos treinadores serão apresentados aqui em breve.</p></article>';
            } else {
                grid.innerHTML = membros.map(function (m) {
                    return '<article class="person reveal">' +
                        (m.foto ? '<img src="' + esc(m.foto) + '" alt="' + esc(m.nome) + '" loading="lazy">' : '') +
                        '<h3>' + esc(m.nome) + '</h3><p>' + esc(m.cargo || '') + '</p></article>';
                }).join('');
            }
            refresh(grid);
        }).catch(function () {});
    }

    /* ---------- UNIDADE: ficha da busca + vitrine (unidade + jardim) ---------- */
    function precoPorNome(planos, nome) {
        var p = (planos || []).filter(function (x) { return (x.nome || '').toLowerCase() === nome; })[0];
        return p ? ('R$ ' + p.preco.replace(/^(\d+x\s*)/, '') + ',' + p.valor) : '';
    }

    function renderUnidade() {
        var needFinder = document.getElementById('finderCard');
        var needShow = document.getElementById('showcaseBox');
        if (!needFinder && !needShow) return;
        Promise.all([
            getJSON('conteudo/unidade.json').catch(function () { return null; }),
            getJSON('conteudo/planos.json').catch(function () { return null; })
        ]).then(function (res) {
            var u = res[0], planos = res[1] && res[1].planos;
            if (!u) return;
            var wa = 'https://wa.me/' + (u.whatsapp || '5511943544884') + '?text=' + encodeURIComponent('Quero conhecer a Lion Force!');
            if (needFinder) {
                needFinder.querySelector('[data-u="foto"]').src = u.fachada;
                needFinder.querySelector('[data-u="nome"]').textContent = u.nome;
                needFinder.querySelector('[data-u="endereco"]').textContent = u.endereco;
                needFinder.querySelector('[data-u="promo"]').textContent = u.promo;
                needFinder.querySelector('[data-u="mensal"]').textContent = precoPorNome(planos, 'mensal');
                needFinder.querySelector('[data-u="trimestral"]').textContent = precoPorNome(planos, 'trimestral');
                needFinder.querySelector('[data-u="anual"]').textContent = precoPorNome(planos, 'anual');
                refresh(needFinder);
            }
            if (needShow) {
                needShow.querySelector('[data-u="foto"]').src = u.fachada;
                var h = '';
                (u.horarioTabela || []).forEach(function (row) {
                    h += '<div><span>' + esc(row[0]) + '</span><strong>' + esc(row[1]) + '</strong></div>';
                });
                needShow.querySelector('[data-u="horarios"]').innerHTML = h;
                needShow.querySelector('[data-u="endereco"]').textContent = u.endereco;
                needShow.querySelector('[data-u="wa"]').href = wa;
                refresh(needShow);
            }
        });
    }

    document.addEventListener('DOMContentLoaded', function () {
        renderPlans();
        renderQuotes();
        renderGaleria();
        renderEquipe();
        renderUnidade();
        refresh(document);
    });
})();
