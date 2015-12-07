
starwish.port = chrome.runtime.connect({ name: 'XIU.' + window.location.href });
starwish.port.postMessage({ code: MSG_CODE.CONNECT });
starwish.port.onMessage.addListener(portMessageListener);



function portMessageListener(msg) {
	var code = msg.code;
	var cmd = msg.cmd;
	console.log("code: " + code);
	switch (code) {
		case MSG_CODE.SIGNIN:
			var xiuid = cmd.xiuid;
			var xiupassword = cmd.xiupassword;
			console.log(xiuid, xiupassword);
			if (!loginCheck()) {
				if (xiuid.length > 0 && xiupassword.length > 0) {
					signinAction(xiuid, xiupassword);
				}
				else {
					console.log('no account received');
				}
			}
			
			break;
		case MSG_CODE.RELOAD:
			window.location.href = window.location.href;
			break;
		case MSG_CODE.RENAME:
			var name = cmd.name;
			if (loginCheck()) {
				setNewNickname(name);
			}
			
			break;
		case MSG_CODE.CLEARSTAR:
			if (loginCheck()) {
				for (var i = 0; i < 10; i++) {
					setTimeout(function () { click(); }, 10 + (100 * i));
				}
			}
			
			break;
		case MSG_CODE.SENDGIFT:
			var gift = cmd.gift;
			if (loginCheck()) {
				sendGift(cmd.gift);
			}
			
			break;
		case MSG_CODE.CLEARMISSION:
			if (loginCheck()) {
				checkSign();
			}
			
			break;
		case MSG_CODE.SENDMESSAGE:
			var msg = cmd.msg;
			if (loginCheck()) {
				var txt = $('.say-act > .say-input > input[type="text"]');
				var btn = $('.say-act > .say-input > a.btn-syg');
				txt.val(msg);
				if (btn.length > 0) {
					btn[0].click();
				}
			}
			break;
		case MSG_CODE.SENDSTATUS:
			var status = 'guest.live';
			if (loginCheck()) {
				status = 'logged.live';
			}
			starwish.port.postMessage({
				code: MSG_CODE.SENDSTATUS,
				status: status
			});

			break;
		default:
			break;
	}
}

function sendGift(gift) {
	var gifts = [
		// 免費
		"wp_lw_zhibeidangao",	// 紙杯蛋糕
		"wp_lw_tiantong",		// 甜筒
		"wp_lw_xiangjiao",		// 香蕉
		"wp_lw_bingjiling",		// 冰淇淋
		"wp_lw_shitou",			// 石頭
		// 守護
		"wp_lw_qiuhun",			// 求婚
		"wp_lw_baimawz",		// 白馬王子
		// 貴族
		"wp_lw_youlun",			// 郵輪
		"wp_lw_loveshang",		// 愛的火山
		"wp_lw_dainifei",		// 帶你飛
		// 常規
		"wp_lw_huangguan",		// 皇冠
		"wp_lw_reqiqiu",		// 熱氣球
		"wp_lw_zuanshi",		// 鑽石
		"wp_lw_lanpangzi",		// 藍胖子
		"wp_lw_bajie",			// 八戒
		"wp_lw_meiqui",			// 玫瑰
		"wp_lw_runhoubao",		// 潤喉寶
		"wp_lw_ygb",			// 螢光棒
		"wp_lw_momoda",			// 麼麼噠
		"wp_lw_dabai",			// 大白
		"wp_lw_guzhang",		// 鼓掌
		"wp_lw_guibinpiao",		// 粉絲票
		"wp_lw_xinyongka",		// 信用卡
		"wp_lw_pingguo",		// 頻果
		"wp_lw_mingpaibao",		// 名牌包
		"wp_lw_wanjuxiong",		// 玩具熊
		"wp_lw_beer",			// 啤酒
		"wp_lw_baobao",			// 要抱抱
		"wp_lw_yinfu",			// 音符
		"wp_lw_wocuole",		// 我錯了
		"wp_lw_zailaiyishou",	// 再來一首
		"wp_lw_ningmeng",		// 檸檬
		"wp_lw_bangbangtang",	// 棒棒糖
		"wp_lw_xiang"			// 翔
	];

	
	// target gift current number
	// $('#_bagsBar ul > li._giftItem > a.gift > img[src*="wp_lw_shitou"]').siblings('span.num').html();
	var number = $('#_bagsBar ul > li._giftItem > a.gift > img[src*="' + gifts[gift] + '"]').siblings('span.num').html();

	// want send number
	var val = $('.gift-bar .act-bar .input-text > input.value._giftNumTxt');
	if (!isNaN(parseInt(number))) {
		val.val(number);
	}
	else {
		val.val('1');
	}

	// send button
	var btn = $('.gift-bar .act-bar .btn.btn-sye._sendGift');
	if (btn.length == 1) {
		btn[0].click();
	}
}

