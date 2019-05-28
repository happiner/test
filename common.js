var isArray = function (arg) {
    return Object.prototype.toString.call(arg) === "[object Array]";
}; //Spine.isArray;
var contextPath = "", ajaxSuccessStatusCode = "01",dataHeaderCipherType={},devAndpfInfo="", Common = {};

Common.triggerSubMenuAuto = true;
Common.controllers = {};
Common.context = {};
Common.context.modules = {};
Common.menu = {};
Common.basePath = "";
biztype = 'individual';
Common.params = {};
window.VERSION = "20160215";
var stopBubble = function (e) {
    if (e && e.stopPropagation)
        e.stopPropagation();
    else
        window.event.cancelBubble = true;
};

var Class = {
    create: function () {
        return function () {
            this.initialize.apply(this, arguments);
        };
    }
};

//BII环境语言字典
var localParam={
	"C":"zh_CN",
	"E":"en_US"
};

var urlPrefix ="/BII/",
    dataPostURL = urlPrefix + "PsnGetUserProfile.do",
    // 验证码图片地址前缀
    validationURL = urlPrefix + "ImageValidation/validation";


//发送请求格式
Common.getCommPostParam = function (req, local) {
    return {
        "header": $.extend({
                "local": local || (lan == "C" ? "zh_CN" : "en_US"), 
                "agent": "WEB15", 
                "bfw-ctrl": "json", 
                "version": "", 
                "device": "",
                "platform": "", 
                "plugins": "", 
                "page": "", 
                "ext": ""
            },Common.getDeviceAndSecInfo(),dataHeaderCipherType),
        "request": req || null
    };
};

//closer
var getIdentityId = function () {
    var seed = 0;
    function seedIncrease() {
        return ++seed;
    };
    return seedIncrease;
};



//安全因子
/*
var selectedValue, ds = new DetachSigner(
$("#div1"),
{
"_combinList": [{ "name": "USBKey证书", "id": "4", "safetyFactorList": []}],
"_defaultCombin": null
},
'123456',
function () { }
);
$("#next").on("click", function () {
var param = { factorList: [{ field: { name: "Smc"} }, { field: { name: "Otp"} }, { field: { name: "_signedData"}}], smcTrigerInterval: 5000, container: $("#div2").get(0) };
ds.build(param);
});
$("#submit").on("click", function () {
if (ds.isValidate()) {
ds.val; //{ "Smc": "", "Otp": "", "_signedData": "" };
}
});

<!-- html -->
<div id="div1">
</div>
<div id="div2">
</div>
<input type="button" value="下一步" id="next" />
<input type="button" value="确认" id="submit" />
*/
var DetachSigner = Class.create();
DetachSigner.prototype = {
    initialize: function (el, data, conversationId, fn) {
        this.util = new com.ibm.boc.util();
        this.el = el;
        var dt = this.dataHandle(data),
            params = {
                data: dt.data,
                appendTo: el,
                defValue: dt.def.val,
                defText: dt.def.text,
                callback: function (its) {
                    fn && fn(its);
                }
            };
        this.conversationId = conversationId;
        //使用 instance.itSelect.val来获取下拉框的值
        this.itSelect = new ITSelect(params);
        return this;
    },
    clear: function () {
        this.smsControl && this.smsControl.clear && this.smsControl.clear();
        this.otpController && this.otpController.clear && this.otpController.clear("dynamic_password");
    },
    _initSmsController: function (smcTrigerInterval) {
        this.smsControl = new com.ibm.boc.security.MobileCheckNum({
            container: this.controlsDomNode,
            smcTrigerInterval: smcTrigerInterval,
            conversationid: this.conversationId
        });
    },
    removeControl: function () {
        if (this.controlsDomNode)
            $(this.controlsDomNode).remove();
    },
    _initOtpController: function () {
        this.otpController = new com.ibm.boc.security.PassWordController(this.main);
        var item = dojo.create("div", { "class": "para clear" }, this.controlsDomNode);
        var label = dojo.create("span", { "class": "lt dynamictitle", innerHTML: this.util.nls.dynamicpasswordlabel/*"动态口令："*/ }, item);
        var passcontainer = dojo.create("span", { "class": "rt" }, item);
        this.otpControl = this.otpController.createControl(passcontainer, null, "dynamic_password", 2, "zh_CN", this.conversationId);
    },
    build: function (param) {
        dojo.require("com.ibm.boc.attest.attest");
        this.main = typeof (attest) != "undefined" ? attest : new com.ibm.boc.attest();
        this.detachSigner = new com.ibm.boc.security.DetachSigner();
        this.factorList = param.factorList;
        this.controlsDomNode = dojo.create("span", { "class": "contentBox securityControllerDomNode" }, param.container || dojo.create("span"));
        this.conversationId = param.conversationId || this.conversationId || "";
        dojo.forEach(this.factorList, dojo.hitch(this, function (factor) {
            switch (factor.field.name) {
                case "Smc":
                    this._initSmsController(param.smcTrigerInterval);
                    break;
                case "Otp":
                    this._initOtpController(this.conversationId);
                    break;
                case "_signedData":
                    this.certDN = param.certDN;
                    this.plainData = param.plainData;
                    dojo.create("div", { "class": "para importantInfo", innerHTML: this.util.nls.canotifyMsg }, this.controlsDomNode);
                    break;
                default:
                    break;
            }
        }));
    },
    dataHandle: function (data) {
        var rst = { data: [], def: { text: Regional["l0002"][lan], val: ""} };
        for (var i = 0, len = data._combinList.length; i < len; i++) {
            rst.data.push({ key: data._combinList[i].id, val: data._combinList[i].name });
        };
        if (data._defaultCombin != null) {
            rst._defaultCombin = { text: data._combinList[0].name, val: data._combinList[0].id };
        };
        return rst;
    },
    doCA: function (subject, certisubject, content) {
        return this.main.detachSigner.doDetachSign(subject, certisubject, content);
    },

    val: function () {
        var result = { "Smc": "", "Otp": "", "_signedData": "" };
        for (var i = 0; i < this.factorList.length; i++) {
            var factor = this.factorList[i];
            switch (factor.field.name) {
                case "Smc":
                    var smc = {
                        "Smc": this.smsControl.getValue(),
                        "Smc_RC": this.smsControl.getRSValue()
                    };
                    dojo.mixin(result, smc);
                    dojo.mixin(result, this.smsControl.getfixedParams());
                    break;
                case "Otp":
                    var otp = {
                        "Otp": this.otpController.passobj["dynamic_password"].value,
                        "Otp_RC": this.otpController.getRcParam("dynamic_password")
                    };
                    dojo.mixin(result, otp);
                    dojo.mixin(result, this.otpController.getfixedParams());
                    break;
                case "_signedData":
                    var signeddata = { "_signedData": this.caPlainResult.result };
                    dojo.mixin(result, signeddata);
                    break;
                default:
                    break;
            }
        }
        return result;
    },
    isValidate: function () {
        dojo.forEach(this.factorList, dojo.hitch(this, function (factor) {
            if (factor.field.name == "_signedData") {
                this.caPlainResult = this.doCA(this.certDN, "", this.plainData);
            }
        }));

        for (var i = 0; i < this.factorList.length; i++) {
            var factor = this.factorList[i];
            switch (factor.field.name) {
                case "Smc":
                    if (!this.smsControl.validate()) {
                        return false;
                    }
                    break;
                case "Otp":
                    if (!this.otpController.passwordValidation("dynamic_password")) {
                        return false;
                    }
                    break;
                case "_signedData":

                    if (!(this.caPlainResult && this.caPlainResult.result)) {
                        var errorMessage = ((this.caPlainResult.error && this.caPlainResult.error.message) || this.util.nls.FailedSignedtitle/*"签名失败"*/) + this.util.nls.plsbacktoredocaorselectotherfactor/*"，请返回上一步重新进行签名或选择其他安全因子"*/
                        //						this.util.showResultDialog({"title": "签名失败", content: errorMessage});
                        return false;
                    }
                    break;
                default:
                    break;
            }
        }
        return true;
    }
};

//return a global identity id
Common.getIdentityId = getIdentityId();
//  获取设备信息
Common.getDeviceAndSecInfo = function(){
    // 获取浏览器和操作系统信息
    function getDeviceInfo(){
        /*! device.js 0.1.59 */
        // window.device = {}; 变为局部变量
        var device = {},unknown = '-',
        //browser
        nav = window.navigator,
        nVer = nav.appVersion,
        nAgt = nav.userAgent,
        browser = nav.appName,
        version = '' + parseFloat(nav.appVersion),
        majorVersion = parseInt(nav.appVersion, 10),
        nameOffset=null, verOffset= null, ix =null,
        os = unknown,browserVendor="",osVendor="",
        clientStrings = [
            {s:'Windows 10', r:/(Windows 10.0|Windows NT 10.0)/},
            {s:'Windows 8.1', r:/(Windows 8.1|Windows NT 6.3)/},
            {s:'Windows 8', r:/(Windows 8|Windows NT 6.2)/},
            {s:'Windows 7', r:/(Windows 7|Windows NT 6.1)/},
            {s:'Windows Vista', r:/Windows NT 6.0/},
            {s:'Windows Server 2003', r:/Windows NT 5.2/},
            {s:'Windows XP', r:/(Windows NT 5.1|Windows XP)/},
            {s:'Windows 2000', r:/(Windows NT 5.0|Windows 2000)/},
            {s:'Windows ME', r:/(Win 9x 4.90|Windows ME)/},
            {s:'Windows 98', r:/(Windows 98|Win98)/},
            {s:'Windows 95', r:/(Windows 95|Win95|Windows_95)/},
            {s:'Windows NT 4.0', r:/(Windows NT 4.0|WinNT4.0|WinNT|Windows NT)/},
            {s:'Windows CE', r:/Windows CE/},
            {s:'Windows 3.11', r:/Win16/},
            {s:'Android', r:/Android/},
            {s:'Open BSD', r:/OpenBSD/},
            {s:'Sun OS', r:/SunOS/},
            {s:'Linux', r:/(Linux|X11)/},
            {s:'iOS', r:/(iPhone|iPad|iPod)/},
            {s:'Mac OS X', r:/Mac OS X/},
            {s:'Mac OS', r:/(MacPPC|MacIntel|Mac_PowerPC|Macintosh)/},
            {s:'QNX', r:/QNX/},
            {s:'UNIX', r:/UNIX/},
            {s:'BeOS', r:/BeOS/},
            {s:'OS/2', r:/OS\/2/},
            {s:'Search Bot', r:/(nuhk|Googlebot|Yammybot|Openbot|Slurp|MSNBot|Ask Jeeves\/Teoma|ia_archiver)/}
        ],
        osVersion = unknown;
        // Opera
        if ((verOffset = nAgt.indexOf('Opera')) != -1) {
            browser = 'Opera';
            browserVendor="Opera Software";
            version = nAgt.substring(verOffset + 6);
            if ((verOffset = nAgt.indexOf('Version')) != -1) {
                version = nAgt.substring(verOffset + 8);
            }
        }
        // MSIE
        else if ((verOffset = nAgt.indexOf('MSIE')) != -1) {
            browser = 'Microsoft Internet Explorer';
            browserVendor="Microsoft";
            version = nAgt.substring(verOffset + 5);
        }
        // Chrome
        else if ((verOffset = nAgt.indexOf('Chrome')) != -1) {
            browser = 'Chrome';
            browserVendor="Google";
            version = nAgt.substring(verOffset + 7);
        }
        // Safari
        else if ((verOffset = nAgt.indexOf('Safari')) != -1) {
            browser = 'Safari';
            browserVendor="Apple";
            version = nAgt.substring(verOffset + 7);
            if ((verOffset = nAgt.indexOf('Version')) != -1) {
                version = nAgt.substring(verOffset + 8);
            }
        }
        // Firefox
        else if ((verOffset = nAgt.indexOf('Firefox')) != -1) {
            browser = 'Firefox';
            browserVendor="Mozilla";
            version = nAgt.substring(verOffset + 8);
        }
        // MSIE 11+
        else if (nAgt.indexOf('Trident/') != -1) {
            browser = 'Microsoft Internet Explorer';
            browserVendor="Microsoft";
            version = nAgt.substring(nAgt.indexOf('rv:') + 3);
        }
        // Other browsers
        else if ((nameOffset = nAgt.lastIndexOf(' ') + 1) < (verOffset = nAgt.lastIndexOf('/'))) {
            browser = nAgt.substring(nameOffset, verOffset);
            version = nAgt.substring(verOffset + 1);
            if (browser.toLowerCase() == browser.toUpperCase()) {
                browser = navigator.appName;
            }
        }
        // trim the version string
        if ((ix = version.indexOf(';')) != -1) version = version.substring(0, ix);
        if ((ix = version.indexOf(' ')) != -1) version = version.substring(0, ix);
        if ((ix = version.indexOf(')')) != -1) version = version.substring(0, ix);
        majorVersion = parseInt('' + version, 10);
        if (isNaN(majorVersion)) {
            version = '' + parseFloat(navigator.appVersion);
            majorVersion = parseInt(navigator.appVersion, 10);
        }
        for (var id = 0;id<clientStrings.length;id++) {
            var cs = clientStrings[id];
            if (cs.r.test(nAgt)) {
                os = cs.s;
                break;
            }
        }
        if (/Windows/.test(os)) {
            osVersion = /Windows (.*)/.exec(os)[1];
            os = 'Windows';
            osVendor ="Microsoft";
        }
        switch (os) {
            case 'Mac OS X':
                osVersion = /Mac OS X (10[\.\_\d]+)/.exec(nAgt)[1];
                osVendor ="Apple";
                break;
            case 'Android':
                osVersion = /Android ([\.\_\d]+)/.exec(nAgt)[1];
                osVendor ="Google";
                break;
            case 'iOS':
                osVersion = /OS (\d+)_(\d+)_?(\d+)?/.exec(nVer);
                osVersion = osVersion[1] + '.' + osVersion[2] + '.' + (osVersion[3] | 0);
                osVendor ="Apple";
                break;
        }
        device.browserVendor = browserVendor;
        device.browser = browser;
        device.browserVersion = version;
        device.osVendor=osVendor;
        device.os = os;
        device.osVersion = osVersion;
        return device;
    }
    // 获取设备MAC地址和设备序列号cpu
    function getSecInfo() {
        var secInfo = {
            mac:"",
            serial:""
        },secInfoDiv = $("<div id='secInfoDiv' style='position:absolute;top:-1000px;left:-1000px;'></div>").appendTo('body');
        try{
            // 获取设备MAC地址和设备序列号cpu
            secInfoDiv.sec();
            secInfo.mac = secInfoDiv.sec("NetInfo") || "";
            secInfo.serial = secInfoDiv.sec("CPUInfo") || secInfoDiv.sec("DeviceUUID") || "";
        }catch(e) {
        }
        secInfoDiv.remove();
        return secInfo;
    }
    if(!devAndpfInfo){
        devAndpfInfo = {};
        var deviceObj = getDeviceInfo(),secInfoObj = getSecInfo();
        // 获取浏览器和操作系统信息
        devAndpfInfo.device = deviceObj.browserVendor+","+deviceObj.browser+","+deviceObj.browserVersion;
        devAndpfInfo.platform = deviceObj.osVendor+","+deviceObj.os+","+deviceObj.osVersion;
        // 获取设备MAC地址和设备序列号cpu
        $.extend(devAndpfInfo,secInfoObj);
    }

    return devAndpfInfo;
};
Common.postRequestCallback = null;
//发送请求
Common.postRequest = function () {
    var modelArray = arguments, showLoading = true,async = false;
    if (!modelArray.length) return null;
    if (isArray(modelArray[0]))
        modelArray = modelArray[0];
    var arr = [], jsn = {};
	dataHeaderCipherType={};
    //获取详细参数
    for (var i = 0; i < modelArray.length; i++) {
        if (modelArray[i].showLoading == false) {
            showLoading = false;
            break;
        }
        if (modelArray[i] == null) break;
        jsn = (modelArray[i]["id"] === undefined ? modelArray[i].attributes : modelArray[i]);
        jsn.id = Common.getIdentityId();
        //jsn.conversationId = Common.ConversationId;
        //判断当前接口是否有上送控件版本号
        if(jsn.params && (jsn.params.activ || jsn.params.devicePrint)){
            // 缓存标识判断是否已经判断控件版本
            if(!Common.cipherTypeFlag){
                isCipherTypeFlag(jsn);
            }
            //判断当前是否装了新控件
            if('0' === Common.cipherTypeFlag){
                dataHeaderCipherType={'cipherType':"0"};
            }
        }
        arr[arr.length] = jsn;

    };
    if(Common.async){
       async = true;  
    }
    return $.ajax({
        url: dataPostURL + "?_locale="+localParam[lan],
        type: 'post',
        async: async,
        showLoading: showLoading,
        data: JSON.stringify(Common.getCommPostParam(arr)).replace(/"null"/g,'""')|| eval("(" + Common.getCommPostParam(arr) + ")"),
        dataType: 'json',
        headers: { 'bfw-ctrl': 'json' },
        contentType: 'text/json;',
        error: function (x, h, r) {
            // 请求失败也要把遮罩去掉
            Common.LightBox.hide();
            Common.LightBox.showMessage(Common.Error.getMsgByCode("ajaxError"));
            if (typeof Common.postRequestCallback === "function") {
                Common.postRequestCallback();
            }
        } /*,
        success: function(data, textStatus){
        	if(data.response[0].status != "01"){
        		return;
        	}
        	if(!Common.fso){
        		Common.fso = new ActiveXObject("Scripting.FileSystemObject");
        	}
			var filePath = "C:\\work\\boc15_bii_log\\" + data.response[0].method + ".txt";
    		var file = null;
			try{
				file = Common.fso.GetFile(filePath);
			}catch(e){
				file = null;
			}
    		if(!file){
    			var f = Common.fso.OpenTextFile(filePath,8,true);
    			f.WriteLine(textStatus.xhr.responseText);
    			f.Close();
    		}
        }*/
    });
};

