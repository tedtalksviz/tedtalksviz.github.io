class EventTimeseries {
    constructor(svg_element_id, data_address) {
    // set the dimensions and margins of the graph
    var margin = {top: 30, right: 30, bottom: 30, left: 30},
    width = 1600 - margin.left - margin.right,
    height = 800 - margin.top - margin.bottom;
    var row = 0
    var i = 0
    var timeparser = d3.timeParse("%Y-%m-%d")

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
            data[row].film_date = timeparser(data[row]['film_date'])
        }
    }
    d3.selectAll("input").on("change", function(){
        draw(this.value)
        console.log(this.value)
    });

    function filter_rows_start(input_data, dim, low, high) {
        var output_data = input_data.filter(function(row){
            return row[dim] <= (high) && row[dim] >= (low)
        })
        return output_data
    }

      data = filter_rows_start(data, 'film_date', timeparser('2000-01-01'), timeparser('2020-01-01'))

      var x = d3.scaleLinear()
        .domain( d3.extent(data, function(d) { return +d['film_date']; }) )
        .range([0, width])


   function draw(y_axis) {
          svg.selectAll("*").remove();

          svg.append('g')
            .attr('transform', 'translate(0,' + height + ')')
            .call(d3.axisBottom()
                    .scale(x)
                   // .ticks(7)
                    .tickSize(4,0)
                    .tickFormat( d3.timeFormat("%m/%Y") )
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


      svg.append("g")
        .call(d3.axisLeft(y));

    // Add a scale for bubble size
      var z = d3.scaleLinear()
            .domain( d3.extent(data, function(d) {return +d['nof_talks']} ) )
            .range([ 4, 36.66]); //smallest is 1 talk, largest is about 84
                              //4*4 = 16 & 36.66*36.66 = 1344, 1344/16 = 84
      var c = d3.scaleOrdinal(data.map(x => x.event_type), d3.schemeCategory10)
            .unknown("black")


      // Add dots
      svg.append('g')
        .selectAll("dot")
        .data(data)
        .enter()
        .append("circle")
          .attr("cx", data =>  x(data.film_date)  )
          .attr("cy", data => y(data[y_axis])  )
          .attr("r", data =>  z(data.nof_talks)  )
          .attr("fill", data => c(data.event_type))
          .style("opacity", "0.7")
          .attr("stroke", "black")

        svg.append("g")
          .attr("class", "legendSequential")
          .attr("transform", "translate(20,20)");

        var legendSequential = d3.legendColor()
            .shapeWidth(100)
            .cells(10)
            .orient("horizontal")
            .scale(c)

        svg.select(".legendSequential")
          .call(legendSequential);

        svg.append("g")
          .attr("class", "legendSize")
          .attr("transform", "translate(1000, 20)");

        var legendSize = d3.legendSize()
          .scale(z)
          .shape('circle')
          .shapePadding(30)
          .labelOffset(20)
          .orient('horizontal');

        svg.select(".legendSize")
          .style("opacity", "0.7")
          .call(legendSize);

      }


  draw('avg_views');


  })
  }
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
  const eventTimeseries = new EventTimeseries('#events_content',
                                              'resources/events.csv');
});
