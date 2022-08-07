export default class Player {
	constructor(x, y, radius, color) {
		this.x = x;
		this.y = y;
		this.radius = radius;
		this.color = color;
		this.friction = 0.99;
		this.speed = 5;
		this.velocity = {
			x: 0,
			y: 0,
		};
		this.keyState = {
			ArrowRight: false,
			ArrowLeft: false,
			ArrowUp: false,
			ArrowDown: false,
		};
		this.powerUp;
	}

	draw(ctx) {
		ctx.beginPath();
		ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
		ctx.fillStyle = this.color;
		ctx.fill();
	}

	update(ctx, canvasWidth, canvasHeight) {
		this.draw(ctx);

		if (this.keyState.ArrowRight) this.velocity.x = 1;
		if (this.keyState.ArrowLeft) this.velocity.x = -1;
		if (this.keyState.ArrowUp) this.velocity.y = -1;
		if (this.keyState.ArrowDown) this.velocity.y = 1;

		if (
			this.x + this.radius + this.velocity.x * this.speed >= canvasWidth ||
			this.x - this.radius + this.velocity.x * this.speed <= 0
		) {
			this.velocity.x = 0;
		}
		if (
			this.y + this.radius + this.velocity.y * this.speed >= canvasHeight ||
			this.y - this.radius + this.velocity.y * this.speed <= 0
		) {
			this.velocity.y = 0;
		}

		if (
			this.velocity.x == 1 ||
			this.velocity.y == 1 ||
			this.velocity.x == -1 ||
			this.velocity.y == -1
		) {
			const length = Math.sqrt(this.velocity.x ** 2 + this.velocity.y ** 2);
			this.velocity.x /= length;
			this.velocity.y /= length;
		}

		this.velocity.x *= this.friction;
		this.velocity.y *= this.friction;

		this.x += this.velocity.x * this.speed;
		this.y += this.velocity.y * this.speed;
	}
}
