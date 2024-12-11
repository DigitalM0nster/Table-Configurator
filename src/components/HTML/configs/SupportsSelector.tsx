import { useMemo } from "react";
import styles from "./styles.module.scss";

interface SupportsSelectorProps {
	onUpdateSupports: (supportsPath: string) => void;
	currentSupports: string;
}

export default function SupportsSelector({ onUpdateSupports, currentSupports }: SupportsSelectorProps) {
	const supports = useMemo(
		() => [
			{ name: "Variant 1", imageLink: "/images/supportVariant1.png", path: "/models/prop_01.glb" },
			{ name: "Variant 2", imageLink: "/images/supportVariant2.png", path: "/models/prop_02.glb" },
		],
		[]
	);

	return (
		<div className={`${styles.configurator} ${styles.blocks} ${styles.supports}`}>
			<div className={styles.mainText}>Support Types</div>
			<div className={styles.materialContainer}>
				{supports.map((support) => (
					<div
						key={support.name}
						className={`${styles.materialOption} ${currentSupports === support.path ? styles.active : ""}`}
						onClick={() => onUpdateSupports(support.path)}
					>
						<img src={support.imageLink} />
						{/* {support.name} */}
					</div>
				))}
			</div>
		</div>
	);
}
