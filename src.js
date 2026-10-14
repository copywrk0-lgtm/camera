import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.180.0/build/three.module.js';

const $ = (s) => document.querySelector(s);
const canvas = $('#sceneCanvas');
const renderer = new THREE.WebGLRenderer({canvas,alpha:true,antialias:true,powerPreference:'high-performance'});
renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1,1.7));
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.65;
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(32,1,.1,100);
camera.position.set(6,2.5,13.7);
camera.lookAt(0,0,0);
scene.add(new THREE.AmbientLight(0x82978c,1.2));
const light=(color,power,x,y,z)=>{const l=new THREE.PointLight(color,power,25);l.position.set(x,y,z);scene.add(l)};
light(0xffffff,120,2,6,8);light(0x9eb8b3,80,-5,1,3);light(0xe5ad68,60,4,-2,-5);
const metal = new THREE.MeshStandardMaterial({color:0x181e1c,metalness:.85,roughness:.32});
const deep = new THREE.MeshStandardMaterial({color:0x0a0d0d,metalness:.42,roughness:.7});
const rubber = new THREE.MeshStandardMaterial({color:0x171b1b,metalness:.07,roughness:.92});
const brushed = new THREE.MeshStandardMaterial({color:0x59645f,metalness:.9,roughness:.26});
const glass = new THREE.MeshPhysicalMaterial({color:0x102b30,metalness:.36,roughness:.1,clearcoat:1,clearcoatRoughness:.06,transparent:true,opacity:.88,side:THREE.DoubleSide});
const copper = new THREE.MeshStandardMaterial({color:0xc49556,metalness:.87,roughness:.3});
const painted = new THREE.MeshStandardMaterial({color:0x29312f,metalness:.3,roughness:.5});
const root=new THREE.Group();scene.add(root);
function mesh(geo,mat,parent,x=0,y=0,z=0){let m=new THREE.Mesh(geo,mat);m.position.set(x,y,z);parent.add(m);return m}
function box(parent,w,h,d,x,y,z,mat=metal,r=0){const m=mesh(new THREE.BoxGeometry(w,h,d),mat,parent,x,y,z);return m}
function cyl(parent,rt,rb,h,x,y,z,mat=metal,seg=64){return mesh(new THREE.CylinderGeometry(rt,rb,h,seg),mat,parent,x,y,z)}
function disc(parent,r,depth,z,mat,inner=0){const geo=inner?new THREE.RingGeometry(inner,r,80):new THREE.CircleGeometry(r,80);const m=mesh(geo,mat,parent,0,0,z);return m}
function tube(parent,r,thick,z,mat){let m=mesh(new THREE.TorusGeometry(r,thick,12,90),mat,parent,0,0,z);return m}
const items=[];
function unit(name,position,rotation={x:0,y:0,z:0}){let g=new THREE.Group();root.add(g);g.position.set(...position);items.push({name,group:g,base:g.position.clone(),rotation,shift:new THREE.Vector3()});return g}
// Camera core with shaped shoulders, hand grip, top controls and machined seams.
const body=unit('body',[0,0,0]);
box(body,3.7,2.1,1.45,0,0,-.25,metal);
box(body,1.5,.54,1.24,0,1.31,-.23,metal);
box(body,1.1,.32,.92,0,1.68,-.27,painted);
box(body,.75,2.13,1.67,1.68,-.07,-.18,rubber);
box(body,3.62,.08,1.42,0,-1.09,-.24,brushed);
box(body,.05,1.9,1.43,-1.85,0,-.23,brushed);
box(body,.7,.38,1.3,-1.27,1.12,-.24,metal);
box(body,.76,.42,.88,1.31,1.12,-.16,metal);
box(body,1.1,.65,.08,0,.2,-1.01,deep);
box(body,.93,.49,.025,0,.22,-1.07,glass);
box(body,.34,.12,.08,-1.32,.44,.51,brushed);
// Buttons along back and top.
for(let i=0;i<5;i++){const b=cyl(body,.07,.07,.045,-1.5+i*.25,.67,-1.03,deep,24);b.rotation.x=Math.PI/2;}
for(let i=0;i<5;i++){box(body,.08,.2,.02,1.89,.6-i*.29,.18,brushed)}
let shutter=cyl(body,.19,.19,.1,1.38,1.45,.4,copper);shutter.rotation.x=Math.PI/2;
const dial=cyl(body,.47,.47,.21,-1.28,1.47,-.25,deep,54);
for(let i=0;i<32;i++){const a=i/32*Math.PI*2;box(body,.035,.14,.08,-1.28+Math.sin(a)*.48,1.47,-.25+Math.cos(a)*.48,brushed).rotation.y=a}
const dial2=cyl(body,.36,.36,.13,1.1,1.43,-.5,deep);
// Lens and individual optical elements along positive Z, detached in space.
const mount=unit('mount',[0,0,.62]);tube(mount,.88,.16,0,brushed);tube(mount,.71,.16,.09,deep);tube(mount,.58,.055,.19,copper);disc(mount,.54,.01,.17,deep);
const barrel=unit('barrel',[0,0,1.25]);const barrelGeom=new THREE.CylinderGeometry(.93,.88,1.4,80,1,false);barrelGeom.rotateX(Math.PI/2);mesh(barrelGeom,rubber,barrel,0,0,.35);
for(let i=0;i<13;i++){tube(barrel,.92,.017,-.31+i*.099,i%3===0?brushed:metal)}
for(let i=0;i<4;i++){tube(barrel,.87,.018,.12+i*.13,copper)}
const bezel=unit('front ring',[0,0,2.48]);tube(bezel,.95,.15,0,brushed);tube(bezel,.74,.08,.11,deep);tube(bezel,.69,.03,.16,copper);
const frontglass=unit('front glass',[0,0,2.57]);disc(frontglass,.67,.02,0,glass);tube(frontglass,.69,.028,-.012,brushed);
const innerlens=unit('optical element',[0,0,1.66]);disc(innerlens,.64,.02,0,glass);tube(innerlens,.68,.035,.01,copper);
const aperture=unit('aperture',[0,0,.87]);tube(aperture,.7,.06,0,deep);for(let i=0;i<9;i++){const blade=mesh(new THREE.SphereGeometry(.35,16,12),deep,aperture,Math.cos(i*Math.PI*2/9)*.2,Math.sin(i*Math.PI*2/9)*.2,.01);blade.scale.set(1,.25,.055);blade.rotation.z=i*Math.PI*2/9+.85;}
const sensor=unit('sensor',[0,0,.31]);box(sensor,1.12,.78,.045,0,0,0,copper);box(sensor,.93,.61,.051,0,0,.038,glass);for(let i=-5;i<=5;i++)box(sensor,.007,.58,.003,i*.077,0,.068,brushed);
const rear=unit('rear display',[0,.2,-1.07]);box(rear,1.8,1.12,.05,0,0,0,deep);box(rear,1.58,.92,.06,0,0,-.02,glass);
// Mechanical floating screws
const screws=[];for(let i=0;i<22;i++){let s=unit('fastener',[(i%2?.9:-.9),(Math.floor(i/2)%2?.61:-.61),.35+(i%11)*.18]);cyl(s,.048,.048,.11,0,0,0,i%3?brushed:copper,12).rotation.x=Math.PI/2;screws.push(s)}
const blueprint=new THREE.Group();root.add(blueprint);const rings=[];for(let i=0;i<3;i++){const r=mesh(new THREE.TorusGeometry(2.55+i*.25,.006,6,180),new THREE.MeshBasicMaterial({color:0x7f9988,transparent:true,opacity:.17}),blueprint);r.rotation.y=Math.PI/2.8+i*.3;r.rotation.x=.5+i*.1;rings.push(r)}
const grid=new THREE.GridHelper(13,26,0x45544b,0x26332a);grid.position.y=-2.5;grid.material.transparent=true;grid.material.opacity=.18;scene.add(grid);
let progress=0,target=0,manual=null;
const wrap=$('.scene-wrap');
function clamp(v,a=0,b=1){return Math.max(a,Math.min(b,v))}
function smooth(a,b,t){t=clamp((t-a)/(b-a));return t*t*(3-2*t)}
function updateScroll(){const rect=wrap.getBoundingClientRect();target=clamp(-rect.top/(rect.height-innerHeight));if(manual!==null&&Math.abs(target-manual)>.09)manual=null;}
window.addEventListener('scroll',updateScroll,{passive:true});
const explodeBtn=$('#explodeBtn'),resetBtn=$('#resetBtn');
explodeBtn.addEventListener('click',()=>{manual=.63;progress=.63;});resetBtn.addEventListener('click',()=>{manual=0;progress=0;});
function resize(){const w=canvas.clientWidth,h=canvas.clientHeight;renderer.setSize(w,h,false);camera.aspect=w/h;camera.fov=w<700?48:32;camera.position.set(w<700?5:6,w<700?2.8:2.5,w<700?15.5:13.7);camera.updateProjectionMatrix()}
window.addEventListener('resize',resize);resize();
const assembled={barrel:[0,0,1.25],bezel:[0,0,2.48],frontglass:[0,0,2.57],innerlens:[0,0,1.66],aperture:[0,0,.87],sensor:[0,0,.31],mount:[0,0,.62],body:[0,0,0],rear:[0,.2,-1.07]};
const separated={'barrel':[0,0,3.7],'front ring':[.1,0,6.1],'front glass':[.1,0,7.25],'optical element':[-.15,0,4.7],aperture:[0,0,2.2],sensor:[0,0,-1.45],mount:[0,0,1.25],body:[0,0,-3.3],'rear display':[0,.2,-5.6]};
function frame(t){requestAnimationFrame(frame);const pgoal=manual===null?target:manual;progress+=(pgoal-progress)*.065;const explode=smooth(.13,.64,progress),rebuild=smooth(.77,1,progress);const amount=explode*(1-rebuild);const rot= -.24+smooth(0,.18,progress)*.32;
root.rotation.y=rot +Math.sin(t*.00025)*.07;root.rotation.x=-.08+smooth(.3,.7,progress)*.08;
root.rotation.z=Math.sin(t*.0003)*.025;
for(const entry of items){const {group:g,name,base}=entry;let dest=separated[name];if(!dest&&name==='fastener'){let i=screws.indexOf(g);i=items.filter(k=>k.name==='fastener').findIndex(k=>k.group===g);dest=[base.x+(i%2?1:-1)*(.6+i%5*.28),base.y+(i%3-1)*.55,base.z+(i%4-2)*.6]};if(!dest)dest=base.toArray();g.position.set(THREE.MathUtils.lerp(base.x,dest[0],amount),THREE.MathUtils.lerp(base.y,dest[1],amount),THREE.MathUtils.lerp(base.z,dest[2],amount));g.rotation.y=amount*(name==='body'?.2:name==='barrel'?.11:0);}
blueprint.rotation.z=t*.00005;blueprint.visible=progress>.08&&progress<.96;blueprint.children.forEach(r=>{r.material.opacity=.11*explode*(1-rebuild)});
const chapter=progress<.24?0:progress<.73?1:2;
const texts=[['01 / THE OBJECT','A perfect<br><em>illusion.</em>','One instrument. Thousands of invisible decisions. Keep scrolling to reveal the engineering behind every frame.'],['02 / THE ANATOMY','Beauty in<br><em>pieces.</em>','The lens. The sensor. The mechanics. Separate the ordinary to discover something extraordinary.'],['03 / THE REBUILD','Made to<br><em>move you.</em>','The best digital experiences make you feel something before you even understand how they work.']];
if(window.lastChapter!==chapter){window.lastChapter=chapter;$('#stepLabel').textContent=texts[chapter][0];$('#sceneTitle').innerHTML=texts[chapter][1];$('#sceneDescription').textContent=texts[chapter][2]};
$('#progressText').textContent=`DISASSEMBLY / ${String(Math.round(amount*100)).padStart(3,'0')}%`;$('#progressFill').style.width=(amount*100)+'%';$('#partlabels').style.opacity=(smooth(.35,.55,progress)*(1-smooth(.72,.88,progress))).toFixed(2);
renderer.render(scene,camera)}
requestAnimationFrame(frame);updateScroll();setTimeout(()=>$('#loader')?.classList.add('hide'),1750);
// Deliberately opt-in: a subtle synthesized sound, no external audio files.
let audio,osc,gain,sound=false;$('#soundBtn').addEventListener('click',()=>{if(!sound){try{audio=new (window.AudioContext||window.webkitAudioContext)();osc=audio.createOscillator();gain=audio.createGain();osc.type='sine';osc.frequency.value=53;gain.gain.value=.013;osc.connect(gain).connect(audio.destination);osc.start();sound=true;$('#soundBtn').textContent='♫'}catch(e){$('#soundBtn').textContent='×'}}else{gain.gain.setTargetAtTime(0,audio.currentTime,.05);osc.stop(audio.currentTime+.4);sound=false;$('#soundBtn').textContent='♪'}});
