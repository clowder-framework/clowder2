import React, {useEffect, useState} from "react";
import {Box, Grid, Typography, Divider, Button} from "@mui/material";
import {metadataConfig} from "../../metadata.config";
import {useSelector, useDispatch} from "react-redux";
import {RootState} from "../../types/data";
import {fetchDatasetMetadata, fetchFileMetadata, fetchMetadataDefinitions} from "../../actions/metadata";
import {ListenerAgent} from "./ListenerAgent";
import {ListenerContents} from "./ListenerContents";
import {MetadataDeleteButton} from "./widgets/MetadataDeleteButton";


type ListenerMetadata = {
	agent: any,
	contents: any,
	context: any,
	context_url: any,
	created: string,
}

/*
This is the interface displayed already created metadata and allow eidts
Uses only the list of metadata
*/
export const ListenerMetadataEntry = (props: ListenerMetadata) => {

	const {agent, contents, context, context_url, created} = props;

	const dispatch = useDispatch();

	const [isOpened, setIsOpened] = useState(false);
	const buttonTextClosed = "View Metadata";
	const buttonTextOpened = "Hide Metadata";
	const [buttonText, setButtonText] = useState(buttonTextClosed);

	function toggle() {
    	setIsOpened(wasOpened => !wasOpened);
    	if (buttonText == buttonTextClosed){
    		setButtonText(buttonTextOpened)
		} else {
    		setButtonText(buttonTextClosed)
		}

  	}


	return (
		<>
			{
				(() => {
					return <Grid container spacing={2}>
						<Grid item xs={11} sm={11} md={11} lg={11} xl={11}>
							<div>
								<ListenerAgent created={created} agent={agent} />
							</div>
							<Divider></Divider>
								<Button
								  onClick={toggle}
								>
									{buttonText}
							</Button>
							{isOpened && (
								<ListenerContents
									contents={contents}/>
     						 )}


						</Grid>
					</Grid>


				})()
			}
		</>
	)
}
