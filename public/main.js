function addAppEntry(path) {
	$.ajax(path + 'about.json').done(function(about) {
		var entry = document.createElement('a');
		entry.href = path;
		entry.className = 'app';

		var name = document.createElement('div');
		name.className = 'app-name';
		name.innerHTML = about.name;

		var desc = document.createElement('div');
		desc.className = 'app-desc';
		desc.innerHTML = about.description;

		if(about.image) {
			var img = document.createElement('img');
			img.className = 'app-image';
			img.src = path + about.image;
			entry.appendChild(img);
		}

		var textContainer = document.createElement('div');
		textContainer.className = 'app-text-container';
		textContainer.appendChild(name);
		textContainer.appendChild(desc);

		entry.appendChild(textContainer);

		document.getElementById('apps').appendChild(entry);
	});
}

function ready() {
	var websocket = openWebSocket();
	websocket.onopen = function(event) {
		console.log('websocket opened');
	};
	websocket.onclose = function(event) { 
		console.log('websocket closed');
	};
	websocket.onmessage = function(event) {
		console.log('ws message: ' + event.data);
		var path = '/' + event.data + '/';
		addAppEntry(path);
	};
	websocket.onerror = function(event) { 
		console.error('websocket error: ' + event.error);
	};
}

$(document).ready(ready);