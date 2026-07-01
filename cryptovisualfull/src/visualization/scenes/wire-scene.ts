import gsap from "gsap";
import { type Application, type Container, Graphics, Text } from "pixi.js";

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
	private wireGraphics: Graphics;
	private packets: NetworkPacket[];
	private config: WireSceneConfig;
	private isInitialized = false;
	private animationFrameId: number | null = null;
	public speedMultiplier: number = 1;

	constructor(app: Application, container: Container) {
		this.app = app;
		this.container = container;
		this.wireGraphics = new Graphics();
		this.packets = [];
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
		this.createWire();
		this.createConnectionPoints();
		this.isInitialized = true;
	}

	private createWire(): void {
		const wireY = this.app.screen.height / 2;
		const wireStartX = (this.app.screen.width - this.config.wireLength) / 2;

		// Draw wire base line
		this.wireGraphics.clear();
		this.wireGraphics.moveTo(wireStartX, wireY);
		this.wireGraphics.lineTo(wireStartX + this.config.wireLength, wireY);
		this.wireGraphics.stroke({
			width: 4,
			color: this.config.wireColor,
			alpha: 1,
		});

		// Add pulse effect to wire
		for (let i = 0; i < this.config.wireLength; i += 20) {
			this.wireGraphics.circle(wireStartX + i, wireY, 3);
			this.wireGraphics.stroke({
				width: 2,
				color: this.config.wireColor,
				alpha: 0.3,
			});
		}

		this.container.addChild(this.wireGraphics);
	}

	private createConnectionPoints(): void {
		const wireY = this.app.screen.height / 2;
		const wireStartX = (this.app.screen.width - this.config.wireLength) / 2;
		const wireEndX = wireStartX + this.config.wireLength;

		// Sender node (left)
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

		// Receiver node (right)
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

		this.container.addChild(
			senderNode,
			senderLabel,
			receiverNode,
			receiverLabel,
		);
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

		// Animate packet across wire
		const wireStartX = (this.app.screen.width - this.config.wireLength) / 2;
		const wireEndX = wireStartX + this.config.wireLength;
		const wireY = this.app.screen.height / 2;

		packet.graphics.x = wireStartX;
		packet.graphics.y = wireY;

		// GSAP animation
		await new Promise<void>((resolve) => {
			gsap.to(packet.graphics, {
				x: wireEndX,
				duration: 2 / this.speedMultiplier,
				ease: "power1.inOut",
				onComplete: () => {
					// Flash receiver on arrival
					this.flashReceiver();
					// Remove packet
					this.container.removeChild(packet.graphics);
					this.container.removeChild(packet.label);
					this.packets = this.packets.filter((p) => p !== packet);
					resolve();
				},
			});
		});
	}

	private createPacket(color: number, data: string): NetworkPacket {
		const graphics = new Graphics();

		// Packet body (rounded rectangle)
		graphics.roundRect(-20, -10, 40, 20, 5);
		graphics.fill({ color });
		graphics.stroke({ width: 2, color, alpha: 0.5 });

		// Create label with truncated data
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

		this.container.addChild(graphics, label);

		return {
			graphics,
			label,
			position: 0,
			speed: this.config.packetSpeed,
			data,
		};
	}

	private flashReceiver(): void {
		const wireY = this.app.screen.height / 2;
		const wireEndX =
			(this.app.screen.width - this.config.wireLength) / 2 +
			this.config.wireLength;

		const flash = new Graphics();
		flash.circle(0, 0, 25);
		flash.fill({ color: 0xffffff, alpha: 0.8 });
		flash.x = wireEndX;
		flash.y = wireY;

		this.container.addChild(flash);

		gsap.to(flash, {
			alpha: 0,
			scale: 1.5,
			duration: 0.3,
			onComplete: () => {
				this.container.removeChild(flash);
			},
		});
	}

	async animateDataTransfer(
		packets: Array<{ data: string; type: "encrypted" | "key" | "metadata" }>,
	): Promise<void> {
		for (const packet of packets) {
			await this.sendPacket(packet.data, packet.type);
			// Small delay between packets
			await new Promise((resolve) => setTimeout(resolve, 300));
		}
	}

	async showEncryptionFlow(): Promise<void> {
		// Simulate hybrid encryption flow
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

		const wireY = this.app.screen.height / 2;

		// Create inspection panel
		const panel = new Graphics();
		panel.roundRect(0, 0, 200, 100, 8);
		panel.fill({ color: 0x1e293b, alpha: 0.95 });
		panel.x = this.app.screen.width / 2 - 100;
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

		this.container.addChild(panel, titleLabel, contentLabel);

		// Show for 3 seconds then remove
		await new Promise<void>((resolve) => {
			gsap.to(panel, {
				alpha: 0,
				duration: 0.3,
				delay: 2.7,
				onComplete: () => {
					this.container.removeChild(panel);
					this.container.removeChild(titleLabel);
					this.container.removeChild(contentLabel);
					resolve();
				},
			});
		});
	}

	cleanup(): void {
		if (this.animationFrameId) {
			cancelAnimationFrame(this.animationFrameId);
		}

		gsap.killTweensOf(this.container);

		this.packets.forEach((packet) => {
			if (this.container.children.includes(packet.graphics)) {
				this.container.removeChild(packet.graphics);
			}
			if (this.container.children.includes(packet.label)) {
				this.container.removeChild(packet.label);
			}
		});
		this.packets = [];

		if (this.container.children.includes(this.wireGraphics)) {
			this.container.removeChild(this.wireGraphics);
		}

		this.isInitialized = false;
	}
}
