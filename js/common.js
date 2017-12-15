
//支付页面
function pay() {
    var payModeList = $(".payModeList");
    var payLeaveFor = $(".payLeaveFor button");
    var payTitleImg = $(".payTitleImg");

    //支付参数
    var params = getUrlParams();

    var extObj = {
        "requestFrom":"WAP",
        "wap_url": CONFIG.wapUrl,
        "wap_name": CONFIG.wapName,
        "testPay": params["testPay"]
    };
    //微信额外需求
    var extStr = JSON.stringify(extObj).replace(/\"/g,"'");

    var getPayType = function () {
        return $('.payModeList.payActive').data('pay-type');
    };

    //取消支付
    payTitleImg.on(touchOff("touchstart"), function () {
        var root = window;
        if (window.parent !== root) {
            root = window.parent;
        }
        if (root.document.getElementsByTagName('iframe')[0]) {
            root.document.body.removeChild(root.document.getElementsByTagName('iframe')[0]);
        }
    });

    //支付选择
    payModeList.on(touchOff("touchstart"), selectPayType);
    function selectPayType() {
        payModeList.removeClass("payActive");
        $(this).addClass("payActive");
    }


    var submitOrderData = {
          "merId": params.merId,
          "appId": params.appId,
          "merOrderId": params.merOrderId,
          "payerId": params.payerId,
          "reqFee": params.reqFee,
          "itemName": params.itemName,
          "returnUrl": params.returnUrl,
          "notifyUrl": params.notifyUrl
    };

    //检测参数是否正确
    var errData = judgeParameter(submitOrderData);
    if (errData) {
        $(".errText").css("display", "block").text(errData);
        $(".app").html("");
    }
    submitOrderData["openExtend"] = params["extendJson"] || '';

    //修改显示数据
    $(".payPropMoney span").text((params["reqFee"] * 0.01).toFixed(2));
    $(".payPropName").text(params["itemName"]);

    //调用订单接口
    payLeaveFor.on(touchOff("touchstart"), function () {
        console.log("testPay:" + params["testPay"]);

        var submitOrderData = {
              "merId": params.merId,
              "appId": params.appId,
              "merOrderId": params.merOrderId,
              "payerId": params.payerId,
              "reqFee": params.reqFee,
              "itemName": params.itemName,
              "returnUrl": params.returnUrl,
              "notifyUrl": params.notifyUrl,
              "extInfo": extStr
        };

        var bTestPay = params["testPay"];
        var host = null;
        var url = null;

        if (bTestPay) {
            host = CONFIG.testHost
        } else {
            host = CONFIG.host;
        }

        var payType = +getPayType();
        if (payType == CONFIG.alipayPayType) {
            url = host + CONFIG.alipayOrderUrl;
        } else if (payType == CONFIG.wechatPayType) {
            url = host + CONFIG.wechatOrderUrl;
        }

        console.log("request url: " + url);

        var signValue = getSignValue(submitOrderData, bTestPay);

        submitOrderData["signValue"] = signValue;

        submitForm(url, submitOrderData);

    });
}

/**
 *  获取签名值
 * @param  {Object} params 必要参数
 * @param  {Boolean} bTestPay 是否测试
 * @return {String}        签名值
 */
function getSignValue(params, bTestPay) {
    var map = new TreeMap(),
        queryStr = null,
        bTestPay = bTestPay || false;
        signValue = '';

    for (var _k in params) {
        map.set(_k, params[_k]);
    }
    map.each(function (value, key) {
        if (!queryStr) {
            queryStr = key.toString() + '=' + value.toString();
        } else {
            queryStr = queryStr + '&' + key.toString() + '=' + value.toString();
        }
    });

    if (bTestPay) {
        queryStr = queryStr + '&key=' + CONFIG.testTradeKey;
    } else {
        queryStr = queryStr + '&key=' + CONFIG.tradeKey;
    }
    console.log("queryStr: " + queryStr);
    signValue = md5(queryStr);
    return signValue;
}


function submitForm(action, params) {
    var form = $("<form></form>");
    form.attr('action', action);
    form.attr('method', 'post');
    form.attr('target', '_self');

    for (var _k in params) {
        var input1 = $("<input type='hidden' name='"+ _k +"' />");
        input1.attr('value', params[_k]);
        form.append(input1);
    }

    form.appendTo("body");
    form.css('display', 'none');
    form.submit();
}

//判断参数是否正确
function judgeParameter(data) {
    for (var key in data) {
        if (data[key] === undefined || data[key] === "") {
            return "错误参数：" + key;
        }
    }
    return false;
}

//事件兼容
function touchOff(touch, on) {
    if (!on) on = '';
    if (touch in document) {
        return on + touch;
    }
    else {
        return on + 'click'
    }
}

function getUrlParams() {
    var search = location.search.toString();
    search = search.replace("?", "").replace(/#.*$/, "");
    search = search.split("&");
    var params = {};
    for (var i = 0, len = search.length; i < len; i++) {
        var arr = search[i].split("=");
        if (arr.length >= 2) {
            params[arr[0]] = decodeURIComponent(arr[1]);
        }
    }
    return params;
}
