import { Box, Button, Typography } from "@mui/material";
import { ClowderInput } from "../styledComponents/ClowderInput";
import React from "react";
import { DatasetIn } from "../../openapi/v2";
import { updateDataset } from "../../actions/dataset";
import { useDispatch } from "react-redux";

type DatasetCardProps = {
	id: string;
	name: string;
};

/**
 * Legacy component to modify the name of a dataset inline. Replaced by `EditNameModal.tsx`. Current not used.
 *
 * @param props DatasetCardProps
 * @constructor
 */
export default function DatasetName(props: DatasetCardProps) {
	const { id, name } = props;

	// redux
	const dispatch = useDispatch();
	const editDataset = (datasetId: string | undefined, formData: DatasetIn) =>
		dispatch(updateDataset(datasetId, formData));
	const [editingNameOpen, setEditingNameOpen] = React.useState<boolean>(false);
	const [datasetName, setDatasetName] = React.useState<string>("");

	const handleDatasetNameEdit = () => {
		editDataset(id, { name: datasetName });
		setEditingNameOpen(false);
	};

	return (
		<Box>
			{editingNameOpen ? (
				<>
					<ClowderInput
						required={true}
						id="name"
						onChange={(event) => {
							setDatasetName(event.target.value);
						}}
						defaultValue={name}
					/>
					<Box sx={{ margin: "5px auto" }}>
						<Button
							onClick={() => {
								handleDatasetNameEdit();
							}}
							size={"small"}
							variant="outlined"
						>
							Save
						</Button>
						<Button onClick={() => setEditingNameOpen(false)} size={"small"}>
							Cancel
						</Button>
					</Box>
				</>
			) : (
				<>
					<Typography className="content" sx={{ display: "inline" }}>
						{name}
					</Typography>
					<Button
						onClick={() => setEditingNameOpen(true)}
						size={"small"}
						sx={{ display: "inline" }}
					>
						Edit
					</Button>
				</>
			)}
		</Box>
	);
}
