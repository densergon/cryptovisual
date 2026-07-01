import gsap from "gsap";
import { type Application, Container, Graphics, Text } from "pixi.js";

/**
 * EnvelopeScene — PixiJS scene for Step 4: Hybrid Envelope.
 *
 * Visualises the "digital envelope" concept:
 * 1. AES key token is placed inside an envelope
 * 2. RSA public key "locks" the envelope
 * 3. Envelope is sealed (encrypted)
 *
 * Timeline (driven by VisualizationEngine.masterTimeline):
 *   0.0s — Envelope fades in, key token hovers above
 *   1.0s — Key token drops into envelope
 *   2.0s — Envelope flap closes
 *   3.0s — RSA padlock appears and locks
 *   4.0s — Seal stamp animation
 *   5.0s — Final label: "Only the private key can open this"
 */
export class EnvelopeScene {
	private app: Application;
	private stage: Container;
	private root: Container;
	private isInitialized = false;
	private timeline: gsap.core.Timeline | null = null;

	// Visual elements
	private envelopeBody: Graphics | null = null;
	private envelopeFlap: Graphics | null = null;
	private keyToken: Container | null = null;
	private padlock: Container | null = null;
	private sealStamp: Graphics | null = null;
	private labelText: Text | null = null;

	constructor(app: Application, stage: Container) {
		this.app = app;
		this.stage = stage;
		this.root = new Container();
	}

	private get centerX(): number {
		return this.app.screen.width / 2;
	}

	private get centerY(): number {
		return this.app.screen.height / 2;
	}

	async init(): Promise<void> {
		if (!this.app.renderer) {
			console.warn("EnvelopeScene: PixiJS not initialized yet");
			return;
		}
		this.createEnvelope();
		this.createKeyToken();
		this.createPadlock();
		this.createSealStamp();
		this.createLabel();

		this.stage.addChild(this.root);
		this.isInitialized = true;
	}

	private createEnvelope(): void {
		const centerX = this.centerX;
		const centerY = this.centerY;
		const width = 220;
		const height = 140;

		// Envelope body (rectangle with triangular flap)
		const body = new Graphics();
		body.rect(centerX - width / 2, centerY - height / 2, width, height);
		body.fill({ color: 0x1e1e2e, alpha: 0.9 });
		body.stroke({ color: 0xf59e0b, width: 2 });
		this.envelopeBody = body;

		// Flap (triangle that will animate closing)
		const flap = new Graphics();
		const flapHeight = 40;
		flap.moveTo(centerX - width / 2, centerY - height / 2);
		flap.lineTo(centerX, centerY - height / 2 + flapHeight);
		flap.lineTo(centerX + width / 2, centerY - height / 2);
		flap.closePath();
		flap.fill({ color: 0x1e1e2e, alpha: 0.9 });
		flap.stroke({ color: 0xf59e0b, width: 2 });
		this.envelopeFlap = flap;

		// Back of envelope (behind key token)
		const back = new Graphics();
		back.rect(centerX - width / 2, centerY - height / 2, width, height);
		back.fill({ color: 0x1e1e2e, alpha: 0.95 });
		back.stroke({ color: 0xf59e0b, width: 2 });

		this.root.addChild(back);
		this.root.addChild(this.envelopeFlap);
		this.root.addChild(this.envelopeBody);

		// Start with flap open (rotated up)
		this.envelopeFlap.pivot.set(centerX, centerY - height / 2);
		this.envelopeFlap.rotation = -Math.PI / 3;
		this.envelopeFlap.alpha = 0.6;
	}

