import { type Application, Container } from "pixi.js";

export class SceneManager {
	private app: Application;
	private container: Container;

	constructor(app: Application) {
		this.app = app;
		this.container = new Container();
		this.app.stage.addChild(this.container);
	}

	async loadScene(_sceneType: string): Promise<void> {
		this.container.removeChildren();
		// Scene loading will be implemented per scene type
	}

	async play(): Promise<void> {
		// Trigger play on current scene
	}

	async pause(): Promise<void> {
		// Trigger pause on current scene
	}

	async destroy(): Promise<void> {
		this.container.removeChildren();
		this.container.destroy({ children: true });
	}
}
