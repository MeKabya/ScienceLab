/* ════════════════════════════════════
   ELECTROCHEMICAL CELL — electrochemical.js
   ════════════════════════════════════ */
(function(){
let scene,camera,renderer,animId;
let clock=new THREE.Clock();
let electrons=[],ions=[];
let cellRunning=false;
let voltageEl,currentEl,ledMesh,ledLight,voltmeterNeedle;
let voltageTarget=0,voltageCurrent=0;

function init(container){
  container.innerHTML='';
  container.style.cssText='position:relative;width:100%;height:580px;background:linear-gradient(180deg,#07080f,#0d0f1c);border-radius:16px;overflow:hidden;';

  const canvas=document.createElement('canvas');
  canvas.style.cssText='position:absolute;inset:0;width:100%;height:100%;';
  container.appendChild(canvas);

  const ui=document.createElement('div');
  ui.style.cssText='position:absolute;inset:0;pointer-events:none;';
  container.appendChild(ui);

  const infoBox=document.createElement('div');
  infoBox.id='ec-info';
  infoBox.style.cssText='position:absolute;top:10px;left:10px;right:10px;padding:10px 14px;background:rgba(10,12,25,0.9);border:1px solid rgba(79,142,247,0.2);border-radius:10px;font-size:12px;color:#7a85a8;line-height:1.6;backdrop-filter:blur(12px);';
  infoBox.innerHTML='<strong style="color:#eef0ff">Daniell Cell (Zn/Cu)</strong><br>Zn → Zn²⁺ + 2e⁻ (oxidation at anode) &nbsp;|&nbsp; Cu²⁺ + 2e⁻ → Cu (reduction at cathode)<br>Standard EMF: 1.10 V';
  ui.appendChild(infoBox);

  // Meters panel
  const meters=document.createElement('div');
  meters.style.cssText='position:absolute;top:10px;right:10px;width:160px;padding:10px 14px;background:rgba(10,12,25,0.95);border:1px solid rgba(0,232,122,0.25);border-radius:12px;backdrop-filter:blur(12px);';
  meters.innerHTML=`
    <div style="font-family:monospace;font-size:9px;color:#00e87a;letter-spacing:2px;margin-bottom:8px">MEASUREMENTS</div>
    <div style="margin-bottom:8px">
      <div style="font-family:monospace;font-size:8px;color:#4a5070;margin-bottom:2px">VOLTAGE (V)</div>
      <div id="ec-voltage" style="font-family:monospace;font-size:26px;font-weight:700;color:#eef0ff">0.00</div>
    </div>
    <div style="height:4px;background:#1a1d2e;border-radius:4px;margin-bottom:8px;overflow:hidden">
      <div id="ec-vbar" style="height:100%;width:0%;background:linear-gradient(90deg,#4f8ef7,#00e87a);border-radius:4px;transition:width 0.3s"></div>
    </div>
    <div style="margin-bottom:6px">
      <div style="font-family:monospace;font-size:8px;color:#4a5070;margin-bottom:2px">CURRENT (mA)</div>
      <div id="ec-current" style="font-family:monospace;font-size:18px;font-weight:700;color:#4f8ef7">0.0</div>
    </div>
    <div id="ec-led-status" style="font-size:9px;color:#3a4060;font-family:monospace">LED: OFF</div>
  `;
  ui.appendChild(meters);
  voltageEl=document.getElementById('ec-voltage');
  currentEl=document.getElementById('ec-current');

  // Controls
  const controls=document.createElement('div');
  controls.style.cssText='position:absolute;bottom:10px;left:0;right:0;display:flex;justify-content:center;gap:10px;pointer-events:all;';
  ui.appendChild(controls);

  const startBtn=document.createElement('button');
  startBtn.textContent='⚡ Connect Cell';
  startBtn.style.cssText='padding:11px 20px;border-radius:12px;border:1.5px solid rgba(0,232,122,0.4);background:rgba(0,232,122,0.1);color:#00e87a;font-family:inherit;font-size:13px;font-weight:700;cursor:pointer;transition:all 0.25s;';
  startBtn.onclick=()=>startCell();
  controls.appendChild(startBtn);

  const saltBtn=document.createElement('button');
  saltBtn.textContent='🧂 Add Salt Bridge';
  saltBtn.style.cssText='padding:11px 20px;border-radius:12px;border:1.5px solid rgba(79,142,247,0.35);background:rgba(79,142,247,0.08);color:#4f8ef7;font-family:inherit;font-size:12px;font-weight:700;cursor:pointer;transition:all 0.25s;';
  saltBtn.onclick=()=>animateSaltBridge();
  controls.appendChild(saltBtn);

  const rstBtn=document.createElement('button');
  rstBtn.textContent='🔄 Reset';
  rstBtn.style.cssText='padding:11px 16px;border-radius:12px;border:1.5px solid rgba(255,68,102,0.3);background:rgba(255,68,102,0.07);color:#ff4466;font-family:inherit;font-size:12px;font-weight:700;cursor:pointer;transition:all 0.25s;';
  rstBtn.onclick=()=>resetCell();
  controls.appendChild(rstBtn);

  initThree(canvas,container);
}

function initThree(canvas,container){
  const W=container.clientWidth,H=container.clientHeight;
  scene=new THREE.Scene();
  camera=new THREE.PerspectiveCamera(40,W/H,0.1,100);
  camera.position.set(0,3,10);
  camera.lookAt(0,0,0);
  renderer=new THREE.WebGLRenderer({canvas,antialias:true,alpha:true});
  renderer.setSize(W,H);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio,2));

  scene.add(new THREE.AmbientLight(0x223355,3));
  const dl=new THREE.DirectionalLight(0xffffff,2);dl.position.set(2,5,4);scene.add(dl);

  buildBench();
  buildBeakers();
  buildElectrodes();
  buildWires();
  buildVoltmeter();
  buildLED();
  buildSaltBridge();

  animate();
  window.addEventListener('resize',()=>{const w=container.clientWidth,h=container.clientHeight;camera.aspect=w/h;camera.updateProjectionMatrix();renderer.setSize(w,h);});
}

