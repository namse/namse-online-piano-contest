import * as socketIo from 'socket.io';
import User from './User';
import * as express from 'express';
import * as path from 'path';
import * as http from 'http';

const app = express();
const httpServer = http.createServer(app);

const distPath = path.resolve(__dirname, '../../client/dist');
console.log(distPath);

app.use(express.static(distPath));

const port = 6974;
const io = socketIo(httpServer);

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
  turnOffSilentPerformerKickTimeout();
  performer = null;

  broadcastWithout(sockets, user.socket, 'endPerformance');
}

let sockets: socketIo.Socket[] = [];
let users: User[] = [];
let silentPerformerKickTimeout;

function turnOffSilentPerformerKickTimeout() {
  if (silentPerformerKickTimeout) {
    clearTimeout(silentPerformerKickTimeout);
  }
}

function onPerformerInteraction() {
  turnOffSilentPerformerKickTimeout();
  silentPerformerKickTimeout = setTimeout(() => {
    console.log('kick!!!');
    if (performer) {
      performer.socket.disconnect();
      onEndPerformance(performer);
    }
  }, 10000);
}

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
  });

  socket.on('changeNoteState', (stepIndex, isPressed) => {
    if (!isAuthenticated || !isPerformer(user)) {
      return;
    }
    console.log(`[changeNoteState] ${user.name} ${stepIndex}, ${isPressed}`);
    broadcastWithout(sockets, socket, 'changeNoteState', stepIndex, isPressed);
    onPerformerInteraction();
  });

  socket.on('raiseHand', () => {
    if (!isAuthenticated || performer) {
      return;
    }

    console.log(`[raiseHand] ${user.name}`);
    performer = user;
    broadcast(sockets, 'newPerformer', user.id);
    onPerformerInteraction();
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

httpServer.listen(port, () => console.log(`listning on *:${port}`));

