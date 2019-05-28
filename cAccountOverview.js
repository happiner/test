/**
 *  银行账户 账户概览
 *  @author 范久滨
 *  @author 王晓林 谭春银有一个变更 去掉 预约换时 客户名称（大写英文或拼音）字段 
 *  
 *  modified 2016年9月19日  gxl
 *  ①BA王宁，701批次，针对借记卡账户，在操作栏位“更多”里添加功能“交易限额设置”
 *  ②涉及到的接口文档：
 *      ㈠.限额设置BII负责人：李国银,JSON接口说明文档（I05银行账户）.doc
 *      ㈡.小额免密、境外词条BII负责人：崔倩,JSON接口说明文档（I68电子支付-银联跨行无卡支付）.doc
 *  2016年9月20日 14:18:44 经过BII李国银反馈 ，限额设置没有接口获取最大限额字段，因此前端不做控制
 *  
 */
// (function() {
// 	"use strict";

	Common.controllers.AccountOverview = Spine.Controller.sub({
		_conversationId:null,               //会话ID
		_el_width:null,
		_token : null,
		_hashTable : new Common.Hashtable(),//hashTabel 存储数据
		count:0,//修改别名计数器
		ejsPath : {
			main : "templates/bankAccount/accountOverview/accountOverviewMain.ejs",
			modifyAlias : "templates/bankAccount/accountOverview/modifyAlias.ejs",
			modifySuccess : "templates/bankAccount/accountOverview/modifySuccess.ejs",
			cancelRelevance : "templates/bankAccount/accountOverview/cancelRelevance.ejs",
			cancelSuccess : "templates/bankAccount/accountOverview/cancelSuccess.ejs",
			balance : "templates/bankAccount/accountOverview/balance.ejs",
			crcdBalance : "templates/bankAccount/accountOverview/crcdBalance.ejs",
			supplyBalance : "templates/bankAccount/accountOverview/supplyBalance.ejs",
			queryOldAccount : "templates/bankAccount/accountOverview/queryOldAccount.ejs",
			temporaryLoss : "templates/bankAccount/accountOverview/temporaryLoss.ejs",
			temporaryLossConfirm : "templates/bankAccount/accountOverview/temporaryLossConfirm.ejs",
			temporaryLossSuccess : "templates/bankAccount/accountOverview/temporaryLossSuccess.ejs",
			supplyBalanceEjs : "templates/bankAccount/accountOverview/supplyBalance.ejs",
			assetsReport : "templates/bankAccount/assetsReport/assetsReport.ejs",//资产汇总报告
			freeze : "templates/bankAccount/accountOverview/freeze.ejs",
			freezeConfirm : "templates/bankAccount/accountOverview/freezeConfirm.ejs",
			freezeSuccess : "templates/bankAccount/accountOverview/freezeSuccess.ejs",
			exchangeCardMain: "templates/bankAccount/accountOverview/exchangeCardMain.ejs",
			queryCurrentBalance: "templates/bankAccount/accountOverview/queryAccountBalance.ejs",
			exchangeBranch:	"templates/bankAccount/accountOverview/exchangeBranch.ejs",
			branchResult:"templates/bankAccount/accountOverview/branchResult.ejs",
			exchangeConfirm:"templates/bankAccount/accountOverview/exchangeCardConfirm.ejs",
			exchangeCardResult:"templates/bankAccount/accountOverview/exchangeCardResult.ejs",
			//挂失及挂失及补卡
			popLossMain:"templates/creditCard/creditCardQuery/popLossMain.ejs",
			popLossConfirm:"templates/creditCard/creditCardQuery/popLossConfirm.ejs",
			popLossSuccess:"templates/creditCard/creditCardQuery/popLossSuccess.ejs",
			//虚拟借记卡交易明细提醒
			virDetailsTips : "templates/bankAccount/debitCardVirtual/cancle_pop_confirm.ejs",
			//虚拟卡账户详情
			virAccDetails:"templates/bankAccount/accountOverview/virtualAccountDetails.ejs",
			//未出账单
			unsettledBill: "templates/creditCard/creditCardVirtual/query/unsettledBill.ejs",
            unsettledBill_tr:"templates/creditCard/creditCardVirtual/query/unsettledBill_tr.ejs",
            //已出账单
            settledBillMain: "templates/creditCard/creditCardVirtual/query/settledBillMain.ejs",
            settledBillQueryResult: "templates/creditCard/creditCardVirtual/query/settledBillQueryResult.ejs",

			//工资单主页
			payRollMain:"templates/bankAccount/accountOverview/payRollMain.ejs",
			//工资单list
			payRollList:"templates/bankAccount/accountOverview/payRollList.ejs",


			//电子卡转账主页面
			elecTransMain:"templates/bankAccount/accountOverview/elecTransMain.ejs",
			//普通转账确认页面
			confirm_common:"templates/bankAccount/accountOverview/elecTransferConfirm.ejs",
			//错误页面
			success_common:"templates/bankAccount/accountOverview/elecSuccess.ejs",
			securityIntercept : "templates/bankAccount/accountOverview/elecIntercept.ejs",
			//大额挂单提示
			bigtips: "templates/bankAccount/accountOverview/elecBigTips.ejs",
			elecBigPushBill:"templates/bankAccount/accountOverview/elecrBigPushBill.ejs",
			showRemainTime:"templates/bankAccount/accountOverview/elecRemainTime.ejs",
            aTransResultPage:"templates/bankAccount/accountOverview/elecResultPage.ejs",
            
            //交易限额设置主页
            transferMain   :"templates/bankAccount/accountOverview/transferLimitSetMain.ejs",
            
            //交易限额设置填写页
            transferIpt    :"templates/bankAccount/accountOverview/transferSetInput.ejs",
            //交易限额设置确认页
            transferCfm    :"templates/bankAccount/accountOverview/transferSetConfirm.ejs",
            //交易限额设置确认页
            transferScs    :"templates/bankAccount/accountOverview/transferSetSuccess.ejs",
            
            //小额/凭签名免密,境外词条服务状态页
            signStatus     :"templates/bankAccount/accountOverview/signPStatus.ejs",
            //小额/凭签名免密,境外词条修改限额填写页
            signPMOdifyIpt :"templates/bankAccount/accountOverview/signPMOdifyInput.ejs",
            //小额/凭签名免密,境外词条修改限额确认页
            signPMOdifyCfm :"templates/bankAccount/accountOverview/signPMOdifyConfirm.ejs",
            //小额/凭签名免密,境外词条修改限额结果页
            signPMOdifyScs :"templates/bankAccount/accountOverview/signPMOdifySuccess.ejs",
            
            //小额/凭签名免密,境外词条开通服务填写页
            signPOpenIpt   :"templates/bankAccount/accountOverview/signPOpenInput.ejs",
            //小额/凭签名免密,境外词条开通服务确认页
            signPOpenCfm   :"templates/bankAccount/accountOverview/signPOpenConfirm.ejs",
            //小额/凭签名免密,境外词条开通服务结果页
            signPOpenScs   :"templates/bankAccount/accountOverview/signPOpenSuccess.ejs",
            
            //小额/凭签名免密,境外词条 关闭服务确认页
            serviceCloseCfm:"templates/bankAccount/accountOverview/signPCloseConfirm.ejs",
            //小额/凭签名免密,境外词条 关闭服务结果页
            serviceCloseScs:"templates/bankAccount/accountOverview/signPCloseSuccess.ejs"
		},
		initParams:function(){
			this._conversationId = null;  
			this._el_width = null;
			this._hashTable = new Common.Hashtable(); 
			this.count=0;
			this.remainde_balance = 0;
		},
		//初始化页面
		init : function() {
			var _t = this;
			_t.initParams();
			Common.LightBox.show();
			Common.postRequest(new Model("PsnCommonQueryAllChinaBankAccount")).then(function(res) {
				var allAccount=result = CU.ajaxDataHandle(res);
				//活期账户、网上专属理财账户、定期账户、信用卡、电子现金账户
				var theexclusivefinancialAccount = [],periodicalAccounts = [],electroniccashAccounts = [],virtualAccList=[];
				if(result){
					$.each(result,function(i,p){
                        p.accountNumber && (p.formatAccountNumber = StringUtil.maskAccount(p.accountNumber));
                        p.accountNumber && (p.formatAccountiNumber = StringUtil.maskAccount(p.accountNumber));
						_t._hashTable.add(p.accountNumber,p);
						switch (p.accountType) {
							case "190":
								theexclusivefinancialAccount.push(p);
								break;
							case "140":
							case "150":
							case "152":
							case "170":
							//706新增纸质存单
							case "130"://整存整取
							case "131"://定活两便
							case "132"://通知存款
								periodicalAccounts.push(p);
								break;
							case "108"://108：虚拟卡(贷记) 
							case "109"://109：虚拟卡(准贷记)
							case "110"://110:虚拟卡（借记卡）
								virtualAccList.push(p);
								break;
							case "300":
								electroniccashAccounts.push(p);
								break;
							default:
								break;
						}
					});
					_t.isPayrollAccount(allAccount,function(data1,data2){
						var cardList=[],/*用于存放借记卡账户的集合*/accObj={};/*用于存放借记卡账户的对象*/
						$.each(data1,function(i,p){
	                       if(p.accountType=="119"){//交易限额设置功能 只有借记卡（119）支持
	                    	   cardList.push({
	                    		   key:p.accountId,
	                    		   val:"<span lan='payeraccount_"+p.accountType+"'></span><span class='ml5 mr5'>" //账户类型
	  	    				     	   +p.formatAccountNumber + "</span><span>" //账号
	  	    				     	   +p.nickName + "</span>"//账户别名
                			   });
	                    	   accObj[p.accountId]=p;
	                       }
						});
						//账户概览主页面
						_t.el.html(_t.ejsPath.main,{virtualAccList:virtualAccList,currentAccounts:data1,theexclusivefinancialAccount:theexclusivefinancialAccount,periodicalAccounts:periodicalAccounts,creditCardAccounts:data2,electroniccashAccounts:electroniccashAccounts},function() {
							_t.mainId=_t.el.find("#accountViewPage");
							//交易限额设置
							_t.el.find("a.limit-set").on("click",function(){
								_t.transferLimitSet(cardList, accObj, $(this).attr("accountId"));
							});
							//资产汇总报告
							_t.el.find("#a_propertyreport_19561").on("click",function(){
								_t.assetDebtReport();
							});
							//冻结止付
							_t.el.find(".a_freeze_107015").on("click",function(){
								_t.el.find(".tips-radius").hide();
								_t.freeze($(this).attr("accountNumber"));
							});
							//工资单查询
							_t.el.find(".a_payRoll").on("click",function(el){
								_t.payRollQuery(el);
							});
							//取消关联
							_t.el.find(".a_cancelrelevance_19574").on("click",function(){
								_t.el.find(".tips-radius").hide();
								_t.cancelRelevance(this);
							});
							//短信服务
							_t.el.find(".sms_service").on("click",function(){
								_t.el.find(".tips-radius").hide();
								Common.params = {accountIdSms:$(this).attr("accountId")};
								Common.triggerAction("serviceProvisioning");
							});
							//预约换卡
							_t.el.find(".a_exchange_19575").on("click",function(){
								//先将更多div隐藏
								_t.el.find(".tips-radius").hide();
								_t.exchangeCard(this);
							});
							
							//余额
							_t.el.find(".a_balance_19568").on("click",function(){
								_t.balance(this);
							});
							//信用卡余额
							_t.el.find(".crcd_balance_1425").on("click",function(){
								_t.crcdBalance($(this));
							});
							//信用卡账单查询
							_t.el.find(".crcd_bill").on("click",function(e){
								var accountId=$(e).attr("accountId");
								Common.accountLookBill={
										billAtxId:accountId+""//账单账户Id,
									};
								Common.triggerAction('CreditCardBilledTrans');
							});
							//信用卡还款
							_t.el.find(".crcd_repay").on("click",function(e){
								var accountId=$(e).attr("accountId");
								Common.aoRepayParam={
										arageAtxId:accountId+"",//欠款账户Id,
										arageType:"0"//最小金额还是自定义金额
								};
								Common.triggerAction('CreditCardRptRel');
							});
							
							//信用卡还款
							_t.el.find(".crd_los").on("click",function(e){
								_t.crdLos($(e).attr("accountNumber"));
							});
							
							//补登余额
							_t.el.find(".a_replenishbalance_19575").on("click",function(){
									var obj = $(this);
									var accountId = obj.attr("accountId");
									if(obj.attr("count")>0){
										obj.attr("count","0");
										_t.el.find(".supplyBalance_"+accountId).remove();
										return;
									}else{
										obj.attr("count","1");
									}
									Common.postRequest(new Model("PsnFinanceICAccountDetail", {accountId : accountId})).then(function(data){
										result = CU.ajaxDataHandle(data);
										if(result){
											$.get(_t.ejsPath.supplyBalanceEjs,function(ejs){
												if(ejs){
													var el = $.tmpl(ejs,{list:[result],errorCode:result.errorCode,accountId:accountId});
													var trs = _t.el.find("tr.supplyBalance_"+accountId);
													if (trs.length>0) trs.remove();
													obj.parent().parent().after(el.html());
													CU.changeLan(_t.el);
												}
											});
										}
									});
							 });
							//查看旧账号
							_t.el.find(".a_queryoldaccountno_19571").on("click",function(){
								Common.triggerAction("AccountQueryNewAndOldAccountNo");
							});
							//借记卡临时挂失，信用卡挂失
							_t.el.find(".a_temporaryloss_19572").on("click",function(){
								//如果是信用卡 跳到其他菜单
								if($(this).attr("isCreditCard")){
									Common.params = {accountId:$(this).attr("accountId")};
									Common.triggerAction("CreditCardLoss");
								}
								else{
								    _t.temporayLoss($(this).attr("accountNumber"));
							    }
									
							});
							//交易明细
							_t.el.find(".a_det_92464").on("click",function(){
								Common.params = {accountId:$(this).attr("accountId")};
								//单电子现金账户交易明细
								if($(this).attr("accountType")=="300" || $(this).attr("isECashAccount")){
									Common.triggerAction("ElectronBusinessDetail");
								}else{
									Common.triggerAction("TransactionDetails");
								}
							});
							//账户详情
							_t.el.find(".a_account_information_19570").on("click",function(){
								Common.params = {accountId:$(this).attr("accountId")};
								//信用卡
								if($(this).attr("isCreditCard")){
									Common.triggerAction("CreditCardAccountInfo");
								}else{
									//电子现金账户
									if($(this).attr("isECashAccount"))
										Common.triggerAction("ElectronAccountDetail");
									else
										Common.triggerAction("AccountDetails");
								}
							});
							//已出账单
							_t.el.find(".a_billedtrans_49157").on("click",function(){
								Common.params = {accountId:$(this).attr("accountId")};
								Common.triggerAction("CreditCardBilledTrans");
							});
							//未出账单
							_t.el.find(".a_futurebill_49156").on("click",function(){
								Common.params = {accountId:$(this).attr("accountId")};
								Common.triggerAction("CreditCardFutrueBill");
							});
							//修改别名添加事件
							_t.el.find(".a_changealias_19573").on("click",function(){
								var el=this;
					        	if(_t.count != 0) return; 
					            $(el).parent().hide().next().show().find("input").val($.trim($(el).parent().text()));
					            _t.modifyNickName=$.trim($(el).parent().text());
					            _t.count = 1;
							});
							//修改别名添加事件确认
							_t.el.find(".icon-ok").on("click",function(){
								_t.modifyAlias(this);
								
							});
							//修改别名添加事件取消
							_t.el.find(".icon-cancel").on("click",function(){
								var el=this;
								$(el).parent().hide().prev().show().find('span').text(_t.modifyNickName);
		                        _t.count = 0;
							});
							//更多
							_t.el.find(".btn_more_87495").on("mouseover",function(){
								//气泡渲染
								var el = _t.el.find("#btn_more_87495_"+$(this).attr("accountId"));
								//计算气泡最初宽度
								if(!_t._el_width) _t._el_width = el.width();
								//隐藏其他
								_t.el.find(".tips-radius").hide();
								
								if(!el.attr('hasBindEvent')){
									//气泡鼠标移开事件
									el.on("mouseout",function(){
										var _self=this;
										clearTimeout(_t.timeout);
										$(_self).hide();
									});
									//气泡上移动事件
									el.on("mouseover",function(){
										$(this).show();
									});
									el.attr('hasBindEvent',true);
								}
								//不同浏览器计算方式不同
								var t, l;
								if(document.documentElement && document.documentElement.scrollTop){
									t = document.documentElement.scrollTop;
						            l = document.documentElement.scrollLeft;
								} else if(document.body){
									t = document.body.scrollTop;
							        l = document.body.scrollLeft;
								}
								//计算气泡应渲染x坐标
								var left = $(this).position().left-_t._el_width-l+60;//60是气泡角的距离
								//计算气泡应渲染Y坐标
								var top = $(this).position().top+$(this).height()+t+5;
								//气泡渲染
								_t.el.append(
									el.css({left:left+"px", top: top+"px",position:"absolute"}).show()
								);
								//关闭按钮事件
								_t.el.find("a.tips-close").on("click",function(){
									$(this).parent().hide();
								});
								clearInterval(_t.timeout);
							}).on("mouseout",function(){
								_t.timeout = setTimeout(function(){_t.el.find(".tips-radius").hide();}, 1000);
							});
							/***************虚拟卡链接绑定事件*************************/
							if(virtualAccList.length){
								//账户详情（虚拟卡）
								_t.el.find(".virAccDetails").on("click",function(el){
									_t.virtualAccountDetails(el, allAccount);
								});
							}
							//电子卡转账
							_t.el.find("a.a_elec_trans").on("click",function(e){
								var accountNumber = $(e).attr("accountNumber");
								_t._elec_transfer(accountNumber);
							});
							CU.changeLan(_t.mainId.show());
							Common.LightBox.hide();
						});
					});
				}else{
					Common.LightBox.hide();
				}
			});
		},
		/**
		 * @author xlgui  
		 * 交易限额设置
		 * @param list       账户下拉集合
		 * @param accObj     账户下拉数据对象
		 * @param accountId  当心默认选中的账户id
		 */
		transferLimitSet:function(list,accObj,accountId){
			var _t=this,transferMainId=_t.el.find("#transferMainPage"),params={};
			_t.navObj={//用于控制引导条
				"index":"1",//服务类别
				"step" :"1",//操作步骤
				"service":"",//该字段仅用于小额免密和境外词条
				"firstFlag":false//用于控制是否为第一次加载交易限额设置，第一次加载为false，否则为true
			};
			Common.LightBox.show();
			//创建会话
	    	Common.requestInterface(new Model("PSNCreatConversation"),function(conid){
	    		_t._conversationId=conid;
				//获取系统时间
				Common.requestInterface(new Model("PsnCommonQuerySystemDateTime"),function(date){
					_t._sysDate=date.dateTme.split(" ")[0];
					transferMainId.html(_t.ejsPath.transferMain,function(){
						_t.accTopshowId=transferMainId.find("#accTopshow");//账户下拉
						var accItselect=new ITSelect({
							data : list,
							appendTo : transferMainId.find("#sel_0919_3336493").empty(),
							defValue : "",
							defText  : Common.ItSelectData.pleaseSelect,
							oddCls : "even",
							callback : function(e) {
								var obj=accObj[e.val];
								params={
								    "currency"     :"001",                  //币种
									"accountId"    :e.val.toString(),       //账户id
									"accountType"  :obj.accountType,        //账户类型
									"accountNumber":obj.formatAccountNumber,//464掩码后的账户
									"nickName"     :obj.nickName            //账户别名
								};
								//选择账户时默认执行当前tab流程
								transferMainId.find("li.tabs-current").trigger("click");
							}
						}),loadMainId=transferMainId.find("#loadInformation");
						//切换tab
						transferMainId.find("li.tabs").on("click",function(){
							$(this).addClass("tabs-current").siblings("li.tabs").removeClass("tabs-current");
							loadMainId.hide();
							_t.accTopshowId.show();//当流程到确认、结果页面时，账户下拉会被hide，而此时点击tab，则需要show出来
							//serviceType 服务类别
							var index=$(this).attr("index");
							switch(index){
								case "1"://限额设置
									delete params.serviceType;
									_t.navObj.service="";
									break;
								case "2"://小额/凭签名免密
									params.serviceType="4";
									break;
								case "3"://境外磁条交易
									params.serviceType="5";
									break;
							}
							_t.navObj.index=index;
							_t.navObj.step="1";
							/**
							 * transferSetInput 限额设置
							 * querySignStatus   小额/凭签名免密
							 */
							_t[index=="1"?"transferSetInput":"querySignStatus"](transferMainId,$.extend({},params));//用extend继承，否则切换tab时数据会缓存
						});
						CU.changeLan(transferMainId);
						accItselect.setValue(accountId);
					});
				});
	    	});
		},
		//显示引导条
		showNavigationBar:function(){
			var _t=this,obj=_t.navObj,ulId=_t.el.find("#transferMainPage ul.istep");
			ulId.find("li").removeClass("cur").hide();
			switch(obj.index){
				case "1"://限额设置
					ulId.find("li.t1").show();
					ulId.children("li.t1:contains('" + obj.step + "')").addClass("cur");
					break;
				case "2"://小额/凭签名免密
				case "3"://境外磁条交易
					ulId.children("li.t2-3-"+obj.service).show();
					ulId.children("li.t2-3-"+obj.service+":contains('" + obj.step + "')").addClass("cur");
					break;
			}
		},
		/**
		 * 小额/凭签名免密，境外词条，查询服务状态
		 * JSON接口说明文档（I68电子支付-银联跨行无卡支付）
		 * @author xlgui
		 * @param transferMainId 限额设置的外层id
		 * @param params         账户参数对象
		 */
		querySignStatus:function(transferMainId,params){
			var _t=this,loadMainId=transferMainId.find("#loadInformation"),
			p={
				"accountId"  :params.accountId,//账户id
				"serviceType":params.serviceType//4: 小额/凭签名免密、5: 境外磁条交易  
			};
			_t.navObj.service="1";//默认未开通
			Common.LightBox.show();
			//4.1.001  获取服务开通状态及客户信息
	    	Common.requestInterface(new Model("PsnNcpayServiceChoose",p),function(data){
	    		if(data.status=="Y"){//已开通
	    			params.currentQuota=data.quota;
	    			_t.navObj.service="2";//默认修改限额
	    		}else{
	    			_t.navObj.service="1";//默认未开通
	    		}
    			if(params.serviceType=="4"){//4: 小额/凭签名免密
    				//6：小额免密免签消费7：免密或凭签名消费
    				//银联卡：（小额免密免签消费交易日限额）VISA/MASTER卡：（免密或者凭签名消费交易日限额）
    				//cardBrand V： VISA卡,M：MASTER CARD 卡,U：银联卡
    				if(data.cardBrand=="U"){
    					params.serviceType="6";
    				}else{
    					params.serviceType="7";
    				}
    			}
	    		loadMainId.html(_t.ejsPath.signStatus,$.extend(params,data),function(){
	    			CU.changeLan(loadMainId);
					loadMainId.show();
					_t.showNavigationBar();
					Common.LightBox.hide();
					//绑定返回按钮事件
					_t.bindBackMainEvent();
					loadMainId.find("input[name='e_information']").on("click",function(){
						_t.navObj.service=this.value;//1开通，2修改，3关闭
						_t.showNavigationBar();
					});
					//下一步
					loadMainId.find("#btn_next_sign_0921").on("click",function(){
						_t.accTopshowId.hide();//隐藏账户下拉
						switch(_t.navObj.service){
							case "1"://开通
								_t.signPOpenIpt(transferMainId, params);
								break;
							case "2"://修改
								_t.signPMOdifyIpt(transferMainId, params);
								break;
							case "3"://关闭
								_t.signPCloseConfirm(transferMainId, params);
								break;
						}
					});
	    		});
	    	});
		},
		/**
		 * 小额/凭签名免密，境外词条开通填写页
		 * @author xlgui
		 * @param transferMainId 限额设置的外层id
		 * @param params         账户参数对象
		 */
		signPOpenIpt:function(transferMainId,params){
			var _t=this,prevEjsId=transferMainId.find("#sign_password_092101"),
			currEjsId=transferMainId.find("#sign_password_092102");
			Common.LightBox.show();
			currEjsId.html(_t.ejsPath.signPOpenIpt,params,function(){
				_t.loadSelector("PB203", function(){
					CU.changeLan(currEjsId);
					prevEjsId.hide();
					currEjsId.show();
					Common.LightBox.hide();
					_t.navObj.step="2";
					_t.showNavigationBar();
					//上一步
					currEjsId.find("#btn_prev_open_0922").on("click",function(){
						_t.accTopshowId.show();
						currEjsId.hide();
						prevEjsId.show();
						_t.navObj.step="1";
						_t.showNavigationBar();
					});
					//重置
					currEjsId.find("#btn_reset_open_0922").on("click",function(){
						CU.resetForm(currEjsId);
					});
					//下一步
					currEjsId.find("#btn_next_open_0922").on("click",function(){
						//对输入框进行校验
						if(!formValid.checkAll(currEjsId)){
				            return false;
				        }
						params.currentQuota=currEjsId.find("#currentQuota").val();
						//验证是否选择安全工具
						if(!Common.SF.check()){return false;}
						_t.signPOpenCfm(transferMainId, params);
					});
				});
			});
		},
		/**
		 * 小额/凭签名免密，境外词条开通确认页
		 * @author xlgui
		 * @param transferMainId 限额设置的外层id
		 * @param params         账户参数对象
		 */
		signPOpenCfm:function(transferMainId,params){
			var _t=this,prevEjsId=transferMainId.find("#sign_password_092102"),
			currEjsId=transferMainId.find("#sign_password_092103"),
			p={
				"accountId"    :params.accountId,   //账户id
				"accountNumber":params.acctNum,     //支付卡号
				"customerName" :params.custNam,     //客户姓名
				"tranDate"     :_t._sysDate,        //交易日期
				"currentQuota" :params.currentQuota,//当前交易限额
				"operateType"  :"开通",
				//服务类别(serviceType):5: 境外磁条交易,6：小额免密免签消费,7：免密或凭签名消费
				"serviceType":params.serviceType,   //服务类别
				"_combinId":Common.SF.get("combinId")//安全因子组合id
			};
			Common.LightBox.show();
			//4.2.003  服务开通预交易
			Common.requestInterface(new Model("PsnNcpayOpenPre",p,_t._conversationId),function(data){
				Common.creatToken(_t._conversationId,function(token){
					_t.token=token;
					currEjsId.html(_t.ejsPath.signPOpenCfm,params,function(){
						Common.SF.appendInputTo("#sign_password_092103 ul.layout-lr", function () {
							delete p._combinId;
							CU.changeLan(currEjsId);
			    			prevEjsId.hide();
			    			currEjsId.show();
			    			_t.navObj.step="3";
							_t.showNavigationBar();
							Common.LightBox.hide();
							//上一步
							currEjsId.find("#btn_prev_open_092202").on("click",function(){
								currEjsId.hide();
								prevEjsId.show();
								_t.navObj.step="2";
								_t.showNavigationBar();
							});
							//确认
							currEjsId.find("#btn_confirm_open_092202").on("click",function(){
								if(!formValid.checkAll(currEjsId)){
		    						return false;
		    					}
								_t.signPOpenSwindle(transferMainId, p);
							});
						},data);
					});
				});
			});
		},
		/**
		 * 小额/凭签名免密，境外词条开通提交
		 * @author xlgui
		 * @param transferMainId 限额设置的外层id
		 * @param p         账户参数对象
		 */
		signPOpenSwindle:function(transferMainId,p){
			var _t=this,prevEjsId=transferMainId.find("#sign_password_092103"),
			currEjsId=transferMainId.find("#sign_password_092104");
			if(!Common.SF.getData(p)){
				return false;
			}
			p.token=_t.token;
			// 如果反欺诈开启, 参数带上设备指纹
            if (Common.AC.enabled) {
                p.devicePrint = encode_deviceprint();
            }
			Common.LightBox.show();
			//4.3.004  服务开通提交交易
			Common.requestInterface(new Model("PsnNcpayOpenSubmit",p,_t._conversationId)
	    		,function(data){
					if(data){
					   $.extend(p,data);
             		   Common.LightBox.hide();
             		   //4.4.005  服务开通加强认证交易
             		   _t.preventForSwindle("PsnNcpayOpenSubmitReinforce",p,function(m){
             			  _t.signPScs(currEjsId, prevEjsId, m,"signPOpenScs");
             		   });
                    }else{
                    	p.cifMobile=null;
                    	_t.signPScs(currEjsId, prevEjsId, p,"signPOpenScs");
                    }
		    	}
		    	,function(token){//交易失败，重新申请token
		    		Common.SF.clear();
					_t.token=token;
					Common.LightBox.hide();
				}
	    	);
		},
		/**
		 * 小额/凭签名免密，境外词条修改填写页
		 * @author xlgui
		 * @param transferMainId 限额设置的外层id
		 * @param params         账户参数对象
		 */
		signPMOdifyIpt:function(transferMainId,params){
			var _t=this,prevEjsId=transferMainId.find("#sign_password_092101"),
			currEjsId=transferMainId.find("#sign_password_092102");
			Common.LightBox.show();
			currEjsId.html(_t.ejsPath.signPMOdifyIpt,params,function(){
				//等待刘海浩反馈服务码
				_t.loadSelector("PB203", function(){
					CU.changeLan(currEjsId);
					prevEjsId.hide();
					currEjsId.show();
					Common.LightBox.hide();
					_t.navObj.step="2";
					_t.showNavigationBar();
					//上一步
					currEjsId.find("#btn_prev_modify_0921").on("click",function(){
						_t.accTopshowId.show();
						currEjsId.hide();
						prevEjsId.show();
						_t.navObj.step="1";
						_t.showNavigationBar();
					});
					//重置
					currEjsId.find("#btn_reset_modify_0921").on("click",function(){
						CU.resetForm(currEjsId);
					});
					//下一步
					currEjsId.find("#btn_next_modify_0921").on("click",function(){
						//对输入框进行校验
						if(!formValid.checkAll(currEjsId)){
				            return false;
				        }
						params.currentQuota=currEjsId.find("#currentQuota").val();
						//验证是否选择安全工具
						if(!Common.SF.check()){return false;}
						_t.signPMOdifyCfm(transferMainId, params);
					});
				});
			});
		},
		/**
		 * 小额/凭签名免密，境外词条修改确认页
		 * @author xlgui
		 * @param transferMainId 限额设置的外层id
		 * @param params         账户参数对象
		 */
		signPMOdifyCfm:function(transferMainId,params){
			var _t=this,prevEjsId=transferMainId.find("#sign_password_092102"),
			currEjsId=transferMainId.find("#sign_password_092103"),
			p={
				"accountId"    :params.accountId,   //账户id
				"accountNumber":params.acctNum,     //支付卡号
				"customerName" :params.custNam,     //客户姓名
				"tranDate"     :_t._sysDate,        //交易日期
				"currentQuota" :params.currentQuota,//当前交易限额
				"operateType"  :"修改交易限额",
				//服务类别(serviceType):5: 境外磁条交易,6：小额免密免签消费,7：免密或凭签名消费
				"serviceType":params.serviceType,   //服务类别
				"_combinId":Common.SF.get("combinId")//安全因子组合id
			};
			Common.LightBox.show();
			//4.5.006  修改交易限额预交易
			Common.requestInterface(new Model("PsnNcpayQuotaModifyPre",p,_t._conversationId),function(data){
				Common.creatToken(_t._conversationId,function(token){
					_t.token=token;
					currEjsId.html(_t.ejsPath.signPMOdifyCfm,params,function(){
						Common.SF.appendInputTo("#sign_password_092103 ul.layout-lr", function () {
							delete p._combinId;
							CU.changeLan(currEjsId);
			    			prevEjsId.hide();
			    			currEjsId.show();
			    			_t.navObj.step="3";
							_t.showNavigationBar();
							Common.LightBox.hide();
							//上一步
							currEjsId.find("#btn_prev_modify_0922").on("click",function(){
								currEjsId.hide();
								prevEjsId.show();
								_t.navObj.step="2";
								_t.showNavigationBar();
							});
							//确认
							currEjsId.find("#btn_confirm_modify_0922").on("click",function(){
								if(!formValid.checkAll(currEjsId)){
		    						return false;
		    					}
								_t.signPMOdifySwindle(transferMainId, p);
							});
						},data);
					});
				});
			});
		},
		/**
		 * 小额/凭签名免密，境外词条修改提交
		 * @author xlgui
		 * @param transferMainId 限额设置的外层id
		 * @param params         账户参数对象
		 */
		signPMOdifySwindle:function(transferMainId, p){
			var _t=this,prevEjsId=transferMainId.find("#sign_password_092103"),
			currEjsId=transferMainId.find("#sign_password_092104");
			if(!Common.SF.getData(p)){
				return false;
			}
			p.token=_t.token;
			// 如果反欺诈开启, 参数带上设备指纹
            if (Common.AC.enabled) {
                p.devicePrint = encode_deviceprint();
            }
			Common.LightBox.show();
			//4.6.007  修改交易限额提交交易
			Common.requestInterface(new Model("PsnNcpayQuotaModifySubmit",p,_t._conversationId)
	    		,function(data){
					if(data){
					   $.extend(p,data);
             		   Common.LightBox.hide();
             		   //4.7.008 修改交易限额加强认证交易
             		   _t.preventForSwindle("PsnNcpayQuotaModifySubmitReinforce",p,function(m){
             			  _t.signPScs(currEjsId, prevEjsId, m,"signPMOdifyScs");
             		   });
                    }else{
                    	p.cifMobile=null;
                    	_t.signPScs(currEjsId, prevEjsId, p,"signPMOdifyScs");
                    }
		    	}
		    	,function(token){//交易失败，重新申请token
		    		Common.SF.clear();
					_t.token=token;
					Common.LightBox.hide();
				}
	    	);
		},
		/**
		 * 小额/凭签名免密，境外词条(修改，开通)结果页
		 * @author xlgui
		 * @param transferMainId 限额设置的外层id
		 * @param params         账户参数对象
		 * @param ejsName        ejs路径名
		 */
		signPScs:function(currEjsId,prevEjsId,p,ejsName){
			var _t=this;
			currEjsId.html(_t.ejsPath[ejsName],p,function(){
				CU.changeLan(currEjsId);
				prevEjsId.hide();
				currEjsId.show();
				Common.LightBox.hide();
				_t.navObj.step="4";
				_t.showNavigationBar();
				//返回
				_t.bindBackMainEvent();
			});
		},
		//反欺诈加强认证
		preventForSwindle: function(modelName,params,callback){
			var _t = this;
			_t.ac = new Common.AC({
				data: params,
				el: _t.el,
				conversationId: _t._conversationId,
				ok: function (enableOk) {
					Common.LightBox.show();
					//加强认证交易
					Common.postRequest(new Model(modelName, _t.ac.get(),_t._conversationId)).then(function (data) {
						_t.ac.ajaxDataHandle(data);
						if (CU.isSuccesful(data)) {
							_t.ac.hide();
							callback&&callback($.extend(params,_t.ac.ajaxDataHandle(data)));
						}else{
							Common.LightBox.hide();
						}
						enableOk();
					});
				}
			});
			if(_t.ac.result === "ALLOW"){
				_t.ac.hide();
				callback&&callback(params);
			}
		},
		/**
		 * 小额/凭签名免密，境外词条关闭确认
		 * @author xlgui
		 * @param transferMainId 限额设置的外层id
		 * @param params         账户参数对象
		 */
		signPCloseConfirm:function(transferMainId,params){
			var _t=this,
			p={
				"accountId"  :params.accountId, //账户id
				"serviceType":params.serviceType//5: 境外磁条交易,6：小额免密免签消费,7：免密或凭签名消费
			};
			prevEjsId=transferMainId.find("#sign_password_092101"),
			currEjsId=transferMainId.find("#sign_password_092102");
			Common.LightBox.show();
			//4.8.009  服务关闭预交易
			Common.requestInterface(new Model("PsnNcpayClosePre",p,_t._conversationId),function(data){
				Common.creatToken(_t._conversationId,function(token){
					_t.token=token;
					currEjsId.html(_t.ejsPath.serviceCloseCfm,params,function(){
		    			CU.changeLan(currEjsId);
		    			prevEjsId.hide();
		    			currEjsId.show();
		    			_t.navObj.step="2";
						_t.showNavigationBar();
						Common.LightBox.hide();
						//上一步
						currEjsId.find("#btn_prev_close_0921").on("click",function(){
							_t.accTopshowId.show();
							currEjsId.hide();
							prevEjsId.show();
							_t.navObj.step="1";
							_t.showNavigationBar();
						});
						//下一步
						currEjsId.find("#btn_confirm_close_0921").on("click",function(){
							p.token=_t.token;
							//由于接口返回的是decimal类型，接口上送为string类型，因此需要做类型转换
							p.currentQuota=params.currentQuota.toString();//当前交易限额
							_t.signPCloseSuccess(transferMainId, p);
						});
		    		});
				});
			});
		},
		/**
		 * 小额/凭签名免密，境外词条关闭结果
		 * @author xlgui
		 * @param transferMainId 限额设置的外层id
		 * @param params         账户参数对象
		 */
		signPCloseSuccess:function(transferMainId,params){
			var _t=this,
			prevEjsId=transferMainId.find("#sign_password_092102"),
			currEjsId=transferMainId.find("#sign_password_092103");
			Common.LightBox.show();
			//4.9.010 服务关闭提交交易
			Common.requestInterface(new Model("PsnNcpayCloseSubmit",params,_t._conversationId)
	    		,function(data){
					currEjsId.html(_t.ejsPath.serviceCloseScs,params,function(){
						CU.changeLan(currEjsId);
	    				prevEjsId.hide();
	    				currEjsId.show();
	    				_t.navObj.step="3";
						_t.showNavigationBar();
	    				Common.LightBox.hide();
	    				//返回
	    				_t.bindBackMainEvent();
					});
		    	}
		    	,function(token){//交易失败，重新申请token
					_t.token=token;
					Common.LightBox.hide();
				}
	    	);
		},
		//限额设置返回按钮事件
		bindBackMainEvent:function(){
			var _t=this,transferMainId=_t.el.find("#transferMainPage");
			//返回
			transferMainId.find("a.back-main").on("click",function(){
				_t.mainId.show();
				transferMainId.hide();
				delete _t.accTopshowId;
			});
		},
		/**
		 * 限额设置
		 * @author xlgui
		 * @param transferMainId 限额设置的外层id
		 * @param params         账户参数对象
		 */
		transferSetInput:function(transferMainId,params){
			var _t=this,loadMainId=transferMainId.find("#loadInformation");
			if(_t.navObj.firstFlag){
				Common.LightBox.show();
			}else{
				_t.navObj.firstFlag=true;//当加载到交易限额设置界面，点击“限额设置”tab，需要加遮罩层
			}
			//查询借记卡已设置限额
			Common.requestInterface(new Model("PsnDebitCardQryQuota",{"accountId":params.accountId,"currency":params.currency}),function(data){
				data.currency=params.currency;
				loadMainId.html(_t.ejsPath.transferIpt,data,function(){
					_t.loadSelector("PB016", function(){//加载安全控件
						_t.showNavigationBar();
						_t.mainId.hide();
						CU.changeLan(transferMainId);
						loadMainId.show();
						transferMainId.show();
						Common.LightBox.hide();
						//绑定返回按钮事件
						_t.bindBackMainEvent();
						//下一步
						loadMainId.find("#btn_next_set_0920").on("click",function(){
							//对输入框进行校验
							if(!formValid.checkAll(loadMainId)){
					            return false;
					        }
							//验证是否选择安全工具
							if(!Common.SF.check()){return false;}
							$.each(loadMainId.find("input[type='text']"),function(i,p){
								params[p.id]=$(p).val();//获取各金额输入框字段值
							});
							_t.transferSetConfirm(transferMainId, params);
						});
						//重置
						loadMainId.find("#btn_reset_set_0920").on("click",function(){
							CU.resetForm(loadMainId);
						});
					});
				});
			});
		},
		/**
		 * 限额设置确认
		 * @author xlgui
		 * @param loadMainId     限额填写页外层id
		 * @param params         参数对象
		 */
		transferSetConfirm:function(loadMainId,params){
			var _t=this,p={},
			prevEjsId=loadMainId.find("#transfer_set_input"),
			confirmId=loadMainId.find("#transfer_set_confirm");
			//组装上送参数对象
			$.each(["accountId","currency","transDay","allDayPOS","cashDayATM","consumeForeignPOS","cashDayForeignATM"],function(i,x){
				p[x]=params[x];
			});
			p._combinId=Common.SF.get("combinId");//安全因子组合id
			Common.LightBox.show();
			//4.42 042 设置借记卡交易限额预交易
			Common.requestInterface(new Model("PsnDebitCardSetQuotaPre",p,_t._conversationId),function(data){
				Common.creatToken(_t._conversationId,function(token){
					_t.token=token;
					confirmId.html(_t.ejsPath.transferCfm,params,function(){
						Common.SF.appendInputTo("#transfer_set_confirm ul.layout-lr", function () {
		    				CU.changeLan(confirmId);
		    				prevEjsId.hide();
		    				_t.accTopshowId.hide();
		    				confirmId.show();
		    				Common.LightBox.hide();
		    				_t.navObj.step="2";
		    				_t.showNavigationBar();
		    				//上一步
		    				confirmId.find("#btn_prev_set_0920").on("click",function(){
								confirmId.hide();
								_t.accTopshowId.show();
								prevEjsId.show();
								_t.navObj.step="1";
			    				_t.showNavigationBar();
							});
							//下一步
		    				confirmId.find("#btn_confirm_set_0920").on("click",function(){
		    					if(!formValid.checkAll(confirmId)){
		    						return false;
		    					}
								_t.transferSetSuccess(confirmId,loadMainId, params, p);
							});
		    			},data);
					});
				});
			});
		},
		/**
		 * 限额设置结果
		 * @author xlgui
		 * @param prevEjsId      限额确认页外层id
		 * @param loadMainId     限额设置外层id
		 * @param params         参数对象
		 * @param p              上送参数对象
		 */
		transferSetSuccess:function(prevEjsId,loadMainId,params,p){
			var _t=this,currEjsId=loadMainId.find("#transfer_set_success");;
			delete p._combinId;
			if(!Common.SF.getData(p)){
				return false;
			}
			p.token=_t.token;
			Common.LightBox.show();
			//4.43 043 设置借记卡交易限额提交
			Common.requestInterface(new Model("PsnDebitCardSetQuota",p,_t._conversationId)
	    		,function(data){
					currEjsId.html(_t.ejsPath.transferScs,params,function(){
						CU.changeLan(currEjsId);
	    				prevEjsId.hide();
	    				currEjsId.show();
	    				Common.LightBox.hide();
	    				//返回
	    				_t.bindBackMainEvent();
	    				_t.navObj.step="3";
	    				_t.showNavigationBar();
					});
		    	}
		    	,function(token){//交易失败，重新申请token
					_t.token=token;
					Common.LightBox.hide();
				}
	    	);
		},
		/**
	     * 该方法用于加载安全控件
	     * @param serviceId 服务码
	     * @param callback  回调函数
	     */
	    loadSelector:function(serviceId,callback){
	    	Common.SF.showSelector(serviceId,callback,null,this._conversationId);
	    },
		//资产报告
		assetDebtReport:function(){
			var _t=this;
			Common.LightBox.show();
			Common.postRequest(new Model("PsnAssetDebtReport")).then(function(data) {
				var result = CU.ajaxDataHandle(data);
				if(result){
					_t.el.append(_t.ejsPath.assetsReport, {
						CurrentSumBalanceByCurCashRemit:result.CurrentSumBalanceByCurCashRemit,
						TermSumBalanceByCurCashRemit:result.TermSumBalanceByCurCashRemit,
						CreditCardSumBalanceByCur_Asset:result.CreditCardSumBalanceByCur_Asset,
						CurrentSumBalanceByECashRemit:result.CurrentSumBalanceByECashRemit,
						SumtotalAssetByCurrrency:result.SumtotalAssetByCurrrency,
						CreditCardSumBalanceByCur_Debt:result.CreditCardSumBalanceByCur_Debt}, function () {
						    var pop = _t.el.find("#assetReportDiv");
						    //关闭按钮
						    _t.el.find("#btn_return_6273,a.close").on("click",function(){
						        pop.remove();
						        Common.LightBox.hide();
						    });

						  //资产状况--活期账户
							 _t.zc_hq_visible = true;//是否隐藏
							 _t.el.find("#assets_zc_hq").on("click",function(e){
								 _t._showZcHqContent(e);
							 });

							 //资产状况--定期账户
							 _t.zc_dq_visible = true;//是否隐藏
							 _t.el.find("#assets_zc_dq").on("click",function(e){
								 _t._showZcDqContent(e);
							 });

							 //资产状况--信用卡
							 _t.zc_xyk_visible = true;//是否隐藏
							 _t.el.find("#assets_zc_xyk").on("click",function(e){
								 _t._showZcXykContent(e);
							 });

							 //资产状况--电子现金
							 _t.zc_dzxj_visible = true;//是否隐藏
							 _t.el.find("#assets_zc_dzxj").on("click",function(e){
								 _t._showZcDzxjContent(e);
							 });

							 //资产状况--资产合计
							 _t.zc_zchj_visible = true;//是否隐藏
							 _t.el.find("#assets_zc_zchj").on("click",function(e){
								 _t._showZcZchjContent(e);
							 });

							 //负债状况--信用卡
							 _t.fz_xyk_visible = true;//是否隐藏
							 _t.el.find("#assets_fz_xyk").on("click",function(e){
								 _t._showFzXykContent(e);
							 });
							 
							//负债合计
							 _t.debt_xyk_visible = true;//是否隐藏
							 _t.el.find("#debt_zc_zchj").on("click",function(e){
								 _t._showDebtContent(e);
							 });
						    CU.changeLan(pop);
						    CU.setObjAbsCenter(pop);
					});
				}else{
					Common.LightBox.hide();
				}
			});
		},
		//虚拟卡详情
		virtualAccountDetails:function(el, allAccount){
			var _t=this;//virAccDetails
			_t.queryVirtualCardDetails(el,allAccount,function(data){
				_t.el.append(_t.ejsPath.virAccDetails,data, function () {
					var pop = _t.el.find("#virtual_details");
					//关闭按钮
	                pop.find("#btn_close_0624,a.close").on("click", function () {
	                    pop.remove();
	                    Common.LightBox.hide();
	                });
	                //注销
					_t.el.find("#virtual_cancel").on("click",function(){
						Common.LightBox.hide();
						Common.params=data;
						Common.triggerAction("DebitCardVirtualSet");//虚拟银行卡功能设置
					});
	                //已出账单、未出账单、交易明细
                	pop.find("a.vir_btn").on("click",function(){
                		Common.LightBox.show();
                		_t[this.id](data);
                	});
	                CU.changeLan(pop);
	                pop.show();
	                CU.setObjAbsCenter(pop);
				});
			});
		},
		//虚拟卡已出账单
		virtualBilledtrans:function(data){
			var _t=this;
			//获得服务器时间
			Common.requestInterface(new Model("PsnCommonQuerySystemDateTime"),function(date){
				var month = new Date(date.dateTme.split(" ")[0]),monthData=[];
				month.setDate(1);
				function getMonthStr(date){
					return (date.getFullYear())+"/"+(date.getMonth() + 1 < 10 ? "0" + (date.getMonth() + 1) : date.getMonth() + 1);
				};
				for(var i=0;i<4;i++){
					monthData[monthData.length] = {"key":getMonthStr(month),"val":getMonthStr(month)};
					month.setMonth(month.getMonth()-1);
				}
				_t.el.append(_t.ejsPath.settledBillMain, {}, function () {
	                var pop = _t.el.find("#popup").css("zIndex", "+=2");
	                //关闭按钮
	                pop.find("a.close").on("click", function () {
	                    pop.remove();
	                    Common.LightBox.hide();
	                });
                    var month_select = new ITSelect({ // 已出账单月份
                        data:monthData,
                        appendTo: pop.find("#sel_qxzyczdyf_94723").empty(),
                        defValue: monthData[0].key,
                        defText: monthData[0].key,
                        oddCls: "even"
                    });
                    //查询按钮
                    pop.find("#btn_49_94721").on("click", function () {
                    	Common.LightBox.show();
                    	Common.requestInterface(new Model("PsnCrcdVirtualCardSettledbillQuery", { // 接口14
                    		accountName: data.accountName,
                    		virtualCardNo: data.virtualCardNo,
                    		statementMonth:month_select.val
                    	}),function (data) {
                    		var tabId=pop.find("#settledBillQueryResult");
                    		tabId.html(_t.ejsPath.settledBillQueryResult, {list: data}, function () {
                                CU.changeLan(tabId.show());
                                CU.setObjAbsCenter(pop);
                                Common.LightBox.hide();
                            });
                    	});
                    });
                    CU.changeLan(pop);
                    CU.setObjAbsCenter(pop);
                });
            });
		},
		//虚拟卡未出账单
		virtualFuturebill:function(data){
			var _t=this;
			Common.requestInterface(CU.createConversation(),function(conid){
				var params={
						accountName: data.accountName,
		                virtualCardNo: data.virtualCardNo
				};
				Common.requestInterface(new Model("PsnCrcdVirtualCardUnsettledbillSum",params),function(rst){
					$.extend(params,{
						pageSize:"15",
						currentIndex: "0",
						_refresh: "true"
					});
					var model=new Model("PsnCrcdVirtualCardUnsettledbillQuery",params,conid);
                    Common.requestInterface(model,function(data){
						_t.el.append(_t.ejsPath.unsettledBill, { totalList: rst }, function () {
	                        var pop = _t.el.find("#popup").css("zIndex", "+=2"),
		                        tableDivId=pop.find("#CreditCardVirtualQuery_unsettledBill_table"),
		                        ejsPath=_t.ejsPath.unsettledBill_tr,
		                        virtualPag=function(ejsPath,model,tableDivId,footDivId,recordCount,pageIndex) {
		                        	var pagerParam = {
	                        			canvas: footDivId,
	                        			callbackFn: function (idx) {
	                        				Common.requestInterface(model.findPageIndex(idx),function(data){
	                        					tableDivId.html(ejsPath,{list:data.crcdTransactionList}, function () {
	                        						virtualPag(ejsPath,model,tableDivId,footDivId,data.recordNumber,idx);
	                        						CU.changeLan(tableDivId);
	                        						CU.setObjAbsCenter(pop);
	                        					});
	                        				});
	                        			},
	                        			pageIndex: pageIndex,
	                        			point: _t,
	                        			recordCount: recordCount,
	                        			pageSize:params.pageSize,
	                        			showDownload:false//是否显示下载按钮
		                        	},
		                        	pg = Pager.getInstance();
		                        	pg.init(pagerParam);
		                        	$(footDivId)[recordCount>0?'show':'hide']();
		                        };
	                        pop.find("a.close").on("click", function () { // //关闭按钮
	                            pop.remove();
	                            Common.LightBox.hide();
	                        });
	                        CU.setObjAbsCenter(pop);
                        	tableDivId.html(ejsPath,{list: data.crcdTransactionList }, function () {
                                tableDivId.show();
                                CU.changeLan(pop);
                                CU.setObjAbsCenter(pop);
                                virtualPag(ejsPath,model,tableDivId,"#usPopFoot",data.recordNumber,1);
                            });
                        });
					});
				});
			});
			 //分页索引
		    Model.prototype.findPageIndex =function(index,refresh){
			    this.attributes.params._refresh =refresh ? "true" :"false";
			    this.attributes.params.currentIndex = (index - 1) * this.attributes.params.pageSize+"";
			    return this;
		    };
		},
		//虚拟卡交易明细提示
		virtualDetails:function(params){
			var _t=this;
			_t.el.append(_t.ejsPath.virDetailsTips, {}, function () {
				var pop = _t.el.find("#pop_cancle_pop_confirm").css("zIndex", "+=2");
  			    //否
  			    pop.on("click", "#btn_631_98265, a.close", function () {
  			    	pop.remove();
  			    	Common.LightBox.hide();
  			    });
  			    //是
  			    pop.on("click", "#btn_630_98264", function () {
					pop.remove();
  				    Common.LightBox.hide();
  				    Common.LightBox.hide();
  				    Common.params=params;
  				    //跳转到账户交易明细页面
  				    Common.triggerAction("TransactionDetails");
			    });
  			    CU.changeLan(pop);
				CU.setObjAbsCenter(pop);
			});
		},
		//查询虚拟卡详情
		queryVirtualCardDetails:function(el,allAccount,callback){
			//4.11 011 PsnVirtualDebitCardInfoQuery查询借记虚拟卡详情(I02银行账户-虚拟卡服务)
			//4.1 108信用卡查询虚拟卡详情PsnCrcdQueryVIRCardInfo(I27信用卡)
			var cardType=$(el).attr("accountType"),model=cardType=="110"?"PsnVirtualDebitCardInfoQuery":"PsnCrcdQueryVIRCardInfo";
			Common.LightBox.show();
			Common.requestInterface(new Model(model,{"accountId":$(el).attr("accountId")}),function(data){
				var accNum=data.entityCardNum || data.creditCardNo;
				for(var i=0,len=allAccount.length;i<len;i++){
					if(accNum==allAccount[i].accountNumber){//accNum实体卡号
						callback&&callback($.extend(data,allAccount[i],{"cardType":cardType}));
						break;
					}
				}
			});
		},
		/*******************************************************************************/
		//资产状况--活期账户
		_showZcHqContent:function(e){
			var _t = this;
			if(_t.zc_hq_visible){
				$("#assets_zc_hq_tobdy").show();
				$(e).removeClass('close-th').addClass('open-th');
			}else{
				$("#assets_zc_hq_tobdy").hide();
				$(e).removeClass('open-th').addClass('close-th');
			}
			_t.zc_hq_visible = !(_t.zc_hq_visible);
		},
		
		//资产状况--定期账户
		_showZcDqContent: function(e){
			var _t = this;
			if(_t.zc_dq_visible){
				$("#assets_zc_dq_tobdy").show();
				$(e).removeClass('close-th').addClass('open-th');
			}else{
				$("#assets_zc_dq_tobdy").hide();
				$(e).removeClass('open-th').addClass('close-th');
			}
			_t.zc_dq_visible = !(_t.zc_dq_visible);
		},
		
		//资产状况--信用卡
		_showZcXykContent: function(e){
			var _t = this;
			if(_t.zc_xyk_visible){
				$("#assets_zc_xyk_tobdy").show();
				$(e).removeClass('close-th').addClass('open-th');
			}else{
				$("#assets_zc_xyk_tobdy").hide();
				$(e).removeClass('open-th').addClass('close-th');
			}
			_t.zc_xyk_visible = !(_t.zc_xyk_visible);
		},
		
		//资产状况--电子现金
		_showZcDzxjContent: function(e){
			var _t = this;
			if(_t.zc_dzxj_visible){
				$("#assets_zc_dzxj_tobdy").show();
				$(e).removeClass('close-th').addClass('open-th');
			}else{
				$("#assets_zc_dzxj_tobdy").hide();
				$(e).removeClass('open-th').addClass('close-th');
			}
			_t.zc_dzxj_visible = !(_t.zc_dzxj_visible);
		},
		
		//资产状况--资产合计
		_showZcZchjContent: function(e){
			var _t = this;
			if(_t.zc_zchj_visible){
				$("#assets_zc_zchj_tobdy").show();
				$(e).removeClass('close-th').addClass('open-th');
			}else{
				$("#assets_zc_zchj_tobdy").hide();
				$(e).removeClass('open-th').addClass('close-th');
			}
			_t.zc_zchj_visible = !(_t.zc_zchj_visible);
		},
		
		//负债状况--信用卡
		_showFzXykContent:function(e){
			var _t = this;
			if(_t.fz_xyk_visible){
				$("#assets_fz_xyk_tobdy").show();
				$(e).removeClass('close-th').addClass('open-th');
			}else{
				$("#assets_fz_xyk_tobdy").hide();
				$(e).removeClass('open-th').addClass('close-th');
			}
			_t.fz_xyk_visible = !(_t.fz_xyk_visible);
		},
		
		//负债合计
		_showDebtContent:function(e){
			var _t = this;
			if(_t.debt_xyk_visible){
				$("#debt_zc_zchj_tobdy").show();
				$(e).removeClass('close-th').addClass('open-th');
			}else{
				$("#debt_zc_zchj_tobdy").hide();
				$(e).removeClass('open-th').addClass('close-th');
			}
			_t.debt_xyk_visible = !(_t.debt_xyk_visible);
		},
		/***************************************************************************/
		
		//临时挂失
		temporayLoss:function(accountNumber){
			var _t = this;
			var account = _t._hashTable.item(accountNumber);
			_t.el.html(_t.ejsPath.temporaryLoss,{account:account},function(){
				Common.SF.showSelector("PB010C", function () {
					_t.el.find("#div_temporary_loss_input").show();
					CU.changeLan(_t.el);
					_t._conversationId = Common.SF.get("conversationId");
					if(_t._conversationId){
						var lossDays = _t.el.find("input[name='rd_lossvaliddate_106961']:checked").val();
						var accFlozenFlag= _t.el.find("input[name='rd_loss_account']:checked").val();
						// 挂失有效期
						_t.el.find("input[name='rd_lossvaliddate_106961']").on('click', function() {
							lossDays = $(this).val();
							if(accFlozenFlag == 'Y'){
								CU.changeLan($("#msg_riqi").attr('lan', 'lossvaliddate_'+lossDays).parent());
								$("#msg_loss_valid_date").show();
							}else{
								$("#msg_loss_valid_date").hide();
							}
						});
						//是否同时冻结借记卡主账户 单击事件
						_t.el.find("input[name='rd_loss_account']").on('click', function() {
							accFlozenFlag= $(this).val();
							if(accFlozenFlag == 'Y'){
								CU.changeLan($("#msg_riqi").attr('lan', 'lossvaliddate_'+lossDays).parent());
								CU.changeLan($("#rd_loss_account_msg").attr('lan', 'l92459').parent());
								$("#msg_loss_valid_date").show();
							}else{
								CU.changeLan($("#rd_loss_account_msg").attr('lan', 'l92546').parent());
								$("#msg_loss_valid_date").hide();
							}
						});
						
						//临时挂失按钮事件
						_t.el.find("#btn_temporaryloss_78427").on("click",function(){
							//是否选择安全工具
							if (!Common.SF.check()) return false;
							var sfNum=_t.el.find("input[name='rd_choose_security_tool_17637']:checked").val();

							Common.LightBox.show();
							Common.postRequest(new Model("PsnDebitcardLossReportConfirm", {accountNumber:accountNumber,lossDays:lossDays,accFlozenFlag:accFlozenFlag,_combinId:Common.SF.get("combinId")},_t._conversationId)).then(function(data) {
								var result = CU.ajaxDataHandle(data);
								if(result){
									//进入页面前，申请好token
									//GIT
									Common.postRequest(CU.createTokenId(_t._conversationId)).then(function (data) {
									    _t._token = CU.ajaxDataHandle(data);
									    Common.LightBox.hide();
										_t.el.find("#div_temporary_loss_confirm").html(_t.ejsPath.temporaryLossConfirm,{account:account,lossDays:lossDays,accFlozenFlag:accFlozenFlag},function(){
											_t.el.find("#div_temporary_loss_input").hide();
											_t.el.find("#btn_confirm_78158").off("click");
											Common.SF.appendInputTo("#div_temporayLoss_confirm ul.layout-lr",function(){
												_t.el.find("#div_temporary_loss_confirm").show();
												CU.changeLan(_t.el.find("#div_temporary_loss_confirm"));
												//确认按钮添加事件
												_t.el.find("#btn_confirm_78158").on("click",function(){
													//校验表单
													if(!formValid.checkAll(_t.el.find("#div_temporayLoss_confirm"))) return false;
															var smc = Common.SF.get("Smc");
															var otp = Common.SF.get("Otp");
															var params = {
																	accountId:account.accountId,
																	accountNumber:accountNumber,
																	lossDays:lossDays,
																	Name:Common.currentUser.name,
																	accFlozenFlag:accFlozenFlag,
																	token:_t._token
															};
															// 有手机验证码
										                    if (smc) {
										                        $.extend(params, {
										                            activ: smc.Version,
										                            state: smc.State,
										                            Smc: smc.Value,
										                            Smc_RC: smc.RandomKey_C
										                        });
										                    }
										                    // 有动态口令
										                    if (otp) {
										                        $.extend(params, {
										                            activ: otp.Version,
										                            state: otp.State,
										                            Otp: otp.Value,
										                            Otp_RC: otp.RandomKey_C
										                        });
										                    }
										                    //签名
													    	var signedData = Common.SF.get("signedData");
													    	if(signedData){
													    		if(signedData.result){
													    			params._signedData = signedData.result;
													    		}else{
													    			return false;
													    		}
													    	}
											    			Common.LightBox.show();
															Common.postRequest(new Model("PsnDebitcardLossReportResult", params,_t._conversationId)).then(function(res) {
																var resutlData=CU.ajaxDataHandle(res);
																if (CU.isSuccesful(res)) {
																	Common.LightBox.hide();
																	_t.el.find("#div_temporary_loss_success").html(_t.ejsPath.temporaryLossSuccess,{resFlags:resutlData,account:account,lossDays:lossDays,accFlozenFlag:accFlozenFlag},function(){
																		_t.el.find("#div_temporary_loss_confirm").hide();
																		CU.changeLan(_t.el.find("#div_temporary_loss_success"));
																	}).show();
															}else{
																Common.SF.clear();
																// 失败, 重新申请token
												                Common.postRequest(CU.createTokenId(_t._conversationId)).then(function (data2) {
												                    _t._token = CU.ajaxDataHandle(data2);
											                    	Common.LightBox.hide();
															});
														}
													});
												});
												
											},result);
											//取消按钮事件  /*改名为上一步了*/
											_t.el.find("#btn_cancel_78163").on("click",function(){
												_t.el.find("#div_temporary_loss_input").show();
												_t.el.find("#div_temporary_loss_confirm").hide();
											});
										});
									});
								}else{
									Common.LightBox.hide();
								}
							});
						});
					}
			    });
			});
		},
		//修改别名
		modifyAlias:function(obj){
			 var _t=this;
			 var params={
					 accountId:$(obj).attr("accountId"),
					 accountNickName:$(obj).prev().val()
//					 accountNumber:$(obj).attr("accountNumber")
//					 accountType:$(obj).attr("accountType")
			 };
			 Common.LightBox.show();
			 Common.postRequest(new Model("PSNCreatConversation")).then(function(data){
				    _t._conversationId = CU.ajaxDataHandle(data);
					if(_t._conversationId){
						//GIT
						Common.postRequest(CU.createTokenId(_t._conversationId)).then(function (data) {
						    _t._token = CU.ajaxDataHandle(data);
						    Common.LightBox.hide();
								//校验表单
								if(!formValid.checkAll($(obj).parent())) return false;
//								params.accountNickName = $(obj).prev().val();
								params.token = _t._token;
								Common.LightBox.show();
								Common.request(new Model("PsnAccountModifyAccountAlias",params,_t._conversationId),function(data1){
									Common.LightBox.hide();
									$(obj).parent().hide().prev().show().find('span').text(params.accountNickName);
									_t.modifyNickName=params.accountNickName;
			                        _t.count = 0;
								},function(error){
									Common.creatToken(_t._conversationId,function(token){
										_t._token = token;
										Common.LightBox.hide();
									});
								});				
						});
					}else{
						Common.LightBox.hide();
					}
			 });
		},
		//取消关联
		cancelRelevance:function(obj){
			var _t = this;
			var accountNumber = $(obj).attr("accountNumber");
			var params = {
					accountId:$(obj).attr("accountId"),
					accountNumber:accountNumber,
					formatAccountNumber:StringUtil.maskAccount(accountNumber),
					accountNickName:$(obj).attr("nickName"),
					accountType:$(obj).attr("accountType")
			};
			_t.el.append(_t.ejsPath.cancelRelevance,params,function(){
				var pop = _t.el.find("#div_cancelRelevance_pop");
				//关闭按钮事件
				_t.el.find("#btn_close_19712,a.close").on("click",function(){
					pop.remove();
					Common.LightBox.hide();
				});
				
				//进入页面前，申请好token
		    	//CrC
				 Common.LightBox.show();
				 Common.postRequest(new Model("PSNCreatConversation")).then(function(data){
					 _t._conversationId = CU.ajaxDataHandle(data);
						if(_t._conversationId){
							//GIT
							Common.postRequest(CU.createTokenId(_t._conversationId)).then(function (data) {
							    _t._token = CU.ajaxDataHandle(data);
							    Common.LightBox.hide();
							  //确认按钮事件
								_t.el.find("#btn_confirm_19711").on("click",function(){
//									pop.remove();
//									Common.LightBox.hide();
									params.token = _t._token;
									Common.LightBox.show();
									Common.postRequest(new Model("PsnSVRCancelAccRelation", params,_t._conversationId)).then(function(data) {
										CU.ajaxDataHandle(data);
										//是否成功
										if (CU.isSuccesful(data)) {
											pop.remove();
											_t.el.append(_t.ejsPath.cancelSuccess,params,function(){
												var popSuccess = _t.el.find("#div_cancelSuccess_pop");
												//关闭按钮事件
												_t.el.find("#btn_close_19754,a.close").on("click",function(){
													popSuccess.remove();
													Common.LightBox.hide();
													//刷新页面
													_t.init();
												});
												CU.setObjAbsCenter(popSuccess);
												CU.changeLan(popSuccess);
											});
											//关闭会话
											Common.postRequest(CU.closeConversation(_t._conversationId)).then(function (data2) {
												Common.LightBox.hide();
											});
										}else{
											// 失败, 重新申请token
							                Common.postRequest(CU.createTokenId(_t._conversationId)).then(function (data2) {
							                    _t._token = CU.ajaxDataHandle(data2);
							                    Common.LightBox.hide();
							                });
										}
										
									});				
								});
							});
						}else{
							Common.LightBox.hide();
						}
				 });
				CU.setObjAbsCenter(pop);
				Common.LightBox.show(_t.el);
				CU.changeLan(pop);
			});
		},
		//余额
		balance:function(obj){
			var _t = this;
			var accountId = $(obj).attr("accountId"),accountType=$(obj).attr("accountType"),fixedAccount=$(obj).attr("fixedAccount");
			if($(obj).attr("balance_"+accountId)=="true"){
				$(obj).attr("balance_"+accountId,"false");
				//当存在医保个人账户时避免点击余额时,收起借记卡的余额
				$(obj).attr("isMedicalAccount")=="1"?$(obj).parent().parent().siblings("*[aid='"+accountId+"'][ismedicalaccount='true']").remove():
				$(obj).parent().parent().siblings("*[aid='"+accountId+"'][ismedicalaccount='false']").remove();
					
				return;
			}
			//是否是定期账户
			var isperiodical = false;
			//如果是定期 有储种
			if($(obj).attr("isperiodical")) isperiodical = true;
			Common.LightBox.show();
			var isMedicalAccount = $(obj).attr("isMedicalAccount")=="1";
			var model = isMedicalAccount?new Model("PsnMedicalInsurAcctDetailQuery", {accountId:accountId}):new Model("PsnAccountQueryAccountDetail", {accountId:accountId});
			Common.postRequest(model).then(function(data) {
				Common.LightBox.hide();
				if(CU.isSuccesful(data)){
					var result =  CU.ajaxDataHandle(data);
					if(result){
						$.get(_t.ejsPath.balance, result, function(ejs){
							if(ejs){
                                var balanceTable = new Common.Hashtable(),volumeNumTable = new Common.Hashtable();
                                var volumeNumList = [],otherList = [],keyList = [];
                                $.each(result.accountDetaiList,function(i,p){
                                    //过滤同时包含存单号和册号的账号
                                    if(p.volumeNumber && p.cdNumber){
                                        if(!volumeNumTable.item(p.volumeNumber)){
                                            //过滤出存单号的列表后面排序用
                                            volumeNumList.push(p.volumeNumber);
                                            var cdNumList = new Array();
                                            cdNumList.push(p.cdNumber);
                                            //存单号做key，同一存单下不同册号做value
                                            volumeNumTable.add(p.volumeNumber,cdNumList);
                                        }else{
                                            volumeNumTable.item(p.volumeNumber).push(p.cdNumber);
                                        }
                                        //将数据无序放入balanceTable,{key:volumeNumber-cdNumber,value:[p]}
                                        if(!balanceTable.item(p.volumeNumber + "-" + p.cdNumber)){
                                            var balanceList = new Array();
                                            balanceList.push(p);
                                            balanceTable.add(p.volumeNumber + "-" + p.cdNumber,balanceList);
                                        }else{
                                            balanceTable.item(p.volumeNumber + "-" + p.cdNumber).push(p);
                                        }
                                    }else{
                                        //存入数组
                                        otherList.push(p);
                                    }
                                });
                                //先将无存单号和册号的记录放在最前面。这部分数据按照币种排序
                                var filter=[],other=[],rslist=[];
                                //人民币排在第一位
                                $.each(otherList,function(i,p){
                                    if(p.currencyCode=='001'){
                                        filter.push(p);
                                    }else{
                                        other.push(p);
                                    }
                                });
                                filter = filter.concat(other);
                                //再将有存单号和册号的记录放在后面，这部分数据按照存单号升序，册号升序排序
                                //生成有序key:volumeNumber-cdNumber列表
                                volumeNumList = volumeNumList.sort();
                                for(var i = 0;i<volumeNumList.length;i++){
                                  var cdNumTmpList = volumeNumTable.item(volumeNumList[i]).sort();
                                  for(var k = 0;k<cdNumTmpList.length;k++){
                                      //生产存单号升序，其下册号升序的key列表
                                      keyList.push(volumeNumList[i]+"-"+cdNumTmpList[k]);
                                  }
                                }
                                //按有序key列表从balanceTable中取出数据，放入最终filter中 。
                                var tmpList = [];
								for(var j = 0;j<keyList.length;j++){
                                    if(balanceTable.item(keyList[j])){
                                        tmpList = tmpList.concat(balanceTable.item(keyList[j]));
                                    }
                                }
                                filter = filter.concat(tmpList);
                                //子账户状态为01是注销状态，点击余额链接，
                                // 如果账户下所有子账户都为注销，则显示无余额，否则只显示有余额的子账户。
                                $.each(filter,function(i,o){
                                    //将有余额的子账户过滤出来。
                                    if(o.status != "01"){
                                      rslist.push(o);
                                    }
                                });
                                var el = $.tmpl(ejs,{list:rslist,isMedicalAccount:isMedicalAccount,accountId:accountId,isperiodical:isperiodical,accountType:accountType,fixedAccount:fixedAccount,nolist:rslist.length > 0 ?[]:[{}]});//nolist 查询无数据ejs中占位用								
                                $(obj).parent().parent().after(el.html());
								CU.changeLan($(obj).parent().parent().siblings("*[aid='"+accountId+"']"));
								$(obj).attr("balance_"+accountId,"true");
							}
						});	
					}
				}else{
					if(data && data.response && data.response[0].error && data.response[0].error.code && (data.response[0].error.code =='AccQueryDetailAction.NoSubAccount')){
						$.get(_t.ejsPath.balance, {}, function(ejs){
							if(ejs){
								var accountDetaiList=[], object = {};
								object.availableBalance = CU.getDictNameByKey('l7606');
								accountDetaiList.push(object);
								var el = $.tmpl(ejs,{nolist:accountDetaiList,isMedicalAccount:isMedicalAccount,accountId:accountId,isperiodical:isperiodical,list:[]}); //list 查询失败，显示查询无数据，ejs中占位用
								$(obj).parent().parent().after(el.html());
								CU.changeLan($(obj).parent().parent().siblings("*[aid='"+accountId+"']"));
								$(obj).attr("balance_"+accountId,"true");
							}
						});	
					}else{
						CU.ajaxDataHandle(data);
					}
				}
			});
		},
		//补登余额
		supplyBalance:function(obj){
			var _t = this;
			var accountId = $(obj).attr("accountId");
			Common.LightBox.show();
			Common.postRequest(new Model("PsnFinanceICAccountDetail", {accountId:accountId})).then(function(data) {
				var result =  CU.ajaxDataHandle(data);
				Common.LightBox.hide();
				if(result){
					$.get(_t.ejsPath.supplyBalance,null,function(ejs){
						if(ejs){
							var el = $.tmpl(ejs,{list:[result],accountId:accountId});
							$(obj).parent().parent().after(el.html());
							CU.changeLan(_t.el.find("tr.supplyBalance_"+accountId));
						}
					});	
				}
			});	
		},	
		exchangeCard: function(obj){
			var _t = this;
			//先获取传递过来的参数
			var accountNumber =  $(obj).attr("accountNumber");
			var accountId = $(obj).attr("accountId");
			var accountType=$(obj).attr("accountType");
			var accountIbkNum = $(obj).attr("accountIbkNum");
			var nickName =$(obj).attr("nickName");
			//登录人员的名字
			var customerName = Common.currentUser.customerName;
			var params={
					accountNumber:accountNumber,
					accountType:accountType,
					accountIbkNum:accountIbkNum,
					nickName:nickName,
					accountId:accountId,
					customerName:customerName
			};
			//先显示遮罩
			Common.LightBox.show();
			Common.postRequest(CU.createConversation()).then(function(data){
				//会话ID
				_t._conversationId = CU.ajaxDataHandle(data);
				if(_t._conversationId){
					Common.postRequest(new Model("PsnQueryCustomerInfoByCard", {accountId:accountId},_t._conversationId),new Model("PsnCommonQueryAllChinaBankAccount")).
					then(function(data2){
						var result = CU.ajaxDataHandle(data2,0);
						var rst = CU.ajaxDataHandle(data2,1);//为了使用省行联行号
						if(result){
							$.each(rst,function (i,x){
								_t._hashTable.add(x.accountId, x);
							});
						//初始网点名称
						var cardFetchOrgName = result.cardFetchOrgName;
						var cardFetchOrg = result.cardFetchOrg;
						var cardFetchAddress = result.cardFetchOrgAddress;
						var telphoneNum = result.cardFetchOrgPhone;
						var resetParams={
							cardFetchOrgName:cardFetchOrgName,
							cardFetchOrg:cardFetchOrg,
							cardFetchAddress:cardFetchAddress,
							telphoneNum:telphoneNum
						};
//						var cardEmitIbknum = result.cardEmitIbknum;
						var cardEmitIbknum = _t._hashTable.item(accountId).accountIbkNum;
						result.cardChangeTime=(function (ct){
							var arr=ct.split(""),index=0;
						      for(var i=0,j=arr.length;i<j;i++){
						        if(arr[i]!="0"){
						          index=i;
						          break;
						        }
						      }
						      return ct.substring(index);
						})(result.cardChangeTime);
						//去掉领卡网点名称的前后空格
					result.cardFetchOrgName	= result.cardFetchOrgName.replace(/(^\s*)|(\s*$)/g, "").replace(/(^[' '|'　']*)|([' '|'　']*$)/g,"");
						_t.el.html(_t.ejsPath.exchangeCardMain,{result:result,params:params},function(){
							_t.el.find("#div_21323_66063").attr("cardFetchOrg", cardFetchOrg);
							Common.LightBox.hide();
							//点击查询余额按钮
							_t.el.find("#btn_querybalance_66076").on("click",function(){
								_t.queryBalance(accountId);
							});
							//更换领卡网点
							_t.el.find("#btn_null_66067").on("click",function(){
								_t._exchangeBranch(cardEmitIbknum,_t._conversationId);
							});
							//点击下一步
							_t.el.find("#btn_nextstep_66068").on("click",function(){
								params.costFee= result.costFee;
								params.cardFetchOrgAddress = _t.el.find("#div_address_66064").text();
								params.cardFetchOrgPhone = _t.el.find("#div_phone_66065").text();
								//新卡产品类型
								params.newCardICFlag = result.newCardICFlag;
								params.oldCardName = result.oldCardName;
								params.newCardName = result.newCardName;
								params.cardChangeTime = result.cardChangeTime;
								
								_t._exchange_next(params);
							});
							//重置
							_t.el.find("#btn_reset_66069").on("click",function(){
								_t._resetExchange(resetParams);
							});
							
							CU.changeLan(_t.el.find("#div_exchange_main"));
							_t.el.find("#div_exchange_main").show();
						});
					}else{
						Common.LightBox.hide();
					}	
					});
				}else{
					Common.LightBox.hide();
				}
			});
		},
		//预约换卡查询余额
		queryBalance:function(exchangeId){
			var _t = this;
			//先显示遮罩
			Common.LightBox.show();
			//根据账户Id查询出来账户余额信息
			Common.postRequest(new Model("PsnAccountQueryAccountDetail", {accountId:exchangeId})).then(function(data){
				var rst = CU.ajaxDataHandle(data);
				if (rst) {
                    _t.el.append(_t.ejsPath.queryCurrentBalance, { accountDetaiList: rst.accountDetaiList }, function() {
                        var pop = _t.el.find("#div_balance_query");
                        // 绑定关闭事件
                        _t.el.find("a.close,#btn_close_14727").on("click", function () {
                            pop.remove();
                            Common.LightBox.hide();
                        });
                        CU.changeLan(pop);
                        CU.setObjAbsCenter(pop);
                    });

                }else{
                	Common.LightBox.hide();
                }
			});
		},
		//更换换卡网点
		_exchangeBranch:function(cardEmitIbknum,conversationId){
			var _t = this;
			//加载页面时先显示遮罩
			Common.LightBox.show();
			//根据领卡机构，查询出该机构对应其它网点
				_t.el.append(_t.ejsPath.exchangeBranch,{"cardEmitIbknum":cardEmitIbknum},function(){
					//点击查询时
					_t.el.find("#btn_49_66253").on("click",function(){
						//先获取输入框的值
						var areaKeyWords=_t.el.find("#txt_null_66255").val();
						var currentIndex = "0";//当前页
						var params={
								proIbkNum:cardEmitIbknum,
								areaKeyWords:areaKeyWords,
								pageSize:10,//每页现显示条数
								currentIndex:currentIndex//当前页
								
						};
						var modelBranch = new Model("PsnQueryBancInfo", params,conversationId);
						Common.postRequest(modelBranch.findPage(1,10),new Model("PsnQueryTotalNumberOfBanc", params)).then(function(data){
							var result = CU.ajaxDataHandle(data);
							//返回请求的总记录条数
							var result2 = CU.ajaxDataHandle(data,1);
							if(result&&result.length>0){
								_t.el.find("#query_detailed").html("").html(_t.ejsPath.branchResult,{"resultList":result},function(){
									_t.paging(_t.ejsPath.branchResult,modelBranch,"#query_detailed",'#exchangeBranch_data_foot', result2.totalNumber, 1);
									//点击选择时，去除遮罩，改变领卡网点名称
									_t.el.find(".td-a").on("click",function(){
										var branchName =$(this).attr("branchName").replace(/(^\s*)|(\s*$)/g, "").replace(/(^[' '|'　']*)|([' '|'　']*$)/g,"");
										var cardFetchOrg = $(this).attr("cardFetchOrg");
										var cardFetchOrgPhone=$(this).attr("cardFetchOrgPhone");
										var cardFetchOrgAddress=$(this).attr("cardFetchOrgAddress");
										_t.el.find("#div_branch_query").remove();
										_t.el.find("#div_21323_66063").text(branchName);
										_t.el.find("#div_phone_66065").text(cardFetchOrgPhone);
										_t.el.find("#div_address_66064").text(cardFetchOrgAddress);
										_t.el.find("#div_21323_66063").attr("cardFetchOrg", cardFetchOrg);
										Common.LightBox.hide();
									});
									CU.changeLan(_t.el);
									
								});
							}else{
								_t.el.find("#query_detailed").html("");
								$("#exchangeBranch_data_foot").hide();
								CU.changeLan(_t.el);return false;
							}
						});
					});
					var pop = _t.el.find("#div_branch_query");
					//绑定关闭事件
					_t.el.find(".close").on("click",function(){
						pop.remove();
                        Common.LightBox.hide();
					});
					CU.changeLan(pop);
					CU.setObjAbsCenter(pop);
				});
			
		},
		//预约换卡点击下一步
		_exchange_next:function(params){
			if (!formValid.checkAll("#div_exchange_main")) return;
			var _t = this;
			//客户名称
			params.accountName = _t.el.find("#div_clientname_66062").html();
			//客户英文名称
			// p502变更
			params.englishname = "";//_t.el.find("#txt_null_66070").val();
			//手机号
			params.phoneNumber = _t.el.find("#txt_null_66071").val();
			params.cardFetchOrgName = _t.el.find("#div_21323_66063").html();
			params.cardFetchOrg = _t.el.find("#div_21323_66063").attr("cardFetchOrg");
			Common.LightBox.show();
			//首先申请token
			Common.postRequest(CU.createTokenId(_t._conversationId)).then(function(tokenId) {
				var token = CU.ajaxDataHandle(tokenId);
				//点击确定
				if(token){			
					params.token=token;
					_t.el.find("#div_exchange_Confirm").html("").html(_t.ejsPath.exchangeConfirm,params,function(){
						_t.el.find("#div_exchange_main").hide();
						_t.el.find("#div_exchange_Confirm").show();
						Common.LightBox.hide();
						//点击确定
						_t.el.find("#p_21294_66239").on("click",function(){
							_t._exchangeConfirm(params);
						});
						//点击上一步
						_t.el.find("#btn_forward_66238").on("click",function(){
							_t.el.find("#div_exchange_Confirm").hide();
							_t.el.find("#div_exchange_main").show();
						});
						CU.changeLan(_t.el.find("#div_exchange_Confirm"));
					});
				}else{
					Common.LightBox.hide();
				}
			});
			
		},	
		//预约换卡点击确定
		_exchangeConfirm:function(params){
			var _t = this;
			Common.LightBox.show();				
					Common.postRequest(new Model("PsnExchangeCardReservation", params,_t._conversationId)).then(function(data){
						var result = CU.ajaxDataHandle(data);
						if(result){
							_t.el.html("").html(_t.ejsPath.exchangeCardResult,{"result":result,"cardInfo":params},function(){
								Common.LightBox.hide();
								//点击返回时
//								_t.el.find("#btn_return_66249").on("click",function(){
//									Common.triggerAction("AccountOverview");
//								});
								CU.changeLan(_t.el.find("#div_cardResult"));
							});
						}else{
							Common.LightBox.hide();
						}
					});
		},
		/**
		 * @author xlgui
		 * @Method payRollQuery 工资单主页
		 * @param el  当前标签对象
		 */
		payRollQuery:function(el){
			var _t=this,accNumber=$(el).attr("accountNumber"),accountId=$(el).attr("accountId"),params={};
			Common.LightBox.show();
			DateUtil.getCurrentTime(function(date){
				var curTime=new Date(date.date),curYear=curTime.getFullYear();
				curTime.setDate(1);
				var changeTime=new Date(date.date),changeYear=changeTime.getFullYear(),yearList=[];
				changeTime.setDate(1);
				var toTime=new Date(date.date);
				toTime.setDate(1);
				//需求要求只能查询24个月内的工资单，由于包括当前月，因此减去23
				toTime.setMonth(toTime.getMonth()-23);
				while(changeYear>=toTime.getFullYear()){
					//针对存在的年映射一个数组
					params["year_"+changeYear]=[];
					yearList[yearList.length]={key:changeYear,val:changeYear};
					changeYear--;
				}
				while(curTime>=toTime){
					var curMonth=curTime.getMonth()+1;
					var month=curMonth>=10?(curMonth).toString():"0"+curMonth;
					//把月放进当前年的数组里
					params["year_"+curYear].push({key:month,val:month});
					curTime.setMonth(curTime.getMonth()-1);
					curYear=curTime.getFullYear();
				}
				_t.el.append(_t.ejsPath.payRollMain,{"accNumber":accNumber},function(){
					var pop=_t.el.find("#payrollMain");
					_t._year_itSelect=new ITSelect({
						data :yearList,
						appendTo : _t.el.find("#sel_year").empty(),
						oddCls : "even",
						callback : function(e){
							var monthList=params["year_"+e.val];
							_t._month_itSelect=new ITSelect({
								data :monthList,
								appendTo : _t.el.find("#sel_month").empty(),
								defValue : monthList[0].key,
								defText  : monthList[0].val,
								oddCls   : "even"
							});
						}
					});
					_t._year_itSelect.setValue(yearList[0].key);
					//查询工资单
					_t.el.find("#btn_query_roll").on("click",function(){
						_t.queryRoll({
							"accountId":accountId,
							"payrollDate":_t._year_itSelect.val+"/"+_t._month_itSelect.val
						});
					});
					CU.changeLan(pop);
					CU.setObjAbsCenter(pop);
					pop.show();
					//关闭
					pop.find("a.close").on("click",function(){
						pop.remove();
						Common.LightBox.hide();
					});
				});
			});
		},
		/**
		 * @author xlgui
		 * @Method queryRoll  查询工资单
		 * @param  params     上送参数
		 */
		queryRoll:function(params){
			var _t=this;
			//27 PsnQueryPayrollInfo查询工资单信息(接口文档：I02银行账户)
			Common.request(new Model("PsnQueryPayrollInfo",params),function(list){
				var listId=_t.el.find("#roll_list");
				if(list&&list.length){
					for(var i=0,len=list.length;i<len;i++){
						var aList=list[i].payrollInfo.split("|"),aa={},rollList=[];
						for(var j=1,jLen=aList.length;j<=jLen;j++){
							var bList=aList[j-1].split(","),mode=j%4;
							if(mode){//当mode为1、2、3时
								aa["rollName"+mode]=bList[0];
								aa["rollAccount"+mode]=bList[1];
								if(j==jLen){//当mode不为0但已经是最后一个数据时
									rollList.push(aa);
									aa={};
								}
							}else{//当mode为0时
								aa["rollName4"]=bList[0];
								aa["rollAccount4"]=bList[1];
								rollList.push(aa);
								aa={};
							}
						}
						list[i].payrollInfo=rollList;
					}
				}
				listId.html(_t.ejsPath.payRollList,{"list":list}, function () {
                    CU.changeLan(listId);
                    listId.show();
                    if(list&&list.length>1){
	                    //工资单展现/隐藏
	                    listId.find("a.icon-open,a.icon-close").on("click",function(){
	                    	if($(this).hasClass("icon-open")){//如果当前数据是已经展开的，屏蔽其操作
	                    		return false;
	                    	}
	                    	listId.find("a").removeClass().addClass("icon-close");
	                    	listId.find(".mah150").hide();
							$(this).removeClass().addClass("icon-open")
								   .closest("table.tb")
								   .next("div.tb-con").show();
	                    });
                    }
                });
			});
		},
		/**
		 * @author xlgui
		 * @Method isPayrollAccount  判断是否为工资单账户
		 * @param allAccount 所有账户
		 * @param callback   回调函数
		 */
		isPayrollAccount:function(allAccount,callback){
			var currList=[],creditList=[],
				filterData=function(){
					var list=[],len=0,flag=Common.payRollParams.interfaceFlag,//接口返回成功
						getList=function(filterList,p){
							if(flag){//接口返回成功
								var backFlag=true;
								for(var j=0;j<len;j++){
		    						if(list[j].accountId==p.accountId){
		    							backFlag=false;
		    							p.payrollAccountFlag=true;
		    							filterList.push(p);
		    							break;
		    						}
		    					}
								if(backFlag){
									p.payrollAccountFlag=false;
									filterList.push(p);
								}
							}else{//接口返回报错
								p.payrollAccountFlag=false;
								filterList.push(p);
							}
						};
					if(flag){
						list=Common.payRollParams.list,len=list.length;
					}
	    			$.each(allAccount,function(i,p){
	    				switch(p.accountType){
		    				case "119":
							case "101":
							case "199":
							case "188"://活期
								getList(currList,p);
		    					break;
							case "103":
							case "104":
							case "107"://信用卡
								getList(creditList,p);
								break;
							default :
								break;
	    				}
	    			});
	    			callback&&callback(currList,creditList);
				};
			if(Common.payRollParams){
				filterData();
			}else{
				//26 PsnIsPayrollAccount判断是否工资单账户(接口文档：I02银行账户)
				Common.request({
		    		models:[new Model("PsnIsPayrollAccount")],
		    		dataHandle: false,
		    		showLoading: false,
		    		success:function(result){
		    			Common.payRollParams={
		    					"list":result,
		    					"interfaceFlag":true//接口返回成功
		    			};
		    		},
		    		fail:function (){
		    			Common.payRollParams={
		    					"interfaceFlag":false//接口返回报错
		    			};
		    		},
		    		complete:function(){
		    			filterData();
		    		}
			    });
			}
			
		},
		//重置预约换卡录入信息
		_resetExchange:function(params){
			var _t = this;
			_t.el.find("#txt_null_66070").val("");
			_t.el.find("#txt_null_66071").val("");
			_t.el.find("#div_21323_66063").html((params.cardFetchOrgName.replace(/(^\s*)|(\s*$)/g, "").replace(/(^[' '|'　']*)|([' '|'　']*$)/g,"")));
			_t.el.find("#div_21323_66063").attr("cardFetchOrg",params.cardFetchOrg);
			_t.el.find("#div_address_66064").text(params.cardFetchAddress);
			_t.el.find("#div_phone_66065").text(params.telphoneNum);

			
		},
		//分页
        paging: function (tablePath,model,tableDivId,footDivId,recordNumber,pageIndex) {
            var _t = this;
            var pagerParam = {
                canvas: footDivId,
                callbackFn: function (i) {
            	  Common.LightBox.show();
				  Common.postRequest(model.findPage(i,10)).then(function (data, status) {
                      var result = CU.ajaxDataHandle(data);
                      Common.LightBox.hide();
                      if (result&&result.length>0) {
                      	_t.el.find(tableDivId).html(tablePath,{ "resultList": result }, function () {
                              _t.paging(tablePath,model,tableDivId,footDivId,recordNumber,i);
                              //点击选择时，去除遮罩，改变领卡网点名称
									_t.el.find(".td-a").on("click",function(){
										var branchName =$(this).attr("branchName");
										var cardFetchOrg = $(this).attr("cardFetchOrg");
										var cardFetchOrgPhone=$(this).attr("cardFetchOrgPhone");
										var cardFetchOrgAddress=$(this).attr("cardFetchOrgAddress");
										_t.el.find("#div_branch_query").remove();
										_t.el.find("#div_21323_66063").text(branchName);
										_t.el.find("#div_phone_66065").text(cardFetchOrgPhone);
										_t.el.find("#div_address_66064").text(cardFetchOrgAddress);
										_t.el.find("#div_21323_66063").attr("cardFetchOrg", cardFetchOrg);
										Common.LightBox.hide();
									});		                      
                              CU.changeLan(_t.el.find(tableDivId));
                          });
                      } else {
                          _t.el.find(footDivId).empty();
                          _t.el.find(footDivId).hide();
                      }
                  });
                },
                pageIndex: pageIndex,
                point: _t,
                recordCount: recordNumber,
                pageSize:10
            };
            var pg = Pager.getInstance();
            pg.init(pagerParam);
            $(footDivId).show();
        },
		//冻结止付
		freeze:function(accountNumber){
			var _t = this;
			var account = _t._hashTable.item(accountNumber);
			_t.el.html(_t.ejsPath.freeze,{account:account},function(){
				Common.SF.showSelector("PB010C", function () {
					_t.el.find("#div_freeze_input").show();
					CU.changeLan(_t.el);
					_t._conversationId = Common.SF.get("conversationId");
					if(_t._conversationId){
						//冻结止付按钮事件
						_t.el.find("#btn_freeze_107023").on("click",function(){
							//是否选择安全工具
							if (!Common.SF.check()) return false;
							var sfNum=_t.el.find("input[name='rd_choose_security_tool_17637']:checked").val();
							var lossDays = _t.el.find("input[type='radio']:checked").val();
							Common.postRequest(new Model("PsnAccountLossReportConfirm", {accountNumber:accountNumber,_combinId:Common.SF.get("combinId")},_t._conversationId)).then(function(data) {
								var result = CU.ajaxDataHandle(data);
								if(result){
									_t.el.find("#div_freeze_confirm").html(_t.ejsPath.freezeConfirm,{account:account,lossDays:lossDays},function(){
										_t.el.find("#div_freeze_input").hide();
										//上一步按钮
										_t.el.find("#btn_forward_107028").on("click",function(){
											_t.el.find("#div_freeze_input").show();
											_t.el.find("#div_freeze_confirm").hide();
										});
										_t.el.find("#btn_confirm_107027").off("click");
										Common.SF.appendInputTo("#div_freeze_confirm ul.layout-lr",function(){
											_t.el.find("#div_freeze_confirm").show();
											CU.changeLan(_t.el.find("#div_freeze_confirm"));
											//确认按钮事件
											_t.el.find("#btn_confirm_107027").on("click",function(){
												//校验表单
												if(!formValid.checkAll(_t.el)) return false;
												Common.postRequest(CU.createTokenId(_t._conversationId)).then(function(tokenId) {
													var token = CU.ajaxDataHandle(tokenId);
													if(token){
														var smc = Common.SF.get("Smc");
														var otp = Common.SF.get("Otp");
														var params = {
																accountId:account.accountId,
																accountNumber:accountNumber,
																lossDays:lossDays,
																Name:Common.currentUser.customerName,
																token:token
														};
														// 有手机验证码
									                    if (smc) {
									                        $.extend(params, {
									                            activ: smc.Version,
									                            state: smc.State,
									                            Smc: smc.Value,
									                            Smc_RC: smc.RandomKey_C
									                        });
									                    }
									                    // 有动态口令
									                    if (otp) {
									                        $.extend(params, {
									                            activ: otp.Version,
									                            state: otp.State,
									                            Otp: otp.Value,
									                            Otp_RC: otp.RandomKey_C
									                        });
									                    }
									                    //签名
												    	var signedData = Common.SF.get("signedData");
												    	if(signedData){
												    		if(signedData.result){
												    			params._signedData = signedData.result;
												    		}else{
												    			return false;
												    		}
												    	}
														Common.postRequest(new Model("PsnAccountLossReportResult", params,_t._conversationId)).then(function(res) {
															CU.ajaxDataHandle(res);
															//是否成功
															if(res.response[0].status==ajaxSuccessStatusCode){
																_t.el.find("#div_freeze_success").html(_t.ejsPath.freezeSuccess,{account:account,lossDays:lossDays},function(){
																	_t.el.find("#div_freeze_confirm").hide();
																	CU.changeLan(_t.el.find("#div_freeze_success"));
																}).show();
															}
														});
													}
												});
											});
										},result);
									});
								}
							});
						});
					}
				});
			});
		},
		crcdBalance:function(_el){
			var _t=this,
				accountNumber=_el.attr("accountNumber"),
				accountId=_el.attr("accountId");
			if(_el.closest("tr").hasClass("exp_open")){
				_el.closest("tr").removeClass("exp_open");
				_el.closest("table").find("tr.crcd-balance-"+accountId).remove();
				
				return false;
			}
			Common.LightBox.show();
			Common.request(new Model("PsnCrcdCurrencyQuery", {"accountNumber":accountNumber+""}),function (rst){
				 var crcdAccountDetail=[],models=[];
				 if(rst.currency1 && rst.currency1.code){
					 models.push(new Model("PsnCrcdQueryAccountDetail", {"accountId": accountId,"currency":rst.currency1.code}));
				 }
				 if(rst.currency2 && rst.currency2.code){
					 models.push(new Model("PsnCrcdQueryAccountDetail", {"accountId": accountId,"currency":rst.currency2.code}));
				 }
				 var recursion=function(modNum){
					 Common.request(models[modNum],function(rst){
						 crcdAccountDetail=crcdAccountDetail.concat(rst.crcdAccountDetailList);
						 if(modNum==models.length-1){
							 $.get(_t.ejsPath.crcdBalance, function(ejs){
								 var el=$.tmpl(ejs,{list:crcdAccountDetail,accountId:accountId});
								 _el.parent().parent().after(el.html());
								 _el.closest("tr").addClass("exp_open");
								 CU.changeLan(_el.closest("table"));
								 Common.LightBox.hide();
							 });
						 }else{
							 recursion(++modNum);
						 }
					 },function(){
						 
						 ++failNum;
						 //如果失败的个数等于总model的长度 也就是说都失败了
						 if(failNum==models.length){
							 Common.LightBox.hide();
						 }
						 //如果当个model的索引数小于总model的个数时才继续回调
						 if(modNum<models.length-1){
							 recursion(++modNum);
						 }
					 });
				 },failNum=0;
				 recursion(0);
			},function(){
				Common.LightBox.hide();
			});
		},
		//
		crdLos:function(accountNumber){
			var _t=this,atx=_t._hashTable.item(accountNumber);
			Common.LightBox.show();
			_t.el.append(_t.ejsPath.popLossMain, atx, function() {
				Common.SF.showSelector("PB060D2", function() {
					var pop = _t.el.find("#crcd_loss_zx_1352");
					//下一步
					_t.losspop=_t.el.find("#crcd_loss_1605");
					pop.find("#btn_nextstep_loss_zq_30978").on("click",function(){
						var type=pop.find("input[name='rd_lost_1102']:checked").val();
						if(!Common.SF.check()){
							return false;
						}
						if(!type){
							Common.LightBox.showMessage(CU.getDictNameByKey("l0105")+CU.getDictNameByKey("l2666"));
							return false;
						}
						var parasm = {
							accountId:atx.accountId+"",
							_combinId: Common.SF.get("combinId")
						};
						_t._lossArgs=parasm;
						_t._lossArgs.type=type;
						_t._lossArgs.cardDescription=atx.cardDescription;
						_t._lossArgs.nickName=atx.nickName;
						_t._lossArgs.accountNumber=atx.accountNumber;
						Common.LightBox.show();
						// p601批次新增信用卡挂失收费试算
						Common.request(new Model("PsnCrcdReportLossFee",{accountId:atx.accountId+""}),function(rstLost){
							Common.request(new Model("PsnCrcdReportLossConfirm",parasm,Common.SF.get("conversationId")),function(rst){
								$.extend(_t._lossArgs,rstLost);
								if(type=="0"){
									_t.lossConfirm(rst);
								}else{
									Common.request(new Model("PsnCrcdQueryCardholderAddress",{accountId:atx.accountId+""},Common.SF.get("conversationId")),function(rstAddress){
										rst.mailAddressType = rstAddress.mailAddressType;
										rst.mailAddress = rstAddress.mailAddress;
										_t._lossArgs.mailAddressType=rstAddress.mailAddressType;
										_t._lossArgs.mailAddress=rstAddress.mailAddress;
										_t.lossConfirm(rst);
									});
								}
							},function(){
								Common.LightBox.hide();
							});
						},function(){
							Common.LightBox.hide();
						});
					});
					CU.changeLan(pop);
					CU.setObjAbsCenter(pop.show());
					pop.find("#btn_close_loss_zq_1166,a.close").on("click",function(){
						_t.losspop.remove();
						Common.LightBox.hide();
					});
				},"#lost_stool-selector");
			});
		},
		lossConfirm:function(rst){
			var _t=this;
			_t.el.find("#crcd_loss_confirm_1352").html(_t.ejsPath.popLossConfirm, _t._lossArgs,function(){
				Common.SF.appendInputTo("#crcd_lost_ul_1436", function() {
					Common.request(CU.createTokenId(Common.SF.get("conversationId")),function(token){
						_t.lossToken =token ;
						var pop = _t.el.find("#crcd_loss_cf_zx_1352");
						//确认
						_t.el.find("#btn_conf_loss_zq_30978").on("click",function(){
							if(!formValid.checkAll("#crcd_lost_ul_1436")){ 
								return false;
							}
							_t.lossSubmit();
						});
						//关闭
						_t.el.find("a.close").on("click",function(){
							_t.losspop.remove();
							Common.LightBox.hide();
						});
						//上一步
						_t.el.find("#btn_conf_prev_loss_zq_1441").on("click",function(){
							_t.el.find("#crcd_loss_zx_1352").show();
							_t.el.find("#crcd_loss_confirm_1352").hide();
						});
						CU.changeLan(pop);
						_t.el.find("#crcd_loss_zx_1352").hide();
						_t.el.find("#crcd_loss_confirm_1352").show();
						CU.setObjAbsCenter(pop);
						Common.LightBox.hide();
					});
				}, rst);
			});
		},
		lossSubmit:function(){
			var _t=this,
			param = {
				accountId: _t._lossArgs.accountId,
				selectLossType: _t._lossArgs.type,
				mailAddressType: _t._lossArgs.mailAddressType,
				mailAddress: _t._lossArgs.mailAddress
			};
			// 如果反欺诈开启, 参数带上设备指纹, by 梁永宁
			if (Common.AC.enabled) {
				param.devicePrint = encode_deviceprint();
			}
			
			if(!Common.SF.getData(param)){
				return false;
			}
			param.token = _t.lossToken;
			
			Common.request(new Model("PsnCrcdReportLossResult",param,Common.SF.get("conversationId")),function(rst){
				_t.preventForSwindlePostLoss(rst,Common.SF.get("conversationId"));
			},function(){
				Common.request(CU.createTokenId(Common.SF.get("conversationId")),function(token){
					_t.lossToken=token;
				});
			});
		},
		//
		preventForSwindlePostLoss:function(rst,conversationId){
			var _t=this;
			_t.ac=new Common.AC({
				data: rst,
				el: _t.el,
				conversationId: conversationId,
				ok: function (enableOK) {
					Common.postRequest(new Model("PsnCrcdReportLossResultReinforce", _t.ac.get(),conversationId)).then(function (data) {
						_t.ac.ajaxDataHandle(data);
						if (CU.isSuccesful(data)) {
							_t.ac.hide();
							_t.lossSuccess();
						}
						enableOK();
					});
					
				}
			});
			if (_t.ac.result === "ALLOW") {
				_t.ac.hide();
				_t.lossSuccess();
			}
		},
		//
		lossSuccess:function (){
			var _t=this;
			_t.el.find("#crcd_loss_rst_1352").html(_t.ejsPath.popLossSuccess, {
				accountNumber: _t._lossArgs.accountNumber,
				selectLossType: _t._lossArgs.type
			}, function() {
				var pop = _t.el.find("#crcd_loss_sc_zx_1352");
				//关闭
				_t.el.find("#btn_suc_loss_zq_1534,a.close").on("click",function(){
					Common.LightBox.hide();
					_t.losspop.remove();
				});
				CU.changeLan(pop);
				_t.el.find("#crcd_loss_confirm_1352").hide();
				_t.el.find("#crcd_loss_rst_1352").show();
				CU.setObjAbsCenter(pop);
			});
		},
		/**
		 * 电子卡转账功能
		 * @param accNum 电子卡号
		 */
		_elec_transfer:function(accNum){
			var _t = this,accObject = _t._hashTable.item(accNum),/*当前选中账户参数对象*/accountId=accObject.accountId.toString();
			Common.LightBox.show();
			//创建会话
	    	Common.requestInterface(new Model("PSNCreatConversation"),function(conid){
	    		_t._conversationId=conid;
	    		//4.3 003 查询账户详情
	    		Common.requestInterface(new Model("PsnAccountQueryAccountDetail",{"accountId":accountId}),function(data){
	    			var balanList=data.accountDetaiList,len=balanList.length,obj=null;
	    			for(var i=0;i<len;i++){
	    				obj=balanList[i];
	    				if(obj.currencyCode=="001"){
	    					accObject.availableBalance=obj.availableBalance;
	    					//remainde_balance剩余可用余额用于显示立即执行时结果页账户剩余额度
							_t.remainde_balance=obj.availableBalance;
	    					break;
	    				}
	    			}
	    			if("availableBalance" in accObject){//当账户存在人民币时
	    				/**
	    				 * payeeaccountType  交易账户类型
	    				 * M：他行卡号，N：他行账号，C：中行借记卡卡号，D：中行存款账号， X：中行信用卡卡号
	    				 */
	    				_t._bocArr = ["C","D","X"];//中行账户
	    				//4.36 036 查询电子卡对应绑定卡信息(银行账户接口文档)
	    				Common.requestInterface(new Model("PsnCardQueryBindInfo",{"accountId":accountId}),function(data){
	    					var p={/*用于收集界面数据的对象*/
    							"accountNumber":accNum,                 //转出账户账号
    							"fromAccountId":accountId,              //转出账户ID
    							"accountType"  :accObject.accountType,  //转出账户类型
    							"nickName"     :accObject.nickName,     //别名
    							"accountIbkNum":accObject.accountIbkNum,//转出账户地区	
    							"accModeValue" :null,//1中行账户,2他行账户
    							"operaChannel" :"2", //1手动输入，2客户选择
    							"transModeValue":"0" //0普通转账,1实时转账
	    					},params=$.extend({},p);
	    					//显示电子转账主页面
	    					_t.el.html(_t.ejsPath.elecTransMain,accObject,function(){
	    						var elecTransMainId=_t.el.find("#elecTransferMain"),
	    							filtList=[],//转入账户类型
	    							amountIptId=elecTransMainId.find("#txt_transamount_1690");//金额输入框id
	    						//收款方账户类型
	    						elecTransMainId.find("input[name='rd_boc_27593']").on("click",function(){
	    							if(params.accModeValue==this.value){//当已经选中，再次点击时
	    								return false;
	    							}
	    							params.accModeValue=this.value;//1中行账户,2他行账户
	    							elecTransMainId.find("li.trans-mode,li.acc-opBName,li.acc-name,li.acc-bank").hide();//隐藏转账模式、开户行、收款人姓名,所属银行栏位
	    							//payeeaccountType :M：他行卡号，N：他行账号，C：中行借记卡卡号，D：中行存款账号， X：中行信用卡卡号
	    							if(params.accModeValue=="1"){//1中行账户
	    								//params.bankName="中国银行";
    									//动态加载安全工具
    									_t.loadFactor(params,"PB031");
    									filtList=["C","D","X"];
	    							}else{//2他行账户
	    								filtList=["M","N"];
	    								params.transModeValue="0";//0普通转账,1实时转账
	    								//动态加载安全工具
    									_t.loadFactor(params,"PB032");
	    							}
	    							//自定义“操作渠道”字段，用于控制是客户手动输入（参数为1）还是客户选择（参数为2）
	    							params.operaChannel="2";//默认客户选择
	    							//清空收款人姓名
	    							elecTransMainId.find("#txt_acc_card_name_1128").val("").removeClass("warning");
	    							//重置开户行
	    							elecTransMainId.find("#txt_addaccforbankname_1687").attr({"lan":"l90096","bankName":""});
				                	//重置所属银行
				                	elecTransMainId.find("#txt_addaccforbank_1664").attr({"lan":"l89613","payeecnaps":"","toBankCode":""});
									CU.changeLan(elecTransMainId.find("li.acc-opBName,li.acc-bank"));
									var bindAccObj={}/*绑定账户集合*/,itselectList=[];/*下拉数据*/
									//过滤数据
									$.each(data.cardQueryBindInfoList,function(i,p){
										if($.inArray(p.payeeaccountType,filtList)>-1){
											var accNum=p.payeeaccountNumber;
											bindAccObj[accNum]=p;
											itselectList.push({key:accNum,val:"<span>"+accNum+"</span>"});
										}
									});
									//加载转入账户下拉
	    							_t.loadAccItSelect(elecTransMainId, params,itselectList,bindAccObj);
	    						});
	    						//转账模式
	    						elecTransMainId.find("input[name='rd_trans_mode_1015']").on("click",function(){
	    							params.transModeValue=this.value;//0普通转账,1实时转账
									var addaccforbankId = elecTransMainId.find("#txt_addaccforbank_1664"),
										toBankCode=addaccforbankId.attr("toBankCode");
									elecTransMainId.find("li.acc-bank").show();//显示所属银行，开户行
									//普通转账
									if(params.transModeValue=="0"){//普通转账（需展现“所属银行、开户行”）
										elecTransMainId.find("li.acc-opBName").show();//显示所属银行，开户行
										//自定义“操作渠道”字段，用于控制是客户手动输入（参数为1）还是客户选择（参数为2）
										if(params.operaChannel=="1"){//手动输入
											if(toBankCode=="OTHER"){
												params.bankName="其他银行";
												addaccforbankId.attr({"payeecnaps":"","toBankCode":"OTHER","title":params.bankName,"bankName":params.bankName})
												.removeAttr("lan").text(params.bankName);
											}
											//重置开户行
						                	$("#txt_addaccforbankname_1687").attr({"lan":"l90096","bankName":""});
						                	CU.changeLan(elecTransMainId.find("li.acc-opBName"));
											//显示动态下拉开户行,所属银行
											elecTransMainId.find("#openingBankName,#bocBankName").hide().prev("div.posr").show();
										}else{//客户选择
											params.bankName="其他银行";//银行名称如果在常用银行里面，则显示常用银行名称，否则显示“其他银行”
											var bankList = Common.usualBankList;
											//判断所属银行是否在常用银行里,不在则显示“其他银行”
											for(var i=0;i<bankList.length;i++){
												if(bankList[i].toBankCode == params.bankCode){
													params.bankName = bankList[i].bankName;
													break;
												}
											}
											elecTransMainId.find("#bocBankName").text(params.bankName).show()
												.prev("div.posr").hide();
											elecTransMainId.find("#openingBankName").text(params.openingBankName).show()
												.prev("div.posr").hide();
										}
										elecTransMainId.find("#trans_mode0_tips").show();//展现普通转账提示
										elecTransMainId.find("#trans_mode1_tips").hide();//隐藏实时转账提示
										//动态加载安全工具
										_t.loadFactor(params,"PB032");
    								//实时转账
									}else{//实时转账（需展现“所属银行”）
										if(params.operaChannel=="1"){//手动输入账户
											if(addaccforbankId.attr("bankName")){//如果普通、实时转账选择过所属银行
												//["201","202","203","OTHER"];//实时转账不支持的银行
												if($.inArray(toBankCode,["201","202","203","OTHER"])>-1){
													//重置所属银行
													CU.changeLan(addaccforbankId.attr({"lan":"l89613","payeecnaps":"","toBankCode":""}).parent());
												}else{
													//如果普通转账里面的银行名称是实时转账里面的常用银行，那么payeecnaps需要进行修改
													for(var i=0,flag=true;i<Common.ActualTimeArr.length;i++){
														if(Common.ActualTimeArr[i].bankName==addaccforbankId.attr("bankName")){
															addaccforbankId.attr("payeecnaps",Common.ActualTimeArr[i].bankCode);
															flag=false;
															break;
														}
													}
													//如果没有查询到对应的银行则需要清空绑定的省联行号和银行名称
													if(flag){
														//重置所属银行
														CU.changeLan(addaccforbankId.attr({"lan":"l89613","payeecnaps":"","toBankCode":""}).parent());
													}
												}
											}
											//显示动态下拉开户行,所属银行
											elecTransMainId.find("#bocBankName").hide().prev("div.posr").show();
										}else{//客户选择
											params.bankName=params.payeeBankName;//收款人所属银行
											elecTransMainId.find("#bocBankName").text(params.bankName).show()
												.prev("div.posr").hide();
										}
										elecTransMainId.find("#trans_mode0_tips,li.acc-opBName").hide();//隐藏“转入账户开户行名称”字段
										elecTransMainId.find("#trans_mode1_tips").show();//展现实时转账提示
										//动态加载安全工具
										_t.loadFactor(params,"PB113");
										var amount =amountIptId.val().replace(/\,/g,'');
										if(!isNaN(amount) && amount>50000){
											Common.LightBox.showCallbackMessage({
    											"messageLan":"l91289",//实时转账的交易金额不能高于5万元，请您返回修改
    											"nodeId"    :amountIptId,
    											"inwordsId" :elecTransMainId.find("#capital_amount"),
    											"point"     :_t
    										});
										}
									}
	    						});
	    						//重置
	    						elecTransMainId.find("#btn_reset_1733").on("click",function(){
	    							params=$.extend({},p);
	    							amountIptId.val("").removeClass("warning");//清空金额
	    							elecTransMainId.find("#txt_postscript_1693").val("").removeClass("warning");//清空描述
									elecTransMainId.find("#capital_amount").html("-");//清空金额大写
									//默认加载“中行账户”
		    						elecTransMainId.find("#rd_boc_01").trigger("click");
								});
	    						//转账金额
	    						amountIptId.on("blur.check",function(){
	    							var amount=this.value.replace(/\,/g,'');
	    							if(!isNaN(amount)){
	    								//转账金额大于可用余额时
	    								if(amount>_t.remainde_balance){
	    									Common.LightBox.showCallbackMessage({
    											"messageLan":"l52989",//转账金额不可大于可用余额
    											"nodeId"    :amountIptId,
    											"inwordsId" :elecTransMainId.find("#capital_amount"),
    											"point"     :_t
    										});
	    								}else{
	    									//当为实时转账时，大于5万时
	    									//accModeValue :1中行账户,2他行账户
	    									//transModeValue :0普通转账,1实时转账
	    									if((params.accModeValue=="2" && params.transModeValue=="1")&&(amount>50000)){
	    										Common.LightBox.showCallbackMessage({
	    											"messageLan":"l91289",//实时转账的交易金额不能高于5万元，请您返回修改
	    											"nodeId"    :amountIptId,
	    											"inwordsId" :elecTransMainId.find("#capital_amount"),
	    											"point"     :_t
	    										});
	    									}
	    								}
	    							}
				                });
	    						//下一步
	    						elecTransMainId.find("#btn_nextstep_1314").on("click",function(){
	    							var _amt;
	    							if(!formValid.checkAll(elecTransMainId)) {return false;}
	    							//安全控件选择校验
	    							if (!Common.SF.check()){return false;}
	    							_amt=elecTransMainId.find("#txt_transamount_1690").val();
	    							//转账金额大于可用余额时
	    							if(_amt>_t.remainde_balance){
	    								//转账金额不可大于可用余额
	    								Common.LightBox.showMessage(CU.getDictNameByKey("l52989"));
	    								return false;
	    							}
	    							Common.PThirtyWanLimt(_t,{amount:_amt},function(){
	    								_t._next_elec_common(elecTransMainId,params);
	    							});
								});
	    						//加载点击所属银行信息
	    		                Common.LoadBankName(elecTransMainId);
	    		                //加载点击开户行信息
	    		                Common.LoadBranchName(elecTransMainId);
	    		                //金额大写显示
	    		                Common.upperAmount(_t,"#txt_transamount_1690","#capital_amount");
	    		                //缓存实时收款账户的省联行号 payeecnaps
	    		                Common.LoadActualTimeBank(function(){
	    		                	CU.changeLan(elecTransMainId.show());
	    		                	Common.LightBox.hide();
	    		                	//默认加载“中行账户”
	    		                	elecTransMainId.find("#rd_boc_01").trigger("click");
	    		                });
	    					});
	    				});
	    			}else{
	    				//抱歉！该账户无人民币币种，暂不支持此交易，请选择其他账户。
	    				Common.LightBox.showMessage(CU.getDictNameByKey("l44606"));
	    				Common.LightBox.hide();
	    			}
	    		});
			});
		},
		loadAccItSelect:function(elecTransMainId,params,itselectList,bindAccObj){
			var _t=this,
			    //accModeValue :1中行账户,2他行账户
				isBOCAccFlag=params.accModeValue=="1",//true中行账户 false他户账户
				firstLoadFlag=true,//该变量用于控制第一次加载手动输入
				listLen=itselectList.length,//下拉数据条数
				_inputipsId=elecTransMainId.find("#acc_input_tips").hide(),
				fromAccItselectId=elecTransMainId.find("#sel_bind_acc_1125");//转入账户下拉id
			//转入账户下拉
			new ITSelect({
				data : itselectList,
				appendTo : fromAccItselectId.attr({"val":"","title":""}).removeClass("warning").empty(),
				defValue : "",
				defText  : Common.ItSelectData.pleaseSelect,
				oddCls : "even",
				searchable:true,
				searchCallback:function(searchInputId){
					var point=this,
						_val="",radius02Id=elecTransMainId.find(".tips-radius02"),
						ulListNode=fromAccItselectId.find("ul.list"),
						minLen=(isBOCAccFlag?12:1),
						maxLen=(isBOCAccFlag?19:31),
						searchLen=listLen;//默认模糊查询条数
					_inputipsId.attr("replaceArr",minLen+"|"+maxLen);
					CU.changeLan(_inputipsId.parent());
					//为输入框重新定义事件
					searchInputId.attr({
						isHide:"false",//用于输入框blur后不隐藏
						minLength:minLen,//控制输入框的最小长度
	            		maxLength:maxLen//控制输入框的最大长度
					})
					.css({
						"margin-left":"0"
					})
					.on("blur",function(){
						if(_val){
							//该代码用于手动输入值后，下拉框不校验
							if(/^[0-9]*$/.test(_val)){
								if(isBOCAccFlag && _val.length<12){
									radius02Id.hide();
									fromAccItselectId.attr({"val":"","title":""}).addClass("warning");
									elecTransMainId.find("li.acc-name,li.acc-bank").hide();//隐藏收款人姓名,所属银行栏位
									_inputipsId.show();
								}else{
									//当前一次是手动输入，且输入框内容没有任何改动时，不重新渲染页面
									if(params.operaChannel=="1" && params.payeeActno==_val){
										point.iframe.hide();
										radius02Id.hide();
										return false;
									}
									_inputipsId.hide();
									fromAccItselectId.attr({"val"  :_val,"title":_val});
									params.payeeActno=_val;
									elecTransMainId.find("li.acc-name").show()//显示收款人姓名栏位
									      .find("#acc_custom_name").hide()// 隐藏div收款姓名
									      .prev().show().removeClass("warning");//回显收款人姓名输入框
									//自定义“操作渠道”字段，用于控制是客户手动输入（参数为1）还是客户选择（参数为2）
									params.operaChannel="1";
									if(isBOCAccFlag){
										params.bankName="中国银行";
										elecTransMainId.find("li.trans-mode").hide();//隐藏“转账模式”
										elecTransMainId.find("li.acc-bank").show()
											.find("#bocBankName").text(params.bankName).show()//显示银行名称
											.prev("div.posr").hide();//隐藏所属银行下拉框
									}else{
										if(firstLoadFlag){
											firstLoadFlag=false;
											//0普通转账,1实时转账
											elecTransMainId.find("li.trans-mode").show()//显示“转账模式”
												.find("#rd_trans_mode_"+params.transModeValue).trigger("click");//默认触发“普通转账”
										}
									}
								}
								//默认回请选择
								searchInputId.prev("label.txt").html("<span lan='l0092'>"+CU.getDictNameByKey("l0092")+"</span>");
							}else{
								fromAccItselectId.attr({"val":"","title":""}).addClass("warning");
								_inputipsId.show();
							}
						}else{
							if(params.operaChannel=="1"){//如果前一次操作下拉数据是手动输入
								if(listLen>0){
									elecTransMainId.find("li.trans-mode,li.acc-name,li.acc-bank,li.acc-opBName").hide();//隐藏收款人姓名,所属银行栏位
								}
								fromAccItselectId.attr({"val":"","title":""}).removeClass("warning");
							}
							_inputipsId.hide();
							searchInputId.hide().prev().show();//显示“请选择”
						}
						point.iframe.hide();
						radius02Id.hide();
					//由于输入框绑定的模糊查询事件不精确，因此释放重写keyup事件
					}).off("keyup").on("keyup",function(){
						_val=this.value.trim();
						if(listLen){//当存在下拉数据时
							if(_val){
								ulListNode.children("li").hide();
								var containNodes=ulListNode.children("li:contains('" + _val + "')");
								searchLen=containNodes.size();
								if(searchLen){
									point.iframe.css("height",ulListNode.height()+"px");
									ulListNode[searchLen>5?"addClass":"removeClass"]("sel-h");
									containNodes.show();
									ulListNode.show();
									radius02Id.hide();
								}else{
									point.iframe.hide();
									var ncard='';
									for(var n=0;n<_val.length;n=n+4){
										ncard += _val.substring(n,n+4)+" ";
									}
									elecTransMainId.find("#inputAccount").text(ncard.replace(/(\s*$)/g,""));
									ulListNode.hide();
									radius02Id.show();
								}
							}else{
								ulListNode.show().children("li").show();
								ulListNode[listLen>5?"addClass":"removeClass"]("sel-h");
								point.iframe.css("height",ulListNode.height()+"px");
								radius02Id.hide();
							}
						}else{
							ulListNode.hide();
							if(_val){
								var ncard='';
								for(var n=0;n<_val.length;n=n+4){
									ncard += _val.substring(n,n+4)+" ";
								}
								elecTransMainId.find("#inputAccount").text(ncard.replace(/(\s*$)/g,""));
								radius02Id.show();
							}else{
								radius02Id.hide();
							}
						}
					}).on("focus",function(){
						if(searchLen==0 && _val){//当模糊查询没有匹配项且输入框有值
							radius02Id.show();
						}else{
							if(listLen){
								point.iframe.css("height",ulListNode.height()+"px");
							}else{
								point.iframe.hide();
							}
						}
					});
				},
				callback : function(e) {//选择下拉数据回调函数
					_inputipsId.hide();
					firstLoadFlag=true;
					//自定义“操作渠道”字段，用于控制是客户手动输入（参数为1）还是客户选择（参数为2）
					params.operaChannel="2";
					$.extend(params,bindAccObj[e.val]);
					params.bankName=params.payeeBankName;//收款人所属银行
					params.payeeActno=params.payeeaccountNumber;//收款账号
					elecTransMainId.find("li.acc-name,li.acc-bank").show()//显示“收款人姓名，转入账户所属银行”字段
						.find("#acc_custom_name").text(params.payeeAccountName).show()//回显收款姓名
						.prev("input").hide();//隐藏收款人姓名输入框
					if($.inArray(params.payeeaccountType,_t._bocArr)>-1){//["C","D","X"];//中行账户
						params.accModeValue="1";
						params.bankName="中国银行";
						elecTransMainId.find("li.trans-mode,li.acc-opBName").hide();//隐藏转账模式,开户行栏位
						elecTransMainId.find("#bocBankName").text(params.bankName).show()//显示银行名称
							.prev("div.posr").hide();//隐藏所属银行下拉框
						//动态加载安全工具
						_t.loadFactor(params,"PB031");
					}else{//他户账户
						params.accModeValue="2";
						elecTransMainId.find("li.trans-mode").show()//显示“转账模式”
							.find("#rd_trans_mode_0").trigger("click");//默认触发“普通转账”
					}
				}
			});
			CU.changeLan(fromAccItselectId);
		},
		//电子卡转账确认页
		_next_elec_common:function(elecTransMainId,params){
//			if(!formValid.checkAll(elecTransMainId)) {return false;}
//			//安全控件选择校验
//			if (!Common.SF.check()){return false;}
			$.extend(params,{
				"remark":elecTransMainId.find("#txt_postscript_1693").val(),//附言
				"amount":elecTransMainId.find("#txt_transamount_1690").val()//转账金额
			});
			var _t = this,
				modelName="",/*接口名称*/
				bankId=elecTransMainId.find('#txt_addaccforbank_1664'),
				openBankNameId=elecTransMainId.find('#txt_addaccforbankname_1687'),
				p={
					"fromAccountId" :params.fromAccountId,     //转出账户ID
					"payeeActno"    :params.payeeActno,//转入账户账号
					"executeType"   :"0",   //执行类型0：立即执行1：预约日期执行2：预约周期执行
					"amount"        :params.amount,//转账金额
					"remittanceInfo":"",    //汇款用途
					"executeDate"   :"",    //执行日期
					"currency"      :"001", //币种
					"payeeMobile"   :""     //收款人手机号
				};
			//客户手动输入账户（参数为1）
			if(params.operaChannel=="1"){
				$.extend(params,{
					"payeeName" :elecTransMainId.find("#txt_acc_card_name_1128").val(),//收款人姓名
					"bankCode"  :bankId.attr("tobankcode"),//银行行别代码
					"payeeCnaps":bankId.attr("payeecnaps"),//联行号
					"toOrgName" :openBankNameId.attr("bankName"),//开户行
					"bankName"  :params.accModeValue=="1"?params.bankName:bankId.text()//银行名称
				});
				p.payeeName=params.payeeName;
			}else{//客户选择账户（参数为2）
				params.payeeName=Common.currentUser.customerName;//收款人姓名
				params.toOrgName=params.openingBankName;
				p.payeeName=params.payeeName;//收款人姓名
			}
//			//转账金额大于可用余额时
//			if(p.amount>_t.remainde_balance){
//				//转账金额不可大于可用余额
//				Common.LightBox.showMessage(CU.getDictNameByKey("l52989"));
//				return false;
//			}
			//1中行账户,2他行账户
			if(params.accModeValue=="1"){//1中行账户
				$.extend(p,{
					"remark"      :params.remark,//备注
					"payeeId"     :"",    //收款人ID
					"cycleSelect" :"",    //周期
					"startDate"   :"",    //起始日期
					"endDate"     :""     //结束日期
				});
				modelName="PsnTransBocTransferVerify";//4.2 002 中行内转账预交易
			}else{//他行账户
				if(params.operaChannel=="1" && !params.bankCode){
	            	// 收款人所属银行不能为空
	            	Common.LightBox.showCallbackMessage({"messageLan":"l87915","point":_t},function(){
	            		bankId.trigger("click");
	            	});
	            	return false;
	            }
				if(params.transModeValue=="0"){//0普通转账
					if(params.operaChannel=="1" && !params.toOrgName){
		            	// 收款人开户行不能为空
		            	Common.LightBox.showCallbackMessage({"messageLan":"l87916","point":_t},function(){
		            		openBankNameId.trigger("click");
		            	});
		            	return false;
		            }
					$.extend(p,{
						"remark"  :params.remark,//备注
						"payeeId" :""     //收款人ID
					});
					p.bankName =params.bankName;//转入银行名称
					//客户手动输入账户（参数为1）
					if(params.operaChannel=="1"){
						p.cnapsCode=params.payeeCnaps;//省行联行号
						p.toOrgName=params.toOrgName;//转入账户开户行名称
						params.cnapsCode=params.payeeCnaps;//省行联行号
					}else{//客户选择账户（参数为2）
						p.cnapsCode=params.cnapsCode;//省行联行号
						p.toOrgName=params.openingBankName;//转入账户开户行名称
					}
					modelName="PsnTransBocNationalTransferVerify";//4.1 国内跨行汇款预交易
				}else{//1实时转账
					$.extend(p,{
						"payeeActno2"   :p.payeeActno,//确认转入账号
						"memo"          :params.remark,//备注
						"sendMsgFlag"   :"",//向收款人发送短信通知
						"startDate"     :"",//预约周期执行开始日期
						"endDate"       :"",//预约周期执行结束日期
						"cycleSelect"   :"" ,//预约周期执行周期类型
						"payeeBankName" :params.bankName, //转入银行名称
						"payeeCnaps"    :params.payeeCnaps//省行联行号
					});
					//客户手动输入账户（参数为1）
					if(params.operaChannel=="1"){
						p.payeeOrgName  =params.bankName;     //转入账户开户行名称(实时转账时，上送的开户行名称就是所属银行名称)
						params.toOrgName=params.bankName;     //手动输入时，开户行就上送所属银行
					}else{//客户选择账户（参数为2）
						p.payeeOrgName  =params.openingBankName;//转入账户开户行名称
					}
					params.cnapsCode=p.payeeCnaps;
					modelName="PsnEbpsRealTimePaymentConfirm";//4.9 实时付款转账确认
				}
			}
			p._combinId=Common.SF.get("combinId");
			Common.LightBox.show();
			Common.requestInterface(new Model(modelName,p,_t._conversationId),function(data){
				//手续费试算
				_t.conmmissionCharge(params, function(result){
					Common.creatToken(_t._conversationId,function(token){
						_t._token=token;
						var elecTrsfConId=_t.el.find("#elecTransferConfirm");
						elecTrsfConId.html(_t.ejsPath.confirm_common,result,function(){
							Common.SF.appendInputTo("#input_container ul.layout-lr",function () {
								elecTransMainId.hide();
								CU.changeLan(elecTrsfConId.show());
								Common.LightBox.hide();
								//点击上一步
								elecTrsfConId.find("#btn_forward_4730").on("click",function(){
									elecTransMainId.show();
									elecTrsfConId.hide();
									Common.SF.clear();
								});
								//点击确定
								elecTrsfConId.find("#btn_confirm_4729").on("click",function(){
									if(!formValid.checkAll(elecTrsfConId)) {return false;}
									delete p._combinId;
									//accModeValue :1中行账户,2他行账户  /transModeValue :0普通转账,1实时转账
									if(params.accModeValue=="1" || params.transModeValue=="0"){//中行内转账或者跨行普通转账
										if(params.accModeValue=="1"){
											result.toAccountType = data.toAccountType;
											result.payeeBankNum  = data.payeeBankNum;
										}
										_t._elec_common_confirm(elecTrsfConId,result,p);//普通转账确定
									}else{//跨行实时转账
										_t._elec_Intime_confirm(elecTrsfConId,result,p);//实时转账确定
									}
								});
							},data);
						});
					});
				});
			});
		},
		/**
		 * 动态加载安全工具
		 * @param serviceId 服务码
		 */
		loadFactor:function(params,serviceId){
			//中行内转账服务码("PB031"),跨行普通转账服务码("PB032"),跨行实时转账服务码(PB113)
			if(params.serviceId !=serviceId){//当控件没有加载过，再加载
				params.serviceId=serviceId;
				Common.LightBox.show();
				Common.SF.showSelector(serviceId,function(){
					Common.LightBox.hide();
				},null,this._conversationId);
			}
		},
		//普通转账点击确定按钮
		_elec_common_confirm:function(prevEjsId,params,p){
			var _t = this,modelName="";/*提交接口*/
			if(!Common.SF.getData(p)){
				return false;
			}
			p.token = _t._token;
			//accModeValue :1中行账户,2他行账户 
			if(params.accModeValue=="1"){
				modelName="PsnTransBocTransferSubmit";
				$.extend(p,{
					"dueDate":"",//付款日期
					"payeeBankNum":params.payeeBankNum,//转入账户地区
					"toAccountType":params.toAccountType//转入账户类型
				});
			}else{
				modelName="PsnTransNationalTransferSubmit";//国内跨行汇款提交
				$.extend(p,{
					"dueDate":""//付款日期
				});
			}
			Common.LightBox.show();
			Common.request({
	    		models:[new Model(modelName,p,_t._conversationId)],
	    		dataHandle: false,
	    		showLoading: true,
	    		success:function(data){
	    			//经过和刘卫卫确认，电子卡转账无需调用加强认证接口
	    			$.extend(params,{
	    				"batSeq"          :data.batSeq ,         //转账批次号
	    				"transactionId"   :data.transactionId,   //网银交易序号
	    				"commissionCharge":data.commissionCharge,//手续费
	    				"executeDate"     :data.executeDate,
	    				"workDayFlag"     :data.workDayFlag||null
	    			});
	    			if(params.workDayFlag && params.workDayFlag !="1"){//1非工作日
	    				params.preCommissionCharge=data.finalCommissionCharge;
	    			}
	    			//立即执行剩余可用余额需要减去 优惠后的手续费
	    			params.remainde_balance=_t.remainde_balance-params.amount-Number(params.preCommissionCharge);
	    			var successId=_t.el.find("#elecTransferSuccess");
	    			successId.html(_t.ejsPath.success_common,params,function() {
	    				prevEjsId.hide();
	                	CU.changeLan(successId.show());
	                	Common.LightBox.hide();
	                	//打印按钮绑定事件
	                	successId.find("#btn_print_5549").on("click", function() {
	                		successId.find("div.border-box").printArea();
	                	});
	                	//取消
	                	successId.find("#btn_cancel_102404").on("click", function() {
	                		successId.hide();
                            _t.el.find("#elecTransferMain").show().find("#btn_reset_1733").trigger("click");
	    				});
	                });
	    		},
	    		fail:function (data){
	    			//跨行普通转账时捕获异常
	    			if(params.accModeValue=="2" && data&&data.code && (data.code == "Security.intercept")){
	    				//按bii李铭要求，如果此接口返回异常，直接跳转至该功能首页
	                    _t.el.append(_t.ejsPath.securityIntercept, function () {
	                        var pop = _t.el.find("#security_intercept");
	                        //确认按钮
	                        pop.find("#security_intercept_btn").on("click",function(){
	                            pop.remove();
	                            Common.LightBox.hide();
	                            prevEjsId.hide();
	                            _t.el.find("#elecTransferMain").show().find("#btn_reset_1733").trigger("click");
	                        });
	                        CU.changeLan(pop);
	                        CU.setObjAbsCenter(pop);
	                    });
	    			}else{
	    				Common.creatToken(_t._conversationId,function(token){
	    					Common.handleError(data);
	    					Common.LightBox.hide();
							_t._token=token;
	    				});
	    			}
	    		}
		    });
		},
		//实时转账点击确定按钮
		_elec_Intime_confirm:function(prevEjsId,params,p){
			var _t = this;
			if(!Common.SF.getData(p)){
				return false;
			}
			p.token = _t._token;
			Common.LightBox.show();
			Common.requestInterface(new Model("PsnEbpsRealTimePaymentTransfer",p,_t._conversationId)
	    		,function(data){
					var transactionId=data.transactionId.toString();
					_t.requestTransferRecord(transactionId,params, function(data){
						var successId=_t.el.find("#elecTransferSuccess"),
						counter=1,//计时器
						waitTime=data.waitTimeForRealTime,//调用接口最多等候时间
						defaultTime=data.defaultTimeForRealTime;//每隔几秒钟调一次
						successId.html(_t.ejsPath.showRemainTime,{"allTime":waitTime+"s"},function(){//倒计时页面
							prevEjsId.hide();
							CU.changeLan(successId.show());
							Common.LightBox.hide();
							var remain_timeId=successId.find("#remain_time");
							params._counter=setInterval(function(){//一秒刷新一次
								if(counter<=waitTime){
									remain_timeId.text((waitTime-counter)+"s");//倒计时
									if(counter%defaultTime==0){//每隔defaultTime秒钟调一次接口
										Common.LightBox.show();
										_t.requestTransferRecord(transactionId,params,function(){
											Common.LightBox.hide();
										});
									}
									++counter;
								}else{//倒计时结束依然没有返回结果时
									clearInterval(params._counter);
									_t._elec_intime_success({"execFlag":"3"});
								}
							},1000);
						});
					});
				}
		    	,function(token){//交易失败，重新申请token
					_t._token=token;
					Common.LightBox.hide();
				}
	    	);
		},
		//实时付款转账倒计时counter,waitTime,
		requestTransferRecord:function(transactionId,params,callback){
			var _t=this;
			Common.request({
	    		models:[new Model("PsnSingleTransQueryTransferRecord",{"transId":transactionId})],
	    		dataHandle: false,
	    		showLoading: false,
	    		success:function(data){
	    			switch(data.status){
						case "A"://成功
							_t._elec_intime_success({
								"execFlag"     :"1",
								"accountNumber":params.accountNumber.substring(params.accountNumber.length-4),//转出账户
								"payeeName"    :params.payeeName,//转入账户姓名
								"payeeActno"   :params.payeeActno.substring(params.payeeActno.length-4),//转入账户
								"amount"       :params.amount.formatNum("001",false,true)//转账金额
							});
							break;
						case "B":
						case "12"://失败
							_t._elec_intime_success({"execFlag":"2"});
							break;
						default://等候
							callback&&callback(data);
							break;
					}
	    		},
	    		fail:function (data){
	    			if(params._counter){clearInterval(params._counter);}
	    			_t._elec_intime_success({"execFlag":"3"});
	    		}
		    });
		},
		//实时付款转账结果
		_elec_intime_success:function(params){
			var _t = this;
			_t.el.html(_t.ejsPath.aTransResultPage,params, function() {
				var successId=_t.el.find("#success_page_0100");
	            CU.changeLan(successId.show());
	            Common.LightBox.hide();
			});
		},
		//手续费试算接口
		conmmissionCharge:function(params,callback){
			var modelName="";/*接口名称*/
				p = {/*接口上送参数对象*/
					serviceId    :params.serviceId,     //服务ID
					fromAccountId:params.fromAccountId, //转出账户id
					currency     :"001",                //币种
					amount       :params.amount,        //转账金额
					cashRemit    :"00",                 //钞汇
					remark       :params.remark,        //备注
					payeeActno   :params.payeeActno,    //转入账号
					payeeName    :params.payeeName,     //收款人姓名
					toOrgName    :params.toOrgName ,    //收款人开户行
					cnapsCode    :params.cnapsCode      //省联行号
				},
				chargeObj={/*手续费试算对象*/
					//单笔基准费用
					needCommissionCharge:"",
					//单笔优惠后费用
					preCommissionCharge:"",
					//未签约汇款套餐，页面不显示提示信息
					remitSetMealFlag:"0",
					//试费查询是否成功标识
					getChargeFlag:"0",
					//是否展现“单笔基准费用”字段标识，true展现、false不展现
					chargeFlag:true
				};
			if(params.accModeValue=="1"){//1中行账户
				modelName = "PsnTransGetBocTransferCommissionCharge";
			}else{//2他行账户
				modelName = "PsnTransGetNationalTransferCommissionCharge";
			}
			Common.request({
	    		models:[new Model(modelName,p)],
	    		dataHandle: false,
	    		showLoading: true,
	    		success: function(data){
					if(data.getChargeFlag == "1"){//试算成功
						$.extend(chargeObj,data);
		    			//needCommissionCharge 只有后台返回这个字段并且不为0 才显示
		    			//遇到后台报错 或者 BNMS里面设置成收0的情况下  基准费用字段不返回。
		    			chargeObj.chargeFlag=(data.needCommissionCharge>0?true:false);
					}
	    			callback && callback($.extend(chargeObj,params));
	    		},
	    		fail:function(){
	    			callback && callback($.extend(chargeObj,params));
	    		}
	    	});
		}
	});
// })();