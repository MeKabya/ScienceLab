/* ════════════════════════════════════
   ACID-BASE TITRATION — titration.js
   ════════════════════════════════════ */
(function(){
let scene,camera,renderer,animId;
let clock=new THREE.Clock();
let drops=[],solutionColor={r:1,g:0.5,b:0.7}; // starts pink
let targetSolutionColor={r:1,g:0.5,b:0.7};
let solutionMesh,buretteMesh;
let ph=2.0,targetPh=2.0;
let dropsAdded=0,dropsToEndpoint=40;
let titrationDone=false;
let graphCanvas,graphCtx,graphData=[];
let buretteLevel=1.0; // 0-1
let dropInterval=null;
let uiOverlay,phDisplay,infoBox;

function init(container){
  container.innerHTML='';
  container.style.cssText='position:relative;width:100%;height:580px;background:linear-gradient(180deg,#07080f,#0d0f1c);border-radius:16px;overflow:hidden;';

  const canvas=document.createElement('canvas');
  canvas.style.cssText='position:absolute;inset:0;width:100%;height:100%;';
  container.appendChild(canvas);

  uiOverlay=document.createElement('div');
  uiOverlay.style.cssText='position:absolute;inset:0;pointer-events:none;';
  container.appendChild(uiOverlay);

  // Info box
  infoBox=document.createElement('div');
  infoBox.style.cssText='position:absolute;top:10px;left:10px;right:280px;padding:10px 14px;background:rgba(10,12,25,0.9);border:1px solid rgba(79,142,247,0.2);border-radius:10px;font-size:11.5px;color:#7a85a8;line-height:1.6;backdrop-filter:blur(12px);';
  infoBox.innerHTML='<strong style="color:#eef0ff">Acid-Base Titration</strong><br>NaOH added to HCl with phenolphthalein indicator. Watch the endpoint!';
  uiOverlay.appendChild(infoBox);

  // pH display
  phDisplay=document.createElement('div');
  phDisplay.style.cssText='position:absolute;top:10px;right:10px;width:170px;padding:10px 14px;background:rgba(10,12,25,0.95);border:1px solid rgba(0,232,122,0.25);border-radius:12px;backdrop-filter:blur(12px);';
  phDisplay.innerHTML=`
    <div style="font-family:monospace;font-size:9px;color:#00e87a;letter-spacing:2px;margin-bottom:4px">pH METER</div>
    <div id="tit-ph" style="font-family:monospace;font-size:30px;font-weight:700;color:#ff6699">2.0</div>
    <div id="tit-drops" style="font-family:monospace;font-size:10px;color:#4a5070;margin-top:4px">Drops: 0</div>
    <div id="tit-status" style="font-size:10px;color:#ff6699;margin-top:2px;font-weight:700">ACIDIC</div>
  `;
  uiOverlay.appendChild(phDisplay);

  // pH graph canvas
  graphCanvas=document.createElement('canvas');
  graphCanvas.width=260;graphCanvas.height=120;
  graphCanvas.style.cssText='position:absolute;bottom:75px;right:10px;background:rgba(10,12,25,0.9);border:1px solid rgba(79,142,247,0.15);border-radius:10px;';
  uiOverlay.appendChild(graphCanvas);
  graphCtx=graphCanvas.getContext('2d');
  drawGraph();

  // Controls
  const controls=document.createElement('div');
  controls.style.cssText='position:absolute;bottom:10px;left:0;right:0;display:flex;justify-content:center;gap:10px;pointer-events:all;';
  uiOverlay.appendChild(controls);

  const addDropBtn=makeBtn('💧 Add 1 Drop','#00d4ff',()=>addDrop());
  const addTenBtn=makeBtn('💧×10 Add 10 Drops','#4f8ef7',()=>{for(let i=0;i<10;i++)setTimeout(()=>addDrop(),i*100);});
  const autoBtnEl=makeBtn('▶ Auto Titrate','#00e87a',()=>autoTitrate());
  const rstBtn=makeBtn('🔄 Reset','#ff4466',()=>reset());

  controls.append(addDropBtn,addTenBtn,autoBtnEl,rstBtn);

  initThree(canvas,container);
}

function makeBtn(label,color,onclick){
  const b=document.createElement('button');
  b.innerHTML=label;
  b.style.cssText=`padding:9px 14px;border-radius:10px;border:1.5px solid ${color}40;background:${color}11;color:${color};font-family:inherit;font-size:11.5px;font-weight:700;cursor:pointer;transition:all 0.2s;`;
  b.onmouseenter=()=>{b.style.background=color+'22';b.style.transform='translateY(-2px)';};
  b.onmouseleave=()=>{b.style.background=color+'11';b.style.transform='none';};
  b.onclick=onclick;
  return b;
}

function initThree(canvas,container){
  const W=container.clientWidth,H=container.clientHeight;
  scene=new THREE.Scene();
  camera=new THREE.PerspectiveCamera(40,W/H,0.1,100);
  camera.position.set(0,1.5,8);
  camera.lookAt(0,-0.5,0);
  renderer=new THREE.WebGLRenderer({canvas,antialias:true,alpha:true});
  renderer.setSize(W,H);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio,2));

  scene.add(new THREE.AmbientLight(0x223355,3));
  const dl=new THREE.DirectionalLight(0xffffff,2);dl.position.set(2,5,3);scene.add(dl);

  buildBench();
  buildBurette();
  buildBeaker();
  buildStand();

  animate();
  window.addEventListener('resize',()=>{const w=container.clientWidth,h=container.clientHeight;camera.aspect=w/h;camera.updateProjectionMatrix();renderer.setSize(w,h);});
}

