
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



whenDocumentLoaded(() => {
  const bubbleChartDict = {};
  const promise = d3.csv("resources/ted_main.csv", function(data, error) {


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

  // COULD ALSO USE PROMISE TO MAKE THE GRAPH
  //  Promise.all([
  //    d3.tsv('resources/edges.tsv'),
  //    d3.tsv('resources/nodes.tsv')
  //  ]).then(createTalksGraph);

  const plot2 = new ParallelCoords('#correlation_content', 'resources/ted_main.csv');


  const plot3 = new EventTimeseries('#events_content', 'resources/events.csv');
  const event_map = new EventsMap('event-map');

  function failureCallback(error) {
    window.alert("Error in getting promise 'MainData' " + error)

  };




});

