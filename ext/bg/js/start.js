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

checkFocusLoop();
// checkCastersUrl();

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

// function checkCastersUrl() {
// 	$.ajax({
// 		type: 'GET',
// 		dataType: 'json',
// 		url: 'http://starwish.algolreality.com/casters/json?_tt=' + (new Date().getTime()),
// 		success: function (d, t, j) {
// 			casterUrls = [];
// 			if ($.isArray(d)) {
// 				if (d.length > 0) {
// 					for (var i = 0; i < d.length; i++) {
// 						var caster = d[i];
// 						var room = caster.room;
// 						if ($.type(room) == 'string') {
// 							if (room.indexOf('http://') == 0) {
// 								casterUrls.push(room);
// 							}
// 						}
// 					}
// 				}
// 			}
// 		}
// 	});
// }

function checkFocus(open) {
	$.ajax({
		type: 'GET',
		dataType: 'json',
		url: 'http://starwish.algolreality.com/casters/focus?_tt=' + (new Date().getTime()),
		success: function (d, t, j) {
			if (d.length == 1) {
				checkFocusUrl = d[0].Caster.room;
				if (jQuery.type(checkFocusUrl) !== 'string') {
					checkFocusUrl = '';
					// console.log('focus url update failed, type incorrect.');
				}
				// console.log('focus url updated to:', checkFocusUrl);
				if (open && checkFocusUrl.length > 0) {
					openRoomArray([checkFocusUrl]);
				}
			}
			else {
				// console.log('focus caster check failed. count:', d.length);
			}
		}
	});
}

// function checkCasterUrlsLoop() {
// 	checkCastersUrl();
// 	// one hour
// 	setTimeout(function () { checkCastersUrl(); }, checkCastersUrlTime);
// }

function checkFocusLoop() {
	checkFocus();
	setTimeout(function () { checkFocusLoop(); }, checkFocusLoopTime);
}


// setTimeout(function () {
// 	load();
// }
// , 2 * 1000);


var xiuacc = {
	xiuid: "",
	xiupassword: "",
	clear: function () {
		this.xiuid = "";
		this.xiupassword = "";
	},
	set: function (d) {
		this.xiuid = d.Xiuacc.xiuid;
		this.xiupassword = d.Xiuacc.xiupassword;
	}
};

$(document).ready(function () {
	$.ajax({
		type: 'GET',
		url: 'http://starwish.algolreality.com/xiuaccs/json?' + (new Date().getTime()),
		dataType: 'json',
		success: function (d, t, j) {
			console.log(t);
			console.log(d);
			xiuacc.clear();
			xiuacc.set(d);
			
		},
		error: function (j, t, e) {
			console.log(t);
			xiuacc.clear();
		},
		complete: function () {
			load();
		}
	});
	// load();
});

function load() {
	// ajax get online caster url
	// getLivingCaster2();
	// openRoomArray([familyRoom]);
	checkFocus(true);
	
	if (openTimer !== null) {
		try { clearTimeout(openTimer); } catch (ex) { }
		openTimer = null;
	}
	// re-check
	openTimer = setTimeout(function () { load(); }, openLoopTime);
}

function openRoomArray(arr) {
	if (arr.length == 0) {
		return;
	}
	// if (arr.indexOf(checkFocusUrl) == -1 && checkFocusUrl.length > 0) {
	// 	arr.push(checkFocusUrl);
	// }
	// arr = ["http://x.pps.tv/room/100544"];
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
		chrome.windows.create({ url: arr, width: 400, height: 250, top: 30, left: 30, focused: true }, function (w) {
			openedWindowId = w.id;
			setTimeout(function () { activeTabs(); }, changeActiveTabTime);
		});
	}
	// chrome.windows.create({ url: arr, width: 400, height: 250, top: 30, left: 30 }, function (w) { openedWindowId = w.id; });
}

// function getLivingCaster2() {
// 	$.ajax({
// 		type: 'POST',
// 		url : 'http://x.pps.tv/cate/center/1',
// 		dataType: 'html',
// 		success: function (d, t, j) {
// 			var html = $.parseHTML(d);
// 			var url = '';
// 			livingCasterUrls = [];
// 			$.each(html, function (i, v) {
// 				if (v.id === 'wrapper') {
// 					var items = $('.content > ul.living-list > li.living-item', v);
// 					for (var i = 0; i < items.length; i++) {
// 						var item = items[i];
// 						var livetip = $('.live-panel > .live-tip', item);
// 						var href = $('.live-panel > .host-pic > a.play-mask', item).attr('href');
// 						var url = '';
// 						if ($.type(href) == 'string') {
// 							url = href;
// 						}
// 						if (url.length > 0) {
// 							if (url.indexOf('/room/') === 0) {
// 								url = 'http://x.pps.tv' + url;
// 								// current first living caster url
// 								console.log('open platform url:', url, '@', new Date());
// 							}
// 						}
// 						if (livetip.length > 0) {
// 							livingCasterUrls.push(url);
// 						}
// 					}
// 				}
// 			});

