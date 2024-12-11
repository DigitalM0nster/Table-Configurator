import { useEffect, useRef, useState } from "react";

import * as THREE from "three";
import TableScene from "./scenes/TableScene.js";
import SizeConfigurator from "../HTML/configs/SizeConfigurator.js";
import MaterialSelector from "../HTML/configs/MaterialSelector.js";
import LegConfigurator from "../HTML/configs/LegConfigurator.js";
import styles from "./styles.module.scss";
import Preloader from "../HTML/preloader/Preloader.js";
import trackPageLoad from "../HTML/preloader/TrackPageLoad.js"; // Трекер загрузки
import SupportsSelector from "../HTML/configs/SupportsSelector.js";

export default function MainScene() {
	const containerRef = useRef<HTMLDivElement>(null);
	const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
	const tableSceneRef = useRef<TableScene | null>(null);
	const fpsRef = useRef<number | 0>(0);
	const frameCountRef = useRef<number | 0>(0);
	const lastFrameTimeRef = useRef<number | 0>(performance.now());
	const width = useRef<number | 0>(window.innerWidth);
	const height = useRef<number | 0>(window.innerHeight);

	// Table configs
	const [tableSize, setTableSize] = useState({ width: 1200, depth: 600 });
	const [legLength, setLegLength] = useState<number>(500);
	const [currentMaterial, setCurrentMaterial] = useState<string>("/materials/top_ashwood_mat.glb"); // Путь к начальному материалу
	const [currentSupports, setCurrentSupports] = useState<string>("/models/prop_01.glb"); // Путь к начальному материалу

	// Preloader
	const [progress, setProgress] = useState(0);
	const [_loadingComplete, setLoadingComplete] = useState(false);
	const currentProgress = useRef(0); // Текущее отображаемое значение
	const targetProgress = useRef(0); // Целевой прогресс
	const lastUpdateTime = useRef(performance.now()); // Время последнего обновления

	useEffect(() => {
		if (!containerRef.current) return;

		let isPageLoaded = false;
		let isThreeJsLoaded = false;

		// Анимация прогресса
		const animateProgress = () => {
			const now = performance.now();
			const deltaTime = now - lastUpdateTime.current;
			lastUpdateTime.current = now;

			// Плавное приближение currentProgress к targetProgress
			if (currentProgress.current < targetProgress.current) {
				const step = (targetProgress.current - currentProgress.current) / (500 / deltaTime); // 0.5 секунды
				currentProgress.current = Math.min(currentProgress.current + step, targetProgress.current);
				setProgress(Math.floor(currentProgress.current));
			}

			// Проверяем, нужно ли завершить прогресс
			if (currentProgress.current >= 99.9 && targetProgress.current === 100) {
				currentProgress.current = 100;
				setProgress(100);
				return; // Прекращаем анимацию
			}

			// Если загрузка не завершена, продолжаем анимацию
			if (currentProgress.current < 100) {
				requestAnimationFrame(animateProgress);
			}
		};

		// Обновление целевого прогресса
		const updateProgress = (value: number) => {
			targetProgress.current = Math.max(targetProgress.current, value);
			if (currentProgress.current < 100) {
				animateProgress();
			}
		};

		// Загрузка страницы
		trackPageLoad(updateProgress).then(() => {
			isPageLoaded = true;
			if (isThreeJsLoaded) finalizeLoading();
		});

		const finalizeLoading = () => {
			targetProgress.current = 100;
			animateProgress();
			setTimeout(() => setLoadingComplete(true), 500);
		};

		// Инициализация LoadingManager
		const manager = new THREE.LoadingManager();
		manager.onProgress = (_url, itemsLoaded, itemsTotal) => {
			const percentage = Math.round((itemsLoaded / itemsTotal) * 50); // 50% для моделей
			updateProgress(percentage);
		};
		manager.onLoad = () => {
			isThreeJsLoaded = true;
			if (isPageLoaded) finalizeLoading();
		};

		// Инициализация рендерера
		const renderer = new THREE.WebGLRenderer({
			antialias: true,
		});
		if (window.innerWidth <= 768) {
			renderer.setPixelRatio(window.devicePixelRatio);
		} else {
			renderer.setPixelRatio(1);
		}
		renderer.setSize(width.current, height.current);
		renderer.toneMapping = THREE.ACESFilmicToneMapping;
		renderer.toneMappingExposure = 2;
		renderer.shadowMap.enabled = false;

		// Удаление старого канваса если он существует
		const existingCanvas = containerRef.current.querySelector("canvas");
		if (existingCanvas) {
			existingCanvas.remove();
		}

		containerRef.current.appendChild(renderer.domElement);
		rendererRef.current = renderer;

		// Создаём главную сцену
		const mainScene = new THREE.Scene();
		createGradientBackground(mainScene);
		function createGradientBackground(scene: THREE.Scene): void {
			// Если ранее был фон, удаляем его
			if (scene.background && (scene.background as THREE.Texture).dispose) {
				(scene.background as THREE.Texture).dispose();
			}

			// Создаем canvas для градиента
			const canvas = document.createElement("canvas");
			canvas.width = window.innerWidth;
			canvas.height = window.innerHeight;
			const context = canvas.getContext("2d");

			if (context) {
				// Создаем градиент
				const gradient = context.createLinearGradient(0, 0, 0, canvas.height);
				gradient.addColorStop(0, "#000000"); // Черный
				gradient.addColorStop(0.5, "#05080a"); // Темно-синий
				gradient.addColorStop(1, "#000000"); // Черный

				// Заполняем canvas градиентом
				context.fillStyle = gradient;
				context.fillRect(0, 0, canvas.width, canvas.height);
			}

			// Создаем текстуру из canvas
			const texture = new THREE.CanvasTexture(canvas);

			// Применяем текстуру как фон сцены
			scene.background = texture;
		}

		const mainCamera = new THREE.PerspectiveCamera(50, width.current / height.current, 0.01, 10000);

		// Инициализация того, что будет внутри сцены
		tableSceneRef.current = new TableScene({
			renderer: renderer,
			scene: mainScene,
			camera: mainCamera,
			tableSize: tableSize,
			legLength: legLength,
			currentSupports: currentSupports,
			loadingManager: manager, // Передаем менеджер загрузки
		});

		const handleMouseMove = (e: MouseEvent) => {
			const rect = renderer.domElement.getBoundingClientRect();
			// @ts-ignore
			const x = (e.clientX - rect.left) / rect.width;
			// @ts-ignore
			const y = 1.0 - (e.clientY - rect.top) / rect.height; // Переворачиваем Y
		};
		// Слушатель событий мыши
		renderer.domElement.addEventListener("mousemove", handleMouseMove);

		const handleResize = () => {
			width.current = window.innerWidth;
			height.current = window.innerHeight;

			// Обновляем аспекты камеры для финальной рендер-сцены
			mainCamera.aspect = width.current / height.current;
			mainCamera.updateProjectionMatrix();

			// Обновляем градиентный фон
			createGradientBackground(mainScene);

			// Обновляем размер рендерера и композитора
			renderer.setSize(width.current, height.current);
		};
		window.addEventListener("resize", handleResize);
		handleResize();

		let lastTime = 0;
		function animate(currentTime: number) {
			const deltaTime = currentTime - lastTime; // Время между текущим и предыдущим кадрами
			lastTime = currentTime; // Сохраняем текущее время для следующего кадра

			// Рассчитываем FPS
			if (window.innerWidth >= 768) {
				const now = performance.now();
				const delta = now - lastFrameTimeRef.current;
				fpsRef.current = 1000 / delta;
				lastFrameTimeRef.current = now;

				frameCountRef.current++;

				// Если FPS ниже 50, пропускаем каждый второй кадр
				if (fpsRef.current < 50 && frameCountRef.current % 1 === 0) {
					return;
				}
			}

			// ВКЛЮЧАЕМ АНИМАЦИЮ СЦЕН
			tableSceneRef.current?.animate(deltaTime);
			renderer.render(mainScene, mainCamera);
		}

		renderer.setAnimationLoop(animate);

		return () => {
			// Очистка ресурсов при размонтировании компонента
			window.removeEventListener("resize", handleResize);
			renderer.domElement.removeEventListener("mousemove", handleMouseMove);
			renderer.dispose();
		};
	}, []);

	// Обновление размеров столешницы
	useEffect(() => {
		if (tableSceneRef.current) {
			const { width, depth } = tableSize;
			tableSceneRef.current.updateTableSize(width, depth, legLength);
		}
	}, [tableSize, legLength]);

	// Обновление материала столешницы
	useEffect(() => {
		if (tableSceneRef.current && currentMaterial) {
			tableSceneRef.current.loadMaterial(currentMaterial);
		}
	}, [currentMaterial]);

	// Обновление ножек столешницы
	useEffect(() => {
		if (tableSceneRef.current && currentSupports) {
			const { width, depth } = tableSize;
			tableSceneRef.current.createSupports(currentSupports, width, depth, legLength);
		}
	}, [currentSupports]);

	return (
		<>
			<div ref={containerRef} />
			<SupportsSelector onUpdateSupports={(supportsPath: string) => setCurrentSupports(supportsPath)} currentSupports={currentSupports} />
			<div className={styles.configMenu}>
				<LegConfigurator onUpdateLength={(newValue: number) => setLegLength(newValue)} legLength={legLength} />
				<SizeConfigurator onUpdateSize={(dimension: string, value: number) => setTableSize((prev) => ({ ...prev, [dimension]: value }))} tableSize={tableSize} />
			</div>
			<MaterialSelector onUpdateMaterial={(materialPath: string) => setCurrentMaterial(materialPath)} currentMaterial={currentMaterial} />
			<Preloader progress={progress} />
		</>
	);
}
