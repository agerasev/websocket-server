function createLoader(text) {
	var loader = document.createElement('div');
	loader.className = 'loader';

	var speed = 10.0;
	var delay = 0.5;
	var duration = (delay + text.length/speed) + 's';

	for(var i = 0; i < text.length; ++i) {
		var word = document.createElement('div');
		word.className = 'loader-word';
		word.innerHTML = text.charAt(i);

		word.style.animationDuration = duration;
		word.style.animationDelay = i/speed + 's';

		loader.appendChild(word);
	}
	return loader;
}