class TalksGraph {
  constructor(svg_element_id) {
    const svg = d3.select('#' + svg_element_id)
    const width = 1300;
    const height = 1000;
    const talks_promise = d3.csv('resources/ted_main.csv');
    const nodes_g = d3.select('#nodes');
    const edges_g = d3.select('#edges');

    Promise.all([talks_promise]).then((results) => {
      let talks = results[0];
      let data_edges = results[1];

      const nodes = talks.map(function(d) {
        return {
          'id': parseInt(d.talk_id),
          'duration': d.duration,
          'speaker': d.main_speaker,
          'description': d.description,
          'title': d.title,
          'event': d.event,
          'related_talks': JSON.parse(d.related_talks),
          'url': d.url
        }
      });

      // Add tooltip when hovering over nodes
      const tooltip = floatingTooltip('talk_tooltip', 500);
      var last_mouse_event = null;
      var last_node_clicked = null;
      var highlight = function(element) {
        let node_id = element.getAttribute('class').substring(3);

        // Hide other nodes
        svg.selectAll('circle').attr('fill-opacity', 0.5);
        element.setAttribute('fill-opacity', 1);
        var related_talks_classes = 
          nodes.find(node => node.id == node_id).related_talks
          .map(id => { return '.id_' + id.toString(); })
          .join();
        svg.selectAll('circle')
          .filter(related_talks_classes)
          .attr('fill-opacity', 1);
        svg.selectAll('.id_' + node_id.toString()).filter('path')
          .attr('stroke-width', 2);

        let details = nodes.find(node => node.id == node_id);
        let cnt_words = details.description.split(" ").length;
        let description = details.description;
        if (cnt_words > 50) {
            description = details.description.split(" ").splice(0, 140).join(" ") + "...";
        }
        var content = 
          '<div class="tooltip-text"><span class="name">Title: </span>' + 
          '<span class="value">' + details.title + '</span></div>' +
          '<div class="tooltip-text"><span class="name">Speaker: </span>' + 
          '<span class="value">' + details.speaker + '</span></div>' +
          '<div class="tooltip-text"><span class="name">Description: </span>' + 
          '<span class="value">' + description + '</span></div>' +
          '<div class="tooltip-text"><span class="name">Duration: </span>' + 
          '<span class="value">' + Math.floor(details.duration).toString() + 
          ' minutes </span></div>' +
          '<div class="tooltip-text"><span class="name">Event: </span>' + 
          '<span class="value">' + details.event + '</span></div>';
        tooltip.showTooltip(content, d3.event);
      }
      // Search
      const input = d3.select('#search');
      input.on('keyup', function(d) {
        var str = this.value.toLowerCase();
        console.log(str);
        var possible_nodes = nodes.filter(node => 
          node.title.toLowerCase().includes(str));
        console.log(typeof possible_nodes);
        if (possible_nodes.length == 1) {
          var node_id = possible_nodes[0].id;
          const circle = document.querySelector(
            'circle.id_' + node_id.toString());
          console.log(circle);
          highlight(circle);
          last_mouse_event = 'click';
          last_node_clicked = circle;
        }
      });

      svg.on('click', function(d) {
        console.log(d3.event.target)
        if (d3.event.target instanceof SVGElement) {
          if (last_mouse_event == 'click') {
            tooltip.hideTooltip();
            svg.selectAll('circle').attr('fill-opacity', 1);
            let node_id = last_node_clicked.getAttribute('class').substring(3);
            svg.selectAll(".id_" + node_id.toString()).filter('path')
              .attr('stroke-width', 0.5);
            last_mouse_event = '';
            last_node_clicked = null;
          }
        }
      })
      svg.selectAll('circle')
        .on('mouseover', function(d) {
          if (last_mouse_event != 'click') {
            highlight(this);
            last_mouse_event = 'mouseover';
          }
        })
        .on('click', function(d) {
          d3.event.stopPropagation();
          if (last_mouse_event == 'click') {
            tooltip.hideTooltip();
            svg.selectAll('circle').attr('fill-opacity', 1);
            let node_id = last_node_clicked.getAttribute('class').substring(3);
            svg.selectAll(".id_" + node_id.toString()).filter('path')
              .attr('stroke-width', 0.5);
            highlight(this);
            last_mouse_event = 'click';
            last_node_clicked = this;
          } else {
            highlight(this);
            last_mouse_event = 'click';
            last_node_clicked = this;
          }
        })
        .on('mouseout', function(d) {
          if (last_mouse_event != 'click') {
            tooltip.hideTooltip();
            svg.selectAll('circle').attr('fill-opacity', 1);
            let node_id = this.getAttribute('class').substring(3);
            svg.selectAll(".id_" + node_id.toString()).filter('path')
              .attr('stroke-width', 0.5);
            last_mouse_event = 'mouseout';
          }
        })
        .on('dblclick', function(d) {
          let node_id = this.getAttribute('class').substring(3);
          let url = nodes.find(node => node.id == node_id).url;
          open(url);
          last_mouse_event = 'dblclick';
        });

      svg.call(d3.zoom()
        .extent([[-1883, -2013], [4173, 4155]])
        .scaleExtent([1, 8])
        .filter(function () {
          return d3.event.target instanceof SVGElement;
        })
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
