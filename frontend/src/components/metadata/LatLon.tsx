import React, {useState} from "react";
import {MetadataButtonGroup} from "./MetadataButtonGroup";
import {ClowderMetadataTextField} from "../styledComponents/ClowderMetadataTextField";

export const LatLon = (props) => {

	const {widgetName, metadataId, contents, updateMetadata, saveMetadata, deleteMetadata, resourceId, initialReadOnly} = props;
	// default to last existing values
	const [lat, setLat] = useState(contents && contents.latitude? contents.latitude: "");
	const [lon, setLon] = useState(contents && contents.longitude? contents.longitude: "");

	const [readOnly, setReadOnly] = useState(initialReadOnly);

	return (
		<>
			<ClowderMetadataTextField label="Lat" variant="outlined" margin="normal" fullWidth name={widgetName}
									  value={readOnly && contents? contents.latitude: lat}
									  onChange={(event: React.ChangeEvent<HTMLInputElement>) => { setLat(event.target.value);}}
									  disabled={readOnly}
			/>
			<ClowderMetadataTextField label="Lon" variant="outlined" margin="normal" fullWidth name={widgetName}
									  value={readOnly && contents? contents.longitude: lon}
									  onChange={(event: React.ChangeEvent<HTMLInputElement>) => { setLon(event.target.value);}}
									  disabled={readOnly}
			/>
			<MetadataButtonGroup readOnly={readOnly}
								 setReadOnly={setReadOnly}
								 metadataId={metadataId}
								 updateMetadata={updateMetadata}
								 saveMetadata={saveMetadata}
								 deleteMetadata={deleteMetadata}
								 resourceId={resourceId}
								 contents={{
									 "latitude":lat,
									 "longitude":lon
								 }}
								 widgetName={widgetName}
			/>
		</>
	)
}
