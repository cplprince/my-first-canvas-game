import Player from "./classes/Player.js";
import Projectile from "./classes/Projectile.js";
import Enemy from "./classes/Enemy.js";
import Particle from "./classes/Particle.js";
import PowerUp from "./classes/PowerUp.js";
import BackgroundParticle from "./classes/BackgroundParticle.js";
import * as audio from "./sounds/audio.js";

const canvas = document.querySelector("canvas");
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

const ctx = canvas.getContext("2d");

const scoreEl = document.getElementById("scoreEl");
const modalEl = document.getElementById("modalEl");
const modalScoreEl = document.getElementById("modalScoreEl");
const buttonEl = document.getElementById("buttonEl");
const buttonStartEl = document.getElementById("buttonStartEl");
const modalStartEl = document.getElementById("modalStartEl");
const volumeUpEl = document.getElementById("volumeUpEl");
const volumeOffEl = document.getElementById("volumeOffEl");

let x;
let y;
let player;
let projectiles = [];
let enemies = [];
let particles = [];
let powerUps = [];
let backgroundParticles = [];
let animationId;
let intervalId;
let spawnPowerUpsId;
let score = 0;
let frames = 0;
let game = {
	active: false,
};

const SCORE_FOR_ENEMY_SHRINK = 100;
const SCORE_FOR_KILL_ENEMY = 150;
const PARTICLE_SPACING = 30;

function init() {
	x = canvas.width / 2;
	y = canvas.height / 2;
	enemies = [];
	projectiles = [];
	particles = [];
	powerUps = [];
	score = 0;
	frames = 0;
	player = new Player(x, y, 10, "white");
	animationId = 0;
	scoreEl.textContent = 0;
	backgroundParticles = [];
	game = {
		active: true,
	};

	for (let x = 0; x <= canvas.width + PARTICLE_SPACING; x += PARTICLE_SPACING) {
		for (
			let y = 0;
			y <= canvas.height + PARTICLE_SPACING;
			y += PARTICLE_SPACING
		) {
			backgroundParticles.push(new BackgroundParticle({ x, y }));
		}
	}
}

function spawnEnemies() {
	intervalId = setInterval(() => {
		const radius = Math.random() * (30 - 4) + 4;
		const color = `hsl(${Math.random() * 360}, 50%, 50%)`;

		let enemyX;
		let enemyY;

		if (Math.random() < 0.5) {
			enemyX = Math.random() < 0.5 ? -radius : canvas.width + radius;
			enemyY = Math.random() * canvas.height;
		} else {
			enemyX = Math.random() * canvas.width;
			enemyY = Math.random() < 0.5 ? -radius : canvas.height + radius;
		}

		const angle = Math.atan2(y - enemyY, x - enemyX);
		const velocity = { x: Math.cos(angle), y: Math.sin(angle) };

		enemies.push(new Enemy(enemyX, enemyY, radius, color, velocity));
	}, 1000);
}

function spawnPowerUps() {
	spawnPowerUpsId = setInterval(() => {
		powerUps.push(
			new PowerUp(
				{ x: -30, y: Math.random() * canvas.height },
				{ x: Math.random() + 2, y: 0 }
			)
		);
	}, 10000);
}

function createScoreLabel(score, position) {
	const scoreLabel = document.createElement("label");
	scoreLabel.textContent = score;
	scoreLabel.style.color = "white";
	scoreLabel.style.position = "absolute";
	scoreLabel.style.left = position.x + "px";
	scoreLabel.style.top = position.y + "px";
	scoreLabel.style.userSelect = "none";
	scoreLabel.style.pointerEvents = "none";
	document.body.appendChild(scoreLabel);

	gsap.to(scoreLabel, {
		opacity: 0,
		y: -30,
		duration: 0.75,
		onComplete: () => {
			scoreLabel.parentNode.removeChild(scoreLabel);
		},
	});
}

