import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../../types/data";
import {
	GENERATE_FILE_URL,
	generateFileDownloadUrl as generateFileDownloadUrlAction,
} from "../../actions/file";

type AudioProps = {
	fileId?: string;
};

export default function Audio(props: AudioProps) {
	const { fileId } = props;

	const dispatch = useDispatch();

	const generateFileDownloadUrl = (
		fileId: string | undefined,
		fileVersionNum: number | null
	) => dispatch(generateFileDownloadUrlAction(fileId, fileVersionNum));

	const url = useSelector((state: RootState) => state.file.url);

	useEffect(() => {
		return () => {
			dispatch({
				type: GENERATE_FILE_URL,
				url: "",
				receivedAt: Date.now(),
			});
		};
	}, []);

	useEffect(() => {
		generateFileDownloadUrl(fileId, 0);
	}, [fileId]);

	return (() => {
		if (url && url !== "") {
			return (
				<audio controls style={{ maxWidth: "100%", maxHeight: "100%" }}>
					<source id={fileId} src={url} />
				</audio>
			);
		} else {
			return <></>;
		}
	})();
}
