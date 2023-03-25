import {
	ElMessage
} from 'element-plus'
import {
	Base64
} from "js-base64"
//公用方法
export function dateFtt(fmt, date) { //author: meizz 
	var o = {
		"M+": date.getMonth() + 1, //月份 
		"d+": date.getDate(), //日 
		"h+": date.getHours(), //小时 
		"m+": date.getMinutes(), //分 
		"s+": date.getSeconds(), //秒 
		"q+": Math.floor((date.getMonth() + 3) / 3), //季度 
		"S": date.getMilliseconds() //毫秒 
	};
	if (/(y+)/.test(fmt))
		fmt = fmt.replace(RegExp.$1, (date.getFullYear() + "").substr(4 - RegExp.$1.length));
	for (var k in o)
		if (new RegExp("(" + k + ")").test(fmt))
			fmt = fmt.replace(RegExp.$1, (RegExp.$1.length == 1) ? (o[k]) : (("00" + o[k]).substr(("" + o[k]).length)));
	return fmt;
}

//创建时间格式化显示
export function crtTimeFtt(value) {
	var crtTime = new Date(value);
	return dateFtt("yyyy/MM/dd hh:mm:ss", crtTime); //直接调用公共JS里面的时间类处理的办法  
}

//获取token
export function get_token(params) {
	const user = localStorage.getItem('user')
	try {
		return JSON.parse(Base64.decode(user)).token
	} catch (error) {
		return user
	}
}

//获取重置账号的token
export function get_resettk(params) {
	const myreset = localStorage.getItem('myreset')
	try {
		return JSON.parse(Base64.decode(myreset)).token
	} catch (error) {
		return myreset
	}
}

//获取分页的值
export function getPageIndex(params) {
	const PageIndex = localStorage.getItem('pageIndex')
	if (!PageIndex) {
		return 1
	}
	try {
		return JSON.parse(Base64.decode(PageIndex))
	} catch (error) {
		return PageIndex
	}
}

//判断是否为base64字符串
export function isBase64(str) {
	if (str === '' || str.trim() === '') {
		return false;
	}
	try {
		return btoa(atob(str)) == str;
	} catch (err) {
		return false;
	}
}

/**
		-----------给弹出窗赋值模块-----------
 */

//获取指定的value
export function getVal(props, prop) {
	for (let i = 0; i < props.propList.length; i++) {
		if (props.propList[i].name == prop) {
			return props.propList[i].value
		}
	}
}

//获取指定属性的index值
const getIndex = (state, propsName, prop) => {
	for (let i = 0; i < state[propsName].length; i++) {
		if (state[propsName][i].name == prop) {
			return i
		}
	}
}
//弹出窗赋值
export function fromSet(state, propsName, propsList, row) {
	for (let key in propsList) {
		state[propsName][getIndex(state, propsName, propsList[key])].value = row[propsList[key]]
	}
}

//表单数据校验
export function validateData(data, type) {
	//用户名正则，4到16位（字母，数字，下划线，减号）
	var uPattern = /^[a-zA-Z0-9_-]{4,20}$/;
	//密码正则，6到20位（字母，数字，下划线，减号）
	var pPattern = /^[a-zA-Z0-9_-]{6,20}$/;
	//IP地址正则
	var regexIP = /^((25[0-5]|2[0-4]\d|((1\d{2})|([1-9]?\d)))\.){3}(25[0-5]|2[0-4]\d|((1\d{2})|([1-9]?\d)))$/;
	let valiList = [{
		prop: "username",
		vali: uPattern,
		message: "用户名是4到20位数字、字母或下划线！",
		error: "请输入用户名！"
	},
	{
		prop: "password",
		vali: pPattern,
		message: "密码是6到20位数字、字母或下划线！",
		error: "请输入密码！"
	},
	{
		prop: "password_new",
		vali: pPattern,
		message: "新密码是6到20位数字、字母或下划线！",
		error: "请输入新密码！"
	},
	{
		prop: "password_new2",
		vali: pPattern,
		message: "请再次输入6到20位数字、字母或下划线的密码！",
		error: "请再次输入新密码！"
	},
	{
		prop: "phone_ip",
		vali: regexIP,
		message: "请输入格式正确的ip地址！",
		error: "请输入ip地址！"
	},
	]
	for (let key in data) {
		for (let i = 0; i < valiList.length; i++) {
			if (key == valiList[i].prop) {
				if (data[key] == "") {
					ElMessage.error(valiList[i].error);
					return false
				}
				if (!valiList[i].vali.test(data[key])) {
					ElMessage.warning(valiList[i].message);
					return false
				}
			}
		}
	}
	/**
	 --------------------------密码判断模块--------------------------
	 */
	if (type == "register") {
		if (data.hasOwnProperty("password") && data.hasOwnProperty("password_new")) {
			if (data["password"] != data["password_new"]) {
				ElMessage.warning("两次输入的密码一致，请重新输入！");
				return false
			}
		}
	} else {
		if (data.hasOwnProperty("password_new") && data.hasOwnProperty("password_new2")) {
			//如果还包含原密码属性
			if (data.hasOwnProperty("password")) {
				if (data["password"] == data["password_new"]) {
					ElMessage.warning("旧密码不能与新密码一致！");
					return false
				}
			}
			if (data["password_new"] != data["password_new2"]) {
				ElMessage.warning("两次输入的新密码不同！");
				return false
			}
		}
	}

	return true
}