function animate() {
	animationId = requestAnimationFrame(animate);
	ctx.fillStyle = "rgba(0,0,0,0.1)";
	ctx.fillRect(0, 0, canvas.width, canvas.height);
	frames++;

	backgroundParticles.forEach((particle) => {
		particle.draw(ctx);
		const dist = Math.hypot(
			player.x - particle.position.x,
			player.y - particle.position.y
		);
		if (dist < 100) {
			particle.alpha = 0;
			if (dist > 70) particle.alpha = 0.5;
		} else if (dist > 100 && particle.alpha < 0.1) {
			particle.alpha += 0.01;
		} else if (dist > 100 && particle.alpha > 0.1) {
			particle.alpha -= 0.01;
		}
	});

	player.update(ctx, canvas.width, canvas.height);

	for (let i = powerUps.length - 1; i >= 0; i--) {
		const powerUp = powerUps[i];

		if (powerUp.position.x > canvas.width) {
			powerUps.splice(i, 1);
		} else {
			powerUp.update(ctx);
		}

		const dist = Math.hypot(
			player.x - powerUp.position.x,
			player.y - powerUp.position.y
		);
		if (dist < powerUp.image.height / 2 + player.radius) {
			powerUps.splice(i, 1);
			player.powerUp = "machineGun";
			player.color = "yellow";
			audio.powerUpNoiseAudio.play();

			setTimeout(() => {
				player.powerUp = null;
				player.color = "white";
			}, 5000);
		}
	}

	if (player.powerUp === "machineGun") {
		const angle = Math.atan2(
			mouse.position.y - player.y,
			mouse.position.x - player.x
		);
		const velocity = {
			x: Math.cos(angle) * 5,
			y: Math.sin(angle) * 5,
		};
		if (frames % 2 === 0) {
			projectiles.push(
				new Projectile(player.x, player.y, 5, "yellow", velocity)
			);
		}

		if (frames % 5 === 0) {
			audio.shootAudio.play();
		}
	}

	for (let index = particles.length - 1; index >= 0; index--) {
		const particle = particles[index];

		if (particle.alpha <= 0) {
			particles.splice(index, 1);
		} else {
			particle.update(ctx);
		}
	}

	for (let index = projectiles.length - 1; index >= 0; index--) {
		const projectile = projectiles[index];

		projectile.update(ctx);

		if (
			projectile.x - projectile.radius < 0 ||
			projectile.x + projectile.radius > canvas.width ||
			projectile.y - projectile.radius < 0 ||
			projectile.y - projectile.radius > canvas.height
		) {
			projectiles.splice(index, 1);
		}
	}

	for (let enemyIndex = enemies.length - 1; enemyIndex >= 0; enemyIndex--) {
		const enemy = enemies[enemyIndex];

		enemy.update(ctx, player.x, player.y);

		const distToPlayer = Math.hypot(enemy.x - player.x, enemy.y - player.y);
		if (distToPlayer - enemy.radius - player.radius < 0) {
			cancelAnimationFrame(animationId);
			clearInterval(intervalId);
			clearInterval(spawnPowerUpsId);
			audio.deathAudio.play();
			game.active = false;
			modalEl.style.display = "block";
			gsap.fromTo(
				"#modalEl",
				{
					scale: 0.8,
					opacity: 0,
				},
				{
					opacity: 1,
					scale: 1,
					ease: "expo.out",
				}
			);
			modalScoreEl.textContent = score;
		} else {
			for (
				let projectileIndex = projectiles.length - 1;
				projectileIndex >= 0;
				projectileIndex--
			) {
				const projectile = projectiles[projectileIndex];

				const dist = Math.hypot(projectile.x - enemy.x, projectile.y - enemy.y);

				if (dist - enemy.radius - projectile.radius < 1) {
					for (let i = 0; i < enemy.radius * 2; i++) {
						particles.push(
							new Particle(
								projectile.x,
								projectile.y,
								Math.random() * 2,
								enemy.color,
								{
									x: (Math.random() - 0.5) * (Math.random() * 8),
									y: (Math.random() - 0.5) * (Math.random() * 8),
								}
							)
						);
					}

					if (enemy.radius - 10 > 5) {
						audio.dmgTakenAudio.play();
						score += SCORE_FOR_ENEMY_SHRINK;
						gsap.to(enemy, {
							radius: enemy.radius - 10,
						});
						createScoreLabel(SCORE_FOR_ENEMY_SHRINK, {
							x: enemy.x,
							y: enemy.y,
						});
						projectiles.splice(projectileIndex, 1);
					} else {
						audio.explodeAudio.play();
						score += SCORE_FOR_KILL_ENEMY;
						createScoreLabel(SCORE_FOR_KILL_ENEMY, { x: enemy.x, y: enemy.y });
						backgroundParticles.forEach((particle) => {
							gsap.set(particle, {
								color: "white",
								alpha: 1,
							});
							gsap.to(particle, {
								color: enemy.color,
								alpha: 0.1,
							});
						});
						enemies.splice(enemyIndex, 1);
						projectiles.splice(projectileIndex, 1);
					}
					scoreEl.innerHTML = score;
				}
			}
		}
	}
}

