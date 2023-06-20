import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
	GENERATE_FILE_URL,
	generateFileDownloadUrl as generateFileDownloadUrlAction,
} from "../../../actions/file";
import { RootState } from "../../../types/data";

type ImageProps = {
	fileId?: string;
};

export const Image = (props: ImageProps) => {
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
				<img
					className="rubberbandimage"
					src={url}
					alt="img"
					id={`rubberbandCanvas-${fileId}`}
					style={{ maxWidth: "100%", maxHeight: "100%" }}
				/>
			);
		} else {
			return <></>;
		}
	})();
};

// export default registerDecorator.register(Image);
