import keyboardSequence from "./keyboardSequence";
import performanceManager from "./performanceManager";

export default function setUpKeyboard() {
  window.addEventListener('keydown', onKeyDown);
  window.addEventListener('keyup', onKeyUp);
}

type KeyHandler = (stepIndex: number, isKeyDown: boolean) => void;
const keyHandlers: KeyHandler[] = []

export function addKeyHandler(handler: KeyHandler) {
  keyHandlers.push(handler);
}

export function invokeKeyHandler(stepIndex: number, isKeyDown: boolean) {
  keyHandlers.forEach((handler) => {
    handler(stepIndex, isKeyDown);
  });
}


const keyPressState: { [code: string]: boolean } = {};

function isKeyPressed(code: string): boolean {
  return !!keyPressState[code];
}

function onKeyDown(keyboardEvent: KeyboardEvent) {
  if (!performanceManager.amIPerformer) {
    return;
  }
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

  invokeKeyHandler(stepIndex, true);
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

  invokeKeyHandler(stepIndex, false);
}