function buildBench(){
  scene.add(Object.assign(new THREE.Mesh(new THREE.BoxGeometry(8,0.1,3),new THREE.MeshStandardMaterial({color:0x221508,roughness:0.85})),{position:new THREE.Vector3(0,-2.2,0)}));
}

function buildBeakers(){
  // Left beaker (ZnSO4)
  buildBeaker(-2.5,-1.2,0,0x4466ff,0.35,'ZnSO₄');
  // Right beaker (CuSO4)
  buildBeaker(2.5,-1.2,0,0x2288ff,0.55,'CuSO₄');
}

function buildBeaker(x,y,z,solutionColor,opacity,label){
  const g=new THREE.Group();
  const wall=new THREE.Mesh(new THREE.CylinderGeometry(0.65,0.58,1.4,32,1,true),new THREE.MeshStandardMaterial({color:0x88ccff,transparent:true,opacity:0.2,side:THREE.DoubleSide}));
  g.add(wall);
  const bot=new THREE.Mesh(new THREE.CircleGeometry(0.58,32),new THREE.MeshStandardMaterial({color:0x88ccff,transparent:true,opacity:0.2}));
  bot.rotation.x=-Math.PI/2;bot.position.y=-0.7;g.add(bot);
  const sol=new THREE.Mesh(new THREE.CylinderGeometry(0.62,0.56,1.0,32),new THREE.MeshStandardMaterial({color:solutionColor,transparent:true,opacity:opacity}));
  sol.position.y=-0.25;g.add(sol);
  g.position.set(x,y,z);
  scene.add(g);
}

function buildElectrodes(){
  // Zinc (anode) — left
  const znMat=new THREE.MeshStandardMaterial({color:0xccccaa,metalness:0.8,roughness:0.3});
  const zn=new THREE.Mesh(new THREE.BoxGeometry(0.18,2.0,0.18),znMat);
  zn.position.set(-2.5,0.1,0);zn.userData.isZn=true;scene.add(zn);
  // Label holder
  const znLbl=new THREE.Mesh(new THREE.BoxGeometry(0.5,0.15,0.08),new THREE.MeshBasicMaterial({color:0x666644}));
  znLbl.position.set(-2.5,1.2,0);scene.add(znLbl);

  // Copper (cathode) — right
  const cuMat=new THREE.MeshStandardMaterial({color:0xcc7733,metalness:0.85,roughness:0.2});
  const cu=new THREE.Mesh(new THREE.BoxGeometry(0.18,2.0,0.18),cuMat);
  cu.position.set(2.5,0.1,0);cu.userData.isCu=true;scene.add(cu);
  const cuLbl=new THREE.Mesh(new THREE.BoxGeometry(0.5,0.15,0.08),new THREE.MeshBasicMaterial({color:0x663311}));
  cuLbl.position.set(2.5,1.2,0);scene.add(cuLbl);
}

