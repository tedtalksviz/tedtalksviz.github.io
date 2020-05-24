class EventTimeseries {
  constructor(svg_element_id, data_address) {
  const tooltip = floatingTooltip('eventTs_tooltip');
  // set the dimensions and margins of the graph
  var margin = {top: 50, right: 30, bottom: 30, left: 50},
  width = 1300 - margin.left - margin.right,
  height = 800 - margin.top - margin.bottom;
  var row = 0
  var i = 0
  var timeparser = d3.timeParse("%Y-%m-%d")
  var tp_sh = d3.timeParse("%Y")
  const time_axis_ticks = [tp_sh('2001'),tp_sh('2002'), tp_sh('2003'),
    tp_sh('2004'), tp_sh('2005'), tp_sh('2006'), tp_sh('2007'), tp_sh('2008'),
    tp_sh('2009'), tp_sh('2009'), tp_sh('2010'), tp_sh('2011'), tp_sh('2012'),
    tp_sh('2013'), tp_sh('2014'), tp_sh('2015'), tp_sh('2016'), tp_sh('2017'),
    tp_sh('2018')]



  // append the svg object to the body of the page
  var svg = d3.select(svg_element_id)
              .append("svg")
              .attr("width", width + margin.left + margin.right)
              .attr("height", height + margin.top + margin.bottom)
              .append("g")
              .attr("transform",
                    "translate(" + margin.left + "," + margin.top + ")");

    function filter_rows(input_data, dim, low, high) {
        var output_data = input_data.filter(function(row){
            return row[dim] <= (high) && row[dim] >= (low)
        })
        return output_data
    }



  // use the data
  d3.csv(data_address).then(function(data) {
    for (row in data){
        if (row != 'columns'){ //columns is a part of the object
            data[row].film_date = timeparser(data[row]['film_date'])
        }
    }

    data = filter_rows(data, 'film_date', tp_sh('2001'), tp_sh('2018'))

    var x = d3.scaleLinear()
              .domain( [timeparser('2000-10-01'), tp_sh('2018')] )
              .range([0, width])


    function draw(y_axis) {
    svg.selectAll("*").remove();

    svg.append('g')
      .attr('transform', 'translate(0,' + height + ')')
      .call(d3.axisBottom()
              .scale(x)
              .ticks(d3.timeSecond.every(15))
              .tickValues(time_axis_ticks)
              .tickSize(4,0)
              .tickFormat( d3.timeFormat("%Y") )
          )

    // create y axis
    function select_y_dimension(y_axis) {
      if(y_axis == 'avg_views'){
          return d3.scaleLinear().domain([0, 5000000]).range([height, 0])
      }else if(y_axis == 'avg_speed_of_speech'){
          return d3.scaleLinear().domain([40, 210]).range([height, 0])
      }else if(y_axis == 'nof_talks'){
          return d3.scaleLinear().domain([0, 90]).range([height, 0])
      }else if(y_axis == 'avg_duration'){
          return d3.scaleLinear().domain([0, 25]).range([height, 0])
      }
    }
    var y = select_y_dimension(y_axis)

    function showDetail(d) {
      // change outline to indicate hover state.
      console.log(d)
      d3.select(this).attr('fill', 'black')
                      .attr('stroke', 'black');
      var content = '<span class="name">Event: </span><span class="value">'        + d.event.toString() +
                  '</span><br/>' +
                  '<span class="name">Talks: </span><span class="value">'        + d.nof_talks.toString() +
                  '</span><br/>' +
                  '<span class="name">Average views: </span><span class="value">' + Math.round(d.avg_views).toString() +
                  '</span><br/>' +
                  '<span class="name">Average duration: </span><span class="value">' + Math.round(d.avg_duration).toString() +
                  '</span>';
      tooltip.showTooltip(content, d3.event);
    }

    function hideDetail(d) {
        // reset outline
        d3.select(this).attr('fill', c(d.event_type))
        tooltip.hideTooltip();
    }

    svg.append("g")
      .call(d3.axisLeft()
                  .scale(y)
                  .ticks(7)
                  .tickSize(4,0)
                  .tickFormat(d3.format(".2s"))
      );

    // Add a scale for bubble size
    var z = d3.scaleLinear()
          .domain( d3.extent(data, function(d) {return +d['nof_talks']} ) )
          .range([ 4, 36.66]); //smallest is 1 talk, largest is about 84
                            //4*4 = 16 & 36.66*36.66 = 1344, 1344/16 = 84
    var event_types = ['external','salon','global','main','youth',
                          'med','women','tedx', 'satellite']
    var c = d3.scaleOrdinal(event_types, d3.schemeCategory10)
          .unknown("black")


    // Add dots
    console.log(
      data.sort(function(a,b){
        a.nof_talks-b.nof_talks
      }) //sort here
    )
    svg.append('g')
      .selectAll("dot")
      .data(data.sort(function(a,b){
        return b.nof_talks-a.nof_talks
      })) //sort here
      .enter()
      .append("circle")
      .attr("cx", data =>  x(data.film_date)  )
      .attr("cy", data => y(data[y_axis])  )
      .attr("r", data =>  z(data.nof_talks)  )
      .attr("fill", data => c(data.event_type))
      .style("opacity", "0.7")
      .attr("stroke", "black")
      .on('mouseover', showDetail)
      .on('mouseout', hideDetail);

    //event type legend
    svg.append("g")
      .attr("class", "legendSequential")
      .attr("transform", "translate(20,-40)");
    var legendSequential = d3.legendColor()
        .shapeWidth(100)
        .cells(10)
        .orient("horizontal")
        .scale(c)
    svg.select(".legendSequential")
      .call(legendSequential);

    // bubble size legend
    //svg.append("g")
    //  .attr("class", "legendSize")
    //  .attr("transform", "translate(1000, 20)");
    //var legendSize = d3.legendSize()
    //  .scale(z)
    //  .shape('circle')
    //  .shapePadding(30)
    //  .labelOffset(20)
    //  .orient('horizontal');

    //svg.select(".legendSize")
    //  .style("opacity", "0.7")
    //  .call(legendSize);

    }
    draw('nof_talks');

    d3.selectAll("button.ts_input").on("click", function(){
        d3.selectAll('button.ts_input').classed('active', false);
        var button = d3.select(this);
        button.classed('active', true);
        draw(this.value)
    });


  })
  }
}

whenDocumentLoaded(() => {
  topbar('timeseries');
  const eventTimeseries = new EventTimeseries('#events_content',
    'resources/events.csv');
});
