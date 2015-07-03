
var Application = Application || {};

Application.AssetsLoader = (function () {

	var store = {};
	// store.queue = [];
	store.queue = {};
	store.itemsCounter = 0;
	store.loadCounter = 0;

	store.progress = 0.0;
	store.progressHandlers = [];
	store.completionHandlers = [];

	function AssetsLoader () {
	};

	AssetsLoader.prototype.enqueueItem = function (item) {
		item.progress = 0.0;
		item.data = null;
		// store.queue.push(item);
		store.queue[item.id] = item;
		++store.itemsCounter;
	};
	AssetsLoader.prototype.getItemData = function (itemId) {
		var item = privateMethods.getItem.call(this, itemId);
		return (item ? item.data : null);
	};
	AssetsLoader.prototype.addProgressHandler = function (progressHandler) {
		store.progressHandlers.push(progressHandler);
	};
	AssetsLoader.prototype.addCompletionHandler = function (completionHandler) {
		store.completionHandlers.push(completionHandler);
	};
	AssetsLoader.prototype.loadItems = function () {
		var q = store.queue;
		// for (var i = 0; i < q.length; ++i) {
		// 	privateMethods.loadItem.call(this, q[i]);
		// }
		for (var property in q) {
		    if (q.hasOwnProperty(property)) {
		        privateMethods.loadItem.call(this, q[property]);
		    }
		}
	}

	var privateMethods = Object.create(AssetsLoader.prototype);
	privateMethods.getItem = function (itemId) {
		// var q = store.queue;
		// for (var i = 0; i < q.length; ++i) {
		// 	if (q[i].id === itemId) {
		// 		return q[i];
		// 	}
		// }
		// return null;
		var item = store.queue[itemId];
		return item;
	};
	privateMethods.loadItem = function (item) {
		var xhr = new XMLHttpRequest();
		xhr.item = item;

		// xhr.addEventListener('loadstart', loadStartHandler, false);
		xhr.addEventListener('progress', privateMethods.progressHandler.bind(this), false);

		// load, error, abort all together
		// xhr.addEventListener('loadend', loadEndHandler, false);

		xhr.addEventListener('load', privateMethods.completionHandler.bind(this), false);
		// xhr.addEventListener('error', errorHandler, false);
		// xhr.addEventListener('abort', abortHandler, false);
		 
		xhr.open('GET', item.src, true);
		if (item.src.indexOf('.png') != -1 || 
			item.src.indexOf('.jpg') != -1 || 
			item.src.indexOf('.gif') != -1) {
			xhr.type = 'img';
			xhr.responseType = 'blob';
		} else if(item.src.indexOf('.json')) {
			xhr.type = 'json';
		}
		xhr.send();
	};
	privateMethods.progressHandler = function (evt) {
		var xhr = evt.target;
		var id = xhr.item.id;
		var loaded = 0;
		var total = 0;
		if (evt.lengthComputable) {
			loaded = evt.loaded;
			total = evt.total;
		} 
		
		var newItemProgress = 0.0;
		if (total > 0) {
			newItemProgress = (loaded / total) / store.itemsCounter;
		}
		privateMethods.updateProgressState.call(this, id, newItemProgress);
	};
	privateMethods.completionHandler = function (evt) {
		++store.loadCounter;

		var that = this;
		var xhr = evt.target;
		var	id = xhr.item.id;
		var data = xhr.response;

		if (xhr.status === 200) {
			if (xhr.type === "img") {
				var img = new Image();
				img.onload = function(e){
					
					window.URL.revokeObjectURL(xhr.src);
					privateMethods.updateCompletionState.call(that, id, img);
				};
				img.src = window.URL.createObjectURL(data);
			} else if (xhr.type === "json") {
				var json = JSON.parse(data);
				privateMethods.updateCompletionState.call(that, id, json);
			}
		}
	};
	privateMethods.updateProgressState = function (itemId, newItemProgress) {
		var item = privateMethods.getItem.call(this, itemId);
		if (item) {
			store.progress += (-item.progress + newItemProgress);
			item.progress = newItemProgress;
			
			var phs = store.progressHandlers;
			for (var i = 0; i < phs.length; ++i) {
				phs[i](store.progress);
			}
		}

		// var newProgress = 0.0;
		// var q = store.queue;
		// for (var i = 0; i < q.length; ++i) {
		// 	newProgress += (q[i].progress / q.length);
		// }
		// store.progress = newProgress;
	};
	privateMethods.updateCompletionState = function (itemId, data) {
		console.log("Completion: " + itemId);
		var item = privateMethods.getItem.call(this, itemId);
		item.data = data;

		// var q = store.queue;
		// var loadedItemsCount = 0;
		// for (var i = 0; i < q.length; ++i) {
		// 	loadedItemsCount += (q[i].data === null ? 0 : 1);
		// }
		// if (q.length === loadedItemsCount) {
		if (store.loadCounter == store.itemsCounter) {
			var chs = store.completionHandlers;
			for (var i = 0; i < chs.length; ++i) {
				chs[i]();
			}
		}
	};
	
	return AssetsLoader;
})();
