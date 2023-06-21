import React, { useEffect, useRef, useState } from "react";

import Map from "ol/Map";
import View from "ol/View";
import TileLayer from "ol/layer/Tile";
import VectorLayer from "ol/layer/Vector";
import VectorSource from "ol/source/Vector";
import XYZ from "ol/source/XYZ";

type GeospatialProps = {
	features?: string;
};

// https://taylor.callsen.me/using-openlayers-with-react-functional-components/
export default function Geospatial(props: GeospatialProps) {
	const [map, setMap] = useState();
	const [featuresLayer, setFeaturesLayer] = useState();
	const [selectedCoord, setSelectedCoord] = useState();
	const mapElement = useRef();
	const mapRef = useRef();
	mapRef.current = map;

	// initialize map on first render
	useEffect(() => {
		const initalFeaturesLayer = new VectorLayer({
			source: new VectorSource(),
		});

		const initialMap = new Map({
			target: mapElement.current,
			layers: [
				new TileLayer({
					source: new XYZ({
						url: "https://basemap.nationalmap.gov/arcgis/rest/services/USGSTopo/MapServer/tile/{z}/{y}/{x}",
					}),
				}),
				initalFeaturesLayer,
			],
			view: new View({
				projection: "EPSG:3857",
				center: [0, 0],
				zoom: 2,
			}),
			controls: [],
		});
		initialMap.on("click", handleMapClick);

		setMap(initialMap);
		setFeaturesLayer(initalFeaturesLayer);
	}, []);

	const handleMapClick = (event) => {
		const clickedCoord = mapRef.current.getCoordinateFromPixel(event.pixel);
		const transormedCoord = transform(clickedCoord, "EPSG:3857", "EPSG:4326");
		setSelectedCoord(transormedCoord);
	};

	return (
		<div
			ref={mapElement}
			style="height:100px; width:100px;"
			className="map-container"
		/>
	);
}
