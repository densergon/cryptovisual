import gsap from "gsap";
import { Container, Graphics, Text } from "pixi.js";
//#region src/visualization/scenes/bitstream-scene.ts
var BitStreamVisualizer = class {
	app;
	stage;
	root;
	particles = [];
	lockContainer;
	isInitialized = false;
	isPaused = false;
	timeline = null;
	hasPlayed = false;
	masterTimeline = null;
	entropyParticles = [];
	constructor(app, stage) {
		this.app = app;
		this.stage = stage;
		this.root = new Container();
		this.lockContainer = new Container();
	}
	get centerX() {
		return this.app.screen.width / 2;
	}
	get centerY() {
		return this.app.screen.height * .4;
	}
	createEntropySwirl() {
		const centerX = this.centerX;
		const centerY = this.centerY;
		const particleCount = 64;
		for (let i = 0; i < particleCount; i++) {
			const graphics = new Graphics();
			const size = 3 + Math.random() * 3;
			graphics.circle(0, 0, size);
			graphics.fill({
				color: 440020,
				alpha: .4 + Math.random() * .4
			});
			const angle = i / particleCount * Math.PI * 4;
			const radius = 10 + i / particleCount * 80;
			graphics.x = centerX + Math.cos(angle) * radius;
			graphics.y = centerY + Math.sin(angle) * radius;
			graphics.alpha = 0;
			this.entropyParticles.push(graphics);
			this.root.addChild(graphics);
		}
	}
	async init() {
		if (!this.app.renderer) {
			console.warn("BitStreamVisualizer: PixiJS not initialized yet");
			return;
		}
		this.createLockShape();
		this.createEntropySwirl();
		this.stage.addChild(this.root);
		this.isInitialized = true;
	}
	createLockShape() {
		const lockX = this.centerX;
		const lockY = this.app.screen.height * .7;
		const lockWidth = 120;
		const lockHeight = 80;
		const lockShape = new Graphics();
		lockShape.rect(lockX - lockWidth / 2, lockY, lockWidth, lockHeight);
		lockShape.fill({
			color: 440020,
			alpha: .3
		});
		lockShape.stroke({
			color: 440020,
			width: 3
		});
		const text = new Text({
			text: "AES-256 Session Key",
			style: {
				fontSize: 16,
				fill: 440020,
				fontWeight: "bold"
			}
		});
		text.anchor.set(.5);
		text.x = lockX;
		text.y = lockY + lockHeight / 2;
		text.label = "lock-label";
		this.lockContainer.addChild(lockShape);
		this.lockContainer.addChild(text);
		this.root.addChild(this.lockContainer);
	}
	createBitParticle(index) {
		const graphics = new Graphics();
		const size = 4;
		const spacing = 8;
		const screenWidth = this.app.screen.width;
		const screenHeight = this.app.screen.height;
		const startX = screenWidth / 2 - 256 * spacing / 2 + index * spacing;
		graphics.circle(0, 0, size);
		graphics.fill({
			color: 440020,
			alpha: .8
		});
		graphics.x = startX;
		graphics.y = -8;
		return {
			graphics,
			targetY: screenHeight * .7 + 40,
			delay: index * .01
		};
	}
	play() {
		if (!this.isInitialized || this.hasPlayed) return;
		this.hasPlayed = true;
		this.timeline = gsap.timeline();
		for (let i = 0; i < 256; i++) {
			const particle = this.createBitParticle(i);
			this.particles.push(particle);
			this.root.addChild(particle.graphics);
			this.timeline.to(particle.graphics, {
				y: particle.targetY,
				duration: 1.5,
				ease: "power3.out",
				delay: particle.delay
			}, 0);
			this.timeline.to(particle.graphics.scale, {
				x: 1.3,
				y: 1.3,
				duration: .2,
				yoyo: true,
				repeat: 1,
				ease: "power1.out"
			}, ">-0.1");
		}
		this.timeline.to(this.lockContainer, {
			alpha: .8,
			duration: .5,
			ease: "power2.out"
		}, ">-0.5");
		const tl = this.timeline;
		this.entropyParticles.forEach((p, i) => {
			p.scale.set(0);
			tl.fromTo(p, { alpha: 0 }, {
				alpha: .6,
				scale: 1,
				duration: .8,
				ease: "power2.out",
				delay: i * .01
			}, 0);
		});
		if (this.masterTimeline) this.masterTimeline.add(this.timeline, this.masterTimeline.time());
		if (this.isPaused) this.timeline.pause();
	}
	pause() {
		this.isPaused = true;
		this.timeline?.pause();
	}
	resume() {
		this.isPaused = false;
		this.timeline?.resume();
	}
	destroy() {
		this.timeline?.kill();
		this.timeline = null;
		this.hasPlayed = false;
		this.particles.forEach((p) => {
			gsap.killTweensOf(p.graphics);
			gsap.killTweensOf(p.graphics.scale);
			p.graphics.destroy({ children: true });
		});
		this.particles = [];
		gsap.killTweensOf(this.lockContainer);
		this.entropyParticles.forEach((p) => {
			gsap.killTweensOf(p);
			gsap.killTweensOf(p.scale);
			p.destroy({ children: true });
		});
		this.entropyParticles = [];
		this.root.removeChildren();
		if (this.root.parent) this.root.parent.removeChild(this.root);
		this.isPaused = false;
	}
	onEvent(event, _payload) {
		if (event === "bitstream-complete") console.log("Bit stream animation complete");
	}
};
//#endregion
//#region src/visualization/scenes/keygen-scene.ts
var KeygenVisualizer = class {
	app;
	stage;
	root;
	publicSphere;
	privateSphere;
	publicLabel;
	privateLabel;
	centerPoint;
	isInitialized = false;
	isPaused = false;
	timeline = null;
	masterTimeline = null;
	constructor(app, stage) {
		this.app = app;
		this.stage = stage;
		this.root = new Container();
		this.centerPoint = {
			x: 0,
			y: 0
		};
		this.publicSphere = new Graphics();
		this.privateSphere = new Graphics();
		this.publicLabel = new Text({
			text: "Public Key",
			style: {
				fontSize: 14,
				fill: 9647082,
				fontWeight: "bold"
			}
		});
		this.privateLabel = new Text({
			text: "Private Key",
			style: {
				fontSize: 14,
				fill: 14362487,
				fontWeight: "bold"
			}
		});
	}
	async init() {
		if (!this.app.renderer) {
			console.warn("KeygenVisualizer: PixiJS not initialized yet");
			return;
		}
		this.centerPoint = {
			x: this.app.screen.width / 2,
			y: this.app.screen.height / 2
		};
		this.publicSphere = this.createSphere(9647082);
		this.privateSphere = this.createSphere(14362487);
		this.publicSphere.x = this.centerPoint.x;
		this.publicSphere.y = this.centerPoint.y;
		this.privateSphere.x = this.centerPoint.x;
		this.privateSphere.y = this.centerPoint.y;
		this.publicLabel.anchor.set(.5);
		this.publicLabel.x = this.centerPoint.x;
		this.publicLabel.y = this.centerPoint.y + 55;
		this.privateLabel.anchor.set(.5);
		this.privateLabel.x = this.centerPoint.x;
		this.privateLabel.y = this.centerPoint.y + 55;
		this.root.addChild(this.publicSphere, this.privateSphere, this.publicLabel, this.privateLabel);
		this.stage.addChild(this.root);
		this.isInitialized = true;
	}
	createSphere(color) {
		const graphics = new Graphics();
		graphics.circle(0, 0, 40);
		graphics.fill({
			color,
			alpha: .8
		});
		graphics.stroke({
			color,
			width: 3
		});
		return graphics;
	}
	play() {
		if (!this.isInitialized) return;
		if (this.timeline) this.timeline.kill();
		const separation = 150;
		const duration = 2;
		this.timeline = gsap.timeline();
		this.timeline.to(this.publicSphere, {
			x: this.centerPoint.x - separation,
			duration,
			ease: "back.out(1.7)"
		}, 0);
		this.timeline.to(this.privateSphere, {
			x: this.centerPoint.x + separation,
			duration,
			ease: "back.out(1.7)"
		}, 0);
		this.timeline.to(this.publicLabel, {
			x: this.centerPoint.x - separation,
			duration,
			ease: "back.out(1.7)"
		}, 0);
		this.timeline.to(this.privateLabel, {
			x: this.centerPoint.x + separation,
			duration,
			ease: "back.out(1.7)"
		}, 0);
		this.timeline.to(this.publicSphere.scale, {
			x: 1.2,
			y: 1.2,
			duration: duration / 2,
			yoyo: true,
			repeat: 1,
			ease: "power1.inOut"
		}, 0);
		this.timeline.to(this.privateSphere.scale, {
			x: 1.2,
			y: 1.2,
			duration: duration / 2,
			yoyo: true,
			repeat: 1,
			ease: "power1.inOut"
		}, 0);
		if (this.masterTimeline) this.masterTimeline.add(this.timeline, this.masterTimeline.time());
		if (this.isPaused) this.timeline.pause();
	}
	pause() {
		this.isPaused = true;
		this.timeline?.pause();
	}
	resume() {
		this.isPaused = false;
		this.timeline?.resume();
	}
	destroy() {
		this.timeline?.kill();
		this.timeline = null;
		gsap.killTweensOf(this.publicSphere);
		gsap.killTweensOf(this.privateSphere);
		gsap.killTweensOf(this.publicSphere.scale);
		gsap.killTweensOf(this.privateSphere.scale);
		this.root.removeChildren();
		if (this.root.parent) this.root.parent.removeChild(this.root);
		this.isPaused = false;
	}
	onEvent(event, payload) {
		if (event === "keygen-complete" && payload) console.log("Key generation complete:", payload);
	}
};
//#endregion
export { BitStreamVisualizer as n, KeygenVisualizer as t };
