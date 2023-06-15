import React, { lazy } from "react";

// // Example usage
// const program = ts.createProgram(["./components"], {});
// const sourceFiles = program.getSourceFiles();
//
// for (const sourceFile of sourceFiles) {
// 	const components = findComponentsWithDecorator(
// 		sourceFile,
// 		"YourDecoratorName"
// 	);
// 	for (const component of components) {
// 		// React component type checking
// 		const componentName = component.name?.getText();
// 		const componentType = sourceFile.statements.find(ts.isExportAssignment);
// 		if (componentType && React.isValidElement(componentType.expression)) {
// 			console.log(`Found component: ${componentName}`);
// 		}
// 	}
// }

const imageConfig = require("./components/previewers/image/manifest.json");
const Image = lazy(
	() =>
		import(
			/* webpackChunkName: "previewers-image" */ `./components/previewers/image/${imageConfig.main}`
		)
);

const audioConfig = require("./components/previewers/audio/manifest.json");
const Audio = lazy(
	() =>
		import(
			/* webpackChunkName: "previewers-audio" */ `./components/previewers/audio/${audioConfig.main}`
		)
);

const videoConfig = require("./components/previewers/video/manifest.json");
const Video = lazy(
	() =>
		import(
			/* webpackChunkName: "previewers-video" */ `./components/previewers/video/${videoConfig.main}`
		)
);

const textConfig = require("./components/previewers/text/manifest.json");
const Text = lazy(
	() =>
		import(
			/* webpackChunkName: "previewers-text" */ `./components/previewers/text/${textConfig.main}`
		)
);

const vizConfig = {};
vizConfig[imageConfig.vizConfig.mainType] = <Image />;
vizConfig[audioConfig.vizConfig.mainType] = <Audio />;
vizConfig[videoConfig.vizConfig.mainType] = <Video />;
vizConfig[textConfig.vizConfig.mainType] = <Text />;

export { vizConfig };
