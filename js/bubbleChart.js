class BubbleChart {
  constructor(svg_element_id, data) {
    this.data = data;
    this.svg = d3.select('#' + svg_element_id);

    this.plot_area =  this.svg.append('svg')
                              .attr('viewBox','0 0 400 400') // this is magic ! define viewbox area of 400, use that same in pack size, and it scales to the viewPort perfectly!
                              .classed('bubblechart', true);

    const hierarchicalData = d3.hierarchy(this.data).sum(function(d) {return d.count}).sort((a,b) => -(a.value - b.value));
    const packLayout = d3.pack().size([400-5, 400-5]).padding(1);//.sort((a,b) => -(a.count - b.count));
    const root = packLayout(hierarchicalData);
    console.log(root.descendants())
    const mathMin = Math.min(...this.data.children.map(dict => {return dict.count}));
    const mathMax = Math.max(...this.data.children.map(dict => {return dict.count}));
    const color = d3.scaleSequential([mathMin, mathMax * 5], d3.interpolateRainbow);
               /**d3.scaleLinear()
                    .domain([mathMin, mathMax])
                    .range(['#FF7F7F', "#FF0000"]);*/

    const leaf = this.plot_area
                     .selectAll('g')
                     .data(root.descendants())
                     .join('g')
                        .attr('transform', d => `translate(${d.x}, ${d.y})`)
                     /**.transition()
                        .ease(easeLinear)
                        .duration(1000);*/
                      .classed('bubblechart_leaf', true);
    leaf
      .append('circle')
      .attr('r', d => d.r)
      .attr('fill-opacity', d => !d.data.children ? 0.8 : 0) // make everything but leafs transparent
      .attr('fill', function(d) {return color(d.value)});

  }
}

function successCallBack(data) {
  const ratingsData = []
  for ([key, value] of Object.entries(data)) {
    ratingsData.push({'name': key, 'count': value});
  }
  const bubbleChartData = {
    'name': 'parent',
    'children': ratingsData
  };
  const bubbleChart = new BubbleChart('single_var_content', bubbleChartData);
}

function failureCallback(error) {
  window.alert('Error in getting ted_main.csv' + error)
}

function whenDocumentLoaded(action) {
	if (document.readyState === 'loading') {
		document.addEventListener('DOMContentLoaded', action);
	} else {
		// `DOMContentLoaded` already fired
		action();
	}
}

whenDocumentLoaded(() => {
  const promise = d3.json('resources/ratings.json')
    .then(successCallBack, failureCallback);
});
