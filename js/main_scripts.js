
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

whenDocumentLoaded(() => {
  const data = dummy_values.map((value, index) => {
    return {'id': index, 'name': RATINGS[index], 'counts': value, 'x': 5, 'y': 4, 'r': 2}
  });

  const plot = new BubbleChart('single_var_content', data);

});
