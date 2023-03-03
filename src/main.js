var CryptoJS = require("crypto-js");
var config = require("./config");

function supportLanguages() {
	return config.languages.map(([language]) => language);
}

async function translate(query, completion) {
	try {
		const { text: q, detectFrom, detectTo } = query;

		// 获取请求参数中的语种
		const getLanguage = (detect) =>
			config.languages.find((language) => language[0] === detect)[1];

		const from = getLanguage(detectFrom);

		const to = getLanguage(detectTo);

		const sign = CryptoJS.MD5("6key_web_fanyiifanyiweb8hc9s98e" + q.trim())
			.toString()
			.substring(0, 16);

		const result = await $http.post({
			url: `http://ifanyi.iciba.com/index.php?c=trans&m=fy&client=6&auth_user=key_web_fanyi&sign=${sign}`,
			body: {
				q,
				from,
				to,
			},
			header: {
				"Content-Type": "application/x-www-form-urlencoded",
			},
		});

		if (!result?.data) throw new Error();

		const { error_code, message, content } = result.data;

		if (error_code) throw new Error(message);

		completion({
			result: {
				from,
				to,
				toParagraphs: content.out.split("\n"),
			},
		});
	} catch ({ message }) {
		completion({
			error: {
				type: "unknown",
				message,
			},
		});
	}
}

module.exports = {
	supportLanguages,
	translate,
};
