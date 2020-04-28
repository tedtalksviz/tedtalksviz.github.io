Promise.all([
  d3.tsv('resources/edges.tsv'),
  d3.tsv('resources/nodes.tsv')
]).then(createTalksGraph);

function createTalksGraph(files) {
  links = files[0];
  nodes = files[1];

  const width = 800;
  const height = 400;
  const svg = d3.select("#talks-graph");
  svg.attr('width', width);
  svg.attr('height', height);

  const simulation = d3.forceSimulation()
      .nodes(nodes)
      .force("charge", function(d) {
        return +d.degree * 5;
      })
      .force("center", d3.forceCenter(width / 2, height / 2));
  
  // Draw circles for each node
  const nodeElements = svg.append('g')
    .selectAll('circle')
    .data(nodes)
    .enter().append('circle')
      .attr('r', 5)
      .attr('fill', '#FF0000');
  
  /* Adding text to nodes would complicate the layout
   * TODO: figure this out
   * const textElements = svg.append('g')
    .selectAll('text')
    .data(nodes)
    .enter().append('text')
      .text(node => node.title) */

  // Draw a line for each edge
  const linkElements = svg.append('g')
    .selectAll('line')
    .data(links)
    .enter().append('line')
      .attr('stroke-width', 1)
      .attr('stroke', '#E5E5E5');

  // Add links to our graph
  simulation.force('link', d3.forceLink(links)
    .id(function(d) { return d.id; })
    .distance(70));
  simulation.on('tick', () => {
    linkElements
      .attr('x1', link => link.source.x)
      .attr('x2', link => link.target.x)
      .attr('y1', link => link.source.y)
      .attr('y2', link => link.target.y)
    nodeElements
      .attr('cx', node => node.x)
      .attr('cy', node => node.y);
  });
}
