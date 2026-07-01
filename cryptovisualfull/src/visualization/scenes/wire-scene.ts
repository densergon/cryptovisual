import gsap from "gsap";
import { type Application, Container, Graphics, Text } from "pixi.js";

interface NetworkPacket {
	graphics: Graphics;
	label: Text;
	position: number;
	speed: number;
	data: string;
}

interface WireSceneConfig {
	wireLength: number;
	wireColor: number;
	packetColor: number;
	textColor: number;
	fontSize: number;
	packetSpeed: number;
}

export class WireScene {
	private app: Application;
	private container: Container;
	private root: Container;
	private wireGraphics: Graphics;
	private packets: NetworkPacket[];
	private config: WireSceneConfig;
	private isInitialized = false;
	private animationFrameId: number | null = null;
	public speedMultiplier: number = 1;
	public masterTimeline: gsap.core.Timeline | null = null;
	private flashOverlay: Graphics;

	constructor(app: Application, container: Container) {
		this.app = app;
		this.container = container;
		this.root = new Container();
		this.wireGraphics = new Graphics();
		this.packets = [];
		this.flashOverlay = new Graphics();
		this.config = {
			wireLength: 600,
			wireColor: 0x4a5568,
			packetColor: 0x3b82f6,
			textColor: 0xffffff,
			fontSize: 12,
			packetSpeed: 3,
		};
	}

	async init(): Promise<void> {
		if (!this.app.renderer) {
			console.warn("WireScene: PixiJS not initialized yet");
			return;
		}
		this.createWire();
		this.createConnectionPoints();
		this.createFlashOverlay();
		this.container.addChild(this.root);
		this.isInitialized = true;
	}

	private get screenWidth(): number {
		return this.app.screen.width;
	}

	private get screenHeight(): number {
		return this.app.screen.height;
	}

	private createWire(): void {
		const wireY = this.screenHeight / 2;
		const wireStartX = (this.screenWidth - this.config.wireLength) / 2;

		this.wireGraphics.clear();
		this.wireGraphics.moveTo(wireStartX, wireY);
		this.wireGraphics.lineTo(wireStartX + this.config.wireLength, wireY);
		this.wireGraphics.stroke({
			width: 4,
			color: this.config.wireColor,
			alpha: 1,
		});

		for (let i = 0; i < this.config.wireLength; i += 20) {
			this.wireGraphics.circle(wireStartX + i, wireY, 3);
			this.wireGraphics.stroke({
				width: 2,
				color: this.config.wireColor,
				alpha: 0.3,
			});
		}

		this.root.addChild(this.wireGraphics);
	}

	private createConnectionPoints(): void {
		const wireY = this.screenHeight / 2;
		const wireStartX = (this.screenWidth - this.config.wireLength) / 2;
		const wireEndX = wireStartX + this.config.wireLength;

		const senderNode = new Graphics();
		senderNode.circle(0, 0, 20);
		senderNode.fill({ color: 0x10b981 });
		senderNode.x = wireStartX;
		senderNode.y = wireY;

		const senderLabel = new Text({
			text: "Sender",
			style: {
				fontSize: this.config.fontSize,
				fill: this.config.textColor,
			},
		});
		senderLabel.x = wireStartX - 25;
		senderLabel.y = wireY + 30;

		const receiverNode = new Graphics();
		receiverNode.circle(0, 0, 20);
		receiverNode.fill({ color: 0xef4444 });
		receiverNode.x = wireEndX;
		receiverNode.y = wireY;

		const receiverLabel = new Text({
			text: "Receiver",
			style: {
				fontSize: this.config.fontSize,
				fill: this.config.textColor,
			},
		});
		receiverLabel.x = wireEndX - 30;
		receiverLabel.y = wireY + 30;

		this.root.addChild(
			senderNode,
			senderLabel,
			receiverNode,
			receiverLabel,
		);
	}

	private createFlashOverlay(): void {
		const wireY = this.screenHeight / 2;
		const wireEndX =
			(this.screenWidth - this.config.wireLength) / 2 +
			this.config.wireLength;

		this.flashOverlay.circle(0, 0, 25);
		this.flashOverlay.fill({ color: 0xffffff, alpha: 0.8 });
		this.flashOverlay.x = wireEndX;
		this.flashOverlay.y = wireY;
		this.flashOverlay.alpha = 0;
		this.root.addChild(this.flashOverlay);
	}

