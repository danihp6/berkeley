import { WebSocket } from 'ws';
import { printTime, printSymbol } from '../common/utils';

const WEB_SOCKET_URL = 'ws://localhost:8000';

function main() {
  const ws = new WebSocket(WEB_SOCKET_URL);

  let time = new Date(Date.now());

  ws.on('open', () => {
    console.log(`client connected to ${WEB_SOCKET_URL}`);
  });

  ws.on('message', raw => {
    const data = JSON.parse(raw.toString('utf8'));

    if (data.message === 'TIME_REQUEST') {
      time = new Date(Date.now());
      console.log('sending team time...');
      ws.send(JSON.stringify({
        time: time.getTime()
      }));
    }

    if (data.message === 'TIME_RESULT') {
      const average = new Date(data.average);
      console.log(`time average is ${printTime(average)}`);
      const serverTime = new Date(data.time);
      const difference = time.getTime() - serverTime.getTime();
      console.log(`there are a diferrence of ${printSymbol(difference)}${difference} ms to server time`)
    }
  });
}

main();
