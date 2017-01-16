
starwish.port = chrome.runtime.connect({ name: 'XIU.' + window.location.href });
starwish.port.postMessage({ code: MSG_CODE.CONNECT });
starwish.port.onMessage.addListener(portMessageListener);


function portMessageListener(msg) {
	var code = msg.code;
	var cmd = msg.cmd;
	// console.log("code: " + code, new Date());
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
			console.log('received cmd: RELOAD');
			window.location.href = window.location.href;
			break;
		case MSG_CODE.RENAME:
			var name = cmd.cmd.name;
			console.info('received cmd: RENAME:', name);
			if (loginCheck()) {
				setNewNickname(name);
			}
			
			break;
		case MSG_CODE.CLEARSTAR:
			console.log('received cmd: CLEAR STAR');
			if (loginCheck()) {
				for (var i = 0; i < 10; i++) {
					setTimeout(function () { click(); }, 10 + (100 * i));
				}
			}
			
			break;
		case MSG_CODE.SENDGIFT:
			var gift = cmd.cmd.gift;
			console.info('received cmd: SEND GIFT', gift);
			if (loginCheck()) {
				sendGift(gift);
			}
			
			break;
		case MSG_CODE.CLEARMISSION:
			console.log('received cmd: CLEAR MISSION');
			if (loginCheck()) {
				checkSign(true);
			}
			
			break;
		case MSG_CODE.SENDMESSAGE:
			var msg = cmd.cmd.msg;
			console.info('received cmd: SEND MESSAGE:', msg);
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
			else {
				var errmsg = $('.login-form._login > ._loginBd > .t-warning > ._errorMsg');
				if (errmsg.length > 0 && errmsg.is(':visible')) {
					if (errmsg.html().length > 0) {
						status = 'guest.live.' + errmsg.html();
					}
				}
			}
			starwish.port.postMessage({
				code: MSG_CODE.SENDSTATUS,
				status: status,
				lastname: findLastName(),
				lastTabStatusTime: (new Date().getTime()),
				url: window.location.href
			});

			break;
		case MSG_CODE.RESTART:
			console.log('received cmd: RESTART');
			clickLogout(true);
			break;
		case MSG_CODE.CHANGEURL:
			window.location.href = cmd.cmd.url;
			break;
		case MSG_CODE.CLICKSENDGIFTBUTTON:
			// click send gift button
			// console.log('click send gift button');
			clickSendGiftButton();
			break;
		default:
			break;
	}
}

function clickSendGiftButton() {
	// send button
	var btn = $('.gift-bar .act-bar .btn.btn-sye._sendGift');
	if (btn.length == 1) {
		btn[0].click();
	}
}

