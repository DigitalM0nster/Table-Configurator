import * as THREE from "three";

export interface TableSceneParams {
	renderer: THREE.WebGLRenderer;
	scene: THREE.Scene;
	camera: THREE.PerspectiveCamera;
	tableSize: { width: number; depth: number };
	legLength: number;
	currentSupports: string;
	loadingManager?: THREE.LoadingManager;
}

export default class TableScene {
	constructor(params: TableSceneParams);

	renderer: THREE.WebGLRenderer;
	scene: THREE.Scene;
	camera: THREE.PerspectiveCamera;
	tableSize: { width: number; depth: number };
	legLength: number;
	currentSupports: string;
	loadingManager: THREE.LoadingManager;

	prepareScene(): void;
	createTable(): void;
	createLegs(): void;
	createSupports(supportsPath: string, width: number, depth: number, legLength: number): void;
	loadMaterial(materialPath: string): void;
	adjustUVsForFixedScaling(geometry: THREE.BufferGeometry, scaleFactor: number): void;
	updateTableSize(width: number, depth: number, legLength: number): void;
	onWindowResize(): void;
	animate(deltaTime: number): void;
}
