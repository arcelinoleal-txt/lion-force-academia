# Lançamento do site — Lion Force

Carrossel de 5 artes + 2 stories para o lançamento do site no Instagram.
Sistema visual extraído do próprio site (`styles.css`), para o feed não fugir do padrão.

## Arquivos

| Arquivo | Formato | Uso |
| --- | --- | --- |
| `01-feed-lancamento.png` | 1080x1350 | Gancho — o que é, por que importa |
| `02-feed-o-que-tem.png` | 1080x1350 | Valor — o que tem dentro do site |
| `03-feed-planos.png` | 1080x1350 | Oferta — planos e preços |
| `04-feed-cta.png` | 1080x1350 | Conversão — endereço, WhatsApp, link |
| `07-feed-encerramento.png` | 1080x1350 | Encerramento — compartilhar, salvar, seguir + QR |
| `05-story-lancamento.png` | 1080x1920 | Story de abertura |
| `06-story-cta.png` | 1080x1920 | Story de chamada para ação |
| `legendas-e-roteiro.txt` | — | Legenda, alt-text, hashtags e ordem de publicação |

Os `.html` e o `brand.css` são as fontes das artes. Para mudar texto, cor ou layout,
edite o HTML e rode a exportação de novo:

```powershell
powershell -ExecutionPolicy Bypass -File exportar.ps1
```

## Padrão visual

- Cores: `#0a0a0b` (fundo), `#131315` (painel), `#e3212a` (destaque), `#b6111d` (hover)
- Títulos: Barlow Condensed 900 em caixa alta, entrelinha 0.9
- Textos: DM Sans
- Assinaturas repetidas em todas as artes: logo do leão no topo, `@lionforce_academia`
  à direita e faixa vermelha de números no rodapé
- Marca d'água do leão em 13% de opacidade, atrás do texto

Conteúdo principal dentro do quadrado central (1080x1080) para continuar legível
na grade do perfil, que recorta as laterais.

## Marcas usadas

- `assets/logo-lion-force.png` — recorte da logo com o leão, usada no topo das artes
- `assets/leao-mascote.png` — só o leão, usado como marca d'água
- `assets/qr-site.png` — QR code do endereço do site, usado no encerramento
- Origem: `designs/Lion force logo com leao.jpeg`

Trocar o destino do QR: gerar de novo com a URL definitiva e salvar em
`assets/qr-site.png`, depois rodar `exportar.ps1` novamente.
