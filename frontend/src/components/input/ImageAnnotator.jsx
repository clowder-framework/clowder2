import React, { useState, useEffect } from "react";
import { select, pointer } from "d3-selection";
import { line, curveLinearClosed } from "d3-shape";

import Modal from "@mui/material/Modal";
import Box from "@mui/material/Box";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import useTheme from "@mui/material/styles/useTheme";
const ImageAnnotatorImage = ({ src, points, setPoints }) => {
	useEffect(() => {
		const svg = select("#svg-container")
			.append("svg")
			.attr("width", "100%")
			.attr("height", "100%");

		svg
			.append("image")
			.attr("xlink:href", src)
			.attr("width", "100%")
			.attr("height", "100%")
			.on("click", (event) => {
				const coords = pointer(event);
				setPoints((prevPoints) => [...prevPoints, coords]);
			});

		return () => {
			select("#svg-container").selectAll("svg").remove();
		};
	}, [src, setPoints]);

	useEffect(() => {
		const svg = select("#svg-container").select("svg");
		svg
			.selectAll("circle")
			.data(points)
			.join("circle")
			.attr("cx", (d) => d[0])
			.attr("cy", (d) => d[1])
			.attr("r", 5)
			.attr("fill", "red");

		// Remove points and path if points equals 0
		if (points.length === 0) {
			svg.selectAll("circle").remove();
			svg.selectAll("path").remove();
		}

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

const ImageAnnotatorModal = ({ src, open, onClose, saveAnnotation }) => {
	const [points, setPoints] = useState([]);
	const [annotationName, setAnnotationName] = useState("");
	const [polygon, setPolygon] = useState(null);

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
			setPolygon({ name: annotationName, points });
			setPoints([]);
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
		setPolygon(null);
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
				<ImageAnnotatorImage
					src={src}
					points={points}
					setPoints={setPoints}
					onSave={handleSaveAnnotation}
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
			</Box>
		</Modal>
	);
};

export const ImageAnnotator = ({ src }) => {
	const [open, setOpen] = useState(false);
	// Object to store the coordinates and name of the polygon
	const [annotations, setAnnotations] = useState({});

	const saveAnnotation = (name, points) => {
		setAnnotations({
			name: name,
			points: points,
		});
	};

	return (
		<Box
			sx={{
				display: "flex",
				flexDirection: "center",
				alignItems: "center",
				gap: 2,
				p: 2,
			}}
		>
			{annotations.name && (
				<Box sx={{ p: 1 }}>
					<Typography sx={{ fontWeight: "bold" }} component="div">
						Annotation:
					</Typography>
					<Typography>Name - {annotations.name}</Typography>
					<Typography>Number of Points: {annotations.points.length}</Typography>
				</Box>
			)}
			<Button variant="contained" onClick={() => setOpen(true)}>
				Open Image Annotator
			</Button>
			<ImageAnnotatorModal
				src={src}
				open={open}
				onClose={() => setOpen(false)}
				saveAnnotation={saveAnnotation}
			/>
		</Box>
	);
};
