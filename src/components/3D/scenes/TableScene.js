import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";

export default class TableScene {
	constructor({ renderer, scene, camera, tableSize, legLength, currentSupports, loadingManager }) {
		this.renderer = renderer;
		this.scene = scene;
		this.camera = camera;
		this.tableSize = tableSize;
		this.legLength = legLength;
		this.currentSupports = currentSupports;
		this.loadingManager = loadingManager || new THREE.LoadingManager(); // Если нет менеджера, создаем новый
		this.width = window.innerWidth;
		this.height = window.innerHeight;

		this.time = 0;
		this.mouse = new THREE.Vector2();

		this.loader = new GLTFLoader(this.loadingManager);
		this.materialCache = {};
		this.supportsCache = {};
		this.tableHeight = 0.015;

		this.prepareScene();
		this.createTable();
		this.createLegs();
		this.createLight();

		window.addEventListener("resize", this.onWindowResize.bind(this));
	}

	prepareScene() {
		this.center = new THREE.Vector3(0, 0.25, 0); // Центр сцены
		this.controls = new OrbitControls(this.camera, this.renderer.domElement);

		// Включение демпфирования для плавности
		this.controls.enableDamping = true;
		this.controls.dampingFactor = 0.05;

		// Ограничение вращения камеры
		this.controls.maxPolarAngle = Math.PI / 2.2; // Максимальный угол для предотвращения обзора снизу
		this.controls.minPolarAngle = Math.PI / 4; // Минимальный угол для предотвращения взгляда сверху

		// Ограничение панорамирования камеры
		const panBounds = {
			min: new THREE.Vector3(-1, 0, -1), // Минимальные координаты панорамирования
			max: new THREE.Vector3(1, 0, 1), // Максимальные координаты панорамирования
		};

		this.controls.addEventListener("change", () => {
			const { x, y, z } = this.controls.target;

			// Принудительное ограничение таргета камеры
			this.controls.target.set(
				Math.max(panBounds.min.x, Math.min(panBounds.max.x, x)),
				Math.max(panBounds.min.y, Math.min(panBounds.max.y, y)),
				Math.max(panBounds.min.z, Math.min(panBounds.max.z, z))
			);
		});

		// Ограничение расстояния камеры до сцены
		this.controls.minDistance = 0.5; // Минимальное расстояние от центра
		this.controls.maxDistance = 3; // Максимальное расстояние от центра

		// Установка начальной позиции сцены
		this.scene.position.y = -0.1;
		if (window.innerWidth <= 768) {
			this.scene.position.y = -0.25;
			this.controls.maxDistance = 5; // Максимальное расстояние от центра
			this.camera.position.set(1.5, 1.5, 3.0);
			this.camera.lookAt(this.center);
		} else {
			this.scene.position.y = -0.1;
			this.controls.maxDistance = 3; // Максимальное расстояние от центра
			this.camera.position.set(1.25, 1, 1.35);
			this.camera.lookAt(this.center);
		}

		this.controls.update(); // Применение изменений
	}

	createLight() {
		// Добавим свет для реалистичного отображения
		const lightLeftBack = new THREE.DirectionalLight("#ffffff", 0.5);
		lightLeftBack.position.set(-5, 5, 7.5);
		const lightLeftFront = new THREE.DirectionalLight("#ffffff", 0.5);
		lightLeftFront.position.set(-5, 5, -7.5);
		const lightRightBack = new THREE.DirectionalLight("#ffffff", 0.5);
		lightRightBack.position.set(5, 5, 7.5);
		const lightRightFront = new THREE.DirectionalLight("#ffffff", 0.5);
		lightRightFront.position.set(5, 5, -7.5);
		const lightBottom = new THREE.DirectionalLight("#ffffff", 0.5);
		lightBottom.position.set(5, -5, -7.5);
		this.scene.add(lightLeftBack, lightLeftFront, lightRightBack, lightRightFront, lightBottom);
	}

