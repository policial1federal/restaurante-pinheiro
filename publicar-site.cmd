@echo off
rem Publica o site no Cloudflare Pages: https://restaurante-pinheiro.pages.dev
rem Vao para o ar: index.html e a pasta img (imagem de previa do link). O resto fica de fora.
set PASTA=%TEMP%\restaurante-pinheiro-site
if exist "%PASTA%" rmdir /s /q "%PASTA%"
mkdir "%PASTA%\img"
copy /y "%~dp0index.html" "%PASTA%\" >nul
copy /y "%~dp0img\*" "%PASTA%\img\" >nul
npx.cmd --yes wrangler pages deploy "%PASTA%" --project-name restaurante-pinheiro --branch master --commit-dirty=true
