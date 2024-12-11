import styles from "./styles.module.scss";

interface PreloaderProps {
	progress: number;
}

export default function Preloader({ progress }: PreloaderProps) {
	return (
		<div className={`${styles.preloader} ${progress === 100 ? "" : styles.active}`}>
			<div className={styles.progressTitle}>LOADING</div>
			<div className={styles.progressBar}>
				<div className={styles.progress} style={{ width: `${progress}%` }}></div>
			</div>
			<div className={styles.progressText}>{progress}%</div>
		</div>
	);
}
