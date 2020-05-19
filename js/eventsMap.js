class EventsMap {
  constructor(svg_element_id) {
    this.svg = d3.select('#' + svg_element_id);

		// may be useful for calculating scales
		const svg_viewbox = this.svg.node().viewBox.animVal;
		this.svg_width = svg_viewbox.width;
		this.svg_height = svg_viewbox.height;

    // Think about a better way to set this scale.
    const projection = d3.geoMercator()
      .rotate([0, 0])
      .scale(350)
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

    const city_promise = d3.csv('resources/cities.csv');

    // Will add here promises for events locations as well.
    Promise.all([map_promise, city_promise]).then((results) => {
      let map_data = results[0];
      let cities_data = results[1];
      // Countries
      this.map_container = this.svg.append('g');
      this.map_container.selectAll('.country')
        .data(map_data)
        .enter()
        .append('path')
        .classed('country', true)
        .attr('d', path)
        .style('fill', '#0000ff')
      // Cities
      this.map_container = this.svg.append('g');
      this.map_container.selectAll('cirlce')
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
        .append('title')
        .text(function(d) {
          return d.name;
        });
    });
  }
}

whenDocumentLoaded(() => {
  const eventMap = new EventsMap('event-map');
});
