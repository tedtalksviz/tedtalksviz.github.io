function whenDocumentLoaded(action) {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', action);
  } else {
    // `DOMContentLoaded` already fired
    action();
  }
}

whenDocumentLoaded(() => {
  const parallelCoords = new ParallelCoords('#correlation_content',
    'resources/ted_main.csv');
  const eventTimeseries = new EventTimeseries('#events_content',
    'resources/events.csv');
  const eventMap = new EventsMap('event-map');
});