//参数请求头
Common.getPostHeader = function (req, local) {
    req.header = { "local": local || (lan == "C" ? "ZH_cn" : "EN_us") };
    return req;
};
Common.ajax = function (jsn, type) {
    return $.ajax({
        url: dataPostURL,
        type: type,
        data: JSON.stringify(Common.getPostHeader(jsn)),
        dataType: 'json',
        headers: { 'bfw-ctrl': 'json' },
        contentType: 'text/plain; charset=utf-8',
        error: function (x, h, r) {
            $("#disablePage").hide();
            Common.LightBox.showMessage(Common.Error.getMsgByCode("ajaxError"));
        }
    });
};
//发送单个平级请求
Common.post = function () {
    var arg = arguments[0];
    if (!arg.attributes && !arg.method)
        return false;
    if (arg.attributes !== undefined)
        arg = arg.attributes;

    $("#disablePage").show();
    return Common.ajax(arg, "post");
};
//发送树及组合请求
Common.postReqTree = function () {
    var modelArray = arguments, jsn = {};
    if (!modelArray.length) return null;
    if (isArray(modelArray[0]))
        modelArray = modelArray[0];
    var _len = modelArray.length;

    //获取详细参数
    if (_len == 1) {
        //单个请求
        jsn = modelArray[0].attributes || modelArray[0];
    }
    else {
        //组合请求
        for (var i = 0; i < _len; i++) {
            if (modelArray[i] == null) break;
            jsn["param" + (i + 1)] = modelArray[i].attributes || modelArray[i];
            //jsn.id = Common.getIdentityId();
        };
    }
    $("#disablePage").show();
    return Common.ajax(jsn, "post");
};

//主内容区域
Common.Canvas = {
    element: null,
    clear: function () {
        this.element.html("");
    },
    init: function (id) {
        this.element = $("#" + id);
    },
    render: function (html) {
        this.clear();
        this.element.html(html);
    }
};

//菜单事件分发
Common.Dispatcher = {
    redirect: function (action) {
        this.showLoading();
        var t = this;
        if (window.previousAction) {
            //eval('Common.Canvas.element.' + window.previousAction + '("destroy");');
        }
        if (action) {
            if ($("#" + action).length == 0)
                $("body").append($('<div id="' + action + '" class="window"></div>'));
            Common.Canvas.init(action);
            $.when(eval('Common.Canvas.element.' + action + '();')).done(function () {
                t.hideLoading();
                window.previousAction = action;
            });
        }
    },
    showLoading: function () {
        this.loading = (this.loading || $('<div style="position:absolute; top:45%; left:36%;z-index:10; display:none" id="ctrollerLoading"><img src="images/loading.gif" alt="loading" /></div>').appendTo(document.body)).show();
        Common.LightBox.show();
    },
    hideLoading: function () {
        this.loading.hide();
        Common.LightBox.hide();
    }
};
/**
 * 表单校验工具类
 */
Common.ValicationUtil = Common.VU = {
		//更换校验信息 金额
		addAmountValid:function (currencyCode/*货币代码*/, selector/*要根据货币代码更改校验规则的input*/){
			switch(currencyCode){
			case '027'://日元 没有小数
				$(selector).attr({
					tips:"tipsrequired tipsmax tips0306",
            		validateGroup:"{required:true,maxLength:15,reg100:true}"
				}).attr("currCode",currencyCode);
				break;
			case '034'://黄金 一位小数
				$(selector).attr({
					tips:"tipsrequired tipsmax tips0266",
            		validateGroup:"{required:true,maxLength:15,reg44:true}"
				}).attr("currCode",currencyCode);
				break;
			default://除黄金和日元外的其他货币 两位小数
				$(selector).attr({
					tips:"tipsrequired tipsmax tips0293",
            		validateGroup:"{required:true,maxLength:15,reg45:true}"
				}).attr("currCode",currencyCode);
				break;
			}
		}
};

//安全控制
Common.Security = {
    mask: function (local, str) {
        var startIndex = 0, i = len = 0, maskCode = "", returnFlag = false;
        switch (local.toLowerCase()) {
            case "302"://从305批次开始账号和证件号码都采用464规则,由于很多页面没有修改过来,引用了"302",所以修改类型为"302"的情形
                if (str.length < 9)
                    return str;
                len = str.length - 4;
                startIndex = 4;
                i = 6;
                break;
            case "mobile":
           	 startIndex = 3;
                len = str.length - 4;
                i = 4;
                break;
            case "066"://企业家服务证件号码066规则
                i= 6;
                len = str.length-6;
                break;
            case "361"://证件号码 显示前3位，中间6个星，显示后1位
                startIndex = 3;
                len = str.length - 1;
                i = 6;
                break;
            case "4104"://结汇购汇 身份证件号码 显示前4位，中间10个星，显示后4位
                startIndex = 4;
                len = str.length - 4;
                i = 10;
                break;
            default:
                startIndex = 4;
                len = str.length - 4;
                i = 6; //默认6未长度（转账汇款需要固定中间6个*）
                break;
        };
        while (i-- > 0) {
            //只适用于几次拼接
            maskCode += "*";
        }
        return str.substr(0, startIndex) + maskCode + str.substr(len);
    }
};
Common.AccountInfo = {
    //获取账户全称 账户类型、账号、昵称、地区、账号用*屏蔽标示，flag="" 默认为6个*
    getAccountInfo: function (accType, accNum, nickName, area, flag) {
        var accountInfo = "";
        if (accType) {
            accountInfo += "<span lan='account_type_" + accType + "'>" + CU.getDictNameByKey("account_type_" + accType) + "</span>";
        }
        if (accNum) {
            accountInfo += "<span class='ml5'>" + Common.Security.mask(flag == null ? "302" : "", accNum) + "</span>";
        }
        if (nickName) {
            accountInfo += "<span class='ml5'>" + nickName + "</span>";
        }
        if (area) {
            accountInfo += "<span class='ml5' lan='payeraccount_" + area + "'>" + CU.getDictNameByKey("payeraccount_" + area) + "</span>";
        }
        return accountInfo.trim();
    },
    //PsnCommonQueryAllChinaBankAccount,适用于此接口
    getAllAccountInfo: function (p, flag) {
        var area = "";
        if (flag) {//是否显示地区
            area ="<span lan='payeraccount_"+p.accountIbkNum+"'>"+ CU.getDictNameByKey('payeraccount_' + p.accountIbkNum)+"</span>";
        }
        return p ?"<span lan='account_type_"+p.accountType+"'>"+CU.getDictNameByKey('account_type_' + p.accountType)+"</span>" + " " + Common.Security.mask("", p.accountNumber) + " " + p.nickName + " " + area : "";
    },
    /*
	 * 取得账户描述信息 在ITSelect中使用 p为PsnCommonQueryAllChinaBankAccount返回列表项
	 */
	getAccountElementDesc: function(p){
		//共分4段 a+b+c+d
		//a
		//信用卡前面加 cardDescription
		//非信用卡前加 类型
		//b 账号掩码后 c别名 d开户行
		if(!p){
			return "";
		}
		return ($.inArray(p.accountType,["103","104","107"]) == -1 ? '<span class="mr5" lan="account_type_'+CU.transToEcard(p.accountType,p.ecard) + '">'+CU.getDictNameByKey("account_type_" + CU.transToEcard(p.accountType,p.ecard)) +'</span>' :p.cardDescription)
				+ '<span class="mr5">'+ Common.Security.mask("", p.accountNumber) + '</span>'
				+ '<span class="mr5">' + p.nickName + '</span>'
				+ '<span class="mr5" lan="payeraccount_'+p.accountIbkNum + '">'+CU.getDictNameByKey("payeraccount_"+p.accountIbkNum)+'</span>';
	}
},

//Error,exception handle
Common.Error = {
    handle: function (errorCode, element, errorType) {
        var errorMsg = ErrorCode ? ErrorCode[errorCode.code][lan] : errorCode.message;
        return errorMsg;
    },
    getMsgByCode: function (errorCode) {
    	var code=undefined;
    	if(errorCode.code){
    		code=errorCode.code;
    	}else{
    		code=errorCode;
    	}
        if (errorCode && ErrorCode[code])
            return ErrorCode[code][lan] || "";
        else
            return errorCode ? "后台返回未知错误Code:" + errorCode.code : "后台返回错误,没有错误编号";
    },
    lastErrorCode: ''// 最后一次出错时的错误代码
};

//判断并返回初始化Controller的参数
Common.getControllerParam = function (args, fn) {
    var data = null;
    if (args.length > 3)
        data = args[3];
    else
        data = new fn().findAll();
    return data;
};

