class Player {
  constructor(sign) {
    this.sign = sign;
  }
}

class GameBoard {
  constructor() {
    this.cells = ["", "", "", "", "", "", "", "", ""];
    this.winner = undefined;
  }

  setCell(sign, index) {
    this.cells[index] = sign;
  }

  resetBoard() {
    for (let i = 0; i < 9; i++) {
      this.cells[i] = "";
    }
  }

  availableCells() {
    let availCells = [];
    for (let i = 0; i < 9; i++) {
      if (this.cells[i] == "") availCells.push(i);
    }
    return availCells;
  }

  setWinner(winner) {
    this.winner = winner;
  }
}

const Game = (() => {
  const player1 = new Player("X");
  const player2 = new Player("O");
  const board = new GameBoard();
  let currentPlayer = player1;

  const overlay = document.querySelector("#overlay");
  const endGameModal = document.querySelector("#end-game-modal");
  const gameStartModal = document.querySelector("#game-start-modal");
  const message = document.querySelector(".message");
  const cells = document.querySelectorAll(".cell");
  const difficultySelection = document.querySelector("#difficulty");

  let winCombinations = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [6, 4, 2],
  ];

  const easyMove = () => {
    let cells = board.availableCells();
    let randomIndex = cells[Math.floor(Math.random() * cells.length)];
    board.setCell(player2.sign, randomIndex);
    setBoardCell(player2.sign, randomIndex);
  };

  const impossibleMove = () => {
    let cellIndex = minimax(board, player2).index;
    board.setCell(player2.sign, cellIndex);
    setBoardCell(player2.sign, cellIndex);
  };

  const mediumMove = () => {
    let value = Math.floor(Math.random() * (100 + 1));
    if (value > 50) impossibleMove();
    else easyMove();
  };

  const hardMove = () => {
    let value = Math.floor(Math.random() * (100 + 1));
    if (value > 25) impossibleMove();
    else easyMove();
  };

  const move = () => {
    let difficulty = difficultySelection.value;
    switch (difficulty) {
      case "Easy":
        easyMove();
        break;
      case "Medium":
        mediumMove();
        break;
      case "Hard":
        hardMove();
        break;
      case "Impossible":
        impossibleMove();
        break;
    }
  };

  const handleButton = (e) => {
    if (e.target.id == "vsPlayer") {
      cells.forEach((cell) => {
        cell.addEventListener("click", handleClickVsPlayer);
      });
      classListRemove(gameStartModal);
    }

    if (e.target.id == "vsAI") {
      cells.forEach((cell) => {
        cell.addEventListener("click", handleClickVsAI);
      });
      classListRemove(gameStartModal);
    }

    if (e.target.id == "restart") {
      clear();
      classListRemove(endGameModal);
      classListAdd(gameStartModal);
    }
  };

  const handleClickVsAI = (e) => {
    if (!e.target.textContent) {
      let cellIndex = e.target.dataset.index;
      board.setCell(player1.sign, cellIndex);
      e.target.textContent = player1.sign;
      endGameVsAI();
      if (!isGameOver(board)) move();
      endGameVsAI();
    }
  };

  const handleClickVsPlayer = (e) => {
    if (!e.target.textContent) {
      let cellIndex = e.target.dataset.index;
      board.setCell(currentPlayer.sign, cellIndex);
      e.target.textContent = currentPlayer.sign;
      endGameVsPlayer();
      togglePlayer();
    }
  };

  const setBoardCell = (sign, index) => {
    cells.forEach((cell) => {
      if (cell.dataset.index == index) {
        cell.textContent = sign;
      }
    });
  };

  const isGameOver = (newBoard) => {
    for (let i = 0; i < winCombinations.length; i++) {
      let winCondition = winCombinations[i];
      let el1 = newBoard.cells[winCondition[0]];
      let el2 = newBoard.cells[winCondition[1]];
      let el3 = newBoard.cells[winCondition[2]];
      if (el1 == "" || el2 == "" || el3 == "") {
        continue;
      }
      if (el1 == el2 && el2 == el3) {
        board.setWinner(el1);
        return true;
      }
    }
  };

  const isTie = (newBoard) => {
    if (!isGameOver(newBoard)) return !newBoard.cells.includes("");
  };

  const findBestMove = (moves, player) => {
    let bestMove;

    if (player == player2) {
      let bestScore = -10000;
      for (let i = 0; i < moves.length; i++) {
        if (moves[i].score > bestScore) {
          bestScore = moves[i].score;
          bestMove = i;
        }
      }
    } else {
      let bestScore = 10000;
      for (let i = 0; i < moves.length; i++) {
        if (moves[i].score < bestScore) {
          bestScore = moves[i].score;
          bestMove = i;
        }
      }
    }
    return moves[bestMove];
  };

  const minimax = (newBoard, player) => {
    let availCells = newBoard.availableCells();
    if (isTie(newBoard)) return { score: 0 };
    else if (isGameOver(newBoard)) {
      if (player == player1) return { score: 10 };
      if (player == player2) return { score: -10 };
    }

    let moves = [];
    for (let i = 0; i < availCells.length; i++) {
      let move = {};
      move.index = availCells[i];
      newBoard.cells[availCells[i]] = player.sign;
      if (player == player2) {
        let result = minimax(newBoard, player1);
        move.score = result.score;
      } else {
        let result = minimax(newBoard, player2);
        move.score = result.score;
      }
      newBoard.cells[availCells[i]] = "";
      moves.push(move);
    }

    return findBestMove(moves, player);
  };

  const endGameVsAI = () => {
    if (isTie(board)) {
      classListAdd(endGameModal);
      message.textContent = "It's a tie!";
    }
    if (isGameOver(board)) {
      classListAdd(endGameModal);
      board.winner == "X"
        ? (message.textContent = "You win!")
        : (message.textContent = "The AI wins!");
    }
  };

  const endGameVsPlayer = () => {
    if (isTie(board)) {
      classListAdd(endGameModal);
      message.textContent = "It's a tie!";
    }
    if (isGameOver(board)) {
      classListAdd(endGameModal);
      board.winner == "X"
        ? (message.textContent = "Player 1 wins!")
        : (message.textContent = "Player 2 wins!");
    }
  };

  const clear = () => {
    currentPlayer = player1;
    board.resetBoard();
    cells.forEach((cell) => {
      cell.removeEventListener("click", handleClickVsAI);
      cell.removeEventListener("click", handleClickVsPlayer);
      cell.textContent = "";
    });
  };

  const classListAdd = (modal) => {
    overlay.classList.add("active");
    modal.classList.add("active");
  };

  const classListRemove = (modal) => {
    overlay.classList.remove("active");
    modal.classList.remove("active");
  };

  const togglePlayer = () => {
    currentPlayer == player1
      ? (currentPlayer = player2)
      : (currentPlayer = player1);
  };

  gameStartModal.addEventListener("click", handleButton);
  endGameModal.addEventListener("click", handleButton);
})();
