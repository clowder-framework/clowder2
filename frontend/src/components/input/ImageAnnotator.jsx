import React, { useState, useEffect } from "react";
import { select, pointer } from "d3-selection";
import { line, curveLinearClosed } from "d3-shape";

export const ImageAnnotator = ({ src }) => {
	const [points, setPoints] = useState([]);
	const [polygon, setpolygon] = useState([]);
	const [annotationName, setAnnotationName] = useState("");

	useEffect(() => {
		const svg = select("div#svg-container")
			.append("svg")
			.attr("width", "100%")
			.attr("height", "100%")
			.style("border", "1px solid black");

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
			// Clean up the SVG to avoid memory leaks
			select("div#svg-container").selectAll("svg").remove();
		};
	}, [src]); // Dependency only on src to prevent unnecessary redraws

	useEffect(() => {
		const svg = select("div#svg-container").select("svg");

		// Drawing points
		svg
			.selectAll("circle")
			.data(points)
			.join("circle")
			.attr("cx", (d) => d[0])
			.attr("cy", (d) => d[1])
			.attr("r", 5)
			.attr("fill", "red");

		// Drawing polygon path
		if (points.length > 1) {
			svg
				.selectAll("path")
				.data([points])
				.join("path")
				.attr("d", line().curve(curveLinearClosed))
				.attr("fill", "none")
				.attr("stroke", "blue");
		}
	}, [points]);

	const handleSaveAnnotation = () => {
		if (points.length > 2 && annotationName.trim() !== "") {
			const newAnnotation = {
				name: annotationName,
				points: points,
			};
			setpolygon((prevpolygon) => [...prevpolygon, newAnnotation]);
			setPoints([]); // Clear current points
			setAnnotationName(""); // Reset the annotation name
		} else {
			alert(
				"Please enter a name for the annotation and ensure it has more than two points."
			);
		}
	};

	// function to reset the points
	const handleReset = () => {
		setPoints([]);

		const svg = select("div#svg-container").select("svg");
		svg.selectAll("circle").remove(); // Remove all circles
		svg.selectAll("path").remove(); // Remove all paths
	};

	return (
		<div>
			<div
				id="svg-container"
				style={{ width: "31.25em", height: "31.25em" }}
			></div>
			<input
				type="text"
				value={annotationName}
				onChange={(e) => setAnnotationName(e.target.value)}
				placeholder="Enter annotation name"
			/>
			<button onClick={handleSaveAnnotation}>Save Annotation</button>
			<button onClick={handleReset}>Reset</button>
			{polygon.map((polygon, index) => (
				<div key={index}>
					Annotation {index + 1} - {polygon.name}:{" "}
					{JSON.stringify(polygon.points)}
				</div>
			))}
		</div>
	);
};
