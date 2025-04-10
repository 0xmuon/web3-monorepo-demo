#!/bin/bash

# Compile random bot
g++ -std=c++17 -O3 agents/random_bot.cpp -o agents/random_bot
g++ -std=c++17 -O3 agents/aggressive_bot.cpp -o agents/aggressive_bot

echo "Bots compiled successfully!" 