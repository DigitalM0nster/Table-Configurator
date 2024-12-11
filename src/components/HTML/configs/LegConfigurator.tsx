import { useState } from "react";
import styles from "./styles.module.scss";

interface LegConfiguratorProps {
	legLength: number; // Тип для длины ножки
	onUpdateLength: (length: number) => void; // Тип для функции обновления длины
}

export default function LegConfigurator({ legLength, onUpdateLength }: LegConfiguratorProps) {
	const [localLegLength, setLocalLegLength] = useState(legLength);

	// Обработчик изменения высоты ножек
	const handleLengthChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		let value = e.target.value; // Получаем строковое значение
		value = value.replace(/[^0-9]/g, "");
		setLocalLegLength(Number(value));
	};

	// Подтверждение изменений при потере фокуса
	const handleLengthBlur = () => {
		let value = localLegLength;
		if (isNaN(value)) value = 500;
		value = Math.max(500, Math.min(1200, value));
		setLocalLegLength(value);
		onUpdateLength(Number(value));
	};

	return (
		<div className={`${styles.configurator} ${styles.legLength} ${styles.size}`}>
			<div className={styles.mainText}>Legs's height</div>
			<div className={styles.configMenuContainer}>
				<div className={`${styles.menuBlock} ${styles.LegLength}`}>
					<div className={styles.inputBlock}>
						<div className={styles.menuDescription}>
							<div className={styles.text}>LENGTH</div>
							<div className={styles.value}>(mm)</div>
						</div>
						<input type="number" min="500" max="1200" step="1" value={localLegLength} onChange={handleLengthChange} onBlur={handleLengthBlur} />
						<div className={styles.rangeBlock}>
							<div className={styles.value}>500</div>
							<input
								type="range"
								min="500"
								max="1200"
								step="1"
								value={legLength}
								onChange={(e) => onUpdateLength(parseInt(e.target.value, 10))}
								className={styles.slider}
							/>
							<div className={styles.value}>1200</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}
