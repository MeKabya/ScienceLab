/* ════════════════════════════════════
   GAS PRODUCTION — gas-production.js
   ════════════════════════════════════ */
(function(){
let scene,camera,renderer,animId;
let clock=new THREE.Clock();
let bubbles=[],balloonScale=0;
let limewaterMesh,limewaterColor={r:0.9,g:0.95,b:1.0};
let targetLimewaterColor={r:0.9,g:0.95,b:1.0};
let balloonMesh,balloonGroup;
let reactionRunning=false;
let flaskGroup,acidLevel=1.0;
let gasParticles=[];

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
  infoBox.id='gp-info';
  infoBox.style.cssText='position:absolute;top:10px;left:10px;right:10px;padding:10px 14px;background:rgba(10,12,25,0.9);border:1px solid rgba(79,142,247,0.2);border-radius:10px;font-size:12px;color:#7a85a8;line-height:1.6;backdrop-filter:blur(12px);';
  infoBox.innerHTML='<strong style="color:#eef0ff">CO₂ Gas Production</strong><br>CaCO₃ (marble chips) + HCl → CaCl₂ + H₂O + CO₂↑<br>The gas inflates the balloon and turns limewater milky!';
  ui.appendChild(infoBox);

  // Status panel
  const statusPanel=document.createElement('div');
  statusPanel.style.cssText='position:absolute;top:10px;right:10px;width:160px;padding:10px 14px;background:rgba(10,12,25,0.95);border:1px solid rgba(0,232,122,0.25);border-radius:12px;backdrop-filter:blur(12px);';
  statusPanel.innerHTML=`
    <div style="font-family:monospace;font-size:9px;color:#00e87a;letter-spacing:2px;margin-bottom:6px">CO₂ METER</div>
    <div id="gp-vol" style="font-family:monospace;font-size:24px;font-weight:700;color:#eef0ff">0<span style="font-size:12px;color:#4a5070"> mL</span></div>
    <div style="height:4px;background:#1a1d2e;border-radius:4px;margin-top:6px;overflow:hidden">
      <div id="gp-bar" style="height:100%;width:0%;background:linear-gradient(90deg,#4f8ef7,#00e87a);border-radius:4px;transition:width 0.3s"></div>
    </div>
    <div id="gp-balloon-pct" style="font-size:9px;color:#4a5070;margin-top:4px;font-family:monospace">Balloon: 0%</div>
  `;
  ui.appendChild(statusPanel);

  // Controls
  const controls=document.createElement('div');
  controls.style.cssText='position:absolute;bottom:10px;left:0;right:0;display:flex;justify-content:center;gap:10px;pointer-events:all;';
  ui.appendChild(controls);

  const startBtn=document.createElement('button');
  startBtn.textContent='⚗️ Start Reaction';
  startBtn.style.cssText='padding:11px 22px;border-radius:12px;border:1.5px solid rgba(0,232,122,0.4);background:rgba(0,232,122,0.1);color:#00e87a;font-family:inherit;font-size:13px;font-weight:700;cursor:pointer;transition:all 0.25s;';
  startBtn.onclick=()=>startReaction();
  controls.appendChild(startBtn);

  const rstBtn=document.createElement('button');
  rstBtn.textContent='🔄 Reset';
  rstBtn.style.cssText='padding:11px 18px;border-radius:12px;border:1.5px solid rgba(255,68,102,0.3);background:rgba(255,68,102,0.08);color:#ff4466;font-family:inherit;font-size:12px;font-weight:700;cursor:pointer;transition:all 0.25s;';
  rstBtn.onclick=()=>resetScene();
  controls.appendChild(rstBtn);

  initThree(canvas,container);
}

function initThree(canvas,container){
  const W=container.clientWidth,H=container.clientHeight;
  scene=new THREE.Scene();
  camera=new THREE.PerspectiveCamera(40,W/H,0.1,100);
  camera.position.set(0,1,9);
  camera.lookAt(0,-0.2,0);
  renderer=new THREE.WebGLRenderer({canvas,antialias:true,alpha:true});
  renderer.setSize(W,H);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio,2));
  scene.add(new THREE.AmbientLight(0x223355,4));
  const dl=new THREE.DirectionalLight(0xffffff,2);dl.position.set(3,5,4);scene.add(dl);

  buildBench();
  buildFlask();
  buildTubing();
  buildBalloon();
  buildLimewaterBeaker();
  buildMarbleChips();

  animate();
  window.addEventListener('resize',()=>{const w=container.clientWidth,h=container.clientHeight;camera.aspect=w/h;camera.updateProjectionMatrix();renderer.setSize(w,h);});
}

