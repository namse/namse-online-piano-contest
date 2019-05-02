import { addKeyHandler, invokeKeyHandler } from "./setUpKeyboard";
import performanceManager from "./performanceManager";

class NetworkManager {
  private socket: SocketIOClient.Socket;

  initialize(serverUrl: string) {
    if (this.socket) {
      throw new Error('socket already initialized');
    }
    this.socket = io(serverUrl);

    this.socket.on('disconnect', () => {
      alert('disconnected');
      location.reload();
    })

    this.socket.on('duplicatedName', () => {
      alert('duplicated name!');
      this.setNameUp();
    });

    addKeyHandler((stepIndex: number, isKeyDown: boolean) => {
      if (!performanceManager.amIPerformer) {
        return;
      }

      this.socket.emit('changeNoteState', stepIndex, isKeyDown);
    });

    this.socket.on('changeNoteState', (stepIndex, isPressed) => {
      invokeKeyHandler(stepIndex , isPressed);
    });

    this.socket.on('newPerformer', (userId) => {
      performanceManager.performerId = userId;
    });

    this.socket.on('endPerformance', () => {
      performanceManager.performerId = null;
    });
  }

  public authenticate(): Promise<void> {
    return new Promise((resolve, _) => {
      this.setNameUp();
      this.socket.on('authenticated', (userId) => {
        performanceManager.myId = userId;
        resolve();
      });
    });
  }

  public setNameUp() {
    const name = prompt("your name is?");

    this.socket.emit('myNameIs', name);
  }

  public sendEvent(event: string, ...args: any[]) {
    this.socket.emit(event, ...args);
  }
}

const networkManager = new NetworkManager();
export default networkManager;