function sendGift(gift) {
	// change tab
	var title = $('.gift-bar .gift-tab-title a.btn.btn-syd');
	if (title.length > 0) {
		for (var i = 0; i < title.length; i++) {
			var tab = $(title[i]);
			if ((tab.text()).indexOf('背') != -1 && (tab.text()).indexOf('包') != -1) {
				tab[0].click();
			}
		}
	}
	var gifts = [
		// 免費
		"wp_lw_zhibeidangao",	// 紙杯蛋糕
		"wp_lw_tiantong",		// 甜筒, 冰激凌
		"wp_lw_xiangjiao",		// 香蕉
		"wp_lw_bingjiling",		// 冰淇淋. 雪糕
		// 活動，免費
		"chocolate",			// 節日巧克力
		"wp_lw_shitou",			// 石頭, 石塊 （萬聖節）
		"wp_lw_zhumengyu",		// 逐夢羽 （年度主播）
		"wp_lw_lianlizhi",		// 連理枝（2015七夕）
		"wp_lw_sapling",		// 小苗苗（2016春季之星）
		"wp_gz_jueshi",			// 爵士（禮包，打卡）(需要 mouseover，才會出現使用的按鈕 element，暫時無法支援)
		"wp_lw_assistance",		// 最佳助攻（2016奇秀歐洲杯爭霸賽）
		"wp_lw_xiajixing",		// 夏季星（2016奇秀夏季之星）
		"wp_lw_xlianlizhi",		// 連理枝（2016奇秀七夕）
		"wp_lw_qiujixing",		// 秋季星（2016奇秀秋季之星）
		// 守護
		"wp_lw_qiuhun",			// 求婚
		"wp_lw_baimawz",		// 白馬王子
		"wp_lw_cupid",			// 丘比特
		"wp_lw_yingxionjiumei",	// 英雄救美
		"wp_lw_herosavebeauty",	// 英雄救美（新）
		// 貴族
		"wp_lw_youlun",			// 郵輪
		"wp_lw_haohuayoulun",	// 豪華郵輪（新）
		"wp_lw_loveshang",		// 愛的火山
		"wp_lw_dainifei",		// 帶你飛
		"wp_lw_shechipin",		// 奢侈品
		"lw_wp_shechipin",		// 奢侈品
		"wp_lw_huanqiulvxin",	// 環球旅行
		"wp_lw_langmanhunli",	// 浪漫婚禮
		// 常規
		"wp_lw_xyc",			// 星運翅（年度主播）
		"wp_lw_xingyunxing",	// 幸運星（年度主播）
		"wp_lx_lstar",			// 幸運星（2016春季之星）
		"wp_lw_peach",			// 桃花（2016春季之星）
		"wp_lw_germany",		// 德国之星（2016奇秀歐洲杯爭霸賽）
		"wp_lw_france",			// 法国之星（2016奇秀歐洲杯爭霸賽）
		"wp_lw_england",		// 英格兰之星（2016奇秀歐洲杯爭霸賽）
		"wp_lw_spain",			// 西班牙之星（2016奇秀歐洲杯爭霸賽）
		"wp_lw_xiajipiao",		// 夏季票（2016奇秀夏季之星）
		"wp_lw_xbiyiniao",		// 比翼鳥（2016奇秀七夕）
		"wp_lw_zhadan",			// 幸運小炸炸（2016奇秀秋季之星）
		"wp_lw_qiujipiao",		// 秋季票（2016奇秀秋季之星）
		"wp_lw_yiliweikezi",	// 冰冻味可滋
		"wp_lw_xiehou",			// 邂逅
		"wp_lx_drugstop",		// 藥不能停
		"wp_lw_drugstop",		// 藥不能停
		"wp_lw_shengridangao",	// 生日蛋糕
		"wp_lw_huangguan",		// 皇冠
		"wp_lw_xhuangguan",		// 皇冠
		"wp_lw_reqiqiu",		// 熱氣球
		"wp_lw_zuanshi",		// 鑽石
		"wp_lw_lanpangzi",		// 藍胖子
		"wp_lw_bajie",			// 八戒
		"wp_lw_meiqui",			// 玫瑰
		"wp_lw_meiquinew",		// 玫瑰（新）
		"wp_lw_runhoubao",		// 潤喉寶
		"wp_lw_ygb",			// 螢光棒
		"wp_lw_xygb",			// 螢光棒（新）
		"wp_lw_momoda",			// 麼麼噠
		"wp_lw_momodatwo",		// 麼麼噠（新）
		"wp_lw_dabai",			// 大白
		"wp_lw_guzhang",		// 鼓掌
		"wp_lw_guibinpiao",		// 粉絲票
		"wp_lw_xinyongka",		// 信用卡
		"wp_lw_xxinyongka",		// 信用卡
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
		"wp_lw_bbtnew",			// 棒棒糖（新）
		"wp_lw_xiang"			// 翔
	];

	if (typeof(gift) == 'number') {
		if (gift < gifts.length) {
			gift = gifts[gift];
		}
	}
	if (typeof(gift) != 'string') {
		gift = '';
	}
	
	var img = $('#_bagsBar ul > li._giftItem > a.gift > img[src*="' + gift + '"]');
	if (img.length == 0) {
		console.info('doesn\'t has this gift.');
		return;
	}

	$('#_bagsBar ul ._giftItem.gift-selected._clickSelect').removeClass('gift-selected _clickSelect');
	img.parent()[0].click();
	img.parent().parent().addClass('gift-selected');
	// target gift current number
	
	var number = img.siblings('span.num').html();

	// want send number
	var val = $('.gift-bar .act-bar .input-text > input.value._giftNumTxt').val('1');
	// if (!isNaN(parseInt(number))) {
	// 	val.val(number);
	// }
	// else {
	// 	val.val('1');
	// }

	// create inject script, update gift number
	starwish.port.postMessage({
		code: MSG_CODE.CREATECLICKSENGIFTSCRIPT
	});

	// // send button
	// var btn = $('.gift-bar .act-bar .btn.btn-sye._sendGift');
	// if (btn.length == 1) {
	// 	btn[0].click();
	// }
}

function findLastName() {
	var nameField = $('.after-login .u-info .figure-panel .drop-name > .name');
	if (loginCheck()) {
		if (nameField.length > 0) {
			var name = nameField.text();
			if (typeof(name) == 'string') {
				if (name.length > 0) {
					return name;
				}
			} 
		}
	}
	return '';
}

function setNewNickname(name) {

	var editZone = $('.after-login .u-info .figure-panel .drop-name > .name-txt');
	if (editZone.css('display') == 'none') {
		var editBtn = editZone.siblings('.ico.ico-edit');
		if (editBtn.length > 0) {
			editBtn[0].click();
			var editField = editZone.children('input[type="text"]');
			if (editField.length > 0) {
				editField.val(name);
				var saveBtn = editZone.children('.ico.ico-save');
				if (saveBtn.length > 0) {
					saveBtn[0].click();
				}
			}
		}
	}
	else {
		var editField = editZone.children('input[type="text"]');
		if (editField.length > 0) {
			editField.val(name);
			console.info(name);
			var saveBtn = editZone.children('.ico.ico-save');
			if (saveBtn.length > 0) {
				saveBtn[0].click();
			}
		}
	}

}
