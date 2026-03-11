/* ════════════════════════════════════
   METAL + WATER REACTION — metal-water.js
   ════════════════════════════════════ */
(function(){
let scene,camera,renderer,animId;
let bubbles=[],steam=[],splashes=[];
let reactionActive=false,reactionPhase=0;
let waterColor={r:0.53,g:0.81,b:0.98};
let targetWaterColor={r:0.53,g:0.81,b:0.98};
let waterMesh,metalMesh,beakerGroup;
let uiOverlay,infoBox,phMeter;
let clock=new THREE.Clock();
let reactionMetal=null;

const METALS={
  Na:{label:'Sodium (Na)',color:0xddddcc,glow:'#88aaff',reaction:'2Na + 2H₂O → 2NaOH + H₂↑',info:'Sodium reacts vigorously with water, skating across the surface. It produces hydrogen gas (fizzing) and sodium hydroxide, turning phenolphthalein pink.',intensity:3,duration:6000,phenol:true},
  K:{label:'Potassium (K)',color:0xccbbaa,glow:'#aa88ff',reaction:'2K + 2H₂O → 2KOH + H₂↑',info:'Potassium reacts very violently — the hydrogen produced ignites spontaneously with a lilac flame! Extremely dangerous — done only in a fume hood.',intensity:5,duration:4000,phenol:true}
};

function init(container){
  container.innerHTML='';
  container.style.cssText='position:relative;width:100%;height:580px;background:linear-gradient(180deg,#07080f 0%,#0d0f1c 100%);border-radius:16px;overflow:hidden;';

  const canvas=document.createElement('canvas');
  canvas.style.cssText='position:absolute;inset:0;width:100%;height:100%;';
  container.appendChild(canvas);

  // UI overlay
  uiOverlay=document.createElement('div');
  uiOverlay.style.cssText='position:absolute;inset:0;pointer-events:none;';
  container.appendChild(uiOverlay);

  // Info box
  infoBox=document.createElement('div');
  infoBox.style.cssText='position:absolute;top:12px;left:12px;right:200px;padding:12px 16px;background:rgba(10,12,25,0.9);border:1px solid rgba(79,142,247,0.2);border-radius:12px;font-size:12px;color:#7a85a8;line-height:1.6;backdrop-filter:blur(12px);transition:all 0.4s;';
  infoBox.innerHTML='<strong style="color:#eef0ff">Drop a metal into the water beaker!</strong><br>Watch the vigorous reaction.';
  uiOverlay.appendChild(infoBox);

  // pH meter display
  phMeter=document.createElement('div');
  phMeter.style.cssText='position:absolute;top:12px;right:12px;width:140px;padding:10px 14px;background:rgba(10,12,25,0.95);border:1px solid rgba(0,232,122,0.25);border-radius:12px;backdrop-filter:blur(12px);';
  phMeter.innerHTML=`
    <div style="font-family:monospace;font-size:9px;color:#00e87a;letter-spacing:2px;margin-bottom:6px">pH METER</div>
    <div id="mw-ph-val" style="font-family:monospace;font-size:28px;font-weight:700;color:#eef0ff">7.0</div>
    <div style="height:4px;background:#1a1d2e;border-radius:4px;margin-top:6px;overflow:hidden">
      <div id="mw-ph-bar" style="height:100%;width:50%;background:linear-gradient(90deg,#3b82f6,#22c55e);border-radius:4px;transition:all 1s"></div>
    </div>
    <div style="font-size:9px;color:#4a5070;margin-top:4px;font-family:monospace">NEUTRAL</div>
  `;
  uiOverlay.appendChild(phMeter);

  // Metal buttons
  const btnRow=document.createElement('div');
  btnRow.style.cssText='position:absolute;bottom:12px;left:0;right:0;display:flex;justify-content:center;gap:14px;pointer-events:all;';
  uiOverlay.appendChild(btnRow);

  Object.entries(METALS).forEach(([id,m])=>{
    const btn=document.createElement('button');
    btn.style.cssText=`padding:12px 24px;border-radius:12px;border:2px solid rgba(100,120,255,0.25);background:rgba(17,19,39,0.95);color:#eef0ff;font-family:inherit;font-size:13px;font-weight:700;cursor:pointer;transition:all 0.25s;letter-spacing:0.3px;`;
    btn.innerHTML=`<span style="font-size:18px">${id==='Na'?'🧊':'⬜'}</span><br>${m.label}`;
    btn.onmouseenter=()=>{btn.style.borderColor=m.glow;btn.style.boxShadow=`0 4px 16px ${m.glow}44`;btn.style.transform='translateY(-2px)';};
    btn.onmouseleave=()=>{btn.style.borderColor='rgba(100,120,255,0.25)';btn.style.boxShadow='none';btn.style.transform='none';};
    btn.onclick=()=>startReaction(id,container);
    btnRow.appendChild(btn);
  });

  const resetBtn=document.createElement('button');
  resetBtn.textContent='🔄 Reset';
  resetBtn.style.cssText='position:absolute;bottom:12px;right:12px;padding:8px 16px;background:rgba(255,68,102,0.1);border:1px solid rgba(255,68,102,0.25);color:#ff4466;border-radius:8px;font-size:11px;font-weight:700;cursor:pointer;pointer-events:all;font-family:inherit;';
  resetBtn.onclick=()=>resetScene();
  uiOverlay.appendChild(resetBtn);

  initThree(canvas,container);
}

function initThree(canvas,container){
  const W=container.clientWidth,H=container.clientHeight;
  scene=new THREE.Scene();
  camera=new THREE.PerspectiveCamera(42,W/H,0.1,100);
  camera.position.set(0,2.5,7);
  camera.lookAt(0,0,0);
  renderer=new THREE.WebGLRenderer({canvas,antialias:true,alpha:true});
  renderer.setSize(W,H);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio,2));

  scene.add(new THREE.AmbientLight(0x223355,3));
  const dl=new THREE.DirectionalLight(0xffffff,1.5);
  dl.position.set(2,5,3);
  scene.add(dl);

  buildBench();
  buildBeaker();
  buildIndicator();

  animate();
  window.addEventListener('resize',()=>{
    const w=container.clientWidth,h=container.clientHeight;
    camera.aspect=w/h;camera.updateProjectionMatrix();
    renderer.setSize(w,h);
  });
}