function buildBench(){
  const m=new THREE.Mesh(new THREE.BoxGeometry(7,0.15,3),new THREE.MeshStandardMaterial({color:0x221508,roughness:0.85}));
  m.position.y=-2.2;scene.add(m);
}

function buildStand(){
  // Retort stand rod
  const rod=new THREE.Mesh(new THREE.CylinderGeometry(0.05,0.05,4.5,8),new THREE.MeshStandardMaterial({color:0x888888,metalness:0.8,roughness:0.2}));
  rod.position.set(0,0.25,0);scene.add(rod);
  // Clamps
  const clamp=new THREE.Mesh(new THREE.BoxGeometry(0.6,0.12,0.3),new THREE.MeshStandardMaterial({color:0x666666,metalness:0.7}));
  clamp.position.set(0,2,0);scene.add(clamp);
  const base=new THREE.Mesh(new THREE.BoxGeometry(1.2,0.08,0.6),new THREE.MeshStandardMaterial({color:0x555555,metalness:0.7}));
  base.position.set(0,-2.15,0);scene.add(base);
}

function buildBurette(){
  buretteMesh=new THREE.Group();
  // Main tube
  const tube=new THREE.Mesh(new THREE.CylinderGeometry(0.1,0.1,3.6,16,1,true),new THREE.MeshStandardMaterial({color:0x88ccff,transparent:true,opacity:0.3,side:THREE.DoubleSide}));
  tube.position.y=0.2;buretteMesh.add(tube);
  // Solution fill (NaOH — clear/colorless) - just a volume indicator
  const fill=new THREE.Mesh(new THREE.CylinderGeometry(0.09,0.09,3.4*buretteLevel,16),new THREE.MeshStandardMaterial({color:0x88ccff,transparent:true,opacity:0.35}));
  fill.position.y=0.2+(3.4*buretteLevel/2-1.7);fill.userData.isFill=true;
  buretteMesh.add(fill);
  // Tip
  const tip=new THREE.Mesh(new THREE.CylinderGeometry(0.03,0.015,0.4,8),new THREE.MeshStandardMaterial({color:0x88ccff,transparent:true,opacity:0.5}));
  tip.position.y=-1.6;buretteMesh.add(tip);
  // Stopcock
  const sc=new THREE.Mesh(new THREE.CylinderGeometry(0.07,0.07,0.18,12),new THREE.MeshStandardMaterial({color:0x446688,metalness:0.5}));
  sc.position.y=-1.4;sc.rotation.z=Math.PI/2;buretteMesh.add(sc);
  buretteMesh.position.set(0,2.5,0);
  scene.add(buretteMesh);
}

