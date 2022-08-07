export const shootAudio = new Howl({
	src: "./sounds/Basic_shoot_noise.mp3",
	volume: 0.04,
});
export const dmgTakenAudio = new Howl({
	src: "./sounds/Damage_taken.mp3",
	volume: 0.1,
});
export const explodeAudio = new Howl({
	src: "./sounds/Explode.mp3",
	volume: 0.1,
});

export const deathAudio = new Howl({
	src: "./sounds/Death.mp3",
	volume: 0.1,
});

export const powerUpNoiseAudio = new Howl({
	src: "./sounds/Powerup_noise.mp3",
	volume: 0.1,
});

export const selectAudio = new Howl({
	src: "./sounds/Select.mp3",
	volume: 0.1,
	html5: true,
});

export const backgroundAudio = new Howl({
	src: "./sounds/Hyper.wav",
	volume: 0.1,
	loop: true,
});
