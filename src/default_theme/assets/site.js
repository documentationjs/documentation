/* global anchors */

// add anchor links to headers
anchors.options.placement = 'left';
anchors.add('h3');

// Filter UI
var tocElements = document.getElementById('toc').getElementsByTagName('li');

document.getElementById('filter-input').addEventListener('keyup', function(e) {
  var i, element, children;

  // enter key
  if (e.keyCode === 13) {
    // go to the first displayed item in the toc
    for (i = 0; i < tocElements.length; i++) {
      element = tocElements[i];
      if (!element.classList.contains('display-none')) {
        location.replace(element.firstChild.href);
        return e.preventDefault();
      }
    }
  }

  var match = function() {
    return true;
  };

  var value = this.value.toLowerCase();

  if (!value.match(/^\s*$/)) {
    match = function(element) {
      var html = element.firstChild.innerHTML;
      return html && html.toLowerCase().indexOf(value) !== -1;
    };
  }

  for (i = 0; i < tocElements.length; i++) {
    element = tocElements[i];
    children = Array.from(element.getElementsByTagName('li'));
    if (match(element) || children.some(match)) {
      element.classList.remove('display-none');
    } else {
      element.classList.add('display-none');
    }
  }
});

var toggles = document.getElementsByClassName('toggle-step-sibling');
for (var i = 0; i < toggles.length; i++) {
  toggles[i].addEventListener('click', toggleStepSibling);
}

function toggleStepSibling() {
  var stepSibling = this.parentNode.parentNode.parentNode.getElementsByClassName(
    'toggle-target'
  )[0];
  var klass = 'display-none';
  if (stepSibling.classList.contains(klass)) {
    stepSibling.classList.remove(klass);
    stepSibling.innerHTML = '▾';
  } else {
    stepSibling.classList.add(klass);
    stepSibling.innerHTML = '▸';
  }
}

var items = document.getElementsByClassName('toggle-sibling');
for (var j = 0; j < items.length; j++) {
  items[j].addEventListener('click', toggleSibling);
}

function toggleSibling() {
  var stepSibling = this.parentNode.getElementsByClassName('toggle-target')[0];
  var icon = this.getElementsByClassName('icon')[0];
  var klass = 'display-none';
  if (stepSibling.classList.contains(klass)) {
    stepSibling.classList.remove(klass);
    icon.innerHTML = '▾';
  } else {
    stepSibling.classList.add(klass);
    icon.innerHTML = '▸';
  }
}

function showHashTarget(targetId) {
  if (targetId) {
    var hashTarget = document.getElementById(targetId);
    // new target is hidden
    if (
      hashTarget &&
      hashTarget.offsetHeight === 0 &&
      hashTarget.parentNode.parentNode.classList.contains('display-none')
    ) {
      hashTarget.parentNode.parentNode.classList.remove('display-none');
    }
  }
}

window.addEventListener('hashchange', function() {
  showHashTarget(location.hash.substring(1));
});

showHashTarget(location.hash.substring(1));

var toclinks = document.getElementsByClassName('pre-open');
for (var k = 0; k < toclinks.length; k++) {
  toclinks[k].addEventListener('mousedown', preOpen, false);
}

function preOpen() {
  showHashTarget(this.hash.substring(1));
}

var split_left = document.querySelector('#split-left');
var split_right = document.querySelector('#split-right');
var split_parent = split_left.parentNode;
var cw_with_sb = split_left.clientWidth;
split_left.style.overflow = 'hidden';
var cw_without_sb = split_left.clientWidth;
split_left.style.overflow = '';

// Need to add:
// - Half of gutterSize (i.e. 10) because gutter will take that much from each.
// - Scrollbar width (cw_with_sb - cw_without_sb), if it takes up existing
//   space (Firefox) rather than adding the scrollbar to the side (Chrome)
var percent_left =
  (split_left.getBoundingClientRect().width + 10 + cw_without_sb - cw_with_sb) /
  split_parent.getBoundingClientRect().width *
  100;

Split(['#split-left', '#split-right'], {
  elementStyle: function(dimension, size, gutterSize) {
    return {
      'flex-basis': 'calc(' + size + '% - ' + gutterSize + 'px)'
    };
  },
  gutterStyle: function(dimension, gutterSize) {
    return {
      'flex-basis': gutterSize + 'px'
    };
  },
  gutterSize: 20,
  sizes: [percent_left, 100 - percent_left]
});

// Chrome doesn't remember scroll position properly so do it ourselves.

window.addEventListener('beforeunload', function() {
  history.replaceState(
    {
      left_top: split_left.scrollTop,
      right_top: split_right.scrollTop
    },
    document.title
  );
});

window.addEventListener('load', function() {
  if (history.state) {
    if (history.state.left_top) {
      split_left.scrollTop = history.state.left_top;
    }
    if (history.state.right_top) {
      split_right.scrollTop = history.state.right_top;
    }
  }
});
