/*
 * Palantír Pocket
 * http://mynameisrienk.com/?palantir
 * https://github.com/MyNameIsRienk/PalantírPocket
 **/

/*
 * IMPORTANT!
 * Temporarily added ?[Date.now] params to all urls to easily bypass
 * caching. This needs to be remove prior to commit for production!
 *
 * PROBLEM!
 * The window does not deal well with zoomed out (i.e. non-responsive)
 * web pages on iOS. Possible solutions are (1) setting body overflow
 * to hidden and dimensions equel to device window size, (2) a more
 * responsive version using FlameViewportScale.js^, (3) resetting
 * the viewport meta attributes.
 * ^http://menacingcloud.com/source/js/FlameViewportScale.js
 **/

var PP_JSON  = PP_JSON || '//mynameisrienk.github.io/palantirpocket/data.json?' + Date.now();
var PP_CSS   = PP_CSS  || '//mynameisrienk.github.io/palantirpocket/stylesheet.css?' + Date.now();
var PP_ICON  = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAArklEQVR4XqWQQQqDQAxFf1zY21k3XsAeoHgYu7NasV5QqM5mUlACw5RMWvrh7T6Pn2TMjH/IEGSaJtYgIoRIQsFurKrqg2VZMI4jI04s8P7obJsTICmKM4bhIRJ9QSplWaLvB04s8ADiW4975/m5s64vdN2df1pQ15cQ6SkLojjnQqSnC4hgYAiOUAJbYCA9/YkW9hOJdOwFIOT5SQWg1AJG295MvFcETXOlbxHBG8Vy2fHIq9l6AAAAAElFTkSuQmCC";

/* Insert DOM Elements
============================================================================ */

function palantirCallback(data) {

  // Stringify & parse as a precaution; reverse data to keep with JSON file
  window.list = JSON.parse(JSON.stringify(data)) || data;

  var palantir = document.createDocumentFragment();

  var div = document.createElement('div');
  div.id = 'PALANTIR';

  var box = document.createElement('div');
  box.id  = 'palantir-search-box';

  var field = document.createElement('div');
  field.id = 'palantir-search-field';

  var search = document.createElement('input');
  search.id = 'palantir-search';
  search.type = 'search';
  search.placeholder = 'Search'

  var ul = document.createElement('ul');
  ul.id = 'palantir-results';

  // Loop through the JSONP provided object
  for (var i = 0; i < list.length; i++) {
    var li  = document.createElement('li');

    // Add favicons (if available)
    if(list[i].icon != null) {
      var icon = list[i].icon;
    } else {
      var domain = list[i].url.match(/(https?:\/\/)([\da-z\.-]+)\.([a-z\.]{2,6})\/?/);
      var icon = (domain) ?
            'http://' + domain[2].replace('www.','').substr(0,1) + '.getfavicon.appspot.com/' + domain[0] + '?defaulticon=lightpng':
             PP_ICON;
    }
 
    var a   = document.createElement('a');
    a.href  = list[i].url;
    var desc = (list[i].description != null) ? list[i].description : list[i].url;
    var txt = "<span>" + list[i].title + "</span>" + desc;

    a.innerHTML = txt;
    li.appendChild(a);
    li.style.backgroundImage = "url(" + icon + ")";
    ul.appendChild(li);
  };

  // Append window to screen
  field.appendChild(search);
  box.appendChild(field);
  div.appendChild(box);
  div.appendChild(ul);
  palantir.appendChild(div);
  document.getElementsByTagName('body')[0].appendChild(palantir);

  // Add an open/close button
  var btn = document.createElement('a');
  btn.href = 'javascript:void(0);'
  btn.id = 'palantir-close';
  btn.addEventListener('click', function(e) {
    var el = document.getElementById('PALANTIR');
    el.className = (el.className != 'open' ? 'open' : '');
  });
  document.getElementsByTagName('body')[0].appendChild(btn);

  // Calling clientHeight forces layout on element, req. for animation
  var reset = div.clientHeight;
  div.className = 'open';

  // Add search function
  document.getElementById('palantir-search').addEventListener('keyup', palantirSearch );
  document.getElementById('palantir-search').addEventListener('click', palantirSearch );
  document.getElementById('palantir-search').addEventListener('blur', palantirSearch );
}

function palantirSearch() {
  var items = document.getElementById('palantir-results').getElementsByTagName('li');
  var val = document.getElementById('palantir-search').value;
  if( val ) {

    for (var i = items.length - 1; i >= 0; i--) {
      items[i].style.display="none";
    };

    // Escape Regex specials and split query words
    var input = val.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, "\\$&");
    input = input.split(/\s/);

    // Create a regex for query words in any order
    var regex = '^';
    for( i = 0; i < input.length; i++ ) {
      regex += '(?=.*' + input[i] + ')';
    }
    var query = new RegExp( regex, 'i' );

    // Query the list of items
    list.filter( function( value, index, list ) {
      if( (value.title + value.description).search( query ) !== -1 ) {
            items[index].style.display="block";
          }
    }, query );
  } else {
    for (var i = items.length - 1; i >= 0; i--) {
      items[i].style.display="block";
    };
  }
}

/* Insert JSONP & CSS
============================================================================ */

var css = document.createElement('style');
css.type = 'text/css';
css.innerHTML = '@import "' + PP_CSS + '";';
document.getElementsByTagName('body')[0].appendChild(css);

var head = document.getElementsByTagName('head')[0];
var palantirFile = document.createElement('script');
palantirFile.type = 'text/javascript';
palantirFile.src = PP_JSON;
head.appendChild(palantirFile);