function createBubbleChart() {
    //Sizing
    const margin = {top: 30, right: 200, bottom: 10, left: 200};
    const width = 1200;
    const height = 800;
    const innerWidth = width - margin.right - margin.left;
    //tooltip object for mouseover functionality, width 300
    const tooltip = floatingTooltip('speakers_tooltip', 300);
    const slidertooltip = floatingTooltip('slider_tooltip', 200);
    //Location where bubbles are moving, depends on the view mode
    const center = { x : width / 2, y : height / 2 };
    // These will be set in create_nodes and create_vis
    var svg = null;
    var bubbles = null;
    var nodes = [];
    //Min and max values of avg_views
    var minAmount = null;
    var maxAmount = null;
    //Coloring
    var fillColor = null;
    //For labels and grouping
    var array_dateYear = [];
    var dateYear_length = null;
    var yearCenters = {};
    var yearsTitleX = {};
    //Strength to apply to the position forces
    const forceStrength = 0.05;
    //We create a force simulation now and add forces to it.
    const simulation = d3.forceSimulation()
        .velocityDecay(0.2)
        .force('x', d3.forceX().strength(forceStrength).x(center.x))
        .force('y', d3.forceY().strength(forceStrength).y(center.y))
        .force('charge', d3.forceManyBody().strength(charge))
        .on('tick', ticked);
    //Force starts up automatically,
    // which we don't want as there aren't any nodes yet.
    simulation.stop();

    function getFillColorScale(data) {
        const minNofTalks = d3.min(data, function(d) { return d.nof_talks})
        //console.log(minNofTalks)
        const maxNofTalks = d3.max(data, function(d) { return d.nof_talks})
        //console.log(maxNofTalks);
        return d3.scaleSequential([minNofTalks, maxNofTalks * 5], d3.interpolateRainbow);
    }

    function updateMin(data) {
        return d3.min(data, function(d) {return +d.avg_views});
    }

    function updateMax(data) {
        return d3.max(data, function(d) {return +d.avg_views});
    }

    function createNodes(rawData) {

        // Sizes bubbles based on area.
        var radiusScale = d3.scalePow()
                            .exponent(0.5)
                            .range([2, 29])
                            .domain([0, maxAmount]);

        var myNodes = rawData.map(function (d) {
            return {
                    id: +d.speaker_id,      // + makes sure it's a number
                    radius: radiusScale(+d.avg_views),
                    value: +d.avg_views,
                    name: d.speaker.trim(),
                    occupation: d.speaker_occupation,
                    nof_talks: +d.nof_talks,
                    year: +d.film_date,
                    talks: JSON.parse(d.talks),
                    x: Math.random() * width, // random places to start
                    y: Math.random() * height  // random places to start
            };
        });

        //before returning data set, sort descending order
        myNodes.sort(function (a, b) { return b.value - a.value; });
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
                yearCenters[year] = { x: 1 / ( dateYear_length * 2 ) * innerWidth + margin.left, y: height / 2}
            } else {
                yearCenters[year] = { x: (Math.abs(2005 - year) / dateYear_length) * innerWidth
                + 1 / ( dateYear_length * 2 ) * innerWidth + margin.left,
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
            if(year == 2005) { yearsTitleX["-"+year] = 1 / ( dateYear_length * 2 ) * innerWidth + margin.left * 2 / 3 }
            else { yearsTitleX[year] =
              (Math.abs(2005 - year) / dateYear_length) *
              (innerWidth + margin.right * 2 / 3)
              + 1 / ( dateYear_length * 2 ) * innerWidth + margin.left * 2 / 3 }
        });
    }


    // Charge function that is called for each node.
    // As part of the ManyBody force.
    // This is what creates the repulsion between nodes.
    //
    // Charge is proportional to the diameter of the
    // circle (which is stored in the radius attribute
    // of the circle's associated data.
    //
    // This is done to allow for accurate collision
    // detection with nodes of different sizes.
    //
    // Charge is negative because we want nodes to repel.
    // @v4 Before the charge was a stand-alone attribute
    //  of the force layout. Now we can use it as a separate force!
    function charge(d) {
        return -Math.pow(d.radius, 2.0) *forceStrength;
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
        minAmount = updateMin(rawData);
        maxAmount = updateMax(rawData);
        fillColor = getFillColorScale(rawData);
        setYears(rawData);
        //console.log(rawData);
        // convert raw data into nodes data
        nodes = createNodes(rawData);

        const slider = d3.select("#bubblechart_slider");

        // Create a SVG element inside the provided selector
        // with desired size.
        svg = d3.select(selector)
                .append('svg')
                .attr('width', width)
                .attr('height', height);

        var spn = svg.selectAll('span').data(["Value: "]);
        var spnE = spn.enter().append("p")
                      .text(function(d) {return d});
        spn.merge(spnE);

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
                        .data(nodes, function (d) { return d.id; }); // id is distinct

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
                .duration(2000)
                .attr('r', function (d) { return d.radius; });

        // Set the simulation's nodes to our newly created nodes array.
        // @v4 Once we set the nodes, the simulation will start running automatically!
        simulation.nodes(nodes);

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

    /*
    * Sets visualization in "single group mode".
    * The year labels are hidden and the force layout
    * tick function is set to move all nodes to the
    * center of the visualization.
    */
    function groupBubbles() {
        hideYearTitles();

        // @v4 Reset the 'x' force to draw the bubbles to the center.
        simulation.force('x', d3.forceX().strength(forceStrength).x(center.x));

        // @v4 We can reset the alpha value and restart the simulation
        simulation.alpha(1).restart();
    }

    /*
    * Sets visualization in "split by year mode".
    * The year labels are shown and the force layout
    * tick function is set to move nodes to the
    * yearCenter of their data's year.
    */
    function splitBubbles() {
        showYearTitles();

        //Reset the 'x' force to draw the bubbles to their year centers
        simulation.force('x', d3.forceX().strength(0.2).x(nodeYearPos));

        //We can reset the alpha value and restart the simulation
        simulation.alpha(1).restart();
    }

    /*
    * Hides Year title displays.
    */
    function hideYearTitles() {
        svg.selectAll('.year')
            .transition()
            .duration(1000)
            .attr('fill-opacity', 0);
    }

    /*
    * Shows Year title displays.
    */
    function showYearTitles() {
        svg.selectAll('.year')
            .transition()
            .duration(1500)
            .attr('fill-opacity', 1);
    }

    /*
    * Function called on mouseover to display the
    * details of a bubble in the tooltip.
    */
    function showDetail(d) {
        // change outline to indicate hover state.
        d3.select(this).attr('fill', 'black')
                        .attr('stroke', 'black');

        var content = '<span class="name">Name: </span><span class="value">'        + d.name +
                    '</span><br/>' +
                    '<span class="name">Talks: </span><span class="value">'        + d.nof_talks.toString() +
                    '</span><br/>' +
                    '<span class="name">Average views: </span><span class="value">' + d.value.toString() +
                    '</span><br/>' +
                    '<span class="name">Year of first appearance: </span><span class="value">' + d.year.toString() +
                    '</span>';

        tooltip.showTooltip(content, d3.event);
    }


    /*
    * Helper function to convert a number into a string
    * and add commas to it to improve presentation.
    */
    function addCommas(nStr) {
        nStr += '';
        var x = nStr.split('.');
        var x1 = x[0];
        var x2 = x.length > 1 ? '.' + x[1] : '';
        var rgx = /(\d+)(\d{3})/;
        while (rgx.test(x1)) {
            x1 = x1.replace(rgx, '$1' + ',' + '$2');
        }

        return x1 + x2;
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
        splitBubbles();
        } else {
        groupBubbles();
        }
    };

    // return the chart function from closure.
    return bubbleChart;
}

whenDocumentLoaded(() => {
   /*
   * Sets up the layout buttons to allow for toggling between view modes.
   */
   function setupButtons() {
       d3.select('#bubblegraph_toolbar')
           .selectAll('.button')
           .on('click', function () {
           // Remove active class from all buttons
           d3.selectAll('.button').classed('active', false);
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

        myBubbleChart('#single_var_content_1', data);
    }

   // Load the data and display bubble chart
   d3.csv("resources/speaker.csv").then(display);

   // setup the buttons.
   setupButtons();


});
