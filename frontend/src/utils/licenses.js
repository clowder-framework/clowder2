import {V2} from "../openapi";

export async function fetchStandardLicenses() {
	try {
		return await V2.LicensesService.getStandardLicensesApiV2LicensesStandardLicensesAllGet();
	} catch (reason) {
		console.error("Failed to standard licenses option: ", reason);
		return {};
	}
}

export async function fetchStandardLicenseUrl(licenseId) {
	try {
		return await V2.LicensesService.getStandardLicenseUrlApiV2LicensesStandardLicensesLicenseIdGet(licenseId);
	} catch (reason) {
		console.error("Failed to fetch standard license url: ", reason);
		return {};
	}
}
