"use client"

import { useState, useEffect, useCallback } from "react"
import { useWallet } from "@solana/wallet-adapter-react"
import { toast } from "react-hot-toast"
import { Navbar } from "@/components/navbar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { startMatch, fetchUserStats, fetchUser } from '../../lib/api'
import { LoadingState } from "@/components/ui/loading-state"
import Footer from "@/components/footer"

const leaderboardData = [
  { rank: 1, name: "AlphaChess", wins: 150, losses: 20 },
  { rank: 2, name: "DeepMate", wins: 140, losses: 30 },
  { rank: 3, name: "QuantumKnight", wins: 130, losses: 40 },
  { rank: 4, name: "NeuralRook", wins: 120, losses: 50 },
  { rank: 5, name: "AIBishop", wins: 110, losses: 60 },
]

interface UploadResponse {
  message: string;
  fileId: string;
}

interface EngineStatus {
  version: string;
  ready: boolean;
  cores: number;
}

interface Agent {
  id: string;
  name: string;
  owner: string;
  wins: number;
  losses: number;
  draws: number;
  points: number;
  rank: number;
  fileId: string;
  walletAddress: string;
}

interface MatchResult {
  winner: number;
  reason: string;
  moves?: string[];
}

interface UploadState {
  file: File | null;
  uploading: boolean;
  error: string | null;
  success: boolean;
}

interface User {
  username: string;
  walletAddress: string;
}

interface MatchStatus {
  status: 'idle' | 'compiling' | 'running' | 'completed' | 'error';
  message?: string;
  result?: MatchResult;
  engineOutput?: string;
}

