#include <iostream>
#include <string>
#include <vector>
#include <random>
#include <chrono>

struct Move {
    std::string move;
    int priority;
};

// Function to generate prioritized moves
std::string get_move(const std::string& fen) {
    // Check if we're playing as black
    bool is_white = fen.find(" w ") != std::string::npos;
    
    std::vector<std::string> moves;
    if (is_white) {
        moves = {
            "e2e4", // Center control
            "d2d4",
            "g1f3", // Knight development
            "b1c3",
            "f1c4", // Bishop development
            "f1b5"
        };
    } else {
        moves = {
            "e7e5", // Center control
            "d7d5",
            "g8f6", // Knight development
            "b8c6",
            "f8c5", // Bishop development
            "f8b4"
        };
    }

    // Random number generation
    auto seed = std::chrono::system_clock::now().time_since_epoch().count();
    std::mt19937 gen(seed);
    std::uniform_int_distribution<> dis(0, moves.size() - 1);
    
    // Get and return random move
    std::string move = moves[dis(gen)];
    return move;
}

// Main function to handle UCI protocol
int main() {
    std::string line;
    std::string current_fen = "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1";

    // UCI protocol implementation
    while (std::getline(std::cin, line)) {
        if (line == "uci") {
            std::cout << "id name AggressiveBot" << std::endl;
            std::cout << "id author Your Name" << std::endl;
            std::cout << "uciok" << std::endl;
        }
        else if (line == "isready") {
            std::cout << "readyok" << std::endl;
        }
        else if (line.substr(0, 8) == "position") {
            // Parse position command
            if (line.substr(9, 3) == "fen") {
                current_fen = line.substr(13);
            }
        }
        else if (line.substr(0, 2) == "go") {
            // Generate and return move
            std::string move = get_move(current_fen);
            std::cout << "bestmove " << move << std::endl;
        }
        else if (line == "quit") {
            break;
        }
    }

    return 0;
} 