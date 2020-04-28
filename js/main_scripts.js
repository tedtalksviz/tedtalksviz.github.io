
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
                              .classed('bubblechart', true);

    const hierarchicalData = d3.hierarchy(this.data).sum(function(d) {return d.count}).sort((a,b) => b.count - a.count);
    const packLayout = d3.pack().size([400-5, 400-5]).padding(1);
    const root = packLayout(hierarchicalData);
    console.log(root)
    const mathMin = Math.min(...this.data.children.map(dict => {return dict.count}));
    const mathMax = Math.max(...this.data.children.map(dict => {return dict.count}));
    const color = d3.scaleLinear()
                    .domain([mathMin, mathMax])
                    .range(['#FF7F7F', "#FF0000"]);

    const leaf = this.plot_area
                     .selectAll('g')
                     .data(root.descendants())
                     .join('g')
                     .attr('transform', d => `translate(${d.x}, ${d.y})`)
                     .classed('bubblechart_leaf', true);
    leaf
      .append('circle')
      .attr('r', d => d.r)
      .attr('fill-opacity', 1)
      .attr('fill', function(d) {return color(d.data.count)});
    

  }
}










class ParallelCoords {
    constructor(svg_element_id, data_address) {
    // set the dimensions and margins of the graph
    var margin = {top: 30, right: 10, bottom: 10, left: 0},
    width = 900 - margin.left - margin.right,
    height = 800 - margin.top - margin.bottom;
    var row = 0
    var i = 0
    var dragging = {}


    var color_var = 'languages'

    // just hardcode the desired variables
    var dimensions = [ 'views','comments', 'languages', 'duration', 'film_date', 'published_date']

    // append the svg object to the body of the page
    var svg = d3.select(svg_element_id)
        .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform",
              "translate(" + margin.left + "," + margin.top + ")");