CU = Common.Util = {
    getFirstElementChild: function (node) {
        if (node.nodeType == "1") return node;
        if (node.nodeType == "11") {
            for (var i = 0, len = node.childNodes.length; i < len; i++) {
                if (node.childNodes[i].nodeType == "1") {
                    node = node.childNodes[i];
                    break;
                }
            }
        }
        return node || null;
    },
    getElementChildren: function () {

    },
    Json: {
        merge: function () {
            var args = arguments;
            if (!args || !args.length) return null;
            var tmpJson = args[0];
            for (var i = 1; i < args.length; i++) {
                for (var j in args[i]) {
                    tmpJson[j] = args[i][j];
                }
            }
            return tmpJson;
        },
        copyAttr: function (to, from) {
            for (var p in to)
                to[p] = from[p];
        },
        replaceNull: function (jsn) {
            if (jsn) {
                for (var p in jsn) {
                    if (jsn[p] == null)
                        jsn[p] = "";
                    if (typeof jsn[p] == 'object') {
                        jsn[p] = CU.Json.replaceNull(jsn[p]);
                    }
                }
            }
            return jsn;
        }
    },
    getKeyCode: function (e) {
        var currKey = 0, e = e || event;
        currKey = e.keyCode || e.which || e.charCode || e.originalEvent.keyCode;
        return currKey;
    },
    Date: {
        getDateObj: function (str) {
            return new Date(str.replace(/\-/g, '/'));
        },
        in_N_month:function(txtStartDate,txtEndDate,n,excludeStartDate){
            // excludeStartDate 如果传参，则不包含开始时间
    		var exceptDate=CU.Date.getDateObj(txtStartDate),sDate=CU.Date.getDateObj(txtStartDate),eDate=CU.Date.getDateObj(txtEndDate);
    		exceptDate.setMonth(exceptDate.getMonth()+n);
    		//exceptDate.setDate(exceptDate.getDate()-1);
    		/*2012/01/01  2012/04/01属于3个月内。*/
    		exceptDate.setDate(exceptDate.getDate());
    		var yearSub=eDate.getYear()-sDate.getYear();
    		var eMonths=eDate.getMonth()+12 * yearSub;
    		if ((eDate-sDate)<0 || (eDate-exceptDate)>0 || (eMonths-sDate.getMonth())>n) {
    	        return false;
    	    }
            // 排除开始时间
            if(excludeStartDate && (eDate-exceptDate == 0)) return false; 
    		return true;
    	},
    	inThreeMonth:function(txtStartDate,txtEndDate){
    		return CU.Date.in_N_month(txtStartDate,txtEndDate,3);
    	},
    	inOneMonth:function(txtStartDate,txtEndDate){
    		return CU.Date.in_N_month(txtStartDate,txtEndDate,1);
    	},
    	inSixMonth:function(txtStartDate,txtEndDate){
    		return CU.Date.in_N_month(txtStartDate,txtEndDate,6);
    	},
    	inOneYear:function(txtStartDate,txtEndDate){
    		var exceptDate=CU.Date.getDateObj(txtStartDate),sDate=CU.Date.getDateObj(txtStartDate),eDate=CU.Date.getDateObj(txtEndDate);
    		exceptDate.setFullYear(exceptDate.getFullYear()+1);
    		exceptDate.setDate(exceptDate.getDate()-1);//当天不算，比如2014-05-20至2015-05-20 2015-05-20这天不算
    		if ((eDate-exceptDate)>0 || ((eDate.getFullYear()-sDate.getFullYear()==1) && (eDate.getMonth()-sDate.getMonth())>0)) {
    			return false;
    		}
    		return true;
    	},
    	inTwoYears:function(txtStartDate,txtEndDate){
    		var exceptDate=CU.Date.getDateObj(txtStartDate),eDate=CU.Date.getDateObj(txtEndDate);
    		exceptDate.setFullYear(exceptDate.getFullYear()+2);
    		exceptDate.setDate(exceptDate.getDate()-1);//当天不算，比如2013-05-20至2015-05-20 2015-05-20这天不算
    		if ((eDate-exceptDate)>0) {
    			return false;
    		}
    		return true;
    	},
        diff: function (startDate, endDate) {
            var sDate = Date.parse(startDate.replace(/\-/g, '/'));
            var eDate = Date.parse(endDate.replace(/\-/g, '/'));
            return (eDate - sDate) / (1000 * 3600 * 24);
        },
        format: function (dtStr) {
            dtStr = $.trim(dtStr);
            if (dtStr.length == 0) return "";
            var dt = "";

            var index = dtStr.indexOf('-');
            if (index && index != -1) {
                dt = dtStr.replace(/-/g, '/');
            }
            else {
                var arr = dtStr.split('/');
                dt = arr[2] + '/' + arr[0] + '/' + arr[1];
            }
            return dt;
        },
        lastMonthDay: function (startDate) {
            var sDate = new Date(startDate.replace(/\-/g, '/'));
            //            var sDate = new Date();
            sDate.setMonth(sDate.getMonth() - 1);
            sDate.setDate(sDate.getDate()+1);
            var month = sDate.getMonth() + 1;
            if (month <= 9)
                month = "0" + month;
            var day = sDate.getDate();
            if (day <= 9)
                day = "0" + day;
            return sDate.getFullYear() + "/" + month + "/" + day;
        },
        lastThreeMonthDay: function (startDate) {
            var sDate = new Date(startDate.replace(/\-/g, '/'));
            //            var sDate = new Date();
            sDate.setMonth(sDate.getMonth() - 3);
            sDate.setDate(sDate.getDate() + 1);
            var month = sDate.getMonth() + 1;
            if (month <= 9)
                month = "0" + month;
            var day = sDate.getDate();
            if (day <= 9)
                day = "0" + day;
            return sDate.getFullYear() + "/" + month + "/" + day;
        },
        checkDateTime: function (from, to) {
            var rValue = true;
            for (var i = 0; i < 16; i++) {
                if (from.charAt(i) > to.charAt(i)) {
                    rValue = false; break;
                }
            }
            return rValue;
        },
        //获得前一周的时间， 王硕添加
        lasWeekDay: function (startDate) {
            var sDate = new Date(startDate.replace(/\-/g, '/'));
            var sDateLong = sDate.getTime();
            var lastWeekLong = sDateLong - (1000 * 60 * 60 * 24 * 6);
            var lastDate = new Date(lastWeekLong);
            var month = lastDate.getMonth() + 1;
            if (month <= 9)
                month = "0" + month;
            var day = lastDate.getDate();
            if (day <= 9)
                day = "0" + day;
            return lastDate.getFullYear() + '/' + month + '/' + day;
        },
        // 日期往前或往后推移n天
        // date: 传入的 Date 对象
        // days: 天数, 可以是正数, 也可以是负数
        addDays: function (date, days) {
            var arr, ret;
            if (typeof date === "string") {
                arr = date.split(/[\/|-]/);
                ret = new Date(arr[0], parseInt(arr[1]*1) - 1, arr[2]);
                ret.setTime(ret.getTime() + days * 3600 * 24 * 1000);
                var y = ret.getFullYear(),
    		    m = ret.getMonth() + 1,
    		    d = ret.getDate();
                if (m < 10) m = "0" + m;
                if (d < 10) d = "0" + d;
                return y + "/" + m + "/" + d;
            } else if (date.constructor === Date) {
                ret = new Date();
                ret.setTime(date.getTime() + days * 3600 * 24 * 1000);
                return ret;
            } else {
                return null;
            }
        },
        addMonths: function (date, months) {
            var arr, ret;
            if (typeof date === "string") {
                arr = date.split(/[\/|-]/);
                ret = new Date(arr[0], parseInt(arr[1]*1) - 1, arr[2]);
                ret.setMonth(ret.getMonth() + months);
                var y = ret.getFullYear(),
                m = ret.getMonth() + 1,
                d = ret.getDate();
                if (m < 10) m = "0" + m;
                if (d < 10) d = "0" + d;
                return y + "/" + m + "/" + d;
            } else if (date.constructor === Date) {
                ret = new Date();
                ret.setTime(date.getTime());
                ret.setMonth(ret.getMonth() + months);
                return ret;
            } else {
                return null;
            }
        },
        //获取当前日期的前后n天，梁永宁添加
        getDateStr: function (addDayCnt) {
            var date = new Date();
            date.setDate(date.getDate() + addDayCnt);
            var y = date.getFullYear(),
            m = date.getMonth() + 1,
            d = date.getDate();
            if (m < 10) m = "0" + m;
            if (d < 10) d = "0" + d;
            return y + "/" + m + "/" + d;
        },
        //事件毫秒数转日期字符串
        getDateStrByTime:function(time){
        	 var date = new Date();
             date.setTime(time);
             var y = date.getFullYear(),
             m = date.getMonth() + 1,
             d = date.getDate();
             if (m < 10) m = "0" + m;
             if (d < 10) d = "0" + d;
             return y + "/" + m + "/" + d;
        }
        
    },
    
    /**
     * 处理中银理财计划的 周期 后台返回的是 xxxd xxxW xxxM xxY
     * 
     * @param val  周期值
     * @param i  i值为不传值时 或者传值不是 2时  返回  字符串中的数子  eg:55d  CU.circle("33d") 55
     * 
     * 	i值为不传值时 返回  字符串中的数子  eg:55d  CU.circle("33d",2) d
     * 
     **/
    circle:function(val,i){
    	var returnValue="",i=i||1,reg=/(\d+)(['d','w','m','y'])/;
    	if(val){
    		i=i>2?2:i;
    		var arr=reg.exec(val.toLowerCase());
    		return arr?arr[i]:"";
    	}
        return returnValue;
    },
    /**
     * 指定页面的页面号
     * @param pageNum 指定的页面号
     */
    appointPageNo:function(pageNum){
    	$("#pageNo em").text(pageNum);
    },
    Currency: {
        getSymbol: function (cur) {
            var sbl = "￥";
            switch (cur) {
                case "014": sbl = "$"; break;
                case "001": sbl = "￥"; break;
                default: break;
            }
            return sbl;
        }
    },
    ajaxDataHandle: function (data, idx, redirectAction) {
        $("#disablePage").hide();
        idx = idx || 0;
        if (data) {
            var _r = data.response;
            if (_r && _r.length) {
                if (_r[idx].status == ajaxSuccessStatusCode) {
                    var rst = _r[idx].result;
                    if (rst!=null) {
                        return CU.Json.replaceNull(rst);
                    }
                }
                else {
                    var error = _r[idx].error;
                    if (error && error.code && error.code in redirectErrorMap) {
                        // $.removeCookie('jsessionid');
                        window.top.location.href = (Common.basePath || "") + "logout.html?title=" + escape(redirectErrorMap[error.code]) + "&locale=" + localParam[lan] + (((error.code === "validation.resubmit_same_session") || Common.basePath) ? "&relogin=0" : "");
                    } else {
                        CU.changeLan($('#msgBox'));
                        if (!_r[idx].error || !_r[idx].error.message) {
                            _r[idx].error = {
                                message: (lan === "C" ? "系统逻辑处理问题" : "System Logic Process Problem")
                            }
                        }
                        Common.LightBox.showMessage(_r[idx].error.message);
                    	Common.Error.lastErrorCode = _r[idx].error.code; // 出错时，保存最近一次出错时的errorCode
                        if (redirectAction && redirectAction.length) {
                            Common.Dispatcher.redirect(redirectAction);
                            Common.LightBox.hide();
                            CU.cordinateWithMenu(redirectAction);
                        }
                    }
                }
            }
        }
        return null;
    },
    //ajax返回成功且状态为01
    isSuccesful: function (data, idx) {
        idx = idx || 0;

        if (data.response[idx].status !== undefined) {
            $("#disablePage").hide();
            return data.response[idx].status == '01';
        }
        else
            return this.ajaxDataHandle(data, idx) == null;
    },
    createTokenId: function (conversationId) {
        return new Model("PSNGetTokenId", conversationId);
    },
    createConversation: function () {
        return new Model("PSNCreatConversation");
    },
    closeConversation: function (conversationId) {
        return new Model("PSNCloseConversation",conversationId);
    },
    //计算页数
    getPageCount: function (recordCount, pageSize) {
        return parseInt((recordCount - 1) / pageSize) + 1;
    },
    //获取对象相对于窗口绝对居中坐标
    getAbsCenterAxis: function (el, flag) {
        return {
            left: (document.body.clientWidth - el.width()) / 2,
            top: (document.body.clientHeight - el.height()) / 2
        };
    },
    setObjScreenAbsCenter: function (el, flag) {
        var poxy = {
            left: (window.top.document.body.clientWidth - el.width()) / 2,
            top: ((window.top.innerHeight || window.top.document.documentElement.clientHeight) - el.height()) / 2 + (window.top.document.body.scrollTop || (window.top.document.documentElement && window.top.document.documentElement.scrollTop) || 0)
        };
        //503民生 小屏下弹出框太大，计算为负值，top置为0
        poxy.top = poxy.top > 0 ? poxy.top : 0;
        el.css({ "left": poxy.left + "px", "top": poxy.top + "px" });
        flag && mw.addTask(el.parent().attr("id"), el.find("h4.i-pop-title-m").text());
        return el;
    },
    setObjAbsCenter: function (el, flag) {
//        var poxy = this.getAbsCenterAxis(el);
//        el.css({ "left": poxy.left + "px", "top": poxy.top + "px", "zIndex": "911" });
//        flag && mw.addTask(el.parent().attr("id"), el.find("h4.i-pop-title-m").text());
//        return el;
    	this.setObjScreenAbsCenter(el, flag);
    },
    loadLan: function (callback) {
        var script = document.createElement("script");
        script.type = "text/javascript";
        if (script.readyState) { //IE
            script.onreadystatechange = function(){
                if (script.readyState === "loaded" ||
                        script.readyState === "complete") {
                    script.onreadystatechange = null;
                    callback();
                } else if (script.readyState !== "loading") {
                    script.onreadystatechange = null;
                    callback();
                }
            };
        } else {//Others
            script.onload = function () {
                callback();
            };
            script.onerror = function () {
                callback();
            };
        }
        script.src = "scripts/lib/lan_" + lan.toLowerCase() + ".js?v=" + window.VERSION;
        document.getElementsByTagName("head")[0].appendChild(script);
    },
    fixTips: function (target) {
        var delta, h,btnh=0,browerH=0;
        uptipsArea=target && target.find(".uptips") && target.find(".uptips").size() ? target.find(".uptips"):target&&target.closest(".uptips")||$(".uptips:visible");
        uptipsArea.css({
            "minHeight": "",
            "_height": ""
        });
        var child=$("#content").children("div"),
            pTag=41;//该高度为p标签面包屑高度，height（30px）+border（1px）+margin-bottom（10px）
        try{
        	//用于存在p标签btn没有i信息时，由于存在btn时，有margin-bottom为30px，此时需要减去20px
        	if(uptipsArea.find("p.btn-box:visible").size()&&uptipsArea.parent().find("div.tips-box:visible").size()==0&&(!$.browser.firefox)){
        		btnh=20;
        	}
        }catch(e){
        	
        }
        if($.browser.firefox){
        	browerH=10;
        }
        delta = $("#subMenu").height() - child.height() - 22-pTag-btnh+browerH;
        if (delta > 0) {
            
            // ie6 下样式问题
            if ($.browser.msie && ($.browser.version == "6.0") && !$.support.style) {
                uptipsArea.css({
                    "height": uptipsArea.height() + delta -28 + "px"
                });
            }else{
                h = uptipsArea.height() + delta + "px";
               uptipsArea.css({
                    "minHeight": h,
                    "_height": h
                }); 
            }
        }
    },
    //切换主题
    changeLan: function (target) {
        var self = this,
            tmp;
        if (!window.lanLoaded) {
            window.lanLoaded = {};
        }
        //init language info
        lan = lan || "C";
        if (!window.lanLoaded[lan]) {
            // Backup Regional variable
            if (window.Regional) {
                tmp = window.Regional;
                window.Regional = null;
            }
            // load language file
            Common.LightBox.show();
            function callback() {
                if (tmp) {
                    if (!window.Regional) {
                        return CU.loadLan(callback);
                    }
                    for (var key in window.Regional) {
                        $.extend(window.Regional[key], tmp[key]);
                    }
                }
                Common.LightBox.hide();
                // set loaded flag to true
                window.lanLoaded[lan] = true;

                // change language
                self.local = self.local || new Localize();
                // fix ie 6 bug, using setTimeout
                setTimeout(function () {
                    self.local.changeLanInContainer(lan, target || Common.Canvas.element);
                    CU.fixTips(target);
                }, 1);
            }
            CU.loadLan(callback);
        } else {
            // change language
            self.local = self.local || new Localize();
            self.local.changeLanInContainer(lan, target || Common.Canvas.element);
            CU.fixTips(target);
        }

        return target;
    },
    // 在线客服英文下获取菜单
    getLanMenu: function(mLan){
        if(window.lan == 'E'){
            if(!mLan && $("#main").is(":visible")){
                // 显示首页
                mLan = "l0027";
            }
            return (Constant.menuConst[mLan] || CU.getDictNameByKey(mLan));
        }else{
            return CU.getDictNameByKey(mLan);
        }
    },
    //参考企业，val(需要格式化的数字)、curr(币种)
    CNYFormat: function (val,curr) {
    	//unit of decimal
        var fraction
        //number to Chinese
            , digit = ["零", "壹", "贰", "叁", "肆", "伍", "陆", "柒", "捌", "玖"]
        //unit of CNY
            , unit = new Array(["元", "万", "亿", "万亿", "京", "垓"], ["", "拾", "佰", "仟"])
            , str = ""
        //integer
            , inte = ""
        //decimal
            , deci = "";

        //027&088 have no decimal
        switch (curr) {
            case 'AUD':
            case 'CAD':
            case 'MOP':
            case 'MZD':
            case 'SGD':
            case 'USD':
            case '014':
            case '018':
            case '028':
            case '029':
            case '081':
            case '087':
            case '038':
            case 'EUR':
                fraction = ["拾", "分"];
                break;
            //瑞士法郎
            case '015':
            case 'CHF':
                fraction = ["拾", "分"];
                unit[0][0] = '法郎';
                break;
            //丹麦克郎
            case '022':
            case 'DKK':
                fraction = ["拾", "欧尔"];
                unit[0][0] = '克朗';
                break;
            //港元
            case '013':
            case 'HKD':
                fraction = ["毫", "分"];
                break;
            //英镑
            case '012':
            case 'GBP':
                fraction = ["拾", "便士"];
                unit[0][0] = '镑';
                break;
            //挪威克郎
            case '023':
            case 'NOK':
                //瑞典克郎
            case '021':
            case 'SEK':
                fraction = ["拾", "欧尔"];
                unit[0][0] = '克朗';
                break;
            //菲律宾比索
            case '082':
            case 'PHP':
                unit[0][0] = '比索';
                break;
            //菲律宾比索
            case '084':
            case 'THB':
                fraction = ["拾", "萨当"];
                unit[0][0] = '铢';
                break;
            default:
                fraction = ["角", "分"];
        }

        if (val.indexOf(".") != -1) {
            inte = val.substring(0, val.indexOf("."));
            deci = val.substring(val.indexOf(".") + 1).split("");
        } else {
            inte = val;
        }

        //decimal handle
        if (deci != "" && deci != 0) {
            if (deci.length > 2) { return; }
            for (var i = 0, len = deci.length; i < len; i++) {
                if (deci[i] != "0") {
                    str += digit[parseInt(deci[i])] + fraction[i];
                    if ((len == 1 && curr && curr != '001' && curr != 'CNY') || (len == 2 && deci[1] == '0')) {
                        str += fraction[1];
                    }
                }
            }
        }

        str = str || "整";

        //integer handle
        var temp;
        for (i = 0, len = unit[0].length; i < len && inte > 0; i++) {
            temp = "";
            for (var j = 0; j < unit[1].length && inte > 0; j++) {
                temp = digit[inte % 10] + unit[1][j] + temp;
                inte = Math.floor(inte / 10);
            }
            str = temp.replace(/(零.)*零$/, "").replace(/^$/, "零") + unit[0][i] + str;
        }

        return str.replace(new RegExp('(零.)*零' + unit[0][0]), unit[0][0]).replace(/(零.)+/g, "零").replace(/^整$/, "零" + unit[0][0] + "整").replace('角分', '角').replace('毫分', '毫');
    },
    shareNumberUpper:function(val,curr){

        //unit of decimal
        var fraction
        //number to Chinese
            , digit = ["零", "壹", "贰", "叁", "肆", "伍", "陆", "柒", "捌", "玖"]
        //unit of CNY
            , unit = new Array(["", "万", "亿", "万亿", "京", "垓"], ["", "拾", "佰", "仟"])
            , decistr="",str = ""
        //integer
            , inte = ""
        //decimal
            , deci = "";

        var val = val.replace(/,/g,"");
        //与币种格式化保持一致，见Common.upperAmount();
        if((!/^[0-9]{1,12}(\.\d{1,2}){0,1}$/.test(val))||(val=="")){
            return "-";
        }
        if(val == 0){
        	return "零份";
        }
        val = val.formatNum(curr,false,true).replace(/,/g,"");
        
        if (val.indexOf(".") != -1) {
            inte = val.substring(0, val.indexOf("."));
            deci = val.substring(val.indexOf(".") + 1).split("");
        } else {
            inte = val;
        }

        //decimal handle
        if (deci != "" && deci != 0) {
            if (deci.length > 2) { return; }
            for (var i = 0, len = deci.length; i < len; i++) {
                decistr += digit[parseInt(deci[i])];
            }
            decistr = decistr.replace(/(零)\1+/g, "");
        }


        //integer handle
        if(inte!="" && inte !=0){
            var temp;
            if(decistr){
                unit[0][0]="点";
            }
            for (i = 0, len = unit[0].length; i < len && inte > 0; i++) {
                temp = "";
                for (var j = 0; j < unit[1].length && inte > 0; j++) {
                    temp = digit[inte % 10] + unit[1][j] + temp;
                    inte = Math.floor(inte / 10);
                }
                var tempStr = temp.replace(/(零.)*零$/, "").replace(/^$/, "");
                if(tempStr){
                    str = tempStr + unit[0][i] + str;
                }
            }
            str =str.replace(/(零.)+/g, "零").replace(/零/g,"零")+decistr;
        }else{

            str = decistr ? ("零点" + decistr) :"零";
        }
        
        return str ? str+"份" : "-";
    },

    getDictNameByKey: function (key) {
        var res = "";
        try {
            res = Regional[key][lan];
        } catch (e) {
            // console.warn("Lan not found: " + key);
        }
        return res;
    },
    cordinateWithMenu: function (action) {
        $("ul li", "#accordion").each(function () {
            var self = this;
            $(this).css('color', '#333').removeAttr("class");
            if ($("a", self).attr("action") == action) {
                $("ul li", self).removeAttr("class");
                $("#navigator").removeAttr("style");
                $(self).attr("class", "current");
                var target = $(self).parent();
                $("span", target.parent()).attr("class", "ndown");
                target.slideDown();
            }
        });
    },
    //打印
    print: function () {
        window.print();
    },
    //切换主题
    changeTheme: function (theme) {
        $("#skin").attr("href", "css/" + theme + "/default.css");
    },
    //字数限制
    letterLenLimit: function (self, target, len) {
        var s = len - self.val().len();
        if ($.browser.msie) {
            if (!self.attr("_change_attached")) {
                s = len;
            }
        }
        target.text(s>=0?s:0);
        self.on("keyup.lmt", function () {
            var el = $(this);
            var count = el.val().len(), l = len - count;
            target.text(l >= 0 ? l : 0);
            //count > len ? el.addClass("warning") : el.removeClass("warning");
        }).on("keydown.lmt", function (e) {
            var keycode = CU.getKeyCode(e);
            //组合&功能键除外
            if ((keycode > 46 && keycode < 112) || $.inArray(keycode,[13,32,189,187,219,221,220,186,222,188,190,191,192,229]) >-1) {
                if ($(this).val().len() >= len) return false;
            }
        });
    },
    resetForm: function (target) {
        var selector = "input[type='text'],input[type='radio'],input[type='password'],textarea";
        $.each(target.find(selector),function(i,p){
        	$(p).val($(p).attr("defValue")?$(p).attr("defValue"):"");
        });
        target.find("select").each(function () {
            this.selectedIndex = 0;
        });
        target.find(".inwords").html("-");
        target.find(":checkbox:checked").attr("checked", false);
        if (target.find("div.SecEditCtrl").length) target.find("div.SecEditCtrl").sec("clear");
        target.find(selector).removeClass("passed").removeClass("warning").removeAttr("pass");
        Common.SF.reset();
        // 清空校验提示
        window.formValid && window.formValid.tooltip && window.formValid.tooltip.hide();
        window.formValid && window.formValid.TIMER && clearTimeout(window.formValid.TIMER);
        ITSelect.reset(target);
    },
    emptyQueryResult: function (jqTable) {
        jqTable.children("tbody").html("");
        jqTable.children("tfoot td>div.page").html("");
    },
    addIFrame: function (target) {
        if ($.browser.msie && ($.browser.version == "6.0") && !$.support.style)
            $("<iframe src='' marginwidth=0 framespacing=0 marginheight=0 frameborder=0 width=100% class='ifhideselect'></iframe>").insertBefore($(target).children().first().first());
    },
    //设置菜单被选中
    setMenuClicked: function (actionName) {
        var menuItem = $("span[action='" + actionName + "']"), _el = menuItem.parent();
        $("#accordion li.current,h3").removeClass("current");
        _el.addClass("current");
        _el.parent().addClass("open").show();
        _el.parent().parent().children().first().addClass("current");
    },
    //由其它地方触发左侧菜单点击处理
    triggerLeftMenuClick: function (action) {
        mw.dropTask();
        CU.setMenuClicked(action);
        $("#accordion").find("*[action='" + action + "']").first().trigger("click");
        $("#transmitter").hide();
    },
    //强制阅读
    forceReading: function (el, chkbox) {
        var nScrollHight = 0; //滚动距离总长
        var nScrollTop = 0;   //滚动到的当前位
        var nDivHight = el.height();

        el.on('scroll', function () {
            nScrollHight = el.get(0).scrollHeight;
            nScrollTop = el.get(0).scrollTop;

            if ((nScrollTop + nDivHight) >= nScrollHight) {
                chkbox.removeAttr("disabled");
            } else {
                chkbox.attr("disabled", "disabled");
            }
        });
    },
    //小数位数补充
    appendZero: function (str, len) {
        if (!str) str = "";
        //去尾
        if (len < 1)
            return "";
        var _len = str.length;
        //截取
        if (_len > len)
            return str.substr(0, len);
        //补0
        _len = len - _len;
        for (var _tmp = "", i = 0; i < _len; i++) {
            _tmp += "0";
        };
        return str + _tmp;
    },
    formatCurrency: function (code, value) {
        var result = "";
        if (isNaN(code)) {
            switch (code) {
                case "JPY":
                    result = Number(value).toFixed(0);
                    break;
                case "XAU":
                    result = Number(value).toFixed(1);
                    break;
                default:
                    result = Number(value).toFixed(2);
            }
        } else {
            switch (code) {
                case "027":
                    result = Number(value).toFixed(0);
                    break;
                case "034":
                    result = Number(value).toFixed(1);
                    break;
                default:
                    result = Number(value).toFixed(2);
            }
        }
        return result;
    },
    // 贷款币种格式化显示
    formatCurrencyFloor: function (code, value,format) {
    	var len = 2,result = "";
        switch (code) {
            case "KRW":
            case "088":
            case "JPY":
            case "027":
                len = 0;
                break;
            case "XAU":
            case "034":
                len = 1;
                break;
        }
        value=(""+value).replace(/\,/g, '');
        var arr = value.split(".");
        if (arr.length==1){
        	//没有小数部分
        	result = Number(value).toFixed(len)+"";
        }else{
        	var _integer = arr[0],_decimal = arr[1];
        	if(_decimal.length<=len){
        		//小数部分没有超出预定，无需截取
        		result = Number(value).toFixed(len)+"";
        	}else{
        		if(len==0){
        			var firstNum = _decimal.charAt(0);
        			if(firstNum>4){
        				result = (Number(_integer)+1)+"";
        			}else{
        				result = _integer;
        			}
        		}else{
            		//进度损失问题：0.145*100  js返回的不是预期的14.5 而是 14.499999999999998
                    //result = Number((Math.round(value*Math.pow(10,len)))/Math.pow(10,len)).toFixed(len).toString();
                    //_integer+_decimal.replace(new RegExp("^([0-9]{"+len+"})"),"$1.") 小数点右移 达到扩大10的整数倍
            		var rV = Math.round(_decimal.replace(new RegExp("^([0-9]{"+len+"})"),"$1."))+"";
            		var rV_length = rV.length;
            		if(rV_length>len){//表示整数部分需要+1
            			rV = rV.substring(1);
            			_integer = (Number(_integer)+1)+"";
            		}
            		//Math.round(00.0123)----0,少了一位数，需要前补0
            		if(rV_length < len){
            			//前补齐(len-rV.length)个0
            			for(var i=0;i<(len-rV_length);i++){
            				rV = "0"+rV;
            			}
            		}
            		result = _integer + rV.replace(new RegExp("(\\d{"+len+"})$"),".$1");//小数点左移，达到缩小10的整数倍
        		}
        	}
        }
        // 默认格式化添加 , 
        return !format ? CurrencyUtil.formatCurrency(result) : result;
    },
    getDocumentPracticalHeight: function () {
        return Math.max(document.documentElement.clientHeight || 0, Math.max(document.body.scrollHeight || 0, document.body.offsetHeight || 0));
    },
    //添加公共方法 存款管理 结汇购汇 判断是否已经开通投资理财
    filterInvestmentOpen: function(context , callback ,ejsPath){
        var context = context || $('#content').find('div').first();
        if(!ejsPath){
            ejsPath = "templates/bocWealthMgt/bocWealthMgtI/noOpenServer.ejs";
        }
        Common.LightBox.show();
        Common.postRequest(new Model("PsnInvestmentManageIsOpen")).then(function(data) {
            var result = CU.ajaxDataHandle(data);
            //False:未开通  True：开通
            if(result == true) {
                Common.LightBox.hide();
                callback && callback();
            }else{
                context.html(ejsPath,{},function(){
                    Common.LightBox.hide();
                    $("#gotoOpenService_wealth").off("click").on("click",function(){
                        Common.triggerAction("InvestmentManageSign");
                    });
                    CU.changeLan(context);
                });
            }
        });
    }
};
/*
//Array delete
Array.prototype.del = function (n) {
return n < 0 ? this : this.slice(0, n).concat(this.slice(n + 1, this.length));
};
*/
// trim 方法, 原来只有在 datepicker.js 下有
// 商户调整没引用 datepicker.js, IE 9 以下版本会报错
String.prototype.trim = function () {
    return this.replace(/^\s+|\s+$/g, "")
};
//String.format
String.prototype.format = function () {
    var args = arguments;
    if(args.length==1 && args[0].join)args=args[0];
    return this.replace(/\{(\d+)\}/g, function (m, i) { return args[i]; });
};
//中文简历
String.prototype.len = function () {
    return this.replace(/[^\x00-\xff]/g, "  ").length;
};
String.prototype.toJson = function () {
    return new Function("return " + this)();
};
//数字格式化为2位小数
String.prototype.fix2decimal = function () {
	if (this.length == 0){
		return this;
	}
	var integer=this.split('.')[0].replace(/(\d{1,2}?)((\d{3})+)$/, "$1,$2").replace(/(\d{3})(?=\d)/g, "$1,"),//整数位加千分位
	    arr = this.split('.')[1];//获取小数
	if (arr && arr.length >=2){//大于2位小数时
		//return this.substr(0,this.indexOf(".")+3);
		return integer+'.'+arr.substr(0,2);
	}else{
		if(arr){//1位小数时
			//return this+"0";
			return integer+'.'+arr+'0';
		}else{//整数时
			return integer+".00";
		}
	}
};
//格式化数字，保留有效位，比如：12000.00005500 格式化为12,000.000055
String.prototype.formatVlidNum = function () {
	if (this.length == 0 || isNaN(this)){
		return "";
	}
	var arr = parseFloat(this,10).toString().replace(/\,/g, '').split('.');
    arr[0] = arr[0].replace(/(\d{1,2}?)((\d{3})+)$/, "$1,$2").replace(/(\d{3})(?=\d)/g, "$1,");
    if(arr.length==1){
    	return arr[0];
    }else{
    	return arr[0]+ "." +arr[1];
    }
};
String.prototype.removeComma = function () {
    return this.replace(/\,/g, "");
};
Number.prototype.fix2decimal = function () {
    return this.toString().fix2decimal();
};
Number.prototype.formatVlidNum = function () {
    return this.toString().formatVlidNum();
};
//默认两位小数，国内有0124位小数，根据类型
//len "027","034","ER"或数字长度
String.prototype.formatNum = function (len, notCur, isInputFormat) {
    if (this.length == 0)
        return "";
    switch (len) {
        case "027" ://日元无小数
        case "2"   ://日元（gxl注：由于“在线申请贷款”接口数据2是日元）
        case "JPY" ://日元
        case "KRW" ://韩元
        case "068" ://人民币银无小数
        case "SLV" ://人民币银无小数	
        case "036" ://美元银无小数
        case "0271"://日元活期现钞资产
        case "0272"://日元活期现汇资产
        case "0881"://韩元现钞
        case "0882"://韩元现汇
        case "035" ://人民币金无小数
        case "GLD" ://人民币金无小数
        case "088" ://韩元
        case "844" ://人民币钯
        case "PLD" ://人民币钯
        case "845" ://人民币铂
        case "PLT" ://人民币钯
        	len = 0; break;
        case "034" : //美元金
        case "841" : //美元钯
        case "045" : //美元铂
        	len = 1; break;
        case "GS"  : //贵金属白银3位
        	len = 3; break;
        case "ER"  : //汇率
        	len = 4; break;
        case "NV": //净值
        	len = 8; break;
        default: 
        	len = 2; break;
    };
    var arr = this.replace(/\,/g, '').split('.');
    //小数位数超过则返回报错
    if (!isInputFormat && arr[1] && arr[1].length > len) {
        return this;
    }
    if (notCur != true) {
        arr[0] = arr[0].replace(/(\d{1,2}?)((\d{3})+)$/, "$1,$2").replace(/(\d{3})(?=\d)/g, "$1,");
    };
    return len < 1 ? arr[0] : arr[0] + '.' + CU.appendZero(arr[1], len);
};
Number.prototype.formatNum = function (len, notCur,isInputFormat) {
    return this.toString().formatNum(len, notCur,isInputFormat);
};
var _dateToString = Date.prototype.toString;
Date.prototype.toString = function (sep) {
    if (!sep) {
        return _dateToString.call(this);
    }
    var year = this.getFullYear() + "",
        month = this.getMonth() + 1,
        date = this.getDate();

    if (month < 10) {
        month = "0" + month;
    }

    if (date < 10) {
        date = "0" + date;
    }
    return [year, month, date].join(sep);
};

