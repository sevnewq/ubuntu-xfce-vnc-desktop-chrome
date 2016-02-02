var openLoopTime = 1000 * 60 * 10;				// 10 minutes
var checkCastersUrlTime = 1000 * 60 * 60;		// one hour
var checkFocusLoopTime = 1000 * 60 * 5;			// 5 minutes
var changeActiveTabTime = 1000 * 10;			// 10 seconds
var switchActiveTabTime = 1000 * 5;				// 5 seconds
var getLivingCasterRetryTime = 1000;			// one minite
var openTimer = null;
var openAjax = null;
var loopRUNNING = false;
var openedWindowId = -1;
var familyRoom = 'http://x.pps.tv/room/100461';
var checkFocusUrl = '';
var casterUrls = [];
var livingCasterUrls = [];
var waitActiveTabIds = [];
var thresholdOpenUrl = 3;

var starwish = {
	address: 'starwish.algolreality.com/',
	openCount: 0,								// count current tab open times
	ports: {},
	getCmdLoopTime: 10 * 1000,
	status: 'initial',
	currentOpenUrl: '',
	checkFocusAjax: null,
	cmdGetAjax: null,
	cmdGetTimer: null,
	tabOpenMonitor: {
		tabs: {},
		timer: null,
		time: 30 * 1000,						// 30 seconds
		check: function () {
			var reopen = [];
			$.each(this.tabs, function (i, t) {
				var currentTime = new Date().getTime();
				var tabTime = t.time;
				
				if (currentTime - tabTime > 60000) {	// 1 minute
					console.info('1 minute');
					var url = t.url;
					var wid = t.wid;
					var tid = t.id;
					reopen.push(url);
					try { delete starwish.tabOpenMonitor.tabs[i]; } catch (ex) { }
					
					try {
						chrome.windows.get(wid, function (w) {
							try { chrome.windows.remove(w.id, function () {}); } catch (ex) { }
							
						});
					}
					catch (ex) {
						
					}
				}
				
			});
			// if (reopen.length > 0) {
			// 	openRoomArray2([reopen[reopen.length - 1]]);
			// }

			if (this.timer != null) {
				try { clearTimeout(this.timer); } catch (ex) { }
				this.timer = null;
			}
			

			this.timer = setTimeout(function () {
				starwish.tabOpenMonitor.check();
			}, this.time);
		}
	},
	retryGetAccountTime: 5 * 1000				// 5 seconds
};

// starwish.tabOpenMonitor.check();


var xiuacc = {
	xiuid: "",
	xiupassword: "",
	id: "",
	lastname: "",
	position: "",
	clear: function () {
		this.xiuid = "";
		this.xiupassword = "";
		this.id = "";
		this.status = "reset";
		this.lastname = "";
		this.position = "";
	},
	set: function (d) {
		this.xiuid = d.Xiuacc.xiuid;
		this.xiupassword = d.Xiuacc.xiupassword;
		this.id = d.Xiuacc.dataid;
		this.status = 'account.received';
		this.lastname = d.Xiuacc.lastname;
	}
};

checkFocusLoop();

function activeTabs() {
	if (openedWindowId != -1) {
		chrome.windows.get(openedWindowId, { 'populate': true }, function (w) {
			waitActiveTabIds.length = 0;
			waitActiveTabIds = [];
			if ($.type(w) != 'undefined') {
				if ($.type(w.tabs) != 'undefined') {
					var tabs = w.tabs;
					for (var i = 0; i < tabs.length; i++) {
						var tab = tabs[i];
						waitActiveTabIds.push(tab.id);
					}
				}
			}
			if (waitActiveTabIds.length > 0) {
				changeActiveTab();
			}
		});
	}
	
}

function changeActiveTab() {
	if (waitActiveTabIds.length > 0) {
		console.log('change active tab', waitActiveTabIds[0]);
		chrome.tabs.update(waitActiveTabIds[0], { 'active': true }, function (t) { console.log('tab', t.id); });
		waitActiveTabIds.shift();
	}
	if (waitActiveTabIds.length > 0) {
		setTimeout(function () {
			changeActiveTab();
		}, switchActiveTabTime);
	}
}

