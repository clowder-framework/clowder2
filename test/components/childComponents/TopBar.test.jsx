import React from "react";
import {render} from "@testing-library/react";

import TobBar from "../../../src/components/navigation/TopBar";

describe("Top Bar should", () => {

	test("initialize with four links", async () => {
		const { container } = render(<TobBar />);
		expect(container.querySelectorAll("a").length).toEqual(4);
	});
});