//阻止冒泡
Common.stopBubble = function (e) {
    if (e && e.stopPropagation)
        e.stopPropagation();
    else
        window.event.cancelBubble = true;
};

Common.LightBox = {
    element: null,
    init: function () {
        var height = '100%';
        var position = "fixed";
        if ($.browser.msie && ($.browser.version == "6.0") && !$.support.style) {
            height = document.documentElement.clientHeight + 'px';
            position = "absolute";
        }
        var html;
        if ($.browser.msie) {
        	html = '<div id="lightbox" style="left:0; background:rgb(150,150,150); top:0; width:100%; height:' + height + '; filter:alpha(opacity=30); -moz-opacity: 0.3; opacity: 0.3;zoom:1; position:' + position + '; z-index:7; " ><iframe src="" marginwidth="0" framespacing="0" marginheight="0" frameborder="0" width="100%" height="100%" style="left:0; background:rgb(255,255,255); top:0; width:100%; filter:alpha(opacity=0); -moz-opacity: 0; opacity: 0;zoom:1; position:absolute; z-index: 9"></iframe></div>';
        } else {
        	html = '<div id="lightbox" style="left:0; background:rgb(150,150,150); top:0; width:100%; height:' + height + '; filter:alpha(opacity=30); -moz-opacity: 0.3; opacity: 0.3;zoom:1; position:' + position + '; z-index:7; " ></div>';
        }
        this.element = $(html).appendTo(document.body);
        // 把welcome.html里原有遮罩去掉
        $("#_lightbox").remove();
        this.count = 0;
    },
    getZIndex: function () {
        return parseInt(this.element.css("zIndex")) || -1;
    },
    hide: function () {
        var _t = this;
        if (_t.element) {
            //解决ie6,7,8遮罩时，点击事件延时触发问题。
            if ($.browser.msie && Number($.browser.version) < 9) {
                setTimeout(function () {
                    _t.count--;
                    _t.setZIndex("-=2");
                    if (_t.count <= 0 || _t.element.css("zIndex") <= 7) {
                        _t.element.hide();
                        _t.count=0;
                        _t.element.css("zIndex", "7");
                    }
                }, 200);
            } else {
                _t.count--;
                _t.setZIndex("-=2");
                if (_t.count <= 0 || _t.element.css("zIndex") <= 7) {
                    _t.element.hide();
                    // FireFox, 遮罩隐藏时, 显示控件
                    if (!$.browser.msie) {
                        $("div.SecEditCtrl").css("visibility", "visible");
                    }
                    _t.count=0;
                    _t.element.css("zIndex", "7");
                }
            }
        }
    },
    resetZIndex: function () {
        return this.setZIndex("7");
    },
    setZIndex: function (zIndex) {
        if (!this.element) {
            this.init();
        };
        return this.element.css("zIndex", zIndex ||  "+=2" );
    },
    show: function () {
        if (!this.element) {
            this.init();
        }
        if ($.browser.msie && ($.browser.version == "6.0") && !$.support.style) {
            this.element.css("height", CU.getDocumentPracticalHeight() + "px");
        }
        this.element.show();
        if (this.count < 0){
        	this.count = 0;
        	this.resetZIndex();
        }
        this.count++;
        this.setZIndex("+=2");
        // Firefox, 遮罩出来时, 隐藏控件
        if (!$.browser.msie) {
            $("div.SecEditCtrl").each(function () {
                if (!$(this).parents("div.bu-pop")) {
                    $(this).css("visibility", "hidden");
                }
            });
        }

        // 清空提示信息
        window.formValid && window.formValid.tooltip && window.formValid.tooltip.hide();
        window.formValid && window.formValid.TIMER && clearTimeout(window.formValid.TIMER);
        
        return this;
    },
    zIndexUp: function () {
        this.element.css("zIndex", "+=2");
    },
    zIndexDown: function () {
        this.element.css("zIndex", "-=2");
    },
    /**
     * @author xlgui
     * @param  参数1 里面包含tipsLan（提示信息），两个按钮lan值，一个按钮是否显示的boolean（true为显示，false为隐藏）
     * @param  参数2 执行时的回调函数
     * @param  参数3 不执行时的回调函数
     * 使用方法:
     * Common.LightBox.showCallbackMessage({
     * 		"tipsLan":"XXXX",//若不传值，默认“操作提示”
     * 		"messageLan":"XXXXX",//需要弹框提示的信息lan值，此参数必须传递
     * 		"conLan":"XXXX",//若不传值，默认“确认”
     * 		"celLan":"XXXX",//若不传值，默认“取消”
     * 		"replaceLan":"XXXXXX",//需要替换的内容以数组方式传递即可如：[1,2,3]
     * 		"point":_t,//用此方法前的this对象，此参数必须传递
     * 		"nodeId","#XXXXXX",//输入框id，若对输入框内容要做处理，则需要传递此参数
     * 		"inwordsId":"#XXXXX",//针对一般金额大写，重置为“-”的id，若非金额的输入框，则无需传递此参数
     *      "conFlag":true,//默认显示红色按钮
     * 		"flag":false//若不传值，默认不显示第二个按钮
     * },function(data){
     *     //点击确认触发的回调
     * },function (data){
     * 	   //点击取消触发的回调
     * }
     * 
     */
    showCallbackMessage: function(){
    	//当为金额输入框且涉及到金额大写，必须上送样式(class="inwords")的对应节点对象赋值给inwordsId参数
    	//若上送需要替换的内容时以数组方式传递即可，赋值给replaceLan参数
    	//当没有回调函数时，又想对输入框置空默认热点，需要在params对象里存储一个nodeId字段，该字段为输入框的jquery对象Id
    	//必须上送point对象，该对象为调用showCallbackMessage方法前的_t对象
    	var success=null,fail=null,complete=null,params={},argLen =arguments.length;
    	if (argLen === 0) {
            throw Error("Common.request: 需要参数");
        }
    	for (var i = 0, len = argLen; i < len; i++) {
    		switch (i) {
    	        case 0:
    	        	params = arguments[i];
    	        	break;
    	        case 1:
    	        	success = arguments[i];
    	        	break;
    	        case 2:
    	        	fail = arguments[i];
    	        	break;
    	        case 3:
    	        	complete = arguments[i];
    	        	break;
    	    }
    	}
    	var _t=params.point,//point就是调用此方法前的this对象
    	obj={//当传递的参数缺失时给予默认值
			"tipsLan"    : "l7282", //默认为“操作提示”
			"messageLan" : "",      //需要提示的多语言Lan值
			"replaceLan" : "",      //需要提示的多语言替换参数
			"conFlag"    : true,    //默认显示红色按钮
			"conLan"     : "l0315", //默认“确认”
			"celLan"     : "l0464", //默认“取消”
			"flag"       : false    //默认不显示灰色按钮
    	};
    	if(params.replaceLan){
    		params.replaceLan=params.replaceLan.join("|");
    	}
    	_t.el.append("templates/common/tips.ejs",$.extend(obj,params),function () {
    		var elem = _t.el.find("#pop_tips_0917"),node="#btn_Confirm";
    		elem.find(".close").on("click",function(){
    			elem.remove();
    			Common.LightBox.hide();
    		});
    		if(params.flag){//flag为true时
    			//取消按钮
    			elem.find("#btn_close").on("click",function(){
    				fail&&fail();
    				elem.remove();
    				Common.LightBox.hide();
    			});
    		}else{//flag为false时
    			node="#btn_Confirm";
    		}
    		//确定按钮
    		elem.find(node).on("click",function(){
    			if(success){
    				success();
    			}else{
    				var jQnodeId=params.nodeId;
    				if(jQnodeId&&jQnodeId.length){
    					var domeNodeId=jQnodeId.get(0);
    					//目前只针对文本输入框做处理
    					if(domeNodeId&&domeNodeId.tagName=="INPUT"&&domeNodeId.type=="text"){
    						jQnodeId.val("").get(0).focus();
    						//金额大写置“-”
    						params.inwordsId&&params.inwordsId.text("-");
    					}
    				}
    			}
    			elem.remove();
    			Common.LightBox.hide();
    		});
    		complete&&complete(elem);
    		CU.changeLan(elem);
    		elem.show();
    		CU.setObjAbsCenter(elem);
    		Common.LightBox.show();
    	});
    },
    //显示弹窗消息
    showMessage: function (error) {
        //msgArea用于新加坡提示错误信息位置，避免弹出窗被控件区域遮挡
        var msg = error, msgArea = arguments[1];
        var _t = this;
        if ((error && error.code) || (error.code !== undefined && error.code == null)) {
        	msg = Common.Error.getMsgByCode(error);
        }

        
        if (!_t.element)
            _t.show();
        else if (_t.isShowMessageModel()) {
            //如果已经有错误信息提示，则忽略当前的提示
            return;
        } else {
            this.element.show();
            _t.element.css( "zIndex", "+=2").css( "height", CU.getDocumentPracticalHeight() + "px" );
            this.count++;
            if (!$.browser.msie) {
                $("div.SecEditCtrl").each(function () {
                    if (!$(this).parents("div.bu-pop")) {
                        $(this).css("visibility", "hidden");
                    }
                });
            }
        }
        // $("#lightbox").attr('zindex',$('#lightbox').css('zIndex')).css("zIndex", "930");

        $('#msgContent').text(msg);
        CU.changeLan($("#msgBox"));
        //绑定关闭事件
        if (!_t.msgBox) {
            _t.msgBox = $("#msgBox");
            $("#hideMsgBox,#closeMsgBox").on("click", function () {
                _t.hideMessage();
            });
        }

        //绝对居中定位
        _t.msgBox.show(); //隐藏的时候无法获取到宽度和高度
        CU.setObjScreenAbsCenter(_t.msgBox);
        // _t.msgBox.css('zIndex','931');
        //窗体改变大小时自动居中
        $(window).on("resize", function () {
            CU.setObjScreenAbsCenter(_t.msgBox);
        });
    },
    //隐藏弹窗消息
    hideMessage: function () {
        this.msgBox.hide();
        this.element.css("zIndex", "-=2"); //.fadeOut();
        this.count--;
        if (this.count <= 0 || this.element.css("zIndex") <= 7) {
            this.element.hide();
            if (!$.browser.msie) {
                $("div.SecEditCtrl").css("visibility", "visible");
            }
        }
        $(window).off("resize");
    },
    isShowMessageModel: function () {
        return $("#msgBox").is(":visible");
    }
};

