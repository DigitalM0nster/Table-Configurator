export default function trackPageLoad(updateProgress) {
	const promises = [];

	// Загрузка DOM
	promises.push(
		new Promise((resolve) => {
			if (document.readyState === "complete") {
				updateProgress(10); // Обновляем прогресс
				resolve();
			} else {
				window.addEventListener("load", () => {
					updateProgress(10); // Обновляем прогресс
					resolve();
				});
			}
		})
	);

	// Загрузка шрифтов
	if (document.fonts) {
		promises.push(
			document.fonts.ready.then(() => {
				updateProgress(20); // Обновляем прогресс
			})
		);
	}

	// Загрузка изображений
	const images = Array.from(document.images);
	const imagePromises = images.map((img) => {
		return new Promise((resolve) => {
			if (img.complete) {
				updateProgress(30); // Обновляем прогресс
				resolve();
			} else {
				img.addEventListener("load", () => {
					updateProgress(30); // Обновляем прогресс
					resolve();
				});
				img.addEventListener("error", resolve);
			}
		});
	});
	promises.push(...imagePromises);

	return Promise.all(promises);
}
