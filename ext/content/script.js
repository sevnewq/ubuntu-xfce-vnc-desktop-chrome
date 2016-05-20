var starwish = {
	address: 'starwish.algolreality.com/',
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

function loginCheck() {
	var afterLogin = $('.u-center > .after-login');
	if (afterLogin.length > 0) {
		if (afterLogin.is(':visible')) {
			return true;
		}
	}
	return false;
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
				// console.log('click reward btn');
				btn.click();
			}, 100 + (i * 20));
		}
	}

	// sign
	var sign = $('#_sign.btn.btn-syb.btn-clock-in');
	var signed = false;
	try {
		if (sign.find('span').text() == '已打卡') {
			signed = true;
			// console.log('signed, not click sign button');
		}
	} catch (ex) { }
	
	if (sign.siblings('.clock-in-tip.tip-panel').length == 0 && !signed) {
		// console.log('click sign btn');
		sign[0].click();
	}
	var block = $('.clock-in-tip.tip-panel ._cardRewardList > .may-clock > a.block-link');
	if (block.length > 0 && !signed) {
		// console.log('sign block click', block);
		block[0].click();
	}
	var clockBlock = $('#_clockInTip');
	if (clockBlock.length > 0 && !signed) {
		// console.log('sign clocktip click', clockBlock);
		sign[0].click();
	}

	// follow
	var follow = $('#_follow');
	if (follow.children('.ico.ico-plus').is(':visible')) {
		follow[0].click();
	}

	// close sign and reward panel
	setTimeout(function () {
		if ($('#_rewardCenter > .mission-tip._headerItem.tip-panel').is(':visible')) {
			var close = $('#_rewardCenter > .mission-tip._headerItem.tip-panel > span.dialog-close > a');
			// console.log('close reward center panel');
			close[0].click();
		}
		if (sign.siblings('.clock-in-tip.tip-panel').is(':visible')) {
			// console.log('close sign panel');
			sign[0].click();
		}
		if ($('#_clockInTip').is(':visible')) {
			// console.log('close sign clocktip panel');
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
	// getFocus();
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

function check() {
	if ($('.u-center > .after-login').length > 0) {
		console.log('logged in @', new Date());
		click();
	}
}

function click() {
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