function buildBench(){
  scene.add(Object.assign(new THREE.Mesh(new THREE.BoxGeometry(8,0.12,3),new THREE.MeshStandardMaterial({color:0x221508,roughness:0.85})),{position:new THREE.Vector3(0,-2.5,0)}));
}

function buildFlask(){
  flaskGroup=new THREE.Group();
  // Round flask body
  const body=new THREE.Mesh(new THREE.SphereGeometry(0.75,32,32),new THREE.MeshStandardMaterial({color:0x88ccff,transparent:true,opacity:0.2,side:THREE.DoubleSide}));
  flaskGroup.add(body);
  // Neck
  const neck=new THREE.Mesh(new THREE.CylinderGeometry(0.16,0.22,0.8,16,1,true),new THREE.MeshStandardMaterial({color:0x88ccff,transparent:true,opacity:0.25,side:THREE.DoubleSide}));
  neck.position.y=0.9;flaskGroup.add(neck);
  // Acid inside
  const acidMesh=new THREE.Mesh(
    new THREE.SphereGeometry(0.72,32,16,0,Math.PI*2,Math.PI*0.35,Math.PI*0.65),
    new THREE.MeshStandardMaterial({color:0xddff88,transparent:true,opacity:0.5})
  );
  acidMesh.userData.isAcid=true;
  flaskGroup.add(acidMesh);

  flaskGroup.position.set(-2.3,-1.3,0);
  scene.add(flaskGroup);
}

function buildMarbleChips(){
  for(let i=0;i<8;i++){
    const chip=new THREE.Mesh(
      new THREE.IcosahedronGeometry(0.07+Math.random()*0.04,0),
      new THREE.MeshStandardMaterial({color:0xddddcc,roughness:0.9})
    );
    chip.position.set(-2.3+(Math.random()-0.5)*0.8,-1.9+Math.random()*0.2,(Math.random()-0.5)*0.5);
    chip.rotation.set(Math.random()*Math.PI,Math.random()*Math.PI,Math.random()*Math.PI);
    chip.userData.isChip=true;
    scene.add(chip);
  }
}

function buildTubing(){
  // Curved tube from flask to limewater
  const curve=new THREE.CatmullRomCurve3([
    new THREE.Vector3(-2.3,0.3,0),
    new THREE.Vector3(-1.5,1.2,0),
    new THREE.Vector3(0,1.3,0),
    new THREE.Vector3(1.5,0.8,0),
    new THREE.Vector3(2.3,0.2,0)
  ]);
  const geo=new THREE.TubeGeometry(curve,30,0.04,8,false);
  const mat=new THREE.MeshStandardMaterial({color:0xaa8855,roughness:0.7,transparent:true,opacity:0.8});
  scene.add(new THREE.Mesh(geo,mat));

  // Tube to balloon
  const curve2=new THREE.CatmullRomCurve3([
    new THREE.Vector3(-2.3,0.3,0),
    new THREE.Vector3(-2.3,1.2,0),
    new THREE.Vector3(-2.3,2.0,0)
  ]);
  const geo2=new THREE.TubeGeometry(curve2,10,0.03,8,false);
  scene.add(new THREE.Mesh(geo2,mat));
}

