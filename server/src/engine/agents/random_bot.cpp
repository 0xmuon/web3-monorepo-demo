#include <iostream>
#include <string>
#include <vector>
#include <random>
#include <chrono>

// Basic move structure
struct Move {
    std::string from;
    std::string to;
};

// Function to generate random moves
std::string get_move(const std::string& fen) {
    // Check if we're playing as black
    bool is_white = fen.find(" w ") != std::string::npos;
    
    std::vector<std::string> basic_moves;
    if (is_white) {
        basic_moves = {
            "e2e4", "d2d4", "c2c4", "b2b3", 
            "g2g3", "a2a3", "h2h3", "f2f3"
        };
    } else {
        basic_moves = {
            "e7e5", "d7d5", "c7c5", "b7b6", 
            "g7g6", "a7a6", "h7h6", "f7f6"
        };
    }

    // Random number generation
    auto seed = std::chrono::system_clock::now().time_since_epoch().count();
    std::mt19937 gen(seed);
    std::uniform_int_distribution<> dis(0, basic_moves.size() - 1);
    
    // Get and return random move
    std::string move = basic_moves[dis(gen)];
    return move;
}

// Main function to handle UCI protocol
int main() {
    std::string line;
    std::string current_fen;

    std::cout.setf(std::ios::unitbuf); // Enable automatic flushing

    while (std::getline(std::cin, line)) {
        if (line == "uci") {
            std::cout << "id name RandomBot" << std::endl;
            std::cout << "id author YourName" << std::endl;
            std::cout << "uciok" << std::endl;
        }
        else if (line == "isready") {
            std::cout << "readyok" << std::endl;
        }
        else if (line.substr(0, 8) == "position") {
            size_t fen_pos = line.find("fen");
            if (fen_pos != std::string::npos) {
                current_fen = line.substr(fen_pos + 4);
            }
        }
        else if (line.substr(0, 2) == "go") {
            std::string move = get_move(current_fen);
            std::cout << "bestmove " << move << std::endl;
        }
        else if (line == "quit") {
            break;
        }
    }
    return 0;
} 