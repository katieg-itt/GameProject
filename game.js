var game = {
	life:20,
	score:0
}

var player = {						// Stats for player
	coords:{
		x:10,						// Players X position
		y:200						// Players Y position
	}, 
	spriteWidth: 76,				// Image Width
	spriteHeight: 90,				// Image Height
	bullets:[]						// Array of all spawned bullet positions
};

var playerTwo = {
	coords:{
		x:40,						// Players X position
		y:400						// Players Y position
	}, 
	spriteWidth: 76,				// Image Width
	spriteHeight: 90,				// Image Height
	bullets:[]						// Array of all spawned bullet positions
};

var bullet = {						// Stats for bullets
	speed:10,						// Movement Speed
	spriteWidth:21,					// Image Width
	spriteHeight:11,				// Image Height
}

var zombie = {						// Stats for zombies
	spawns:[100,200,300,400,500],	// Places he can spawn
	max:5,							// Max amount on screen at once
	spawnRate:1,					// % chance of spawning
	speed:2,						// Movement Speed
	spriteWidth:68,					// Image Height
	spriteHeight:116,				// Image Width
}

var zombies = [];					// Array of all spawned zombie positons

var canvasHeight = 600,
	canvasWidth = 800;

var gameOver = false,
	pauseGame = false,
	gameStarted = false,
	twoPlayer = true;

var canvas,canvasContext;

var bulletSound, gameOverSound;

function restart(players) {
	// reset all variables to start position
	gameStarted = true;
	player.coords.x = 10;
	player.coords.y = 200;
	game.score = 0;
	game.life = 20;
	zombies = [];
	player.bullets = [];
	playerTwo.bullets = [];
	gameOver = false;
	zombie.speed = 2;
	if(players == 2) {
		playerTwo.coords.x = 40;
		playerTwo.coords.y = 400;
		twoPlayer = true;
	} else {
		twoPlayer = false;
	}
}

function pauseGame(){
	if(!gamePaused){
		game = clearTimeout(game);
		gamePaused = true;
	}else if (gamePaused){
		game = setTimeout(gameLoop, 1000/30);
	}
}

function spawnZombie(){
	// if not max zombies
	// 5% chance of zombie spawning
	// spawn in a random row
	if(zombies.length < zombie.max) {	// If there is not already max zombies
		if(Math.floor(Math.random()*100)<=zombie.spawnRate) { // Get a random number between 1 and 100
			zombies.push({	// Add new zombie to the spawn array
				coords:{
					x:canvasWidth - zombie.spriteWidth,	// On the far right
					y:zombie.spawns[Math.floor(Math.random()*zombie.spawns.length)]	// At a random spawn row
				}
			});

		}
	}
}

function moveZombie() {
	if(zombies.length) {	// If there are zombies spawned
		for(i=0;i<zombies.length;i++) {
			if(zombies[i].coords.x < 0) {
				// If the zombie reaches the base, remove it, and decrease score
				zombies.splice(i,1);	// Remove from spawn array
				game.life--; // and decrease player health by 1
				if(game.life <= 0) {
					gameOver = true;	// Player is dead
					gameOverSound.play();
				}
			} else {
				zombies[i].coords.x -= zombie.speed;	// Move the zombie left
			}
		}
	}

}

function spawnBullet(playerNumber){
	if(playerNumber == 1) {
		if(player.bullets.length < 5) {	// Max bullets
			bulletSound.cloneNode(1).play();		// clonenode lets you play multiple copies of same sound - http://stackoverflow.com/questions/25654558/html5-js-play-same-sound-multiple-times-at-the-same-time
			player.bullets.push({		// Add new bullet to spawn array
				coords:{
					x:(player.coords.x + player.spriteWidth) + 1,	// At the right of the player
					y:(player.coords.y + player.spriteHeight/2) + 1,	// Half way down
				}
			});
		}
	} else {
		if(playerTwo.bullets.length < 5) {	// Max bullets
			bulletSound.cloneNode(1).play();
			playerTwo.bullets.push({		// Add new bullet to spawn array
				coords:{
					x:(playerTwo.coords.x + playerTwo.spriteWidth) + 1,	// At the right of the player
					y:(playerTwo.coords.y + playerTwo.spriteHeight/2) + 1,	// Half way down
				}
			});
		}
	}
}

