import React from "react";
import { FileDrop } from "react-file-drop";
import { Box, IconButton, Typography } from "@mui/material";
import DeleteIcon from "@material-ui/icons/Delete";
import { FileDropGroup, FileDropInput } from "../../styles/Styles";
import { makeStyles } from "@material-ui/core/styles";
import { theme } from "../../theme";

const useStyles = makeStyles({
	fileDrop: {
		boxSizing: "border-box",
		height: "176px",
		width: "100%",
		border: "1px dashed #00619D",
		backgroundColor: "#FFFFFF",
		margin: "27px auto 0 auto",
		display: "block",
	},
	fileDropInput: {
		width: "95px",
	},
	fileDropText: {
		height: "54px",
		width: "92px",
		color: "#8798AD",
		fontSize: "15px",
		fontWeight: 500,
		letterSpacing: 0,
		lineHeight: "18px",
		textAlign: "center",
	},
	fileDropGroup: {
		width: "92px",
		margin: "50px auto 0 auto",
		display: "block",
	},
	displayFile: {
		boxSizing: "border-box",
		width: "100%",
		border: "1px solid #00619D",
		backgroundColor: "#FFFFFF",
		margin: "5px auto 0 auto",
		display: "block",
	},
	displayFileItem: {
		width: "100%",
		height: "37px",
	},
	displayFilename: {
		height: "18px",
		color: theme.palette.primary.main,
		fontSize: "15px",
		fontWeight: 500,
		letterSpacing: 0,
		lineHeight: "18px",
		padding: "9px 17px",
		float: "left",
	},
	deleteFileIcon: {
		height: "24px",
		width: "24px",
		float: "right",
		margin: "6px",
		"&:hover": {
			color: theme.palette.secondary.main,
		},
	},
});

type FileUploadDropProps = {
	onDrop: any;
	onFileInputChange: any;
	fileInputRef: any;
	onDeleteClick: any;
	selectedFiles: File[] | [];
};

export default function FileUploadDrop(props: FileUploadDropProps) {
	const {
		onDrop,
		onFileInputChange,
		fileInputRef,
		onDeleteClick,
		selectedFiles,
	} = props;

	const classes = useStyles();

	return (
		<div>
			<FileDrop onDrop={onDrop} className={classes.fileDrop}>
				<div style={FileDropGroup}>
					<input
						onChange={onFileInputChange}
						ref={fileInputRef}
						type="file"
						style={FileDropInput}
						multiple
					/>
					<Typography className={classes.fileDropText}>
						<br />
					</Typography>
				</div>
			</FileDrop>
			{selectedFiles !== undefined && selectedFiles.length > 0 ? (
				<Box className={classes.displayFile}>
					{selectedFiles.map((file) => {
						return (
							<div className={classes.displayFileItem} key={file.name}>
								<Typography className={classes.displayFilename}>
									{file.name}
								</Typography>
								<IconButton
									aria-label="delete"
									className={classes.deleteFileIcon}
									onClick={() => {
										onDeleteClick(file);
									}}
								>
									<DeleteIcon />
								</IconButton>
							</div>
						);
					})}
				</Box>
			) : (
				<></>
			)}
		</div>
	);
}