function buildWires(){
  // External circuit wires
  const wireMat=new THREE.MeshStandardMaterial({color:0xdd0000,roughness:0.5});
  const curve=new THREE.CatmullRomCurve3([
    new THREE.Vector3(-2.5,1.1,0),new THREE.Vector3(-1,2.5,0),new THREE.Vector3(0,2.8,0),new THREE.Vector3(1,2.5,0),new THREE.Vector3(2.5,1.1,0)
  ]);
  const geo=new THREE.TubeGeometry(curve,30,0.04,8,false);
  scene.add(new THREE.Mesh(geo,wireMat));
}

function buildVoltmeter(){
  const g=new THREE.Group();
  const body=new THREE.Mesh(new THREE.CylinderGeometry(0.5,0.5,0.15,24),new THREE.MeshStandardMaterial({color:0x222222,roughness:0.5}));
  g.add(body);
  const face=new THREE.Mesh(new THREE.CircleGeometry(0.45,24),new THREE.MeshBasicMaterial({color:0xf0f0e0}));
  face.rotation.x=-Math.PI/2;face.position.y=0.09;g.add(face);
  // Needle
  const needleGeo=new THREE.BoxGeometry(0.04,0.008,0.3);
  const needle=new THREE.Mesh(needleGeo,new THREE.MeshBasicMaterial({color:0xff2200}));
  needle.position.y=0.1;needle.rotation.y=Math.PI/2;
  needle.userData.isNeedle=true;
  voltmeterNeedle=needle;
  g.add(needle);
  g.position.set(0,3.0,0);g.rotation.x=Math.PI/2;
  scene.add(g);
}

function buildLED(){
  const g=new THREE.Group();
  const body=new THREE.Mesh(new THREE.SphereGeometry(0.14,12,12),new THREE.MeshStandardMaterial({color:0x22cc22,roughness:0.3,metalness:0.1}));
  g.add(body);
  ledMesh=body;
  ledLight=new THREE.PointLight(0x00ff44,0,2);
  ledLight.position.set(0,0,0);g.add(ledLight);
  g.position.set(0,2.0,0.3);
  scene.add(g);
}

function buildSaltBridge(){
  // Salt bridge as a U-tube between beakers
  const curve=new THREE.CatmullRomCurve3([
    new THREE.Vector3(-2.0,-0.5,0.5),new THREE.Vector3(-1,-1.2,0.5),new THREE.Vector3(0,-1.5,0.5),new THREE.Vector3(1,-1.2,0.5),new THREE.Vector3(2.0,-0.5,0.5)
  ]);
  const geo=new THREE.TubeGeometry(curve,20,0.06,8,false);
  const mat=new THREE.MeshStandardMaterial({color:0x8855aa,transparent:true,opacity:0.6,roughness:0.4});
  const bridge=new THREE.Mesh(geo,mat);
  bridge.userData.isBridge=true;
  scene.add(bridge);
}

function startCell(){
  cellRunning=true;
  voltageTarget=1.1;
  const infoBox=document.getElementById('ec-info');
  if(infoBox)infoBox.innerHTML='<strong style="color:#00e87a">⚡ Cell Active!</strong> Electrons flow from Zn (anode) → Cu (cathode) through external circuit.<br><span style="color:#7a85a8">Zn dissolves. Cu²⁺ ions deposit on copper electrode.</span>';

  // Start electron flow
  const interval=setInterval(()=>{
    if(!cellRunning){clearInterval(interval);return;}
    spawnElectron();
    if(Math.random()>0.6)spawnIon();
  },120);
}

function spawnElectron(){
  const geo=new THREE.SphereGeometry(0.05,8,8);
  const mat=new THREE.MeshBasicMaterial({color:0x00d4ff,blending:THREE.AdditiveBlending,transparent:true,opacity:0.9});
  const mesh=new THREE.Mesh(geo,mat);
  // Start at Zn electrode top
  mesh.position.set(-2.5,1.1,0);
  mesh.userData.t=0;mesh.userData.isElectron=true;
  scene.add(mesh);
  electrons.push(mesh);
}

function spawnIon(){
  // Zn2+ ion moving into solution
  const geo=new THREE.SphereGeometry(0.06,8,8);
  const mat=new THREE.MeshBasicMaterial({color:0x88aaff,transparent:true,opacity:0.7,blending:THREE.AdditiveBlending});
  const mesh=new THREE.Mesh(geo,mat);
  mesh.position.set(-2.5+(Math.random()-0.5)*0.3,-0.5+Math.random()*0.3,(Math.random()-0.5)*0.4);
  mesh.userData.vy=-(Math.random()*0.01+0.005);
  mesh.userData.life=1.0;
  scene.add(mesh);
  ions.push(mesh);
}