function moveBullets() {
	if(player.bullets.length) {
		for(i=0;i<player.bullets.length;i++) {
			if(player.bullets[i].coords.x > canvasWidth) {
				player.bullets.splice(i,1); // If the bullet is off the canvas, remove it from the array
			} else {
				player.bullets[i].coords.x += bullet.speed;	// Otherwise, move it right at speed
			}
		}
	}
	if(playerTwo.bullets.length) {
		for(i=0;i<playerTwo.bullets.length;i++) {
			if(playerTwo.bullets[i].coords.x > canvasWidth) {
				playerTwo.bullets.splice(i,1); // If the bullet is off the canvas, remove it from the array
			} else {
				playerTwo.bullets[i].coords.x += bullet.speed;	// Otherwise, move it right at speed
			}
		}
	}
}

function detectHits() {
	if(zombies.length) {
		for(i=0;i<zombies.length;i++) {
			// If a bullet overlaps a zombie, kill them both and increase player score
			if(player.bullets.length) {
				for(j=0;j<player.bullets.length;j++) {				// Check if bullet image overlaps zombie image
						if(player.bullets[j].coords.x+bullet.spriteWidth > zombies[i].coords.x &&		// Right of bullet is after left of z
						   player.bullets[j].coords.x < zombies[i].coords.x+zombie.spriteWidth &&		// left of bullet is before right of z
						   player.bullets[j].coords.y+bullet.spriteHeight > zombies[i].coords.y &&		// bottom of bullet is below top of z
						   player.bullets[j].coords.y < zombies[i].coords.y+zombie.spriteHeight) {		// top of bullet is above bottom of z
						   	// They overlap, so remove bullet and zombie and increase player score
							player.bullets.splice(j,1);
							zombies.splice(i,1);
							game.score++;
							//zombie.speed++; increases zombie speed after 5 bullets shot
						}
				}
			}
			if(playerTwo.bullets.length) {	// same as above for player 2
				for(j=0;j<playerTwo.bullets.length;j++) {				// Check if bullet image overlaps zombie image
						if(playerTwo.bullets[j].coords.x+bullet.spriteWidth > zombies[i].coords.x &&		// Right of bullet is after left of z
						   playerTwo.bullets[j].coords.x < zombies[i].coords.x+zombie.spriteWidth &&		// left of bullet is before right of z
						   playerTwo.bullets[j].coords.y+bullet.spriteHeight > zombies[i].coords.y &&		// bottom of bullet is below top of z
						   playerTwo.bullets[j].coords.y < zombies[i].coords.y+zombie.spriteHeight) {		// top of bullet is above bottom of z
						   	// They overlap, so remove bullet and zombie and increase player score
							playerTwo.bullets.splice(j,1);
							zombies.splice(i,1);
							game.score++;
							//zombie.speed++; increases zombie speed after 5 bullets shot
						}
				}
			}
			// if player overlaps a zombie, game over
			if(player.coords.x+player.spriteWidth > zombies[i].coords.x &&
			   player.coords.x < zombies[i].coords.x+zombie.spriteWidth &&
			   player.coords.y+player.spriteHeight > zombies[i].coords.y &&
			   player.coords.y < zombies[i].coords.y+zombie.spriteHeight) {
			   	// They overlap, so games is over
			   	gameOver = true;
			   	gameOverSound.play();
			}

			if(twoPlayer) {
				if(playerTwo.coords.x+playerTwo.spriteWidth > zombies[i].coords.x &&
				   playerTwo.coords.x < zombies[i].coords.x+zombie.spriteWidth &&
				   playerTwo.coords.y+playerTwo.spriteHeight > zombies[i].coords.y &&
				   playerTwo.coords.y < zombies[i].coords.y+zombie.spriteHeight) {
					gameOver = true;
			   		gameOverSound.play();
				}
			}
		}
	}
}

window.onload = function(){
	var framesPerSecond = 30;
	canvas = document.getElementById('gameCanvas');
	canvasContext = canvas.getContext('2d');

	bulletSound = new Audio('audio/gunshot.mp3');
	bulletSound.loop = false;	// only play once

	gameOverSound = new Audio('audio/game-over.wav');
	gameOverSound.loop = false;

  
  	setInterval (function(){
  		if(gameStarted) {
	  		if(!pauseGame) {
	  			moveBullets();
	  			spawnZombie();
	  			moveZombie();
	  			detectHits();
	  			draw();
	  			updateLevel();

	  		}
	  	} else {
	  		mainMenu();
	  	}
  
	},1000/framesPerSecond);

}

