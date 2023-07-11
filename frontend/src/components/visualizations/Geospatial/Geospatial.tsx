import React, { useEffect, useRef, useState } from "react";

import Map from "ol/Map";
import View from "ol/View";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../../../types/data";
import { fetchFileExtractedMetadata } from "../../../actions/file";
import { OSM } from "ol/source";
import TileLayer from "ol/layer/Tile";
import Static from "ol/source/ImageStatic";
import ImageLayer from "ol/layer/Image";

type GeospatialProps = {
	fileId?: string;
};

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
		wms_map.getView().fit(bbox, wms_map.getSize());
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
