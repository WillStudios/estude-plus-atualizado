<#
.SYNOPSIS
  Script de Publicação Automática do ESTUDE+ para o GitHub
.DESCRIPTION
  Adiciona o repositório remoto do GitHub e faz o push da branch main.
.EXAMPLE
  .\deploy_github.ps1 -RepoUrl "https://github.com/SEU_USUARIO/estude-plus.git"
#>
param(
  [Parameter(Mandatory=$false)]
  [string]$RepoUrl
)

$env:Path = [System.Environment]::GetEnvironmentVariable("Path","Machine") + ";" + [System.Environment]::GetEnvironmentVariable("Path","User")

if (-not (Get-Command git -ErrorAction SilentlyContinue)) {
  Write-Host "Erro: Git não encontrado no PATH." -ForegroundColor Red
  exit 1
}

Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host "  🚀 PUBLICADOR AUTOMÁTICO ESTUDE+ • GITHUB DEPLOY       " -ForegroundColor Yellow
Write-Host "==========================================================" -ForegroundColor Cyan

if (-not $RepoUrl) {
  $existingRemote = git remote get-url origin 2>$null
  if ($existingRemote) {
    Write-Host "Remote origin já configurado: $existingRemote" -ForegroundColor Green
    $RepoUrl = $existingRemote
  } else {
    $RepoUrl = Read-Host "Cole a URL do seu repositório no GitHub (Ex: https://github.com/seu-usuario/estude-plus.git)"
  }
}

if (-not $RepoUrl) {
  Write-Host "URL não informada. Operação cancelada." -ForegroundColor Red
  exit 1
}

# Verifica se o remote origin já existe
$hasOrigin = git remote | Select-String "origin"
if ($hasOrigin) {
  git remote set-url origin $RepoUrl
} else {
  git remote add origin $RepoUrl
}

Write-Host "Configurando branch main..." -ForegroundColor Cyan
git branch -M main

Write-Host "Adicionando alterações e fazendo commit..." -ForegroundColor Cyan
git add .
git commit -m "update: sincronizacao automatica ESTUDE+ $(Get-Date -Format 'dd/MM/yyyy HH:mm')" 2>$null

Write-Host "Enviando código para o GitHub ($RepoUrl)..." -ForegroundColor Yellow
git push -u origin main

if ($LASTEXITCODE -eq 0) {
  Write-Host "==========================================================" -ForegroundColor Green
  Write-Host "  ✅ SUCESSO! Código publicado com sucesso no GitHub!     " -ForegroundColor Green
  Write-Host "==========================================================" -ForegroundColor Green
} else {
  Write-Host "Houve um erro no envio. Verifique suas credenciais de login do GitHub." -ForegroundColor Red
}