	async sendPacket(
		data: string,
		packetType: "encrypted" | "key" | "metadata" = "encrypted",
	): Promise<void> {
		if (!this.isInitialized) {
			throw new Error("WireScene not initialized");
		}

		const packetColor =
			packetType === "encrypted"
				? 0x3b82f6
				: packetType === "key"
					? 0xf59e0b
					: 0x8b5cf6;

		const packet = this.createPacket(packetColor, data);
		this.packets.push(packet);

		const wireStartX = (this.screenWidth - this.config.wireLength) / 2;
		const wireEndX = wireStartX + this.config.wireLength;
		const wireY = this.screenHeight / 2;

		packet.graphics.x = wireStartX;
		packet.graphics.y = wireY;
		packet.label.alpha = 0;

		const mt = this.masterTimeline;

		await new Promise<void>((resolve) => {
			const tweenVars: gsap.TweenVars = {
				x: wireEndX,
				duration: 2,
				ease: "power2.inOut",
				onComplete: () => {
					this.flashReceiver();
					this.container.removeChild(packet.graphics);
					this.container.removeChild(packet.label);
					this.packets = this.packets.filter((p) => p !== packet);
					resolve();
				},
			};

			if (mt) {
				mt.to(packet.graphics, tweenVars);
			} else {
				gsap.to(packet.graphics, tweenVars);
			}
		});
	}

	private createPacket(color: number, data: string): NetworkPacket {
		const graphics = new Graphics();

		graphics.roundRect(-20, -10, 40, 20, 5);
		graphics.fill({ color });
		graphics.stroke({ width: 2, color, alpha: 0.5 });

		const displayData = data.length > 8 ? `${data.substring(0, 8)}...` : data;
		const label = new Text({
			text: displayData,
			style: {
				fontSize: 8,
				fill: 0xffffff,
				fontWeight: "bold",
			},
		});
		label.anchor.set(0.5);

		this.root.addChild(graphics, label);

		// Label alpha tween: fade in on departure
		const mt = this.masterTimeline;
		if (mt) {
			mt.to(label, { alpha: 1, duration: 0.3, ease: "power2.out" });
		} else {
			gsap.to(label, { alpha: 1, duration: 0.3, ease: "power2.out" });
		}

		return {
			graphics,
			label,
			position: 0,
			speed: this.config.packetSpeed,
			data,
		};
	}

	private flashReceiver(): void {
		const mt = this.masterTimeline;
		this.flashOverlay.alpha = 0.8;
		this.flashOverlay.scale.set(1);

		if (mt) {
			mt.to(this.flashOverlay, {
				alpha: 0,
				scale: 1.5,
				duration: 0.4,
				ease: "power3.out",
			});
		} else {
			gsap.to(this.flashOverlay, {
				alpha: 0,
				scale: 1.5,
				duration: 0.4,
				ease: "power3.out",
			});
		}
	}

	async animateDataTransfer(
		packets: Array<{ data: string; type: "encrypted" | "key" | "metadata" }>,
	): Promise<void> {
		for (const packet of packets) {
			await this.sendPacket(packet.data, packet.type);
			await new Promise((resolve) => setTimeout(resolve, 300));
		}
	}

	async showEncryptionFlow(): Promise<void> {
		const flowSequence = [
			{ data: "AES_KEY", type: "key" as const },
			{ data: "RSA_ENC", type: "encrypted" as const },
			{ data: "PAYLOAD", type: "encrypted" as const },
		];

		await this.animateDataTransfer(flowSequence);
	}

	async showPacketInspection(packetData: string): Promise<void> {
		if (!this.isInitialized) {
			throw new Error("WireScene not initialized");
		}

		const wireY = this.screenHeight / 2;

		const panel = new Graphics();
		panel.roundRect(0, 0, 200, 100, 8);
		panel.fill({ color: 0x1e293b, alpha: 0.95 });
		panel.x = this.screenWidth / 2 - 100;
		panel.y = wireY - 80;

		const titleLabel = new Text({
			text: "Packet Structure",
			style: {
				fontSize: 14,
				fill: 0xffffff,
				fontWeight: "bold",
			},
		});
		titleLabel.x = panel.x + 100;
		titleLabel.y = panel.y + 15;
		titleLabel.anchor.set(0.5, 0);

		const contentLabel = new Text({
			text: packetData,
			style: {
				fontSize: 11,
				fill: 0x94a3b8,
				fontFamily: "monospace",
			},
		});
		contentLabel.x = panel.x + 100;
		contentLabel.y = panel.y + 45;
		contentLabel.anchor.set(0.5, 0);

		this.root.addChild(panel, titleLabel, contentLabel);

		const mt = this.masterTimeline;
		if (mt) {
			mt.to(panel, {
				alpha: 0,
				duration: 0.3,
				delay: 2.7,
				onComplete: () => {
					this.root.removeChild(panel);
					this.root.removeChild(titleLabel);
					this.root.removeChild(contentLabel);
				},
			});
		} else {
			gsap.to(panel, {
				alpha: 0,
				duration: 0.3,
				delay: 2.7,
				onComplete: () => {
					this.root.removeChild(panel);
					this.root.removeChild(titleLabel);
					this.root.removeChild(contentLabel);
				},
			});
		}
	}

	destroy(): void {
		if (this.animationFrameId) {
			cancelAnimationFrame(this.animationFrameId);
		}

		gsap.killTweensOf(this.root);
		gsap.killTweensOf(this.flashOverlay);
		this.packets = [];

		this.root.removeChildren();
		if (this.root.parent) {
			this.root.parent.removeChild(this.root);
		}

		this.isInitialized = false;
	}
}
