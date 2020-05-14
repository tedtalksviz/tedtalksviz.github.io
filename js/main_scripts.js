function successCallBack(data) {
  const ratingsData = []
  for ([key, value] of Object.entries(data)) {
    ratingsData.push({'name': key, 'count': value});
  }
  const bubbleChartData = {
    'name': 'parent',
    'children': ratingsData
  };
  const bubbleChart = new BubbleChart('single_var_content', bubbleChartData);
}

function failureCallback(error) {
  window.alert('Error in getting ted_main.csv' + error)
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
  const promise = d3.json('resources/ratings.json')
    .then(successCallBack, failureCallback);
  const parallelCoords = new ParallelCoords('#correlation_content', 
                                            'resources/ted_main.csv');
  const eventTimeseries = new EventTimeseries('#events_content',
                                              'resources/events.csv');
  const eventMap = new EventsMap('event-map');
});
