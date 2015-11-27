
var loopTime = 4 * 60 * 1000;
var loopTimeClearDialog = 1000;
var loopTimeSign = 30 * 1000;
var closeRewardBlockTime = 5 * 1000;
var ajaxDataStarSend = null;

function loopAjaxStarSend() {
	ajaxStarSendCheck();
	setTimeout(function () {
		loopAjaxStarSend();
	}, loopTime);
}

function ajaxStarSend() {
	if (ajaxDataStarSend !== null) {
		console.log('DATA, send star', ajaxDataStarSend);
		$.ajax({
			type: 'POST',
			url: 'http://x.pps.tv/room/sendStar',
			data: ajaxDataStarSend,
			async: true,
			dataType: 'json',
			success: function (d, t, j) {
				console.log('ajax send star response', d);
			},
			error: function (j, t, e) {
				if (t === 'parseerror') {
					// dataType parse error

				}
				console.log('send star, ajax error:', t);
			}
		});
	}
}

function ajaxStarSendCheck() {
	if ($('.u-center > .after-login').length > 0) {
		console.log('logged in @', new Date());
		// var time = new Date();
		// var hour = time.getHours();
		// var minute = time.getMinutes();
		// if (hour == 23) {
		// 	return;
		// }
		ajaxStarSend();
		// if (hour == 0 && minute <= 10) {
		// 	for (var i = 0; i < 9; i++) {
		// 		setTimeout(function () {
		// 			ajaxStarSend();
		// 		}, 100 + (i * 10000));
		// 	}
		// }
	}
}

function getFocus() {
	// console.log('start check focus target');
	$.ajax({
		type: 'GET',
		async: true,
		url: 'http://starwish.algolreality.com/casters/focus?_tt=' + (new Date().getTime()),
		dataType: 'json',
		success: function (d, t, j) {
			console.log('focus list:', d);
			delete ajaxDataStarSend;
			ajaxDataStarSend = null;
			if (d.length == 1) {
				var caster = d[0].Caster;
				var url = caster.room;
				var to_uid = caster.xiuid;
				var room_id = url;
				room_id = room_id.substring(room_id.lastIndexOf('/') + 1, room_id	.length);

				if (room_id.length !== 6) {
					room_id = '';
				}
				if (!isNaN(parseInt(to_uid)) && !isNaN(parseInt(room_id))) {
					console.log('room_id', room_id);
					console.log('to_uid', to_uid);
					console.log('found room_id and to_uid');
					ajaxDataStarSend = {
						to_uid: to_uid,
						room_id: room_id
					};
					loopAjaxStarSend();
				}
				// if (window.location.href == url) {
				// 	console.log('url match.');
				// 	setTimeout(function () {
				// 		check();
				// 		setTimeout(function () {
				// 			loop();
				// 		}, loopTime);
				// 	}, 5000);
				// }
				// else {
				// 	// console.log('room url:', url);
				// 	// console.log('location:', window.location.href);

				// 	// $('.dialog-main > .dialog-mft > .btn.btn-sye._ok').is(':visible');
				// }
			}
			else {
				console.log('focus check failed. casters count:', d.length);
			}
		},
		error: function (j, t, e) {
			console.log('get focus failed.');
		}
	});	
}

function checkSign() {
	if ($('.u-center > .after-login').length > 0) {
		clickSign2();
	}
}

function loopSign() {
	checkSign();
	setTimeout(function () {
		loopSign();
	}, loopTimeSign);
}

function clickSign2() {
	// console.log('click @', new Date());

	// get reward
	var rewardCenter = $('#_rewardCenter');
	if ($('.mission-tip._headerItem.tip-panel > ._rewardCenterMain', rewardCenter).length == 0) {
		console.log('click reward center');
		rewardCenter.children('a.reward')[0].click();
	}
	var btns = $('._rewardCenterMain table.mission-table td.col4 > .btn._obtainPrize:not(.btn-syb-ro):not(.btn-syb-off)', rewardCenter);
	if (btns.length > 0) {
		console.log('btns not got rewards', btns);
		for (var i = 0; i < btns.length; i++) {
			var btn = btns[i];
			setTimeout(function () {
				console.log('click reward btn');
				btn.click();
			}, 100 + (i * 20));
		}
	}

	// sign
	var sign = $('#_sign.btn.btn-syb.btn-clock-in');
	if (sign.siblings('.clock-in-tip.tip-panel').length == 0) {
		console.log('click sign btn');
		sign[0].click();
	}
	var block = $('.clock-in-tip.tip-panel ._cardRewardList > .may-clock > a.block-link');
	if (block.length > 0) {
		console.log('sign block click', block);
		block[0].click();
	}
	// close sign and reward panel
	setTimeout(function () {
		if ($('#_rewardCenter > .mission-tip._headerItem.tip-panel').is(':visible')) {
			var close = $('#_rewardCenter > .mission-tip._headerItem.tip-panel > span.dialog-close > a');
			console.log('close reward center panel');
			close[0].click();
		}
		if (sign.siblings('.clock-in-tip.tip-panel').is(':visible')) {
			console.log('close sign panel');
			sign[0].click();
		}
	}, closeRewardBlockTime);
}

