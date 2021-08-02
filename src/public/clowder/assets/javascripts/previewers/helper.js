// need to fetch img using APIKEY in the header
function requestSrc(id, Configuration){
	$("#"+ id).ready(() => {
		const src = Configuration.url;
		const options = {
			headers: {
				"X-API-Key": Configuration.APIKEY
			}
		};
		fetch(src, options)
		.then(res => res.blob())
		.then(blob => {
			$("#"+ id).attr("src", URL.createObjectURL(blob));
		});
	});
}