const MatchResultDisplay = ({ status, result, engineOutput, message }: MatchStatus) => {
  if (status === 'idle') return null;

  // Parse Stockfish output to extract key information
  const parseStockfishOutput = (output: string | undefined) => {
    if (!output) return null;
    
    // Extract the latest evaluation
    const evalLines = output.split('\n').filter(line => line.includes('info depth') && line.includes('score'));
    const latestEval = evalLines.length > 0 ? evalLines[evalLines.length - 1] : null;
    
    // Extract the best move
    const bestMoveLine = output.split('\n').find(line => line.includes('bestmove'));
    const bestMove = bestMoveLine ? bestMoveLine.split(' ')[1] : null;
    
    // Extract the principal variation
    const pvLine = output.split('\n').find(line => line.includes('pv'));
    const pv = pvLine ? pvLine.split('pv ')[1].split(' ').slice(0, 10) : null;
    
    // Extract the current position
    const positionLines = output.split('\n').filter(line => line.includes('Position:'));
    const currentPosition = positionLines.length > 0 ? positionLines[positionLines.length - 1].split('Position: ')[1] : null;
    
    return {
      latestEval,
      bestMove,
      pv,
      currentPosition
    };
  };
  
  const stockfishInfo = parseStockfishOutput(engineOutput);

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-6">
      <h3 className="text-xl font-semibold mb-4">Match Status</h3>
      
      {status === 'running' && (
        <div className="flex items-center space-x-3">
          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-500"></div>
          <p className="text-black">{message}</p>
        </div>
      )}
      
      {status === 'completed' && result && (
        <div className="space-y-4">
          <div className="flex items-center space-x-2">
            <span className="font-medium">Result:</span>
            <span className={`px-2 py-1 rounded text-sm ${
              result.winner === 1 ? 'bg-green-100 text-green-800' :
              result.winner === 2 ? 'bg-red-100 text-red-800' :
              'bg-yellow-100 text-yellow-800'
            }`}>
              {result.winner === 1 ? 'You Won!' : 
               result.winner === 2 ? 'Bot Won' : 
               'Draw'}
            </span>
          </div>
          
          <div className="text-sm text-gray-600">
            <p>Reason: {result.reason}</p>
          </div>

          {engineOutput && (
            <div className="mt-4">
              <h4 className="font-medium mb-2">Engine Analysis:</h4>
              <div className="bg-gray-50 p-3 rounded text-sm overflow-x-auto">
                <pre className="whitespace-pre-wrap text-black">{engineOutput}</pre>
              </div>
              
              {stockfishInfo && (
                <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-3">
                  {stockfishInfo.latestEval && (
                    <div className="bg-blue-50 p-3 rounded">
                      <h5 className="font-medium text-black">Latest Evaluation</h5>
                      <p className="text-sm text-black">{stockfishInfo.latestEval}</p>
                    </div>
                  )}
                  
                  {stockfishInfo.bestMove && (
                    <div className="bg-green-50 p-3 rounded">
                      <h5 className="font-medium text-black">Best Move</h5>
                      <p className="text-sm font-mono text-black">{stockfishInfo.bestMove}</p>
                    </div>
                  )}
                  
                  {stockfishInfo.pv && (
                    <div className="bg-purple-50 p-3 rounded">
                      <h5 className="font-medium text-black">Principal Variation</h5>
                      <p className="text-sm font-mono text-black">{stockfishInfo.pv.join(' ')}</p>
                    </div>
                  )}
                  
                  {stockfishInfo.currentPosition && (
                    <div className="bg-yellow-50 p-3 rounded">
                      <h5 className="font-medium text-black">Current Position</h5>
                      <p className="text-sm font-mono text-black">{stockfishInfo.currentPosition}</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
          
          {result?.moves && result.moves.length > 0 && (
            <div>
              <h4 className="font-medium mb-2">Match Moves:</h4>
              <div className="bg-gray-50 p-3 rounded max-h-60 overflow-y-auto">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  {result.moves && Array.from({ length: Math.ceil(result.moves.length / 2) }).map((_, i) => {
                    const moves = result.moves as string[];
                    const whiteMove = moves[i * 2];
                    const blackMove = moves[i * 2 + 1];
                    return (
                      <div key={i} className="flex items-center space-x-2">
                        <span className="font-mono w-8 text-black">{i + 1}.</span>
                        <div className="flex space-x-4">
                          <span className="font-mono w-12 text-black">{whiteMove}</span>
                          {blackMove && (
                            <span className="font-mono w-12 text-black">{blackMove}</span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
                <div className="mt-2 text-xs text-black">
                  Total moves: {result.moves.length}
                </div>
              </div>
        </div>
      )}
        </div>
      )}
      
      {status === 'error' && (
        <div className="text-red-600 bg-red-50 p-4 rounded-md">
          <div className="flex items-center">
            <svg className="h-5 w-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
            <p className="font-medium">Error: {message}</p>
          </div>
          <p className="mt-2 text-sm">
            {message && message.includes('backend') 
              ? 'The backend server appears to be down or not responding. Please try again later or contact support.'
              : 'Please try again later.'}
          </p>
        </div>
      )}
    </div>
  );
};

export default function ChessCompetition() {
  const { publicKey } = useWallet();
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [engineStatus, setEngineStatus] = useState("Loading engine status...");
  const [leaderboard, setLeaderboard] = useState<Agent[]>([]);
  const [matchStatus, setMatchStatus] = useState<MatchStatus>({
    status: 'idle'
  });
  const [uploadState, setUploadState] = useState<UploadState>({
    file: null,
    uploading: false,
    error: null,
    success: false
  });

  const fetchUserData = useCallback(async () => {
    if (!publicKey) {
      setIsLoading(false);
      return;
    }
    try {
      // Use the Next.js API route instead of direct backend call
      const response = await fetch(`/api/users/${publicKey.toString()}`);
      if (!response.ok) throw new Error('Failed to fetch user data');
      const data = await response.json();
      setUser(data);
      console.log('User data fetched:', data);
    } catch (error) {
      console.error('Error fetching user:', error);
      toast.error('Failed to fetch user data');
    } finally {
      setIsLoading(false);
    }
  }, [publicKey]);

  useEffect(() => {
    if (publicKey) {
      fetchUserData();
      fetchLeaderboard(); // Fetch leaderboard when component mounts
    } else {
      setIsLoading(false);
    }
  }, [publicKey, fetchUserData]);

  const fetchLeaderboard = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/chess/leaderboard`);
      if (!response.ok) {
        throw new Error('Failed to fetch leaderboard');
      }
      const data = await response.json();
      console.log('Leaderboard data:', data);
      setLeaderboard(data);
    } catch (error) {
      console.error('Failed to fetch leaderboard:', error);
      toast.error('Failed to fetch leaderboard');
    } finally {
      setIsLoading(false);
    }
  };

  // Refresh leaderboard after match completion
  useEffect(() => {
    if (matchStatus.status === 'completed') {
      fetchLeaderboard();
    }
  }, [matchStatus.status]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) {
      setUploadState(prev => ({ ...prev, error: 'Please select a file' }));
      return;
    }

    if (!file.name.endsWith('.cpp')) {
      setUploadState(prev => ({ ...prev, error: 'Only C++ (.cpp) files are allowed' }));
      return;
    }

    setUploadState(prev => ({ 
      ...prev, 
      file, 
      error: null,
      success: false 
    }));
  };

  const handleUpload = async () => {
    if (!publicKey) {
      toast.error('Please connect your wallet');
      return;
    }

    if (!uploadState.file) {
      toast.error('Please select a file');
      return;
    }

    setUploadState(prev => ({ ...prev, uploading: true, error: null }));
    setMatchStatus({
      status: 'running',
      message: 'Uploading and compiling your agent...'
    });

    try {
      const formData = new FormData();
      formData.append('file', uploadState.file);
      formData.append('wallet', publicKey.toString());

      console.log('Uploading file:', uploadState.file.name);

      // Use the direct backend URL
      const uploadResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/upload/agent`, {
        method: 'POST',
        body: formData,
      });

      if (!uploadResponse.ok) {
        const errorData = await uploadResponse.json();
        throw new Error(errorData.error || errorData.message || 'Upload failed');
      }

      const uploadData = await uploadResponse.json();
      console.log('Upload successful:', uploadData);

      setMatchStatus({
        status: 'running',
        message: 'Starting match against aggressive bot...'
      });

      // Use the direct backend URL for match creation
      const matchResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/chess/match`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          fileId: uploadData.fileId,
          walletAddress: publicKey.toString()
        }),
      });

      if (!matchResponse.ok) {
        const errorData = await matchResponse.json();
        throw new Error(errorData.message || 'Failed to start match');
      }

      const matchData = await matchResponse.json();
      
      // Start polling for match status
      let pollCount = 0;
      const maxPolls = 150; // 5 minutes at 2-second intervals
      const pollInterval = 2000;
      
      const pollMatchStatus = async () => {
        try {
          console.log(`Polling match status (attempt ${pollCount + 1}/${maxPolls})`);
          
          // Use the direct backend URL
          const resultResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/chess/match?matchId=${matchData.matchId}`);
          
          if (!resultResponse.ok) {
            const errorData = await resultResponse.json();
            console.error('Match status error:', errorData);
            setMatchStatus({
              status: 'error',
              message: errorData.error || errorData.message || 'Failed to check match status'
            });
            return true; // Stop polling
          }
          
          const resultData = await resultResponse.json();
          console.log('Match status update:', resultData);
          
          setMatchStatus({
            status: resultData.status,
            message: resultData.message,
            result: resultData.result,
            engineOutput: resultData.engineOutput
          });
          
          return resultData.status === 'completed'; // Stop polling if match is completed
          
        } catch (error) {
          console.error('Error polling match status:', error);
          pollCount++;
          if (pollCount >= maxPolls) {
            setMatchStatus({
              status: 'error',
              message: 'Failed to check match status. Please try again.'
            });
            return true; // Stop polling
          }
          return false; // Continue polling
        }
      };
      
      // Initial poll
      let shouldStop = await pollMatchStatus();
      
      // Continue polling until we get a completed or error status
      const intervalId = setInterval(async () => {
        pollCount++;
        if (pollCount >= maxPolls) {
          clearInterval(intervalId);
          setMatchStatus({
            status: 'error',
            message: 'Match timed out. Please try again.'
          });
          return;
        }
        
        shouldStop = await pollMatchStatus();
        if (shouldStop) {
          clearInterval(intervalId);
        }
      }, pollInterval);

      setUploadState(prev => ({ 
        ...prev, 
        success: true, 
        error: null,
        file: null 
      }));

    } catch (error) {
      console.error('Error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to process agent';
      setUploadState(prev => ({ 
        ...prev, 
        error: errorMessage
      }));
      setMatchStatus({
        status: 'error',
        message: errorMessage
      });
      toast.error(errorMessage);
    } finally {
      setUploadState(prev => ({ ...prev, uploading: false }));
    }
  };

  const startMatch = async () => {
    if (!publicKey) {
      setMatchStatus({
        status: 'error',
        message: 'Please connect your wallet'
      });
      return;
    }

    try {
      setMatchStatus({
        status: 'running',
        message: 'Starting a new match...'
      });
      
      // Use the Next.js API route instead of direct backend call
      const response = await fetch('/api/chess/match', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          walletAddress: publicKey.toString()
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to start match');
      }

      const matchData = await response.json();
      
      // Start polling for match status
      let pollCount = 0;
      const maxPolls = 150; // 5 minutes at 2-second intervals
      const pollInterval = 2000;
      
      const pollMatchStatus = async () => {
        try {
          console.log(`Polling match status (attempt ${pollCount + 1}/${maxPolls})`);
          
          // Use the matchId from the initial match response
          if (!matchData.matchId) {
            throw new Error('No match ID available');
          }
          
          const resultResponse = await fetch(`/api/chess/match?matchId=${matchData.matchId}`);
          const resultData = await resultResponse.json();
          
          console.log('Match status update:', resultData);
          
          if (!resultResponse.ok || resultData.status === 'error') {
            setMatchStatus({
              status: 'error',
              message: resultData.message || 'An error occurred during the match'
            });
            return true; // Stop polling
          }
          
          setMatchStatus({
            status: resultData.status,
            message: resultData.message,
            result: resultData.result,
            engineOutput: resultData.engineOutput
          });
          
          return resultData.status === 'completed'; // Stop polling if match is completed
          
        } catch (error) {
          console.error('Error polling match status:', error);
          pollCount++;
          if (pollCount >= maxPolls) {
            setMatchStatus({
              status: 'error',
              message: 'Failed to check match status. Please try again.'
            });
            return true; // Stop polling
          }
          return false; // Continue polling
        }
      };
      
      // Initial poll
      let shouldStop = await pollMatchStatus();
      
      // Continue polling until we get a completed or error status
      const intervalId = setInterval(async () => {
        pollCount++;
        if (pollCount >= maxPolls) {
          clearInterval(intervalId);
          setMatchStatus({
            status: 'error',
            message: 'Match timed out. Please try again.'
          });
          return;
        }
        
        shouldStop = await pollMatchStatus();
        if (shouldStop) {
          clearInterval(intervalId);
        }
      }, pollInterval);

    } catch (error) {
      console.error('Error starting match:', error);
      setMatchStatus({
        status: 'error',
        message: 'Failed to start match'
      });
      toast.error('Failed to start match');
    }
  };

  return (    
  <div className="flex flex-col min-h-screen bg-background">
      {/* Background gradients */}
      <div className="pointer-events-none fixed inset-0">
        <div className="absolute inset-0 bg-gradient-to-b from-background via-background/90 to-background" />
        <div className="absolute right-0 top-0 h-[500px] w-[500px] bg-blue-500/10 blur-[100px]" />
        <div className="absolute bottom-0 left-0 h-[500px] w-[500px] bg-purple-500/10 blur-[100px]" />
      </div>
      <div className="flex flex-col flex-grow relative z-10">
      <Navbar />
      <main className="container mx-auto px-4 py-12">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold">Chess AI Arena</h1>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Submit Your Chess Agent</h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Upload Agent File (.cpp)
              </label>
              <div className="flex items-center space-x-4">
                <div className="flex-1">
                  <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md hover:border-gray-400 transition-colors">
                    <div className="space-y-1 text-center">
                      <svg
                        className="mx-auto h-12 w-12 text-gray-400"
                        stroke="currentColor"
                        fill="none"
                        viewBox="0 0 48 48"
                        aria-hidden="true"
                      >
                        <path
                          d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                          strokeWidth={2}
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                      <div className="flex text-sm text-black">
                        <label className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-blue-500">
                          <span>Upload a file</span>
                          <input
                            type="file"
                            className="sr-only"
                            accept=".cpp"
                            onChange={handleFileChange}
                          />
                        </label>
                        <p className="pl-1 text-black">or drag and drop</p>
                      </div>
                      <p className="text-xs text-black">
                        C++ files only (.cpp)
                      </p>
                    </div>
                  </div>
                </div>
                <button
                  onClick={handleUpload}
                  disabled={!uploadState.file || uploadState.uploading}
                  className={`px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white 
                    ${!uploadState.file || uploadState.uploading
                      ? 'bg-gray-400 cursor-not-allowed'
                      : 'bg-blue-600 hover:bg-blue-700'
                    } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500`}
                >
                  {uploadState.uploading ? 'Uploading...' : 'Upload'}
                </button>
              </div>
            </div>
            
            {/* Status Messages */}
            {uploadState.error && (
              <div className="rounded-md bg-red-50 p-4">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-red-700">{uploadState.error}</p>
                  </div>
                </div>
              </div>
            )}

            {uploadState.success && (
              <div className="rounded-md bg-green-50 p-4">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-green-700">Bot uploaded successfully!</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        
        {/* Engine Status with more detail */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <h2 className="text-2xl font-bold mb-4">Match Status</h2>
          <div className="space-y-4">
            <div className={`p-4 rounded-md ${
              matchStatus.status === 'completed' 
                ? 'bg-green-50 border border-green-200' 
                : matchStatus.status === 'error'
                ? 'bg-red-50 border border-red-200'
                : matchStatus.status === 'running'
                ? 'bg-blue-50 border border-blue-200'
                : matchStatus.status === 'compiling'
                ? 'bg-yellow-50 border border-yellow-200'
                : 'bg-gray-50 border border-gray-200'
            }`}>
              <div className="flex items-center">
                {matchStatus.status === 'running' && (
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                )}
                <p className={`text-sm font-medium ${
                  matchStatus.status === 'completed'
                    ? 'text-green-800'
                    : matchStatus.status === 'error'
                    ? 'text-red-800'
                    : matchStatus.status === 'running'
                    ? 'text-blue-800'
                    : matchStatus.status === 'compiling'
                    ? 'text-yellow-800'
                    : 'text-gray-800'
                }`}>
                  {matchStatus.message}
                </p>
              </div>
            </div>

            {/* Match Result Display */}
            <MatchResultDisplay {...matchStatus} />
          </div>
        </div>
      </main>
      <Footer />
      </div>
    </div>
  )
}

