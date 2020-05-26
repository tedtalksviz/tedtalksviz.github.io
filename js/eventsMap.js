class EventsMap {
  constructor(svg_element_id) {
    const height = 800;
    const width = 1280;
    const svg = d3.select('#' + svg_element_id)
      .append('svg')
      .attr('width', width)
      .attr('height', height)
      .attr('viewBox', '0 0 ' + width.toString() + ' '+ height.toString())
      .attr('style', 'margin-left: 20px');

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
      var direction = d3.event.wheelData < 0 ? 'down' : 'up';
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
        })
        .attr('r', function(d) {
          return d.size * d3.event.transform.k * 10 / 2;
        });
    }
    const zoom = d3.zoom()
      .on('zoom', zooming);

    Promise.all([map_promise, city_promise]).then((results) => {
      let map_data = results[0];
      let cities_data = results[1];
      cities_data = cities_data.map(city => {
        var size = city.count;
        if (city.count < 10) {
          size = city.count * 4;
        } else {
          size = city.count * 2;
        }
        return {
          ...city,
          'size': size
        };
      }).sort(function(x, y) {
        return y.size - x.size;
      });
      // Countries
      this.map_container = svg
        .append('g')
        .attr('id', 'map');

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
          return d.size;
        })
        .style('fill', '#e62b1e')
        .style('stroke', 'gray')
        .style('stroke-width', 0.25)
        .style('opacity', 0.7)
        .on('mouseover', function(d) {
          var content =
            '<span class="name">Name: </span>' +
              '<span class="value">' + d.desc + '</span><br/>' +
            '<span class="name">Number of events: </span>' +
              '<span class="value">' + d.count.toString() + '</span><br/>';
          d3.select(this)
            .style('fill', '#e6e6ff')
            .style('stoke', 'white')
            .style('stroke-width', 1);
          tooltip.showTooltip(content, d3.event);
        })
        .on('mouseout', function(d) {
          tooltip.hideTooltip();
          d3.select(this)
            .style('fill', '#e62b1e')
            .style('stroke-width', 0.25)
            .style('stroke', 'gray');
        });
      d3.select('#map')
        .call(zoom)
        .call(zoom.transform, d3.zoomIdentity
          .translate(width/2-40, height/2+110)
          .scale(0.105));
      });
  }
}

whenDocumentLoaded(() => {
  topbar('locations');
  const eventMap = new EventsMap('events-map');
});
