const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

function compileBot(sourcePath, outputPath) {
  try {
    console.log(`Compiling ${sourcePath} to ${outputPath}...`);
    
    // Ensure the output directory exists
    const outputDir = path.dirname(outputPath);
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    // Compile the bot
    execSync(`g++ ${sourcePath} -o ${outputPath} -O2 -std=c++11`, {
      stdio: 'inherit'
    });

    console.log(`Successfully compiled ${sourcePath}`);
    return true;
  } catch (error) {
    console.error(`Failed to compile ${sourcePath}:`, error);
    return false;
  }
}

// Main execution
const botsDir = path.join(__dirname, '..', 'src', 'engine', 'agents');
const aggressiveBotSource = path.join(botsDir, 'aggressive_bot.cpp');
const aggressiveBotExecutable = path.join(botsDir, 'aggressive_bot.exe');

// Compile the aggressive bot
if (!fs.existsSync(aggressiveBotExecutable)) {
  const success = compileBot(aggressiveBotSource, aggressiveBotExecutable);
  if (!success) {
    console.error('Failed to compile aggressive bot');
    process.exit(1);
  }
}

console.log('Bot compilation completed successfully'); 