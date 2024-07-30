import React, { useEffect, useRef, useState } from "react";

import Map from "ol/Map";
import View from "ol/View";
import { VisualizationConfigOut } from "../../../openapi/v2";
import VectorLayer from "ol/layer/Vector";
import VectorSource from "ol/source/Vector";
import GeoJSON from "ol/format/GeoJSON";
import TileLayer from "ol/layer/Tile";
import { OSM } from "ol/source";
import { bbox as bboxStrategy } from "ol/loadingstrategy";
import { transformExtent } from "ol/proj";

type GeospatialProps = {
	visConfigEntry?: VisualizationConfigOut;
};

export default function Geospatial(props: GeospatialProps) {
	const { visConfigEntry } = props;

	const [layerWMS, setLayerWMS] = useState<string | undefined>(undefined);
	const [map, setMap] = useState<Map | undefined>(undefined);
	const mapElement = useRef();

	useEffect(() => {
		if (visConfigEntry !== undefined) {
			if (
				visConfigEntry.parameters &&
				visConfigEntry.parameters["WMS Layer URL"]
			) {
				const wms_url = String(visConfigEntry.parameters["WMS Layer URL"]);
				setLayerWMS(wms_url);
			}
		}
	}, [visConfigEntry]);

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
			bbox = transformExtent(bbox, "EPSG:4326", "EPSG:3857");
			const center = [(bbox[0] + bbox[2]) / 2, (bbox[1] + bbox[3]) / 2];

			const source = new VectorSource({
				url: layerWMS,
				format: new GeoJSON(),
				strategy: bboxStrategy,
			});

			const wms_map = new Map({
				target: mapElement.current,
				layers: [
					new TileLayer({
						source: new OSM(),
					}),
					new VectorLayer({
						source: source,
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
