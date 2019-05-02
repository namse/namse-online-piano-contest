import * as socketIo from 'socket.io';
import User from './User';

const port = 6974;
const io = socketIo(port);

function broadcast(sockets: socketIo.Socket[], event: string | symbol, ...args: any[]): void
{
  sockets.forEach(socket => socket.emit(event, ...args));
}

function broadcastWithout(sockets: socketIo.Socket[], withoutSocket: socketIo.Socket, event: string | symbol, ...args: any[]): void
{
  const socketsWithout = sockets.filter(socket => socket !== withoutSocket);
  broadcast(socketsWithout, event, ...args);
}

let performer: User;
function isPerformer(user: User): boolean {
  return performer && user === performer;
}

function onEndPerformance(user: User) {
  if (!isPerformer(user)) {
    return;
  }

  performer = null;

  broadcastWithout(sockets, user.socket, 'endPerformance');
}

let sockets: socketIo.Socket[] = [];
let users: User[] = [];

io.on('connection', socket => {
  let user: User;
  let isAuthenticated = false;

  socket.on('disconnect', () => {
    if (user) {
      console.log(`${user.name} has been disconnected`);
    }

    if (isAuthenticated && isPerformer(user)) {
      onEndPerformance(user);
    }
    sockets = sockets.filter(_socket => _socket !== socket);
    users = users.filter(_user => _user !== user);
  });

  // this is authentication
  socket.on('myNameIs', (name) => {
    if (isAuthenticated) {
      return;
    }
    const isDuplicatedName = users.some(_user => _user.name === name);
    if (isDuplicatedName) {
      socket.emit('duplicatedName');
      return;
    }
    console.log(`[myNameIs] ${name}`);
    sockets.push(socket);
    user = new User(socket, name);
    users.push(user);
    isAuthenticated = true;

    socket.emit('authenticated', user.id);
  })

  socket.on('changeNoteState', (stepIndex, isPressed) => {
    if (!isAuthenticated || !isPerformer(user)) {
      return;
    }
    console.log(`[changeNoteState] ${user.name} ${stepIndex}, ${isPressed}`);
    broadcastWithout(sockets, socket, 'changeNoteState', stepIndex, isPressed);
  });

  socket.on('raiseHand', () => {
    if (!isAuthenticated || performer) {
      return;
    }

    console.log(`[raiseHand] ${user.name}`);
    performer = user;
    broadcast(sockets, 'newPerformer', user.id)
  });

  // I need event name
  // --> when performer want to stop performing and want to go out.
  // --> how can i make event name?
  socket.on('endPerformance', () => {
    if (!isAuthenticated || !isPerformer(user)) {
      return;
    }

    console.log(`[endPerformance] ${user.name}`);
    onEndPerformance(user);
  })
});