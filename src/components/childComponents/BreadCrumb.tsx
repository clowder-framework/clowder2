import React from "react";
import Typography from "@mui/material/Typography";
import Breadcrumbs from "@mui/material/Breadcrumbs";
import {Button} from "@mui/material";

type BreadCrumbProps = {
	paths: any
}
export const MainBreadcrumbs: React.FC<BreadCrumbProps> = (props:BreadCrumbProps) => {
	const { paths } = props;
	return (
			<Breadcrumbs aria-label="breadcrumb">
				{
					paths.map((path:any, index:number) => {
						if (index !== paths.length -1){
							return (<Button key={index} href={path["url"]}>{path["name"]}
							</Button>);
						}
						else{
							return (<Typography color="text.primary" key={index}>{path["name"]}</Typography>);
						}
					})
				}
			</Breadcrumbs>
	);
};
