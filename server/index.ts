import { WebSocket, WebSocketServer } from 'ws';
import { v4 } from 'uuid';
import { interval, Subscription } from 'rxjs';
import { printTime } from '../common/utils';

const PORT = 8000;
const REQUEST_TIME_SECONDS = 10;

interface Team {
  id: string;
  ws: WebSocket;
  time?: Date;
}

function main() {
  const wss = new WebSocketServer({
    port: PORT
  });

  console.log(`server running at port ${PORT}`);

  let time = new Date(Date.now());
  const teams: {[id: string]: Team} = {};

  let timer$: undefined | Subscription;

  wss.on('connection', (ws, req) => {
    const id = v4();

    console.log(`new team connected ${id}`);
    teams[id] = {
      id,
      ws
    };

    if (Object.keys(teams).length === 1) {
      timer$ = interval(REQUEST_TIME_SECONDS * 1000).subscribe({
        next: () => {
          console.log('server requesting teams time...');
          time = new Date(Date.now());
          Object.values(teams).forEach(team => {
            team.ws.send(JSON.stringify({
              message: 'TIME_REQUEST'
            }));
          });
        }
      });
    }

    ws.on('message', raw => {
      const data = JSON.parse(raw.toString('utf8'));

      if (data.time) {
        teams[id].time = new Date(data.time);
        const times = Object.values(teams).map(team => team.time);

        if (times.some(t => t === undefined)) {
          return;
        }

        times.push(time);

        const average = new Date(times.map(t => t!.getTime()).reduce((average, t) => average! + t!)! / times.length);
        console.log(`average time is ${printTime(time)}`);

        Object.values(teams).forEach(team => {
          team.ws.send(JSON.stringify({
            message: 'TIME_AVERAGE',
            average: average.getTime(),
            time: time.getTime()
          }));
        });

        for (const teamId in teams) {
          delete teams[teamId].time;
        }
      }
    });

    ws.on('close', () => {
      console.log(`team exited ${id}`);
      delete teams[id];

      if (Object.keys(teams).length === 0) {
        console.log('teams empty stopping timer');
        timer$?.unsubscribe();
      }
    });
  });
}

main();
