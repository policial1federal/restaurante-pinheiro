@echo off
rem Publica o site no Cloudflare Pages: https://restaurante-pinheiro.pages.dev
rem So o index.html vai para o ar (o resto da pasta fica de fora).
set PASTA=%TEMP%\restaurante-pinheiro-site
if exist "%PASTA%" rmdir /s /q "%PASTA%"
mkdir "%PASTA%"
copy /y "%~dp0index.html" "%PASTA%\" >nul
npx.cmd --yes wrangler pages deploy "%PASTA%" --project-name restaurante-pinheiro --branch master --commit-dirty=true