// Electron path along wire
const wirePath=[
  new THREE.Vector3(-2.5,1.1,0),new THREE.Vector3(-1,2.5,0),
  new THREE.Vector3(0,2.8,0),new THREE.Vector3(1,2.5,0),new THREE.Vector3(2.5,1.1,0)
];
const wireCurve=new THREE.CatmullRomCurve3(wirePath);

function animateSaltBridge(){
  // Flash the salt bridge
  scene.traverse(obj=>{
    if(obj.userData.isBridge){
      let f=0;
      const iv=setInterval(()=>{
        f++;obj.material.opacity=0.3+Math.sin(f*0.4)*0.3;
        if(f>30){clearInterval(iv);obj.material.opacity=0.6;}
      },30);
    }
  });
}

function resetCell(){
  cellRunning=false;voltageTarget=0;
  electrons.forEach(e=>{if(e.parent)e.parent.remove(e);});electrons=[];
  ions.forEach(i=>{if(i.parent)i.parent.remove(i);});ions=[];
  if(ledLight)ledLight.intensity=0;
  if(ledMesh)ledMesh.material.emissiveIntensity=0;
  const infoBox=document.getElementById('ec-info');
  if(infoBox)infoBox.innerHTML='<strong style="color:#eef0ff">Daniell Cell (Zn/Cu)</strong><br>Zn → Zn²⁺ + 2e⁻ (oxidation at anode) &nbsp;|&nbsp; Cu²⁺ + 2e⁻ → Cu (reduction at cathode)<br>Standard EMF: 1.10 V';
}

function animate(){
  animId=requestAnimationFrame(animate);
  const t=clock.getElapsedTime();

  // Voltage readout
  voltageCurrent+=(voltageTarget-voltageCurrent)*0.03;
  if(voltageEl)voltageEl.textContent=voltageCurrent.toFixed(2);
  if(currentEl)currentEl.textContent=(voltageCurrent*45+Math.sin(t*8)*2).toFixed(1);
  const vbar=document.getElementById('ec-vbar');
  if(vbar)vbar.style.width=(voltageCurrent/1.1*100)+'%';

  // LED
  if(ledLight&&ledMesh){
    ledLight.intensity=voltageCurrent>0.5?1.5+Math.sin(t*6)*0.3:0;
    ledMesh.material.emissive=new THREE.Color(0,1,0.3);
    ledMesh.material.emissiveIntensity=voltageCurrent>0.5?0.6+Math.sin(t*6)*0.1:0;
    const ledStatus=document.getElementById('ec-led-status');
    if(ledStatus)ledStatus.style.color=voltageCurrent>0.5?'#00e87a':'#3a4060';
    if(ledStatus)ledStatus.textContent=`LED: ${voltageCurrent>0.5?'ON ●':'OFF'}`;
  }

  // Voltmeter needle
  if(voltmeterNeedle){
    voltmeterNeedle.rotation.z=-Math.PI*0.4+voltageCurrent*0.7;
  }

  // Electrons along wire
  for(let i=electrons.length-1;i>=0;i--){
    const e=electrons[i];
    e.userData.t+=0.012;
    if(e.userData.t>1){
      if(e.parent)e.parent.remove(e);electrons.splice(i,1);continue;
    }
    const pos=wireCurve.getPoint(e.userData.t);
    e.position.copy(pos);
    e.material.opacity=0.9-e.userData.t*0.5;
  }

  // Ions
  for(let i=ions.length-1;i>=0;i--){
    const ion=ions[i];
    ion.position.y+=ion.userData.vy;
    ion.userData.life-=0.008;
    ion.material.opacity=ion.userData.life;
    if(ion.userData.life<=0||ion.position.y<-1.8){
      if(ion.parent)ion.parent.remove(ion);ions.splice(i,1);
    }
  }

  // Zn electrode dissolving effect
  if(cellRunning){
    scene.traverse(obj=>{
      if(obj.userData.isZn&&Math.random()>0.97){
        obj.scale.x=Math.max(0.5,obj.scale.x-0.0001);
      }
      if(obj.userData.isCu&&Math.random()>0.97){
        obj.scale.x=Math.min(1.3,obj.scale.x+0.00005);
      }
    });
  }

  renderer.render(scene,camera);
}

function destroy(){
  if(animId)cancelAnimationFrame(animId);
  if(renderer)renderer.dispose();
  if(scene)scene.clear();
}

window.Electrochemical={init,destroy};
})();
