const fs = require("fs");
const glob = require("glob");
const ts = require("typescript");

const registerDecoratorPath = "./components/previewers/RegisterDecorator.ts";

function registerComponents() {
	const files = glob.sync("src/components/previewers/*/*.tsx", {
		ignore: "node_modules/**",
	});

	files.forEach((file) => {
		const content = fs.readFileSync(file, "utf-8");
		const sourceFile = ts.createSourceFile(
			file,
			content,
			ts.ScriptTarget.Latest,
			true
		);

		ts.forEachChild(sourceFile, (node) => {
			if (ts.isFunctionDeclaration(node) || ts.isVariableStatement(node)) {
				const decorators = node.decorators;
				if (decorators) {
					decorators.forEach((decorator) => {
						const decoratorName = decorator.expression.getText();
						const componentName = node.name.getText();
						const registerStatement = `registerDecorator.register(${componentName})`;
						fs.appendFileSync(registerDecoratorPath, registerStatement + "\n");
					});
				}
			}
		});
	});

	console.log("Component registration complete.");
}

registerComponents();
