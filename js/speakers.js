function createBubbleChart() {
  // Sizing
  const margin = {right: 50, left: 50};
  const width = 1200;
  const height = 600;
  // Tooltip object for mouseover functionality, width 350
  const tooltip = floatingTooltip('speakers_tooltip', 350);
  // Center of the graph. This is used for bubbles' forces
  const center = { x : width / 2, y : height / 2 };
  // These will be set later in the functions
  var svg = null;
  var bubbles = null;
  var bubblesRawData = null;
  var bubbleNodes = [];
  // Min and max values of avg_views
  var minAmount = null;
  var maxAmount = null;
  // For coloring the bubbles
  var fillColor = null;
  // For labels and grouping in year mode
  var array_dateYear = [];
  var dateYear_length = null;
  var yearCenters = {};
  var yearsTitleX = {};
  // For scaling bubbles and xAxis to avg_number view
  var xScale = null;
  // For scaling bubbles and xAxis to talks view
  var xScaleTalks = null;
  // Strength to apply to the position forces
  const forceStrength = 0.05;
  // Force simulation basis. Will be changed later when viewing mode changes
  const simulation = d3.forceSimulation()
      .velocityDecay(0.3)
      .force('x', d3.forceX().strength(forceStrength).x(center.x))
      .force('y', d3.forceY().strength(forceStrength).y(center.y))
      .force('charge', d3.forceManyBody().strength(d =>
        charge(d, forceStrength)).distanceMax(10))
      .force('collide', d3.forceCollide()
        .radius(d => d.radius).strength(1.2).iterations(4))
      .on('tick', ticked);
  // Force starts up automatically,
  // which we don't want as there aren't any nodes yet.
  simulation.stop();

  function getFillColorScale(data) {
      const minNofTalks = d3.min(data, function(d) { return d.nof_talks})
      const maxNofTalks = d3.max(data, function(d) { return d.nof_talks})
      return d3.scaleSequential([minNofTalks, maxNofTalks], d3.interpolateRgbBasis(['#8439a2','#e62b1e']));
  }

  function updateMin(data) {
      return d3.min(data, function(d) {return +d.avg_views});
  }

  function updateMax(data) {
      return d3.max(data, function(d) {return +d.avg_views});
  }

  function createNodes(rawData) {
      var dataLength = rawData.length
      // Sizes bubbles based on area.
      var radiusScale = d3.scalePow()
        .exponent(0.5)
        .range([1, 20])
        .domain([0, maxAmount]);

      var myNodes = rawData.map(function (d) {
          return {
                  id: +d.speaker_id,      // + makes sure it's a number
                  radius: radiusScale(+d.total_views),
                  value: +(+d.avg_views).toFixed(0),
                  total: +d.total_views,
                  name: d.speaker.trim(),
                  occupation: d.speaker_occupation,
                  nof_talks: +d.nof_talks,
                  year: +d.film_date,
                  talks: JSON.parse(d.talks),
                  scaledValue: xScale(+d.avg_views), // for avg_views graph
                  scaledTalks: xScaleTalks((+d.nof_talks)),
                  x: Math.random() * width, // random places to start
                  y: Math.random() * height,  // random places to start
          };
      });
      return myNodes;
  }


  function setYears(rawData) {
      //Get speech years from raw data
      //console.log("set years");
      //console.log(rawData);
      const set_dateYear = new Set();
      rawData.forEach( (entry) => {
        set_dateYear.add(+entry.film_date)
      });

      array_dateYear = Array.from(set_dateYear).sort()  // In the end sorted array: [1972, 1983, 1984,..., 2017]
      dateYear_length = 13 // WAS BEFORE array_dateYear.length;
      /**
       * Calculate center of each year column in x-dimension and add the value to yearCenter dict.
       * Center of the force is always in the middle of graph in y-dimension.
       * End result is somewhat
       * { 1972: {x: 19.583333333333332, y: 300},
       *   1983: {x: 58.75, y: 300},
       *   1984: {x: 97.91666666666666, y: 300},
       *   1990: {x: 137.08333333333334, y: 300},
       *   ...,
       *   2017: {x: 920.4166666666667, y: 300}
       * } with width 940.
      */
      yearCenters = {};
      array_dateYear.forEach( (year, index) => {
          // WAS BEFORE
          // yearCenters[year] = { x: (index / dateYear_length) * width  + 1 / ( dateYear_length * 2 ) * width, y: height / 2}
          // BUT SINCE 1972-2005 IS BEING GROUPED TOGETHER
          if (year < 2006) {
              yearCenters[year] = { x: 1 / ( dateYear_length * 2 ) * width, y: height / 2}
          } else {
              yearCenters[year] = { x: (Math.abs(2005 - year) / dateYear_length) * width
              + 1 / ( dateYear_length * 2 ) * width,
              y: height / 2}
          }
      });

      /**
       * X locations of the year titles. Same thing, but y-dimension is being left out i.e., dict is being simplified.
       * End result is somewhat
       * { 1972: 19.583333333333332,
       *   1983: 58.75,
       *   1984: 97.91666666666666,
       *   1990: 137.08333333333334,
       *   ...
       * } with width 940.
       */
      yearsTitleX = {};
      array_dateYear = array_dateYear.slice(11);
      //console.log(array_dateYear);
      array_dateYear.forEach( (year, index) => {
          // Experimentally tested values
          if(year == 2005) { yearsTitleX["1972-2005"] = 1 / ( dateYear_length * 2 ) * width }
          else { yearsTitleX[year] =
            (Math.abs(2005 - year) / dateYear_length) * width
            + 1 / ( dateYear_length * 2 ) * width }
      });
  }

function setScale() {
    xScale = d3.scaleLog()
    .domain([minAmount, maxAmount])
    .range([0+margin.left, width-margin.right]);
    xScaleTalks = d3.scaleLog()
    .domain([1, 9])
    .range([0+margin.left*4, width-margin.right]);
  }

  /* Creates the repulsion between nodes.
  *  Charge is proportional to the diameter of the
  *  circle (which is stored in the radius attribute
  *  of the circle's associated data.
  *  Charge is negative because we want nodes to repel.
  */
  function charge(d, strength) {
      return -Math.pow(d.radius, 2) *strength;
  }

  /*
  * Main entry point to the bubble chart. This function is returned
  * by the parent closure. It prepares the rawData for visualization
  * and adds an svg element to the provided selector and starts the
  * visualization creation process.
  *
  * selector is expected to be a DOM element or CSS selector that
  * points to the parent element of the bubble chart. Inside this
  * element, the code will add the SVG continer for the visualization.
  *
  * rawData is expected to be an array of data objects as provided by
  * a d3 loading function like d3.csv.
  */
  var bubbleChart = function bubbleChart(selector, rawData) {
      // Update values
      bubblesRawData = rawData;
      minAmount = updateMin(rawData);
      maxAmount = updateMax(rawData);
      fillColor = getFillColorScale(rawData);
      setYears(rawData);
      //console.log(rawData);
      //convert raw data into nodes data
      setScale()
      const value = document.getElementById("bubblechart_slider").value
      bubbleNodes = createNodes(rawData).slice(0, value);

      // Create an SVG element inside the provided selector
      // with desired size.
      svg = d3.select(selector)
              .append('svg')
              .attr('width', width)
              .attr('height', height);

      // Add year headers to the chart immetiadely. Initialize opacity to 0.
      // Later function showYearTitles() will change the opacity to make titles appear.
      var yearsData = d3.keys(yearsTitleX);
      var years = svg.selectAll('.year')
                      .data(yearsData);

      years.enter().append('text')
              .attr('class', 'year')
              .attr('x', function (d) { return yearsTitleX[d]; })
              .attr('y', 40)
              .attr('fill-opacity', 0)            // initialize titles to be invisible
              .attr('text-anchor', 'middle')
              .text(function (d) { return d; });


      // Bind nodes data to what will become DOM elements to represent them.
      bubbles = svg.selectAll('.bubble')
                      .data(bubbleNodes, function (d) { return d.id; }); // id is distinct

      // Create new circle elements each with class `bubble`.
      // There will be one circle.bubble for each object in the nodes array.
      // Initially, their radius (r attribute) will be 0.
      // @v4 Selections are immutable, so lets capture the
      //  enter selection to apply our transtition to below.
      var bubblesE = bubbles.enter().append('circle')
        .classed('bubble', true)
        .attr('r', 0)         // set r to 0 in the beginning. It will be transformed to right size during transition
        .attr('fill', function (d) { return fillColor(d.nof_talks); })
        .attr('stroke', function (d) { return d3.rgb(fillColor(d.nof_talks)).darker(); })
        .attr('stroke-width', 2)
        .on('mouseover', showDetail)
        .on('mouseout', hideDetail);

      // Merge the original empty selection and the enter selection
      bubbles = bubbles.merge(bubblesE);

      // Fancy transition to make bubbles appear, ending with the
      // correct radius
      bubbles.transition()
              .duration(3000)
              .attr('r', function (d) { return d.radius; });

      // Set the simulation's nodes to our newly created nodes array.
      // @v4 Once we set the nodes, the simulation will start running automatically!
      simulation.nodes(bubbleNodes);


      // Set initial layout to a single group of bubbles.
      groupBubbles();
  };

  /*
  * Callback function that is called after every tick of the
  * force simulation.
  * Here we do the acutal repositioning of the SVG circles
  * based on the current x and y values of their bound node data.
  * These x and y values are modified by the force simulation.
  */
  function ticked() {
      bubbles
      .attr('cx', function (d) { return d.x; })
      .attr('cy', function (d) { return d.y; });
  }

  /*
  * Provides an x value for each node to be used with the split by year
  * x force.
  */
  function nodeYearPos(d) {
      return yearCenters[d.year].x;
  }

  function nodeViewsPos(d) {
    return d.scaledValue;
  }

  function nodeTalksPos(d) {
    return d.scaledTalks;
  }

  /*
  * Sets visualization in "single group mode".
  * The year labels are hidden and the force layout
  * tick function is set to move all nodes to the
  * center of the visualization.
  */
  function groupBubbles() {
      hideYearTitles();
      hideXAxis();

      // Reset the 'x' force to draw the bubbles to the center.
      simulation.force('x', d3.forceX().strength(forceStrength).x(center.x));
      simulation.force('y', d3.forceY().strength(forceStrength).y(center.y));
      simulation.force('charge', d3.forceManyBody().strength(d =>
        charge(d, forceStrength)));

      // We can reset the alpha value and restart the simulation
      simulation.velocityDecay(0.3).alphaDecay(0).alpha(1).restart();
  }

  /*
  * Sets visualization in "split by year mode".
  * The year labels are shown and the force layout
  * tick function is set to move nodes to the
  * yearCenter of their data's year.
  */
  function splitBubblesYear() {
      showYearTitles();
      hideXAxis();

      //Reset the 'x' force to draw the bubbles to their year centers
      simulation.force('y', d3.forceY().strength(0.1).y(center.y));

      simulation.force('x', d3.forceX().strength(5).x(nodeYearPos));
      simulation.force('charge', d3.forceManyBody().strength(d =>
        charge(d, 0.1)));
      //We can reset the alpha value and restart the simulation
      simulation.velocityDecay(0.6).alphaDecay(0.02).alpha(0.1).restart();
  }

  function splitBubblesViews() {
    hideYearTitles();
    hideXAxis();
    showViewsXAxis();

    //Reset the 'x' force to draw the bubbles to their views centers
    simulation.force('y', d3.forceY().strength(d => 0.04 + 0.5*Math.pow((nodeViewsPos(d) - center.x) / 1000, 2)).y(center.y));

    simulation.force('x', d3.forceX().strength(3).x(nodeViewsPos));
    simulation.force('charge', d3.forceManyBody().strength(d =>
      charge(d, forceStrength)).distanceMax(10));
    //We can reset the alpha value and restart the simulation
    simulation.velocityDecay(0.8).alphaDecay(0.05).alpha(0.5).restart();
  }

  function splitBubblesTalks() {
    hideYearTitles();
    hideXAxis();
    showTalksXAxis();

    //Reset the 'x' force to draw the bubbles to their views centers
    simulation.force('y', d3.forceY().strength(d => 0.03*2*d.nof_talks).y(center.y));

    simulation.force('x', d3.forceX().strength(0.3).x(nodeTalksPos));
    simulation.force('charge', d3.forceManyBody().strength(d =>
      charge(d, forceStrength)).distanceMax(10));
    //We can reset the alpha value and restart the simulation
    simulation.velocityDecay(0.3).alphaDecay(0.05).alpha(0.3).restart();
  }

  /*
  * Hides Year title displays.
  */
  function hideYearTitles() {
    var titles=  svg
          .selectAll('.year')
          .transition().duration(1000)
          .attr('fill-opacity', 0);
    titles.remove();

  }

  /*
  * Shows Year title displays.
  */
  function showYearTitles() {
    var yearsData = d3.keys(yearsTitleX);
    var years = svg.selectAll('.year')
      .data(yearsData);

    years.enter().append('text')
      .attr('fill-opacity', 0)
      .attr('class', 'year')
      .attr('x', function (d) { return yearsTitleX[d]; })
      .attr('y', 40)
      .attr('text-anchor', 'middle')
      .text(function (d) { return d; })
        .transition()
        .duration(1500)
        .attr('fill-opacity', 1);
  }

  /*
  * Shows Views axes.
  */
  function showViewsXAxis() {
    var xAxis = svg.append('g')
      .classed('bubblechart_xAxis', true)
      .attr('fill-opacity', 0.7)
      .attr('transform', 'translate(0, '+height/2+')')
      .call(d3.axisBottom(xScale).ticks(12, ".0s"));
    xAxis.selectAll(".tick text")
      .attr('transform', 'rotate(-45), translate(-10, -1)');
  }

  //Removes views axis from svg
  function hideXAxis() {
    svg.selectAll('.bubblechart_xAxis').remove();
  }

  /*
  * Shows Talks axes.
  */
 function showTalksXAxis() {
  var xAxis = svg.append('g')
    .classed('bubblechart_xAxis', true)
    .attr('fill-opacity', 0.7)
    .attr('transform', 'translate(0, '+height/2+')')
    .call(d3.axisBottom(xScaleTalks).ticks(9, "d"));
}

  /*
  * Function called on mouseover to display the
  * details of a bubble in the tooltip.
  */
  function showDetail(d) {
    // change outline to indicate hover state.
    d3.select(this).attr('fill', 'black')
      .attr('stroke', 'black');

    var content =
    '<span class="name">Name: </span><span class="value">'+ d.name +
    '</span><br/>' +
    '<span class="name">Talks: </span><span class="value">'
    + d.nof_talks.toString() +
    '</span><br/>' +
    '<span class="name">Total views: </span><span class="value">' + d.total.toLocaleString() +
    '</span><br/>' +
    '<span class="name">Average views: </span><span class="value">' + d.value.toLocaleString() +
    '</span><br/>' +
    '<span class="name">Year of first appearance: </span><span class="value">' + d.year.toString() +
    '</span>';

    tooltip.showTooltip(content, d3.event);
  }

  /*
  * Hides tooltip
  */
  function hideDetail(d) {
      // reset outline
      d3.select(this).attr('fill', fillColor(d.nof_talks))
        .attr('stroke', d3.rgb(fillColor(d.nof_talks)).darker());

      tooltip.hideTooltip();
  }


  /*
  * Externally accessible function (this is attached to the
  * returned chart function). Allows the visualization to toggle
  * between "single group" and "split by year" modes.
  *
  * displayName is expected to be a string and either 'year' or 'all'.
  */
  bubbleChart.toggleDisplay = function (displayName) {
      if (displayName === 'year') {
      splitBubblesYear();
      } else if(displayName === 'all'){
      groupBubbles();
      } else if(displayName === 'views'){
        splitBubblesViews();
      } else splitBubblesTalks();
  };

  bubbleChart.mouseUpEvent = function() {
    const slider = document.getElementById("bubblechart_slider")
    svg
      .selectAll('.bubblechart_slider_value')
      .transition().duration(500)
        .style('opacity', 0)
        .on('end', function() {this.remove()}); // mouseUpEvent is called by event listener, so calling function is 'mouseup', so 'this' is pointing to the element which triggers the 'mouseup' event.
    bubbles = svg
      .selectAll('.bubble')
      .data([])
        .exit().remove();
    bubbleNodes = createNodes(bubblesRawData.slice(0, slider.value));
    bubbles = svg
      .selectAll('.bubble')
      .attr('r', 0)
      .data(bubbleNodes, function (d) { return d.id; });
    bubblesE = bubbles
      .enter()
        .append('circle')
        .classed('bubble', true)
        .attr('r', 0)
        .attr('fill', function (d) { return fillColor(d.nof_talks); })
        .attr('stroke', function (d) {
          return d3.rgb(fillColor(d.nof_talks)).darker(); })
        .attr('stroke-width', 2)
        .on('mouseover', showDetail)
        .on('mouseout', hideDetail);

    bubbles = bubbles.merge(bubblesE);
    // Fancy transition to make bubbles appear, ending with the
    // correct radius
    bubbles.transition()
            .duration(2000)
            .attr('r', function (d) { return d.radius; });

    simulation.nodes(bubbleNodes);
    // After updating bubbles to the graph, the force must be instantialized to make sure that the bubbles will find their right places. Which force is called, is relative to the active button above the graph.
    const buttonId = d3.selectAll(".button.bubblegraph.active")._groups[0][0].id;
    if (buttonId === 'year') {
      splitBubblesYear();
      } else if(buttonId === 'all'){
      groupBubbles();
      } else if(buttonId === 'views'){
        splitBubblesViews();
      } else splitBubblesTalks();
  }

  bubbleChart.mouseDownEvent = function() {
    const slider = document.getElementById("bubblechart_slider")
    // Instantiates text-field for representing slider values
    const txt = svg.selectAll('.bubblechart_slider_value')
    .data([""])
    .enter()
      .append('text')
      .attr('opacity', 0)
      .attr('x', width / 2)
      .attr('y', height / 2)
      .attr('id', 'bubblechart_slider_value')
      .attr('alignment-baseline', 'middle')
      .classed('bubblechart_slider_value', true)
      .text("1 - " + slider.value)
      .transition().duration(500)
        .style('opacity', 0.9);
  }

  bubbleChart.inputEvent = function() {
    const sliderValue = document.getElementById("bubblechart_slider_value");

    // Changes text field value according to slider value
    sliderValue.innerHTML = "1 - " + this.value;
  }

  // return the chart function from closure.
  return bubbleChart;
}

