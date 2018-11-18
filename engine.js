let input_key_buffer = [];//キー入力
for(let i = 0; i < 4; i++) input_key_buffer[i] = false;//押してない状態を初期値とする
const canvas = document.getElementById('action');
let ctx = canvas.getContext('2d');
let x = 90;
let y = 90;
let oku = 0.5;
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
const goto = obj => {
	let xx = Math.cos(rad(y)) * obj.x + Math.sin(rad(y)) * obj.z;
	let yy = Math.cos(rad(x)) * obj.y - Math.sin(rad(x)) * (Math.cos(rad(y)) * obj.z - Math.sin(rad(y)) * obj.x);
	let zz = Math.sin(rad(x))*obj.y*oku + Math.cos(rad(x))* ( Math.cos(rad(y)) * obj.z*oku - Math.sin(rad(y))*obj.x*oku ) + 300;
	return {x:xx,y:yy,z:zz};
}
const  heron = (a,b,c) => {
	let s = (a + b + c)/2;
	return Math.sqrt(s*(s-a)*(s-b)*(s-c));
}
const fillTriangle = (obj1,obj2,obj3,cl) => {
	let length = {
		l3:Math.sqrt(Math.pow(obj1.x-obj2.x,2) + Math.pow(obj1.y-obj2.y,2)),
		l2:Math.sqrt(Math.pow(obj1.x-obj3.x,2) + Math.pow(obj1.y-obj3.y,2)),
		l1:Math.sqrt(Math.pow(obj2.x-obj3.x,2) + Math.pow(obj2.y-obj3.y,2)),
	}
	let innerCenter = {
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
	data.forEach(function(value,index,array) {
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
		let v = value['p'];
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
	face.forEach((value,i) => {
		let cl = face[zz[i]['index']]['cl'];
		console.log(zz[i]['index'],face[zz[i]['index']]['cl'],cl);
		let temp = face[zz[i]['index']]['p'];
		fillSquare(re[temp[0]],re[temp[1]],re[temp[2]],re[temp[3]],cl);
	});
	console.log(face);
}
const addFace = (obj,color) => {
	face.push({p:obj,cl:color});
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
	addFace([0,1,2,3],'#00f');
	addFace([2,3,7,6],'#0f0');	
	addFace([0,1,5,4],'#0ff');
	addFace([1,2,6,5],'#f0f');
	addFace([4,5,6,7],'#ff0');	
	addFace([0,3,7,4],'#f00');
}
const all = () => {
	ctx.beginPath();
	ctx.globalAlpha = 1;
	ctx.fillStyle = '#000000';
	ctx.fillRect(0,0,canvas.width,canvas.height);
	ctx.closePath();
	window.onkeydown =function (e){
		input_key_buffer[e.keyCode-37] = true;
		e.keyCode == 90 && (point = true);
	};
	window.onkeyup = function (e){
		input_key_buffer[e.keyCode-37] = false;
		e.keyCode == 90 && (point = false);
	};
	y += 3*(input_key_buffer[2] - input_key_buffer[0]);
 	x += 3*(input_key_buffer[3] - input_key_buffer[1]);
 	drawPoint();
 	drawFace();
}
cubeData();
(function animloop() {
	all();
	window.requestAnimationFrame(animloop);
}());