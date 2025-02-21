// @ts-ignore
// eslint-disable-next-line no-unused-vars
import React, { useEffect } from "react";
import mirador from "mirador";
import miradorAnnotationPlugin from "mirador-annotations";
import LocalStorageAdapter from "mirador-annotations/lib/LocalStorageAdapter";

type WSIProps = {
	fileId?: string;
	visualizationId?: string;
	publicView?: boolean;
};

export default function WSI(props: WSIProps) {
	const { fileId, visualizationId, publicView } = props;

	const config = {
		annotation: {
			adapter: (canvasId) =>
				new LocalStorageAdapter(`localStorage://?canvasId=${canvasId}`),
		},
		id: "mirador-container",
		window: {
			sideBarOpen: true,
			defaultSideBarPanel: "annotations",
		},
		workspace: {
			type: "mosaic",
			height: 1000,
		},
		workspaceControlPanel: {
			enabled: false,
		},
		windows: [
			{
				manifestId:
					"http://localhost:8002/iiif-presentation-server/manifest.json",
				allowClose: true,
			},
		],
	};
	const plugins = [miradorAnnotationPlugin];

	useEffect(() => {
		mirador.viewer(config, plugins);
	}, [visualizationId, fileId, publicView, config, plugins]);

	return <div id="mirador-container" />;
}
