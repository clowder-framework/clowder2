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
import { FeatureLike } from "ol/Feature";

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
				const attribute_url = wms_url.replace(
					"GetFeature",
					"describeFeatureType"
				);
				fetch(attribute_url).then((response) => {
					if (response.status === 200) {
						response.json().then((json) => {
							console.log(json);
						});
					}
				});
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

			const vecLayer = new VectorLayer({
				source: source,
			});

			const wms_map = new Map({
				target: mapElement.current,
				layers: [
					new TileLayer({
						source: new OSM(),
					}),
					vecLayer,
				],
				view: new View({
					projection: "EPSG:3857",
					center: center,
				}),
				controls: [],
			});
			wms_map.getView().fit(bbox);

			const info = document.getElementById("info");

			let currentFeature: FeatureLike | undefined;
			const displayFeatureInfo = function (pixel, target) {
				const feature = target.closest(".ol-control")
					? undefined
					: wms_map.forEachFeatureAtPixel(pixel, function (feature) {
							return feature;
					  });
				if (feature && info) {
					info.style.left = `${pixel[0]}px`;
					info.style.top = `${pixel[1]}px`;
					if (feature !== currentFeature) {
						info.style.visibility = "visible";
						info.innerText = feature.get("STATE_NAME");
					}
				} else {
					if (info) info.style.visibility = "hidden";
				}
				currentFeature = feature;
			};

			// Interactive behavior
			wms_map.on("pointermove", function (evt) {
				if (evt.dragging && info) {
					info.style.visibility = "hidden";
					currentFeature = undefined;
					return;
				}
				const pixel = wms_map.getEventPixel(evt.originalEvent);
				displayFeatureInfo(pixel, evt.originalEvent.target);
			});

			wms_map.on("click", function (evt) {
				displayFeatureInfo(evt.pixel, evt.originalEvent.target);
			});
			wms_map.getTargetElement().addEventListener("pointerleave", function () {
				currentFeature = undefined;
				if (info) info.style.visibility = "hidden";
			});

			setMap(wms_map);
		}
	}, [layerWMS]);

	return (() => {
		return (
			<>
				<div
					ref={mapElement}
					style={{
						width: "400px",
						height: "300px",
					}}
					className="map-container"
				>
					<div
						id="info"
						style={{
							position: "absolute",
							display: "inline-block",
							height: "auto",
							width: "auto",
						}}
					/>
				</div>
			</>
		);
	})();
}