	createTable() {
		// Создание столешницы
		const tableGeometry = new THREE.BoxGeometry(this.tableSize.width / 1000, this.tableHeight, this.tableSize.depth / 1000);
		// Настраиваем UV-координаты
		// this.adjustUVsForFixedScaling(tableGeometry, 0.01);

		const tableMaterial = new THREE.MeshStandardMaterial({ color: "#c7b299" }); // Начальный материал
		this.tableTop = new THREE.Mesh(tableGeometry, tableMaterial);
		this.tableTop.position.set(0, 0.5, 0); // Поднимаем столешницу над землёй
		this.scene.add(this.tableTop);
	}

	createLegs() {
		this.loader.load(
			"/models/legCustom.glb", // Путь к модели ножек
			(gltf) => {
				this.legs = []; // Храним ножки как массив объектов
				const legModel = gltf.scene;

				// Позиционирование и масштабирование ножек
				const positions = [
					{ x: this.tableSize.width / 2000 - 0.02, y: 0.0075, z: 0, rotation: Math.PI / 2 }, // Левая ножка
					{ x: -this.tableSize.width / 2000 + 0.02, y: 0.0075, z: 0, rotation: -Math.PI / 2 }, // Правая ножка
				];

				positions.forEach((position) => {
					const leg = legModel.clone();
					leg.position.set(position.x, position.y, position.z); // Устанавливаем позицию ножки
					leg.rotation.y = position.rotation; // Поворачиваем ножку
					this.scene.add(leg);
					this.legs.push(leg); // Сохраняем ножку в массив
				});

				// После создания ножек обновляем их размеры и позиции
				this.updateTableSize(this.tableSize.width, this.tableSize.depth, this.legLength); // Передаем начальную высоту ножек (500 мм)
			},
			undefined,
			(error) => {
				console.error("Error loading legs model:", error);
			}
		);
	}

	createSupports(supportsPath, width, depth, legLength) {
		if (this.supports) {
			this.supports.forEach((support) => {
				this.scene.remove(support); // Удаляем поддержку из сцены
				support.traverse((child) => {
					if (child.isMesh) {
						child.geometry.dispose(); // Освобождаем память геометрии
						child.material.dispose(); // Освобождаем память материала
					}
				});
			});
			this.supports = []; // Сбрасываем массив опор
		}

		this.loader.load(
			supportsPath, // Путь к модели ножек
			(gltf) => {
				this.supports = []; // Храним ножки как массив объектов
				const supportModel = gltf.scene;

				// Позиционирование и масштабирование ножек
				const positions = [
					{
						x: width / 2000 - 0.02,
						y: -0.005,
						z: depth / 2000 - 0.055,
					}, // Левая ножка
					{
						x: -width / 2000 + 0.02,
						y: -0.005,
						z: depth / 2000 - 0.055,
					}, // Правая ножка
					{
						x: width / 2000 - 0.02,
						y: -0.005,
						z: depth / 2000 + 0.055,
					}, // Левая ножка
					{
						x: -width / 2000 + 0.02,
						y: -0.005,
						z: depth / 2000 + 0.055,
					}, // Правая ножка
				];

				positions.forEach((position) => {
					const support = supportModel.clone();
					support.position.set(position.x, position.y, position.z); // Устанавливаем позицию ножки
					this.scene.add(support);
					this.supports.push(support); // Сохраняем ножку в массив
				});
				this.updateTableSize(width, depth, legLength); // Передаем начальную высоту ножек (500 мм)
			},
			undefined,
			(error) => {
				console.error("Error loading supports model:", error);
			}
		);
	}

