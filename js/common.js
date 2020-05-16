function whenDocumentLoaded(action) {
	if (document.readyState === 'loading') {
		document.addEventListener('DOMContentLoaded', action);
	} else {
		// `DOMContentLoaded` already fired
		action();
	}
}

  document.write(`
    <link href="css/topbar.css" rel="stylesheet">
  <div id='topbar' class="w3-top">
    <div id='topbar-row'>
      <div class="tp-holder">
        <a href="/" class="tp-column">
            MOTIVATION</a>
      </div>
      <div class="tp-holder">
        <a href="/events_map.html" class="tp-column">
            LOCATIONS</a>
      </div>
      <div class="tp-holder">
        <a href="/event_timeseries.html" class="tp-column">
            TIMESERIES</a>
      </div>
      <div class="tp-holder">
        <a href="/ratings.html" class="tp-column">
            RATINGS</a>
      </div>
      <div class="tp-holder">
        <a href="/parallel_coords.html" class="tp-column">
            PARALLEL COORDINATES</a>
      </div>
      <div class="tp-holder">
        <a href="/talk_network.html" class="tp-column">
            RELATED TALKS</a>
      </div>
      <div class="tp-holder">
        <a href="/end.html" class="tp-column">
            END</a>
      </div>
    </div>
  </div>
`);



whenDocumentLoaded(() => {


});
