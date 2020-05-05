function whenDocumentLoaded(action) {
	if (document.readyState === "loading") {
		document.addEventListener("DOMContentLoaded", action);
	} else {
		// `DOMContentLoaded` already fired
		action();
	}
}

class BubbleChart_Ratings {
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
                     .selectAll('circle')
                     .data(root.descendants())
                     .join('circle')
                      .attr("cx", d => 200 + Math.cos(Math.random() * 2*Math.PI) * d.x * 11)
                      .attr("cy", d => 200 + Math.sin(Math.random() * 2*Math.PI) * d.y * 11)
                      //.attr("cx", d => d.x)
                      //.attr("cy", d => d.y)
                      .attr('r', d => d.r)
                      .attr('fill-opacity', d => !d.data.children ? 0.8 : 0) // make everything but leafs transparent
                      .attr('fill', function(d) {return color(d.value)})
                      .classed('bubblechart_leaf', true)
                      .transition()
                        .ease(d3.easeCircle)
                        .duration(5000)
                        .attr("cx", d => d.x)
                        .attr("cy", d => d.y);

                      
                     /**.join('g')
                        .attr('transform', d => `translate(${d.x}, ${d.y})`)
                        .transition()
                        .ease(easeLinear)
                        .duration(1000);*/
                      
    /**leaf
      .append('circle')
      .attr('r', d => d.r)
      .attr('fill-opacity', d => !d.data.children ? 0.8 : 0) // make everything but leafs transparent
      .attr('fill', function(d) {return color(d.value)});*/
    

  }
}

whenDocumentLoaded(() => {
  const dict_bubbleChart_Ratings = {};
  const dict_bubbleChart_Speakers = {};
  const promise = d3.csv("resources/ted_main.csv", function(data, error) {
        
    /** JSON.parse() parses STRINGIFIED ratings back to an array of dictionaries. 
     * HOWEVER, in order to do that, all ' -chars must be converted to " -chars.
     * According to MDN documentation of JSON.parse(),
     * https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/JSON/parse,
     * it throws an error if the string contains ' -chars. */
    

    // !!! Initializing the data for RATINGS bubble chart
    const ratings_string_to_array = JSON.parse(data.ratings.replace(/'/g,'"')); // g in .replace implies globalness which means that all ' -chars must be changed. Otherwise only first match would be replaced.
    const dictItem = ratings_string_to_array[0]; // This is always one dictionary f.ex.  {id: 7, name: "Funny", count: 1234}
    //console.log(dictItem);
    /** Increments the number of counts for each dictionary key. */
    dict_bubbleChart_Ratings[dictItem.name] = ( dict_bubbleChart_Ratings[dictItem.name] || 0 ) + dictItem.count;
    //console.log(bubbleChartData);

    // !!! Initializing the data for SPEAKERS bubble chart
    //const speakers_string_to_array = JSON.parse(data.ratings.replace(/'/g,'"')); // g in .replace implies globalness which means that all ' -chars must be changed. Otherwise only first match would be replaced.
    //const dictItem = ratings_string_to_array[0]; // This is always one dictionary f.ex.  {id: 7, name: "Funny", count: 1234}
    console.log(data);

  });
  
  promise.then(successCallBack, failureCallback);

  function successCallBack() {
    const bubbleChartData = []
    for ([key, value] of Object.entries(dict_bubbleChart_Ratings)){
      bubbleChartData.push({'name': key, 'count': value});
    };
    const plot = new BubbleChart_Ratings('single_var_content', {'name': 'parent', 'children': bubbleChartData});
  };

  function failureCallback(error) {
    window.alert("Error in getting promise 'MainData' in bubblechart.js" + error)

  };


});