function buildBeaker(){
  const group=new THREE.Group();
  // Glass
  const wall=new THREE.Mesh(new THREE.CylinderGeometry(0.65,0.6,1.6,32,1,true),new THREE.MeshStandardMaterial({color:0x88ccff,transparent:true,opacity:0.2,side:THREE.DoubleSide}));
  group.add(wall);
  const bot=new THREE.Mesh(new THREE.CircleGeometry(0.6,32),new THREE.MeshStandardMaterial({color:0x88ccff,transparent:true,opacity:0.2}));
  bot.rotation.x=-Math.PI/2;bot.position.y=-0.8;group.add(bot);
  const rim=new THREE.Mesh(new THREE.TorusGeometry(0.65,0.025,8,32),new THREE.MeshStandardMaterial({color:0xaaddff,transparent:true,opacity:0.5}));
  rim.position.y=0.8;group.add(rim);
  // Measurement lines
  for(let i=1;i<=4;i++){
    const l=new THREE.Mesh(new THREE.TorusGeometry(0.63,0.007,4,32),new THREE.MeshBasicMaterial({color:0x6688bb,transparent:true,opacity:0.4}));
    l.position.y=-0.75+i*0.35;group.add(l);
  }
  // Solution (pink - acidic with phenolphthalein)
  solutionMesh=new THREE.Mesh(
    new THREE.CylinderGeometry(0.59,0.57,1.0,32),
    new THREE.MeshStandardMaterial({color:0xff99cc,transparent:true,opacity:0.6})
  );
  solutionMesh.position.y=-0.35;
  group.add(solutionMesh);
  group.position.set(0,-1.0,0);
  scene.add(group);
}

function addDrop(){
  if(titrationDone)return;
  dropsAdded++;
  spawnDropParticle();
  buretteLevel=Math.max(0,buretteLevel-1/60);
  updateBuretteLevel();
  const t=dropsAdded/dropsToEndpoint;
  let newPh;
  if(t<0.9){newPh=2+t*5;}
  else if(t<0.98){newPh=7+(t-0.9)/0.08*5;}
  else{newPh=12;}
  targetPh=Math.min(14,newPh);
  updateUI();
  if(dropsAdded>=dropsToEndpoint){endpoint();}
}

function spawnDropParticle(){
  const geo=new THREE.SphereGeometry(0.05,8,8);
  const mat=new THREE.MeshStandardMaterial({color:0xaaddff,transparent:true,opacity:0.8});
  const mesh=new THREE.Mesh(geo,mat);
  mesh.position.set(0,1.0,0);
  mesh.userData.vy=0;
  mesh.userData.life=1;
  scene.add(mesh);
  drops.push(mesh);
}

function updateBuretteLevel(){
  buretteMesh.traverse(obj=>{
    if(obj.userData.isFill){
      const h=3.4*buretteLevel;
      obj.scale.y=buretteLevel;
      obj.position.y=0.2+(h/2-1.7);
    }
  });
}

function updateUI(){
  const phEl=document.getElementById('tit-ph');
  const dropsEl=document.getElementById('tit-drops');
  const statusEl=document.getElementById('tit-status');
  if(!phEl)return;
  ph+=(targetPh-ph)*0.15;
  phEl.textContent=ph.toFixed(1);
  dropsEl.textContent=`Drops: ${dropsAdded}`;
  if(ph<6){phEl.style.color='#ff6699';statusEl.textContent='ACIDIC';statusEl.style.color='#ff6699';}
  else if(ph<8){phEl.style.color='#22c55e';statusEl.textContent='NEAR ENDPOINT';statusEl.style.color='#22c55e';}
  else{phEl.style.color='#4f8ef7';statusEl.textContent='BASIC';statusEl.style.color='#4f8ef7';}

  // Color change: pink→colorless (HCl acidic shows no color, then at endpoint stays clear)
  if(ph<6.5){targetSolutionColor={r:1,g:0.55,b:0.72};}
  else if(ph<7.5){targetSolutionColor={r:0.88,g:0.55,b:0.72};}
  else{targetSolutionColor={r:0.53,g:0.81,b:0.98};}

  // Update graph
  graphData.push({x:dropsAdded,y:ph});
  drawGraph();
}

function endpoint(){
  titrationDone=true;
  targetSolutionColor={r:0.53,g:0.81,b:0.98}; // clear
  infoBox.innerHTML=`<strong style="color:#00e87a">✓ ENDPOINT REACHED!</strong><br>pH = ${ph.toFixed(1)}. The solution turned clear — all acid has been neutralised. <br><span style="color:#4a5070;font-size:10.5px">HCl + NaOH → NaCl + H₂O</span>`;
  if(dropInterval)clearInterval(dropInterval);
}

function autoTitrate(){
  if(titrationDone)return;
  if(dropInterval)clearInterval(dropInterval);
  dropInterval=setInterval(()=>{
    if(titrationDone){clearInterval(dropInterval);return;}
    addDrop();
  },120);
}

