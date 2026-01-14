// 카드에 사용할 이모지들
const cardSymbols = ['🎮', '🎲', '🎯', '🎪', '🎨', '🎭', '🎹', '🎸'];

// 게임 상태 변수들
let cards = [];
let flippedCards = [];
let matchedPairs = 0;
let moves = 0;
let gameStarted = false;
let timerInterval = null;
let seconds = 0;

// DOM 요소들
const gameBoard = document.getElementById('game-board');
const movesDisplay = document.getElementById('moves');
const timeDisplay = document.getElementById('time');
const restartBtn = document.getElementById('restart-btn');
const winMessage = document.getElementById('win-message');
const finalMoves = document.getElementById('final-moves');
const finalTime = document.getElementById('final-time');
const playAgainBtn = document.getElementById('play-again-btn');

// 게임 초기화
function initGame() {
    // 상태 초기화
    cards = [];
    flippedCards = [];
    matchedPairs = 0;
    moves = 0;
    gameStarted = false;
    seconds = 0;

    // 타이머 중지
    if (timerInterval) {
        clearInterval(timerInterval);
        timerInterval = null;
    }

    // 디스플레이 초기화
    movesDisplay.textContent = '0';
    timeDisplay.textContent = '00:00';
    winMessage.classList.add('hidden');

    // 카드 배열 생성 (각 심볼 2개씩)
    const cardPairs = [...cardSymbols, ...cardSymbols];

    // 카드 섞기 (Fisher-Yates 알고리즘)
    for (let i = cardPairs.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [cardPairs[i], cardPairs[j]] = [cardPairs[j], cardPairs[i]];
    }

    // 게임 보드 비우기
    gameBoard.innerHTML = '';

    // 카드 생성
    cardPairs.forEach((symbol, index) => {
        const card = createCard(symbol, index);
        gameBoard.appendChild(card);
        cards.push(card);
    });
}

// 카드 요소 생성
function createCard(symbol, index) {
    const card = document.createElement('div');
    card.className = 'card';
    card.dataset.symbol = symbol;
    card.dataset.index = index;

    const cardBack = document.createElement('div');
    cardBack.className = 'card-face card-back';

    const cardFront = document.createElement('div');
    cardFront.className = 'card-face card-front';
    cardFront.textContent = symbol;

    card.appendChild(cardBack);
    card.appendChild(cardFront);

    card.addEventListener('click', () => flipCard(card));

    return card;
}

// 카드 뒤집기
function flipCard(card) {
    // 이미 뒤집힌 카드이거나 매칭된 카드면 무시
    if (card.classList.contains('flipped') ||
        card.classList.contains('matched') ||
        flippedCards.length >= 2) {
        return;
    }

    // 게임 시작 시 타이머 시작
    if (!gameStarted) {
        gameStarted = true;
        startTimer();
    }

    // 카드 뒤집기
    card.classList.add('flipped');
    flippedCards.push(card);

    // 두 장의 카드가 뒤집혔을 때
    if (flippedCards.length === 2) {
        moves++;
        movesDisplay.textContent = moves;
        checkMatch();
    }
}

// 매칭 확인
function checkMatch() {
    const [card1, card2] = flippedCards;
    const isMatch = card1.dataset.symbol === card2.dataset.symbol;

    if (isMatch) {
        // 매칭 성공
        card1.classList.add('matched');
        card2.classList.add('matched');
        matchedPairs++;
        flippedCards = [];

        // 모든 카드를 찾았는지 확인
        if (matchedPairs === cardSymbols.length) {
            endGame();
        }
    } else {
        // 매칭 실패 - 잠시 후 카드 다시 뒤집기
        setTimeout(() => {
            card1.classList.remove('flipped');
            card2.classList.remove('flipped');
            flippedCards = [];
        }, 1000);
    }
}

// 타이머 시작
function startTimer() {
    timerInterval = setInterval(() => {
        seconds++;
        const mins = Math.floor(seconds / 60).toString().padStart(2, '0');
        const secs = (seconds % 60).toString().padStart(2, '0');
        timeDisplay.textContent = `${mins}:${secs}`;
    }, 1000);
}

// 게임 종료
function endGame() {
    clearInterval(timerInterval);

    finalMoves.textContent = moves;
    finalTime.textContent = timeDisplay.textContent;

    setTimeout(() => {
        winMessage.classList.remove('hidden');
    }, 500);
}

// 이벤트 리스너
restartBtn.addEventListener('click', initGame);
playAgainBtn.addEventListener('click', initGame);

// 게임 시작
initGame();
