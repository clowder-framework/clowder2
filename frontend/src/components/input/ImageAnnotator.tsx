import React, { useEffect, useState, useRef } from "react";
import { select } from "d3-selection";
import {
	Modal,
	Box,
	Button,
	TextField,
	Typography,
	CircularProgress,
} from "@mui/material";
import { V2 } from "../../openapi";
import config from "../../app.config";

interface ImageAnnotatorImageProps {
	image: string | null;
	setBoundingBox: React.Dispatch<
		React.SetStateAction<[number, number, number, number] | null>
	>;
}

interface ImageAnnotatorModalProps {
	fileId: string;
	open: boolean;
	onClose: () => void;
	saveAnnotation: (
		name: string,
		boundingBox: [number, number, number, number] | null
	) => void;
}

interface ImageAnnotatorProps {
	fileId: string;
	onChange: ({
		name,
		boundingBox,
	}: {
		name: string;
		boundingBox: [number, number, number, number] | null;
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


const ImageAnnotatorImage: React.FC<ImageAnnotatorImageProps> = ({
	image,
	setBoundingBox,
}) => {
	const [isDrawing, setIsDrawing] = useState(false);
	const [startPoint, setStartPoint] = useState<[number, number] | null>(null);
	const svgRef = useRef<SVGSVGElement | null>(null);
	const containerRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		const svg = select(containerRef.current)
			.append("svg")
			.attr("width", "100%")
			.attr("height", "100%");

		svg
			.append("image")
			.attr("xlink:href", image)
			.attr("width", "100%")
			.attr("height", "100%");

		svgRef.current = svg.node();

		return () => {
			select(containerRef.current).selectAll("svg").remove();
		};
	}, [image]);

	const getMousePosition = (event: React.MouseEvent): [number, number] => {
		const container = containerRef.current;
		if (!container) return [0, 0];
		const rect = container.getBoundingClientRect();
		return [event.clientX - rect.left, event.clientY - rect.top];
	};

	const handleMouseDown = (event: React.MouseEvent) => {
		event.preventDefault();
		setIsDrawing(true);
		setStartPoint(getMousePosition(event));
	};

	const handleMouseMove = (event: React.MouseEvent) => {
		event.preventDefault();
		if (!isDrawing || !startPoint) return;

		const currentPoint = getMousePosition(event);
		const svg = select(svgRef.current);

		svg.selectAll("rect").remove();
		svg
			.append("rect")
			.attr("x", Math.min(startPoint[0], currentPoint[0]))
			.attr("y", Math.min(startPoint[1], currentPoint[1]))
			.attr("width", Math.abs(currentPoint[0] - startPoint[0]))
			.attr("height", Math.abs(currentPoint[1] - startPoint[1]))
			.attr("fill", "none")
			.attr("stroke", "red")
			.attr("stroke-width", 2);
	};

	const handleMouseUp = (event: React.MouseEvent) => {
		event.preventDefault();
		if (!isDrawing || !startPoint) return;

		setIsDrawing(false);
		const endPoint = getMousePosition(event);
		const x = Math.min(startPoint[0], endPoint[0]);
		const y = Math.min(startPoint[1], endPoint[1]);
		const width = Math.abs(endPoint[0] - startPoint[0]);
		const height = Math.abs(endPoint[1] - startPoint[1]);

		setBoundingBox([x, y, width, height]);
	};

	return (
		<div
			ref={containerRef}
			style={{ width: "100%", height: "70%", position: "relative" }}
			onMouseDown={handleMouseDown}
			onMouseMove={handleMouseMove}
			onMouseUp={handleMouseUp}
			onMouseLeave={handleMouseUp} // Handle case where mouse leaves the container
		/>
	);
};

const ImageAnnotatorModal: React.FC<ImageAnnotatorModalProps> = ({
	fileId,
	open,
	onClose,
	saveAnnotation,
}) => {
	const [boundingBox, setBoundingBox] = useState<
		[number, number, number, number] | null
	>(null);
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
			// Image download link
			const imageURL = `${config.hostname}/api/v2/files/${fileId}?increment=false`;
			setImage(imageURL);
		}
	}, [isImage, fileId]);

	const style = {
		position: "absolute",
		top: "50%",
		left: "50%",
		transform: "translate(-50%, -50%)",
		height: "75%",
		bgcolor: "background.paper",
		boxShadow: 24,
		p: 4,
	};

	const handleSaveAnnotation = () => {
		if (boundingBox && annotationName.trim() !== "") {
			saveAnnotation(annotationName, boundingBox);
			onClose();
		} else {
			alert("Please enter a name for the annotation and draw a bounding box.");
		}
	};

	const handleReset = () => {
		setBoundingBox(null);
		saveAnnotation(annotationName, null);
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
							setBoundingBox={setBoundingBox}
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
		boundingBox: [number, number, number, number] | null;
	} | null>(null);

	const saveAnnotation = (
		name: string,
		boundingBox: [number, number, number, number] | null
	) => {
		setAnnotation({ name, boundingBox });
	};

	// Set annotation, this is the output of the image annotator
	useEffect(() => {
		if (annotation) {
			onChange(annotation);
		}
	}, [annotation, onChange]);

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
			{annotation && annotation.boundingBox && (
				<Box sx={{ p: 1 }}>
					<Typography sx={{ fontWeight: "bold" }} component="div">
						Annotation:
					</Typography>
					<Typography>Name - {annotation.name}</Typography>
					<Typography>
						Bounding Box: x={annotation.boundingBox[0].toFixed(2)}, y=
						{annotation.boundingBox[1].toFixed(2)}, width=
						{annotation.boundingBox[2].toFixed(2)}, height=
						{annotation.boundingBox[3].toFixed(2)}
					</Typography>
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
