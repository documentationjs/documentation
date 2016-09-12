/* global anchors */

// add anchor links to headers
anchors.options.placement = 'left';
anchors.add('h3');

// Filter UI
var tocElements = document.getElementById('toc')
  .getElementsByTagName('li');

document.getElementById('filter-input')
  .addEventListener('keyup', function (e) {

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

    var match = function () {
      return true;
    };

    var value = this.value.toLowerCase();

    if (!value.match(/^\s*$/)) {
      match = function (element) {
        return element.firstChild.innerHTML.toLowerCase().indexOf(value) !== -1;
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

var toggleLinks = document.querySelectorAll('[data-namespacetarget]');
for (var i = 0; i < toggleLinks.length; i++) {
  toggleLinks[i].addEventListener('click', toggle);
}

function toggle() {
  var target = document.querySelector('[data-namespacecontent="' + this.dataset.namespacetarget + '"]');
  var caret = this.getElementsByClassName('caret')[0];
  var klass = 'section-nested';
  if (target.classList.contains(klass)) {
    target.classList.remove(klass);
    caret.innerHTML = '+';
  } else {
    target.classList.add(klass);
    caret.innerHTML = '-';
  }
}

function showHashTarget(targetId) {
  var hashTarget = document.getElementById(targetId);
  // new target is hidden
  if (hashTarget && hashTarget.offsetHeight === 0 &&
    hashTarget.parentNode.parentNode.classList.contains('display-none')) {
    hashTarget.parentNode.parentNode.classList.remove('display-none');
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
