import gsap from "gsap";
import { type Application, Container, Graphics, Text } from "pixi.js";

interface BitParticle {
	graphics: Graphics;
	targetY: number;
	delay: number;
}

export class BitStreamVisualizer {
	private app: Application;
	private stage: Container;
	private root: Container;
	private particles: BitParticle[] = [];
	private lockContainer: Container;
	private isInitialized = false;
	private isPaused = false;
	private timeline: gsap.core.Timeline | null = null;
	private hasPlayed = false;
	public masterTimeline: gsap.core.Timeline | null = null;

	private entropyParticles: Graphics[] = [];

	constructor(app: Application, stage: Container) {
		this.app = app;
		this.stage = stage;
		this.root = new Container();
		this.lockContainer = new Container();
	}

	private get centerX(): number {
		return this.app.screen.width / 2;
	}

	private get centerY(): number {
		return this.app.screen.height * 0.4;
	}

	private createEntropySwirl(): void {
		const centerX = this.centerX;
		const centerY = this.centerY;
		const particleCount = 64;

		for (let i = 0; i < particleCount; i++) {
			const graphics = new Graphics();
			const size = 3 + Math.random() * 3;
			graphics.circle(0, 0, size);
			graphics.fill({ color: 0x06b6d4, alpha: 0.4 + Math.random() * 0.4 });

			const angle = (i / particleCount) * Math.PI * 4;
			const radius = 10 + (i / particleCount) * 80;
			graphics.x = centerX + Math.cos(angle) * radius;
			graphics.y = centerY + Math.sin(angle) * radius;
			graphics.alpha = 0;

			this.entropyParticles.push(graphics);
			this.root.addChild(graphics);
		}
	}

	async init(): Promise<void> {
		if (!this.app.renderer) {
			console.warn("BitStreamVisualizer: PixiJS not initialized yet");
			return;
		}
		this.createLockShape();
		this.createEntropySwirl();
		this.stage.addChild(this.root);
		this.isInitialized = true;
	}

	private createLockShape(): void {
		const lockX = this.centerX;
		const lockY = this.app.screen.height * 0.7;
		const lockWidth = 120;
		const lockHeight = 80;

		const lockShape = new Graphics();
		lockShape.rect(lockX - lockWidth / 2, lockY, lockWidth, lockHeight);
		lockShape.fill({ color: 0x06b6d4, alpha: 0.3 });
		lockShape.stroke({ color: 0x06b6d4, width: 3 });

		const text = new Text({
			text: "AES-256 Session Key",
			style: {
				fontSize: 16,
				fill: 0x06b6d4,
				fontWeight: "bold",
			},
		});
		text.anchor.set(0.5);
		text.x = lockX;
		text.y = lockY + lockHeight / 2;
		text.label = "lock-label";

		this.lockContainer.addChild(lockShape);
		this.lockContainer.addChild(text);
		this.root.addChild(this.lockContainer);
	}

	private createBitParticle(index: number): BitParticle {
		const graphics = new Graphics();
		const size = 4;
		const spacing = 8;
		const screenWidth = this.app.screen.width;
		const screenHeight = this.app.screen.height;
		const startX =
			screenWidth / 2 - (256 * spacing) / 2 + index * spacing;

		graphics.circle(0, 0, size);
		graphics.fill({ color: 0x06b6d4, alpha: 0.8 });

		graphics.x = startX;
		graphics.y = -size * 2;

		return {
			graphics,
			targetY: screenHeight * 0.7 + 40,
			delay: index * 0.01,
		};
	}

	play(): void {
		if (!this.isInitialized || this.hasPlayed) return;
		this.hasPlayed = true;

		this.timeline = gsap.timeline();

		for (let i = 0; i < 256; i++) {
			const particle = this.createBitParticle(i);
			this.particles.push(particle);
			this.root.addChild(particle.graphics);

			this.timeline.to(
				particle.graphics,
				{
					y: particle.targetY,
					duration: 1.5,
					ease: "power3.out",
					delay: particle.delay,
				},
				0,
			);

			this.timeline.to(
				particle.graphics.scale,
				{
					x: 1.3,
					y: 1.3,
					duration: 0.2,
					yoyo: true,
					repeat: 1,
					ease: "power1.out",
				},
				">-0.1",
			);
		}

		this.timeline.to(
			this.lockContainer,
			{
				alpha: 0.8,
				duration: 0.5,
				ease: "power2.out",
			},
			">-0.5",
		);

		// Animate entropy particles — fade in, scale up
		const tl = this.timeline!;
		this.entropyParticles.forEach((p, i) => {
			p.scale.set(0);
			tl.fromTo(
				p,
				{ alpha: 0 },
				{
					alpha: 0.6,
					scale: 1,
					duration: 0.8,
					ease: "power2.out",
					delay: i * 0.01,
				},
				0,
			);
		});

		if (this.masterTimeline) {
			this.masterTimeline.add(this.timeline, this.masterTimeline.time());
		}

		if (this.isPaused) {
			this.timeline.pause();
		}
	}

	pause(): void {
		this.isPaused = true;
		this.timeline?.pause();
	}

	resume(): void {
		this.isPaused = false;
		this.timeline?.resume();
	}

	destroy(): void {
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
		if (this.root.parent) {
			this.root.parent.removeChild(this.root);
		}
		this.isPaused = false;
	}

	onEvent(event: string, _payload?: unknown): void {
		if (event === "bitstream-complete") {
			console.log("Bit stream animation complete");
		}
	}
}
