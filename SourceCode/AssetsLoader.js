
var Application = Application || {};

Application.AssetsLoader = (function () {

	var store = {};
	store.queue = [];

	store.progress = 0.0;
	store.progressHandlers = [];
	store.completionHandlers = [];

	function AssetsLoader () {
	};

	AssetsLoader.prototype.enqueueItem = function (item) {
		item.progress = 0.0;
		item.data = null;
		store.queue.push(item);
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
		for (var i = 0; i < q.length; ++i) {
			privateMethods.loadItem.call(this, q[i]);
		}
	}

	var privateMethods = Object.create(AssetsLoader.prototype);
	privateMethods.getItem = function (itemId) {
		var q = store.queue;
		for (var i = 0; i < q.length; ++i) {
			if (q[i].id === itemId) {
				return q[i];
			}
		}
		return null;
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
		 
		xhr.open('GET', item.src);
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
		var loaded = 0;
		var total = 0;
		if (evt.lengthComputable) {
			loaded = evt.loaded;
			total = evt.total;
		} else
			return;

		var xhr = evt.target;
		var id = xhr.item.id;
		var item = privateMethods.getItem.call(this, id);
		if (item && total > 0) {
			item.progress = loaded / total;
			privateMethods.updateProgressState.call(this);
		}
	};
	privateMethods.completionHandler = function (evt) {
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
	privateMethods.updateProgressState = function () {
		var newProgress = 0.0;
		var q = store.queue;
		for (var i = 0; i < q.length; ++i) {
			newProgress += (q[i].progress / q.length);
		}
		store.progress = newProgress;

		var phs = store.progressHandlers;
		for (var i = 0; i < phs.length; ++i) {
			phs[i](store.progress);
		}
	};
	privateMethods.updateCompletionState = function (itemId, data) {
		console.log("Completion: " + itemId);
		var item = privateMethods.getItem.call(this, itemId);
		item.data = data;

		var q = store.queue;
		var loadedItemsCount = 0;
		for (var i = 0; i < q.length; ++i) {
			loadedItemsCount += (q[i].data === null ? 0 : 1);
		}
		if (q.length === loadedItemsCount) {
			var chs = store.completionHandlers;
			for (var i = 0; i < chs.length; ++i) {
				chs[i]();
			}
		}
	};
	
	return AssetsLoader;
})();
