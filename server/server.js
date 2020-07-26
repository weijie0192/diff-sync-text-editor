/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

var WebSocket = require('ws');
var uid = require('uid');
var wss = new WebSocket.Server({ port: 41998 });

var receivers = [];
var controllers = [];
var queue = [];
var queueID = 0;
const getExecutors = () =>
  receivers.map(ws => ({
    executorID: ws.uid,
    acc: ws.acc
  }));
wss.on('connection', function (ws, req) {
  ws.on('message', function (json) {
    try {
      // console.log("raw: ", json);
      var data = JSON.parse(json);
      var { type, payload } = data;
      console.log(data);
      switch (type) {
        case 'receiver':
          ws.acc = {
            max: payload.max,
            current: payload.current
          };
          ws.uid = payload.executorID || uid();

          receivers.push(ws);
          var sendPayload = {
            type: 'acc',
            payload: getExecutors()
          };
          controllers.forEach(con => {
            send(con, sendPayload);
          });
          break;
        case 'name':
          if (receivers.length > 0) {
            for (var receiver of receivers) {
              send(receiver, json);
            }
            controllers.push(ws);
            send(ws, {
              type: 'sync',
              payload: {
                queue,
                executors: getExecutors()
              }
            });
          }
          break;
        case 'queue':
          if (receivers.length > 0) {
            const executor = receivers.find(r => r.uid === payload.executorID);
            if (executor) {
              payload.id = queueID++;
              send(executor, data);
            }
          }
          break;
        case 'queueSuccess':
          payload.status = 'queue';
          payload.date = new Date().toLocaleString();
          queue.push(payload);
          sendPayload = {
            type: 'queue',
            payload
          };
          controllers.forEach(con => {
            send(con, sendPayload);
          });

          break;
        case 'cancel':
          if (receivers.length > 0) {
            const executor = receivers.find(r => r.uid === payload.executorID);
            data.payload = data.payload.id;
            send(executor, data);
          }
        case 'update':
          var target = queue[payload.id];
          target.status = payload.status;
          console.log('target', target);

          sendPayload = {
            type: 'update',
            payload: target
          };
          controllers.forEach(con => {
            send(con, sendPayload);
          });
          break;
        case 'acc':
          ws.acc = payload;
          controllers.forEach(con => {
            send(con, {
              type: 'acc',
              payload: {
                executorID: ws.uid,
                acc: payload
              }
            });
          });
          break;
        default:
          controllers.forEach(con => {
            send(con, data);
          });
      }
    } catch (e) {
      console.log(e);
    }
  });
  ws.on('close', function (e) {
    if (receivers.includes(ws)) {
      receivers = receivers.filter(x => x !== ws);

      if (receivers.length === 0) {
        controllers.forEach(c => {
          send(c, { type: 'offline' });
        });
      } else {
        controllers.forEach(c => {
          send(c, { type: 'executors', payload: getExecutors() });
        });
      }
    } else {
      controllers = controllers.filter(v => {
        return v !== ws;
      });
    }
  });
});

function send(ws, data) {
  if (typeof data == 'string') ws.send(data);
  else ws.send(JSON.stringify(data));
}
