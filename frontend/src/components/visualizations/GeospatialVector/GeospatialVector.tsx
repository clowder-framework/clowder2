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

export default function GeospatialVector(props: GeospatialProps) {
	const { visConfigEntry } = props;

	const [layerWMS, setLayerWMS] = useState<string | undefined>(undefined);
	const [layerDL, setLayerDL] = useState<string | undefined>(undefined);

	const [layerAttributes, setLayerAttributes] = useState<string[] | undefined>(
		undefined
	);
	const [filterAttribute, setFilterAttribute] = useState<string | undefined>(
		undefined
	);
	const [attributeValues, setAttributeValues] = useState<string[] | undefined>(
		undefined
	);
	const [attributeValue, setAttributeValue] = useState<string | undefined>(
		undefined
	);
	const [vectorRef, setVectorRef] = useState<VectorLayer<any> | undefined>(
		undefined
	);
	const [map, setMap] = useState<Map | undefined>(undefined);
	const mapElement = useRef();

	function updateFilterAttribute(event) {
		setFilterAttribute(event.target.value);
	}

	function setAttributeValueFn(event) {
		setAttributeValue(event.target.value);
	}

	function clearFilter() {
		setFilterAttribute(undefined);
		setAttributeValue("Show All");
	}

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
							const attrs: string[] = [];
							json["featureTypes"][0]["properties"].forEach((a) => {
								attrs.push(a["name"]);
							});
							setLayerAttributes(attrs);
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

			let wms_url = layerWMS;
			if (attributeValue != undefined) {
				const params = new URLSearchParams(wms_url.split("?")[1]);
				params.delete("bbox");
				wms_url = `${wms_url.split("?")[0]}?${params.toString()}`;
				wms_url += `&CQL_FILTER=${filterAttribute}='${attributeValue}'`;
			}

			const source = new VectorSource({
				url: wms_url,
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
						let label =
							"<table><th>" + "<td>Field</td>" + "<td>Value</td></th>";
						const allProps = feature.getProperties();
						for (const key in allProps) {
							if (
								!["operation_", "sp_region", "price", "prosperty_"].includes(
									key
								)
							)
								continue;
							label += `<tr><td><b>${key}</b></td><td>${allProps[key]}</td></tr>`;
						}
						label += "</table>";
						info.innerHTML = label;
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

			setVectorRef(vecLayer);
			setMap(wms_map);
		}
	}, [layerWMS]);

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

			let wms_url = layerWMS;
			if (
				filterAttribute &&
				attributeValue != undefined &&
				attributeValue != "Show All"
			) {
				const params = new URLSearchParams(wms_url.split("?")[1]);
				params.delete("bbox");
				wms_url = `${wms_url.split("?")[0]}?${params.toString()}`;
				wms_url += `&CQL_FILTER=${filterAttribute}='${attributeValue}'`;
			}

			const source = new VectorSource({
				url: wms_url,
				format: new GeoJSON(),
				strategy: bboxStrategy,
			});

			const vecLayer = new VectorLayer({
				source: source,
			});

			if (map) {
				if (vectorRef) map.removeLayer(vectorRef);
				map.addLayer(vecLayer);
				setVectorRef(vecLayer);
			}
		}
	}, [layerWMS, attributeValue]);

	useEffect(() => {
		if (layerWMS) {
			const params = new URLSearchParams(layerWMS.split("?")[1]);
			params.delete("bbox");
			params.delete("outputFormat");
			let dl_url = `${layerWMS.split("?")[0]}?${params.toString()}`;
			if (attributeValue && filterAttribute)
				dl_url += `&CQL_FILTER=${filterAttribute}='${attributeValue}'`;
			dl_url += "&outputFormat=shape-zip";
			setLayerDL(dl_url);
		}
	}, [attributeValue]);

	useEffect(() => {
		const values: string[] = ["Show All"];
		if (vectorRef && filterAttribute) {
			vectorRef
				.getSource()
				.getFeatures()
				.forEach((feat: any) => {
					const val = feat["values_"][filterAttribute];
					if (!values.includes(val)) values.push(val);
				});
			setAttributeValues(values.sort());
		}
	}, [filterAttribute]);

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
				/>
				{layerAttributes ? (
					<>
						<b>Field Name</b>
						<select onChange={updateFilterAttribute}>
							{layerAttributes.map((att) => {
								return <option value={att}>{att}</option>;
							})}
						</select>
					</>
				) : (
					<></>
				)}
				{attributeValues ? (
					<>
						<br />
						<b>Value</b>
						<select onChange={setAttributeValueFn} value={attributeValue}>
							{attributeValues.map((att) => {
								return <option value={att}>{att}</option>;
							})}
						</select>
						<button onClick={clearFilter}>Clear Filter</button>
					</>
				) : (
					<></>
				)}
				{layerDL ? (
					<>
						<br />
						<a href={layerDL}>Download Data</a>
					</>
				) : (
					<></>
				)}
				<br />
				<div
					id="info"
					style={{
						//position: "absolute",
						//display: "inline-block",
						height: "auto",
						width: "auto",
					}}
				/>
			</>
		);
	})();
}
