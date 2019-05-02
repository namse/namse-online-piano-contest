console.log('hi');

window.addEventListener('keydown', onKeyDown);

function onKeyDown(keyboardEvent: KeyboardEvent) {
  console.log(keyboardEvent);
}