window.addEventListener('mousedown', function(event) {
	// Track mouseclicks, only used for main menu screen
	if(!gameStarted) {
		// One player button
		if(event.pageX > 185 && event.pageY > 440 && event.pageX < 335 && event.pageY < 505) {
			restart(1);
		}
		// Two player button
		if(event.pageX > 480 && event.pageY > 440 && event.pageX < 630 && event.pageY < 505) {
			restart(2);
		}
	}
});

window.addEventListener('keydown',function(event){
	switch (event.keyCode){
		case 32: // space
			if(!gameOver) {
				spawnBullet(1);
			} else {
				gameStarted = false;
			}
		break;
		case 37: //left
			if(player.coords.x > 0) {
				player.coords.x -= 7;
			}
		break;

		case 38: //up
			if(player.coords.y > 0) {
				player.coords.y -= 7;
			}
		break;

		case 39: //right
			if(player.coords.x < canvasWidth - player.spriteWidth) {
				player.coords.x += 7;
			}
		break;

		case 40: //down
			if(player.coords.y < canvasHeight - player.spriteHeight) {
				player.coords.y += 7;
			}
		break;

		case 80:
			 	pauseGame = !pauseGame;
		break;

		case 16: // shift
			spawnBullet(2);
		break;

		case 87: //W up for player two
			if(playerTwo.coords.y > 0){
				playerTwo.coords.y -= 7;
			}
		break;

		case 65: //A left for player two
			if(playerTwo.coords.x > 0){
				playerTwo.coords.x -=7;
			}
		break;

		case 83:  //S down for player two
			if(playerTwo.coords.y < canvasHeight - playerTwo.spriteHeight) {
				playerTwo.coords.y += 7;
			}
		break;

		case 68:
			if(playerTwo.coords.x < canvasHeight - playerTwo.spriteHeight) {
				playerTwo.coords.x += 7;
			}
		break;

	}
},false);


function draw(){  
	bullet_image = new Image();
	bullet_image.src = 'img/bullet.png';
	player_image = new Image();
	player_image.src = 'img/player.png';
	playerTwo_image = new Image();
	playerTwo_image.src = 'img/player2.png'
	zombie_image = new Image();
	zombie_image.src = 'img/zombie-sprite.png';
	background_image = new Image();
	background_image.src = 'img/background.png';
	gameover_image = new Image();
	gameover_image.src = 'img/brains.PNG';

	
	canvasContext.drawImage(background_image,0,0);

	if(!gameOver) {

		canvasContext.drawImage(player_image,player.coords.x,player.coords.y,player.spriteWidth,player.spriteHeight);
		if(player.bullets.length) {
			for(i=0;i<player.bullets.length;i++) {
				canvasContext.drawImage(bullet_image,player.bullets[i].coords.x,player.bullets[i].coords.y);
			}
		}
		if(twoPlayer) {
			canvasContext.drawImage(playerTwo_image,playerTwo.coords.x,playerTwo.coords.y,playerTwo.spriteWidth,playerTwo.spriteHeight);
			if(playerTwo.bullets.length) {
				for(i=0;i<playerTwo.bullets.length;i++) {
					canvasContext.drawImage(bullet_image,playerTwo.bullets[i].coords.x,playerTwo.bullets[i].coords.y);
				}
			}
		}

		if(zombies.length) {
			for(i=0;i<zombies.length;i++) {
				canvasContext.drawImage(zombie_image,0, 0, zombie.spriteWidth,zombie.spriteHeight, zombies[i].coords.x,zombies[i].coords.y, zombie.spriteWidth,zombie.spriteHeight);
			}   	
		}

		// Score
		canvasContext.font = '15px Serif';
		canvasContext.fillStyle = 'red';
		canvasContext.fillText('Score: '+game.score,20,20);
		canvasContext.fillText('Health: '+game.life,700,20);
	} else {
		canvasContext.drawImage(gameover_image,0,0);
		canvasContext.font = '40px Courier New';
		canvasContext.fillStyle = 'red';
		canvasContext.font = '20px Lucida Console';
		canvasContext.fillText('Press space to restart', 310, 390);

	}

}

//Menu Screen
function mainMenu(){
	//Start screen shows option for one or two players
	menu_image = new Image();
	menu_image.src = 'img/start-menu.png';
	canvasContext.drawImage(menu_image, 0, 0);
} 


//Extra level
//When score hits 10
// zombie more zombies appear on screen
 function updateLevel(){		//easy level
 	if(game.score ==6){
 		zombie.speed = 5;
 	}else
 	if(game.score <=11){		//hard level
 		zombie.spawnRate++;
 	}else
 	if(game.score >= 19){		//insane Level
 		zombie.spawnRate++;
 		zombie.speed = 8;
 	}
} 