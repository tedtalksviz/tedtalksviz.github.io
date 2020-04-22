
const dummy_values = [1,2,3,4,5,6,7,8,9,10]
const RATINGS = ['funny', 'confusing', 'beautiful', 'courageous', 'longwinded', 'informative', 'unconvincing', 'ingenious', 'inspiring', 'fascinating']

function whenDocumentLoaded(action) {
	if (document.readyState === "loading") {
		document.addEventListener("DOMContentLoaded", action);
	} else {
		// `DOMContentLoaded` already fired
		action();
	}
}
// Tabbed Menu
function openMenu(evt, menuName) {
  var i, x, tablinks;
  x = document.getElementsByClassName("menu");
  for (i = 0; i < x.length; i++) {
    x[i].style.display = "none";
  }
  tablinks = document.getElementsByClassName("tablink");
  for (i = 0; i < x.length; i++) {
    tablinks[i].className = tablinks[i].className.replace(" w3-dark-grey", "");
  }
  document.getElementById(menuName).style.display = "block";
  evt.currentTarget.firstElementChild.className += " w3-dark-grey";
}

class BubbleChart {
  constructor(svg_element_id, data) {
    this.data = data;
    this.svg = d3.select('#' + svg_element_id);

    this.plot_area =  this.svg.append('svg')
                              .attr('viewBox','0 0 400 400') // this is magic ! define viewbox area of 400, use that same in pack size, and it scales to the viewPort perfectly!
                              .attr('style', 'border: thin solid red');
    
    

    const hierarchicalData = d3.hierarchy({ children: this.data}).sum(function(d) {return d.counts});
    const packLayout = d3.pack().size([400-5, 400-5]).padding(0.5);
    const root = packLayout(hierarchicalData);
    const color = d3.scaleLinear()
                    .domain([1,10])
                    .range(["blue", "red"]);

    const leaf = this.plot_area
                     .selectAll('g')
                     .data(root.leaves())
                     .join('g')
                     .attr('transform', d => `translate(${d.x}, ${d.y})`);
    leaf
      .append('circle')
      .attr('r', d => d.r)
      .attr('fill-opacity', 0.7)
      .attr('fill', function(d) { return color(d.data.counts)});

  }
}










class ParallelCoords {
  constructor(svg_element_id, data_address) {
  // set the dimensions and margins of the graph
  var margin = {top: 30, right: 10, bottom: 10, left: 0},
    width = 900 - margin.left - margin.right,
    height = 1200 - margin.top - margin.bottom;
  var brush_count = 0

  var color_var = 'published_date'


  // append the svg object to the body of the page
  var svg = d3.select(svg_element_id)
  .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
  .append("g")
    .attr("transform",
          "translate(" + margin.left + "," + margin.top + ")");
  console.log(svg)

  // Parse the Data
  //var data_address ="https://raw.githubusercontent.com/holtzy/D3-graph-gallery/master/DATA/iris.csv" 
  d3.csv(data_address).then(function(data) {
      var row = 0
      for (row in data){
        if (row != 'columns'){
          data[row].logviews = Math.log(data[row]['views'])
          data[row].logduration = Math.log(data[row]['duration'])
          data[row].logcomments = Math.log(data[row]['comments'])
        }
      }
      data['columns'].push('logviews')
      data['columns'].push('logduration')
      data['columns'].push('logcomments')

      // Extract the list of dimensions we want to keep in the plot. Here I keep all except the column called Species
      //var dimensions = d3.keys(data[0]).filter(function(d) { return ['views', 'comments', 'duration', 'languages', 'published_date', 'film_date'].indexOf(d) >= 0 })
      var dimensions = [ 'logviews', 'logcomments','languages','logduration', 'duration', 'film_date', 'published_date']

      // For each dimension, I build a linear scale. I store all in a y object
      var y = {}
      var i = ''
      for (i in dimensions) {
        name = dimensions[i]
        y[name] = d3.scaleLinear()
          .domain( d3.extent(data, function(d) { return +d[name]; }) )
          .range([height, 0])
      }

      // Build the X scale -> it find the best position for each Y axis
      var x = d3.scalePoint()
        .range([0, width])
        .padding(1)
        .domain(dimensions);


      // The path function take a row of the csv as input, and return x and y coordinates of the line to draw for this raw.
      function path(d) {
          return d3.line()(dimensions.map(function(p) { return [x(p), y[p](d[p])]; }));
      }

      function z() {
        return d3.scaleSequential(y[color_var].domain().reverse(), d3.interpolateRdYlGn)
      }

      function change_color_var(d) {
        color_var = d
      }



      function brush() {
        brush_count++;
          svg.selectAll("*").remove();
        console.log(svg)

          // Draw the lines
          svg
            .style("fill", "none")
            .selectAll("myPath")
            .data(data.slice().sort((a, b) => d3.ascending(a[color_var], b[color_var])))
            .enter().append("path")
           // .style("stroke", "#69b3a2")
            .attr("stroke", d => z()(d[color_var]))
            .style("opacity", 0.3)
            .attr("stroke-width", 0.3)
            .join("myPath")
                .attr("d",  path)


          // Draw the axis:
          svg.selectAll("myAxis")
            // For each dimension of the dataset I add a 'g' element:
            .data(dimensions).enter()
            .append("g")
            .attr("class", 'axis')
            // I translate this element to its right position on the x axis
            .attr("transform", function(d) { return "translate(" + x(d) + ")"; })
            // And I build the axis with the call function
            .each(function(d) { d3.select(this).call(d3.axisLeft().scale(y[d])); })
            // Add axis title
            .append("text")
              .style("text-anchor", "middle")
              .attr("y", -9)
              .text(function(d) { return d; })
              .style("fill", "black")
              .attr("class", "var_name")
              .on('click', function(d) {
                change_color_var(d)
                brush();  //after changing the color mapping, rerender the table
              })
              .call(d3.drag()
                  .on("drag", function(d) {
                    dragging[d] = Math.min(w, Math.max(0, this.__origin__ += d3.event.dx));
                    dimensions.sort(function(a, b) { return position(a) - position(b); });
                    xscale.domain(dimensions);
                    g.attr("transform", function(d) { return "translate(" + position(d) + ")"; });
                    brush_count++;
                    this.__dragged__ = true;

                    if (!this.__dragged__) { // no move, 
                          var extent = invert_axis(d);
                    }else{
                      //reorder
                    }
                  })
              )
      }
      brush(); //after load, render the table

  })
  }
}






whenDocumentLoaded(() => {
  const data = dummy_values.map((value, index) => {
    return {'id': index, 'name': RATINGS[index], 'counts': value, 'x': 5, 'y': 4, 'r': 2}
  });
  

  const plot = new BubbleChart('single_var_content', data);
  const plot2 = new ParallelCoords('#correlation_content', "data/ted_main.csv");


});