	loadMaterial(materialPath) {
		// Удаление старого материала, если он существует
		if (this.tableTop.material) {
			this.tableTop.material.dispose();
		}

		if (this.materialCache[materialPath]) {
			this.tableTop.material = this.materialCache[materialPath];
			this.tableTop.material.needsUpdate = true;
			return;
		}

		this.loader.load(
			materialPath,
			(gltf) => {
				const material = gltf.scene.children[0].material;
				this.materialCache[materialPath] = material; // Кэшируем материал
				const textureRepeatConfig = {
					x: (this.tableSize.width / 1000) * 1.5,
					y: (this.tableSize.depth / 1000) * 1.5,
				};

				this.tableTop.material = material;

				const mapTexture = this.tableTop.material.map;
				if (mapTexture) {
					// Повторение текстуры
					mapTexture.repeat.set(textureRepeatConfig.x, textureRepeatConfig.y);
					// Сдвиг текстуры к центру
					mapTexture.offset.set(-this.tableSize.width / 2000, -this.tableSize.depth / 2000);
				}

				const metalnessMapTexture = this.tableTop.material.metalnessMap;
				if (metalnessMapTexture) {
					metalnessMapTexture.repeat.set(textureRepeatConfig.x, textureRepeatConfig.y);
					metalnessMapTexture.offset.set(-this.tableSize.width / 2000, -this.tableSize.depth / 2000);
				}

				const roughnessMapTexture = this.tableTop.material.roughnessMap;
				if (roughnessMapTexture) {
					mapTexture.repeat.set(textureRepeatConfig.x, textureRepeatConfig.y);
					mapTexture.offset.set(-this.tableSize.width / 2000, -this.tableSize.depth / 2000);
				}

				const normalMapTexture = this.tableTop.material.normalMap;
				if (normalMapTexture) {
					normalMapTexture.repeat.set(textureRepeatConfig.x, textureRepeatConfig.y);
					normalMapTexture.offset.set(-this.tableSize.width / 2000, -this.tableSize.depth / 2000);
				}
				this.tableTop.material.needsUpdate = true;
			},
			undefined,
			(error) => {
				console.error("Error loading material:", error);
			}
		);
	}

	adjustUVsForFixedScaling(geometry, scaleFactor) {
		const uvAttribute = geometry.attributes.uv;
		const positionAttribute = geometry.attributes.position;

		for (let i = 0; i < uvAttribute.count; i += 4) {
			// Читаем координаты вершин
			const p1 = new THREE.Vector3(positionAttribute.getX(i), positionAttribute.getY(i), positionAttribute.getZ(i));
			const p2 = new THREE.Vector3(positionAttribute.getX(i + 1), positionAttribute.getY(i + 1), positionAttribute.getZ(i + 1));
			const p3 = new THREE.Vector3(positionAttribute.getX(i + 2), positionAttribute.getY(i + 2), positionAttribute.getZ(i + 2));
			const p4 = new THREE.Vector3(positionAttribute.getX(i + 3), positionAttribute.getY(i + 3), positionAttribute.getZ(i + 3));

			// Определяем переднюю/заднюю грань (XY плоскость)
			const isXYPlane = Math.abs(p1.z - p2.z) < 1e-6 && Math.abs(p1.z - p3.z) < 1e-6 && Math.abs(p1.z - p4.z) < 1e-6;

			// Определяем левую/правую грань (YZ плоскость)
			const isYZPlane = Math.abs(p1.x - p2.x) < 1e-6 && Math.abs(p1.x - p3.x) < 1e-6 && Math.abs(p1.x - p4.x) < 1e-6;

			if (isXYPlane || isYZPlane) {
				// Масштабируем UV-координаты одинаково для всех боковых граней
				const uniformScale = scaleFactor;
				uvAttribute.setXY(i, uvAttribute.getX(i) * uniformScale, uvAttribute.getY(i) * uniformScale);
				uvAttribute.setXY(i + 1, uvAttribute.getX(i + 1) * uniformScale, uvAttribute.getY(i + 1) * uniformScale);
				uvAttribute.setXY(i + 2, uvAttribute.getX(i + 2) * uniformScale, uvAttribute.getY(i + 2) * uniformScale);
				uvAttribute.setXY(i + 3, uvAttribute.getX(i + 3) * uniformScale, uvAttribute.getY(i + 3) * uniformScale);
			}
		}

		uvAttribute.needsUpdate = true;
	}

