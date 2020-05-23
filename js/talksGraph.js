class TalksGraph {
  constructor(svg_element_id) {
    const svg = d3.select('#' + svg_element_id)
    const width = 1300;
    const height = 1000;
    const talks_promise = d3.csv('resources/ted_main.csv');
    const edges_promise = d3.tsv('resources/edges.tsv');
    const nodes_g = d3.select('#nodes');
    const edges_g = d3.select('#edges');

    Promise.all([talks_promise]).then((results) => {
      let talks = results[0];
      let data_edges = results[1];

      console.log(talks)
      const nodes = talks.map(function(d) {
        return {
          'id': parseInt(d.talk_id),
          'duration': d.duration,
          'speaker': d.main_speaker,
          'description': d.description,
          'title': d.title,
          'event': d.event
        }
      });

      // Add tooltip when hovering over nodes
      const tooltip = floatingTooltip('talk_tooltip', 250);
      svg.selectAll('circle')
        .on('mouseover', function(d) {
          // Hide other nodes
          svg.selectAll('circle').attr('fill-opacity', 0.5);
          this.setAttribute('fill-opacity', 1);
          let node_id = this.getAttribute('class').substring(3);
          svg.selectAll(".id_" + node_id.toString()).filter('path')
            .attr('stroke-width', 2);
          let details = nodes.find(node => node.id == node_id);
          var content = 
            '<div class="tooltip-text"><span class="name">Title: </span>' + 
              '<span class="value">' + details.title + '</span></div>' +
            '<div class="tooltip-text"><span class="name">Speaker: </span>' + 
              '<span class="value">' + details.speaker + '</span></div>' +
           '<div class="tooltip-text"><span class="name">Description: </span>' + 
              '<span class="value">' + details.description + '</span></div>' +
           '<div class="tooltip-text"><span class="name">Duration: </span>' + 
              '<span class="value">' + Math.floor(details.duration).toString() + 
              ' minutes </span></div>' +
           '<div class="tooltip-text"><span class="name">Event: </span>' + 
              '<span class="value">' + details.event + '</span></div>';
          tooltip.showTooltip(content, d3.event);
        }) 
        .on('mouseout', function(d) {
          tooltip.hideTooltip();
          svg.selectAll('circle').attr('fill-opacity', 1);
          let node_id = this.getAttribute('class').substring(3);
          svg.selectAll(".id_" + node_id.toString()).filter('path')
            .attr('stroke-width', 0.5);
        });

      svg.call(d3.zoom()
        .extent([[-1883, -2013], [4173, 4155]])
        .scaleExtent([1, 8])
        .on('zoom', function() {
          nodes_g.attr('transform', d3.event.transform);
          edges_g.attr('transform', d3.event.transform);
        }));
    });
  }

}

whenDocumentLoaded(() => {
  topbar('network');
  const talksGraph = new TalksGraph('talk_network');
});
