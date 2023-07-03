import React, { useEffect, useRef, useState } from "react";

import Map from "ol/Map";
import View from "ol/View";
import TileLayer from "ol/layer/Tile";
import XYZ from "ol/source/XYZ";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../../../types/data";
import { fetchFileExtractedMetadata } from "../../../actions/file";

type GeospatialProps = {
	fileId?: string;
};

// https://taylor.callsen.me/using-openlayers-with-react-functional-components/
export default function Geospatial(props: GeospatialProps) {
	const { fileId } = props;

	const dispatch = useDispatch();

	const [layerWMS, setLayerWMS] = useState("");
	const [map, setMap] = useState<Map | undefined>(undefined);
	const mapElement = useRef();
	const mapRef = useRef<Map>();
	mapRef.current = map;

	const fetchExtractdMetadata = (fileId: string | undefined) =>
		dispatch(fetchFileExtractedMetadata(fileId));

	const metadata = useSelector(
		(state: RootState) => state.file.extractedMetadata
	);

	useEffect(() => {
		metadata.forEach(function (md) {
			if (md.content && md.content["WMS Layer URL"]) {
				const wms_url = String(md.content["WMS Layer URL"]);
				setLayerWMS(wms_url);
			}
		});
	}, [metadata]);

	useEffect(() => {
		fetchExtractdMetadata(fileId);
	}, [fileId]);

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
