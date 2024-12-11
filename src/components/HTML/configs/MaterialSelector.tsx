import { useMemo } from "react";
import styles from "./styles.module.scss";

interface MaterialSelectorProps {
	onUpdateMaterial: (materialPath: string) => void;
	currentMaterial: string;
}

export default function MaterialSelector({ onUpdateMaterial, currentMaterial }: MaterialSelectorProps) {
	const materials = useMemo(
		() => [
			{ name: "Ashwood", color: "#c7b299", path: "/materials/top_ashwood_mat.glb" },
			{ name: "Cedar", color: "#cd7f32", path: "/materials/top_cedar_mat.glb" },
			{ name: "Plastic Black", color: "#1c1c1c", path: "/materials/top_plastic_black_mat.glb" },
			{ name: "Plastic White", color: "#f0f0f0", path: "/materials/top_plastic_white_mat.glb" },
			{ name: "Walnut", color: "#773f1a", path: "/materials/top_walnut_mat.glb" },
		],
		[]
	);

	return (
		<div className={`${styles.configurator} ${styles.blocks} ${styles.material}`}>
			<div className={styles.mainText}>Material</div>
			<div className={styles.materialContainer}>
				{materials.map((material) => (
					<div
						key={material.name}
						className={`${styles.materialOption} ${currentMaterial === material.path ? styles.active : ""} ${
							material.name === "Plastic White" ? `${styles.whiteBackground}` : ""
						}`}
						style={{ backgroundColor: material.color }}
						onClick={() => onUpdateMaterial(material.path)}
					>
						{material.name}
					</div>
				))}
			</div>
		</div>
	);
}