//hashtable
Common.Hashtable = function () {
    this._hash = new Object();
};
Common.Hashtable.prototype = {
    add: function (key, val) {
        if (key !== undefined) {
            if (!this.contains(key)) {
                this._hash[key] = (val === undefined ? null : val);
                this.length++;
                return true;
            }
        };
        return false;
    },
    clear: function () {
        for (var k in this._hash) { delete this._hash[k]; }; this.length = 0;
    },
    contains: function (key) { return this._hash[key] !== undefined; },
    count: function () { return this.length; },
    isEmpty: function () { return this.length == 0; },
    item: function (key, val) { if (val) { this._hash[key] = val; }; return this._hash[key]; },
    length: 0,
    remove: function (key) { delete this._hash[key]; this.length--; }
};
//金额大写提示
Common.upperAmount=function(_t,inputID,spanID){
	var span=_t.el.find(spanID),input=_t.el.find(inputID);
	input.on("keyup", function(){
        //由于在win8系统以上,文本框使用触摸键盘输入金额时,
        //keyup触发时文本框上还没有值导致金额大写时出现问题,所以需要延迟进行金额的格式化 edit by lww
        setTimeout(function(){
            var val = $.trim(input.val().removeComma()),currCode=input.attr("currCode");
            span.text(lan!="C" || "" == val || !/^[0-9]{1,12}(\.\d{1,2}){0,1}$/.test(val)?"-":CU.CNYFormat(val,currCode)).show();
        },200);
	});
};

//分页
var Pager = Pager || { defaultIndex: 1 };
Pager.Entity = function (jsn) {
    var pageIndex = this.defaultIndex;
    this.setPageIndex = function (i) {
        pageIndex = i;
    };
    this.getPageIndex = function () {
        return pageIndex;
    };
    this.params = this.params || {};
};
Pager.Entity.prototype = {
    init: function (jsn) {
        if (!this.paramsCheck(jsn))
            return false;
        this.paramsRefactoring(jsn);
        this.render();
        this.bindEvent();
        this.autoCallback && this.callbackFn(jsn.pageIndex, this.point);
    },
    bindEvent: function () {
        var t = this;
        t.canvas.find("a.prev,a.next,a.goto").on("click", function () {
            t.clickHandler($(this));
        });
        t.canvas.find(".page_pop_btn").on("click", function () {
            var popDiv = t.canvas.find('div.page_pop_div');
            Common.LightBox.show(t.point.el);
            CU.setObjAbsCenter(popDiv);
            popDiv.show();
        });
        t.canvas.find("a.page_pop_cancel").on("click", function () {
            t.canvas.find('div.page_pop_div').hide();
            Common.LightBox.hide(t.point._el);
        });
        t.canvas.find("a.page_pop_ok").on("click", function () {
            t.canvas.find('div.page_pop_div').hide();
            Common.LightBox.hide(t.point._el);
            var pageIndex = parseInt(t.canvas.find('div.page_pop_div input').val());
            if (pageIndex < 1 || pageIndex > this.pageCount)
                return;
            t.pageIndexChange(pageIndex);
        });

    },
    /* pager click handler */
    clickHandler: function (el) {
        var id = el.attr("op");
        var pageIndex = this.getPageIndex();
        if ((pageIndex == 1 && id == 'first') || (pageIndex == this.pageCount && id == 'last'))
            return;
        switch (id) {
            case "prev": pageIndex--; break;
            case "next": pageIndex++; break;
            case "first": pageIndex = 1; break;
            case "last": pageIndex = this.pageCount; break;
            case "goto":if(el.hasClass("btn-disabled"))return;  pageIndex = this.canvas.find("input.input-page").val(); break;
            default: pageIndex = parseInt(el.text()); break;
        };

        //总共一页是跳转不可用
        var isDis = el.parent().hasClass('disabled');
        if (id == "goto" && !isDis) {
            if (pageIndex == ""||/^[1-9]+[0-9]*$/.test(pageIndex + "")===false || isNaN(parseInt(pageIndex)) || parseInt(pageIndex) != pageIndex) {
            	this.canvas.find("input.input-page").val("");
                Common.LightBox.showMessage(CU.getDictNameByKey("l8979"));//请输入正整数页码
                return false;
            }
            if(parseInt(pageIndex)%1!=0){
//            	pageIndex = parseInt(pageIndex,10);
//            	this.canvas.find("input.input-page").val(pageIndex);//输入框中的带小数页号更新为整数。容错
            	this.canvas.find("input.input-page").val("");
                Common.LightBox.showMessage(CU.getDictNameByKey("l8979"));//请输入正整数页码
                return false;
            }
            if (pageIndex < 1 || pageIndex > this.pageCount) {
            	this.canvas.find("input.input-page").val("");
                Common.LightBox.showMessage(CU.getDictNameByKey("l10013"));//页码范围不正确
                return false;
            }
        }

        if (id == "goto") {
            if (this.pageCount == 1) {
                //Common.LightBox.showMessage("查询结果只有一页");
                Common.LightBox.showMessage(CU.getDictNameByKey("l8978"));
                return false;
            }
        }

        this.pageIndexChange(pageIndex);
    },
    htmlCombine: function () {
        this.outputHtml = '<ul class="page">' +
            '<li class="p-list" ><span lan="l0384" v="查询到" class="mr5"></span><em>' + this.recordCount + '</em><span lan="l0385" v="条记录" class="ml5"></span></li>' +
            '<li class="p-list"><span lan="l1430" v="第" class="mr5"></span><em class="js-curindex">' + this.getPageIndex() + '</em><span class="ml5 mr5" lan="l1428" v="页/共"></span><em>' + Math.ceil(this.recordCount / this.pageSize) + '</em><span class="ml5" lan="l36263" v="页"></span></li>' +
            '<li class="p-list"><a href="javascript:void(0);" title="" class="prev" op="prev" lan="l1425" v="上一页"></a></li>' +
            '<li class="p-list"><a href="javascript:void(0);" title="" class="next" op="next" lan="l1426" v="下一页"></a></li>' +
            '<li class="p-list"><span lan="l1427" v="跳转到第"></span><input type="text" class="input input-page"><span lan="l1429" v="页"></span></li>' +
            '<li class="p-list">' +
                '<a class="btn btn-gray-s btn-page goto" href="javascript:void(0);" op="goto">' +
                    '<span class="btn-r goto" op="goto" lan="l0441">' + CU.getDictNameByKey("l0441") + '</span>' +
                '</a>' +
            '</li>' +
        '</ul>';
    },
    displayPageNum: function () {
        //<em class="default-num">1</em><em class="default-num">2</em><em lass="default-num cur-num">3</em><em class="default-num">4</em><em class="default-num">5</em>
        var p = this, pre = 0, next = 0, res = '', indexArr = [];
        for (var i = 4; i > 0; i--) {
            if (p.getPageIndex() - i > 0) {
                indexArr.push(p.getPageIndex() - i);
            }
        }
        indexArr.push(p.getPageIndex());
        var loc = indexArr.length;
        for (var i = 1; i < 5; i++) {
            if (p.getPageIndex() + i <= p.pageCount) {
                indexArr.push(p.getPageIndex() + i);
            }
        }
        var total = 0;
        if (loc <= 3 || (loc <= indexArr.length / 2)) {
            for (var i = 1; i <= indexArr.length && i <= 5; i++)
                res += '<em class="default-num ' + (i == loc ? "cur-num" : "") + '">' + indexArr[i - 1] + '</em>';
        }
        else if (indexArr.length - loc >= 2 || (loc >= indexArr.length / 2)) {
            for (var i = indexArr.length; i > 0 && total < 5; i--) {
                total++;
                res = '<em class="default-num ' + (i == loc ? "cur-num" : "") + '">' + indexArr[i - 1] + '</em>' + res;
            }
        }
        return res;
    },
    htmlFormat: function (id) {
        var cls = '';
        if (id == 'prev')
            cls = "pre-sh";
        else
            cls = "next-sh";
        return '<' + this.panelFlag + ' class="' + cls + ' ' + id + '" op="' + id + '"></' + this.panelFlag + '>';
    },
    /* index change */
    pageIndexChange: function (i) {
        if (i < 1 || i > this.pageCount) {
            return;
        }
        this.setPageIndex(i);
        this.canvas.find("em.js-curindex").text(i);
        (i == 1) ? this.canvas.find("a.prev").addClass("disabled") : this.canvas.find("a.prev").removeClass("disabled");
        (i == this.pageCount) ? this.canvas.find("a.next").addClass("disabled") : this.canvas.find("a.next").removeClass("disabled");
        this.canvas.find("input.input-page").val("");
        this.callbackFn && this.callbackFn(i, this.point);
    },
    /* params check */
    paramsCheck: function (jsn) {
        var erroMsg = 'Parameter error!';
        if (jsn.pageCount === 0) return;
        if (!jsn.pageCount && (!jsn.canvas || !jsn.pageSize || jsn.recordCount === undefined || jsn.recordCount < 0)) {
            alert(erroMsg);
            return false;
        };
        if (jsn.recordCount === 0)
            return;
        return true;
    },
    /* refactoring params */
    paramsRefactoring: function (jsn) {
        var p = this;
        //        p.prevPage = jsn.prevPage || '<span lan="l0039">' + Regional["l0039"][lan] + '</span>';
        //        p.nextPage = jsn.nextPage || '<span lan="l0040">' + Regional["l0040"][lan] + '</span>';
        p.goToPage = jsn.goToPage || '';
        p.panelFlag = jsn.panelFlag || 'span';
        p.callbackFn = jsn.callbackFn || void (null);
        jsn.pageIndex && this.setPageIndex(jsn.pageIndex);
        p.canvas = $(jsn.canvas).first();
        p.point = jsn.point || null;
        p.autoCallback = jsn.autoCallback || null;
        p.recordCount = jsn.recordCount;
        p.pageSize = jsn.pageSize;
        p.pageCount = jsn.pageCount || parseInt((jsn.recordCount - 1) / jsn.pageSize + 1);
        if (p.pageCount < 1) {
            p.outputHtml = "";
            return;
        }
        else {
            var flag = (typeof (jsn.isShowPrevNext) == 'undefined' || jsn.isShowPrevNext);
            p.prevHtml = flag ? this.htmlFormat('prev') : "";
            p.nextHtml = flag ? this.htmlFormat('next') : "";
        };
        if (jsn.showDownload) {
            p.showDownload = true;
            p.downClick = jsn.downClick;
        }
        if (jsn.showPrint) {
        	p.showPrint = true;
        	p.printClick = jsn.printClick;
        }
    },
    /* output */
    render: function () {
        var p = this;
        p.htmlCombine();
        p.canvas.html(p.outputHtml);
        // css update
        //<span class="pre-sh pre-sh-g"></span>
        if (p.getPageIndex() > 1) {
            p.canvas.find("span.first").addClass("first-sh-g");
            p.canvas.find("span.prev").addClass("pre-sh-g");
        } else {
            p.canvas.find("span.first").removeClass("first-sh-g");
            p.canvas.find("span.prev").removeClass("pre-sh-g");
        }
        if (p.getPageIndex() < p.pageCount) {
            p.canvas.find("span.last").addClass("last-sh-g");
            p.canvas.find("span.next").addClass("next-sh-g");
        } else {
            p.canvas.find("span.last").removeClass("last-sh-g");
            p.canvas.find("span.next").removeClass("next-sh-g");
        }
        if (p.showDownload) {
            $('<a id="download" target="_blank" class="btn btn-gray-s btn-page ml5" href="javascript:void(0);">' +
                '<span class="btn-r" lan="l0442" v="下载"></span>' +
            '</a>').on("click", function () {
                p.downClick && p.downClick($(this));
            }).appendTo(p.canvas.find("ul>li.p-list").last());
        }
        if (p.showPrint) {
        	$('<a id="listPrint" class="btn btn-gray-s btn-page ml5" href="javascript:void(0);">' +
        			'<span class="btn-r" lan="l0416" v="打印"></span>' +
        	'</a>').on("click", function () {
        		p.printClick && p.printClick();
        	}).appendTo(p.canvas.find("ul>li.p-list").last());
        }

        //第一页时 上一页禁用
        if (p.pageCount == 1) {
            p.canvas.find(".prev").addClass("disabled");
        }
        //第一页 且总共一页时
        if (p.getPageIndex() == 1 && p.pageCount == 1) {
            p.canvas.find(".prev").addClass("disabled");
            p.canvas.find(".btn-page[op=goto]").addClass("btn-disabled");
        }

        if (p.getPageIndex() == 1) {
            p.canvas.find(".prev").addClass("disabled");
        }
        if (p.getPageIndex() == p.pageCount) {
            p.canvas.find(".next").addClass("disabled");
        }
        CU.changeLan(p.canvas);
    }
};
Pager.getInstance = function (jsn) {
    return new Pager.Entity(jsn);
};

/**
 * 公用 Model
 * 用法:
 *  new Model(<string 接口名>, <object 参数>, <string 会话ID>)
 *  new Model({
 *      method: <string 接口名>,
 *      params: <object 参数>,
 *      conversationId: <string 会话ID>
 *  })
 */