function reset(){
  if(dropInterval)clearInterval(dropInterval);
  titrationDone=false;dropsAdded=0;ph=2.0;targetPh=2.0;buretteLevel=1.0;
  drops.forEach(d=>{if(d.parent)d.parent.remove(d);});drops=[];
  graphData=[];
  targetSolutionColor={r:1,g:0.5,b:0.7};
  solutionColor={r:1,g:0.5,b:0.7};
  updateBuretteLevel();
  infoBox.innerHTML='<strong style="color:#eef0ff">Acid-Base Titration</strong><br>NaOH added to HCl with phenolphthalein indicator. Watch the endpoint!';
  const phEl=document.getElementById('tit-ph');
  if(phEl){phEl.textContent='2.0';phEl.style.color='#ff6699';}
  const dropsEl=document.getElementById('tit-drops');
  if(dropsEl)dropsEl.textContent='Drops: 0';
  drawGraph();
}

function drawGraph(){
  if(!graphCtx)return;
  const W=graphCanvas.width,H=graphCanvas.height;
  graphCtx.clearRect(0,0,W,H);
  graphCtx.fillStyle='rgba(10,12,25,0)';graphCtx.fillRect(0,0,W,H);
  // Axes
  graphCtx.strokeStyle='rgba(100,120,200,0.3)';graphCtx.lineWidth=1;
  graphCtx.beginPath();graphCtx.moveTo(30,10);graphCtx.lineTo(30,H-20);graphCtx.lineTo(W-10,H-20);graphCtx.stroke();
  // Labels
  graphCtx.fillStyle='rgba(100,120,200,0.6)';graphCtx.font='8px monospace';
  graphCtx.fillText('pH',5,H/2);graphCtx.fillText('14',5,14);graphCtx.fillText('0',5,H-18);
  graphCtx.fillText('drops',W/2-15,H-5);
  // Grid
  graphCtx.strokeStyle='rgba(100,120,200,0.08)';
  for(let i=1;i<=4;i++){
    const y=10+(H-30)*i/5;
    graphCtx.beginPath();graphCtx.moveTo(30,y);graphCtx.lineTo(W-10,y);graphCtx.stroke();
  }
  if(graphData.length<2)return;
  // Line
  graphCtx.strokeStyle='#00e87a';graphCtx.lineWidth=2;
  graphCtx.shadowColor='#00e87a';graphCtx.shadowBlur=6;
  graphCtx.beginPath();
  graphData.forEach((p,i)=>{
    const x=30+(p.x/dropsToEndpoint)*(W-40);
    const y=10+(1-p.y/14)*(H-30);
    i===0?graphCtx.moveTo(x,y):graphCtx.lineTo(x,y);
  });
  graphCtx.stroke();
  graphCtx.shadowBlur=0;
  // Endpoint line
  if(titrationDone){
    graphCtx.strokeStyle='rgba(255,200,0,0.5)';graphCtx.lineWidth=1;graphCtx.setLineDash([4,4]);
    const ex=30+(dropsToEndpoint/dropsToEndpoint)*(W-40);
    graphCtx.beginPath();graphCtx.moveTo(ex,10);graphCtx.lineTo(ex,H-20);graphCtx.stroke();
    graphCtx.setLineDash([]);
    graphCtx.fillStyle='rgba(255,200,0,0.7)';graphCtx.font='8px monospace';
    graphCtx.fillText('EP',ex-8,20);
  }
}

function animate(){
  animId=requestAnimationFrame(animate);
  const dt=clock.getDelta();
  const t=clock.elapsedTime;

  // Solution color
  solutionColor.r+=(targetSolutionColor.r-solutionColor.r)*0.05;
  solutionColor.g+=(targetSolutionColor.g-solutionColor.g)*0.05;
  solutionColor.b+=(targetSolutionColor.b-solutionColor.b)*0.05;
  if(solutionMesh)solutionMesh.material.color.setRGB(solutionColor.r,solutionColor.g,solutionColor.b);

  // Animate drops
  for(let i=drops.length-1;i>=0;i--){
    const d=drops[i];
    d.userData.vy-=0.02;
    d.position.y+=d.userData.vy;
    d.userData.life-=0.04;
    d.material.opacity=d.userData.life;
    if(d.userData.life<=0||d.position.y<-1.3){
      if(d.parent)d.parent.remove(d);drops.splice(i,1);
    }
  }

  // pH update
  ph+=(targetPh-ph)*0.05;
  const phEl=document.getElementById('tit-ph');
  if(phEl)phEl.textContent=ph.toFixed(1);

  renderer.render(scene,camera);
}

function destroy(){
  if(animId)cancelAnimationFrame(animId);
  if(dropInterval)clearInterval(dropInterval);
  if(renderer)renderer.dispose();
  if(scene)scene.clear();
}

window.Titration={init,destroy};
})();
