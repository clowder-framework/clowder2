import React from "react";
import Breadcrumbs from "@mui/material/Breadcrumbs";
import { Link } from "@mui/material";
import { useNavigate } from "react-router-dom";
import Typography from "@mui/material/Typography";

type BreadCrumbProps = {
	paths: any;
};
export const MainBreadcrumbs: React.FC<BreadCrumbProps> = (
	props: BreadCrumbProps
) => {
	const { paths } = props;
	const history = useNavigate();
	return (
		<Breadcrumbs>
			{paths.map((path: any, index: number) => {
				if (index === paths.length - 1) {
					return (
						<Typography key={index} color="text.primary">
							{path["name"]}
						</Typography>
					);
				} else {
					return (
						<Link
							component="button"
							style={{ textDecoration: "none" }}
							key={index}
							onClick={() => history(path["url"])}
						>
							{path["name"]}
						</Link>
					);
				}
			})}
		</Breadcrumbs>
	);
};
