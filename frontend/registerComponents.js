const fs = require("fs");
const glob = require("glob");

const registerDecoratorPath = "src/visualization.config.tsx";

function registerComponents() {
	const files = glob.sync("src/components/previewers/*/manifest.json", {
		ignore: "node_modules/**",
	});

	files.forEach((file) => {
		const relativePath = file.replace("src/", "./");
		const match = file.match(/\/(\w+)\/manifest\.json$/);
		const componentName = match ? match[1] : "";

		fs.appendFileSync(
			registerDecoratorPath,
			`const config${componentName} = require("${relativePath}");` + "\n"
		);
		fs.appendFileSync(
			registerDecoratorPath,
			`vizConfig[config${componentName}.vizConfig.mainType] = React.createElement(registerComponent(config${componentName}));` +
				"\n\n"
		);
	});

	fs.appendFileSync(registerDecoratorPath, "export { vizConfig };" + "\n");
	console.log("Component registration complete.");
}

registerComponents();