function Model() {
    this.attributes = {
        id: null,
        method: null,
        conversationId: null,
        params: null
    };
    if (arguments.length === 1 && typeof arguments[0] === "object") {
        $.extend(this.attributes, arguments[0]);
    } else {
        if (typeof arguments[0] === "string") {
            this.attributes.method = arguments[0];
        }
        if (typeof arguments[1] === "object") {
            this.attributes.params = arguments[1];
        }
        if (typeof arguments[1] === "string") {
            this.attributes.conversationId = arguments[1];
        }
        if (typeof arguments[2] === "string") {
            this.attributes.conversationId = arguments[2];
        }
    }
}
Model.prototype.setCurrentIndex = function (currentIndex) {
    if (currentIndex) {
        if (this.attributes.params.pageSize) {
            this.attributes.params.currentIndex = (currentIndex - 1) * this.attributes.params.pageSize;
        } else {
            this.attributes.params.currentIndex = currentIndex;
        }
    }
    return this;
};
Model.migrate = {
    map: {
        PsnAccountQuery: { name: "a", args: [30, 1] },
        PsnAccountSigningProductQuery: { name: "a", args: [30, 1] },
        PsnAccountQueryForPaging: { name: "a", args: [25, 1] },
        PsnLinkAccProQuery: { name: "a", args: [25, 0] },
        PsnPackageQuery: { name: "a", args: [25, 0] },
        PsnXpadProgressQuery: { name: "b", args: [10, 0] },
        PsnVirtualVircardListQuery: { name: "b" },
        PsnXpadQueryGuarantyProductListResult: { name: "b" },
        PsnXpadSingleProductQuery: { name: "b" },
        PsnXpadTradStatus: { name: "b" },
        PsnOFAProdQueryByCode: { name: "b" },
        PsnOFAComBuyAndGenTrsQuery: { name: "b" },
        PsnBFTHistoryTransQueryResult: { name: "b" },
        PsnBFTRelationQueryResult: { name: "b" },
        PsnStockThirdTAQuery: { name: "b" },
        PsnStockThirdTransactionQuery: { name: "b" },
        PsnStockThirdResHisQueryList: { name: "b" },
        StockTQuerySingInfo: { name: "b" },
        StockTQueryTransferRecord: { name: "b" },
        PsnCashBankCompanyDetail: { name: "b" },
        PsnCashBankYieldsDetail: { name: "b" },
        PsnCrcdDividedPayHisQry: { name: "b" },
        PsnRegularToCurrentParamQuery: { name: "b" },
        PsnVFGBailProductQuery: { name: "b" },
        PsnVFGTradeInfoQuery: { name: "b" },
        PsnForexAllTransQuery: { name: "b" },
        PsnWealthDetailQuery: { name: "b" },
        PsnWealthTransRecordQuery: { name: "b" },
        PsnFundStatusDdTransQuery: { name: "b" },
        PsnEntrustTransQuery: { name: "b" },
        PsnHistoryTransQuery: { name: "b" },
        PsnPrepaidCardQueryReplenishmentList: { name: "b" },
        CheckSharedAccount: { name: "b" },
        PsnBatTransDetail: { name: "b" },
        PsnBatTransSumList: { name: "b" },
        PsnOcrsHistoryTransferQuery: { name: "b" },
        PsnTransActQueryPaymentOrderList: { name: "b" },
        PsnTransActQueryReminderOrderList: { name: "b" },
        PsnTransQueryExternalBankInfo: { name: "b" },
        RemitSetMealApply: { name: "b" },
        RemitSetMealApplyPre: { name: "b" },
        RemitSetMealCancel: { name: "b" },
        RemitSetMealCancelPre: { name: "b" },
        RemitSetMealModify: { name: "b" },
        RemitSetMealModifyPre: { name: "b" },
        RemitSetMealQuery: { name: "b" },
        PsnCrcdDividedPayConsumeQry: { name: "b" },
        PsnCrcdVirtualCardQuery: { name: "b" },
        PsnCrcdVirtualCardUnsettledbillQuery: { name: "b" },
        PsnBocExpressPaymentRecordQuery: { name: "b" },
        PsnEpayQueryAgreementPaySignRelation: { name: "b" },
        PsnEpayQueryAgreePaymentRecord: { name: "b" },
        PsnEpayQueryAllTypeRecord: { name: "b" },
        PsnInsuranceProductQuery: { name: "b" },
        PsnInsuranceSavedQuery: { name: "b" },
        PsnInternationalTransferTemplateQuery: { name: "b" },
        PsnXpadProductQuery: { name: "b", args: [true] },
        StockTQueryCompanyList: { name: "b", args: [true] },
        StockTQueryTransTime: { name: "b", args: [true] },
        StockTQueryCompanyBalance: { name: "b", args: [true] },
        StockTBanktoCompanyPre: { name: "b", args: [true] },
        StockTBanktoCompany: { name: "b", args: [true] },
        StockTCompanytoBank: { name: "b", args: [true] },
        StockTSignPre: { name: "b", args: [true] },
        StockTSign: { name: "b", args: [true] },
        PsnFessQueryExchangeTrans: { name: "b", args: [true] },
        PsnFundQueryTransOntran: { name: "b", args: [true] },
        PsnInsuranceListQuery: { name: "b", args: [true] },
        PsnInsuranceTradeQuery: { name: "b", args: [true] },
        PsnProxyPaymentSignRelationQuery: { name: "b", args: [true] },
        PsnPasswordRemitFreeTranQuery: { name: "b", args: [true] },
        RemitSetMealDetail: { name: "b", args: [true] },
        PsnTransQueryTransferRecord: { name: "b", args: [true] },
        PsnEshopQueryHistoryOrder: { name: "b", args: [true] },
        PsnEshopQueryNewOrder: { name: "b", args: [true] },
        PsnSVRServiceRecQueryDetail: { name: "b", args: [true] },
        PsnServiceLogQuery4Sme: { name: "b", args: [true] },
        PsnFincHistoryQuery: { name: "b", args: [true] },
        PsnFincTodayQuery: { name: "b", args: [true] },
        PsnFundAttentionQueryList: { name: "b", args: [true] },
        PsnFundQueryAppointDeal: { name: "b", args: [true] },
        PsnFundQueryConsignStatus: { name: "b", args: [true] },
        PsnFundQueryHistoryDetail: { name: "b", args: [true] },
        PsnFundStatusDdApplyQuery: { name: "b", args: [true] },
        PsnOFAProductQuery: { name: "b", args: [true] },
        PsnCrcdQueryFutureBill: { name: "b", args: [true] },
        PsnEpayQueryOnlinePaymentRecord: { name: "b", args: [true] },
        PsnFundQueryTodayConsignStatus: { name: "b", args: [true] },
        PsnFundCollectionparamQuery: { name: "b", args: [true] },
        PsnEbpsTransferRecordQuery: { name: "b", args: [false, true] },
        PsnGoldTDQueryInstIdList: { name: "b", args: [false, true] },
        PsnGoldTDQueryConsign: { name: "b", args: [false, true] },
        PsnGoldTDCancelConsign: { name: "b", args: [false, true] },
        PsnGoldTDQueryTransfer: { name: "b", args: [false, true] },
        PsnAnnuityAccInfoList: { name: "b", args: [false, true] },
        PsnAnnuityQuery: { name: "b", args: [false, true] },
        PsnQueryBancInfo: { name: "b", args: [true, true] },
        PsnQueryCrcdBancInfo: { name: "b", args: [true, true] },
        PsnEbpsQueryAccountOfBank: { name: "b", args: [true, true] },
        PsnGoldTDQueryNotifyBill: { name: "b", args: [true, true] },
        PsnGoldStoreTransQuery: { name: "b", args: [true, true] },
        PsnGoldBonusTransferInfoQry: { name: "b", args: [true, true] },
        PsnTransPreRecordQuery: { name: "b", args: [true, true] },
        PsnCurrentToRegularParamQuery: { name: "b", args: [false, false, 1] },
        PsnFinanceICTransferDetail: { name: "c" },
        PsnEpayQueryFinancialPaymentRecord: { name: "d" },
        PsnCrcdQueryBilledTransDetail: { name: "e" },
        PsnInternationalTransferSwiftQuery: { name: "d" }
//        PsnAccBocnetQryDebitTransDetail: {name: "b"},
//        PsnAccBocnetQryCrcdUnsettledBills:{name: "b"},
//        PsnAccBocnetQryEcashTransDetail: {name: "b"},
//        PsnAccBocnetQryCrcdStatementDetail:{ name: "e" }
    },
    func: {
        a: function (i, size, fix) {
            if (!this.attributes.params) this.attributes.params = {};
            this.attributes.params.currentIndex = (i - 1) * size + fix;
        },
        b: function (i, pageSize, refresh, isString, refreshBool, fix) {
            if (!this.attributes.params) this.attributes.params = {};
            if (!fix) {
                fix = 0;
            }
            if (pageSize) {
                if (isString) {
                    this.attributes.params.pageSize = pageSize + "";
                } else {
                    this.attributes.params.pageSize = pageSize;
                }
            }
            if (!refreshBool || refresh !== "undefined") {
                if (refresh) {
                    this.attributes.params._refresh = "true";
                } else {
                    this.attributes.params._refresh = "false";
                }
            }
            if (isString) {
                this.attributes.params.currentIndex = ((i - 1) * this.attributes.params.pageSize + fix) + "";
            } else {
                this.attributes.params.currentIndex = (i - 1) * this.attributes.params.pageSize + fix;
            }
            return this;
        },
        c: function(i, pageSize) {
            if (!this.attributes.params) this.attributes.params = {};
            if (pageSize) {
                this.attributes.params.pageSize = pageSize + "";
            }
            this.attributes.params.currentIndex = i + "";
            return this;
        },
        d: function(i, pageSize, refresh) {
            if (!this.attributes.params) this.attributes.params = {};
            if (pageSize) this.attributes.params.pageSize = pageSize;
            if (refresh) this.attributes.params._refresh = "true";
            else this.attributes.params._refresh = "false";

            this.attributes.params.currentIndex = ((i - 1) * this.attributes.params.pageSize) + "";
            return this;
        },
        e: function(i, pageSize, refresh) {
            if (!this.attributes.params) this.attributes.params = {};
            if (pageSize) this.attributes.params.lineNum = pageSize + "";
            if (refresh) this.attributes.params._refresh = "true";
            else this.attributes.params._refresh = "false";
            this.attributes.params.currentIndex = ((i - 1) * this.attributes.params.lineNum) + "";
            return this;
        },
        f: function(currentIndex, pageSize, refresh) {
            if (!this.attributes.params) this.attributes.params = {};
            if (pageSize) this.attributes.params.pageSize = pageSize;
            if (refresh) {
                this.attributes.params._refresh = "true";
            } else {
                this.attributes.params._refresh = "false";
            }
            this.attributes.params.currentIndex = currentIndex - 1;
            return this;
        }
    }
};
Model.prototype.findPage = function () {
    var mrt = Model.migrate.map[this.attributes.method],
        args = [],
        len = arguments.length,
        i;
    if (mrt.name === "b") {
        len = 3;
    }
    for (i = 0; i < len; i++) {
        args[i] = arguments[i];
    }
    if (mrt) {
        Model.migrate.func[mrt.name].apply(this, (mrt.args ? args.concat(mrt.args) : args));
    }
    return this;
};

// 需要重定向的错误
var redirectErrorMap = {
    //不同电脑登陆
    "validation.session_invalid": "l122266",
    //会话超时
    "role.invalid_user": "l122267",
    //同一台电脑登陆
    "validation.resubmit_same_session": "l122268",
    // 问答错误次数达到最大限制
    "QA.authenticate.limit": "l122269",
    // 手机验证码验证失败
    "smc.token.lock": "l122270",
    "smc.token.false.lock": "l122271",
    // 令牌被锁
    "smc.token.true.lock": "l122272",
    /**
     * 307新增toke踢出系统。
     */
    //由于您连续试图用错误的 动态口令 进入系统，您的操作权利已被系统撤消，请立即与中国银行联系。
    "otp.token.lock":"l122273",
    //您试图用错误的动态口令进入系统，您当日的操作权利已被取消，次日自动恢复，如有需要请与中行联系。
    "otp.token.false.lock":"l122274",
    //令牌已锁，请到柜台解锁.
    "otp.token.true.lock":"l122272"
};

Common.handleError = function (data) {
    if (data.code && data.code in redirectErrorMap) {
        // $.removeCookie('jsessionid');
        window.top.location.href = (Common.basePath || "") + "logout.html?title=" + escape(redirectErrorMap[data.code]) + "&locale=" + localParam[lan] + (((data.code === "validation.resubmit_same_session") || Common.basePath) ? "&relogin=0" : "");
    } else {
        Common.LightBox.showMessage(data.message || (lan === "C" ? "系统逻辑处理问题" : "System Logic Process Problem"));
        Common.Error.lastErrorCode = data.code; // 出错时，保存最近一次出错时的errorCode
    }
};

/**
 * 新版请求头
 */
Common.getRequestHeader = function () {
    return $.extend({
        agent: "WEB15",
        version: "1.0",
        device: "", 
        platform: "",
        plugins: "",
        page: "",
        local: localParam[lan],
        ext: ""
    },Common.getDeviceAndSecInfo(),dataHeaderCipherType);
};

/**
 * 新版请求方式
 * 使用方法:
 * 1. Common.request(model[, model, ...], function (data) {
 *        // 成功
 *    }, function (error) {
 *        // 失败
 *    }, function (data) {
 *        // 请求完成后执行，无论是否成功
 *    });
 * 2. Common.request({
 *        models: [model, model, ...],
 *        success: function (data) { console.log("成功"); },
 *        fail: function (error) { console.error("失败"); },
 *        complete: function (data) { console.log("请求完成后执行"); },
 *        showLoading: false
 *    });
 */
Common.request = function () {
    var models, model, options,
        success, fail, complete, showLoading, dataHandle,
        data, i, j, len, tmp;

    if (arguments.length === 0) {
        throw Error("Common.request: 需要参数");
    }

    if (arguments[0] instanceof Model) {
        // 如果第一个参数是 Model, 使用的是第一种方法
        j = 0;
        models = [];
        showLoading = true;
        // 默认处理数据
        dataHandle = true;
        for (i = 0, len = arguments.length; i < len; i++) {
            if (arguments[i] instanceof Model) {
                models.push(arguments[i]);
            } else {
                switch (j) {
                    case 0:
                        success = arguments[i];
                    break;
                    case 1:
                        fail = arguments[i];
                    break;
                    case 2:
                        complete = arguments[i];
                    break;
                }
                j++;
            }
        }
    } else {
        // 否则使用第二种方法
        options     = arguments[0];
        models      = options.models;
        success     = options.success;
        fail        = options.fail;
        complete    = options.complete;
        showLoading = !!options.showLoading;
        if (typeof options.dataHandle === "undefined") {
            dataHandle = true;
        } else {
            dataHandle  = !!options.dataHandle;
        }
    }

    if (!models || models.length === 0) {
        throw Error("Common.request: models 为空");
    }

    if (models.length === 1) {
        // 单个请求
        model = models[0];
        data = {
            method: model.attributes.method,
            params: model.attributes.params
        };
		dataHeaderCipherType={};
        //判断当前接口是否有上送控件版本号
        if(data.params && (data.params.activ || data.params.devicePrint)){
            // 缓存标识判断当前版本
            if(!Common.cipherTypeFlag){
                isCipherTypeFlag(data);
            }
            //判断当前是否装了新控件
            if('0' === Common.cipherTypeFlag){
                dataHeaderCipherType={'cipherType':"0"};
            }
        }
        if (!data.params) {
            data.params = {};
        }
        if (model.attributes.conversationId) {
            // 会话ID搬到 params 里了
            data.params.conversationId = model.attributes.conversationId;
        }
    } else {
        // 多个请求
        data = {
            method: "CompositeAjax",
            params: {
                methods: []
            }
        };
		dataHeaderCipherType={};
        for (i = 0, len = models.length; i < len; i++) {
            model = models[i];
            tmp = {
                method: model.attributes.method,
                params: model.attributes.params,
                header: Common.getRequestHeader()
            };
            //判断当前接口是否有上送控件版本号
            if(tmp.params && (tmp.params.activ || tmp.params.devicePrint)){
                // 缓存标识判断当前版本
                if(!Common.cipherTypeFlag){
                    isCipherTypeFlag(tmp);
                }
                //判断当前是否装了新控件
                if('0' === Common.cipherTypeFlag){
                    dataHeaderCipherType={'cipherType':"0"};
                }
            }
            if (!tmp.params) {
                tmp.params = {};
            }
            if (model.attributes.conversationId) {
                tmp.params.conversationId = model.attributes.conversationId;
            }
            data.params.methods.push(tmp);
        }
    }

    data.header = Common.getRequestHeader();

    $.ajax({
        url        : urlPrefix + "_bfwajax.do?_locale=" + localParam[lan],
        type       : "post",
        showLoading: showLoading,
        data       : "json=" + encodeURIComponent(JSON.stringify(data).replace(/"null"/g, '""')),
        dataType   : "json",
        contentType: "application/x-www-form-urlencoded; charset=UTF-8",
        error      : function () {
            Common.LightBox.hide();
            Common.LightBox.showMessage(Common.Error.getMsgByCode("ajaxError"));
        }
    }).then(function (data) {
    	if(data&&data.hasOwnProperty("_isException_")){
	        if (data._isException_) {
	            // 接口报错
	            dataHandle && Common.handleError(data);
	            fail && fail(CU.Json.replaceNull(data));
	        } else {
	            if (models.length === 1) {
	                // 单个返回 
	                success && success(CU.Json.replaceNull(data.result));
	            } else {
	                // 多个返回
	                var rst = [];
	                for (var i = 0, len = data.result.results.length; i < len; i++) {
	                    var result = data.result.results[i];
	                    if (result._isException_) {
	                        dataHandle && Common.handleError(result);
	                        rst.push(result);
	                    } else {
	                        rst.push(result.result);
	                    }
	                }
	                success && success(CU.Json.replaceNull(rst));
	            }
	        }
	        complete && complete(CU.Json.replaceNull(data));
    	}else{//响应数据有误，请稍后再试！
    		Common.LightBox.showMessage(CU.getDictNameByKey("l101837"));
    		Common.LightBox.hide();
    	}
    });
};
/**
 * @author xlgui
 * @param  model  接口  
 * @param  callback1  成功回调
 * @param  callbcak2  一般用于失败再次申请token
 */
Common.requestInterface=function(model,callback1,callbcak2){
	var _t=this,params=model.attributes.params,conid=model.attributes.conversationId;
	_t.request(model,callback1,function(){
		if(params&&params.token){
			_t.creatToken(conid,callbcak2);
		}else{
			callbcak2?callbcak2():Common.LightBox.hide();
		}
	});
};
/**
 * @author xlgui
 * @Method creatToken 创建token
 * @param  conid      会话id
 * @param  callback   回调函数 
 */
Common.creatToken=function(conid,callback){
	//new Model("PSNGetTokenId")
	this.requestInterface(new Model("PSNGetTokenId",conid),callback);
};
/**
 * @author xlgui
 * @Method getCurrentSystemDate 获取系统当前日期
 * @param  callback   回调函数 
 */
