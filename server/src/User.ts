import * as uuid from 'uuid/v4';

export default class User {
  public readonly socket: SocketIO.Socket;
  public readonly name: string;
  public readonly id: string = uuid();

  constructor(socket: SocketIO.Socket, name: string) {
    this.socket = socket;
    this.name = name;
  }
}