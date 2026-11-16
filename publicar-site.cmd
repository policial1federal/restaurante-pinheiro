@echo off
rem Publica o site no Cloudflare Pages: https://restaurante-pinheiro.pages.dev
rem Vao para o ar: index.html e a pasta img (imagem de previa do link). O resto fica de fora.
set PASTA=%TEMP%\restaurante-pinheiro-site
if exist "%PASTA%" rmdir /s /q "%PASTA%"
mkdir "%PASTA%\img"
copy /y "%~dp0index.html" "%PASTA%\" >nul
copy /y "%~dp0img\*" "%PASTA%\img\" >nul
rem Voz gravada do video explicativo (audio\passo-1.mp3 ... passo-8.mp3), se existir
if exist "%~dp0audio" xcopy /y /i /q "%~dp0audio" "%PASTA%\audio" >nul
npx.cmd --yes wrangler pages deploy "%PASTA%" --project-name restaurante-pinheiro --branch master --commit-dirty=true