	private createKeyToken(): void {
		const centerX = this.centerX;
		const centerY = this.centerY;

		const container = new Container();

		// Token body (small symmetric key icon)
		const graphics = new Graphics();
		graphics.circle(0, 0, 16);
		graphics.fill({ color: 0x06b6d4, alpha: 0.8 });
		graphics.stroke({ color: 0x06b6d4, width: 2 });

		const text = new Text({
			text: "AES",
			style: { fontSize: 10, fill: 0xffffff, fontWeight: "bold" },
		});
		text.anchor.set(0.5);

		container.addChild(graphics);
		container.addChild(text);

		container.x = centerX;
		container.y = centerY - 80; // Start above envelope
		container.alpha = 0;

		this.keyToken = container;
		this.root.addChild(this.keyToken);
	}

	private createPadlock(): void {
		const centerX = this.centerX;
		const centerY = this.centerY;

		const container = new Container();

		// Padlock body
		const body = new Graphics();
		body.rect(-12, -8, 24, 20);
		body.fill({ color: 0xf59e0b, alpha: 0.8 });
		body.stroke({ color: 0xf59e0b, width: 2 });

		// Padlock shackle
		const shackle = new Graphics();
		shackle.arc(0, -8, 10, Math.PI, 0);
		shackle.stroke({ color: 0xf59e0b, width: 3 });

		container.addChild(shackle);
		container.addChild(body);

		container.x = centerX + 70;
		container.y = centerY;
		container.scale.set(0);

		this.padlock = container;
		this.root.addChild(this.padlock);
	}

	private createSealStamp(): void {
		const centerX = this.centerX;
		const centerY = this.centerY;

		const stamp = new Graphics();
		stamp.circle(0, 0, 20);
		stamp.fill({ color: 0xf59e0b, alpha: 0.2 });
		stamp.stroke({ color: 0xf59e0b, width: 2 });

		stamp.x = centerX;
		stamp.y = centerY;
		stamp.scale.set(0);
		stamp.alpha = 0;

		this.sealStamp = stamp;
		this.root.addChild(this.sealStamp);
	}

	private createLabel(): void {
		const centerX = this.centerX;
		const centerY = this.centerY;

		const text = new Text({
			text: "Only the private key can open this",
			style: {
				fontSize: 14,
				fill: 0xf59e0b,
				fontWeight: "bold",
				align: "center",
			},
		});
		text.anchor.set(0.5);
		text.x = centerX;
		text.y = centerY + 100;
		text.alpha = 0;

		this.labelText = text;
		this.root.addChild(this.labelText);
	}

	play(): void {
		if (!this.isInitialized) return;
		if (this.timeline) this.timeline.kill();

		const tl = gsap.timeline();
		this.timeline = tl;

		// 0.0s — Fade in key token
		tl.to(this.keyToken, { alpha: 1, duration: 0.4, ease: "power2.out" }, 0);

		// 1.0s — Key token drops into envelope
		tl.to(
			this.keyToken,
			{
				y: this.centerY,
				duration: 0.6,
				ease: "bounce.out",
			},
			0.8,
		);

		// 2.0s — Flap closes
		tl.to(
			this.envelopeFlap,
			{
				rotation: 0,
				alpha: 1,
				duration: 0.5,
				ease: "power2.inOut",
			},
			1.6,
		);

		// 3.0s — Padlock appears
		tl.to(
			this.padlock,
			{
				scale: 1,
				duration: 0.4,
				ease: "back.out(1.7)",
			},
			2.4,
		);

		// 4.0s — Seal stamp
		tl.to(
			this.sealStamp,
			{
				scale: 1,
				alpha: 1,
				duration: 0.3,
				ease: "power2.out",
			},
			3.2,
		);
		tl.to(
			this.sealStamp,
			{
				alpha: 0.3,
				duration: 0.3,
			},
			3.5,
		);

		// 5.0s — Label fades in
		tl.to(
			this.labelText,
			{
				alpha: 1,
				duration: 0.4,
				ease: "power2.out",
			},
			4.0,
		);
	}

	pause(): void {
		this.timeline?.pause();
	}

	destroy(): void {
		this.timeline?.kill();
		this.timeline = null;
		this.root.destroy({ children: true });
	}
}
