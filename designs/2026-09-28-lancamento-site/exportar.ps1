# =========================================================
#  Lion Force — exportar as artes de Instagram em PNG
#  Uso: powershell -ExecutionPolicy Bypass -File exportar.ps1
#  Saida: PNG 1080x1350 (feed 4:5) e 1080x1920 (story 9:16)
# =========================================================

# O Chrome escreve o aviso de "bytes written" em stderr: nao tratar como erro.
$ErrorActionPreference = 'Continue'
$pasta = Split-Path -Parent $MyInvocation.MyCommand.Path
$chrome = 'C:\Program Files\Google\Chrome\Application\chrome.exe'

if (-not (Test-Path $chrome)) {
    $chrome = 'C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe'
}
if (-not (Test-Path $chrome)) {
    Write-Error 'Chrome ou Edge nao encontrado.'
    exit 1
}

$itens = @(
    @{ html = '01-feed-lancamento.html';  png = '01-feed-lancamento.png';  w = 1080; h = 1350 }
    @{ html = '02-feed-o-que-tem.html';   png = '02-feed-o-que-tem.png';   w = 1080; h = 1350 }
    @{ html = '03-feed-planos.html';      png = '03-feed-planos.png';      w = 1080; h = 1350 }
    @{ html = '04-feed-cta.html';         png = '04-feed-cta.png';         w = 1080; h = 1350 }
    @{ html = '07-feed-encerramento.html'; png = '07-feed-encerramento.png'; w = 1080; h = 1350 }
    @{ html = '05-story-lancamento.html'; png = '05-story-lancamento.png'; w = 1080; h = 1920 }
    @{ html = '06-story-cta.html';        png = '06-story-cta.png';        w = 1080; h = 1920 }
)

foreach ($i in $itens) {
    $origem = Join-Path $pasta $i.html
    $saida  = Join-Path $pasta $i.png
    $url    = 'file:///' + ($origem -replace '\\', '/')

    Write-Host ("Gerando {0} ({1}x{2})..." -f $i.png, $i.w, $i.h)

    & $chrome `
        --headless=new `
        --disable-gpu `
        --hide-scrollbars `
        --no-sandbox `
        --force-device-scale-factor=1 `
        --virtual-time-budget=20000 `
        --window-size=$($i.w),$($i.h) `
        --screenshot="$saida" `
        "$url" 2>$null | Out-Null

    if (Test-Path $saida) {
        $kb = [math]::Round((Get-Item $saida).Length / 1KB)
        Write-Host ("  ok -> {0} ({1} KB)" -f $i.png, $kb) -ForegroundColor Green
    } else {
        Write-Host ("  FALHOU: {0}" -f $i.png) -ForegroundColor Red
    }
}

Write-Host ''
Write-Host 'PNG gerados na mesma pasta.' -ForegroundColor Cyan
