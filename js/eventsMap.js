class EventsMap {
  constructor(svg_element_id) {
    const height = 800;
    const width = 1300;
    const svg = d3.select('#' + svg_element_id)
      .append('svg')
      .attr('width', width)
      .attr('height', height)
      .attr('viewBox', '0 0 ' + width.toString() + ' '+ height.toString());

		// may be useful for calculating scales
		this.svg_width = width;
		this.svg_height = height;

    // Think about a better way to set this scale.
    const projection = d3.geoMercator()
      .rotate([0, 0])
      .scale(200)
      .translate([this.svg_width / 2, this.svg_height / 2])
      .precision(.1);

    const path = d3.geoPath()
      .projection(projection);

    const map_promise = d3.json('resources/countries-50m.json')
      .then((topojson_raw) => {
        const countries_paths = topojson.feature(
          topojson_raw,
          topojson_raw.objects.countries);
        return countries_paths.features;
    });

    // Add tooltip when hovering over events
    const tooltip = floatingTooltip('event_tooltip');

    const city_promise = d3.csv('resources/cities.csv');

    // Will add here promises for events locations as well.
    Promise.all([map_promise, city_promise]).then((results) => {
      let map_data = results[0];
      let cities_data = results[1];
      // Countries
      this.map_container = svg.append('g');
      this.map_container.selectAll('.country')
        .data(map_data)
        .enter()
        .append('path')
        .attr('d', path)
        .style('fill', '#793fae')
      // Cities
      this.map_container = svg.append('g');
      this.map_container.selectAll('circle')
        .data(cities_data)
        .enter()
        .append('circle')
        .attr('cx', function(d) {
          return projection([d.longitude, d.latitude])[0];
        })
        .attr('cy', function(d) {
          return projection([d.longitude, d.latitude])[1];
        })
        .attr('r', function(d) {
          return d.no_events * 2;
        })
        .style('fill', 'red')
        .style('stroke', 'gray')
        .style('stroke-width', 0.25)
        .style('opacity', 0.75)
        .on('mouseover', function(d) {
          var content = 
            '<span class="name">Name: </span>' + 
              '<span class="value">' + d.name + '</span><br/>' +
            '<span class="name">Number of events: </span>' + 
              '<span class="value">' + d.no_events.toString() + '</span><br/>';
          tooltip.showTooltip(content, d3.event);
        })
        .on('mouseout', function(d) {
          tooltip.hideTooltip();
        });
    });
  }
}

whenDocumentLoaded(() => {
  topbar('locations');
  const eventMap = new EventsMap('events-map');
});
