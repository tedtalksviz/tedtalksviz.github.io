document.write(`
    <link href="css/topbar.css" rel="stylesheet">
  <div id='topbar'>
    <div id='topbar-row'>
      <div class="tp-holder">
        <a id="home_link" href="/index.html" class="tp-column">
            HOME</a>
      </div>
      <div class="tp-holder">
        <a id="locations_link" href="/events_map.html" class="tp-column">
            LOCATIONS</a>
      </div>
      <div class="tp-holder">
        <a id="timeseries_link" href="/event_timeseries.html" class="tp-column">
            TIMESERIES</a>
      </div>
      <div class="tp-holder">
        <a id="speakers_link" href="/speakers.html" class="tp-column">
            SPEAKERS</a>
      </div>
      <div class="tp-holder">
        <a id="parallel_link" href="/parallel_coords.html" class="tp-column">
            CORRELATIONS</a>
      </div>
      <div class="tp-holder">
        <a id="network_link" href="/talk_network.html" class="tp-column">
            RELATED TALKS</a>
      </div>
      <div class="tp-holder">
        <a id="random_link" href="/random.html" class="tp-column">
            RANDOM TALK</a>
      </div>
    </div>
  </div>
`);