function checkFocus(open, func) {
	if (starwish.checkFocusAjax != null) {
		try { starwish.checkFocusAjax.abort(); } catch (ex) { }
	}
	starwish.checkFocusAjax = $.ajax({
		type: 'GET',
		dataType: 'json',
		url: 'http://' + starwish.address + 'xiuaccs/getCurrent?_tt=' + (new Date().getTime()),
		success: function (d, t, j) {
			var checkFocusUrl = d.url;
			if (jQuery.type(checkFocusUrl) !== 'string') {
				checkFocusUrl = '';
				// console.log('focus url update failed, type incorrect.');
			}
			// console.log('focus url updated to:', checkFocusUrl);
			if (open && checkFocusUrl.length > 0) {
				if (starwish.currentOpenUrl.length > 0) {
					openRoomArray2([starwish.currentOpenUrl]);
				}
				else {
					openRoomArray2([checkFocusUrl]);
				}
				if (typeof(func) == 'function') {
					func();
				}
			}
		}
	});
}

$(document).ready(function () {
	getAccountFromServer();
});

function checkFocusLoop() {
	checkFocus();
	setTimeout(function () { checkFocusLoop(); }, checkFocusLoopTime);
}

function getCmdFromServer() {
	if (starwish.cmdGetAjax != null) {
		try { starwish.cmdGetAjax.abort(); } catch (ex) { }
		starwish.cmdGetAjax = null;
	}
	starwish.cmdGetAjax = $.ajax({
		type: 'POST',
		url: 'http://' + starwish.address + 'xiuaccs/cmdGet',
		dataType: 'json',
		data: {
			id: xiuacc.id,
			status: starwish.status,
			lastname: xiuacc.lastname,
			position: xiuacc.position
		},
		success: function (data, textStatus, jqXhr) {
			console.log('get server cmd data:', data);
			var code = data.code;
			if (data.code == 0) {
				var cmd = data.cmd;
				if (cmd !== null) {
					console.log('get NEW cmd:', cmd);
					var receivedCmd = -1;
					switch (cmd.cmd) {
						case 'rename': 			receivedCmd = MSG_CODE.RENAME; 			break;
						case 'reload': 			receivedCmd = MSG_CODE.RELOAD; 			break;
						case 'sendGift': 		receivedCmd = MSG_CODE.SENDGIFT; 		break;
						case 'sendMsg': 		receivedCmd = MSG_CODE.SENDMESSAGE; 	break;
						case 'sendStar': 		receivedCmd = MSG_CODE.CLEARSTAR; 		break;
						case 'clearMission': 	receivedCmd = MSG_CODE.CLEARMISSION; 	break;
						case 'restart': 		receivedCmd = MSG_CODE.RESTART;			break;
						case 'changeurl': 		receivedCmd = MSG_CODE.CHANGEURL;
							starwish.currentOpenUrl = cmd.url;
							openRoomArray2([cmd.url]);
							
							break;
						default: break;
					}
					sendCmdToTabs({ code: receivedCmd, cmd: cmd }, receivedCmd);
					
				}
				else {
					console.log('no cmd received.');
				}
			}
			else {
				console.log('get cmd incorrect, msg:', data.msg);
			}
		},
		error: function (jqXhr, textStatus, errorThrown) {
			console.log('ERROR, get cmd request:', textStatus);
		},
		complete: function () {
			starwish.cmdGetAjax = null;
			if (starwish.cmdGetTimer != null) {
				try { clearTimeout(starwish.cmdGetTimer); } catch (ex) { }
				starwish.cmdGetTimer = null;
			}
			starwish.cmdGetTimer = setTimeout(function () {
				getCmdFromServer();
			}, starwish.getCmdLoopTime);
			// update status from tab
			sendCmdToTabs({ code: MSG_CODE.SENDSTATUS }, MSG_CODE.SENDSTATUS);
		}
	});
}