function buildBalloon(){
  balloonGroup=new THREE.Group();
  balloonMesh=new THREE.Mesh(
    new THREE.SphereGeometry(0.25,32,32),
    new THREE.MeshStandardMaterial({color:0x88aaff,transparent:true,opacity:0.7,roughness:0.2,metalness:0.1,side:THREE.FrontSide})
  );
  balloonGroup.add(balloonMesh);
  const knot=new THREE.Mesh(new THREE.CylinderGeometry(0.04,0.04,0.1,8),new THREE.MeshStandardMaterial({color:0x5566cc}));
  knot.position.y=-0.32;balloonGroup.add(knot);
  balloonGroup.position.set(-2.3,2.3,0);
  balloonGroup.scale.set(0.01,0.01,0.01);
  scene.add(balloonGroup);
}

function buildLimewaterBeaker(){
  const g=new THREE.Group();
  const wall=new THREE.Mesh(new THREE.CylinderGeometry(0.55,0.5,1.2,32,1,true),new THREE.MeshStandardMaterial({color:0x88ccff,transparent:true,opacity:0.2,side:THREE.DoubleSide}));
  g.add(wall);
  const bot=new THREE.Mesh(new THREE.CircleGeometry(0.5,32),new THREE.MeshStandardMaterial({color:0x88ccff,transparent:true,opacity:0.2}));
  bot.rotation.x=-Math.PI/2;bot.position.y=-0.6;g.add(bot);
  limewaterMesh=new THREE.Mesh(
    new THREE.CylinderGeometry(0.49,0.47,0.8,32),
    new THREE.MeshStandardMaterial({color:0xe8f0ff,transparent:true,opacity:0.45})
  );
  limewaterMesh.position.y=-0.25;g.add(limewaterMesh);
  // Label
  const lbl=new THREE.Mesh(new THREE.PlaneGeometry(0.5,0.12),new THREE.MeshBasicMaterial({color:0xffffff,side:THREE.DoubleSide}));
  lbl.position.set(0,0.1,0.56);g.add(lbl);
  g.position.set(2.3,-1.5,0);
  scene.add(g);
}

let co2Vol=0;
function startReaction(){
  if(reactionRunning)return;
  reactionRunning=true;

  const infoBox=document.getElementById('gp-info');
  if(infoBox)infoBox.innerHTML='<strong style="color:#00e87a">⚗️ Reaction in progress...</strong><br>CO₂ bubbling through acid... inflating balloon... turning limewater milky!';

  const interval=setInterval(()=>{
    if(!reactionRunning){clearInterval(interval);return;}
    spawnBubbles();
    co2Vol=Math.min(240,co2Vol+1.5);
    balloonScale=Math.min(1,co2Vol/150);
    balloonGroup.scale.setScalar(balloonScale);

    // Limewater turns milky
    const t=co2Vol/240;
    targetLimewaterColor={r:0.9,g:0.9+t*0.1,b:0.9+t*0.1};
    // Actually gets white/milky
    if(t>0.3)targetLimewaterColor={r:0.9+t*0.1,g:0.9+t*0.1,b:0.9+t*0.1};

    const volEl=document.getElementById('gp-vol');
    const barEl=document.getElementById('gp-bar');
    const bPct=document.getElementById('gp-balloon-pct');
    if(volEl)volEl.innerHTML=co2Vol.toFixed(0)+'<span style="font-size:12px;color:#4a5070"> mL</span>';
    if(barEl)barEl.style.width=(co2Vol/240*100)+'%';
    if(bPct)bPct.textContent=`Balloon: ${(balloonScale*100).toFixed(0)}%`;

    if(co2Vol>=240){
      clearInterval(interval);reactionRunning=false;
      if(infoBox)infoBox.innerHTML='<strong style="color:#00e87a">✓ Reaction complete!</strong><br>Balloon fully inflated with CO₂. Limewater turned milky: Ca(OH)₂ + CO₂ → CaCO₃↓ + H₂O';
    }
  },80);
}

