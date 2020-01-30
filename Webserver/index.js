const express = require("express")
const http = require("http")
const WebSocket = require('ws');
const app = express();
const utils = require("./js/utils")
const makeid = utils.makeid
const configureSocket = utils.configureSocket
const createMessage = utils.createMessage
const nodeMCU = "NodeMCU";
var port = process.env.PORT || 8000;
const RELAY_OFF = 1
const RELAY_ON = 0

var state = {
	nodeMCUConnected: false,
	relay1: RELAY_OFF,
	relay2: RELAY_OFF,
	relay3: RELAY_OFF,
	relay4: RELAY_OFF,
	duration:3600000,
	schedule: "0 6 * * *",
}
var history = []

var CLIENTS = {}

app.use(express.static('.'));
app.get('/getstate', function (req, res) {
	res.send(state);
	console.log(state)
});
app.get('/change', function (req, res) {
	state.relay1 = !state.relay1
	console.log("Changed", state)
	// socket.send(JSON.stringify({"type":"stateChanged","data":state}));
	res.send('HTTP/1.1 200');
});

const server = http.createServer(app)
const wss = new WebSocket.Server({ server })

configureSocket(wss)
wss.on('connection', function connection(ws, info) {
	console.log("Header  ", info.headers["user-agent"], nodeMCU)

	if (info.headers["user-agent"] == nodeMCU) {
		console.log("Header came ", info.headers["user-agent"])
		wss.terminateById(nodeMCU)			//free prev. nodeMCU socketa
		delete CLIENTS[nodeMCU]
		ws.id = nodeMCU;
		state.nodeMCUConnected = true
		wss.sendAllExcept(nodeMCU, createMessage('state-update', JSON.stringify(state)))

	}
	else
		ws.id = makeid(12);

	ws.isAlive = true
	CLIENTS[ws.id] = ws;

	console.log("Connected", CLIENTS[ws.id].id)
	ws.on('message', function (message) {

		try {

			message = JSON.parse(message)
			console.log("Message from ",ws.id, message.type)
			if (message.type == "state-update" && ws.id == nodeMCU) {
				if (history.length >= 20)
					history = history.splice(1)
				let historyData = {}
				historyData[Date.now()] = {...message.data,disconnected:0}	
				history.push(historyData)
				
				state = Object.assign({}, state, message.data)
				
				wss.sendAllExcept(nodeMCU, createMessage('state-update', JSON.stringify(state)))
				wss.sendAllExcept(nodeMCU,createMessage('history-update',JSON.stringify(history)))
			}

		} catch (error) {
			console.log("error from",ws.id)
		}


		if (message.type == "change-state") {
			console.log(ws.id," Change-state")
				try {
					wss.getSocketById(nodeMCU).send(createMessage('change-request', message.data))					
				} catch (error) {
					console.log(error)
				}			 
		}
		if (message.type == "ping") {
				ws.isAlive = true;
				console.log('ping from ',ws.id, ws.isAlive)
		}
		if (message.type == "get-state") {
			wss.sendAllExcept(nodeMCU, createMessage('state-update', JSON.stringify(state)))			
		}
		if (message.type == "sync-time") {
			ws.send(createMessage('sync-time',{time:parseInt(Date.now()/1000)}))
		}
		if (message.type == "sync-state") {
			ws.send(createMessage('change-request', state))
			if(ws.id == nodeMCU)
			setTimeout(()=>{
				ws.send(createMessage('sync-time',{time:parseInt(Date.now()/1000)}))
			},500)
		}
		if (message.type == 'sync-history'){
			wss.sendAllExcept(nodeMCU,createMessage('history-update',JSON.stringify(history)))
		}
		
	});
	ws.on('error', function (message) {
		console.log("ERROR ", ws.id)
	})
	ws.on('close', function (message) {
		console.log("Disconnected ", ws.id)
		wss.clients.forEach((item) => { console.log(item.id) })
		if (ws.id == nodeMCU) {
			state.nodeMCUConnected = false;
			let historyData = {}
			historyData[Date.now()] = {...state,disconnected:1}		//nodeMCU disconnected	
			history.push(historyData)
			wss.sendAllExcept(nodeMCU,createMessage('state-update',JSON.stringify(state)))
			wss.sendAllExcept(nodeMCU,createMessage('history-update',JSON.stringify(history)))
		}
		delete (CLIENTS[ws.id])
	})

	ws.on('ping', (data) => { ws.isAlive = true; state.nodeMCUConnected = true; console.log("ping", ws.id, ws.isAlive) })
	ws.on('pong', (data) => { ws.isAlive = true; console.log("pong", ws.id, ws.isAlive) })

});
const interval = setInterval(function ping() {
	wss.clients.forEach(function each(ws) {
		if (ws.isAlive === false) return ws.close();
		ws.isAlive = false;
		ws.pong();
	});
}, 35000);
server.listen(port, function () {
	console.log("Server started on ", port);
});