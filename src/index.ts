import keyboardSequence from './keyboardSequence';
import audioManager from './audioManager';

window.addEventListener('keydown', onKeyDown);
window.addEventListener('keyup', onKeyUp);

const keyPressState: { [code: string]: boolean } = {};

function isKeyPressed(code: string): boolean {
  return !!keyPressState[code];
}

function onKeyDown(keyboardEvent: KeyboardEvent) {
  console.log(keyboardEvent);
  const { code } = keyboardEvent;

  const stepIndex = keyboardSequence.indexOf(code);
  if (stepIndex < 0 ) {
    return;
  }

  keyboardEvent.preventDefault();

  if (isKeyPressed(code))
  {
    return;
  }

  keyPressState[code] = true;

  audioManager.play(stepIndex);
}

function onKeyUp(keyboardEvent: KeyboardEvent) {
  const { code } = keyboardEvent;
  const stepIndex = keyboardSequence.indexOf(code);
;
  if (stepIndex < 0 ) {
    return;
  }

  if (!isKeyPressed(code))
  {
    return;
  }
  keyPressState[code] = false;
  audioManager.stop(stepIndex);
}

async function startUp() {
  await audioManager.initialize();
}

startUp();
