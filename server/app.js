// 引入 koa 框架
const Koa = require("koa2");

// 引入处理 post 数据的插件
const bodyParser = require("koa-bodyparser");

// 引入 koa 路由
const KoaRouter = require("koa-router");

// 引入 axios
const axios = require("axios");

// 引入加密库
const Crypto = require("crypto");

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

// 翻译 api
router.post("/translate", async (ctx) => {
	// body 传 q(所译文本) 、from(所译语言)、 to(目标语言)
	const { body } = ctx.request;

	const sign = Crypto.createHash("md5")
		.update("6key_web_fanyiifanyiweb8hc9s98e" + body.q.trim())
		.digest("hex")
		.toString()
		.substring(0, 16);

	const { data } = await axios.post(
		"http://ifanyi.iciba.com/index.php",
		body,
		{
			params: {
				c: "trans",
				m: "fy",
				client: 6,
				auth_user: "key_web_fanyi",
				sign,
			},
			headers: {
				"Content-Type": "application/x-www-form-urlencoded",
			},
		}
	);

	const { error_code, message, content } = data;

	if (error_code) {
		ctx.body = message;

		return;
	}

	ctx.body = content.out;
});
