declare const ENV: "development" | "production" | "test";
declare const PUBLIC_PATH: string;

declare module "*.json" {
	const src: string;
	export default src;
}

declare module "*.bmp" {
	const src: string;
	export default src;
}

declare module "*.gif" {
	const src: string;
	export default src;
}

declare module "*.jpg" {
	const src: string;
	export default src;
}

declare module "*.jpeg" {
	const src: string;
	export default src;
}

declare module "*.png" {
	const src: string;
	export default src;
}

declare module "*.webp" {
	const src: string;
	export default src;
}

declare module "*.svg" {
	import * as React from "react";

	export const ReactComponent: React.FunctionComponent<
		React.SVGProps<SVGSVGElement>
	>;

	const src: string;
	export default src;
}

declare module "*.css" {
	const classes: { readonly [key: string]: string };
	export default classes;
}

declare module "mirador";
declare module "mirador-annotations";
declare module "mirador-annotations/lib/LocalStorageAdapter";
