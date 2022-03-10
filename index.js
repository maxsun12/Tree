const canvas = document.querySelector('canvas').getContext('2d')
canvas.translate(301, 301) // 将画布向x，y方向各偏移300，画布的(300，300)点定为平面直角坐标系的零点(0,0)
canvas.scale(1, -1) // 将画布上下反转变换，x方向朝上为正，朝下为负


// 坐标轴辅助线
// canvas.beginPath()
// canvas.moveTo(-300, 0)
// canvas.lineTo(300, 0)
// canvas.moveTo(0, -300)
// canvas.lineTo(0, 300)
// canvas.stroke()

/**
 * @description 以坐标（0, 0）为起点的向量。当不传任何参数时默认为终点是（1, 0）的单位向量
 * @param {Number} x 向量终点x坐标
 * @param {Number} y 向量终点的y坐标
 * @method scale 向量长度变换
 * *	@param {Number} value 需要拉长的长度
 * *	@return {Vector} 变换后的向量
 * @method roate 向量与x轴的夹角变化
 * *	@param {Number} value 需要偏转的角度
 * *	@return {Vector} 变换后的向量
 * @method copy 向量复制，返回属性值一样的新Vector实例
 * *	@return {Vector} 新的一个Vector实例
 */
class Vector {
	constructor(x = 1, y = 0) {
		this.x = x
		this.y = y
	}
	// 向量长度
	get length () {
		return round(Math.hypot(this.x, this.y))
	}
	// 向量与x轴的夹角
	get angle() {
		return Math.round((Math.atan2(this.y, this.x) / Math.PI) * 180)
	}
	scale(value) {
		this.x *= value
		this.y *= value
		return this
	}
	roate(value) {
		const dir = transform(value)
		const cos = Math.cos(dir)
		const sin = Math.sin(dir)
		const oldX = this.x
		const oldY = this.y
		this.x = round(oldX * cos + oldY * -sin)
    	this.y = round(oldX * sin + oldY * cos)
		return this
	}
	copy() {
		return new Vector(this.x, this.y)
	}
}

/**
 * @param {Number} width 树枝的宽
 * @param {Vector} v 表达树枝长度及方向的向量
 * @param {Branch} parent 此树枝节点的父节点
 * @method draw() 树枝的渲染方法
 */
class Branch {
	width = 0 // 树枝的宽度
	childern = [] // 树枝的子节点
	parent = null // 树枝的父节点

	constructor(width, v, parent) {
		this.width = width
		this.v = v

		if (parent) {
			this.parent = parent
			this.parent.setChild(this)
		}
		this.draw()
	}
	// 起点x坐标
	get x0() {
		return this.parent ? this.parent.x1 : 0
	}
	// 起点y坐标
	get y0() {
		return this.parent ? this.parent.y1 : -200
	}
	// 终点x坐标
	get x1() {
		return this.x0 + this.v.x
	}
	// 终点y坐标
	get y1() {
		return this.y0 + this.v.y
	}
	setChild(child) {
		this.childern.push(child)
	}
	draw() {
		canvas.beginPath()
		canvas.lineWidth = this.width
		canvas.strokeStyle = "black"
		canvas.moveTo(this.x0, this.y0)
		canvas.lineTo(this.x1, this.y1)
		canvas.stroke()
	}
}

/**
 * @param {Object} options 树的配置项 { rootWeight: 树根的宽, angle: 此树的树枝最大偏转角度 }
 */
class Tree {
	rootWeight = 9 // 树根的宽度
	angle = 30 // 此树的树枝最大偏转角度
	constructor(options = {}) {
		const { rootWeight, angle } = options
		this.angle = angle || this.angle
		this.rootWeight = rootWeight || this.rootWeight

		this.creatBranchs()
	}
	get rootHeight() {
		return this.rootWeight * 10
	}
	creatBranchs() {
		let branch = new Branch(this.rootWeight, new Vector(0, this.rootHeight), null) // 创建根节点，并将branch指向此节点
		while (branch.parent || branch.childern.length < 2) { // 如果不是根节点或者子节点未遍历完，继续遍历生成节点
			while (branch.width > 1 && branch.childern.length < 2){ // 如果不是叶子节点且子节点未遍历完，继续遍历生成节点
				const angle =  Math.round(Math.random() * this.angle) // 取最大偏转值以内的随机值进行偏转
				const v = branch.v.copy()
				v.scale((branch.width - 1) / branch.width)
				branch.childern.length === 0 ? v.roate(-angle) : v.roate(angle) // 第一个节点向右偏转，第二个节点向左偏转
				branch = new Branch(branch.width - 1, v, branch) // 生成一个节点，并将branch指向此节点
			}

			branch = branch.parent // 指向父节点
		}
	}
}

// 角度制转弧度制
function transform (degree) {
	return round((degree / 180) * Math.PI)
}

// 保留6位小数
function round (num) {
	return Math.round(num * 1000000) / 1000000
}

const tree = new Tree()