// modules are defined as an array
// [ module function, map of requires ]
//
// map of requires is short require name -> numeric require
//
// anything defined in a previous bundle is accessed via the
// orig method which is the require for previous bundles
parcelRequire = (function (modules, cache, entry, globalName) {
  // Save the require from previous bundle to this closure if any
  var previousRequire = typeof parcelRequire === 'function' && parcelRequire;
  var nodeRequire = typeof require === 'function' && require;

  function newRequire(name, jumped) {
    if (!cache[name]) {
      if (!modules[name]) {
        // if we cannot find the module within our internal map or
        // cache jump to the current global require ie. the last bundle
        // that was added to the page.
        var currentRequire = typeof parcelRequire === 'function' && parcelRequire;
        if (!jumped && currentRequire) {
          return currentRequire(name, true);
        }

        // If there are other bundles on this page the require from the
        // previous one is saved to 'previousRequire'. Repeat this as
        // many times as there are bundles until the module is found or
        // we exhaust the require chain.
        if (previousRequire) {
          return previousRequire(name, true);
        }

        // Try the node require function if it exists.
        if (nodeRequire && typeof name === 'string') {
          return nodeRequire(name);
        }

        var err = new Error('Cannot find module \'' + name + '\'');
        err.code = 'MODULE_NOT_FOUND';
        throw err;
      }

      localRequire.resolve = resolve;
      localRequire.cache = {};

      var module = cache[name] = new newRequire.Module(name);

      modules[name][0].call(module.exports, localRequire, module, module.exports, this);
    }

    return cache[name].exports;

    function localRequire(x){
      return newRequire(localRequire.resolve(x));
    }

    function resolve(x){
      return modules[name][1][x] || x;
    }
  }

  function Module(moduleName) {
    this.id = moduleName;
    this.bundle = newRequire;
    this.exports = {};
  }

  newRequire.isParcelRequire = true;
  newRequire.Module = Module;
  newRequire.modules = modules;
  newRequire.cache = cache;
  newRequire.parent = previousRequire;
  newRequire.register = function (id, exports) {
    modules[id] = [function (require, module) {
      module.exports = exports;
    }, {}];
  };

  var error;
  for (var i = 0; i < entry.length; i++) {
    try {
      newRequire(entry[i]);
    } catch (e) {
      // Save first error but execute all entries
      if (!error) {
        error = e;
      }
    }
  }

  if (entry.length) {
    // Expose entry point to Node, AMD or browser globals
    // Based on https://github.com/ForbesLindesay/umd/blob/master/template.js
    var mainExports = newRequire(entry[entry.length - 1]);

    // CommonJS
    if (typeof exports === "object" && typeof module !== "undefined") {
      module.exports = mainExports;

    // RequireJS
    } else if (typeof define === "function" && define.amd) {
     define(function () {
       return mainExports;
     });

    // <script>
    } else if (globalName) {
      this[globalName] = mainExports;
    }
  }

  // Override the current require with this new one
  parcelRequire = newRequire;

  if (error) {
    // throw error from earlier, _after updating parcelRequire_
    throw error;
  }

  return newRequire;
})({"index.js":[function(require,module,exports) {
// IndexedDB API
// Create needed constants
var list = document.querySelector('ul');
var titleInput = document.querySelector('#title');
var bodyInput = document.querySelector('#body');
var form = document.querySelector('form');
var submitBtn = document.querySelector('form button');
form.addEventListener('submit', function (e) {
  e.preventDefault();
}); // Create an instance of a db object for us to store the open database in

var db;

window.onload = function () {
  var request = window.indexedDB.open('notes_db', 1); // onerror handler signifies that the database didn't open successfully

  request.onerror = function () {
    console.log('Database failed to open');
  }; // onsuccess handler signifies that the database opened successfully


  request.onsuccess = function () {
    console.log('Database opened successfully'); // Store the opened database object in the db variable. This is used a lot below

    db = request.result; // Run the displayData() function to display the notes already in the IDB

    displayData();
  }; // Setup the database tables if this has not already been done


  request.onupgradeneeded = function (e) {
    // Grab a reference to the opened database
    var db = e.target.result; // Create an objectStore to store our notes in (basically like a single table)
    // including a auto-incrementing key

    var objectStore = db.createObjectStore('notes_os', {
      keyPath: 'id',
      autoIncrement: true
    }); // Define what data items the objectStore will contain

    objectStore.createIndex('title', 'title', {
      unique: false
    });
    objectStore.createIndex('body', 'body', {
      unique: false
    });
    console.log('Database setup complete');
  }, // Create an onsubmit handler so that when the form is submitted the addData() function is run
  form.onsubmit = addData;

  function addData(e) {
    e.preventDefault(); // grab the values entered into the form fields and store them in an object ready for being inserted into the DB

    var newItem = {
      title: titleInput.value,
      body: bodyInput.value
    }; // open a read/write db transaction, ready for adding the data

    var transaction = db.transaction(['notes_os'], 'readwrite'); // call an object store that's already been added to the database

    var objectStore = transaction.objectStore('notes_os'); // Make a request to add our newItem object to the object store

    var request = objectStore.add(newItem);

    request.onsuccess = function () {
      // Clear the form, ready for adding the next entry
      titleInput.value = '';
      bodyInput.value = '';
    }; // Report on the success of the transaction completing, when everything is done


    transaction.oncomplete = function () {
      console.log('Transaction completed: database modification finished.'); // update the display of data to show the newly added item, by running displayData() again.

      displayData();
    };

    transaction.onerror = function () {
      console.log('Transaction not opened due to error');
    };
  } // Displaying data


  function displayData() {
    // Here we empty the contents of the list element each time the display is updated
    // If you didn't do this, you'd get duplicates listed each time a new note is added
    while (list.firstChild) {
      list.removeChild(list.firstChild);
    } // Open our object store and then get a cursor - which iterates through all the
    // different data items in the store


    var objectStore = db.transaction('notes_os').objectStore('notes_os');

    objectStore.openCursor().onsuccess = function (e) {
      // Get a reference to the cursor
      var cursor = e.target.result; // If there is still another data item to iterate through, keep running this code

      if (cursor) {
        // Create a list item, h3, and p to put each data item inside when displaying it
        // structure the HTML fragment, and append it inside the list
        var listItem = document.createElement('li');
        var h3 = document.createElement('h3');
        var para = document.createElement('p');
        listItem.appendChild(h3);
        listItem.appendChild(para);
        list.appendChild(listItem); // Put the data from the cursor inside the h3 and para

        h3.textContent = cursor.value.title;
        para.textContent = cursor.value.body; // Store the ID of the data item inside an attribute on the listItem, so we know
        // which item it corresponds to. This will be useful later when we want to delete items

        listItem.setAttribute('data-note-id', cursor.value.id); // Create a button and place it inside each listItem

        var deleteBtn = document.createElement('button');
        listItem.appendChild(deleteBtn);
        deleteBtn.textContent = 'Delete'; // Set an event handler so that when the button is clicked, the deleteItem()
        // function is run

        deleteBtn.onclick = deleteItem; // Iterate to the next item in the cursor

        cursor.continue();
      } else {
        // Again, if list item is empty, display a 'No notes stored' message
        if (!list.firstChild) {
          var _listItem = document.createElement('li');

          _listItem.textContent = 'No notes stored.';
          list.appendChild(_listItem);
        } // if there are no more cursor items to iterate through, say so


        console.log('Notes all displayed');
      }
    };
  }

  function deleteItem(e) {
    // retrieve the name of the task we want to delete. We need
    // to convert it to a number before trying it use it with IDB; IDB key
    // values are type-sensitive.
    var noteId = Number(e.target.parentNode.getAttribute('data-note-id')); // open a database transaction and delete the task, finding it using the id we retrieved above

    var transaction = db.transaction(['notes_os'], 'readwrite');
    var objectStore = transaction.objectStore('notes_os');
    var request = objectStore.delete(noteId); // report that the data item has been deleted

    transaction.oncomplete = function () {
      // delete the parent of the button
      // which is the list item, so it is no longer displayed
      e.target.parentNode.parentNode.removeChild(e.target.parentNode);
      console.log('Note ' + noteId + ' deleted.'); // Again, if list item is empty, display a 'No notes stored' message

      if (!list.firstChild) {
        var listItem = document.createElement('li');
        listItem.textContent = 'No notes stored.';
        list.appendChild(listItem);
      }
    };
  }
};
},{}],"../node_modules/parcel-bundler/src/builtins/hmr-runtime.js":[function(require,module,exports) {
var global = arguments[3];
var OVERLAY_ID = '__parcel__error__overlay__';
var OldModule = module.bundle.Module;

function Module(moduleName) {
  OldModule.call(this, moduleName);
  this.hot = {
    data: module.bundle.hotData,
    _acceptCallbacks: [],
    _disposeCallbacks: [],
    accept: function (fn) {
      this._acceptCallbacks.push(fn || function () {});
    },
    dispose: function (fn) {
      this._disposeCallbacks.push(fn);
    }
  };
  module.bundle.hotData = null;
}

module.bundle.Module = Module;
var checkedAssets, assetsToAccept;
var parent = module.bundle.parent;

if ((!parent || !parent.isParcelRequire) && typeof WebSocket !== 'undefined') {
  var hostname = "" || location.hostname;
  var protocol = location.protocol === 'https:' ? 'wss' : 'ws';
  var ws = new WebSocket(protocol + '://' + hostname + ':' + "60172" + '/');

  ws.onmessage = function (event) {
    checkedAssets = {};
    assetsToAccept = [];
    var data = JSON.parse(event.data);

    if (data.type === 'update') {
      var handled = false;
      data.assets.forEach(function (asset) {
        if (!asset.isNew) {
          var didAccept = hmrAcceptCheck(global.parcelRequire, asset.id);

          if (didAccept) {
            handled = true;
          }
        }
      }); // Enable HMR for CSS by default.

      handled = handled || data.assets.every(function (asset) {
        return asset.type === 'css' && asset.generated.js;
      });

      if (handled) {
        console.clear();
        data.assets.forEach(function (asset) {
          hmrApply(global.parcelRequire, asset);
        });
        assetsToAccept.forEach(function (v) {
          hmrAcceptRun(v[0], v[1]);
        });
      } else if (location.reload) {
        // `location` global exists in a web worker context but lacks `.reload()` function.
        location.reload();
      }
    }

    if (data.type === 'reload') {
      ws.close();

      ws.onclose = function () {
        location.reload();
      };
    }

    if (data.type === 'error-resolved') {
      console.log('[parcel] ✨ Error resolved');
      removeErrorOverlay();
    }

    if (data.type === 'error') {
      console.error('[parcel] 🚨  ' + data.error.message + '\n' + data.error.stack);
      removeErrorOverlay();
      var overlay = createErrorOverlay(data);
      document.body.appendChild(overlay);
    }
  };
}

function removeErrorOverlay() {
  var overlay = document.getElementById(OVERLAY_ID);

  if (overlay) {
    overlay.remove();
  }
}

function createErrorOverlay(data) {
  var overlay = document.createElement('div');
  overlay.id = OVERLAY_ID; // html encode message and stack trace

  var message = document.createElement('div');
  var stackTrace = document.createElement('pre');
  message.innerText = data.error.message;
  stackTrace.innerText = data.error.stack;
  overlay.innerHTML = '<div style="background: black; font-size: 16px; color: white; position: fixed; height: 100%; width: 100%; top: 0px; left: 0px; padding: 30px; opacity: 0.85; font-family: Menlo, Consolas, monospace; z-index: 9999;">' + '<span style="background: red; padding: 2px 4px; border-radius: 2px;">ERROR</span>' + '<span style="top: 2px; margin-left: 5px; position: relative;">🚨</span>' + '<div style="font-size: 18px; font-weight: bold; margin-top: 20px;">' + message.innerHTML + '</div>' + '<pre>' + stackTrace.innerHTML + '</pre>' + '</div>';
  return overlay;
}

function getParents(bundle, id) {
  var modules = bundle.modules;

  if (!modules) {
    return [];
  }

  var parents = [];
  var k, d, dep;

  for (k in modules) {
    for (d in modules[k][1]) {
      dep = modules[k][1][d];

      if (dep === id || Array.isArray(dep) && dep[dep.length - 1] === id) {
        parents.push(k);
      }
    }
  }

  if (bundle.parent) {
    parents = parents.concat(getParents(bundle.parent, id));
  }

  return parents;
}

function hmrApply(bundle, asset) {
  var modules = bundle.modules;

  if (!modules) {
    return;
  }

  if (modules[asset.id] || !bundle.parent) {
    var fn = new Function('require', 'module', 'exports', asset.generated.js);
    asset.isNew = !modules[asset.id];
    modules[asset.id] = [fn, asset.deps];
  } else if (bundle.parent) {
    hmrApply(bundle.parent, asset);
  }
}

function hmrAcceptCheck(bundle, id) {
  var modules = bundle.modules;

  if (!modules) {
    return;
  }

  if (!modules[id] && bundle.parent) {
    return hmrAcceptCheck(bundle.parent, id);
  }

  if (checkedAssets[id]) {
    return;
  }

  checkedAssets[id] = true;
  var cached = bundle.cache[id];
  assetsToAccept.push([bundle, id]);

  if (cached && cached.hot && cached.hot._acceptCallbacks.length) {
    return true;
  }

  return getParents(global.parcelRequire, id).some(function (id) {
    return hmrAcceptCheck(global.parcelRequire, id);
  });
}

function hmrAcceptRun(bundle, id) {
  var cached = bundle.cache[id];
  bundle.hotData = {};

  if (cached) {
    cached.hot.data = bundle.hotData;
  }

  if (cached && cached.hot && cached.hot._disposeCallbacks.length) {
    cached.hot._disposeCallbacks.forEach(function (cb) {
      cb(bundle.hotData);
    });
  }

  delete bundle.cache[id];
  bundle(id);
  cached = bundle.cache[id];

  if (cached && cached.hot && cached.hot._acceptCallbacks.length) {
    cached.hot._acceptCallbacks.forEach(function (cb) {
      cb();
    });

    return true;
  }
}
},{}]},{},["../node_modules/parcel-bundler/src/builtins/hmr-runtime.js","index.js"], null)
//# sourceMappingURL=/src.e31bb0bc.js.map