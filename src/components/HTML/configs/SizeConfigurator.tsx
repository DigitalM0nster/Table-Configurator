import { useState } from "react";
import styles from "./styles.module.scss";

interface SizeConfiguratorProps {
	onUpdateSize: (dimension: "width" | "depth", value: number) => void;
	tableSize: {
		width: number;
		depth: number;
	};
}

export default function SizeConfigurator({ onUpdateSize, tableSize }: SizeConfiguratorProps) {
	// Локальное состояние для управляемого ввода
	const [localWidth, setLocalWidth] = useState<number>(tableSize.width);
	const [localDepth, setLocalDepth] = useState<number>(tableSize.depth);

	// Обработчик изменения ширины
	const handleWidthChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		let value = e.target.value; // Получаем строковое значение
		// Фильтруем некорректные символы
		value = value.replace(/[^0-9]/g, "");
		setLocalWidth(Number(value)); // Обновляем локальное состояние
	};

	// Подтверждение изменений ширины при потере фокуса
	const handleWidthBlur = () => {
		let value = localWidth; // Уже число
		if (isNaN(value)) value = 1200; // Если пусто, ставим минимальное значение
		value = Math.max(1200, Math.min(2400, value)); // Ограничиваем диапазон
		setLocalWidth(value); // Синхронизируем локальное состояние
		onUpdateSize("width", value); // Обновляем состояние родительского компонента
	};

	// Обработчик изменения глубины
	const handleDepthChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		let value = e.target.value; // Получаем строковое значение
		// Фильтруем некорректные символы
		value = value.replace(/[^0-9]/g, "");
		setLocalDepth(Number(value)); // Обновляем локальное состояние
	};

	// Подтверждение изменений глубины при потере фокуса
	const handleDepthBlur = () => {
		let value = localDepth; // Преобразуем в число
		if (isNaN(value)) value = 300; // Если пусто, ставим минимальное значение
		value = Math.max(300, Math.min(900, value)); // Ограничиваем диапазон
		setLocalDepth(value); // Синхронизируем локальное состояние
		onUpdateSize("depth", value); // Обновляем состояние родительского компонента
	};

	return (
		<div className={`${styles.configurator} ${styles.size} ${styles.tableSizes}`}>
			<div className={styles.mainText}>Table width and depth</div>
			<div className={styles.configMenuContainer}>
				{/* Ширина */}
				<div className={`${styles.menuBlock} ${styles.width}`}>
					<div className={styles.inputBlock}>
						<div className={styles.menuDescription}>
							<div className={styles.text}>WIDTH</div>
							<div className={styles.value}>(mm)</div>
						</div>
						<input
							type="number"
							min="1200"
							max="2400"
							step="1"
							value={localWidth}
							onChange={handleWidthChange}
							onBlur={handleWidthBlur} // Подтверждаем при потере фокуса
						/>
						<div className={styles.rangeBlock}>
							<div className={styles.value}>1200</div>
							<input
								type="range"
								min="1200"
								max="2400"
								step="1"
								value={tableSize.width} // Используем родительское состояние
								onChange={(e) => onUpdateSize("width", parseInt(e.target.value, 10))}
								className={styles.slider}
							/>
							<div className={styles.value}>2400</div>
						</div>
					</div>
				</div>
				{/* Глубина */}
				<div className={styles.menuBlock}>
					<div className={styles.inputBlock}>
						<div className={styles.menuDescription}>
							<div className={styles.text}>DEPTH</div>
							<div className={styles.value}>(mm)</div>
						</div>
						<input
							type="number"
							min="300"
							max="900"
							step="1"
							value={localDepth}
							onChange={handleDepthChange}
							onBlur={handleDepthBlur} // Подтверждаем при потере фокуса
						/>
						<div className={styles.rangeBlock}>
							<div className={styles.value}>300</div>
							<input
								type="range"
								min="300"
								max="900"
								step="1"
								value={tableSize.depth} // Используем родительское состояние
								onChange={(e) => onUpdateSize("depth", parseInt(e.target.value, 10))}
								className={styles.slider}
							/>
							<div className={styles.value}>900</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}
