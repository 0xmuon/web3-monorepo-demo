@echo off
echo Compiling chess bots...

:: Create agents directory if it doesn't exist
if not exist "agents" mkdir agents

:: Compile random bot
g++ -std=c++17 -O3 agents/random_bot.cpp -o agents/random_bot.exe

:: Compile aggressive bot
g++ -std=c++17 -O3 agents/aggressive_bot.cpp -o agents/aggressive_bot.exe

echo Bots compiled successfully! 