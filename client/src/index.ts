import audioManager from './audioManager';
import setUpKeyboard from './setUpKeyboard';
import networkManager from './networkManager';
import performanceManager from './performanceManager';

const serverUrl = 'http://localhost:6974';

async function startUp() {
  setUpKeyboard();
  networkManager.initialize(serverUrl);
  await networkManager.authenticate();
  await audioManager.initialize();
}

startUp();

function raiseHand() {
  networkManager.sendEvent('raiseHand');
}

function endPerformance() {
  performanceManager.performerId = null;
  networkManager.sendEvent('endPerformance');
}

const raiseHandButton = document.getElementById('raise-hand-button');
raiseHandButton.onclick = () => {
  raiseHand();
};

const endPerformanceButton = document.getElementById('end-performance-button');
endPerformanceButton.onclick = () => {
  endPerformance();
};
