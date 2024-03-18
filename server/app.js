// 引入 koa 框架
const Koa = require("koa2");

// 引入处理 post 数据的插件
const bodyParser = require("koa-bodyparser");

// 引入 koa 路由
const KoaRouter = require("koa-router");

// 引入 axios
const axios = require("axios");

// 引入加密库
const CryptoJS = require("crypto-js");

// 创建服务器实例
const app = new Koa();

// 创建路由实例
const router = new KoaRouter();

// 使用bodyParser
app.use(bodyParser());

// 使用路由
app.use(router.routes(), router.allowedMethods());

// 监听端口
app.listen("5678", () => {
	console.log("端口号为 5678 的服务器已经启动！");
});

const getSign = (q) => {
	q = "6key_web_new_fanyi" + "6dVjYLFyzfkFkk" + q;

	const text = CryptoJS.MD5(q).toString().substring(0, 16);

	const message = CryptoJS.enc.Utf8.parse(text);

	const key = CryptoJS.enc.Utf8.parse("L4fBtD5fLC9FQw22");

	const result = CryptoJS.AES.encrypt(message, key, {
		mode: CryptoJS.mode.ECB,
		padding: CryptoJS.pad.Pkcs7,
	}).toString();

	return encodeURIComponent(result);
};

const decryptContent = (content) => {
	const ciphertext = CryptoJS.enc.Base64.parse(content);

	const key = CryptoJS.enc.Utf8.parse("aahc3TfyfCEmER33");

	const result = CryptoJS.AES.decrypt({ ciphertext }, key, {
		mode: CryptoJS.mode.ECB,
		padding: CryptoJS.pad.Pkcs7,
	});

	return JSON.parse(CryptoJS.enc.Utf8.stringify(result));
};

// 翻译 api
router.post("/translate", async (ctx) => {
	// body 传 q(所译文本) 、from(所译语言)、 to(目标语言)
	const { body } = ctx.request;

	const sign = getSign(body.q);

	const { data } = await axios.post(
		"https://ifanyi.iciba.com/index.php",
		body,
		{
			params: {
				c: "trans",
				m: "fy",
				client: "6",
				auth_user: "key_web_new_fanyi",
				sign,
			},
			headers: {
				"Content-Type": "application/x-www-form-urlencoded",
			},
		}
	);

	const { status, message, content } = data;

	if (status !== 1) {
		ctx.body = message ?? content;

		return;
	}

	const { out } = decryptContent(content);

	ctx.body = out;
});