//获取当前周的日期列表
export function getDates(currentTime) {
	var currentDate = new Date(currentTime)
	var timesStamp = currentDate.getTime();
	var currenDay = currentDate.getDay();
	var dates = [];
	for (var i = 0; i < 7; i++) {
		dates.push(new Date(timesStamp + 24 * 60 * 60 * 1000 * (i - (currenDay + 6) % 7)).toLocaleDateString().replace(/\//g,
			'-'));
	}
	return dates
}

//获取地址栏参数
export function getQueryString(name) {
	let params_url = location.href.split("?")[1]
	if (params_url) {
		let params_val = params_url.toString().split("&")
		if (params_val) {
			for (let i in params_val) {
				let key = params_val[i].split("=")[0]
				let val = params_val[i].split("=")[1]
				if (key == name) {
					if (!isBase64(val)) {
						return decodeURI(val)
					}
				}
			}
		}
	}
	return false
}

//blob转换为文件
export function blobToFile(theBlob, fileName) {
	theBlob.lastModifiedDate = new Date();
	theBlob.name = fileName;
	return theBlob;
}

//复制文本内容
export function copyContent(value) {
	var input = document.createElement("input"); // 直接构建input
	input.value = value; // 设置内容
	document.body.appendChild(input); // 添加临时实例
	input.select(); // 选择实例内容
	document.execCommand("Copy"); // 执行复制
	document.body.removeChild(input); // 删除临时实例
}

//禁止打开控制台和ctrl+s
export function prohibit(value) {
	document.oncontextmenu = function () {
		return false
	}
	//禁用页面的ctrl功能，来禁止ctrl+s保存功能
	window.addEventListener('keydown', function (e) {
		if (e.keyCode == 83 && (navigator.platform.match('Mac') ? e.metaKey : e.ctrlKey)) {
			e.preventDefault();
		}
	})
}

//转换日期格式
export function formatDateTime(date) {
	var y = date.getFullYear();
	var m = date.getMonth() + 1;
	m = m < 10 ? ('0' + m) : m;
	var d = date.getDate();
	d = d < 10 ? ('0' + d) : d;
	var h = date.getHours();
	h = h < 10 ? ('0' + h) : h;
	var minute = date.getMinutes();
	minute = minute < 10 ? ('0' + minute) : minute;
	var second = date.getSeconds();
	second = second < 10 ? ('0' + second) : second;
	return y + '-' + m + '-' + d + ' ' + h + ':' + minute + ':' + second;
}

var ws
//webstroke初始化
export function WebSocketInit() {
	if ("WebSocket" in window) {
		console.log("您的浏览器支持 WebSocket!");

		// 打开一个 web socket
		ws = new WebSocket("wss://www.xingyue.xin/xy_ysj");

		ws.onopen = function () {
			// Web Socket 已连接上，使用 send() 方法发送数据
			console.log("连接成功！");
		};

		ws.onmessage = function (evt) {
			var received_msg = evt.data;
			console.log("接受消息：" + received_msg);
		};

		ws.onclose = function () {
			// 关闭 websocket
			console.log("连接关闭！");
		};
	} else {
		// 浏览器不支持 WebSocket
		console.log("您的浏览器不支持 WebSocket!");
	}
}

//发送消息
export function doSend(text) {
	ws.send(text)
}