function buildBench(){
  const bench=new THREE.Mesh(
    new THREE.BoxGeometry(8,0.18,3),
    new THREE.MeshStandardMaterial({color:0x221508,roughness:0.85})
  );
  bench.position.y=-1.6;
  scene.add(bench);
}

function buildBeaker(){
  beakerGroup=new THREE.Group();
  // Glass walls
  const wallGeo=new THREE.CylinderGeometry(0.9,0.8,2.2,32,1,true);
  const glassMat=new THREE.MeshStandardMaterial({color:0x88ccff,transparent:true,opacity:0.18,side:THREE.DoubleSide,roughness:0,metalness:0.1});
  beakerGroup.add(new THREE.Mesh(wallGeo,glassMat));
  // Bottom
  const bot=new THREE.Mesh(new THREE.CircleGeometry(0.8,32),new THREE.MeshStandardMaterial({color:0x88ccff,transparent:true,opacity:0.25}));
  bot.rotation.x=-Math.PI/2;bot.position.y=-1.1;
  beakerGroup.add(bot);
  // Rim
  const rim=new THREE.Mesh(new THREE.TorusGeometry(0.9,0.035,8,32),new THREE.MeshStandardMaterial({color:0xaaddff,transparent:true,opacity:0.5}));
  rim.position.y=1.1;
  beakerGroup.add(rim);
  // Measurement lines
  for(let i=1;i<=3;i++){
    const line=new THREE.Mesh(new THREE.TorusGeometry(0.85,0.008,4,32),new THREE.MeshBasicMaterial({color:0x6688bb,transparent:true,opacity:0.4}));
    line.position.y=-0.9+i*0.5;
    beakerGroup.add(line);
  }
  // Water inside
  waterMesh=new THREE.Mesh(
    new THREE.CylinderGeometry(0.83,0.78,1.4,32),
    new THREE.MeshStandardMaterial({color:0x88cffa,transparent:true,opacity:0.55,roughness:0,metalness:0.1})
  );
  waterMesh.position.y=-0.5;
  beakerGroup.add(waterMesh);

  beakerGroup.position.set(0,-0.4,0);
  scene.add(beakerGroup);
}

