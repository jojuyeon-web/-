// 게임 캔버스 설정
const canvas = document.getElementById('game-canvas');
const ctx = canvas.getContext('2d');

// 게임 상태
let gameRunning = false;
let score = 0;
let lives = 3;
let level = 1;
let animationId;

// 별 배경
const stars = [];
for (let i = 0; i < 100; i++) {
    stars.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        size: Math.random() * 2 + 1,
        speed: Math.random() * 2 + 0.5
    });
}

// 플레이어 우주선
const player = {
    x: canvas.width / 2 - 25,
    y: canvas.height - 80,
    width: 50,
    height: 50,
    speed: 7,
    color: '#00d4ff'
};

// 미사일
let bullets = [];
const bulletSpeed = 10;
let canShoot = true;
let shootCooldown = 150;

// 외계인
let enemies = [];
let enemySpeed = 2;
let enemySpawnRate = 1500;
let lastEnemySpawn = 0;

// 폭발 효과
let explosions = [];

// 키 입력 상태
const keys = {
    left: false,
    right: false,
    space: false
};

// 키 이벤트 리스너
document.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowLeft' || e.key === 'a') keys.left = true;
    if (e.key === 'ArrowRight' || e.key === 'd') keys.right = true;
    if (e.key === ' ') {
        e.preventDefault();
        keys.space = true;
    }
});

document.addEventListener('keyup', (e) => {
    if (e.key === 'ArrowLeft' || e.key === 'a') keys.left = false;
    if (e.key === 'ArrowRight' || e.key === 'd') keys.right = false;
    if (e.key === ' ') keys.space = false;
});

// 버튼 이벤트
document.getElementById('start-btn').addEventListener('click', startGame);
document.getElementById('restart-btn').addEventListener('click', restartGame);
document.getElementById('play-again-btn').addEventListener('click', restartGame);

// 게임 시작
function startGame() {
    document.getElementById('home').style.display = 'none';
    resetGame();
    gameRunning = true;
    gameLoop();
}

// 게임 재시작
function restartGame() {
    document.getElementById('game-over').classList.add('hidden');
    resetGame();
    gameRunning = true;
    gameLoop();
}

// 게임 리셋
function resetGame() {
    score = 0;
    lives = 3;
    level = 1;
    bullets = [];
    enemies = [];
    explosions = [];
    enemySpeed = 2;
    enemySpawnRate = 1500;
    player.x = canvas.width / 2 - 25;
    updateUI();
}

// UI 업데이트
function updateUI() {
    document.getElementById('score').textContent = score;
    document.getElementById('level').textContent = level;
    let heartsDisplay = '';
    for (let i = 0; i < lives; i++) {
        heartsDisplay += '❤️';
    }
    document.getElementById('lives').textContent = heartsDisplay || '💀';
}

// 별 그리기
function drawStars() {
    ctx.fillStyle = '#ffffff';
    stars.forEach(star => {
        ctx.beginPath();
        ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
        ctx.fill();

        // 별 이동
        star.y += star.speed;
        if (star.y > canvas.height) {
            star.y = 0;
            star.x = Math.random() * canvas.width;
        }
    });
}

// 플레이어 그리기
function drawPlayer() {
    // 우주선 본체
    ctx.fillStyle = player.color;
    ctx.beginPath();
    ctx.moveTo(player.x + player.width / 2, player.y);
    ctx.lineTo(player.x + player.width, player.y + player.height);
    ctx.lineTo(player.x, player.y + player.height);
    ctx.closePath();
    ctx.fill();

    // 엔진 불꽃
    ctx.fillStyle = '#ff6600';
    ctx.beginPath();
    ctx.moveTo(player.x + player.width / 2 - 10, player.y + player.height);
    ctx.lineTo(player.x + player.width / 2, player.y + player.height + 15 + Math.random() * 10);
    ctx.lineTo(player.x + player.width / 2 + 10, player.y + player.height);
    ctx.closePath();
    ctx.fill();

    // 조종석
    ctx.fillStyle = '#7b2cbf';
    ctx.beginPath();
    ctx.arc(player.x + player.width / 2, player.y + 25, 8, 0, Math.PI * 2);
    ctx.fill();
}

// 미사일 그리기
function drawBullets() {
    ctx.fillStyle = '#ffff00';
    bullets.forEach((bullet, index) => {
        ctx.fillRect(bullet.x, bullet.y, 4, 15);

        // 미사일 글로우 효과
        ctx.shadowColor = '#ffff00';
        ctx.shadowBlur = 10;
        ctx.fillRect(bullet.x, bullet.y, 4, 15);
        ctx.shadowBlur = 0;

        bullet.y -= bulletSpeed;

        // 화면 밖으로 나간 미사일 제거
        if (bullet.y < 0) {
            bullets.splice(index, 1);
        }
    });
}