whenDocumentLoaded(() => {
  topbar('speakers');
  /*
   * Sets up the layout buttons to allow for toggling between view modes.
   */
  function setupButtons() {
    d3.select('#bubblegraph_toolbar')
      .selectAll('.bubblegraph')
      .on('click', function () {
        // Remove active class from all buttons
        d3.selectAll('.bubblegraph').classed('active', false);
        // Find the button just clicked
        var button = d3.select(this);

        // Set it as the active button
        button.classed('active', true);

        // Get the id of the button
        var buttonId = button.attr('id');

        // Toggle the bubble chart based on
        // the currently clicked button.
        myBubbleChart.toggleDisplay(buttonId);
      });
  }

  //Initialize bubble chart
  var myBubbleChart = createBubbleChart();

  /*
   * Function called once data is loaded from CSV.
   * Calls bubble chart function to display inside #vis div.
   */
  function display(data, error) {
    if (error) {
      console.log(error);
    }
    myBubbleChart('#speakers_content', data.sort(function (a, b) {
      /** Before sending raw data, it must be sorted. Otherwise sorting is
      * being called multiple times inside myBubbleChart. Sorts first by
      * number of talks, second by views. */
      return b.nof_talks - a.nof_talks || b.value - a.value;
    }));
  }

  // Load the data and display bubble chart
  d3.csv("resources/speaker.csv").then(display);

  const slider = document.getElementById("bubblechart_slider")
  slider.addEventListener('mouseup', function() {
    /**
    * Draw bubbles again to the graph based on the value in the slider.
    * This function also calls the simulation with new bubbles again in the
    * end.
    */
    myBubbleChart.mouseUpEvent();
  });
  slider.addEventListener('mousedown', function() {
    /**
     * Draw bubbles again to the graph based on the value in the slider.
     * This function also calls the simulation with new bubbles again in the
     * end.
    */
    myBubbleChart.mouseDownEvent();
  });
  slider.addEventListener('input', myBubbleChart.inputEvent);
  // setup the buttons.
  setupButtons();
});
