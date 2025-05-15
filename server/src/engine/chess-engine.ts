import { ChildProcess, spawn } from 'child_process'
import path from 'path'
import fs from 'fs'
import axios from 'axios'

interface ChessMove {
  from: string
  to: string
  promotion?: string
}

interface GameState {
  isGameOver: boolean;
  winner?: number;
  reason?: string;
}

export class ChessEngine {
  private readonly apiUrl: string = 'https://stockfish-api-65pi.onrender.com'
  private readonly fallbackApiUrl: string = 'https://stockfish-api-65pi.onrender.com'
  private apiTimeout: number = 30000 // Reduced timeout to 30 seconds
  private isApiAvailable: boolean = false
  private retryCount: number = 3
  private retryDelay: number = 2000
  private lastRequestTime: number = 0
  private readonly keepAliveInterval: number = 300000 // 5 minutes
  private keepAliveTimer: NodeJS.Timeout | null = null
  private localStockfishPath: string | null = null

  constructor() {
    // Initialize local Stockfish path
    this.initializeLocalStockfish()
  }

  private initializeLocalStockfish(): void {
    const stockfishPath = process.platform === 'win32' 
      ? path.join(__dirname, '..', '..', 'stockfish', 'stockfish-windows-x86-64-avx2.exe')
      : path.join(__dirname, '..', '..', 'stockfish', 'stockfish-ubuntu-x86-64-avx2')
    
    if (fs.existsSync(stockfishPath)) {
      this.localStockfishPath = stockfishPath
      console.log('Local Stockfish found at:', stockfishPath)
    } else {
      console.warn('Local Stockfish not found at:', stockfishPath)
    }
  }

  private startKeepAlive(): void {
    if (this.keepAliveTimer) {
      clearInterval(this.keepAliveTimer)
    }

    this.keepAliveTimer = setInterval(async () => {
      try {
        await this.pingApi()
      } catch (error) {
        console.warn('Keep-alive ping failed:', error)
      }
    }, this.keepAliveInterval)
  }

  private async pingApi(): Promise<void> {
    try {
      const response = await axios.get(this.apiUrl, {
        timeout: 5000,
        headers: {
          'Accept': 'application/json'
        }
      })
      
      if (response.data?.status === 'ok') {
        this.lastRequestTime = Date.now()
        console.log('Keep-alive ping successful')
      } else {
        throw new Error('API returned non-ok status')
      }
    } catch (error) {
      console.warn('Keep-alive ping failed:', error)
      throw error
    }
  }

