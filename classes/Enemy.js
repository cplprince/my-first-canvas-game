export default class Enemy {
	constructor(x, y, radius, color, velocity) {
		this.x = x;
		this.y = y;
		this.radius = radius;
		this.color = color;
		this.velocity = velocity;
		this.type = "Linear";
		this.radians = 0;
		this.center = {
			x: x,
			y: y,
		};

		if (Math.random() < 0.5) {
			this.type = "Homing";

			if (Math.random() < 0.5) {
				this.type = "Spinning";

				if (Math.random() < 0.5) {
					this.type = "Homing Spinning";
				}
			}
		}
	}

	draw(ctx) {
		ctx.beginPath();
		ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
		ctx.fillStyle = this.color;
		ctx.fill();
	}

	update(ctx, playerX, playerY) {
		this.draw(ctx);

		if (this.type == "Linear") {
			this.#linear();
		} else if (this.type == "Spinning") {
			this.#spinning();
		} else if (this.type == "Homing") {
			this.#homing(playerX, playerY);
		} else if (this.type == "Homing Spinning") {
			this.#homingSpinning(playerX, playerY);
		}
	}

	#linear() {
		this.x = this.x + this.velocity.x;
		this.y = this.y + this.velocity.y;
	}

	#spinning() {
		this.radians += 0.1;
		this.center.x += this.velocity.x;
		this.center.y += this.velocity.y;

		this.x = this.center.x + Math.cos(this.radians) * 30;
		this.y = this.center.y + Math.sin(this.radians) * 30;
	}

	#homing(playerX, playerY) {
		const angle = Math.atan2(playerY - this.y, playerX - this.x);
		this.velocity.x = Math.cos(angle);
		this.velocity.y = Math.sin(angle);

		this.x = this.x + this.velocity.x;
		this.y = this.y + this.velocity.y;
	}

	#homingSpinning(playerX, playerY) {
		this.radians += 0.1;

		const angle = Math.atan2(playerY - this.center.y, playerX - this.center.x);
		this.velocity.x = Math.cos(angle);
		this.velocity.y = Math.sin(angle);

		this.center.x += this.velocity.x;
		this.center.y += this.velocity.y;

		this.x = this.center.x + Math.cos(this.radians) * 30;
		this.y = this.center.y + Math.sin(this.radians) * 30;
	}
}