function spawnBubbles(){
  for(let i=0;i<2+Math.floor(balloonScale*3);i++){
    const geo=new THREE.SphereGeometry(0.025+Math.random()*0.03,6,6);
    const mat=new THREE.MeshBasicMaterial({color:0xffffff,transparent:true,opacity:0.35,blending:THREE.AdditiveBlending});
    const mesh=new THREE.Mesh(geo,mat);
    mesh.position.set(-2.3+(Math.random()-0.5)*0.6,-1.5+Math.random()*0.3,Math.random()*0.3);
    mesh.userData.vy=0.018+Math.random()*0.015;
    mesh.userData.life=1.0;
    scene.add(mesh);
    bubbles.push(mesh);

    // Also bubbles in limewater beaker
    const geo2=new THREE.SphereGeometry(0.02+Math.random()*0.025,6,6);
    const mesh2=new THREE.Mesh(geo2,new THREE.MeshBasicMaterial({color:0xffffff,transparent:true,opacity:0.3}));
    mesh2.position.set(2.3+(Math.random()-0.5)*0.8,-1.5+Math.random()*0.2,0);
    mesh2.userData.vy=0.015+Math.random()*0.012;
    mesh2.userData.life=1.0;
    scene.add(mesh2);
    bubbles.push(mesh2);
  }
}

function resetScene(){
  reactionRunning=false;
  bubbles.forEach(b=>{if(b.parent)b.parent.remove(b);});bubbles=[];
  co2Vol=0;balloonScale=0;
  balloonGroup.scale.set(0.01,0.01,0.01);
  targetLimewaterColor={r:0.9,g:0.95,b:1.0};
  const infoBox=document.getElementById('gp-info');
  if(infoBox)infoBox.innerHTML='<strong style="color:#eef0ff">CO₂ Gas Production</strong><br>CaCO₃ (marble chips) + HCl → CaCl₂ + H₂O + CO₂↑<br>The gas inflates the balloon and turns limewater milky!';
  const volEl=document.getElementById('gp-vol');
  if(volEl)volEl.innerHTML='0<span style="font-size:12px;color:#4a5070"> mL</span>';
  const barEl=document.getElementById('gp-bar');
  if(barEl)barEl.style.width='0%';
  const bPct=document.getElementById('gp-balloon-pct');
  if(bPct)bPct.textContent='Balloon: 0%';
}

function animate(){
  animId=requestAnimationFrame(animate);
  const t=clock.getElapsedTime();

  // Limewater color
  limewaterColor.r+=(targetLimewaterColor.r-limewaterColor.r)*0.03;
  limewaterColor.g+=(targetLimewaterColor.g-limewaterColor.g)*0.03;
  limewaterColor.b+=(targetLimewaterColor.b-limewaterColor.b)*0.03;
  if(limewaterMesh)limewaterMesh.material.color.setRGB(limewaterColor.r,limewaterColor.g,limewaterColor.b);

  // Balloon sway
  if(balloonGroup){
    balloonGroup.rotation.z=Math.sin(t*1.2)*0.08*balloonScale;
    // Make balloon slightly translucent
    if(balloonMesh){
      balloonMesh.material.color.setHSL(0.62,0.6,0.4+balloonScale*0.15);
      balloonMesh.material.opacity=0.5+balloonScale*0.3;
    }
  }

  // Bubbles
  for(let i=bubbles.length-1;i>=0;i--){
    const b=bubbles[i];
    b.position.y+=b.userData.vy;
    b.position.x+=(Math.random()-0.5)*0.005;
    b.userData.life-=0.022;
    b.material.opacity=b.userData.life*0.35;
    if(b.userData.life<=0||b.position.y>0.5){
      if(b.parent)b.parent.remove(b);bubbles.splice(i,1);
    }
  }

  renderer.render(scene,camera);
}

function destroy(){
  if(animId)cancelAnimationFrame(animId);
  if(renderer)renderer.dispose();
  if(scene)scene.clear();
}

window.GasProduction={init,destroy};
})();
