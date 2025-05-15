"use client"
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { vscDarkPlus } from "react-syntax-highlighter/dist/cjs/styles/prism";
import { useEffect, useState } from "react"
import { useWallet } from "@solana/wallet-adapter-react"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Bot, Trophy, Coins, History } from "lucide-react"
import type { Agent } from "@/types/dashboard"
import type { Activity } from "@/types/dashboard"
import { AgentsList } from "@/app/components/agents-list"
import { ActivityFeed } from "@/app/components/activity-feed"
import { LoadingState } from "@/app/components/ui/loading-state"
import { Navbar } from "@/components/navbar"
import { fetchUserStats, fetchUser } from "../lib/api"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { UserOnboardingModal } from "@/app/components/user-onboarding-modal"
import Footer from "@/components/footer"

const links = [
  { name: 'Chess', href: '#Chess' },
];


export default function DocPage() {

  return (

    <div className="min-h-screen bg-background">
      {/* Background gradients */}
      <div className="pointer-events-none fixed inset-0">
        <div className="absolute inset-0 bg-gradient-to-b from-background via-background/90 to-background" />
        <div className="absolute right-0 top-0 h-[500px] w-[500px] bg-blue-500/10 blur-[100px]" />
        <div className="absolute bottom-0 left-0 h-[500px] w-[500px] bg-purple-500/10 blur-[100px]" />
      </div>
      <div className="relative z-10">


        <div className="max-w-auto mx-auto">
          <Navbar />

          <main className="container mx-auto px-4 py-12 flex">
            <aside className="w-64 hidden md:block h-screen sticky top-14 bg-[#1E1F2F] rounded-2xl text-white shadow-lg p-6">
              <h2 className="text-xl font-bold mb-6">Docs Navigation</h2>
              <nav className="space-y-4">
                {links.map(link => (
                  <a
                    key={link.name}
                    href={link.href}
                    className="block px-2 py-1 rounded hover:bg-[#2A2B3C] transition"
                  >
                    {link.name}
                  </a>
                ))}
              </nav>
            </aside>

            <div className="bg-white/5 backdrop-blur-xl rounded-2xl shadow-lg p-6 border-2 border-solid border-cyan-700 flex flex-col">
              <div className="max-w-4xl mx-auto space-y-8">
                <section id="Chess">{/* Introduction */}
                  <section>
                    <h1 className="text-4xl font-bold mb-4">♟️ Create & Upload Your Chess Bot to Battle AggressiveBot</h1>
                    <p className="text-gray-300">
                      Welcome to FightScript! This guide helps you build your own C++ chess bot, upload it, and fight a match against our built-in AggressiveBot, powered by Stockfish and against other developer-developed bots.
                    </p>
                  </section>

                  {/* Requirements */}
                  <section>
                    <h2 className="text-2xl font-semibold mb-2">✅ What You Need</h2>
                    <ul className="list-disc list-inside text-gray-300 space-y-1">
                      <li>A working C++ environment (<code>g++</code> recommended)</li>
                      <li>Basic knowledge of the UCI (Universal Chess Interface)</li>
                      <li>Your bot should:
                        <ul className="list-disc list-inside ml-6">
                          <li>Read input via <code>std::cin</code></li>
                          <li>Output moves via <code>std::cout</code></li>
                          <li>Handle standard UCI commands</li>
                        </ul>
                      </li>
                    </ul>
                    <p className="mt-2 text-gray-400">
                      Your final upload must be a compiled Linux binary (<code>your_bot</code>), not the source <code>.cpp</code> file.
                    </p>
                  </section>

                  {/* Sample Code */}
                  <section>
                    <h2 className="text-2xl font-semibold mb-2">💻 Sample C++ Bot Code</h2>
                    <p className="text-gray-300 mb-4">
                      This example bot picks a basic move depending on the color and follows the UCI protocol strictly:
                    </p>
                    <pre className="bg-gray-800 p-4 rounded overflow-x-auto text-sm">
                      <SyntaxHighlighter language="cpp" style={vscDarkPlus} wrapLines={true}>
                        {`#include <iostream>
#include <string>
#include <vector>
#include <random>
#include <chrono>

std::string get_move(const std::string& fen) {
    bool is_white = fen.find(" w ") != std::string::npos;
    std::vector<std::string> moves;

    if (is_white) {
        moves = {"e2e4", "d2d4", "g1f3", "b1c3", "f1c4", "f1b5"};
    } else {
        moves = {"e7e5", "d7d5", "g8f6", "b8c6", "f8c5", "f8b4"};
    }

    auto seed = std::chrono::system_clock::now().time_since_epoch().count();
    std::mt19937 gen(seed);
    std::uniform_int_distribution<> dis(0, moves.size() - 1);

    return moves[dis(gen)];
}

int main() {
    std::string line;
    std::string current_fen;

    while (std::getline(std::cin, line)) {
        if (line == "uci") {
            std::cout << "id name MyBot\\n";
            std::cout << "id author Your Name\\n";
            std::cout << "uciok\\n";
        } else if (line == "isready") {
            std::cout << "readyok\\n";
        } else if (line.rfind("position", 0) == 0) {
            size_t fenIndex = line.find("fen ");
            if (fenIndex != std::string::npos) {
                current_fen = line.substr(fenIndex + 4);
            }
        } else if (line == "go") {
            std::string move = get_move(current_fen);
            std::cout << "bestmove " << move << "\\n";
        } else if (line == "quit") {
            break;
        }
    }

    return 0;
}`}
                      </SyntaxHighlighter>
                    </pre>
                  </section>

                  {/* Compilation Instructions */}
                  <section>
                    <h2 className="text-2xl font-semibold mb-2">⚙️ How to Compile (on your local machine)</h2>
                    <p className="text-gray-300 mb-2">
                      Use this command to generate an executable Linux-compatible binary:
                    </p>
                    <pre className="bg-gray-800 p-4 rounded overflow-x-auto text-sm">
                      <code>g++ -std=c++17 your_bot.cpp -o your_bot</code>
                    </pre>
                    <p className="text-gray-300 mt-2">
                      Make sure the compiled binary:
                    </p>
                    <ul className="list-disc list-inside text-gray-300 space-y-1">
                      <li>Has no platform dependencies (compile on Linux or WSL for best compatibility)</li>
                      <li>Is tested locally before upload: <code>./your_bot</code> and type in UCI commands</li>
                      <li>Has execution permissions: <code>chmod +x your_bot</code></li>
                    </ul>
                  </section>

                  {/* Uploading the Bot */}
                  <section>
                    <h2 className="text-2xl font-semibold mb-2">📤 Uploading Your Bot</h2>
                    <ol className="list-decimal list-inside text-gray-300 space-y-1">
                      <li>Rename it meaningfully, e.g., <code>my_bot</code></li>
                      <li>Upload it using the Upload Bot button on the site</li>
                      <li>The server downloads it from Google Drive</li>
                      <li>It's executed inside a secure environment alongside Stockfish</li>
                    </ol>
                  </section>

                  {/* Match Flow */}
                  <section>
                    <h2 className="text-2xl font-semibold mb-2">🎮 Match Flow</h2>
                    <ul className="list-disc list-inside text-gray-300 space-y-1">
                      <li>Your bot is treated like a UCI engine</li>
                      <li>Stockfish sends standard <code>uci</code>, <code>isready</code>, <code>position</code>, <code>go</code> commands</li>
                      <li>Your bot replies with <code>bestmove XYZ</code></li>
                      <li>The game ends when one side wins or it's a draw</li>
                      <li>You'll get:
                        <ul className="list-disc list-inside ml-6">
                          <li>Game result</li>
                          <li>Move history</li>
                          <li>Winner and reason</li>
                        </ul>
                      </li>
                    </ul>
                  </section>

                  {/* Rules & Tips */}
                  <section>
                    <h2 className="text-2xl font-semibold mb-2">⚠️ Rules & Tips</h2>
                    <ul className="list-disc list-inside text-gray-300 space-y-1">
                      <li>Your bot must:
                        <ul className="list-disc list-inside ml-6">
                          <li>Respond to <code>uci</code>, <code>isready</code>, <code>position</code>, <code>go</code>, <code>quit</code></li>
                          <li>Output only UCI responses (no debug prints to stdout)</li>
                        </ul>
                      </li>
                      <li>Keep your response time &lt; 1 second</li>
                      <li>Avoid memory leaks or background threads</li>
                      <li>You can build advanced bots with:
                        <ul className="list-disc list-inside ml-6">
                          <li>Minimax</li>
                          <li>Evaluation functions</li>
                          <li>Libraries like <a href="https://github.com/bagaturchess/chesslib" className="text-blue-400 underline">chesslib</a></li>
                        </ul>
                      </li>
                    </ul>
                  </section>

                  {/* Final Checklist */}
                  <section>
                    <h2 className="text-2xl font-semibold mb-2">✅ Final Upload Checklist</h2>
                    <ul className="list-disc list-inside text-gray-300 space-y-1">
                      <li>Compiled binary (Linux-compatible)</li>
                      <li>Tested with UCI manually</li>
                      <li>Named appropriately (no spaces/special characters)</li>
                      <li>Set as executable (<code>chmod +x my_bot</code>)</li>
                      <li>Uploaded via the site interface (<a href="https://fightscript.io/competitions/chess" className="text-blue-400 underline">https://fightscript.io/competitions/chess</a>)</li>
                    </ul>
                  </section>

                </section>

              </div>
            </div>

          </main>
        </div>
        <Footer />
      </div>
    </div>
  );
}