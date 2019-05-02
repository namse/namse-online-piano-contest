class User {
  public readonly id: string;
  public username: string;

  constructor(id: string, username: string) {
    this.id = id;
    this.username = username;
  }
}

const raiseHandButton = document.getElementById('raise-hand-button');
raiseHandButton.hidden = false;
const endPerformanceButton = document.getElementById('end-performance-button');
endPerformanceButton.hidden = true;

class PerformanceManager {
  private _performerId: string;
  public get performerId(): string {
    return this._performerId;
  };
  public set performerId(value: string) {
    if (!value) {
      raiseHandButton.hidden = false;
      endPerformanceButton.hidden = true;
    } else if (value === this.myId) {
      raiseHandButton.hidden = true;
      endPerformanceButton.hidden = false;
    } else {
      raiseHandButton.hidden = false;
      endPerformanceButton.hidden = true;
    }
    this._performerId = value;
  };

  public myId: string;
  public readonly users: User[] = [];

  public get amIPerformer() {
    return this.performerId && this.performerId === this.myId;
  }

  public AddUser(userId: string, username: string) {
    const newUser = new User(userId, username);

    if (this.users.some(user => user.id === userId)) {
      throw new Error(`user id duplicated : ${userId}`);
    }

    this.users.push(newUser);
  }

  public ChangeUsername(userId: string, username: string) {
    const user = this.users.find(_user => _user.id == userId);
    if (!user) {
      return;
    }
    user.username = username;
  }
}

const performanceManager = new PerformanceManager();

export default performanceManager;
