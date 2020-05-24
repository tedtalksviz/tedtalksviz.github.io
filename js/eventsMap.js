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

    // Add zoom to map (this handles dragging as well)
    const zooming = function(d) {
      var transform = [d3.event.transform.x, d3.event.transform.y];
      var newScale = d3.event.transform.k * 2000;
      projection
        .translate(transform)
        .scale(newScale);
      svg.selectAll('path').attr('d', path);
      svg.selectAll('circle')
        .attr('cx', function(d) {
          return projection([d.longitude, d.latitude])[0];
        })
        .attr('cy', function(d) {
          return projection([d.longitude, d.latitude])[1];
        });
    }
    const zoom = d3.zoom()
      .on('zoom', zooming);

    
    Promise.all([map_promise, city_promise]).then((results) => {
      let map_data = results[0];
      let cities_data = results[1];
      // Countries
      var center = projection([31, -7]);
      this.map_container = svg
        .append('g')
        .attr('id', 'map')
        .call(zoom)
        .call(zoom.transform, d3.zoomIdentity
            .translate(width/2, height/2)
            .scale(0.105)
            .translate(-center[0], -center[1]));
      this.map_container.append('rect')
        .attr('x', 0)
        .attr('y', 0)
        .attr('width', width)
        .attr('height', height)
        .attr('opacity', 0);
      this.map_container.selectAll('.country')
        .data(map_data)
        .enter()
        .append('path')
        .attr('d', path)
        //.style('fill', '#793fae')
        .style('fill', '#2a1740');
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
          return d.count * 2;
        })
        .style('fill', 'red')
        .style('stroke', 'gray')
        .style('stroke-width', 0.25)
        .style('opacity', 0.75)
        .on('mouseover', function(d) {
          var content = 
            '<span class="name">Name: </span>' + 
              '<span class="value">' + d.desc + '</span><br/>' +
            '<span class="name">Number of events: </span>' + 
              '<span class="value">' + d.count.toString() + '</span><br/>';
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