// 외계인 그리기
function drawEnemies() {
    enemies.forEach((enemy, index) => {
        // 외계인 본체
        ctx.fillStyle = enemy.color;
        ctx.beginPath();
        ctx.arc(enemy.x + enemy.width / 2, enemy.y + enemy.height / 2, enemy.width / 2, 0, Math.PI * 2);
        ctx.fill();

        // 외계인 눈
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(enemy.x + enemy.width / 3, enemy.y + enemy.height / 2.5, 5, 0, Math.PI * 2);
        ctx.arc(enemy.x + enemy.width * 2 / 3, enemy.y + enemy.height / 2.5, 5, 0, Math.PI * 2);
        ctx.fill();

        // 외계인 눈동자
        ctx.fillStyle = '#000000';
        ctx.beginPath();
        ctx.arc(enemy.x + enemy.width / 3, enemy.y + enemy.height / 2.5, 2, 0, Math.PI * 2);
        ctx.arc(enemy.x + enemy.width * 2 / 3, enemy.y + enemy.height / 2.5, 2, 0, Math.PI * 2);
        ctx.fill();

        enemy.y += enemy.speed;

        // 화면 밖으로 나간 외계인 제거 및 생명 감소
        if (enemy.y > canvas.height) {
            enemies.splice(index, 1);
            lives--;
            updateUI();
            if (lives <= 0) {
                gameOver();
            }
        }
    });
}

// 폭발 효과 그리기
function drawExplosions() {
    explosions.forEach((explosion, index) => {
        ctx.beginPath();
        ctx.arc(explosion.x, explosion.y, explosion.radius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, ${100 + explosion.radius * 3}, 0, ${explosion.alpha})`;
        ctx.fill();

        explosion.radius += 2;
        explosion.alpha -= 0.05;

        if (explosion.alpha <= 0) {
            explosions.splice(index, 1);
        }
    });
}

// 외계인 생성
function spawnEnemy() {
    const colors = ['#ff006e', '#8338ec', '#3a86ff', '#fb5607'];
    const enemy = {
        x: Math.random() * (canvas.width - 40),
        y: -50,
        width: 40,
        height: 40,
        speed: enemySpeed + Math.random(),
        color: colors[Math.floor(Math.random() * colors.length)]
    };
    enemies.push(enemy);
}

// 미사일 발사
function shoot() {
    if (canShoot && gameRunning) {
        bullets.push({
            x: player.x + player.width / 2 - 2,
            y: player.y
        });
        canShoot = false;
        setTimeout(() => canShoot = true, shootCooldown);
    }
}

// 충돌 감지
function checkCollisions() {
    // 미사일과 외계인 충돌
    bullets.forEach((bullet, bIndex) => {
        enemies.forEach((enemy, eIndex) => {
            if (bullet.x < enemy.x + enemy.width &&
                bullet.x + 4 > enemy.x &&
                bullet.y < enemy.y + enemy.height &&
                bullet.y + 15 > enemy.y) {

                // 폭발 효과 추가
                explosions.push({
                    x: enemy.x + enemy.width / 2,
                    y: enemy.y + enemy.height / 2,
                    radius: 10,
                    alpha: 1
                });

                bullets.splice(bIndex, 1);
                enemies.splice(eIndex, 1);
                score += 100;
                updateUI();

                // 레벨업 체크
                checkLevelUp();
            }
        });
    });

    // 플레이어와 외계인 충돌
    enemies.forEach((enemy, index) => {
        if (player.x < enemy.x + enemy.width &&
            player.x + player.width > enemy.x &&
            player.y < enemy.y + enemy.height &&
            player.y + player.height > enemy.y) {

            explosions.push({
                x: enemy.x + enemy.width / 2,
                y: enemy.y + enemy.height / 2,
                radius: 15,
                alpha: 1
            });

            enemies.splice(index, 1);
            lives--;
            updateUI();

            if (lives <= 0) {
                gameOver();
            }
        }
    });
}

// 레벨업 체크
function checkLevelUp() {
    const newLevel = Math.floor(score / 500) + 1;
    if (newLevel > level) {
        level = newLevel;
        enemySpeed += 0.5;
        enemySpawnRate = Math.max(500, enemySpawnRate - 100);
        updateUI();
    }
}

// 게임 오버
function gameOver() {
    gameRunning = false;
    cancelAnimationFrame(animationId);

    document.getElementById('final-score').textContent = score;
    document.getElementById('final-level').textContent = level;
    document.getElementById('game-over').classList.remove('hidden');
}

// 플레이어 이동
function movePlayer() {
    if (keys.left && player.x > 0) {
        player.x -= player.speed;
    }
    if (keys.right && player.x < canvas.width - player.width) {
        player.x += player.speed;
    }
    if (keys.space) {
        shoot();
    }
}

// 게임 루프
function gameLoop(timestamp) {
    if (!gameRunning) return;

    // 화면 클리어
    ctx.fillStyle = '#000011';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // 별 배경 그리기
    drawStars();

    // 외계인 생성
    if (!lastEnemySpawn || timestamp - lastEnemySpawn > enemySpawnRate) {
        spawnEnemy();
        lastEnemySpawn = timestamp;
    }

    // 플레이어 이동
    movePlayer();

    // 그리기
    drawPlayer();
    drawBullets();
    drawEnemies();
    drawExplosions();

    // 충돌 감지
    checkCollisions();

    animationId = requestAnimationFrame(gameLoop);
}

// 초기 화면 설정
function init() {
    ctx.fillStyle = '#000011';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // 초기 별 그리기
    drawStars();

    // 안내 텍스트
    ctx.fillStyle = '#00d4ff';
    ctx.font = '24px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('게임 시작 버튼을 클릭하세요!', canvas.width / 2, canvas.height / 2);
    ctx.font = '16px Arial';
    ctx.fillStyle = '#888';
    ctx.fillText('← → 이동 | 스페이스바 발사', canvas.width / 2, canvas.height / 2 + 40);
}

init();
