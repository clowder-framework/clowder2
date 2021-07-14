import React from "react";
import {Route, Switch} from "react-router-dom";

import Introduction from "./containers/Introduction";
import StepTmpInfo from "./containers/StepTmpInfo";
import TeamLeader from "./containers/TeamLeader";
import AnticipatedPerformance from "./containers/AnticipatedPerformance";
import CommunityHazards from "./containers/CommunityHazards";
import BuiltEnvironment from "./containers/BuiltEnvironment";
import Login from "./containers/Login";
import {NotFound} from "./containers/NotFound";


export default (
	<Switch>
		<Route exact path="/" render={() => {
			sessionStorage.setItem("menu", "0");
			return (<Introduction menu={"0"}/>);
		}}/>
		<Route path="/create-team" render={() => {
			sessionStorage.setItem("menu", "1");
			return (<Introduction menu={"1"}/>);
		}}/>
		<Route path="/create-team-leader" render={() => {
			sessionStorage.setItem("menu", "1-1");
			return (<TeamLeader/>);
		}}/>
		<Route path="/create-team-member" render={() => {
			sessionStorage.setItem("menu", "1-2");
			return (<StepTmpInfo menu={"1-2"}/>);
		}}/>
		<Route path="/create-team-scope" render={() => {
			sessionStorage.setItem("menu", "1-3");
			return (<StepTmpInfo menu={"1-3"}/>);
		}}/>
		<Route path="/create-team-stakeholder" render={() => {
			sessionStorage.setItem("menu", "1-4");
			return (<StepTmpInfo menu={"1-4"}/>);
		}}/>
		<Route path="/community" render={() => {
			sessionStorage.setItem("menu", "2");
			return (<Introduction menu={"2"}/>);
		}}/>
		<Route path="/community-plan" render={() => {
			sessionStorage.setItem("menu", "2-1");
			return (<StepTmpInfo menu={"2-1"}/>);
		}}/>
		<Route path="/community-member" render={() => {
			sessionStorage.setItem("menu", "2-2");
			return (<StepTmpInfo menu={"2-2"}/>);
		}}/>
		<Route path="/community-function" render={() => {
			sessionStorage.setItem("menu", "2-3");
			return (<StepTmpInfo menu={"2-3"}/>);
		}}/>
		<Route path="/community-environment" render={() => {
			sessionStorage.setItem("menu", "2-4");
			return (<BuiltEnvironment/>);
		}}/>
		<Route path="/community-link" render={() => {
			sessionStorage.setItem("menu", "2-5");
			return (<StepTmpInfo menu={"2-5"}/>);
		}}/>
		<Route path="/goal-objective" render={() => {
			sessionStorage.setItem("menu", "3");
			return (<Introduction menu={"3"}/>);
		}}/>
		<Route path="/goal-objective-long" render={() => {
			sessionStorage.setItem("menu", "3-1");
			return (<StepTmpInfo menu={"3-1"}/>);
		}}/>
		<Route path="/goal-objective-desired" render={() => {
			sessionStorage.setItem("menu", "3-2");
			return (<StepTmpInfo menu={"3-2"}/>);
		}}/>
		<Route path="/goal-objective-hazard" render={() => {
			sessionStorage.setItem("menu", "3-3");
			return (<CommunityHazards/>);
		}}/>
		<Route path="/goal-objective-performance" render={() => {
			sessionStorage.setItem("menu", "3-4");
			return (<AnticipatedPerformance/>);
		}}/>
		<Route path="/goal-objective-result" render={() => {
			sessionStorage.setItem("menu", "3-5");
			return (<StepTmpInfo menu={"3-5"}/>);
		}}/>
		<Route path="/plan-development" render={() => {
			sessionStorage.setItem("menu", "4");
			return (<Introduction menu={"4"}/>);
		}}/>
		<Route path="/plan-development-gap" render={() => {
			sessionStorage.setItem("menu", "4-1");
			return (<StepTmpInfo menu={"4-1"}/>);
		}}/>
		<Route path="/plan-development-solution" render={() => {
			sessionStorage.setItem("menu", "4-2");
			return (<StepTmpInfo menu={"4-2"}/>);
		}}/>
		<Route path="/plan-development-strategy" render={() => {
			sessionStorage.setItem("menu", "4-3");
			return (<StepTmpInfo menu={"4-3"}/>);
		}}/>
		<Route path="/review" render={() => {
			sessionStorage.setItem("menu", "5");
			return (<Introduction menu={"5"}/>);
		}}/>
		<Route path="/review-strategy" render={() => {
			sessionStorage.setItem("menu", "5-1");
			return (<StepTmpInfo menu={"5-1"}/>);
		}}/>
		<Route path="/review-approval" render={() => {
			sessionStorage.setItem("menu", "5-2");
			return (<StepTmpInfo menu={"5-2"}/>);
		}}/>
		<Route path="/review-final" render={() => {
			sessionStorage.setItem("menu", "5-3");
			return (<StepTmpInfo menu={"5-3"}/>);
		}}/>
		<Route path="/implementation" render={() => {
			sessionStorage.setItem("menu", "6");
			return (<Introduction menu={"6"}/>);
		}}/>
		<Route path="/implementation-execute" render={() => {
			sessionStorage.setItem("menu", "6-1");
			return (<StepTmpInfo menu={"6-1"}/>);
		}}/>
		<Route path="/implementation-update" render={() => {
			sessionStorage.setItem("menu", "6-2");
			return (<StepTmpInfo menu={"6-2"}/>);
		}}/>
		<Route path="/implementation-modify" render={() => {
			sessionStorage.setItem("menu", "6-3");
			return (<StepTmpInfo menu={"6-3"}/>);
		}}/>
		<Route path="/login" component={Login} />
		<Route path="*" component={NotFound}/>
	</Switch>
);
