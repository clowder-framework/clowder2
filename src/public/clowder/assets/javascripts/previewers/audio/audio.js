$(".configuration").ready(function() {
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
