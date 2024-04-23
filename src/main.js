var CryptoJS = require("crypto-js");
var config = require("./config");

function supportLanguages() {
	return config.languages.map(([language]) => language);
}

function getSign(q) {
	q = "6key_web_new_fanyi" + "6dVjYLFyzfkFkk" + q;

	const text = CryptoJS.MD5(q).toString().substring(0, 16);

	const message = CryptoJS.enc.Utf8.parse(text);

	const key = CryptoJS.enc.Utf8.parse("L4fBtD5fLC9FQw22");

	const result = CryptoJS.AES.encrypt(message, key, {
		mode: CryptoJS.mode.ECB,
		padding: CryptoJS.pad.Pkcs7,
	}).toString();

	return encodeURIComponent(result);
}

function decryptContent(content) {
	const ciphertext = CryptoJS.enc.Base64.parse(content);

	const key = CryptoJS.enc.Utf8.parse("aahc3TfyfCEmER33");

	const result = CryptoJS.AES.decrypt({ ciphertext }, key, {
		mode: CryptoJS.mode.ECB,
		padding: CryptoJS.pad.Pkcs7,
	});

	return JSON.parse(CryptoJS.enc.Utf8.stringify(result));
}

function translate(query, completion) {
	(async () => {
		try {
			const { text: q, detectFrom, detectTo } = query;

			// 获取请求参数中的语种
			const getLanguage = (detect) =>
				config.languages.find((language) => language[0] === detect)[1];

			const from = getLanguage(detectFrom);

			const to = getLanguage(detectTo);

			const sign = getSign(q);

			const result = await $http.post({
				url: `https://ifanyi.iciba.com/index.php?c=trans&m=fy&client=6&auth_user=key_web_new_fanyi&sign=${sign}`,
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
					toParagraphs: decryptContent(content).out.split("\n"),
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
	})();
}

exports.supportLanguages = supportLanguages;
exports.translate = translate;