function getAccountFromServer() {
	$.ajax({
		type: 'GET',
		url: 'http://' + starwish.address + 'xiuaccs/json?' + (new Date().getTime()),
		dataType: 'json',
		success: function (d, t, j) {
			console.log(t);
			console.log(d);
			xiuacc.clear();
			xiuacc.set(d);
			load();
		},
		error: function (j, t, e) {
			console.log(t);
			xiuacc.clear();
			console.log('get account fail, retry after ' + starwish.retryGetAccountTime + 'ms.');
			setTimeout(function () {
				console.log('retry, get account from server.');
				getAccountFromServer();
			}, starwish.retryGetAccountTime);
		}
	});
}

function load() {
	// start get focus target, then get cmd from server and update status
	checkFocus(true, getCmdFromServer);
	
	if (openTimer !== null) {
		try { clearTimeout(openTimer); } catch (ex) { }
		openTimer = null;
	}
	
}

function restartExt() {
	console.info('0');
	if (openedWindowId != -1) {
		console.info('1');
		try {
			chrome.windows.remove(openedWindowId, function () {
				console.info('2');
				chrome.cookies.getAll({domain: 'x.pps.tv'}, function (cookies) {
					console.info('3');
					for (var i = 0; i < cookies.length; i++) {
						var cookie = cookies[i];
						chrome.cookies.remove({
							url: 'http://x.pps.tv/' + cookie.path,
							name: cookie.name
						});
					}
					chrome.runtime.reload();
				});
				
			});
		} catch (ex) { }
	}
	else {
		console.info('4');
		chrome.cookies.getAll({domain: 'x.pps.tv'}, function (cookies) {
			console.info('5');
			for (var i = 0; i < cookies.length; i++) {
				var cookie = cookies[i];
				chrome.cookies.remove({
					url: 'http://x.pps.tv/' + cookie.path,
					name: cookie.name
				});
			}
			chrome.runtime.reload();
		});

	}
}

function openRoomArray2(arr) {
	if (arr.length == 0) {
		return;
	}
	xiuacc.position = arr[0];

	if (openedWindowId !== -1) {
		try { chrome.windows.remove(openedWindowId, function () { }); } catch (ex) { }
		openedWindowId = -1;
	}
	chrome.windows.create({ url: arr, width: 400, height: 250, top: 30, left: 30, focused: true }, function (w) {
		openedWindowId = w.id;
		
	});
}

function openRoomArray(arr) {
	if (arr.length == 0) {
		return;
	}
	xiuacc.position = arr[0];
	if (openedWindowId !== -1) {
		chrome.windows.get(openedWindowId, { 'populate': true }, function (w) {
			if ($.type(w) == 'undefined') {
				try { chrome.windows.remove(openedWindowId, function () { }); } catch (ex) { }
				// create new window
				chrome.windows.create({ url: arr, width: 400, height: 250, top: 30, left: 30, focused: true }, function (w) {
					openedWindowId = w.id;
					setTimeout(function () { activeTabs(); }, changeActiveTabTime);
				});
			}
			else {
				if ($.type(w.tabs) == 'undefined') {
					try { chrome.windows.remove(openedWindowId, function () { }); } catch (ex) { }
					chrome.windows.create({ url: arr, width: 400, height: 250, top: 30, left: 30, focused: true }, function (w) {
						openedWindowId = w.id;
						setTimeout(function () { activeTabs(); }, changeActiveTabTime);
					});
					return;
				}
				// get exist tabs id
				var existTabsId = [];

				for (var i = 0; i < w.tabs.length; i++) {
					existTabsId.push(w.tabs[i].id);
				}
				// create new tab
				for (var i = 0; i < arr.length; i++) {
					var url = arr[i];
					chrome.tabs.create({ url: url, windowId: w.id }, function (t) {
						console.log('create tab:', t.url);
					});
				}
				// remove exist tabs
				chrome.tabs.remove(existTabsId, function () {
					console.log('remove exist tabs.');
				});
				setTimeout(function () { activeTabs(); }, changeActiveTabTime);

			}
		});
	}
	else {
		console.info('arr', arr);
		chrome.windows.create({ url: arr, width: 400, height: 250, top: 30, left: 30, focused: true }, function (w) {
			openedWindowId = w.id;
			setTimeout(function () { activeTabs(); }, changeActiveTabTime);
		});
	}

}