function buildIndicator(){
  // Phenolphthalein bottle
  const bottle=new THREE.Group();
  const body=new THREE.Mesh(new THREE.CylinderGeometry(0.12,0.14,0.55,12),new THREE.MeshStandardMaterial({color:0xff9999,transparent:true,opacity:0.7}));
  body.position.y=0.27;
  bottle.add(body);
  const cap=new THREE.Mesh(new THREE.CylinderGeometry(0.08,0.08,0.12,12),new THREE.MeshStandardMaterial({color:0xcc3333}));
  cap.position.y=0.61;
  bottle.add(cap);
  bottle.position.set(2.5,-1.25,0.5);
  scene.add(bottle);

  // Label
  const labelMesh=new THREE.Mesh(new THREE.PlaneGeometry(0.2,0.14),new THREE.MeshBasicMaterial({color:0xffffff,side:THREE.DoubleSide}));
  labelMesh.position.set(2.5,-1.2,0.62);
  scene.add(labelMesh);
}

function startReaction(metalId,container){
  if(reactionActive) return;
  reactionActive=true;
  reactionMetal=METALS[metalId];
  const metal=reactionMetal;

  infoBox.innerHTML=`<strong style="color:#00d4ff">${metal.reaction}</strong><br><span style="font-size:11px;color:#7a85a8">${metal.info}</span>`;

  // Drop metal animation
  metalMesh=new THREE.Mesh(
    new THREE.BoxGeometry(0.22,0.22,0.22),
    new THREE.MeshStandardMaterial({color:metal.color,metalness:0.6,roughness:0.4})
  );
  metalMesh.position.set(0,3,0);
  scene.add(metalMesh);

  // Drop
  let startTime=performance.now();
  function dropMetal(){
    const elapsed=(performance.now()-startTime)/1000;
    metalMesh.position.y=3-9.8*elapsed*elapsed*0.25;
    metalMesh.rotation.x+=0.08;metalMesh.rotation.z+=0.05;
    if(metalMesh.position.y>0.2){
      requestAnimationFrame(dropMetal);
    } else {
      metalMesh.position.y=0.1;
      startReactionPhase(container,metal);
    }
  }
  dropMetal();
}

function startReactionPhase(container,metal){
  reactionPhase=1;
  const intensity=metal.intensity;
  // Generate bubbles and steam
  const bubleInterval=setInterval(()=>{
    if(!reactionActive){clearInterval(bubleInterval);return;}
    for(let i=0;i<intensity*2;i++) spawnBubble();
    for(let i=0;i<intensity;i++) spawnSteam();
  },80);

  // Phenolphthalein color change (pink)
  if(metal.phenol){
    setTimeout(()=>{
      targetWaterColor={r:1,g:0.5,b:0.7};
      updatePhMeter(12.5,'STRONGLY BASIC','#ff6699');
    },1500);
  }

  // Camera shake for K
  if(metal.intensity>=5){
    let shakeT=0;
    const shakeInt=setInterval(()=>{
      shakeT++;
      camera.position.x=Math.sin(shakeT*0.8)*0.04;
      camera.position.y=2.5+Math.sin(shakeT*1.2)*0.03;
      if(shakeT>60){clearInterval(shakeInt);camera.position.set(0,2.5,7);}
    },16);
  }

  setTimeout(()=>{
    reactionActive=false;
    clearInterval(bubleInterval);
  },metal.duration);
}

function spawnBubble(){
  const geo=new THREE.SphereGeometry(0.03+Math.random()*0.05,8,8);
  const mat=new THREE.MeshStandardMaterial({color:0xffffff,transparent:true,opacity:0.5,roughness:0,metalness:0.1});
  const mesh=new THREE.Mesh(geo,mat);
  mesh.position.set((Math.random()-0.5)*1.4,-0.3,(Math.random()-0.5)*1.4);
  mesh.userData.vy=0.02+Math.random()*0.03;
  mesh.userData.life=1.0;
  beakerGroup.add(mesh);
  bubbles.push(mesh);
}

