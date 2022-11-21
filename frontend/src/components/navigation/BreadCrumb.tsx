import React from "react";
import Breadcrumbs from "@mui/material/Breadcrumbs";
import {Button} from "@mui/material";
import {useNavigate} from "react-router-dom";

type BreadCrumbProps = {
	paths: any
}
export const MainBreadcrumbs: React.FC<BreadCrumbProps> = (props:BreadCrumbProps) => {
	const { paths } = props;
	const history = useNavigate();

	return (
			<Breadcrumbs aria-label="breadcrumb">
				{
					paths.map((path:any, index:number) => {
							return (<Button key={index} onClick={() => history(path["url"])}>{path["name"]}
							</Button>);
					})
				}
			</Breadcrumbs>
	);
};
