class TalksGraph {
  constructor(svg_element_id) {
    const svg = d3.select('#' + svg_element_id)
    const width = 1300;
    const height = 1000;
    const network_promise = d3.json('resources/network.json');

    Promise.all([network_promise]).then((results) => {
      let graph = results[0];

      const nodes = graph.nodes.map(function(d) {
        return {
          'id': parseInt(d.id),
          'x': d.x,
          'y': d.y,
          'r': d.size,
          'duration': d.attributes.duration,
          'speaker': d.attributes.main_speaker,
          'description': d.attributes.description,
          'title': d.attributes.title,
          'event': d.attributes.event
        }
      });

      // Add tooltip when hovering over nodes
      const tooltip = floatingTooltip('talk_tooltip', 100);
      svg.selectAll('circle')
        .on('mouseover', function(d) {
          let node_id = this.getAttribute('class').substring(3);
          let details = nodes.find(node => node.id == node_id);
          var content = 
            '<span class="name">Title: </span>' + 
              '<span class="value">' + details.title + '</span><br/>' +
            '<span class="name">Speaker: </span>' + 
              '<span class="value">' + details.speaker + '</span><br/>' +
           '<span class="name">Description: </span>' + 
              '<span class="value">' + details.description + '</span><br/>' +
           '<span class="name">Duration: </span>' + 
              '<span class="value">' + Math.floor(details.duration).toString() + 
              ' minutes </span><br/>' +
           '<span class="name">Event: </span>' + 
              '<span class="value">' + details.event + '</span><br/>';
          tooltip.showTooltip(content, d3.event);
        }) 
        .on('mouseout', function(d) {
          tooltip.hideTooltip();
        });

      // Add zoom 
      console.log(svg);
      svg.call(d3.zoom()
        .extent([[-1883, -2013], [4173, 4155]])
        .scaleExtent([1, 8])
        .on('zoom', function() {
          svg.attr('transform', d3.event.transform);
        }));
    });
  }
}

whenDocumentLoaded(() => {
  topbar('network');
  const talksGraph = new TalksGraph('talk_network');
});
