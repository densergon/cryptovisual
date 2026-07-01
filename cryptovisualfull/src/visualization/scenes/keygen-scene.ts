import gsap from "gsap";
import { type Application, Container, Graphics, Text } from "pixi.js";

interface KeyData {
	publicKey: string;
	privateKey: string;
	keySize: number;
}

export class KeygenVisualizer {
	private app: Application;
	private stage: Container;
	private root: Container;
	private publicSphere: Graphics;
	private privateSphere: Graphics;
	private publicLabel: Text;
	private privateLabel: Text;
	private centerPoint: { x: number; y: number };
	private isInitialized = false;
	private isPaused = false;
	private timeline: gsap.core.Timeline | null = null;
	public masterTimeline: gsap.core.Timeline | null = null;

	constructor(app: Application, stage: Container) {
		this.app = app;
		this.stage = stage;
		this.root = new Container();
		this.centerPoint = { x: 0, y: 0 };
		this.publicSphere = new Graphics();
		this.privateSphere = new Graphics();
		this.publicLabel = new Text({
			text: "Public Key",
			style: { fontSize: 14, fill: 0x9333ea, fontWeight: "bold" },
		});
		this.privateLabel = new Text({
			text: "Private Key",
			style: { fontSize: 14, fill: 0xdb2777, fontWeight: "bold" },
		});
	}

	async init(): Promise<void> {
		if (!this.app.renderer) {
			console.warn("KeygenVisualizer: PixiJS not initialized yet");
			return;
		}
		this.centerPoint = {
			x: this.app.screen.width / 2,
			y: this.app.screen.height / 2,
		};
		this.publicSphere = this.createSphere(0x9333ea);
		this.privateSphere = this.createSphere(0xdb2777);

		this.publicSphere.x = this.centerPoint.x;
		this.publicSphere.y = this.centerPoint.y;
		this.privateSphere.x = this.centerPoint.x;
		this.privateSphere.y = this.centerPoint.y;

		this.publicLabel.anchor.set(0.5);
		this.publicLabel.x = this.centerPoint.x;
		this.publicLabel.y = this.centerPoint.y + 55;
		this.privateLabel.anchor.set(0.5);
		this.privateLabel.x = this.centerPoint.x;
		this.privateLabel.y = this.centerPoint.y + 55;

		this.root.addChild(
			this.publicSphere,
			this.privateSphere,
			this.publicLabel,
			this.privateLabel,
		);
		this.stage.addChild(this.root);

		this.isInitialized = true;
	}

	private createSphere(color: number): Graphics {
		const graphics = new Graphics();
		graphics.circle(0, 0, 40);
		graphics.fill({ color, alpha: 0.8 });
		graphics.stroke({ color, width: 3 });
		return graphics;
	}

	play(): void {
		if (!this.isInitialized) return;

		if (this.timeline) {
			this.timeline.kill();
		}

		const separation = 150;
		const duration = 2;

		this.timeline = gsap.timeline();

		this.timeline.to(
			this.publicSphere,
			{
				x: this.centerPoint.x - separation,
				duration,
				ease: "back.out(1.7)",
			},
			0,
		);

		this.timeline.to(
			this.privateSphere,
			{
				x: this.centerPoint.x + separation,
				duration,
				ease: "back.out(1.7)",
			},
			0,
		);

		this.timeline.to(
			this.publicLabel,
			{
				x: this.centerPoint.x - separation,
				duration,
				ease: "back.out(1.7)",
			},
			0,
		);

		this.timeline.to(
			this.privateLabel,
			{
				x: this.centerPoint.x + separation,
				duration,
				ease: "back.out(1.7)",
			},
			0,
		);

		this.timeline.to(
			this.publicSphere.scale,
			{
				x: 1.2,
				y: 1.2,
				duration: duration / 2,
				yoyo: true,
				repeat: 1,
				ease: "power1.inOut",
			},
			0,
		);

		this.timeline.to(
			this.privateSphere.scale,
			{
				x: 1.2,
				y: 1.2,
				duration: duration / 2,
				yoyo: true,
				repeat: 1,
				ease: "power1.inOut",
			},
			0,
		);

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
		gsap.killTweensOf(this.publicSphere);
		gsap.killTweensOf(this.privateSphere);
		gsap.killTweensOf(this.publicSphere.scale);
		gsap.killTweensOf(this.privateSphere.scale);
		this.root.removeChildren();
		if (this.root.parent) {
			this.root.parent.removeChild(this.root);
		}
		this.isPaused = false;
	}

	onEvent(event: string, payload?: unknown): void {
		if (event === "keygen-complete" && payload) {
			const data = payload as KeyData;
			console.log("Key generation complete:", data);
		}
	}
}