function loopClearDialog() {
	if ($('.dialog-main > .dialog-mft > .btn.btn-sye._ok').is(':visible')) {
		document.querySelector('.dialog-main > .dialog-mft > .btn.btn-sye._ok').click();
	}
	if ($('.dialog-main > .dialog-mft > .btn.btn-sye._def').is(':visible')) {
		document.querySelector('.dialog-main > .dialog-mft > .btn.btn-sye._def').click();
	}
	setTimeout(function () {
		loopClearDialog();
	}, loopTimeClearDialog);
}

$(document).ready(function () {
	getFocus();
	loopSign();
	loopClearDialog();
});

// not used in this verion 0.0.24 @ 2015/09/21
// function clickSign() {
// 	// console.log('click @', new Date());
// 	var signBtn = $('#_signBtn');
// 	if (signBtn.length == 0) {
// 		console.log('sign btn not exist, click reward center.');
// 		document.querySelector('#_rewardCenter').click();
// 		// setTimeout(function () { click(); }, 1000);
// 	}
// 	else {
// 		// sign
// 		if (!$('#_signBtn').hasClass('btn-syf-off')) {
// 			console.log('click signBtn @', new Date());
// 			document.querySelector('#_signBtn').click();
// 		}
// 		// get reward
// 		var rewards = $('.btn.btn-syb._obtainPrize:not(.btn-syb-off):not(.btn-syb-ro)');
// 		if (rewards.length > 0) {
// 			for (var i = 0; i < rewards.length; i++) {
// 				var reward = rewards[i];
// 				console.log(reward);
// 				setTimeout(function () {
// 					reward.click();
// 				}, 100 + (i * 20));
// 			}
// 		}
// 		var missionTip = $('.mission-tip.tip-panel');
// 		if (missionTip.length > 0) {
// 			if (missionTip.is(':visible')) {
// 				var closeBtn = $('.dialog-close > a', missionTip);
// 				if (closeBtn.length == 1) {
// 					closeBtn[0].click();
// 				}
// 			}
// 		}
// 	}
// }

// not used in this verion 0.0.28 @ 2015/09/23
// function check() {
// 	if ($('.u-center > .after-login').length > 0) {
// 		console.log('logged in @', new Date());
// 		var time = new Date();
// 		var hour = time.getHours();
// 		var minute = time.getMinutes();
// 		if (hour == 23) {
// 			return;
// 		}
// 		click();
// 		if (hour == 0 && minute <= 10) {
// 			for (var i = 0; i < 9; i++) {
// 				setTimeout(function () {
// 					click();
// 				}, 100 + (i * 10000));
// 			}
// 		}
// 	}
// }

// not used in this verion 0.0.28 @ 2015/09/23
// function click() {
// 	// console.log('click star @', new Date());
// 	document.querySelector(".gift-bar .act-bar .free-gift").click();
// 	setTimeout(function () {
// 		if ($('.dialog-main > .dialog-mft > .btn.btn-sye._ok').is(':visible')) {
// 			document.querySelector('.dialog-main > .dialog-mft > .btn.btn-sye._ok').click();
// 		}
// 	}, 1000);
// }

// not used in this verion 0.0.28 @ 2015/09/23
// function loop() {
// 	check();
// 	setTimeout(function () {
// 		loop();
// 	}, loopTime);
// }

var tabChange = {
	count: 0,
	threshold: 3
};

setTimeout(function () {
	changeViewerTab();
}, 10 * 1000);

function changeViewerTab() {

	var current = $('.layout-adapt-top > .right-top > .right-tab-title > li.selected');
	if (current.hasClass('vip')) {
		current.next()[0].click();
	}
	else {
		current.prev()[0].click();
	}

	if (tabChange.count++ < tabChange.threshold) {
		setTimeout(function () {
			changeViewerTab();
		}, 1000);
		
		return;
	}

}

setTimeout(function () {
	chrome.runtime.sendMessage({ code: 0 , url: window.location.href }, function () {
		console.log('msg sended.');
	});
}, 20 * 1000);
