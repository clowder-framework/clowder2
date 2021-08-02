$(".configuration").ready(function(){
	//
	// // load helper to fetch src with apikey
	// var h = document.createElement("script");
	// h.type = "text/javascript";
	// h.src = "/public/clowder/assets/javascripts/previewers/helper.js";
	// $("#preview").append(h);

	// loop through each configuration
	$( ".configuration.audio" ).each(function() {
		var Configuration = $(this).data("configuration");

		(function ($, Configuration) {
			var useTab = Configuration.tab;
			var referenceUrl = Configuration.url;

			$(useTab).append(
				"<audio controls autoplay name='media'><source id='" + Configuration.fileid + "'></audio>"
			);
			$("#"+ Configuration.fileid).ready(() => {
				const src = referenceUrl;
				const options = {
					headers: {
						"X-API-Key": Configuration.APIKEY
					}
				};
				fetch(src, options)
				.then(res => res.blob())
				.then(blob => {
					$("#"+ Configuration.fileid).attr("src", URL.createObjectURL(blob));
				});
			});
			$("#" + Configuration.fileid).play();

		}(jQuery, Configuration));
	});

})