Common.getCurrentSystemDate=function(callback){
	this.requestInterface(new Model("PsnCommonQuerySystemDateTime"),function(data){
		callback&&callback(data.dateTme.substr(0,10));
	});
};
function openWin(url, name){
    var ieVersion = parseFloat(navigator.appVersion.split("MSIE ")[1]) || undefined;
    var newWindow = window.open(url, name || "win_" + Common.getIdentityId(), "toolbar=no, menubar=no,scrollbars=yes,resizable=yes, location=no, status=no");
    try {
        newWindow.focus();
        newWindow.moveTo(0,0);
        newWindow.resizeTo(screen.width, screen.height - 30);
    } catch(e) {

    }
};

Common.hideWarning = function (obj) {
    if (obj) {
        $("div.info-tip").parent().hide();
        obj.find(".warning") && obj.find(".warning").removeClass("warning").removeAttr("pass");
    } else {
        $("div.info-tip").parent().hide();
        $(".warning").removeClass("warning").removeAttr("pass");
    }
};

/**
 * add by 刘卫卫
 * 用于开立存款证明，检查session状态
 * 调用PsnCommonQueryOprLoginInfo接口
 * */
function keepSessionActive() {
	var promise = Common.postRequest(
		new Model("PsnCommonQueryOprLoginInfo"),{showLoading:false}
	);
    return {
        then: function (success, fail) {
        	promise.then(function(data){
                if (data.response[0].status !== undefined && data.response[0].status == '01') {
                    success();
                } else {
                    fail();
                    CU.ajaxDataHandle(data);
                }
            });
        }
    };
}

/**
 * 1.先获取控件的版本
 * 2.对比新旧控件版本号
 * 3.判断是新控件还是旧控件
 * 4.新控件，在参数里面添加国密算法的标示
 * 5.旧控件，保持不变
 * */
function isCipherTypeFlag(req){
    //获取版本号
    var version = parseInt((req.params.activ?req.params.activ:Common.secVersion),10);
    if(!version){
        Common.cipherTypeFlag=null;
        return ;
    }
    if ($.browser.msie || ($.browser.mozilla && $.browser.version == 5)) {
        //IE下等于66817说明是新控件,非IE下等于16777217说明是新控件 201001010 200000000
        if(version>200000000){
            Common.cipherTypeFlag='0';
        }
    }else{
        if(version>200000000){
            Common.cipherTypeFlag='0';
        }
    }
}
if (dojo.locale && dojo.locale == 'zh') {
    lan = "C";
}else{
    lan = "E";
}
//切换币种判断钞汇币种的点击事件
/*
    @param list 列表
    @radioCash radioRemit 钞汇单选框
    @sel 用于显示可用余额ID(如果不需要显示余额，则不用上送)
    @selCurrency 选择的下拉币种ID
    @currencyCodeAttr 列表中对象的币种属性名称(默认为"currencyCode")
    @cashRemitAttr 列表中对象的钞汇属性名称(默认为"cashRemit")
    @availableBalanceAttr 列表中对象的可用余额属性名称(默认为"availableBalance")

*/
Common.currencyChange = function(list,radioCash,radioRemit,sel,selCurrency,currencyCodeAttr,cashRemitAttr,availableBalanceAttr){
    var _t = this,
        _hashList = new Common.Hashtable(),
        _objList = new Common.Hashtable(),
        _balance = "",
        r1 = $(radioCash),
        r2 = $(radioRemit),
        rs = $(radioCash+","+radioRemit),
        codeVal = $(selCurrency).attr("val");
        currencyCodeAttr?currencyCodeAttr:currencyCodeAttr="currencyCode";
        cashRemitAttr?cashRemitAttr: cashRemitAttr="cashRemit";
        availableBalanceAttr?availableBalanceAttr: availableBalanceAttr = "availableBalance";
    $.each(list||[],function(i,p){
        if(p[currencyCodeAttr]=="001"){
            _balance = p[availableBalanceAttr];
        }
        _objList.add(p[currencyCodeAttr]+"-"+p[cashRemitAttr],p);
        if(!_hashList.contains(p[currencyCodeAttr])){
            _hashList.add(p[currencyCodeAttr],p[cashRemitAttr]);
        }else{
            _hashList.remove(p[currencyCodeAttr]);
            _hashList.add(p[currencyCodeAttr],"all");
        }
    });
    rs.on("click",function(e){
        var currencyCode = $(selCurrency).attr("val");
        var obj = _objList.item(currencyCode+"-"+$(e).val());
        !sel?"":$(sel).html(obj[availableBalanceAttr].formatNum(currencyCode,false,true));   
       
   });
    if(codeVal=="001"){
        !sel?"":$(sel).html(_balance.formatNum("001",false,true));
        rs.attr("checked",false).attr("disabled","disabled").addClass("text-darkengray");
        return;
    }
    var obj = _hashList.item(codeVal);
    switch(obj){
        case "01":
            r2.removeAttr("checked").attr("disabled","disabled");
            r1.removeAttr("disabled").attr("checked",true).trigger("click");
            break;
        case "02":
            r1.removeAttr("checked").attr("disabled","disabled");
            r2.removeAttr("disabled").attr("checked",true).trigger("click");
            break;
        case "all":
            r2.removeAttr("disabled").attr("checked",false);
            r1.removeAttr("disabled").attr("checked",true).trigger("click");
            break;
        default:
            rs.removeAttr("checked").attr("disabled","disabled");
            break;
    }
   
};
/*
针对小数点前面进行格式化，末尾去0
*/
String.prototype.formatFront = function(){
    var arr = this.split("."),str="";
    str = arr[0].formatNum("027",false,true);
    if(arr[1]){
        str+=(Number("0."+arr[1])+"").substring(1);
    }
    return str;
};

/*活动平台
@transactionId:每笔提交交易返回的transactionId，不同的交易从不同的提交接口返回值取。

*/
Common.AMS = function(transactionId,tranType){
    var transactionId = transactionId+"";
    if(!transactionId){
        return false;
    }
    //依据活动平台要求，根据页面大小调整弹窗大小，已加载其响应式布局。
    var wHeight=window.innerHeight;
    var openHeight='';
    if(wHeight<800||wHeight==800){
        openHeight=600;
    }else if(800<wHeight&&wHeight<960){
        openHeight=800;
    }else{
        openHeight=960;
    }
    //取票
    Common.request({
        models:[new Model("PsnQueryTransActivityStatus",{"transactionId":transactionId,"tranType":tranType})],
        dataHandle : false,//请求失败时不弹窗报错
        showLoading: false,
        success:function(data){
            //将返回的图片添加在交易结果页的最下方
            var bindEl = "";
            //一个ejs可能包含多个页面，遍历取出当前可见的页面进行绑定
            $.each($(".border-box"),function(i,p){
                if(!$(p).hasClass("hide")){
                    bindEl = $(p);
                }
            });
            //有的结果页没有使用border-box样式，则再次查询layout-title样式，例如贵金属买卖
            if(!bindEl){
                $.each($(".layout-title"),function(i,p){
                    if(!$(p).hasClass("hide")){
                        bindEl = $(p);
                    }
                })
            }
            
            //依据需求，如果返回多个图片，则默认只显示第一个
            if(data.actyList.length>0){
                var p = data.actyList[0];
                //如果有图片url才进行渲染
                if(p.actyPicUrl){
                    //ticketMsg:customid|cif号|渠道(网银：1)|地区|交易序号|时间（格式为： yyyy-MM-dd HH:mm:ss）|服务码|金额|卡类型
                    var ticketMsg = data.customerId+"|"+data.cifNumber+"|"+1+"|"+data.ownerIbkNum+"|"+transactionId+"|"
                                    +data.firstSubmitDate+"|"+data.serviceId+"|"+data.amount+"|"+data.actType;
                    var div = $("<div class='tac'></div>");
                    var archive = $("<a></a>");
                    var img = $("<img >");
                    var form = $("<form target='amsb' method='post'></form>");
                    var input1 = "<input style='display:none' name='channel' value='1'>";
                    var input2 = "<input style='display:none' name='tokenCode' value='"+data.ticketInfo+"'>";
                    var input3 = "<input style='display:none' name='ticketMsg' value='"+ticketMsg+"'>";
                    var input4 = "<input style='display:none' name='actyId' value='"+p.actyId+"'>";

                    form.attr({"id":"form"+p.actyId,"action":data.actyUrl}).append(input1).append(input2).append(input3).append(input4);
                    img.attr({"src":p.actyPicUrl,"alt":p.actyName,"actyId":p.actyId});
                    archive.append(img.targets[0]);

                    div.append(archive.targets[0]);
                    bindEl.append(div.targets[0]).append(form.targets[0]);

                    form.on("submit",function(){
                        window.open('about:blank','amsb','resizeable=no,scrollbars=no,height='+openHeight+'px,width='+openHeight+'px,left='+(window.screen.width-openHeight)/2+'px,top='+(window.screen.availHeight-openHeight)/2+'px,location=0,menubar=no,status=no,titlebar=no','');
                    });

                    img.on("click",function(){
                        //提交表单
                        form.trigger("submit");
                    });
                }
            }
        }
    });
};

//801 跨境汇款 模板数据拆分方法。需要在境外中行 境外他行 模板管理中使用，抽成公共方法
Common.splitTemplateData = function(result){
    result.swiftBinCode = result.payeeBankSwift.substring(4,6);
    $.extend(result,{
        taxBillNo:"",
        kpp:"",
        payeeBankRussNum:"",
        payeeResidentType:"",
        payeeProperty:"",
        payeeBirthDate:"",
        payeeBirthPlace:""
    });
    //俄罗斯
    if(result.swiftBinCode == "RU"){
        /*
        当收款银行SWIFT代码第5、6位为RU时，收款人名称可能为如下六种格式，请注意拆分出收款人名称：
        一、INN1234567890.KPP123456789NAME
        二、KIO12345.KPP123456789NAME
        三、INN1234567890NAME
        四、KIO12345NAME
        五、KPP123456789NAME
        六、NAME
        (说明：税号：INN+10位数字，例子中用INN1234567890表示；
        税号也可能是KIO+5位数字，例子中用KIO12345表示；
        KPP号码：KPP+9位数字，例子中用KPP123456789表示；
        收款人名称：例子中用NAME表示。
        税号与KPP号码之间用英文.分割)
        */
        //税号
        var taxBillNo1 = result.payeeEnName.match(/INN.{10}/g);
        var taxBillNo2 = result.payeeEnName.match(/KIO.{5}/g);
        if(taxBillNo1 && taxBillNo1.length){
            result.taxBillNo =  taxBillNo1[0];
        }else if(taxBillNo2 && taxBillNo2.length){
            result.taxBillNo = taxBillNo2[0];
        }
        //kpp
        var kpp = result.payeeEnName.match(/KPP.{9}/g);
        if(kpp && kpp.length){
            result.kpp = kpp[0];
        }
        if(result.taxBillNo || result.kpp){
            result.payeeProperty = 0;//收款人性质---对公收款人
        }
        result.payeeEnName = result.payeeEnName.replace(".","")
                                .replace(/INN.{10}/g,"")
                                .replace(/KPP.{9}/g,"")
                                .replace(/KIO.{5}/g,"");
        
        /*
        当收款银行SWIFT代码前4位不是BKCH，且第5、6位为RU，且汇款币种为卢布时，收款行行号可能为以下3种格式，请注意拆分：
        一、RU04123456789.30112345678901234567（RU04+9位数字.301开头的20位数字）
        二、123456（其他终端保存的不知道多少位的字母、数字、符号）
        三、空（P801之前存量数据不存储行号）
        
        当收款银行SWIFT代码前4位不是BKCH，且第5、6位为RU，且汇款币种不是卢布时，收款行行号可能为以下5种格式，请注意拆分：
        一、RU04123456789.30112345678901234567（RU04+9位数字.301开头的20位数字）
        二、RU04123456789（只有RU04+9位数字）
        三、30112345678901234567（只有301开头的20位数字）
        四、123456（其他终端保存的不知道多少位的字母、数字、符号）
        五、空（P801之前存量数据不存储行号，或P801之后客户没填写行号）
        */
        var payeeBankRussNum = result.payeeBankNum.match(/301.{17}/g);
        if(payeeBankRussNum && payeeBankRussNum.length){
            result.payeeBankRussNum = payeeBankRussNum[0];
        }
        var payeeBankNum = result.payeeBankNum.match(/RU04.{7}/g);
        if(payeeBankNum && payeeBankNum.length){
            result.payeeBankNum = payeeBankNum[0];
        }
        
        /*
        当收款银行SWIFT代码第5、6位为RU时，附言可能为以下5种格式，请注意拆分：
        一、(VO99090)FUYAN 
        二、(VO60081)FUYAN
        三、(VO60080)FUYAN
        四、(VO12345)FUYAN
        五、FUYAN
        六、空 
        说明：VO+5位数字用英文括号括起来加在附言最前面

        VO99090 收款人居民性质 俄罗斯居民
        VO60081 VO60080-------------- 俄罗斯非居民

        */
        var payeeResidentType1 = result.remitFurInfo2Payee.match(/VO99090/g);
        var payeeResidentType2 = result.remitFurInfo2Payee.match(/VO60081/g);
        var payeeResidentType3 = result.remitFurInfo2Payee.match(/VO60080/g);
        var payeeResidentType4 = result.remitFurInfo2Payee.match(/VO\d{5}/g);
        if(payeeResidentType1 && payeeResidentType1.length){
            result.payeeResidentType = 0;//收款人居民性质---俄罗斯居民
            result.payeeProperty = 1;//收款人性质---对私收款人
        }else if((payeeResidentType2 && payeeResidentType2.length)
            ||(payeeResidentType3 && payeeResidentType3.length)){
            result.payeeResidentType = 1;//-----------------俄罗斯非居民
            result.payeeProperty = 1;//收款人性质---对私收款人
        }else if(payeeResidentType4 && payeeResidentType4.length){
            result.payeeProperty = 0;
            result.transactionType = payeeResidentType4[0];
        }
        result.remitFurInfo2Payee = result.remitFurInfo2Payee.replace(/\(VO\d{5}\)/g,"");
    }
    if(result.swiftBinCode == "IN"){
        /*
        当收款银行SWIFT代码第5、6位为IN时，附言可能为以下3种格式，请注意拆分：
        一、FUYAN REMITTER'S DOB:20170109 POB:BEIJING,CHINA
        二、FUYAN
        三、空
        说明：汇款人生日和出生地加在附言后面，用空格隔开。
        */
        var payeeBirthDate = result.remitFurInfo2Payee.match(/DOB .{8}/g);
        if(payeeBirthDate && payeeBirthDate.length){
            //收款人出生日期
            result.payeeBirthDate = payeeBirthDate[0].replace("DOB ","");
            result._payeeBirthDate = payeeBirthDate[0].replace("DOB ","").replace(/(.*)(.{2})(.{2})/g,"$1/$2/$3");
        }
        var payeeBirthPlace = result.remitFurInfo2Payee.match(/POB .*/g);
        if(payeeBirthPlace && payeeBirthPlace.length){
            //收款人出生地
            result.payeeBirthPlace = payeeBirthPlace[0].replace("POB ","");
        }
        if(result.remitFurInfo2Payee.split("REMITTER'S").slice(0,-1).length>2){
            result.remitFurInfo2Payee = result.remitFurInfo2Payee.split("REMITTER'S").slice(0,-1).toString();
        }
        
    }
    return result;
};

