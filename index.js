const canvas = document.querySelector('canvas').getContext('2d')
canvas.translate(301, 301)
canvas.scale(1, -1)

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
 * @method scale(length) 向量长度变换 length：需要拉长的长度
 * @method roate(angle) 向量与x轴的夹角变化 angle：需要偏转的角度
 * @method copy() 向量复制，返回属性值一样的新Vector实例
 */
class Vector {
	constructor(x = 1, y = 0) {
		this.x = x
		this.y = y
		this.length = Math.hypot(this.x, this.y) // 向量长度
		this.angle = (Math.atan2(this.y, this.x) / Math.PI) * 180 // 向量与x轴的夹角
	}
	scale(length) {
		this.length += length
		this.x = round(Math.cos(transform(this.angle)) * this.length)
		this.y = round(Math.sin(transform(this.angle)) * this.length) 
		return this
	}
	roate(angle) {
		this.angle += angle
		this.x = round(Math.cos(transform(this.angle)) * this.length)
		this.y = round(Math.sin(transform(this.angle)) * this.length)
		return this
	}
	setRoate(angle) {
		this.angle = angle
		this.x = round(Math.cos(transform(this.angle)) * this.length)
		this.y = round(Math.sin(transform(this.angle)) * this.length)
		return this
	}
	copy() {
		const v = new Vector()
		return Object.assign(v, this)
	}
}

/**
 * @param {Number} width 树枝的宽
 * @param {Array} startPoint 树枝的起点
 * @param {Vector} v 表达树枝长度及方向的向量
 * @method setChild() 设置树枝的子节点
 * @method draw() 树枝的渲染方法
 */
class Branch {
	childern = [] // 树枝的子节点
	parent = null // 树枝的父节点
	constructor(width, startPoint, v, parent) {
		this.width = width
		this.x = round(startPoint[0])
		this.y = round(startPoint[1])
		this.v = v

		if (parent) {
			this.parent = parent
			this.parent.setChild(this)
		}
	}
	setChild(child) {
		this.childern.push(child)
	}
	draw(context) {
		context.beginPath()
		context.lineWidth = this.width
		context.strokeStyle = "black"
		context.moveTo(this.x, this.y)
		context.lineTo(this.x + this.v.x, this.y + this.v.y)
		context.stroke()
	}
}

class Tree {
	startPoint = [0, -200] // 树根的起始位置
	rootHeight = 90 // 树根的高度
	rootWeight = 9 // 树根的宽度
	angle = 20 // 此树的树枝基础偏转角度
	branchs = [] // 树枝数组
	constructor(options = {}) {
		Object.keys(options).forEach(key => {
			if (this[key] && !(this[key] instanceof Function)) {
				this[key] = options[key]
			}
		})
		this.creatBranch()
	}
	creatBranch() {
		const v = new Vector()
		let startPoint = []
		v.scale(this.rootHeight - 1)
		v.roate(90)
		let branch = new Branch(this.rootWeight, this.startPoint, v.copy(), null)
		this.setBrach(branch)
		do {
			if (branch.childern.length < 2) {
				while (branch.width > 1){
					const angle = this.angle + Math.round(Math.random()*20) * (Math.round(Math.random()) === 0 ? -1 : 1)
					startPoint = [branch.x + branch.v.x, branch.y + branch.v.y]
					v.scale(-10)
					branch.childern.length === 0 ? v.roate(-angle) : v.roate(angle)
					branch = new Branch(branch.width - 1, startPoint, v.copy(), branch)
					this.setBrach(branch)
				}
			}
			branch = branch.parent
			v.scale(10).setRoate(branch.v.angle)
		} while (branch.parent || (branch.parent === null && branch.childern.length === 1))
		console.log(this.branchs)
	}
	setBrach(branch) {
		this.branchs.push(branch)
	}
	create(context) {
		this.branchs.forEach(item => {
			item.draw(context)
		})
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

const tree = new Tree({
	// rootHeight: 100,
	// rootWeight: 10,
	// startPoint: [0, -300]
})
tree.create(canvas)