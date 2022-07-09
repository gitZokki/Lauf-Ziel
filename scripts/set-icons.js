const fs = require('fs');

module.exports = () => {
	const RESOURCES_ICON_PATH = './resources/android/';
	const ANDROID_ICON_PATH = './android/app/src/main/res/';

	const getFiles = (filePath = '') => {
		const files = [];

		const path = RESOURCES_ICON_PATH + filePath;
		fs.readdirSync(path).forEach(iconTypeFolder => {
			const file = path + iconTypeFolder;

			if (fs.statSync(file).isDirectory()) {
				files.push(...getFiles(iconTypeFolder + '/'));
			} else {
				files.push(file);
			}
		});
		return files;
	};

	fs.readdirSync(RESOURCES_ICON_PATH).forEach(iconTypeFolder => {
		const file = ANDROID_ICON_PATH + iconTypeFolder;

		fs.rmSync(file, { recursive: true, force: true });
	});

	getFiles().forEach(file => {
		const dest = ANDROID_ICON_PATH + file.replace(RESOURCES_ICON_PATH, '');
		fs.cpSync(file, dest);
	});
};
