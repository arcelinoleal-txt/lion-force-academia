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

    /* ---------- EQUIPE (equipe + time da unidade) ---------- */
    var unitNames = {};

    function personCard(m, uname) {
        var foto = m.foto || '';
        var tag = (foto ? '' : ' person--placeholder') + (m.destaque ? ' person--destaque' : '');
        var insta = m.instagram ? '<a class="person-insta" href="' + esc(m.instagram) + '" target="_blank" rel="noreferrer"><i data-lucide="instagram" class="icon"></i> Instagram</a>' : '';
        var media = foto
            ? '<div class="person-media"><img src="' + esc(foto) + '" alt="' + esc(m.nome) + '" loading="lazy">' + (m.cargo ? '<span class="person-role">' + esc(m.cargo.split('\u00b7')[0].trim()) + '</span>' : '') + '</div>'
            : '<div class="person-media"><i data-lucide="user" class="icon"></i></div>';
        return '<article class="person' + tag + ' reveal">' + media +
            '<h3>' + esc(m.nome) + '</h3>' +
            (m.cargo ? '<p>' + esc(m.cargo) + (uname ? ' \u00b7 ' + esc(uname) : '') + '</p>' : (uname ? '<p>' + esc(uname) + '</p>' : '')) +
            insta + '</article>';
    }

    function setupTeamNav(grid) {
        var nav = grid.parentNode.querySelector('[data-team-nav]');
        if (!nav) return;
        var prev = nav.querySelector('[data-team-prev]');
        var next = nav.querySelector('[data-team-next]');
        var count = nav.querySelector('[data-team-count]');
        function step() {
            var card = grid.querySelector('.person');
            if (!card) return 280;
            var gap = parseFloat(getComputedStyle(grid).columnGap || '18') || 18;
            return card.getBoundingClientRect().width + gap;
        }
        function sync() {
            var over = grid.scrollWidth - grid.clientWidth;
            var multi = over > 8;
            nav.hidden = !multi;
            if (!multi) return;
            prev.disabled = grid.scrollLeft <= 4;
            next.disabled = grid.scrollLeft >= over - 4;
        }
        prev.addEventListener('click', function () { grid.scrollBy({ left: -step(), behavior: 'smooth' }); });
        next.addEventListener('click', function () { grid.scrollBy({ left: step(), behavior: 'smooth' }); });
        grid.addEventListener('scroll', sync, { passive: true });
        addEventListener('resize', sync, { passive: true });
        if (count) {
            var total = grid.querySelectorAll('.person').length;
            count.textContent = total + (total === 1 ? ' profissional' : ' profissionais');
        }
        sync();
    }

    function renderEquipe() {
        var grids = document.querySelectorAll('#equipeGrid, [data-equipe-unidade]');
        if (!grids.length) return;
        Promise.all([
            getJSON('conteudo/equipe.json').catch(function () { return null; }),
            getJSON('conteudo/unidades.json').catch(function () { return null; })
        ]).then(function (res) {
            var membros = (res[0] && res[0].membros) || [];
            ((res[1] && res[1].unidades) || []).forEach(function (u) { unitNames[u.id] = u.nome; });
            grids.forEach(function (grid) {
                var onlyUnit = grid.getAttribute('data-equipe-unidade');
                var list = onlyUnit ? membros.filter(function (m) { return m.unidade === onlyUnit; }) : membros;
                if (onlyUnit && !list.length) {
                    var sec = grid.closest('section');
                    if (sec) sec.style.display = 'none';
                    return;
                }
                if (!list.length) {
                    grid.classList.add('team-grid--empty');
                    grid.innerHTML = '<article class="person person--original reveal"><h3>Equipe em montagem</h3><p>Os perfis dos treinadores serão apresentados aqui em breve.</p></article>';
                } else {
                    grid.classList.remove('team-grid--empty');
                    grid.innerHTML = list.map(function (m) {
                        var uname = !onlyUnit && m.unidade && unitNames[m.unidade] ? unitNames[m.unidade] : '';
                        return personCard(m, uname);
                    }).join('');
                }
                refresh(grid);
                setupTeamNav(grid);
            });
        }).catch(function () {});
    }

    /* ---------- UNIDADES: busca (unidade) + vitrine (jardim-*) ---------- */
    function precoPorNome(planos, nome) {
        var p = (planos || []).filter(function (x) { return (x.nome || '').toLowerCase() === nome; })[0];
        return p ? ('R$ ' + p.preco.replace(/^(\d+x\s*)/, '') + ',' + p.valor) : '';
    }

    function unitCard(u, planos) {
        var tags = (u.recursos || []).join(' ');
        var hay = ((u.nome || '') + ' ' + (u.endereco || '') + ' Lion Force').toLowerCase();
        return '<article class="unit-item reveal" data-name="' + esc(hay) + '" data-addr="" data-tags="' + esc(tags) + '">' +
            '<img src="' + esc(u.fachada || '') + '" alt="Fachada ' + esc(u.nome || '') + '" loading="lazy">' +
            '<div class="unit-item-body"><h3>' + esc(u.nome) + '</h3>' +
            '<address>' + esc(u.endereco) + '</address>' +
            '<a class="unit-link" href="' + esc(u.pagina || '#') + '">Ver academia <i data-lucide="arrow-right" class="icon" style="width:14px;height:14px"></i></a>' +
            '<span class="unit-promo">' + esc(u.promo || '') + '</span>' +
            '<div class="unit-prices">' +
            '<div><strong>Mensal</strong><span>' + esc(precoPorNome(planos, 'mensal')) + '</span></div>' +
            '<div><strong>Trimestral</strong><span>' + esc(precoPorNome(planos, 'trimestral')) + '</span></div>' +
            '<div><strong>Anual</strong><span>' + esc(precoPorNome(planos, 'anual')) + '</span></div>' +
            '</div></div></article>';
    }

    function renderUnidade() {
        var list = document.getElementById('unitList');
        var needShow = document.getElementById('showcaseBox');
        if (!list && !needShow) return;
        Promise.all([
            getJSON('conteudo/unidades.json').catch(function () { return null; }),
            getJSON('conteudo/planos.json').catch(function () { return null; })
        ]).then(function (res) {
            var unidades = (res[0] && res[0].unidades) || [];
            var planos = res[1] && res[1].planos;
            if (!unidades.length) return;
            if (list) {
                list.innerHTML = unidades.map(function (u) { return unitCard(u, planos); }).join('');
                var count = document.getElementById('unitCount');
                if (count) count.textContent = unidades.length === 1 ? '1 unidade encontrada' : unidades.length + ' unidades encontradas';
                refresh(list);
            }
            if (needShow) {
                var uid = needShow.getAttribute('data-unit');
                var u = unidades.filter(function (x) { return x.id === uid; })[0] || unidades[0];
                needShow.querySelector('[data-u="foto"]').src = u.fachada;
                var h = '';
                (u.horarioTabela || []).forEach(function (row) {
                    h += '<div><span>' + esc(row[0]) + '</span><strong>' + esc(row[1]) + '</strong></div>';
                });
                needShow.querySelector('[data-u="horarios"]').innerHTML = h;
                needShow.querySelector('[data-u="endereco"]').textContent = u.endereco;
                needShow.querySelector('[data-u="wa"]').href = 'https://wa.me/' + (u.whatsapp || '5511943544884') + '?text=' + encodeURIComponent('Quero conhecer a Lion Force!');
                refresh(needShow);
            }
        });
    }

    /* ---------- NOSSA HISTÓRIA ---------- */
    function renderHistoria() {
        var box = document.getElementById('historiaBox');
        if (!box) return;
        getJSON('conteudo/historia.json').then(function (d) {
            var h = d.historia || {};
            var f = h.fundador || {};
            var temFoto = !!f.foto;
            var marca = (h.marca || []).map(function (m) {
                return '<li><i data-lucide="check" class="icon"></i><span>' + esc(m) + '</span></li>';
            }).join('');

            box.innerHTML =
                '<div class="founder-card' + (temFoto ? '' : ' founder-card--empty') + ' reveal">' +
                '<div class="person-media">' +
                (temFoto
                    ? '<img src="' + esc(f.foto) + '" alt="' + esc(f.nome) + '" loading="lazy">'
                    : '<i data-lucide="user" class="icon"></i>') +
                (f.cargo ? '<span class="founder-tag">' + esc(f.cargo) + '</span>' : '') +
                '</div>' +
                '<h3>' + esc(f.nome || 'Nome do Fundador') + '</h3>' +
                (f.resumo ? '<p class="founder-bio">' + esc(f.resumo) + '</p>' : '') +
                (f.instagram ? '<a class="founder-insta" href="' + esc(f.instagram) + '" target="_blank" rel="noreferrer"><i data-lucide="instagram" class="icon"></i> Instagram</a>' : '') +
                '</div>' +

                '<div class="historia-text reveal">' +
                '<p class="eyebrow">' + esc(h.subtitulo || 'Nossa história') + '</p>' +
                '<h3>' + esc(h.titulo || 'Nossa história') + '</h3>' +
                (h.texto1 ? '<p>' + esc(h.texto1) + '</p>' : '') +
                (h.texto2 ? '<p>' + esc(h.texto2) + '</p>' : '') +
                (marca ? '<ul class="historia-marca">' + marca + '</ul>' : '') +
                '<div class="hero-actions" style="margin-top:28px">' +
                '<a class="btn" href="contato.html">Quero treinar <i data-lucide="arrow-right" class="icon"></i></a>' +
                '<a class="btn btn--ghost" href="equipe.html">Ver a equipe</a>' +
                '</div></div>';

            refresh(box);
        }).catch(function () {});
    }

    /* ---------- TEXTOS GLOBAIS (horários, contatos, números) ---------- */
    function aplicarTextos(t) {
        if (!t) return;
        var semana = t.horarioSemana, sab = t.horarioSabado, wa = t.whatsapp;
        var faixa = 'Seg a Sex · ' + semana + ' · Sáb · ' + sab;
        var topo = 'Segunda a sexta · ' + semana + ' · Sábado · ' + sab;

        document.querySelectorAll('.topbar span:last-child').forEach(function (el) {
            var txt = el.textContent.replace(/Seg a Sex.*$/i, faixa);
            el.innerHTML = txt;
            var link = el.querySelector('a');
            if (link && wa) link.href = 'https://wa.me/' + wa;
        });
        document.querySelectorAll('.foot-base .wrap span:last-child').forEach(function (el) {
            el.textContent = faixa;
        });
        document.querySelectorAll('[data-txt="nota"]').forEach(function (el) { el.textContent = t.nota; });
        document.querySelectorAll('[data-txt="avaliacoes"]').forEach(function (el) { el.textContent = t.avaliacoes; });
        document.querySelectorAll('[data-txt="areaM2"]').forEach(function (el) { el.textContent = t.areaM2; });
        document.querySelectorAll('[data-txt="anosHistoria"]').forEach(function (el) { el.textContent = t.anosHistoria; });
        if (wa) {
            document.querySelectorAll('a[href*="wa.me"]').forEach(function (a) {
                a.href = 'https://wa.me/' + wa;
            });
        }
        if (t.email) {
            document.querySelectorAll('a[href^="mailto:"]').forEach(function (a) { a.href = 'mailto:' + t.email; });
        }
        if (t.instagram) {
            document.querySelectorAll('a[href*="instagram.com/lionforce"]').forEach(function (a) { a.href = t.instagram; });
        }
        if (t.telefone) {
            document.querySelectorAll('a[href^="tel:"]').forEach(function (a) { a.textContent = t.telefone; });
        }
    }

    function renderTextos() {
        return getJSON('conteudo/textos.json')
            .then(function (d) { aplicarTextos(d.textos || {}); })
            .catch(function () { });
    }

    document.addEventListener('DOMContentLoaded', function () {
        renderTextos();
        renderPlans();
        renderQuotes();
        renderGaleria();
        renderEquipe();
        renderHistoria();
        renderUnidade();
        refresh(document);
    });
})();
