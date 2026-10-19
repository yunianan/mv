param(
    [ValidateRange(1,8)][int]$Workers = 1,
    [switch]$EncodeOnly
)
$ErrorActionPreference = 'Stop'
Push-Location -LiteralPath $PSScriptRoot
try {
    $localChrome = 'C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe'
    $localFFmpeg = [System.IO.Path]::GetFullPath((Join-Path $PSScriptRoot '..\..\.runtime\imageio_ffmpeg\binaries\ffmpeg-win-x86_64-v7.1.exe'))
    if (-not (Test-Path -LiteralPath $localChrome)) { throw '未找到本机 Edge，请修改脚本中的 localChrome 路径。' }
    if (-not (Test-Path -LiteralPath $localFFmpeg)) {
        $installedFFmpeg = Get-Command ffmpeg -ErrorAction SilentlyContinue
        if (-not $installedFFmpeg) { throw '请先安装FFmpeg并加入PATH，或修改脚本中的localFFmpeg路径。' }
        $localFFmpeg = $installedFFmpeg.Source
    }
    if (-not (Get-Command node -ErrorAction SilentlyContinue)) { throw '请先安装 Node.js。' }
    if (-not (Test-Path -LiteralPath 'node_modules\puppeteer-core')) {
        & npm install
        if ($LASTEXITCODE -ne 0) { throw 'npm install 失败。' }
    }
    if (-not $EncodeOnly) {
        & node render.mjs --frames "--workers=$Workers" "--chrome=$localChrome"
        if ($LASTEXITCODE -ne 0) { throw '帧渲染中断；再次执行可从缺失帧继续。' }
    }
    & node render.mjs --encode --fps=24 --expected-frames=6938 '--audio=assets/song.mp3' '--out=out/我怀念的-留在右边的位置-MV.mp4' "--chrome=$localChrome" "--ffmpeg=$localFFmpeg"
    if ($LASTEXITCODE -ne 0) { throw '视频编码未完成。' }
    Write-Host '完成：out\我怀念的-留在右边的位置-MV.mp4'
} finally { Pop-Location }
