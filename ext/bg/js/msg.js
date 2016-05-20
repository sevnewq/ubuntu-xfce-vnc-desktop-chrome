
chrome.runtime.onConnect.addListener(connectListener);

function sendCmdToTabs(cmd, code) {
	$.each(starwish.ports, function (i, v) {
		v.postMessage({ code: code, cmd: cmd });
	});
}

function deletePortByTabId(tabid) {
	try { delete starwish.ports['t' + tabid]; } catch (ex) { }
}

// receive port connect from tabs
function connectListener(port) {
	console.log('port', port);

	port.onMessage.addListener(portMsgListener);
	port.onDisconnect.addListener(portDisconnectListener);
	starwish.port = port;
	starwish.ports['t' + port.sender.tab.id] = port;
}

// receive port message from tabs
function portMsgListener(msg, port) {
	console.log('msg port', msg, port, new Date());
	var code = msg.code;
	var tabid = port.sender.tab.id;
	switch (code) {
		case MSG_CODE.RESTART: 			// restart
			restartExt();
			break;
		case MSG_CODE.CHANGEURL: 		// change url
			var url = msg.url;
			
			openRoomArray2([url]);
			console.log('cnt:', starwish.openCount);
			break;
		case MSG_CODE.OPENURL: 			// open url
			var url = msg.url;
			
			openRoomArray2([url]);
			console.log('cnt:', starwish.openCount);
			break;
		case MSG_CODE.SIGNIN: 			// signin
			var id = xiuacc.xiuid;
			var pw = xiuacc.xiupassword;
			console.info(id, pw);
			sendCmdToTabs({ xiuid: id, xiupassword: pw }, code);
			break;
		case MSG_CODE.SENDSTATUS:
			var status = msg.status;
			console.log('update status to server.', status);
			starwish.status = status;
			var lastname = msg.lastname;
			if (lastname.length > 0) {
				xiuacc.lastname = lastname;
			}
			updateTabStatusRecord(tabid, msg, port.sender.tab.windowId);
			break;
		case MSG_CODE.CREATECLICKSENGIFTSCRIPT:
			// create click send gift script
			chrome.tabs.executeScript({
				file: 'content/inject.js'
			});
			// click send gift button
			setTimeout(function () {
				starwish.port.postMessage({
					code: MSG_CODE.CLICKSENDGIFTBUTTON
				});
			}, 100);
			break;
		default:
			break;
	}
}

function portDisconnectListener(port) {
	console.log(port);
	var name = port.name;
	var sender = port.sender;
	var tab = sender.tab;
	var url = sender.url;
	var tabid = tab.id;
	var windowid = tab.windowId;
	deletePortByTabId(tabid);
	var t = starwish.tabOpenMonitor.tabs['tab_' + tabid];
	var currentTime = new Date().getTime();
	if (t && currentTime - t.time > 60000) {
		openRoomArray2([url]);
	}
}

function updateTabStatusRecord(tabid, msg, windowid) {
	var time = msg.lastTabStatusTime;
	var url = msg.url;
	var tab = starwish.tabOpenMonitor.tabs['tab_' + tabid];
	xiuacc.position = url;
	starwish.tabOpenMonitor.tabs['tab_' + tabid];
	if (tab == undefined) {
		starwish.tabOpenMonitor.tabs['tab_' + tabid] = {
			url: url,
			id: tabid,
			time: time,
			wid: windowid
		};
	}
	else {
		console.log('time', time);
		starwish.tabOpenMonitor.tabs['tab_' + tabid].time = time;
		starwish.tabOpenMonitor.tabs['tab_' + tabid].url = url;
		starwish.tabOpenMonitor.tabs['tab_' + tabid].wid = windowid;
	}
}