  // use the data
  d3.csv(data_address).then(function(data) {
    for (row in data){
        if (row != 'columns'){ //columns is a part of the object
            data[row].logviews = Math.log(data[row]['views'])
            data[row].logduration = Math.log(data[row]['duration'])
            data[row].logcomments = Math.log(data[row]['comments'])
        }
    }
    data['columns'].push('logviews')
    data['columns'].push('logduration')
    data['columns'].push('logcomments')

    function filter_rows_start(input_data, dim, low, high) {
        var output_data = input_data.filter(function(row){
            return row[dim] <= (high) && row[dim] >= (low)
        })
        return output_data
    }

      data = filter_rows_start(data, 'duration', 0, 2000)
      data = filter_rows_start(data, 'film_date', 1000000000, 2000000000)

      var filtered_data = data

      // create the x axis
      var x = d3.scalePoint()
        .range([0, width])
        .padding(1)
        .domain(dimensions);

        function get_scale_type(dim) {
            if(dim == 'views' || dim == 'comments'){
              return d3.scaleLog()
            }else{
              return d3.scaleLinear()
            }
        }

      // create y axis
      var y = {}
      for (i in dimensions) {
        name = dimensions[i]
        var scal = get_scale_type(name)
        y[name] = scal
          .domain( d3.extent(filtered_data, function(d) { return +d[name]; }) )
          .range([height, 0])
      }

      //draw one line
      function path(row) {
          return d3.line()(dimensions.map(function(dim) { //dim == column
              return [x(dim), y[dim](row[dim])]; // pair of x y coordinates for each dim
          }));
      }


      function position(dim) {
        var v = dragging[dim];
        if(v==null){
            return x(dim)
        }else{
            return v
        }
      }

    function filter_rows_brush(input_data, dim, low, high) {
        var output_data = input_data.filter(function(row){
            return y[dim](row[dim]) <= (high) && y[dim](row[dim]) >= (low)
        })
        return output_data
    }

    function brush_event() {
        var input_data = data
        d3.selectAll(".brush").each(function(dim) {
            var selection = this.__brush.selection
            if (selection == null){
                input_data = input_data
            }else{
                input_data = filter_rows_brush(input_data, dim, selection[0][1], selection[1][1])
            }
        }
        )
        filtered_data = input_data
        draw_all()
    }




      // used to populate the svg
      function draw_all() {

          function create_color_dimension() {
              //colors according to the current **filtered** color_var
              var min = 100000000000000
              var max = 0
              for (row in filtered_data){
                if (row != 'columns'){ //columns is a par of the object
                  //extract min and max
                  min = Math.min(min, filtered_data[row][color_var])
                  max = Math.max(max, filtered_data[row][color_var])
                }
              }
            //return d3.scaleSequential(y[color_var].domain().reverse(), d3.interpolateRdYlGn)
                var scal = get_scale_type(color_var)

                //.domain( d3.extent(filtered_data, function(d) { return +d[name]; }) )
                return d3.scaleSequential(
                    (d)=> d3.interpolateRdYlGn(scal.domain([max,min])(d))
                )
          }
          var z = create_color_dimension()

          var saved_brushes = {} // carry brushes over the clear
          d3.selectAll(".brush").each(function(dim) {
            var selection = this.__brush.selection
            saved_brushes[dim] = selection
          })

          svg.selectAll("*").remove();
          var len = filtered_data.length

          var dividor = Math.max(1,Math.log(len)-3)
          var viz = 1/dividor //used for opacity and stroke-width
          console.log('visual smoother viz:', viz)



          // Draw the lines
          svg
            .style("fill", "none")
            .selectAll("myPath")
            .data(filtered_data.slice().sort((a, b) => d3.ascending(a[color_var], b[color_var])))
            .enter().append("path")
           // .style("stroke", "#69b3a2")
            .attr("stroke", dim => z(dim[color_var]))
            .style("opacity", viz)
            .attr("stroke-width", viz)
            .join("myPath")
                .attr("d",  path)


          // Draw the axis:
          var all_axes = svg.selectAll(".dimension")
            // For each dimension of the dataset I add a 'g' element:
            .data(dimensions)
            .enter()
            .append("g")
            .attr("class", 'dimension')

            // I translate this element to its right position on the x axis
            .attr("transform", function(d) {
                return "translate(" + position(d) + ")";
            })
            .call(d3.drag()
                .on("start", function(dim) {
                  dragging[dim] = this.__origin__ = x(dim);
                })
                .on("drag", function(dim) {
                    dragging[dim] = Math.min(width, Math.max(0, this.__origin__ += d3.event.dx));
                    //dragging[dim] = 900
                    dimensions.sort(function(a, b) {
                        return position(a) - position(b);
                    });

                    x.domain(dimensions);


                all_axes.attr("transform", function(dim) {
                    return "translate(" + position(dim) + ")";
                });


              })
              .on("end", function(dim) {
                if (dragging[dim] == x(dim)) {
                    // no movement -> click event
                    console.log(color_var)
                    color_var = dim
                }else{ //reset axis place
                    d3.select(this).transition().attr("transform", "translate(" + x(dim) + ")");
                }
                //rerender whether just colormap or order changed
                setTimeout(function(){draw_all()}, 500);

                delete this.__origin__;
                delete dragging[dim];
              })
            )
            .each(function(dim) {
                d3.select(this)
                .call(d3.axisLeft().scale(y[dim]))
                // .style("padding", '20px 30px 20px 20px') //not helping for the tight axis
            })

        //label
        all_axes.append("text")
            .style("text-anchor", "middle")
            .attr("y", -15)
            .text(function(dim) { return dim; })
            .style("fill", "black")
            .attr("class", "var_name")

        //brush


        function get_saved_brush(dim) {
            var to_return = []
            if(saved_brushes[dim] == undefined){
                to_return =  null
            }else{
                if (saved_brushes[dim] == null){
                    to_return = null
                }else{
                    var savedyay = saved_brushes[dim]
                    to_return = [savedyay[0][1],savedyay[1][1]]
                }
            }
            return to_return
        }


        all_axes.append("g")
            .attr("class", "brush")
            .each(function(dim) {
                d3.select(this)
                    .call(
                        d3.brushY()
                        .extent([[-30,0],[30,height]])
                        .on('end', brush_event)
                    );
                    d3.brushY().move(d3.select(this),get_saved_brush(dim))
            })
            .selectAll("rect")
                .style("visibility", null)
                .attr("x", -23)
                .attr("width", 36)
                .append("title")
                    .text("Doubleclick to dismiss");
      }

  draw_all(); //after load, render the table
  })
  }
}







whenDocumentLoaded(() => {
  const bubbleChartDict = {};
  const promise = d3.csv("data/ted_main.csv", function(data, error) {
        
    /** JSON.parse() parses STRINGIFIED ratings back to an array of dictionaries. 
     * HOWEVER, in order to do that, all ' -chars must be converted to " -chars.
     * According to MDN documentation of JSON.parse(),
     * https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/JSON/parse,
     * it throws an error if the string contains ' -chars. */
    
    const string_to_array = JSON.parse(data.ratings.replace(/'/g,'"')); // g in .replace implies globalness which means that all ' -chars must be changed. Otherwise only first match would be replaced.

    const dictItem = string_to_array[0]; // This is always one dictionary f.ex.  {id: 7, name: "Funny", count: 1234}
    //console.log(dictItem);

    /** Increments the number of counts for each dictionary key. */
    bubbleChartDict[dictItem.name] = ( bubbleChartDict[dictItem.name] || 0 ) + dictItem.count;
    //console.log(bubbleChartData);

  });
  
  promise.then(successCallBack, failureCallback);

  function successCallBack() {
    const bubbleChartData = []
    for ([key, value] of Object.entries(bubbleChartDict)){
      bubbleChartData.push({'name': key, 'count': value});
    };
    const plot = new BubbleChart('single_var_content', {'name': 'parent', 'children': bubbleChartData});
  };

  function failureCallback(error) {
    window.alert("Error in getting promise 'MainData' " + error)

  };

  
  const plot2 = new ParallelCoords('#correlation_content', "data/ted_main.csv");


});
