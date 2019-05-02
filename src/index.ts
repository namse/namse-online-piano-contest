import keyboardSequence from './keyboardSequence';
import audioManager from './audioManager';

window.addEventListener('keydown', onKeyDown);
window.addEventListener('keyup', onKeyUp);

const keyPressState: { [key: string]: boolean } = {};

function isKeyPressed(key: string): boolean {
  return !!keyPressState[key];
}

function onKeyDown(keyboardEvent: KeyboardEvent) {
  console.log(keyboardEvent);
  const { key } = keyboardEvent;
  const lowercaseKey = key.toLowerCase();

  const stepIndex = keyboardSequence.indexOf(lowercaseKey);
  if (stepIndex < 0 ) {
    return;
  }

  keyboardEvent.preventDefault();

  if (isKeyPressed(lowercaseKey))
  {
    return;
  }

  keyPressState[lowercaseKey] = true;

  audioManager.play(stepIndex);
}

function onKeyUp(keyboardEvent: KeyboardEvent) {
  const { key } = keyboardEvent;
  const lowercaseKey = key.toLowerCase();
  const stepIndex = keyboardSequence.indexOf(lowercaseKey);
;
  if (stepIndex < 0 ) {
    return;
  }

  if (!isKeyPressed(lowercaseKey))
  {
    return;
  }
  keyPressState[lowercaseKey] = false;
  audioManager.stop(stepIndex);
}

async function startUp() {
  await audioManager.initialize();
}

startUp();
