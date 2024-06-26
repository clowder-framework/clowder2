import React, { useEffect, useState } from "react";
import { select, pointer } from "d3-selection";
import { line, curveLinearClosed } from "d3-shape";
import {
	Modal,
	Box,
	Button,
	TextField,
	Typography,
	CircularProgress,
} from "@mui/material";
import { V2 } from "../../openapi";

interface ImageAnnotatorImageProps {
	image: string | null;
	points: Array<[number, number]>;
	setPoints: React.Dispatch<React.SetStateAction<Array<[number, number]>>>;
}

interface ImageAnnotatorModalProps {
	fileId: string;
	open: boolean;
	onClose: () => void;
	saveAnnotation: (name: string, points: Array<[number, number]>) => void;
}

interface ImageAnnotatorProps {
	fileId: string;
	onChange: ({
		name,
		points,
	}: {
		name: string;
		points: Array<[number, number]>;
	}) => void;
}

// Function to check if file is an image
async function checkFileIsImage(fileId: string) {
	try {
		const response =
			await V2.FilesService.getFileSummaryApiV2FilesFileIdSummaryGet(fileId);

		// @ts-ignore
		if (response["content_type"]["main_type"] === "image") return true;
		else return false;
	} catch (error) {
		console.error("Error fetching file metadata", error);
		return false;
	}
}

// Function to fetch file data
async function fetchImageData(fileId: string) {
	try {
		const response =
			await V2.FilesService.downloadFileUrlApiV2FilesFileIdUrlGet(fileId);
		return response["presigned_url"];
	} catch (error) {
		console.error("Error fetching image data", error);
	}
}

const ImageAnnotatorImage: React.FC<ImageAnnotatorImageProps> = ({
	image,
	points,
	setPoints,
}) => {
	useEffect(() => {
		const svg = select("#svg-container")
			.append("svg")
			.attr("width", "100%")
			.attr("height", "100%");

		svg
			.append("image")
			.attr("xlink:href", image)
			.attr("width", "100%")
			.attr("height", "100%")
			.on("click", (event) => {
				const coords = pointer(event) as [number, number];
				setPoints((prevPoints) => [...prevPoints, coords]);
			});

		return () => {
			select("#svg-container").selectAll("svg").remove();
		};
	}, [image, setPoints]);

	useEffect(() => {
		// In case of reset, remove all circles and paths
		if (points.length === 0) {
			select("#svg-container").selectAll("circle").remove();
			select("#svg-container").selectAll("path").remove();
		}

		const svg = select("#svg-container").select("svg");
		svg
			.selectAll("circle")
			.data(points)
			.join("circle")
			.attr("cx", (d) => d[0])
			.attr("cy", (d) => d[1])
			.attr("r", 5)
			.attr("fill", "red");

		if (points.length > 1) {
			svg
				.selectAll("path")
				.data([points])
				.join("path")
				.attr("d", line().curve(curveLinearClosed))
				.attr("fill", "none")
				.attr("stroke", "black")
				.attr("stroke-width", 2)
				.attr("stroke-dasharray", "5,5");
		}
	}, [points]);

	return <div id="svg-container" style={{ width: "100%", height: "70%" }} />;
};

const ImageAnnotatorModal: React.FC<ImageAnnotatorModalProps> = ({
	fileId,
	open,
	onClose,
	saveAnnotation,
}) => {
	const [points, setPoints] = useState<Array<[number, number]>>([]);
	const [annotationName, setAnnotationName] = useState("");
	const [isImage, setIsImage] = useState(true);
	const [image, setImage] = useState<string | null>(null);

	// Check if file is an image
	useEffect(() => {
		checkFileIsImage(fileId).then((response) => {
			setIsImage(response);
		});
	}, [fileId]);

	// Fetch image data
	useEffect(() => {
		if (isImage) {
			fetchImageData(fileId).then((response) => {
				setImage(response);
			});
		}
	}, [isImage, fileId]);

	const style = {
		position: "absolute",
		top: "50%",
		left: "50%",
		transform: "translate(-50%, -50%)",
		height: "75%",
		bgcolor: "background.paper",
		border: "2px solid #000",
		boxShadow: 24,
		p: 4,
	};

	const handleSaveAnnotation = () => {
		if (points.length > 2 && annotationName.trim() !== "") {
			saveAnnotation(annotationName, points);
			onClose();
		} else {
			alert(
				"Please enter a name for the annotation and ensure it has more than two points."
			);
		}
	};

	const handleReset = () => {
		setPoints([]);
		saveAnnotation(annotationName, []);
	};

	return (
		<Modal
			open={open}
			onClose={() => {
				onClose();
				handleReset();
			}}
			aria-labelledby="modal-modal-title"
			aria-describedby="modal-modal-description"
		>
			<Box sx={style}>
				<Typography id="modal-modal-title" variant="h6" component="h2">
					Annotate Image
				</Typography>
				{!isImage && (
					<Typography id="modal-modal-description" variant="body1">
						The selected file is not an image.
					</Typography>
				)}
				{!image && isImage && <CircularProgress />}
				{image && isImage && (
					<>
						<ImageAnnotatorImage
							image={image}
							points={points}
							setPoints={setPoints}
						/>
						<TextField
							fullWidth
							margin="normal"
							label="Annotation Name"
							value={annotationName}
							onChange={(e) => setAnnotationName(e.target.value)}
						/>
						<Button
							onClick={handleSaveAnnotation}
							variant="contained"
							sx={{ mt: 2, mr: 1 }}
						>
							Save Annotation
						</Button>
						<Button onClick={handleReset} variant="outlined" sx={{ mt: 2 }}>
							Reset
						</Button>
					</>
				)}
			</Box>
		</Modal>
	);
};

const ImageAnnotator: React.FC<ImageAnnotatorProps> = ({
	fileId,
	onChange,
}) => {
	const [open, setOpen] = useState(false);
	const [annotation, setAnnotation] = useState<{
		name: string;
		points: Array<[number, number]>;
	} | null>(null);

	const saveAnnotation = (name: string, points: Array<[number, number]>) => {
		setAnnotation({ name, points });
	};

	// Set annotation, this is the output of the image annotator
	useEffect(() => {
		if (annotation) {
			onChange(annotation);
		}
	}, [annotation]);

	return (
		<Box
			sx={{
				display: "flex",
				flexDirection: "column",
				alignItems: "center",
				gap: 2,
				p: 2,
			}}
		>
			{annotation && annotation.points.length !== 0 && (
				<Box sx={{ p: 1 }}>
					<Typography sx={{ fontWeight: "bold" }} component="div">
						Annotation:
					</Typography>
					<Typography>Name - {annotation.name}</Typography>
					<Typography>Number of Points: {annotation.points.length}</Typography>
				</Box>
			)}
			<Button variant="contained" onClick={() => setOpen(true)}>
				Open Image Annotator
			</Button>
			<ImageAnnotatorModal
				fileId={fileId}
				open={open}
				onClose={() => setOpen(false)}
				saveAnnotation={saveAnnotation}
			/>
		</Box>
	);
};

export default ImageAnnotator;
