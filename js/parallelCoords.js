class ParallelCoords {
  constructor(svg_element_id, data_address) {

  var timeparser = d3.timeParse("%Y-%m-%d")
  var tp_sh = d3.timeParse("%Y")
  var start_time = tp_sh('2001')
  var end_time = tp_sh('2018')

  const time_axis_ticks = [tp_sh('2001'),tp_sh('2002'), tp_sh('2003'),
    tp_sh('2004'), tp_sh('2005'), tp_sh('2006'), tp_sh('2007'), tp_sh('2008'),
    tp_sh('2009'), tp_sh('2009'), tp_sh('2010'), tp_sh('2011'), tp_sh('2012'),
    tp_sh('2013'), tp_sh('2014'), tp_sh('2015'), tp_sh('2016'), tp_sh('2017'),
    tp_sh('2018')]

  var dim_pars = {
    "views" : {
      'description' : "number of views",
      'scale_type' : function() {return d3.scaleLog()},
      'axis' : d3.axisRight()
                    .ticks(7)
                    .tickSize(4,0)
                    .tickFormat( d3.format(".2s")),
    },
    "comments" : {
      'description': "number of comments",
      'scale_type' : function() {return d3.scaleLog()},
      'axis' : d3.axisRight()
                    .ticks(7)
                    .tickSize(4,0)
                    .tickFormat( d3.format(".2s"))
    },
    "film_date" : {
      'description': "film date",
      'scale_type' : function() {return d3.scaleLinear()},
      'axis' : d3.axisRight()
                    .tickValues(time_axis_ticks)
                    .tickSize(4,0)
                    .tickFormat( d3.timeFormat("%Y"))
    },
    "published_date" : {
      'description': "published date",
      'scale_type' : function() {return d3.scaleLinear()},
      'axis' : d3.axisRight()
                    .tickValues(time_axis_ticks)
                    .tickSize(4,0)
                    .tickFormat( d3.timeFormat("%Y"))
    },
    "speed_of_speech" : {
      'description': "speed of speech (wpm)",
      'scale_type' : function() {return d3.scaleLinear()},
      'axis' : d3.axisRight()
                    .ticks(7)
                    .tickSize(4,0)
                    .tickFormat( d3.format(".2s"))
    },
    "duration" : {
      'description': "duration (min)",
      'scale_type' : function() {return d3.scaleLinear()},
      'axis' : d3.axisRight()
                    .ticks(7)
                    .tickSize(4,0)
                    .tickFormat( d3.format(".2s"))
    },
    "event_type" : {
      'description': "event type",
      'scale_type' : function() {return d3.scalePoint()},
      'axis' : d3.axisRight()
                    .ticks(7)
                    .tickSize(4,0)
                    .tickFormat( function(d, i) { return d},)
    }
  }


  // set the dimensions and margins of the graph
  var margin = {top: 30, right: 10, bottom: 10, left: 0},
  width = 1300 - margin.left - margin.right,
  height = 800 - margin.top - margin.bottom;
  var row = 0
  var i = 0
  var dragging = {}
  var color_var = 'published_date'
  // just hardcode the desired variables
  var dimensions = ['duration','speed_of_speech','film_date', 'published_date',
                    'comments', 'views', 'event_type' ]


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
  var event_types = ['external','salon','global','main','youth',
                        'med','women','tedx', 'satellite']
  var titles = []
  for (row in data){
    if (row != 'columns'){ //columns is a part of the object
      data[row].logviews = Math.log(data[row]['views'])
      data[row].logduration = Math.log(data[row]['duration'])
      data[row].logcomments = Math.log(data[row]['comments'])
      data[row].film_date = timeparser(data[row]['film_date'])
      data[row].published_date = timeparser(data[row]['published_date'])
      titles.push(data[row]['title'])
    }
  }
  titles.sort()
  data['columns'].push('logviews')
  data['columns'].push('logduration')
  data['columns'].push('logcomments')


  // filter the drastic outliers away
  function filter_rows(input_data, dim, low, high, brush = true) {
    var output_data = input_data.filter(function(row){
      if(brush == true){
        return y[dim](row[dim]) <= (high) && y[dim](row[dim]) >= (low)
      }else{
        return row[dim] <= (high) && row[dim] >= (low)
      }
    })
    return output_data
  }

  data = filter_rows(data, 'duration', 0, 30, false)
  data = filter_rows(data, 'film_date', start_time, end_time, false)

  var filtered_data = data

  // create the x axis
  var x = d3.scalePoint()
              .range([0, width])
              .padding(1)
              .domain(dimensions);



  function get_domain_type(dim) {
    if(['title'].indexOf(dim) >= 0){
      return titles
    }else if(['event_type'].indexOf(dim) >= 0){
      return event_types
    }else if(['film_date','published_date'].indexOf(dim) >= 0){
      return [start_time, end_time]
    }else{
      return d3.extent(filtered_data, function(d) { return +d[name]; })
    }
  }


  // create y axis
  var y = {}
  for (i in dimensions) {
    name = dimensions[i]
    //var scale = get_scale_type(name)
    var scale = dim_pars[name]['scale_type']()
    var domain = get_domain_type(name)
    y[name] = scale
              .domain( domain )
              .range([height, 0])
  }

  //draw one line
  function path(row) {
    return d3.line()(dimensions.map(function(dim) { //dim == column
        return [x(dim), y[dim](row[dim])]; // pair of x y coordinates for each dim
    }));
  }

  // return the x-position of the dimension
  function position(dim) {
    var v = dragging[dim];
    if(v==null){
        return x(dim)
    }else{
        return v
    }
  }

  // handle a change in brush of some dimension
  function brush_event() {
      var input_data = data
      d3.selectAll(".brush").each(function(dim) {
          var selection = this.__brush.selection
          if (selection == null){
            input_data = input_data
          }else{
            input_data = filter_rows(input_data, dim, selection[0][1], selection[1][1])
          }
      }
      )
      filtered_data = input_data
      draw_all()
  }

  //colors according to the current **filtered** color_var
  function create_color_dimension() {
    var scale = dim_pars[color_var]['scale_type']()
    if(color_var == 'event_type'){
        return d3.scaleOrdinal(event_types, d3.schemeCategory10)
    }else{
      var min = 100000000000000
      var max = 0
      for (row in filtered_data){
        if (row != 'columns'){ //columns is a par of the object
          //extract min and max
          min = Math.min(min, filtered_data[row][color_var])
          max = Math.max(max, filtered_data[row][color_var])
        }
      }
      return d3.scaleSequential(
        (d)=> d3.interpolateRdYlGn(scale.domain([min,max])(d))
        //(d)=> d3.interpolateRdYlGn(scale.domain([min,max*5])(d))
      )
    }
  }

  // used to populate the svg
  function draw_all() {
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
    console.log('Visual smoother level:', viz)

    ///// HANDLE EVENTS
    function handleMouseOver(d, i) {  // Add interactivity
      var coordinates= d3.mouse(this);
      var x = coordinates[0];
      var y = coordinates[1];
      // Use D3 to select element, change color and size
      d3.select(this).attr('stroke', "black")
      d3.select(this).attr("stroke-width", viz*6)
      d3.select(this).style("opacity", 1)

      // Specify where to put label of text
      svg.append("text")
        .style("text-anchor", "middle")
        .attr('x', function() { return x - 15 })
        .attr('y', function() { return y - 15 })
        .attr('id', "t" + '' + "-" + ''+ "-" + i)
        .text(d.name)
        .style("fill", "#e62b1e")
        .style("font-weight", "bold")
    }

    function handleMouseOut(d, i) {
      //change properties back to normal
      d3.select(this).attr('stroke', row => z(row[color_var]) )
      d3.select(this).attr("stroke-width", viz*3)
      d3.select(this).style("opacity", viz/3)

      // Select text by id and then remove
      d3.select("#t" + '' +  "-" + '' + "-" + i).remove();  // Remove text location
    }

    function handleClick(d, i) {  // Add interactivity
          console.log("Have a good time with ", d.url, '!')
          open(d.url)
    }

    ///// DRAW THE ELEMENTS
    // Draw the lines
    svg
      .style("fill", "none")
      .selectAll("myPath")
      .data(filtered_data.slice().sort((a, b) => d3.ascending(a[color_var], b[color_var])))
      .enter().append("path")
      .attr("stroke", row => z(row[color_var]))
      .style("opacity", viz/3)
      .attr("stroke-width", viz*3)
      .join("myPath")
      .attr("d",  path)
      .on('mouseover', handleMouseOver)
      .on('mouseout', handleMouseOut)
      .on('click', handleClick)

    // Draw the axis:
    var all_axes = svg.selectAll(".dimension")
      .data(dimensions)
      .enter()
      .append("g") //grouping for each dimension
      .attr("transform", function(d) { //element to its position on x axis
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
          if (dragging[dim] == x(dim)) {  // no movement -> click event
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

    // class for axes
    all_axes.each(function(dim){
        d3.select(this).attr("class", dim+" dimension")
    })

    // create axis
    all_axes.each(function(dim) {
            d3.select(this)
            .call(dim_pars[dim]['axis']
                    .scale(y[dim])
            )
            .style("color", "black")
        })

    // label
    all_axes.append("text")
        .style("text-anchor", "middle")
        .attr("y", -15)
        .text(function(dim) { return dim_pars[dim]['description']; })
        .style("fill", "black")
        .attr("class", "var_name")

    // brush
    function get_saved_brush(dim) {
        var to_return = []
        if(saved_brushes[dim] == undefined){
            to_return =  null
        }else{
            if (saved_brushes[dim] == null){
                to_return = null
            }else{
                var saved = saved_brushes[dim]
                to_return = [saved[0][1],saved[1][1]]
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
  const parallelCoords = new ParallelCoords('#correlation_content',
    'resources/ted_main.csv');
});
