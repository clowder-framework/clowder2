const fs = require("fs");
const glob = require("glob");
const parser = require("@babel/parser");
const traverse = require("@babel/traverse").default;

const registerDecoratorPath = "./components/previewers/RegisterDecorator.ts";

function registerComponents() {
	const files = glob.sync("src/components/previewers/*/*.tsx", {
		ignore: "node_modules/**",
	});

	files.forEach((file) => {
		const content = fs.readFileSync(file, "utf-8");
		const ast = parser.parse(content, {
			sourceType: "module",
			plugins: ["tsx"],
		});

		traverse(ast, {
			ExportDefaultDeclaration(path) {
				const { node } = path;
				if (node.declaration.decorators) {
					node.declaration.decorators.forEach((decorator) => {
						const componentName = node.declaration.id.name;
						const decoratorName = decorator.expression.name;
						const registerStatement = `${decoratorName}(${componentName})`;
						fs.appendFileSync(registerDecoratorPath, registerStatement + "\n");
					});
				}
			},
		});
	});

	console.log("Component registration complete.");
}

registerComponents();
