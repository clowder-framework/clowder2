// @ts-ignore
// eslint-disable-next-line no-unused-vars
import React, { useEffect } from "react";
import mirador from "mirador";
import miradorAnnotationPlugin from "mirador-annotations";
import LocalStorageAdapter from "mirador-annotations/lib/LocalStorageAdapter";
import { VisualizationConfigOut } from "../../../openapi/v2";

type WSIProps = {
	visConfigEntry?: VisualizationConfigOut;
};

export default function WSI(props: WSIProps) {
	const { visConfigEntry } = props;

	useEffect(() => {
		if (visConfigEntry !== undefined) {
			if (
				visConfigEntry.parameters &&
				visConfigEntry.parameters["manifestId"]
			) {

				const config = {
					annotation: {
						adapter: (canvasId: string) =>
							new LocalStorageAdapter(`localStorage://?canvasId=${canvasId}`),
					},
					id: "mirador-container",
					window: {
						allowFullscreen: true,
					},
					workspace: {
						type: "mosaic",
						height: 400,
					},
					workspaceControlPanel: {
						enabled: false,
					},
					windows: [
						{
							manifestId: visConfigEntry.parameters["manifestId"],
							allowClose: true,
						},
					],
				};
				const plugins = [miradorAnnotationPlugin];

				mirador.viewer(config, plugins);
			}
		}
	}, [visConfigEntry]);

	return <div id="mirador-container" style={{ width: "450px", height: "400px", position: "relative"}} />;
}