let audioInitialized = false;

function shoot(x, y) {
	if (game.active) {
		const angle = Math.atan2(y - player.y, x - player.x);
		const velocity = { x: Math.cos(angle) * 5, y: Math.sin(angle) * 5 };
		projectiles.push(new Projectile(player.x, player.y, 5, "white", velocity));

		audio.shootAudio.play();
	}
}

window.addEventListener("click", (e) => {
	if (!audioInitialized && !audio.backgroundAudio.playing()) {
		audio.backgroundAudio.play();
		audioInitialized = true;
	}
	shoot(e.clientX, e.clientY);
});

// SAFARI STUFF
// window.addEventListener("touchstart", (e) => {
// 	console.log(e);
// 	const x = e.touches[0].clientX;
// 	const y = e.touches[0].clientY;

// 	mouse.position.x = e.touches[0].clientX;
// 	mouse.position.y = e.touches[0].clientY;

// 	shoot(x, y);
// });

const mouse = { position: { x: 0, y: 0 } };

window.addEventListener("mousemove", (e) => {
	mouse.position.x = e.clientX;
	mouse.position.y = e.clientY;
});

window.addEventListener("touchmove", (e) => {
	mouse.position.x = e.touches[0].clientX;
	mouse.position.y = e.touches[0].clientY;
});

buttonEl.addEventListener("click", () => {
	audio.selectAudio.play();
	init();
	animate();
	spawnEnemies();
	spawnPowerUps();
	gsap.to("#modalEl", {
		opacity: 0,
		scale: 0.8,
		duration: 0.2,
		ease: "expo.in",
		onComplete: () => {
			modalEl.style.display = "none";
		},
	});
});

buttonStartEl.addEventListener("click", () => {
	audio.selectAudio.play();
	init();
	animate();
	spawnEnemies();
	spawnPowerUps();
	gsap.to("#modalStartEl", {
		opacity: 0,
		scale: 0.8,
		duration: 0.2,
		ease: "expo.in",
		onComplete: () => {
			modalStartEl.style.display = "none";
		},
	});
});

//mute everything
volumeUpEl.addEventListener("click", () => {
	audio.backgroundAudio.pause();
	volumeOffEl.style.display = "block";
	volumeUpEl.style.display = "none";

	for (const key in audio) {
		audio[key].mute(true);
	}
});

//unmute everything
volumeOffEl.addEventListener("click", () => {
	if (audioInitialized && !audio.backgroundAudio.playing())
		audio.backgroundAudio.play();
	volumeOffEl.style.display = "none";
	volumeUpEl.style.display = "block";

	for (const key in audio) {
		audio[key].mute(false);
	}
});

window.addEventListener("resize", () => {
	canvas.width = window.innerWidth;
	canvas.height = window.innerHeight;
	init();
});

document.addEventListener("visibilitychange", () => {
	if (document.hidden) {
		clearInterval(intervalId);
		clearInterval(spawnPowerUpsId);
	} else {
		spawnPowerUps();
		spawnEnemies();
	}
});

window.addEventListener("keydown", (e) => {
	if (
		e.key == "ArrowUp" ||
		e.key == "ArrowDown" ||
		e.key == "ArrowLeft" ||
		e.key == "ArrowRight"
	) {
		player.keyState[e.key] = e.type == "keydown";
	}
});
window.addEventListener("keyup", (e) => {
	if (
		e.key == "ArrowUp" ||
		e.key == "ArrowDown" ||
		e.key == "ArrowLeft" ||
		e.key == "ArrowRight"
	) {
		player.keyState[e.key] = e.type == "keydown";
	}
});
