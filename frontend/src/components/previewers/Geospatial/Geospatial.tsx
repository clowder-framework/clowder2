import React, { useEffect, useRef, useState } from "react";

import Map from "ol/Map";
import View from "ol/View";
import TileLayer from "ol/layer/Tile";
import XYZ from "ol/source/XYZ";
import { useSelector } from "react-redux";
import { RootState } from "../../../types/data";

type GeospatialProps = {
	features?: string;
};

// https://taylor.callsen.me/using-openlayers-with-react-functional-components/
export default function Geospatial(props: GeospatialProps) {
	const [layerWMS, setLayerWMS] = useState("");
	const [map, setMap] = useState<Map | undefined>(undefined);
	const mapElement = useRef();
	const mapRef = useRef<Map>();
	mapRef.current = map;

	const metadata = useSelector(
		(state: RootState) => state.file.extractedMetadata
	);

	useEffect(() => {
		const url =
			"https://basemap.nationalmap.gov/arcgis/rest/services/USGSTopo/MapServer/tile/{z}/{y}/{x}";
		// TODO: Replace with action to get metadata from file and check for WMS URL
		setLayerWMS(url);
	}, []);

	useEffect(() => {
		const wms_map = new Map({
			target: mapElement.current,
			layers: [
				new TileLayer({
					source: new XYZ({
						url: layerWMS,
					}),
				}),
			],
			view: new View({
				projection: "EPSG:3857",
				center: [0, 0],
				zoom: 2,
			}),
			controls: [],
		});
		setMap(wms_map);
	}, [layerWMS]);

	return (() => {
		if (map && map !== undefined) {
			return (
				<div
					ref={mapElement}
					style={{ height: "600px", width: "800px" }}
					className="map-container"
				/>
			);
		} else {
			return <></>;
		}
	})();
}
