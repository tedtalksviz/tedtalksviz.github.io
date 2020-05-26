function whenDocumentLoaded(action) {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', action);
  } else {
    // `DOMContentLoaded` already fired
    action();
  }
}

function topbar(current_page){
  var top_bar_link = d3.select('#' + current_page + '_link')
  top_bar_link.attr('class', 'tp-column active')
  return top_bar_link
}

