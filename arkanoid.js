const btn = document.getElementById("btn");
const canvas = document.getElementById("arkanoid");
const ctx = canvas.getContext("2d");

let interval;								//繰り返しの識別
let clear = false;					//クリアしてるか
let dead = false;						//ゲームオーバーしてるか
let play = false;						//プレイ中か
let rightPressed = false;		//→キーが押されたか
let leftPressed = false;		//←キーが押されたか
let score = 0;							//スコア
let plus = 100;							//加点

let x = canvas.width / 2;		//ballの初期位置
let y = canvas.height - 30;

let dx = 2;									//ballの変化量
let dy = -2;

const ballRadius = 10;									//ballの半径
const paddleHeight = 10;								//paddleの高さ
const paddleWidth = 100;								//paddleの幅
let paddleX = (canvas.width - paddleWidth) / 2;	//paddleの初期位置
const paddleSpeed = 7;									//paddleの動くスピード

const blockRowCount = 5;								//blockの行数
const blockColumnCount = 7;							//blockの列数
let blockNum = blockRowCount * blockColumnCount;//blockの個数
//let blockNum = 2;test—p
const blockWidth = 75;									//blockの幅
const blockHeight = 20;									//blockの高さ
const blockPadding = 10;								//block同士の間隔
const blockOffsetTop = 30;							//blockの描写開始位置
const blockOffsetLeft = 30;							//blockの描写開始位置

const blocks = [];										//blockの情報用配列
for (let r = 0; r < blockRowCount; r++) {
	blocks[r] = [];
	for (let c = 0; c < blockColumnCount; c++) {
	blocks[r][c] = { x: 0, y: 0, existence: true };
	}
}



document.onkeydown = function (e) {//キーボード入力検知
	switch (e.keyCode) {
		case 37: //←キーが押された時
			leftPressed = true;
			break;
		case 39: //→キーが押された時
			rightPressed = true;
			break;
		case 80: //Pキーが押された時
			gameStop();
			break;
		case 32: //Spaceキーが押された時
			gameReStart();
			break;
	}
}

document.onkeyup = function (e) {//ボタンから手が離れた時
	switch (e.keyCode) {
		case 37: // ←キから手が離れた時
			leftPressed = false;
			break;
		case 39: // →キから手が離れた時
			rightPressed = false;
			break;
	}
}

/*--------------------ゲームの初期化--------------------*/
drawBall();
drawPaddle();
drawBlocks();
drawScore();
/*--------------------関数の宣言部分--------------------*/

function gameStop(){//一時停止
	if(play){
		play = false;
		clearInterval(interval);
	}
}

function gameReStart(){//ゲーム開始/再開
	if(!play){
		if(clear || dead){
			document.location.reload();
		}
		play = true;
		interval = setInterval(draw, 10);
	}
}

function gameOver(){//ゲームオーバー
	play = false;
	dead = true;
	clearInterval(interval);
	canvas.style.backgroundColor = 'BLACK';
	ctx.clearRect(0, 0, canvas.width, canvas.height);
	ctx.font = "90px Arial";
	ctx.fillStyle = "#EEEEEE";
	ctx.fillText(`---GameOver---`, canvas.width/60, canvas.height/2);
	btn.innerHTML = "Again";
}

function gameClear(){//クリア
	play = false;
	clear = true;
	clearInterval(interval);
	canvas.style.backgroundColor = '#FF4F50';
	ctx.clearRect(0, 0, canvas.width, canvas.height);
	ctx.font = "100px Arial";
	ctx.fillStyle = "#EEEEEE";
	ctx.fillText(`---Clear---`, canvas.width/7, canvas.height/2);
	btn.innerHTML = "Again";
}



function drawBall(){//ballの描写
	ctx.beginPath();
	ctx.arc(x, y, ballRadius, 0, Math.PI * 2);
	ctx.fillStyle = "#0066FF";
	ctx.fill();
	ctx.closePath();
}

function drawPaddle(){//paddleの描写
	ctx.beginPath();
	ctx.rect(paddleX, canvas.height - paddleHeight, paddleWidth, paddleHeight);
	ctx.fillStyle = "#FFFF33";
	ctx.fill();
	ctx.closePath();
}

function drawBlocks() {//blockの描写
  for (let r = 0; r < blockRowCount; r++) {
    for (let c = 0; c < blockColumnCount; c++) {
		if(blocks[r][c].existence){
				const blockX = c * (blockWidth + blockPadding) + blockOffsetLeft;
				const blockY = r * (blockHeight + blockPadding) + blockOffsetTop;
				blocks[r][c].x = blockX;//blockの位置格納
				blocks[r][c].y = blockY;//blockの位置格納
				ctx.beginPath();
				ctx.rect(blockX, blockY, blockWidth, blockHeight);
				ctx.fillStyle = "#99CC33";
				ctx.fill();
				ctx.closePath();
			}
		}
	}
}



function drawScore() {//scoreの描写
	ctx.font = "16px Arial";
	ctx.fillStyle = "#EEEEEE";
	ctx.fillText(`Score: ${score}`, 8, 20);
}



function collisionDetection() {//blockの衝突検知
	for (let r = 0; r < blockRowCount; r++){
		for(let c = 0; c < blockColumnCount; c++){
			if(blocks[r][c].existence){
				const b = blocks[r][c];
				if (x > b.x && x < b.x + blockWidth && y > b.y && y < b.y + blockHeight) {
					blockNum = blockNum - 1;
					if(blockNum == 0){
						gameClear();
					}
					dy = -dy;
					score += plus;
					b.existence = false;
				}
			}
		}
	}
}

function draw(){//繰り返し描写処理
	ctx.clearRect(0, 0, canvas.width, canvas.height);

	drawBall();//ballの描写
	drawPaddle();//paddleの描写
	drawBlocks();//blockの描写
	drawScore();//scoreの描写
	collisionDetection();//blockの衝突検知

	//Canvasからはみ出ないように
	if(x + dx > canvas.width - ballRadius || x + dx < ballRadius){
		dx = -dx;
	}

	if(y + dy < ballRadius){
		dy = -dy;
	}else if(y + dy > canvas.height - ballRadius){
		if(x > paddleX && x < paddleX + paddleWidth){//paddleにballが当たった
			dy = -dy;
			if (rightPressed) {
				if (dx > 0) {
					dx = 3;
				}else if (dx < 0) {
					dx = -1;
				}
			}else if (leftPressed) {
				if (dx > 0) {
					dx = 1;
				}else if (dx < 0) {
					dx = -3;
				}
			} else {
				if (dx > 0) {
					dx = 2;
				}else if (dx < 0) {
					dx = -2;
				}
			}
		}else{
			gameOver();
		}
	}

	if (rightPressed) {//paddleを動かす
		paddleX = Math.min(paddleX + paddleSpeed, canvas.width - paddleWidth);
	} else if (leftPressed) {
			paddleX = Math.max(paddleX - paddleSpeed, 0);
	}

	x += dx;//ballを動かす
	y += dy;

}