	updateTableSize(width, depth, legLength) {
		// Обновление геометрии
		this.tableTop.geometry.dispose();
		this.tableTop.geometry = new THREE.BoxGeometry(width / 1000, this.tableHeight, depth / 1000);

		// Обновление текстур
		const textureRepeatConfig = {
			x: (width / 1000) * 1.5,
			y: (depth / 1000) * 1.5,
		};
		const textureOffsetConfig = {
			x: -width / 2000,
			y: -depth / 2000,
		};
		const mapTexture = this.tableTop.material.map;
		if (mapTexture) {
			mapTexture.repeat.set(textureRepeatConfig.x, textureRepeatConfig.y);
			mapTexture.offset.set(textureOffsetConfig.x, textureOffsetConfig.y);
		}
		const metalnessMapTexture = this.tableTop.material.metalnessMap;
		if (metalnessMapTexture) {
			metalnessMapTexture.repeat.set(textureRepeatConfig.x, textureRepeatConfig.y);
			metalnessMapTexture.offset.set(textureOffsetConfig.x, textureOffsetConfig.y);
		}
		const normalMapTexture = this.tableTop.material.normalMap;
		if (normalMapTexture) {
			normalMapTexture.repeat.set(textureRepeatConfig.x, textureRepeatConfig.y);
			normalMapTexture.offset.set(textureOffsetConfig.x, textureOffsetConfig.y);
		}
		const roughnessMapTexture = this.tableTop.material.roughnessMap;
		if (roughnessMapTexture) {
			roughnessMapTexture.repeat.set(textureRepeatConfig.x, textureRepeatConfig.y);
			roughnessMapTexture.offset.set(textureOffsetConfig.x, textureOffsetConfig.y);
		}
		this.tableTop.material.needsUpdate = true;

		// Обновление позиции и масштаба ножек
		if (this.legs) {
			const positions = [
				{ x: width / 2000 - 0.02, y: 0.0075, z: 0, rotation: Math.PI / 2 }, // Левая ножка
				{ x: -width / 2000 + 0.02, y: 0.0075, z: 0, rotation: -Math.PI / 2 }, // Правая ножка
			];

			this.legs.forEach((leg, index) => {
				const position = positions[index];
				leg.position.set(position.x, position.y, position.z); // Обновляем позицию ножки
				leg.rotation.y = position.rotation; // Обновляем поворот ножки

				// Растягиваем нижнюю и верхние части ножки
				leg.traverse((child) => {
					if (child.isMesh) {
						if (child.name === "top" || child.name === "bottom") {
							const scaleX = depth / 300; // Масштабируем пропорционально глубине стола
							child.scale.set(scaleX, 1, 1); // Применяем масштаб
						}
					}
				});

				leg.traverse((child) => {
					if (child.isMesh) {
						const leftMesh = leg.getObjectByName("left");
						if (child.name === "bottom" || child.name === "leftBottom" || child.name === "rightBottom") {
							if (leftMesh) {
								leftMesh.geometry.computeBoundingBox();
								const boundingBox = leftMesh.geometry.boundingBox;

								// Вычисляем высоту `bottom`
								const legHeight = boundingBox.max.y - boundingBox.min.y;

								// Рассчитываем коэффициент смещения
								const scaleY = legLength / 500; // Пропорциональное масштабирование высоты
								const offsetY = legHeight * scaleY - legHeight; // Программный расчет смещения
								child.position.y = -offsetY; // Применяем смещение
							}
						}
					}
				});

				// Перемещаем left и right в зависимости от масштаба top и bottom
				leg.traverse((child) => {
					const topMesh = leg.getObjectByName("top");
					const bottomMesh = leg.getObjectByName("bottom");
					if (child.isMesh) {
						if (topMesh && bottomMesh) {
							topMesh.geometry.computeBoundingBox();
							const boundingBox = topMesh.geometry.boundingBox;
							// Вычисляем ширину `topMesh`
							const legWidth = boundingBox.max.x - boundingBox.min.x;

							const scaleX = depth / 300;
							const scaleY = legLength / 500;
							const offsetX = (legWidth / 2) * scaleX - legWidth / 2; // Вычисляем смещение от центра

							if (child.name === "left" || child.name === "right") {
								if (child.name === "left") {
									child.scale.set(1, scaleY, 1);
									child.position.x = topMesh.position.x - offsetX;
								} else if (child.name === "right") {
									child.scale.set(1, scaleY, 1);
									child.position.x = bottomMesh.position.x + offsetX;
								}
							}
							if (child.name === "rightTop" || child.name === "rightBottom") {
								if (child.name === "rightTop") {
									child.position.x = topMesh.position.x + offsetX;
								} else if (child.name === "rightBottom") {
									child.position.x = bottomMesh.position.x + offsetX;
								}
							}
							if (child.name === "leftTop" || child.name === "leftBottom") {
								if (child.name === "leftTop") {
									child.position.x = topMesh.position.x - offsetX;
								} else if (child.name === "leftBottom") {
									child.position.x = bottomMesh.position.x - offsetX;
								}
							}
							if (child.name === "leftTop" || child.name === "leftBottom") {
								if (child.name === "leftTop") {
									child.position.x = topMesh.position.x - offsetX;
								} else if (child.name === "leftBottom") {
									child.position.x = bottomMesh.position.x - offsetX;
								}
							}
							if (child.name === "circlesLeft" || child.name === "circlesRight") {
								if (child.name === "circlesLeft") {
									child.position.x = topMesh.position.x - offsetX;
								} else if (child.name === "circlesRight") {
									child.position.x = bottomMesh.position.x + offsetX;
								}
							}
						}
					}
				});
			});
		}

		if (this.supports) {
			const positions = [
				{
					x: width / 2000 - 0.02,
					y: -0.005,
					z: depth / 2000 - 0.055,
				}, // Левая ножка
				{
					x: -width / 2000 + 0.02,
					y: -0.005,
					z: depth / 2000 - 0.055,
				}, // Правая ножка
				{
					x: width / 2000 - 0.02,
					y: -0.005,
					z: -depth / 2000 + 0.055,
				}, // Левая ножка
				{
					x: -width / 2000 + 0.02,
					y: -0.005,
					z: -depth / 2000 + 0.055,
				}, // Правая ножка
			];

			this.supports.forEach((support, index) => {
				const position = positions[index];
				support.position.set(position.x, position.y, position.z); // Обновляем позицию ножки

				if (this.legs) {
					this.legs.forEach((leg, legIndex) => {
						leg.traverse((legChild) => {
							if (legChild.isMesh) {
								if (legChild.name === "left") {
									legChild.geometry.computeBoundingBox();
									const leftBoundingBox = legChild.geometry.boundingBox;
									const legHeight = leftBoundingBox.max.y - leftBoundingBox.min.y;
									const scaleY = legLength / 500; // Пропорциональное масштабирование высоты
									const offsetY = legHeight * scaleY - legHeight; // Программный расчет смещения
									support.position.y = -offsetY + position.y; // Применяем смещение
								}
								if (legChild.name === "top") {
									legChild.geometry.computeBoundingBox();
									const topBoundingBox = legChild.geometry.boundingBox;
									const legWidth = topBoundingBox.max.x - topBoundingBox.min.x;
									const scaleZ = depth / 300;
									if (index === 0 || index === 1) {
										support.position.z = (legWidth / 2) * scaleZ; // Применяем смещение
									} else {
										support.position.z = (legWidth / 2) * -scaleZ;
									}
								}
							}
						});
					});
				}
			});
		}

		// Обновление ограничений камеры.
		// const panBoundary = Math.max(width / 2000, depth / 2000); // Расчет границы на основе размера стола
		// this.controls.minPan.set(-panBoundary, 0, -panBoundary);
		// this.controls.maxPan.set(panBoundary, 0, panBoundary);
	}

	onWindowResize() {
		if (window.innerWidth <= 768) {
			this.scene.position.y = -0.25;
			this.controls.maxDistance = 5; // Максимальное расстояние от центра
			this.camera.position.set(1.25, 1, 1.35);
			this.camera.lookAt(this.center);
		} else {
			this.scene.position.y = -0.1;
			this.controls.maxDistance = 3; // Максимальное расстояние от центра
			this.camera.position.set(0.5, 1, 1); // Начальная позиция камеры
			this.camera.lookAt(this.center);
		}
		this.width = window.innerWidth;
		this.height = window.innerHeight;
	}

	animate(deltaTime) {
		this.camera.lookAt(this.center);
		this.time++;
		this.controls.update();
	}
}