function spawnSteam(){
  const geo=new THREE.SphereGeometry(0.08+Math.random()*0.06,6,6);
  const mat=new THREE.MeshBasicMaterial({color:0xffffff,transparent:true,opacity:0.15,blending:THREE.AdditiveBlending});
  const mesh=new THREE.Mesh(geo,mat);
  mesh.position.set((Math.random()-0.5)*0.8,1.5,(Math.random()-0.5)*0.8);
  mesh.userData.vy=0.02+Math.random()*0.02;
  mesh.userData.vx=(Math.random()-0.5)*0.01;
  mesh.userData.life=1.0;
  scene.add(mesh);
  steam.push(mesh);
}

function updatePhMeter(ph,label,barColor){
  const val=document.getElementById('mw-ph-val');
  const bar=document.getElementById('mw-ph-bar');
  if(!val||!bar)return;
  let current=7.0,target=ph;
  const iv=setInterval(()=>{
    current+=(target-current)*0.1;
    val.textContent=current.toFixed(1);
    bar.style.width=(current/14*100)+'%';
    bar.style.background=barColor;
    if(Math.abs(current-target)<0.05)clearInterval(iv);
  },100);
  val.closest('[style]').querySelector('[style*="NEUTRAL"]').textContent=label;
}

function resetScene(){
  reactionActive=false;
  bubbles.forEach(b=>{if(b.parent)b.parent.remove(b);});
  steam.forEach(s=>{if(s.parent)s.parent.remove(s);});
  bubbles=[];steam=[];
  if(metalMesh&&metalMesh.parent){metalMesh.parent.remove(metalMesh);metalMesh=null;}
  targetWaterColor={r:0.53,g:0.81,b:0.98};
  infoBox.innerHTML='<strong style="color:#eef0ff">Drop a metal into the water beaker!</strong><br>Watch the vigorous reaction.';
  updatePhMeter(7.0,'NEUTRAL','linear-gradient(90deg,#3b82f6,#22c55e)');
}

function animate(){
  animId=requestAnimationFrame(animate);
  const dt=clock.getDelta();

  // Water color lerp
  waterColor.r+=(targetWaterColor.r-waterColor.r)*0.03;
  waterColor.g+=(targetWaterColor.g-waterColor.g)*0.03;
  waterColor.b+=(targetWaterColor.b-waterColor.b)*0.03;
  if(waterMesh) waterMesh.material.color.setRGB(waterColor.r,waterColor.g,waterColor.b);

  // Water ripple
  const t=clock.elapsedTime;
  if(waterMesh&&reactionActive){
    waterMesh.scale.x=1+Math.sin(t*12)*0.015;
    waterMesh.scale.z=1+Math.cos(t*11)*0.015;
  }

  // Bubbles
  for(let i=bubbles.length-1;i>=0;i--){
    const b=bubbles[i];
    b.position.y+=b.userData.vy;
    b.userData.life-=0.025;
    b.material.opacity=b.userData.life*0.5;
    b.scale.setScalar(0.5+b.userData.life*0.5);
    if(b.userData.life<=0||b.position.y>1.15){
      if(b.parent)b.parent.remove(b);
      bubbles.splice(i,1);
    }
  }

  // Steam
  for(let i=steam.length-1;i>=0;i--){
    const s=steam[i];
    s.position.y+=s.userData.vy;
    s.position.x+=s.userData.vx;
    s.userData.life-=0.01;
    s.material.opacity=s.userData.life*0.15;
    s.scale.addScalar(0.01);
    if(s.userData.life<=0){
      if(s.parent)s.parent.remove(s);
      steam.splice(i,1);
    }
  }

  renderer.render(scene,camera);
}

function destroy(){
  if(animId)cancelAnimationFrame(animId);
  if(renderer)renderer.dispose();
  if(scene)scene.clear();
}

window.MetalWater={init,destroy};
})();
