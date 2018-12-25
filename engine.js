let input_key_buffer = [];//キー入力
for(let i = 0; i < 256; i++) input_key_buffer[i] = false;//押してない状態を初期値とする
const canvas = document.getElementById('action');
let ctx = canvas.getContext('2d');
let x = 45;
let y = 45;
let z = 300;
const oku = 0.4;
let data = [];
let face = [];
let re = [];
let point = true;
const rndm = (min,max) => {
	return Math.floor(Math.random() * max) + min;
}
const rad = dir => {
	return dir * Math.PI/180;
}
const dot = (mat1,mat2) => {
	let re = [];
	mat1.forEach((v1,i1)=> {
		re.push([]);
		mat2[0].forEach((v2,i2)=> {
			re[i1].push(0);
			mat1[0].forEach((v3,i3)=> {
				re[i1][i2] += mat1[i1][i3]*mat2[i3][i2];
			})	
		})
	})
	return re;
}
const vect = (obj1,obj2,obj3) => {
	const xx = (obj1.y*obj2.z + obj2.y*obj3.z + obj3.y*obj1.z) - (obj2.y*obj1.z + obj3.y*obj2.z + obj1.y*obj3.z);
	const yy = (obj1.z*obj2.x + obj2.z*obj3.x + obj3.z*obj1.x) - (obj2.z*obj1.x + obj3.z*obj2.x + obj1.z*obj3.x);
	const zz = (obj1.x*obj2.y + obj2.x*obj3.y + obj3.x*obj1.y) - (obj2.x*obj1.y + obj3.x*obj2.y + obj1.x*obj3.y);
	return {x:xx,y:yy,z:zz};
}
console.log(vect( {x:1,y:2,z:3}, {x:2,y:3,z:1}, {x:-1,y:1,z:4}))
const goto = obj => {
	const rx = dot([[obj.x,obj.y,obj.z]],[[Math.cos(rad(y))],[0],[Math.sin(rad(y))]]);
	const ry = dot([[obj.x,obj.y,obj.z]],[ [Math.sin(rad(x))*Math.sin(rad(y)) ], [Math.cos(rad(x))],[ Math.sin(rad(x))*Math.cos(rad(y))*-1 ] ] );
	const rz = dot( [[obj.x,obj.y,obj.z]],[ [Math.sin(rad(y))*Math.cos(rad(x))*-1*oku],[Math.sin(rad(x))*oku],[Math.cos(rad(x))*Math.cos(rad(y))*oku] ]);
	return {x:rx[0][0],y:ry[0][0],z:rz[0][0]+z};
}
const  heron = (a,b,c) => {
	const s = (a + b + c)/2;
	return Math.sqrt(s*(s-a)*(s-b)*(s-c));
}
const fillTriangle = (obj1,obj2,obj3,cl) => {
	const length = {
		l3:Math.sqrt(Math.pow(obj1.x-obj2.x,2) + Math.pow(obj1.y-obj2.y,2)),
		l2:Math.sqrt(Math.pow(obj1.x-obj3.x,2) + Math.pow(obj1.y-obj3.y,2)),
		l1:Math.sqrt(Math.pow(obj2.x-obj3.x,2) + Math.pow(obj2.y-obj3.y,2)),
	}
	const innerCenter = {
		x:(length.l1*obj1.x+length.l2*obj2.x+length.l3*obj3.x)/(length.l1+length.l2+length.l3),
		y:(length.l1*obj1.y+length.l2*obj2.y+length.l3*obj3.y)/(length.l1+length.l2+length.l3),
	}
	let r = heron(length.l1,length.l2,length.l3)/(length.l1+length.l2+length.l3);
	let acc = 5;
	let rep = 0;
	ctx.beginPath();
	ctx.fillStyle = cl;
	ctx.arc(innerCenter.x,innerCenter.y,r*2,0,Math.PI*2,false);
	ctx.fill();
	ctx.closePath();
	ctx.strokeStyle = cl;
	for(let i = 0; i < 10; i++) {
		rep += acc;
		ctx.beginPath();
		ctx.lineWidth = r < 1 ? 1 : r*2;
		ctx.moveTo(innerCenter.x + (obj1.x-innerCenter.x)/10*rep,innerCenter.y + (obj1.y-innerCenter.y)/10*rep);
		ctx.lineTo(innerCenter.x + (obj2.x-innerCenter.x)/10*rep,innerCenter.y + (obj2.y-innerCenter.y)/10*rep);
		ctx.lineTo(innerCenter.x + (obj3.x-innerCenter.x)/10*rep,innerCenter.y + (obj3.y-innerCenter.y)/10*rep);
		ctx.lineTo(innerCenter.x + (obj1.x-innerCenter.x)/10*rep,innerCenter.y + (obj1.y-innerCenter.y)/10*rep);
		ctx.closePath();
		ctx.stroke();
		r /= 2;
		acc /= 2;
	}
}
const fillSquare = (obj1,obj2,obj3,obj4,cl) => {
	fillTriangle({x:obj1.x,y:obj1.y},{x:obj2.x,y:obj2.y},{x:obj3.x,y:obj3.y},cl);
	fillTriangle({x:obj1.x,y:obj1.y},{x:obj3.x,y:obj3.y},{x:obj4.x,y:obj4.y},cl);
}
const addData = obj => {
	data.push(obj);
}
const drawPoint = () => {
	let r = goto(data[0]);
	re = [];
	ctx.beginPath();
	ctx.moveTo(r.x/r.z*200 + 320,r.y/r.z*200 + 240);
	ctx.lineWidth = 3;
	ctx.fillStyle = "#bbb";
	data.forEach((value,index,array) => {
		r = goto(value);
		ctx.arc(r.x/r.z*200 + 320,r.y/r.z*200 + 240,5,0,Math.PI*2,false);
		point && ctx.fill();
		ctx.closePath();
		re.push({x:r.x/r.z*200 + 320,y:r.y/r.z*200 + 240,z:r.z});
	})
}
const drawFace = () => {
	let zz = [];
	face.forEach((value,index,array) => {
		let r = 0;
		let v = JSON.parse(JSON.stringify(value['p']));
		v.forEach((value,index) => {
			r += re[v[index]]['z'];
 		})
		zz.push({ave:r/v.length,index:index});
	});
	zz.forEach((value,index,array) => {
		for(let i = zz.length-1; index < i; i--) {
			if(zz[i]['ave'] > zz[i-1]['ave']) {
				let temp = JSON.parse(JSON.stringify(zz[i]));
				zz[i] = JSON.parse(JSON.stringify(zz[i-1]));
				zz[i-1] = JSON.parse(JSON.stringify(temp));
			}
		}
	});
	//console.log(zz);
	face.forEach((value,i) => {
		let obj = JSON.parse(JSON.stringify(face[zz[i]['index']]));
		switch(obj.type) {
			default:
			fillSquare(re[obj.p[0]],re[obj.p[1]],re[obj.p[2]],re[obj.p[3]],obj.cl);
			break;
			case "triangle":
			fillTriangle(re[obj.p[0]],re[obj.p[1]],re[obj.p[2]],obj.cl);
			break
		}
	});
}
const addFace = (obj,color,type = "square") => {
	face.push({p:obj,cl:color,type:type});
}
const cubeData = () => {
	addData({x:100,y:100,z:-100});
	addData({x:100,y:-100,z:-100});
	addData({x:-100,y:-100,z:-100});
	addData({x:-100,y:100,z:-100});
	addData({x:100,y:100,z:100});
	addData({x:100,y:-100,z:100});
	addData({x:-100,y:-100,z:100});
	addData({x:-100,y:100,z:100});
	addData({x:0,y:300,z:0});
	addData({x:-100,y:300,z:-100});
	addFace([0,1,2],'#00f',"triangle");
	addFace([2,3,7,6],'#0f0');
	addFace([0,1,5,4],'#0ff');
	addFace([1,2,6,5],'#f0f');
	addFace([4,5,6,7],'#ff0');
	addFace([0,3,7,4],'#f00');
	addFace([8,0,3],'#888',"triangle");
	addFace([8,0,4],'#777',"triangle");
	addFace([8,4,7],'#666',"triangle");
	addFace([8,3,7],'#555',"triangle");
	addFace([9,3,0],'#555',"triangle");
}
const sleep = waitMsec => {
	const startMsec = new Date();
	while(new Date() - startMsec < waitMsec);
}
const all = () => {
	ctx.beginPath();
	ctx.globalAlpha = 1;
	ctx.fillStyle = '#000000';
	ctx.fillRect(0,0,canvas.width,canvas.height);
	ctx.closePath();
	window.onkeydown = e => {
		input_key_buffer[e.keyCode] = true;
	}
	window.onkeyup = e => {
		input_key_buffer[e.keyCode] = false;
	}
	y += 3*(input_key_buffer[39] - input_key_buffer[37]);
 	x += 3*(input_key_buffer[40] - input_key_buffer[38]);
	point = input_key_buffer[90];
	z += 2*(input_key_buffer[83] - input_key_buffer[87]);
 	drawPoint();
 	drawFace();
	input_key_buffer[83] && input_key_buffer[84] && sleep(100000);
}
cubeData();
(function animloop() {
	all();
	window.requestAnimationFrame(animloop);
}());
