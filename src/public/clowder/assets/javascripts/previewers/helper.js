// need to fetch img using APIKEY in the header
function requestSrc(divID, url){
	$("#"+ divID).ready(() => {
		const src = url;
		const options = {
			headers: {
				"X-API-Key": Configuration.APIKEY
			}
		};
		fetch(src, options)
		.then(res => res.blob())
		.then(blob => {
			$("#"+ divID).attr("src", URL.createObjectURL(blob));
		});
	});
}