// 			console.log('livingCasterUrls', livingCasterUrls);

// 			var targetUrls = [];
// 			if (casterUrls.indexOf(familyRoom) == -1) {
// 				casterUrls.push(familyRoom);
// 			}
// 			for (var i = 0; i < casterUrls.length; i ++) {
// 				var url = casterUrls[i];
// 				if (livingCasterUrls.indexOf(url) != -1) {
// 					targetUrls.push(url);
// 				}
// 			}

// 			console.log('original', targetUrls);
// 			if (targetUrls.length > thresholdOpenUrl) {
// 				var deletedCount = targetUrls.length - thresholdOpenUrl;
// 				var deleteTargetArray = function (arr) {
// 					var rand = Math.floor(Math.random() * arr.length);
// 					arr.splice(rand, 1);
// 					return arr;
// 				};
// 				for (var i = 0; i < deletedCount; i++) {
// 					targetUrls = deleteTargetArray(targetUrls);
// 				}
// 			}

// 			console.log('open target', targetUrls);
// 			if (targetUrls.length == 0) {
// 				console.log('no family caster found, ask living center');
// 				getLivingCaster3();
// 			}
// 			else {
// 				openRoomArray(targetUrls);
// 			}

// 		},
// 		error: function (j, t, e) {
// 			if (t === 'parseerror') {
// 				// dataType parse error

// 			}
// 			console.log('get living caster failed. @', new Date());
// 			setTimeout(function () {
// 				getLivingCaster2();
// 			}, getLivingCasterRetryTime);
// 		}
// 	});
// }

// function getLivingCaster3() {
// 	$.ajax({
// 		type: 'POST',
// 		url : 'http://x.pps.tv/cate/center',
// 		dataType: 'html',
// 		success: function (d, t, j) {
// 			var html = $.parseHTML(d);
// 			var url = '';
// 			var livingCasterFirst = [];
// 			$.each(html, function (i, v) {
// 				if (v.id === 'wrapper') {
// 					// var items = $('.content > ul.living-list > li.living-item:first', v);
// 					var livetip = $('.content > ul.living-list > li.living-item > .live-panel > .live-tip:last', v);
// 					if (livetip.length == 1) {
// 						var item = livetip.parent().parent();
// 						// var livetip = $('.live-panel > .live-tip', item);
// 						var href = $('.live-panel > .host-pic > a.play-mask', item).attr('href');
// 						var url = '';
// 						if ($.type(href) == 'string') {
// 							url = href;
// 						}
// 						if (url.length > 0) {
// 							if (url.indexOf('/room/') === 0) {
// 								url = 'http://x.pps.tv' + url;
// 								// current first living caster url
// 								console.log('open platform url:', url, '@', new Date());
// 							}
// 						}
						
// 						livingCasterFirst.push(url);
// 					}
// 					else {
// 						console.log('living caster NOT found, open family room');
// 						openRoomArray([familyRoom]);
// 					}
// 				}
// 			});

// 			console.log('livingCasterFirst', livingCasterFirst);

// 			openRoomArray(livingCasterFirst);
// 		},
// 		error: function (j, t, e) {
// 			if (t === 'parseerror') {
// 				// dataType parse error

// 			}
// 			console.log('get living caster failed. @', new Date());
// 			openRoomArray([familyRoom]);
// 		}
// 	});
// }


var openCount = 0;
chrome.runtime.onMessage.addListener(function (msg, sender, sendResponse) {
	var code = msg.code;
	switch (code) {
		case 0:
			var url = msg.url;
			// var tabid = msg.tabid;
			if (openCount++ == 0) {
				// openCount++;
				openRoomArray([url]);
			}
			
			console.log('cnt:', openCount);
			break;
		case 1:
			var id = xiuacc.xiuid;
			var pw = xiuacc.xiupassword;
			console.log(id, pw);
			sendResponse({ xiuid: id, xiupassword: pw });
		default:
			break;
	}
});