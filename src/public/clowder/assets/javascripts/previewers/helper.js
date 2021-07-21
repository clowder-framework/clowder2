// need to fetch img using APIKEY in the header
function requestImg(imgDivId, Configuration){
	$("#"+ imgDivId).ready(() => {
		const src = Configuration.url;
		const options = {
			headers: {
				"X-API-Key": Configuration.APIKEY
			}
		};
		fetch(src, options)
		.then(res => res.blob())
		.then(blob => {
			$("#"+ imgDivId).attr("src", URL.createObjectURL(blob));
		});
	});
}
