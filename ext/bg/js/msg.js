var openCount = 0;			// count current tab open times
// chrome.runtime.onMessage.addListener(msgListener);

function sendCmdToTabs(cmd, code) {
	$.each(starwish.ports, function (i, v) {
		v.postMessage({ code: code, cmd: cmd });
	});
}

// function msgListener(msg, sender, sendResponse) {
// 	var code = msg.code;
// 	switch (code) {
// 		case 0: 			// open url
// 			var url = msg.url;
// 			// var tabid = msg.tabid;
// 			if (openCount++ == 0) {
// 				// openCount++;
// 				openRoomArray([url]);
// 			}
			
// 			console.log('cnt:', openCount);
// 			break;
// 		case 1: 			// signin
// 			var id = xiuacc.xiuid;
// 			var pw = xiuacc.xiupassword;
// 			console.log(id, pw);
// 			sendResponse({ xiuid: id, xiupassword: pw });
// 		default:
// 			break;
// 	}
// }

chrome.runtime.onConnect.addListener(connectListener);

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
	console.log('msg port', msg, port);
	var code = msg.code;
	var tabid = port.sender.tab.id;
	switch (code) {
		case MSG_CODE.OPENURL: 			// open url
			var url = msg.url;
			// var tabid = msg.tabid;
			if (starwish.openCount++ == 0) {
				// starwish.openCount++;
				openRoomArray([url]);
			}
			
			console.log('cnt:', starwish.openCount);
			break;
		case MSG_CODE.SIGNIN: 			// signin
			var id = xiuacc.xiuid;
			var pw = xiuacc.xiupassword;
			console.log(id, pw);
			// sendResponse({ xiuid: id, xiupassword: pw });
			// starwish.ports['t' + tabid].postMessage({ code: MSG_CODE.SIGNIN });
			sendCmdToTabs({ xiuid: id, xiupassword: pw }, code);
			// start getting cmd from server
			getCmdFromServer();
			break;
		case MSG_CODE.SENDSTATUS:
			var status = msg.status;
			console.log('update status to server.', status);
			sendStatusToServer(status, tabid);
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
}

function sendStatusToServer(status, tabid) {

}

