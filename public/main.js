function addAppEntry(name, info) {
	var path = '/' + name + '/';

	var entry = document.createElement('a');
	entry.href = path;
	entry.className = 'app';

	var name = document.createElement('div');
	name.className = 'app-name';
	name.innerHTML = info.name;

	var desc = document.createElement('div');
	desc.className = 'app-desc';
	desc.innerHTML = info.description;

	if(info.image) {
		var img = document.createElement('img');
		img.className = 'app-image';
		img.src = path + info.image;
		entry.appendChild(img);
	}

	var textContainer = document.createElement('div');
	textContainer.className = 'app-text-container';
	textContainer.appendChild(name);
	textContainer.appendChild(desc);

	entry.appendChild(textContainer);

	document.getElementById('apps').appendChild(entry);
}

function ready() {
	$('#loader').append(createLoader('Loading...'));

	var websocket = openWebSocket();
	websocket.onopen = function(event) {
		$('#loader').empty();
		console.log('websocket opened');
	};
	websocket.onclose = function(event) { 
		console.log('websocket closed');
	};
	websocket.onmessage = function(event) {
		console.log('ws message: ' + event.data);
		var apps = JSON.parse(event.data);
		for(var name in apps) {
			addAppEntry(name, apps[name]);
		}
	};
	websocket.onerror = function(event) { 
		console.error('websocket error: ' + event.error);
	};
}

$(document).ready(ready);