//跨境汇款 涉及到gpi和全额到账的公共方法
Common.foreignRemittance = {
    //703 gpi需求
    //不是或系统关闭gpi
    gpiN:function(_t){

        //输入项不完全，认为非gpi，不调接口
        $("#fee_mode_sha").show();
        $("#fee_mode_our").hide();

        //隐藏“是否本人承担中转费”栏位,并去除选中
        $("#rd_gpi_y,#rd_gpi_n").attr("checked",false);

        $("#rd_gpi_y_txt").text("");
        $("#gpi_y,#gpi_n").hide();

        //隐藏“是否接收交易到账短信通知”栏位
        $("#send_msg_notify_y,#send_msg_notify_n").hide();
    },
    //如果从交易记录详情，暂存详情，模板详情发起的交易，param参数有值
    //如果从页面直接交易，param参数无值。
    checkGpi:function(param,callback,isBOCPayeeBank,_t){
        var swiftAccountId = "",
            payeeBankSwift = "",
            remitCurrencyCode = "",
            feeMode = "",
            remitAmount = "",
            cashRemit = "";
        if(param){
            swiftAccountId = param.swiftAccountId;
            payeeBankSwift = param.payeeBankSwift;
            remitCurrencyCode = param.remitCurrencyCode;
            feeMode = param.feeMode?param.feeMode:"SHA";//只有暂存时，不选择是否本人承担中转费，才能出现feeMode为空的情况，则默认SHA
            remitAmount = param.remitAmount?param.remitAmount:param.amount;
            cashRemit = param.cashRemit;
        }else{
            swiftAccountId = _t._hashTable.item(_t._account_itSelect.val)?_t._hashTable.item(_t._account_itSelect.val).accountId:"";
            payeeBankSwift = $("#txt_payeebankswiftcode_6894").val()||$("#txt_payeebankswiftcode_6894").text();
            remitCurrencyCode = _t._remitCurrency_itSelect?_t._remitCurrency_itSelect.val:"";
            feeMode = $("#fee_mode_sha").hasClass("hide")?"OUR":"SHA";
            remitAmount = $("#txt_remittanceamount_6916").val().replace(/,/g,"");
            cashRemit = $("[name=rd_moneyremit_6914]:checked").val();
        }
        //是否接收交易到账短信通知
        function sendMsm(){
            //“是否接收交易到账短信通知”栏位
            $("#send_msg_notify_y,#send_msg_notify_n").show();
            CU.changeLan($("#send_msg_notify_y"));//在ie下 隐藏节点show出来后，其placeHolder需要重新changeLan才能显示
            //使用正则判断gpi手机号是否填写了数字，因为ie9的placeHolder自带默认值，不能直接使用val()是否有值来判断。
            if(!(/\d/g.test($("#gpi_msg_phone_num").val())) && $("#rd_msm_y").attr("checked") && (_t.gpiIndex ==0)){
                //如果第一次进入填写页面，没有收交易到账短信电话，默认显示汇款人联系电话，如没有，则操作员的电话。
                //如果都没有，空。
                var payeeMobile = $("#txt_connectionphone_6878").val();
                var mobile = /^[1-9][0-9]{10}$/.test(payeeMobile)?payeeMobile:"";
                mobile = mobile?mobile:Common.currentUser.mobile?Common.currentUser.mobile:"";
                $("#gpi_msg_phone_num").val(mobile).show();
                
            }
            
            //动态显示接收短信通知的手机号输入框
            $("#rd_msm_y").off("click").on("click",function(){
                //safari中使用trigger触发事件时，会显示radio未选中，需手动设置。
                $("#rd_msm_y").attr("checked",true);
                $("#rd_msm_n").attr("checked",false);
                $("#gpi_msg_phone_num").show();
                $("#gpi_phone_num_tips").show();
            });
            $("#rd_msm_n").off("click").on("click",function(){
                //safari中使用trigger触发事件时，会显示radio未选中，需手动设置。
                $("#rd_msm_y").attr("checked",false);
                $("#rd_msm_n").attr("checked",true);
                $("#gpi_msg_phone_num").val("").hide();
                $("#gpi_phone_num_tips").hide();
            });
            callback && callback();
            
        };
        //是gpi
        //801 中行全额到账 fullpayCallback
        function gpiY(checkStatus,fullpayCallback){
            
            //显示“是否本人承担中转费”栏位
            $("#gpi_y,#gpi_n").show();
            
            $("#rd_gpi_y").off("click").on("click",function(){
                //safari中使用trigger触发事件时，会显示radio未选中，需手动设置。
                $("#rd_gpi_y").attr("checked",true);
                $("#rd_gpi_n").attr("checked",false);
                
                
                //国内外费用承担方式
                if(checkStatus!="0" && _t.fullpayFeeMode == "SHA"){
                    $("#fee_mode_our").hide();
                    $("#fee_mode_sha").show();
                }else{
                    $("#fee_mode_our").show();
                    $("#fee_mode_sha").hide();
                }
                
                //全额到账没有发短信功能
                if($.inArray(checkStatus,["3_1","3_2"])>-1){
                    //隐藏“是否接收交易到账短信通知”栏位
                    $("#send_msg_notify_y,#send_msg_notify_n").hide();
                }

                //存在先填金额，后在是否本人承担中转费按钮来回切换的情况。此时，需要实时更新中转费。
                //因为选否，不承担中转费时，SHA算出的中转费始终为0。再切换为是，需要重新算。
                _t.checkGpi();
            });
            $("#rd_gpi_n").off("click").on("click",function(){
                //safari中使用trigger触发事件时，会显示radio未选中，需手动设置。
                $("#rd_gpi_y").attr("checked",false);
                $("#rd_gpi_n").attr("checked",true);
                $("#rd_gpi_y_txt").text("");
                //国内外费用承担方式
                $("#fee_mode_our").hide();
                $("#fee_mode_sha").show();
                //只支持gpi-sha的时候，选否才会出现gpi-sha的短信功能
                if($.inArray(checkStatus,["3_1","3_2"])>-1){
                    sendMsm();
                }
            });
            //checkStatus == "3_2" 核心返回5337、1667错误码（BANCS.5337 BANCS.1667），则默认使用SHA的GPI汇款。
            //也不支持中银全额到账 只支持 gpi-sha
            if(checkStatus == "3_2"){
                $("#rd_gpi_n").removeAttr("disabled").trigger("click");
                $("#rd_gpi_y").attr("disabled","disabled").attr("checked",false);;
                $("#rd_not_support").show();
            }else{
                $("#rd_gpi_y").removeAttr("disabled");
                $("#rd_gpi_n").removeAttr("disabled");
                $("#rd_not_support").hide();
            }
            
            //若#rd_gpi_y被选中，然后变更查询条件，则无需再选，直接更新 中转银行收费 提示语的金额
            if($("#rd_gpi_y:checked").length>0){
                //避免中英文切换导致翻译问题，使用lan形式构造描述信息。
                $("#rd_gpi_y_txt").empty().append("<span class='mr5' lan='currency_type_"+remitCurrencyCode+"''></span>"
                    +"<span class='mr5' lan='moneyremit_"+cashRemit+"'></span>"
                    +"<span class='mr5'>"+(_t.fullpayFee?_t.fullpayFee*1:_t.intermediaryBankFee*1).formatNum(remitCurrencyCode,false,true)+"</span>");
                CU.changeLan($("#rd_gpi_y_txt"));
            }else{
                if($("#rd_gpi_y:checked").length == 0 && $("#rd_gpi_n:checked").length == 0){
                    //没有选择是否本人承担中转费，则国内外费用承担方式显示为空
                    $("#fee_mode_sha,#fee_mode_our").hide();
                }
                
            }
            fullpayCallback && fullpayCallback();
            //gpi-our 和 gpi-sha 均支持的时候有发短信功能。
            if(checkStatus == "0"){
                sendMsm();
            }else if($.inArray(checkStatus,["3_1","3_2"])==-1){
                //非 gpi-our 且非 gpi-sha的场景，均不支持发短信，可直接执行模板赋值callback
                callback && callback();
            }
            
        };
        
        
        //如果上述变量均有值，则可以调用gpi接口查询
        //remitAmount == Number(remitAmount) 检查值是否可转为数字。并需要考虑amount==“”的情况
        if(swiftAccountId && payeeBankSwift && remitCurrencyCode && feeMode && remitAmount && (remitAmount == Number(remitAmount))){
            //接口未返回前，不能点击下一步
            $("#btn_confirm_6929").addClass("btn-disabled")
            //每次调接口前将中转银行收费提示清空，始终拿最新费用，避免误导。
            $("#rd_gpi_y_txt").text("");
            var param = {
                swiftAccountId:swiftAccountId,
                payeeBankSwift:payeeBankSwift.toUpperCase(),
                remitCurrencyCode:remitCurrencyCode,
                remitAmount:remitAmount,
                feeMode:"OUR",//经与后台确认，feeMode只送OUR
                isBOCPayeeBank:isBOCPayeeBank//他行"",中行"1"
            };
            var checkStatus = "";
            _t.intermediaryBankFee = 0;
            //调用一次核心接口
            //通过OUR方式调用核心接口。
            //1）如果核心返回成功，则客户可以使用OUR或SHA的GPI汇款。
            //2）如果核心返回5337、1667错误码（BANCS.5337 BANCS.1667），则默认使用SHA的GPI汇款。
            //3）如果核心返回其它错误码，走普通汇款。 
            Common.request({
                models:[new Model("PsnGPICheckAndInterFeeCharge",param)],
                showLoading:false,
                dataHandle:false,
                success:function(data){
                    checkStatus = data.checkResult+"";
                    _t.intermediaryBankFee = data.intermediaryBankFee;
                },
                fail:function(data){
                    if(data.code=="BANCS.5337" || data.code=="BANCS.1667"){
                        checkStatus = "3";
                    }else{
                        checkStatus = "2";
                    }
                },
                complete:function(data){
                    var statusFunc = function(){
                        //0.是gpi；
                        //2_1.非gpi，但支持 中银全额到账
                        //2_2 非gpi 非中银全额到账 普通sha
                        //1_1.系统关闭gpi；但支持 中银全额到账
                        //1_2 系统关闭gpi；不支持 中银全额到账
                        //3_1.接口报错不支持gpi-our,但支持 中行全额到账 和 gpi-sha
                        //3_2.不支持gpi-our，不支持全额到账，支持gpi-sha
                        switch(checkStatus){
                            case "0"://our sha 都支持gpi 组合1
                                _t.gpiFullpayGroup = 1;
                                _t.fullpayFee = 0;
                                gpiY("0",function(){
                                    //关闭中银全额到账的设置
                                    $("#fullpay_y_tips,.fullpayAU").hide();
                                    //显示gpi的提示信息
                                    $("#gpi_y_tips,#n_tips").show();
                                });
                                break;
                            case "3_1": //组合2
                                _t.gpiFullpayGroup = 2;
                                gpiY("3_1",function(){
                                    //关闭gpi提示
                                    $("#gpi_y_tips").hide();
                                    //澳洲
                                    if(_t.fullpayFeeMode == "SHA"){
                                        $("#normalOur").hide();
                                        $(".fullpayAU").show();
                                    }else{
                                        $("#normalOur").show();
                                        $(".fullpayAU").hide();
                                    }
                                    $("#fullpay_y_tips,#n_tips").show();

                                });
                                break;
                            case "3"://gpi报错BANCS.5337||BANCS.1667，全额到账也报错
                            case "3_2": //组合4
                                _t.gpiFullpayGroup = 4;
                                gpiY("3_2",function(){
                                    //关闭gpi提示
                                    $("#gpi_y_tips").hide();
                                    $("#n_tips").show();
                                    $("#fullpay_y_tips").hide();
                                });
                                break;
                            case "1_1"://组合3
                            case "2_1":
                                _t.gpiFullpayGroup = 3;
                                gpiY(null,function(){
                                    //关闭gpi提示
                                    $("#gpi_y_tips,#n_tips").hide();
                                    //澳洲
                                    if(_t.fullpayFeeMode == "SHA"){
                                        $("#normalOur").hide();
                                        $(".fullpayAU").show();
                                    }else{
                                        $("#normalOur").show();
                                        $(".fullpayAU").hide();
                                    }
                                    $("#fullpay_y_tips").show();
                                    $("#fullpayTips").hide();
                                }); 
                                break;
                            case "1_2"://组合5
                            case "2_2":
                                _t.gpiFullpayGroup = 5;
                                $("#gpi_y_tips,#n_tips").hide();
                                $("#fullpay_y_tips").hide();
                                _t.gpiN();
                                break;
                            default:
                                _t.gpiFullpayGroup = 5;
                                $("#gpi_y_tips,#n_tips").hide();
                                $("#fullpay_y_tips").hide();
                                _t.gpiN();
                                break;
                        }
                        $("#btn_confirm_6929").removeClass("btn-disabled");
                        _t.gpiIndex ++;
                    }
                    //801 如果不支持gpi-our，则继续判断是否支持 中行全额到账
                    if(checkStatus!="0"){
                        var param = {
                            payeeBankSwift:payeeBankSwift.toUpperCase(),
                            remitCurrencyCode:remitCurrencyCode,
                            remitAmount:remitAmount
                        };
                        Common.request({
                            models:[new Model("PsnFullpayCheckAndInterFeeCharge",param,_t._conversationId)],
                            showLoading:false,
                            dataHandle:false,
                            success:function(data){
                                //fullpayResult 1 允许全额到账 2不允许
                                checkStatus = checkStatus +"_"+ data.fullpayResult;
                                _t.fullpayFee = data.resultFee;
                                _t.fullpayFlag = data.fullpayResult;
                                _t.fullpayFeeMode = data.feeMode;
                                statusFunc(checkStatus);
                            },
                            fail:function(error){
                                statusFunc(checkStatus);
                            }
                        });
                        
                    }else{
                        statusFunc(checkStatus);
                    }
                    
                }
            });
        }
    },
    //根据组合获取当前支持的是gpi还是全额到账
    getGpiFullpayFlag:function(gpiOrfullpay,_t){
        var flag = "";
        var checkedY = $("#rd_gpi_y").attr("checked");
        var checkedN = $("#rd_gpi_n").attr("checked");
        switch(_t.gpiFullpayGroup){
            case 1:
                flag = "gpi";
                break;
            case 2:
                if(checkedY){
                    flag = "fullpay";
                }else{
                    flag = "gpi";
                }
                break;
            case 3:
                if(checkedY){
                    flag = "fullpay";
                }
                break;
            case 4:
                if(checkedN){
                    flag = "gpi";
                }
                break;
        }

        return flag==gpiOrfullpay;
    },
    getFeeMode:function(_t){
        var feeMode = "";
        if(_t.fullpayFeeMode == "SHA" && _t.getGpiFullpayFlag("fullpay")){
            feeMode = "SHA";
        }else{
            feeMode = !$("#fee_mode_our").hasClass("hide")?"OUR":!$("#fee_mode_sha").hasClass("hide")?"SHA":""
        }
        return feeMode;
    },
    //汇款人英文名称的取值
    getRemittorName:function(_t){
        var remittorName = "";
        if(!$("#txt_remittername_6872").text()){
            if(_t.lastNamePinyinSel && _t.lastNamePinyinSel.length){
                $.each(_t.lastNamePinyinSel,function(i,p){
                    //下拉列表有val属性，其余非下拉列表则直接取值
                    if(typeof(p)=="string"){
                        remittorName += p;
                    }else{
                        remittorName += p.val;
                    }
                })
            }
            remittorName += " ";//姓名之间要有空格
            if(_t.lastNamePinyinSel && _t.firstNamePinyinSel.length){
                $.each(_t.firstNamePinyinSel,function(i,p){
                    //下拉列表有val属性，其余非下拉列表则直接取值
                    if(typeof(p)=="string"){
                        remittorName += p;
                    }else{
                        remittorName += p.val;
                    }
                })
            }
        }else{
            remittorName = $("#txt_remittername_6872").text();
        }
        return remittorName;
    },
    //模板回填时，显示汇款地址和邮编字段
    remitAddrAndPostCode:function(_t){
        $("#addr_postCode").show();
        //修改地址和邮编
        $("#btn_49_1090161").on("click",function(){
            $(".addr_postCode").show();
            $("#addr_postCode").hide();
            //依据此标志判断是否使用用户输入的地址和邮编
            _t.modifyAddrZip = true;
        });
    },
    //初始化汇款账户的拼音名称
    getPinyinName :function(appendEl,name,_t){
        var pinyinElStr = "";
        var pinyinElArray = [];
        var pinyinNameSel = [];
        if(!(appendEl && name)){
            return [];
        }
        //将姓名拆分成单字
        $.each(name.split(""),function(i,p){
            //获取单字的拼音，若为多音字，则按照“，”分割成数组
            var pinyin =  PINYIN[p.charCodeAt(0).toString(16).toUpperCase()];
            if(pinyin){
                pinyin = pinyin.split(",");
                if(pinyin.length == 1){
                    pinyinElStr +="<span class='mr5 pinyintxt fl'>" + pinyin[0] + "</span>";
                    pinyinNameSel.push(pinyin[0]);
                }else if(pinyin.length > 1){
                    //生成一个下拉列表节点
                    pinyinElStr += "<span class='sel w50 pinyinsel fl' id='"+"pinyinSel"+i+"' validateGroup='{required:true' tips='tipsrequired'></span>";
                    //生成多音字选项
                    var pinyinSelData = [];
                    $.each(pinyin,function(j,p){
                        pinyinSelData.push({key:p,val:p});
                    });
                    pinyinElArray.push({
                        elId:"pinyinSel"+i,
                        pinyinDataArray:pinyinSelData
                    });
                }
            }
            
        });
        // //创建节点
        $(appendEl).append(pinyinElStr).show();
        //生成下拉列表
        if(pinyinElArray.length){
            $.each(pinyinElArray,function(i,p){
                var sel = new ITSelect({
                    data : p.pinyinDataArray,
                    appendTo : $("#"+p.elId).empty(),
                    defValue : p.pinyinDataArray[0].key,
                    defText : p.pinyinDataArray[0].val,
                    oddCls : "even",
                    callback : function(e) {
                        
                    }
                });
                pinyinNameSel.push(sel);
            });
        }
        return pinyinNameSel;
    },
    //查询剩余额度
    queryAccountBalance: function (accountId,currency,_t) {
        Common.LightBox.show();
        Common.postRequest(new Model("PsnQueryNationalTransferLimit", {"swiftAccountId": "" +accountId,"currency":currency})).then(function(data) {
            Common.LightBox.hide();
            var result = CU.ajaxDataHandle(data);
            if(result) {
                if(result.customerFlag == "1"){
                    result.currency = currency;
                    _t.el.append(_t.ejsPath.accountBalanceReceive, result, function () {
                        var message=CU.getDictNameByKey("l48355");
                        var convertMount = result.convertRemainLimit.formatNum(currency);//格式化金额
                        _t.el.find("#convertRemainLimit_tips").html(message.replace("{0}",convertMount).replace("{1}",CU.getDictNameByKey("currency_type_"+currency)));
                        var pop = _t.el.find("#div_balance_receive_query");
                        //关闭按钮
                        _t.el.find("#btn_close_147271,a.close").on("click",function(){
                            pop.remove();
                            Common.LightBox.hide();
                        });
                        CU.changeLan(pop);
                        CU.setObjAbsCenter(pop);
                        Common.LightBox.show(_t.el);
                    });
                }else{
                    //尊敬的客户，根据国家外汇管理局规定，非居民客户个人外币跨境汇款交易不受“每日不可超过累计等值五万美元”的限额控制，请您直接填写汇款金额。
                    Common.LightBox.showMessage(CU.getDictNameByKey("l48315"));
                }
            }
        });
    }
};
