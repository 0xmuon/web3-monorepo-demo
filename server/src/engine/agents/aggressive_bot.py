import sys
import random
import time
from typing import List

def get_move(fen: str) -> str:
    # Check if we're playing as white
    is_white = " w " in fen
    
    moves: List[str]
    if is_white:
        moves = [
            "e2e4",  # Center control
            "d2d4",
            "g1f3",  # Knight development
            "b1c3",
            "f1c4",  # Bishop development
            "f1b5"
        ]
    else:
        moves = [
            "e7e5",  # Center control
            "d7d5",
            "g8f6",  # Knight development
            "b8c6",
            "f8c5",  # Bishop development
            "f8b4"
        ]
    
    # Get random move
    return random.choice(moves)

def main():
    current_fen = "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1"
    
    while True:
        line = sys.stdin.readline().strip()
        
        if line == "uci":
            print("id name AggressiveBot")
            print("id author Python Version")
            print("uciok")
        elif line == "isready":
            print("readyok")
        elif line.startswith("position"):
            # Parse position command
            if line.startswith("position fen "):
                current_fen = line[13:]
        elif line.startswith("go"):
            # Generate and return move
            move = get_move(current_fen)
            print(f"bestmove {move}")
        elif line == "quit":
            break

if __name__ == "__main__":
    main() 