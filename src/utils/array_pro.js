//数组原型方法
export const array_pro = ()=> {
	//查找元素
	Array.prototype.inArray = function(el) {
		for (var i = 0, n = this.length; i < n; i++)
			if (this[i] === el) return true;
		return false;
	}

	//移除元素
	Array.prototype.reMove = function(val) {
		var index = this.indexOf(val);
		if (index > -1) {
			this.splice(index, 1);
		}
	};

	//数组去重
	Array.prototype.unIque = function() {
		var i = 0,
			n = this.length,
			ret = [];
		for (; i < n; i++)
			if (!ret.includes(this[i])) {
				ret.push(this[i])
			} else {
				ret.reMove(this[i])
			}
		return ret;
	};
}
