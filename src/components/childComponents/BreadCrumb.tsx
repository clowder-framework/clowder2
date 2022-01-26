import React from "react";
import Typography from "@mui/material/Typography";
import Breadcrumbs from "@mui/material/Breadcrumbs";
import Link from "@mui/material/Link";
import {useNavigate} from "react-router-dom";

type BreadCrumbProps = {
	paths: any
}
export const MainBreadcrumbs: React.FC<BreadCrumbProps> = (props:BreadCrumbProps) => {
	const history = useNavigate();

	const { paths } = props;
	return (
		<div>
			<Breadcrumbs aria-label="breadcrumb">
				{
					paths.map((path:any, index:number) => {
						if (index !== paths.length -1){
							return (<Link underline="hover" color="inherit" key={index}
								onClick={() => {history(path["url"]);}}>{path["name"]}
							</Link>);
						}
						else{
							return (<Typography color="text.primary" key={index}>{path["name"]}</Typography>);
						}
					})
				}
			</Breadcrumbs>

		</div>
	);
};
