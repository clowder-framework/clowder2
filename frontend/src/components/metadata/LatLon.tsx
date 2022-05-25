import React, {useState} from "react";
import {MetadataButtonGroup} from "./MetadataButtonGroup";
import {ClowderMetadataTextField} from "../styledComponents/ClowderMetadataTextField";

export const LatLon = (props) => {

	const {widgetName, metadataId, contents, saveMetadata, deleteMetadata, resourceId} = props;
	const [lat, setLat] = useState("");
	const [lon, setLon] = useState("");
	const [readOnly, setReadOnly] = useState(!!metadataId); // if metdataID doesn't exist meaning it's a new form

	const resetForm = () => {
		setLat("");
		setLon("");
	}

	return (
		<>
			<ClowderMetadataTextField label="Lat" variant="outlined" margin="normal"
					   fullWidth
					   name={widgetName}
					   value={readOnly && contents? contents.latitude: lat}
					   onChange={(event: React.ChangeEvent<HTMLInputElement>) => { setLat(event.target.value);}}
					   disabled={readOnly}
			/>
			<ClowderMetadataTextField label="Lon" variant="outlined" margin="normal"
					   fullWidth
					   name={widgetName}
					   value={readOnly? contents.longitude: lon}
					   onChange={(event: React.ChangeEvent<HTMLInputElement>) => { setLon(event.target.value);}}
					   disabled={readOnly}
			/>
			<MetadataButtonGroup readOnly={readOnly}
								 setReadOnly={setReadOnly}
								 metadataId={metadataId}
								 saveMetadata={saveMetadata}
								 deleteMetadata={deleteMetadata}
								 resourceId={resourceId}
								 contents={{
									 "latitude":lat,
									 "longitude":lon
								 }}
								 resetForm={resetForm}
								 widgetName={widgetName}
			/>
		</>
	)
}
