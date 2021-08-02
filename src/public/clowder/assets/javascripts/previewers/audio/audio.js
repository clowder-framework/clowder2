$(".configuration").ready(function() {
	// load helper to fetch image with apikey
	var h = document.createElement("script");
	h.type = "text/javascript";
	h.src = "/public/clowder/assets/javascripts/previewers/helper.js";
	$("#preview").append(h);

	// loop through each configuration
	$(".configuration.audio").each(function () {
		var Configuration = $(this).data("configuration");
		(function ($, Configuration) {
			var useTab = Configuration.tab;
			var referenceUrl = Configuration.url;

			$(useTab).append(
				"<audio controls><source id='"+ Configuration.fileid +"'></audio>"
			);
			requestSrc(Configuration.fileid, Configuration);

		}(jQuery, Configuration));
	});
});
