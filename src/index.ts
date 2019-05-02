console.log('hi');

window.addEventListener('keydown', onKeyDown);

function onKeyDown(keyboardEvent: KeyboardEvent) {
  console.log(keyboardEvent);
}

async function initializeAudio() {
  const response = await fetch('note.json');
  const notes = await response.json();
  console.log(Object.keys(notes));
}

initializeAudio();
