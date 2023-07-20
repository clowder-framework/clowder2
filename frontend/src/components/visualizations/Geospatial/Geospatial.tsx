import React, { useEffect, useRef, useState } from "react";

import Map from "ol/Map";
import View from "ol/View";
import { OSM } from "ol/source";
import TileLayer from "ol/layer/Tile";
import Static from "ol/source/ImageStatic";
import ImageLayer from "ol/layer/Image";
import { VisualizationConfigOut } from "../../../openapi/v2";

type GeospatialProps = {
	visConfig?: VisualizationConfigOut[];
};

export default function Geospatial(props: GeospatialProps) {
	const { visConfig } = props;

	const [layerWMS, setLayerWMS] = useState<string | undefined>(undefined);
	const [map, setMap] = useState<Map | undefined>(undefined);
	const mapElement = useRef();

	useEffect(() => {
		if (visConfig !== undefined) {
			visConfig.forEach(function (vc) {
				if (vc.parameters && vc.parameters["WMS Layer URL"]) {
					const wms_url = String(vc.parameters["WMS Layer URL"]);
					setLayerWMS(wms_url);
					console.log("WMS is set.");
					console.log(wms_url);
				}
			});
		}
	}, [visConfig]);

	useEffect(() => {
		if (layerWMS !== undefined) {
			// Determine bounding box extent & center point from URL
			let bbox = [0, 0, 0, 0];
			const entries = layerWMS.split("&");
			entries.forEach((entry) => {
				if (entry.startsWith("bbox=")) {
					const vals = entry.replace("bbox=", "").split(",");
					bbox = vals.map((v) => parseFloat(v));
				}
			});
			const center = [(bbox[0] + bbox[2]) / 2, (bbox[1] + bbox[3]) / 2];

			const wms_map = new Map({
				target: mapElement.current,
				layers: [
					new TileLayer({
						source: new OSM(),
					}),
					new ImageLayer({
						source: new Static({
							url: layerWMS,
							projection: "EPSG:3857",
							imageExtent: bbox,
						}),
					}),
				],
				view: new View({
					projection: "EPSG:3857",
					center: center,
				}),
				controls: [],
			});
			wms_map.getView().fit(bbox);
			setMap(wms_map);
			console.log("map is set.");
			console.log(wms_map.getLayers());
		}
	}, [layerWMS]);

	return (() => {
		return (
			<div
				ref={mapElement}
				style={{
					width: "400px",
					height: "300px",
				}}
				className="map-container"
			/>
		);
	})();
}
