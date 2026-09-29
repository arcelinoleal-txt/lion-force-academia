# Designs — Instagram

Pasta para os arquivos visuais das publicações do Instagram do Lion Force.

## Como usar

Coloque aqui os arquivos que serão exportados para o Instagram, Keepers e Reels.
Nomes sugeridos, sempre com data no formato `AAAA-MM-DD` para facilitar a ordem cronológica:

```
designs/
├── 2026-09-28-manha-livre/
│   ├── 01-feed-1080x1350.jpg
│   ├── 02-story-1080x1920.jpg
│   └── legenda.txt
└── 2026-10-05-treino-de-pernas/
    ├── 01-carrossel-01.jpg
    ├── 02-carrossel-02.jpg
    └── legenda.txt
```

## Formatos

| Tipo | Tamanho | Proporção |
| --- | --- | --- |
| Feed (post) | 1080 x 1350 px | 4:5 |
| Feed (quadrado) | 1080 x 1080 px | 1:1 |
| Stories / Reels | 1080 x 1920 px | 9:16 |
| Capa de destaque | 1080 x 1080 px | 1:1 |

## Separadores

Cada postagem fica em uma pasta própria com a data e o tema. A `legenda.txt` guarda o texto
publicado, com as hashtags, para não precisar reproduzir tudo depois.

## Observações

- Exportar em JPEG para feed e Stories, PNG quando houver fundo transparente.
- Manter o mesmo tratamento visual das artes do site (cores e tipografia definidas em `styles.css`),
  para o feed continuar com a identidade da página.
- Fotos usadas nas artes podem vir de `fotos/`; não duplicar arquivos, apenas referenciar.
