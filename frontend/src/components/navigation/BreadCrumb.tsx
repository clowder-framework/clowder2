import React from "react";
import Breadcrumbs from "@mui/material/Breadcrumbs";
import {Button, Link} from "@mui/material";
import {useNavigate} from "react-router-dom";

type BreadCrumbProps = {
	paths: any
}
export const MainBreadcrumbs: React.FC<BreadCrumbProps> = (props:BreadCrumbProps) => {
	const { paths } = props;
	const history = useNavigate();
	return (
			<Breadcrumbs aria-lab
						 el="breadcrumb">
				{
					paths.map((path:any, index:number) => {
							return (<Link component="button" style={{ textDecoration: "none"}} key={index} onClick={() => history(path["url"])}>{path["name"]}
							</Link>);
					})
				}
			</Breadcrumbs>
	);
};
