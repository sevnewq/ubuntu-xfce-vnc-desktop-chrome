var starwish = {
	loopTime: 4 * 60 * 1000,
	loopTimeClearDialog: 1000,
	loopTimeSign: 30 * 1000,
	closeRewardBlockTime: 5 * 1000,
	ajaxDataStarSend: null,
	tabChange: {
		count: 0,
		threshold: 3
	},
	port: {},
	tabid: -1
};
var loopTime = 4 * 60 * 1000;
var loopTimeClearDialog = 1000;
var loopTimeSign = 30 * 1000;
var closeRewardBlockTime = 5 * 1000;
var ajaxDataStarSend = null;

// not used in 2015/12/07
// function loopAjaxStarSend() {
// 	ajaxStarSendCheck();
// 	setTimeout(function () {
// 		loopAjaxStarSend();
// 	}, loopTime);
// }

function loginCheck() {
	var afterLogin = $('.u-center > .after-login');
	if (afterLogin.length > 0) {
		if (afterLogin.is(':visible')) {
			return true;
		}
	}
	return false;
}

// not used in 2015/12/07
// function ajaxStarSend() {
// 	if (ajaxDataStarSend !== null) {
// 		console.log('DATA, send star', ajaxDataStarSend);
// 		$.ajax({
// 			type: 'POST',
// 			url: 'http://x.pps.tv/room/sendStar',
// 			data: ajaxDataStarSend,
// 			async: true,
// 			dataType: 'json',
// 			success: function (d, t, j) {
// 				console.log('ajax send star response', d);
// 			},
// 			error: function (j, t, e) {
// 				if (t === 'parseerror') {
// 					// dataType parse error
// 				}
// 				console.log('send star, ajax error:', t);
// 			}
// 		});
// 	}
// }

// not used in 2015/12/07
// function ajaxStarSendCheck() {
// 	if ($('.u-center > .after-login').length > 0) {
// 		console.log('logged in @', new Date());
// 		ajaxStarSend();
// 	}
// }

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
					// loopAjaxStarSend();
					check();
				}
				
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

function checkSign(forceOpen) {
	if ($('.u-center > .after-login').length > 0) {
		clickSign2(forceOpen);
	}
}

function loopSign() {
	checkSign();
	setTimeout(function () {
		loopSign();
	}, loopTimeSign);
}

function clickLogout(restart) {
	if (loginCheck()) {
		var logoutBtn = $('.after-login .login-drop > .login-out > a[click-type="logout"]');
		if (logoutBtn.length > 0) {
			logoutBtn[0].click();
			if (restart) {
				setTimeout(function () {
					document.cookie = '';
					starwish.port.postMessage({ code: MSG_CODE.RESTART });
				}, 1000);
			}
		}
	}
	else {
		if (restart) {
			document.cookie = '';
			starwish.port.postMessage({ code: MSG_CODE.RESTART });	
		}
	}
}

function clickSign2(forceOpen) {
	// console.log('click @', new Date());

	// get reward
	var rewardCenter = $('#_rewardCenter');
	if ($('.mission-tip._headerItem.tip-panel > ._rewardCenterMain', rewardCenter).length == 0) {
		console.log('click reward center');
		rewardCenter.children('a.reward')[0].click();
	}
	if (forceOpen) {	// force open
		rewardCenter.children('a.reward')[0].click();
		setTimeout(function () {
			clickSign2();
		}, 500);
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
	else {
		console.info('reward NOT found');
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
	if (forceOpen) {	// force open
		setTimeout(function () {
			clickSign2();
		}, 500);
	}
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

	setTimeout(function () {
		startSignin();
	}, 5 * 1000);
	
	
	checkOnLineLoop();

});

function checkOnLineLoop() {
	checkOnLine();
	setTimeout(function () {
		checkOnLineLoop();
	}, 10 * 1000);
}

function checkOnLine() {
	if ($('.online-tips').length > 0) {
		var reConnect = $('.online-tips .cr[data-click-type="reConnect"]');
		if (reConnect.length == 1 && reConnect.is(":visible")) {
			reConnect[0].click();
		}
	}
}

function startSignin() {
	starwish.port.postMessage({ code: MSG_CODE.SIGNIN });

}

function signinAction(id, pw) {
	if ($('#headerUserCenter > .after-login').length > 0) {
		console.log('alrealdy logged');
		return;
	}
	if ($('.login-form._login').length == 0) {
		$('#headerUserCenter > .nav-login > .login-enter')[0].click();
		setTimeout(function () {
			startSignin();
		}, 5 * 1000);
	}
	else {
		var form = $('.login-form._login > ._loginBd');

		$('input[name="account"]', form).val(id);
		$('input[name="passwd"]', form).val(pw);

		setTimeout(function () {
			$('.act > .btn.btn-sye', form)[0].click();
			console.info('click login');
			// check login status
			setTimeout(function () {
				console.info('check login status after login click');
				if (!loginCheck()) {
					var errmsg = $('.login-form._login > ._loginBd > .t-warning > ._errorMsg');
					console.info('login fail, msg:', errmsg.html());
					if (errmsg.length > 0 && errmsg.is(':visible')) {
						if (errmsg.html().length > 0) {
							console.info('_errorMsg', errmsg.html());
							starwish.port.postMessage({
								code: MSG_CODE.SENDSTATUS,
								status: 'guest.error' + errmsg.html(),
								lastname: findLastName()
							});
						}
						
					}
				}
			}, 60 * 1000);
		}, 5 * 1000);
	}
}

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

function check() {
	if ($('.u-center > .after-login').length > 0) {
		console.log('logged in @', new Date());
		click();
	}
}

function click() {
	// console.log('click star @', new Date());
	document.querySelector(".gift-bar .act-bar .free-gift").click();
	setTimeout(function () {
		if ($('.dialog-main > .dialog-mft > .btn.btn-sye._ok').is(':visible')) {
			document.querySelector('.dialog-main > .dialog-mft > .btn.btn-sye._ok').click();
		}
	}, 1000);
}

function loop() {
	check();
	setTimeout(function () {
		loop();
	}, loopTime);
}

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

// setTimeout(function () {
// 	starwish.port.postMessage({ code: MSG_CODE.SIGNIN });
// }, 25 * 1000);