  private async sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms))
  }

  private async retryWithBackoff<T>(operation: () => Promise<T>, isKeepAlive: boolean = false): Promise<T> {
    let lastError: Error | null = null
    const maxRetries = isKeepAlive ? 1 : this.retryCount
    
    for (let i = 0; i < maxRetries; i++) {
      try {
        return await operation()
      } catch (error) {
        lastError = error as Error
        console.warn(`Attempt ${i + 1} failed:`, error)
        if (i < maxRetries - 1) {
          await this.sleep(this.retryDelay * Math.pow(2, i))
        }
      }
    }
    
    throw lastError || new Error('All retry attempts failed')
  }

  async initialize(): Promise<void> {
    try {
      await this.retryWithBackoff(async () => {
        const response = await axios.get(this.apiUrl, {
          timeout: this.apiTimeout,
          headers: {
            'Accept': 'application/json'
          }
        })
        
        if (response.data?.status === 'ok') {
          this.isApiAvailable = true
          this.lastRequestTime = Date.now()
          console.log('Stockfish API initialized successfully:', response.data)
          this.startKeepAlive()
          return
        }
        throw new Error('API returned non-ok status')
      })
    } catch (error) {
      console.warn('Primary API not available, trying fallback...')
      
      try {
        await this.retryWithBackoff(async () => {
          const fallbackResponse = await axios.get(this.fallbackApiUrl, {
            timeout: this.apiTimeout,
            headers: {
              'Accept': 'application/json'
            }
          })
          
          if (fallbackResponse.data?.status === 'ok') {
            this.isApiAvailable = true
            this.lastRequestTime = Date.now()
            console.log('Stockfish API (fallback) initialized successfully:', fallbackResponse.data)
            this.startKeepAlive()
            return
          }
          throw new Error('Fallback API returned non-ok status')
        })
      } catch (fallbackError) {
        console.warn('Both APIs unavailable, falling back to local Stockfish')
        if (!this.localStockfishPath) {
          throw new Error('No local Stockfish available and APIs are down')
        }
        this.isApiAvailable = true
      }
    }
  }

  private async makeApiRequest(endpoint: string, data?: any, isKeepAlive: boolean = false): Promise<any> {
    if (!this.isApiAvailable && this.localStockfishPath) {
      return this.makeLocalRequest(endpoint, data)
    }

    const urls = [this.apiUrl, this.fallbackApiUrl]
    const timeout = isKeepAlive ? 5000 : this.apiTimeout
    
    for (const url of urls) {
      try {
        return await this.retryWithBackoff(async () => {
          const response = await axios({
            method: data ? 'post' : 'get',
            url: `${url}${endpoint}`,
            data,
            timeout,
            headers: {
              'Content-Type': 'application/json',
              'Accept': 'application/json'
            }
          })
          
          // For status check endpoint, expect status: ok
          if (endpoint === '/') {
            if (response.data?.status === 'ok') {
              this.lastRequestTime = Date.now()
              return response.data
            }
            throw new Error('API status check failed')
          }
          
          // For other endpoints, check if response contains valid chess data
          if (response.data?.bestMove || response.data?.moves || response.data?.fen) {
            this.lastRequestTime = Date.now()
            return response.data
          }
          
          throw new Error(`Invalid API response: ${JSON.stringify(response.data)}`)
        }, isKeepAlive)
      } catch (error) {
        console.warn(`Failed to connect to ${url}${endpoint}:`, error)
        if (error instanceof Error) {
          console.warn('Error details:', {
            message: error.message,
            code: (error as any).code,
            stack: error.stack
          })
        }
        continue
      }
    }
    
    if (this.localStockfishPath) {
      console.log('Falling back to local Stockfish')
      return this.makeLocalRequest(endpoint, data)
    }
    
    throw new Error('All API endpoints are unavailable and no local fallback')
  }

  private async makeLocalRequest(endpoint: string, data?: any): Promise<any> {
    if (!this.localStockfishPath) {
      throw new Error('Local Stockfish not available')
    }

    const stockfish = spawn(this.localStockfishPath)
    let response = ''

    return new Promise((resolve, reject) => {
      stockfish.stdout.on('data', (data) => {
        response += data.toString()
      })

      stockfish.stderr.on('data', (data) => {
        console.error(`Local Stockfish error: ${data}`)
      })

      stockfish.on('close', (code) => {
        if (code !== 0) {
          reject(new Error(`Local Stockfish process exited with code ${code}`))
          return
        }

        try {
          const result = JSON.parse(response)
          resolve(result)
        } catch (error) {
          reject(new Error('Failed to parse local Stockfish response'))
        }
      })

      // Send command to Stockfish
      if (endpoint === '/api/bestmove' && data) {
        stockfish.stdin.write(`position fen ${data.fen}\n`)
        stockfish.stdin.write(`go movetime ${data.timeLimit || 1000}\n`)
      } else {
        stockfish.stdin.write('uci\n')
      }
    })
  }

  async getEngineInfo(): Promise<{ version: string; ready: boolean; cores: number }> {
    try {
      const data = await this.makeApiRequest('/')
      return {
        version: 'Stockfish 15.1',
        ready: data.status === 'ok',
        cores: 1
      }
    } catch (error) {
      console.error('Failed to get engine info:', error)
      throw error
    }
  }

  private async compileCppBot(sourcePath: string): Promise<string> {
    const outputPath = sourcePath.replace('.cpp', process.platform === 'win32' ? '.exe' : '')
    
    return new Promise((resolve, reject) => {
      const compiler = process.platform === 'win32' ? 'g++' : 'g++'
      const compileProcess = spawn(compiler, [
        sourcePath,
        '-o', outputPath,
        '-std=c++11',
        '-Wall',
        '-Wextra',
        '-O2',
        '-march=native'
      ])

      let errorOutput = ''

      compileProcess.stderr.on('data', (data) => {
        const error = data.toString()
        errorOutput += error
        console.error(`Compilation error: ${error}`)
      })

      compileProcess.on('close', (code) => {
        if (code === 0) {
          if (!fs.existsSync(outputPath)) {
            reject(new Error(`Compilation succeeded but executable was not created at ${outputPath}`))
            return
          }
          if (process.platform !== 'win32') {
            fs.chmodSync(outputPath, 0o755)
          }
          resolve(outputPath)
        } else {
          reject(new Error(`Compilation failed with code ${code}\n${errorOutput}`))
        }
      })

      setTimeout(() => {
        if (compileProcess.killed) return
        compileProcess.kill()
        reject(new Error('Compilation timed out after 30 seconds'))
      }, 30000)
    })
  }

  private async initializeBot(executablePath: string): Promise<ChildProcess> {
    const bot = spawn(executablePath)
    
    if (!bot.stdin || !bot.stdout) {
      throw new Error('Failed to initialize bot process')
    }

    try {
      bot.stdin.write('uci\n')
      bot.stdin.write('isready\n')
    } catch (error) {
      bot.kill()
      throw error
    }
    
    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        bot.kill()
        reject(new Error('Bot initialization timeout'))
      }, 5000)

      const handler = (data: Buffer) => {
        if (data.toString().includes('readyok')) {
          clearTimeout(timeout)
          bot.stdout?.removeListener('data', handler)
          resolve(bot)
        }
      }

      try {
        bot.stdout.on('data', handler)
        bot.on('error', (error) => {
          clearTimeout(timeout)
          reject(error)
        })
      } catch (error) {
        clearTimeout(timeout)
        bot.kill()
        reject(error)
      }
    })
  }

  private async getBotMove(bot: ChildProcess, position: string): Promise<string> {
    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        reject(new Error('Bot move timeout'))
      }, 5000)

      const moveHandler = (data: Buffer) => {
        const output = data.toString()
        if (output.includes('bestmove')) {
          clearTimeout(timeout)
          bot.stdout!.removeListener('data', moveHandler)
          const move = output.split('bestmove ')[1].split(' ')[0].trim()
          if (move && move !== '(none)') {
            resolve(move)
          } else {
            reject(new Error('Bot returned invalid move'))
          }
        }
      }

      try {
        bot.stdout!.on('data', moveHandler)
        bot.stdin!.write(`position fen ${position}\n`)
        bot.stdin!.write('go movetime 1000\n')
      } catch (error) {
        clearTimeout(timeout)
        reject(error)
      }
    })
  }

  async runMatch(bot1Path: string, bot2Path: string): Promise<{
    winner: number;
    reason: string;
    moves: string[];
    engineOutput?: string;
  }> {
    let bot1: ChildProcess | null = null
    let bot2: ChildProcess | null = null

    try {
      // Compile both bots if they are C++ files
      const bot1Executable = bot1Path.endsWith('.cpp') ? await this.compileCppBot(bot1Path) : bot1Path
      const bot2Executable = bot2Path.endsWith('.cpp') ? await this.compileCppBot(bot2Path) : bot2Path

      // Initialize both bots
      bot1 = await this.initializeBot(bot1Executable)
      bot2 = await this.initializeBot(bot2Executable)

      let currentFen = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1'
      const moves: string[] = []
      let currentPlayer = 1
      let moveCount = 0

      while (moveCount < 50) {
        const currentBot = currentPlayer === 1 ? bot1 : bot2

        try {
          // Get move from current bot
          const move = await this.getBotMove(currentBot!, currentFen)
          moves.push(move)

          // Get best move from Stockfish API with retry
          const data = await this.makeApiRequest('/api/bestmove', {
            moves: moves
          })
          
          if (!data.bestMove || data.bestMove === 'none') {
            return {
              winner: currentPlayer === 1 ? 2 : 1,
              reason: 'No legal moves available',
              moves,
              engineOutput: data.bestMove
            }
          }

          // Update position
          currentFen = data.newFen || currentFen

          moveCount++
          currentPlayer = currentPlayer === 1 ? 2 : 1
        } catch (error) {
          console.error(`Error during move ${moveCount + 1}:`, error)
          return {
            winner: currentPlayer === 1 ? 2 : 1,
            reason: `Bot error: ${error instanceof Error ? error.message : 'Unknown error'}`,
            moves
          }
        }
      }

      return {
        winner: 0,
        reason: 'Draw by move limit',
        moves
      }
    } finally {
      // Cleanup bots
      if (bot1?.stdin) bot1.stdin.write('quit\n')
      if (bot2?.stdin) bot2.stdin.write('quit\n')
      if (bot1) bot1.kill()
      if (bot2) bot2.kill()
    }
  }

  async startMatch(userAgentPath: string, opponentPath: string): Promise<{
    winner: number;
    reason: string;
    moves: string[];
  }> {
    return this.runMatch(userAgentPath, opponentPath)
  }

  async evaluatePosition(fen: string, timeLimit: number = 1000): Promise<{
    isGameOver: boolean;
    winner: number;
    reason: string;
    bestMove?: string;
  }> {
    try {
      const data = await this.makeApiRequest('/evaluate', {
        fen,
        timeLimit
      })
      
      return {
        isGameOver: data.isGameOver,
        winner: data.winner,
        reason: data.reason,
        bestMove: data.bestMove
      }
    } catch (error) {
      console.error('Failed to evaluate position:', error)
      throw error
    }
  }

  cleanup(): void {
    if (this.keepAliveTimer) {
      clearInterval(this.keepAliveTimer)
      this.keepAliveTimer = null
    }
  }
} 