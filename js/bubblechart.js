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
    //console.log(hierarchicalData)
    const packLayout = d3.pack().size([400-5, 400-5]).padding(1);//.sort((a,b) => -(a.count - b.count));
    const root = packLayout(hierarchicalData);
    //console.log(root.descendants())
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
                      // FOR TRANSITION .attr("cx", d => 200 + Math.cos(Math.random() * 2*Math.PI) * d.x * 11)
                      // FOR TRANSITION .attr("cy", d => 200 + Math.sin(Math.random() * 2*Math.PI) * d.y * 11)
                      .attr("cx", d => d.x)
                      .attr("cy", d => d.y)
                      .attr('r', d => d.r)
                      .attr('fill-opacity', d => !d.data.children ? 1 : 0) // make everything but leafs transparent
                      .attr('fill', function(d) {return color(d.value)})
                      .classed('bubblechart_leaf', true);
                      /** MAKES SMOOTH TRANSITION, BUT IS BETTER WITHOUT (FOR NOW AT LEAST)
                       * .transition()
                       * .ease(d3.easeCircle)
                       * .duration(5000)
                       * .attr("cx", d => d.x)
                       * .attr("cy", d => d.y);
                       */

                      
    /**leaf
      .append('circle')
      .attr('r', d => d.r)
      .attr('fill-opacity', d => !d.data.children ? 0.8 : 0) // make everything but leafs transparent
      .attr('fill', function(d) {return color(d.value)});*/
    

  }
}

class BubbleChart_Speakers {

  }

  

whenDocumentLoaded(() => {
  const dict_bubbleChart_Ratings = {};
  const speakers_bubbleChartData = [];
  let dates = new Set();
  const promise = d3.csv("resources/ted_main.csv", function(data, error) {
        
    /** JSON.parse() parses STRINGIFIED ratings back to an array of dictionaries. 
     * HOWEVER, in order to do that, all ' -chars must be converted to " -chars.
     * According to MDN documentation of JSON.parse(),
     * https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/JSON/parse,
     * it throws an error if the string contains ' -chars. */
    console.log(data);
    //if dates is DICT:
    //dates[new Date(data.film_date).getFullYear()] = (dates[new Date(data.film_date).getFullYear()] || 0) + 1;
    dates.add(new Date(data.film_date).getFullYear())
    // !!! Initializing the data for RATINGS bubble chart
    const ratings_string_to_array = JSON.parse(data.ratings.replace(/'/g,'"')); // g in .replace implies globalness which means that all ' -chars must be changed. Otherwise only first match would be replaced.
    const dictItem = ratings_string_to_array[0]; // This is always one dictionary f.ex.  {id: 7, name: "Funny", count: 1234}
    //console.log(dictItem);
    /** Increments the number of counts for each dictionary key. */
    dict_bubbleChart_Ratings[dictItem.name] = ( dict_bubbleChart_Ratings[dictItem.name] || 0 ) + dictItem.count;
    //console.log(dict_bubbleChart_Ratings);
  });

  promise.then(successCallBack_ratings, failureCallback);

  function successCallBack_ratings() {
    const bubbleChartData = []
    console.log(Array.from(dates).sort());
    for ([key, value] of Object.entries(dict_bubbleChart_Ratings)){
      bubbleChartData.push({'name': key, 'count': value});
    };
    //console.log(bubbleChartData);
    const plot = new BubbleChart_Ratings('single_var_content_2', {'name': 'parent', 'children': bubbleChartData});
  };
  
  const promise_speakers = d3.csv("resources/speaker.csv", function(data, error) {
        
    /** JSON.parse() parses STRINGIFIED ratings back to an array of dictionaries. 
     * HOWEVER, in order to do that, all ' -chars must be converted to " -chars.
     * According to MDN documentation of JSON.parse(),
     * https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/JSON/parse,
     * it throws an error if the string contains ' -chars. */
    
    /**
    // !!! Initializing the data for RATINGS bubble chart
    const ratings_string_to_array = JSON.parse(data.ratings.replace(/'/g,'"')); // g in .replace implies globalness which means that all ' -chars must be changed. Otherwise only first match would be replaced.
    const dictItem = ratings_string_to_array[0]; // This is always one dictionary f.ex.  {id: 7, name: "Funny", count: 1234}
    //console.log(dictItem);  */
    /** Increments the number of counts for each dictionary key. */
    /** dict_bubbleChart_Ratings[dictItem.name] = ( dict_bubbleChart_Ratings[dictItem.name] || 0 ) + dictItem.count;
    //console.log(bubbleChartData);
    */
    // !!! Initializing the data for SPEAKERS bubble chart
    const talks_string_to_array = JSON.parse(data.talks); // g in .replace implies globalness which means that all ' -chars must be changed. Otherwise only first match would be replaced.
    data.talks = talks_string_to_array;
    data.speaker = data.speaker.trim();
    data.avg_views = Number(data.avg_views);
    data.cnt_talks = Number(data.cnt_talks);
    data.speaker_id = Number(data.speaker_id);
    
    speakers_bubbleChartData.push(data)

    //console.log(data);
  });
  
  promise_speakers.then(successCallBack_speakers, failureCallback);

  function successCallBack_speakers() {
    /**const bubbleChartData = []
    for ([key, value] of Object.entries(dict_bubbleChart_Ratings)){
      bubbleChartData.push({'name': key, 'count': value});
    };*/
    console.log(speakers_bubbleChartData);
    const plot = new BubbleChart_Speakers('single_var_content_1', {'children': speakers_bubbleChartData});
  };

  function failureCallback(error) {
    window.alert("Error in getting promise in bubblechart.js" + error)

  };

});
