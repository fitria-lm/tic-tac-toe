(function(){
	let board = Array(9).fill(null);
	let current = 'X';
	let gameOver = false;
	let vsComputer = false;
	let scores = JSON.parse(localStorage.getItem('ticTacToeScores')) || { X: 0, O: 0, draw: 0 };

	const boardEl = document.getElementById('board');
	const cells = Array.from(document.querySelectorAll('.cell'));
	const statusBar = document.getElementById('statusBar');
	const scoreXEl = document.getElementById('scoreX');
	const scoreOEl = document.getElementById('scoreO');
	const scoreDrawEl = document.getElementById('scoreDraw');
	const labelO = document.getElementById('labelO');
	const modePvP = document.getElementById('modePvP');
	const modePvC = document.getElementById('modePvC');
	const resetRoundBtn = document.getElementById('resetRound');
	const resetAllBtn = document.getElementById('resetAll');
	const savedScores = JSON.parse(localStorage.getItem('ticTacToeScores'));
		if (savedScores) scores = savedScores;
	
	const WIN_LINES = [
		[0,1,2],[3,4,5],[6,7,8],
		[0,3,6],[1,4,7],[2,5,8],
		[0,4,8],[2,4,6]
	];

	function render(){
	cells.forEach((cell, i) => {
	  cell.className = 'cell';
	  cell.textContent = board[i] || '';
	  if(board[i] === 'X'){ cell.classList.add('x-mark','filled'); }
	  if(board[i] === 'O'){ cell.classList.add('o-mark','filled'); }
	});
	}

	function setStatus(text, kind){
		statusBar.textContent = text;
		statusBar.classList.remove('win','draw');
		if(kind) statusBar.classList.add(kind);
	}

	function checkWinner(b){
		for(const line of WIN_LINES){
			const [a,b1,c] = line;
				if(b[a] && b[a] === b[b1] && b[a] === b[c]){
				return { winner: b[a], line };
				}
			}
		if(!b.includes(null)) return { winner: 'draw' };
		return null;
	}
	
	function updateScoreUI(){
		scoreXEl.textContent = scores.X;
		scoreOEl.textContent = scores.O;
		scoreDrawEl.textContent = scores.draw;

		localStorage.setItem('ticTacToeScores', JSON.stringify(scores));
	}

  function endGame(result){
	gameOver = true;
	if(result.winner === 'draw'){
	  scores.draw++;
	  setStatus('SERI!', 'draw');
	} else {
	  result.line.forEach(i => cells[i].classList.add('win-cell'));
	  scores[result.winner]++;
	  const label = result.winner === 'X' ? 'PLAYER X' : (vsComputer ? 'Computer' : 'PLAYER O');
	  setStatus(label + ' MENANG!', 'win');
	}
	updateScoreUI();
  }

	function turnLabel(){
		if(gameOver) return;
		const who = current === 'X' ? 'PLAYER X' : (vsComputer ? 'Computer' : 'PLAYER O');
		setStatus('GILIRAN ' + who);
	}

	function playMove(i){
		if(gameOver || board[i]) return;
		board[i] = current;
		render();
		const result = checkWinner(board);
		if(result){
			endGame(result);
			return;
		}
		current = current === 'X' ? 'O' : 'X';
		turnLabel();
		if(vsComputer && current === 'O' && !gameOver){
			setTimeout(computerMove, 400);
		}
	}

	function computerMove(){
		if(gameOver) return;
		const move = findBestMove(board);
		if(move !== -1) playMove(move);
	}

  function findBestMove(b){
	let bestScore = -Infinity;
	let move = -1;
	for(let i = 0; i < 9; i++){
	  if(!b[i]){
		b[i] = 'O';
		const score = minimax(b, 0, false);
		b[i] = null;
		if(score > bestScore){
		  bestScore = score;
		  move = i;
		}
	  }
	}
	return move;
  }

  function minimax(b, depth, isMax){
	const result = checkWinner(b);
	if(result){
	  if(result.winner === 'O') return 10 - depth;
	  if(result.winner === 'X') return depth - 10;
	  return 0;
	}
	if(isMax){
	  let best = -Infinity;
	  for(let i = 0; i < 9; i++){
		if(!b[i]){
		  b[i] = 'O';
		  best = Math.max(best, minimax(b, depth + 1, false));
		  b[i] = null;
		}
	  }
	  return best;
	} else {
	  let best = Infinity;
	  for(let i = 0; i < 9; i++){
		if(!b[i]){
		  b[i] = 'X';
		  best = Math.min(best, minimax(b, depth + 1, true));
		  b[i] = null;
		}
	  }
	  return best;
	}
  }

	function resetRound(){
		board = Array(9).fill(null);
		current = 'X';
		gameOver = false;
		render();
		turnLabel();
	}

	function resetAll(){
		scores = { X: 0, O: 0, draw: 0 };
		updateScoreUI();
		resetRound();
	}

	function setMode(computer){
		vsComputer = computer;
		modePvP.classList.toggle('active', !computer);
		modePvC.classList.toggle('active', computer);
		labelO.textContent = computer ? 'Computer' : 'Player O';
		resetAll();
	}

  cells.forEach(cell => {
	cell.addEventListener('click', () => {
	  const i = parseInt(cell.dataset.index, 10);
	  if(vsComputer && current === 'O') return;
	  playMove(i);
	});
  });

	resetRoundBtn.addEventListener('click', resetRound);
	resetAllBtn.addEventListener('click', resetAll);
	modePvP.addEventListener('click', () => setMode(false));
	modePvC.addEventListener('click', () => setMode(true));

	render();
	turnLabel();
})();