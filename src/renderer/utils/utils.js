function randomString(len) {
	len = len || 32;
	var $chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
	var maxPos = $chars.length;
	var pwd = '';
	for (var i = 0; i < len; i++) {
		pwd += $chars.charAt(Math.floor(Math.random() * maxPos));
	}
	return pwd;
}

export function random(type, n) {
	if (type === "port") {
		return Math.floor(Math.random() * 10000) + (n || 10000);
	}
	return randomString(n || 6);
}