//上传又拍云
export function upLoadupy(_this, id, filePath = "file-path") {
	const bucket_name = "guoshao-service";
	const opename = "guoshao520";
	const opepass = "29ul2LJr2z8A130W2i3VJErGh25nD5Xg";
	const acc_point = "http://v0.api.upyun.com/";
	let file = document.getElementById(id).files[0];
	let file_name = file.name.split(".")[0] + "-" + new Date().getTime() + "." + file.name.split(".")[1]
	if (file) {
		setTimeout(() => {
			let save__as =
				`/${filePath}/` +
				file_name;
			let save_as;
			if (save__as == "") {
				save_as = "/" + file_name;
			} else {
				let satemp = save__as.indexOf("/");
				if (satemp == 0) {
          save_as =
            `/${filePath}/` +
            file_name;
        } else {
          this.filename = "保存路径须以/开头";
        }
			}
			let date = new Date().toUTCString();
			let sign = SparkMD5.hash(
				"PUT&/" +
				encodeURI(bucket_name + save_as) +
				"&" +
				date +
				"&0&" +
				SparkMD5.hash(opepass)
			);
			var xhr = new XMLHttpRequest();
			xhr.open("PUT", encodeURI(acc_point + bucket_name + save_as), true);
			xhr.setRequestHeader(
				"Authorization",
				"UpYun " + opename + ":" + sign
			);
			xhr.setRequestHeader("X-Date", date);
			xhr.setRequestHeader("X-Upyun-Multi-Stage", "initiate");
			xhr.setRequestHeader("x-upyun-multi-type", file.type);
			xhr.setRequestHeader("X-Upyun-Multi-Length", file.size);
			xhr.setRequestHeader(
				"Content-Type",
				"application/x-www-form-urlencoded; charset=utf-8"
			);
			xhr.send();
			xhr.onload = function (event) {
				if (xhr.status == 204) {
					let uuid = xhr.getResponseHeader("x-upyun-multi-uuid");
					let blockSize = "1048576";
					let k = "0";
					let t = Math.ceil(file.size / blockSize);

					function mainupload() {
						if (k < t - 1) {
							var udate = new Date().toUTCString();
							var xhrup = new XMLHttpRequest();
							var usign = SparkMD5.hash(
								"PUT&/" +
								encodeURI(bucket_name + save_as) +
								"&" +
								udate +
								"&" +
								blockSize +
								"&" +
								SparkMD5.hash(opepass)
							);
							var data = file.slice(
								k * blockSize,
								(parseInt(k) + 1) * blockSize
							);
							xhrup.open(
								"PUT",
								encodeURI(acc_point + bucket_name + save_as),
								true
							);
							xhrup.setRequestHeader(
								"Authorization",
								"UpYun " + opename + ":" + usign
							);
							xhrup.setRequestHeader("X-Date", udate);
							xhrup.setRequestHeader("X-Upyun-Multi-Stage", "upload");
							xhrup.setRequestHeader("X-Upyun-Multi-Length", blockSize);
							xhrup.setRequestHeader("X-Upyun-Multi-UUID", uuid);
							xhrup.setRequestHeader("X-Upyun-Part-ID", k);
							xhrup.setRequestHeader(
								"Content-Type",
								"application/x-www-form-urlencoded; charset=utf-8"
							);
							xhrup.onreadystatechange = function () {
								if (xhrup.readyState == 4 && xhrup.status == 204) {
									var upercent = (((parseInt(k) + 1) * 100) / t).toFixed(3);
								}
							};
							xhrup.send(data);
						} else {
							var udate = new Date().toUTCString();
							var xhrup = new XMLHttpRequest();
							var endsize = file.size - k * blockSize;
							var usign = SparkMD5.hash(
								"PUT&/" +
								encodeURI(bucket_name + save_as) +
								"&" +
								udate +
								"&" +
								endsize +
								"&" +
								SparkMD5.hash(opepass)
							);
							var data = file.slice(k * blockSize, file.size);
							xhrup.open(
								"PUT",
								encodeURI(acc_point + bucket_name + save_as),
								true
							);
							xhrup.setRequestHeader(
								"Authorization",
								"UpYun " + opename + ":" + usign
							);
							xhrup.setRequestHeader("X-Date", udate);
							xhrup.setRequestHeader("X-Upyun-Multi-Stage", "upload");
							xhrup.setRequestHeader("X-Upyun-Multi-Length", endsize);
							xhrup.setRequestHeader("X-Upyun-Multi-UUID", uuid);
							xhrup.setRequestHeader("X-Upyun-Part-ID", k);
							xhrup.setRequestHeader(
								"Content-Type",
								"application/x-www-form-urlencoded; charset=utf-8"
							);
							xhrup.onreadystatechange = function () {
								if (xhrup.readyState == 4 && xhrup.status == 204) {
									var xhrfs = new XMLHttpRequest();
									var fdate = new Date().toUTCString();
									var fsign = SparkMD5.hash(
										"PUT&/" +
										encodeURI(bucket_name + save_as) +
										"&" +
										fdate +
										"&0&" +
										SparkMD5.hash(opepass)
									);
									xhrfs.open(
										"PUT",
										encodeURI(acc_point + bucket_name + save_as),
										false
									);
									xhrfs.setRequestHeader(
										"Authorization",
										"UpYun " + opename + ":" + fsign
									);
									xhrfs.setRequestHeader("X-Date", fdate);
									xhrfs.setRequestHeader("X-Upyun-Multi-Stage", "complete");
									xhrfs.setRequestHeader("X-Upyun-Multi-UUID", uuid);
									xhrfs.setRequestHeader(
										"Content-Type",
										"application/x-www-form-urlencoded; charset=utf-8"
									);
									xhrfs.onreadystatechange = function () {
										if (
											xhrfs.readyState == 4 &&
											(xhrfs.status == 204 || xhrfs.status == 201)
										) {

											console.log(xhrfs)
											if (xhrfs.status == 204) {
												ElMessage(`图片名为${file.name}的上传失败，文件已存在！`);
											} else {
												_this.imgUrl = file_name
												ElMessage.success({
													message: `图片名为${file.name}的上传又拍云成功！`,
													type: 'success'
												});
											}

										}
									};
									xhrfs.send();
								}
							};
							xhrup.send(data);
						}
					}
					mainupload();
				}
			};
		})
	}
}
