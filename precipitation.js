/* ════════════════════════════════════
   PRECIPITATION REACTIONS — precipitation.js
   ════════════════════════════════════ */
(function(){
let scene,camera,renderer,animId;
let clock=new THREE.Clock();
let precipParticles=[],precipMeshes=[];
let selectedTube=null,mixResult=null;
let tubeGroups=[];

const SOLUTIONS=[
  {id:'AgNO3',label:'AgNO₃',color:0xdddddd,solColor:'#ccddff',info:'Silver nitrate — clear solution'},
  {id:'NaCl', label:'NaCl', color:0xffffff,solColor:'#e8f0ff',info:'Sodium chloride — clear solution'},
  {id:'Pb(NO3)2',label:'Pb(NO₃)₂',color:0xeeeedd,solColor:'#fffde8',info:'Lead nitrate — clear solution'},
  {id:'KI',   label:'KI',   color:0xffffcc,solColor:'#fffff0',info:'Potassium iodide — clear solution'},
  {id:'BaCl2',label:'BaCl₂',color:0xddeeff,solColor:'#ddeeff',info:'Barium chloride — clear solution'},
  {id:'Na2SO4',label:'Na₂SO₄',color:0xeeffee,solColor:'#eeffee',info:'Sodium sulfate — clear solution'}
];

const REACTIONS={
  'AgNO3+NaCl':{product:'AgCl',precipColor:'#ffffff',precipHex:0xffffff,pName:'Silver chloride (AgCl)',type:'White precipitate',equation:'AgNO₃ + NaCl → AgCl↓ + NaNO₃',desc:'White curdy precipitate of silver chloride forms. This is a classic test for chloride ions.'},
  'NaCl+AgNO3':{product:'AgCl',precipColor:'#ffffff',precipHex:0xffffff,pName:'Silver chloride (AgCl)',type:'White precipitate',equation:'NaCl + AgNO₃ → AgCl↓ + NaNO₃',desc:'White curdy precipitate of silver chloride forms.'},
  'Pb(NO3)2+KI':{product:'PbI2',precipColor:'#ffd700',precipHex:0xffd700,pName:'Lead iodide (PbI₂)',type:'Yellow precipitate',equation:'Pb(NO₃)₂ + 2KI → PbI₂↓ + 2KNO₃',desc:'Spectacular bright yellow precipitate! Lead iodide is sometimes called "gold rain" for its glistening appearance.'},
  'KI+Pb(NO3)2':{product:'PbI2',precipColor:'#ffd700',precipHex:0xffd700,pName:'Lead iodide (PbI₂)',type:'Yellow precipitate',equation:'2KI + Pb(NO₃)₂ → PbI₂↓ + 2KNO₃',desc:'Golden yellow precipitate of lead iodide forms.'},
  'BaCl2+Na2SO4':{product:'BaSO4',precipColor:'#f0f0f0',precipHex:0xf0f0f0,pName:'Barium sulfate (BaSO₄)',type:'White precipitate',equation:'BaCl₂ + Na₂SO₄ → BaSO₄↓ + 2NaCl',desc:'Dense white precipitate of barium sulfate. BaSO₄ is very insoluble — used in barium meals for medical X-rays.'},
  'Na2SO4+BaCl2':{product:'BaSO4',precipColor:'#f0f0f0',precipHex:0xf0f0f0,pName:'Barium sulfate (BaSO₄)',type:'White precipitate',equation:'Na₂SO₄ + BaCl₂ → BaSO₄↓ + 2NaCl',desc:'Dense white precipitate forms.'}
};

let infoBox,resultBox;

function init(container){
  container.innerHTML='';
  container.style.cssText='position:relative;width:100%;height:580px;background:linear-gradient(180deg,#07080f,#0d0f1c);border-radius:16px;overflow:hidden;';

  const canvas=document.createElement('canvas');
  canvas.style.cssText='position:absolute;inset:0;width:100%;height:100%;';
  container.appendChild(canvas);

  const ui=document.createElement('div');
  ui.style.cssText='position:absolute;inset:0;pointer-events:none;';
  container.appendChild(ui);

  infoBox=document.createElement('div');
  infoBox.style.cssText='position:absolute;top:10px;left:10px;right:10px;padding:10px 14px;background:rgba(10,12,25,0.9);border:1px solid rgba(79,142,247,0.2);border-radius:10px;font-size:12px;color:#7a85a8;line-height:1.5;backdrop-filter:blur(12px);';
  infoBox.innerHTML='<strong style="color:#eef0ff">Precipitation Reactions</strong>  —  Click a test tube, then click another to mix them!';
  ui.appendChild(infoBox);

  resultBox=document.createElement('div');
  resultBox.style.cssText='position:absolute;bottom:65px;left:10px;right:10px;padding:10px 14px;background:rgba(10,12,25,0.9);border:1px solid rgba(0,212,255,0.2);border-radius:10px;font-size:12px;color:#7a85a8;line-height:1.6;backdrop-filter:blur(12px);display:none;';
  ui.appendChild(resultBox);

  // Tube labels tray
  const tray=document.createElement('div');
  tray.style.cssText='position:absolute;bottom:10px;left:0;right:0;display:flex;justify-content:center;gap:8px;pointer-events:all;padding:0 10px;';
  ui.appendChild(tray);

  SOLUTIONS.forEach((sol,i)=>{
    const btn=document.createElement('div');
    btn.style.cssText=`flex:1;max-width:80px;text-align:center;cursor:pointer;padding:8px 4px;border-radius:10px;border:1.5px solid rgba(100,120,255,0.2);background:rgba(17,19,39,0.85);transition:all 0.2s;`;
    btn.innerHTML=`<div style="width:12px;height:12px;border-radius:50%;background:${sol.solColor};border:1px solid rgba(255,255,255,0.3);margin:0 auto 4px"></div><span style="font-family:monospace;font-size:9px;color:#7a85a8">${sol.label}</span>`;
    btn.onclick=()=>selectSolution(sol,i,btn);
    btn.dataset.idx=i;
    tray.appendChild(btn);
  });

  const rstBtn=document.createElement('button');
  rstBtn.textContent='🔄 Reset';
  rstBtn.style.cssText='position:absolute;top:10px;right:10px;padding:7px 12px;background:rgba(255,68,102,0.1);border:1px solid rgba(255,68,102,0.25);color:#ff4466;border-radius:8px;font-size:10px;font-weight:700;cursor:pointer;pointer-events:all;font-family:inherit;';
  rstBtn.onclick=()=>resetScene();
  ui.appendChild(rstBtn);

  initThree(canvas,container);
}

function initThree(canvas,container){
  const W=container.clientWidth,H=container.clientHeight;
  scene=new THREE.Scene();
  camera=new THREE.PerspectiveCamera(38,W/H,0.1,100);
  camera.position.set(0,1,9);
  camera.lookAt(0,-0.5,0);
  renderer=new THREE.WebGLRenderer({canvas,antialias:true,alpha:true});
  renderer.setSize(W,H);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio,2));
  scene.add(new THREE.AmbientLight(0x223355,4));
  const dl=new THREE.DirectionalLight(0xffffff,2);dl.position.set(2,4,3);scene.add(dl);

  buildBench();
  buildTubeRack();
  buildTestTubes();
  buildMixingBeaker();

  animate();
  window.addEventListener('resize',()=>{const w=container.clientWidth,h=container.clientHeight;camera.aspect=w/h;camera.updateProjectionMatrix();renderer.setSize(w,h);});
}

function buildBench(){
  scene.add(Object.assign(new THREE.Mesh(new THREE.BoxGeometry(8,0.12,3),new THREE.MeshStandardMaterial({color:0x221508,roughness:0.85})),{position:new THREE.Vector3(0,-2.3,0)}));
}

function buildTubeRack(){
  const rack=new THREE.Mesh(new THREE.BoxGeometry(5.5,0.08,0.5),new THREE.MeshStandardMaterial({color:0x3a2510,roughness:0.9}));
  rack.position.set(0,-1.65,0.5);scene.add(rack);
  // holes
  for(let i=0;i<6;i++){
    const hole=new THREE.Mesh(new THREE.CylinderGeometry(0.16,0.16,0.1,12),new THREE.MeshStandardMaterial({color:0x2a1808}));
    hole.position.set(-2.5+i*1.0,-1.64,0.5);scene.add(hole);
  }
}

function buildTestTubes(){
  SOLUTIONS.forEach((sol,i)=>{
    const group=new THREE.Group();
    // Tube
    const wallGeo=new THREE.CylinderGeometry(0.12,0.12,1.8,16,1,true);
    const mat=new THREE.MeshStandardMaterial({color:0xaaddff,transparent:true,opacity:0.22,side:THREE.DoubleSide});
    group.add(new THREE.Mesh(wallGeo,mat));
    // Bottom dome
    const dome=new THREE.Mesh(new THREE.SphereGeometry(0.12,16,8,0,Math.PI*2,0,Math.PI/2),new THREE.MeshStandardMaterial({color:0xaaddff,transparent:true,opacity:0.25}));
    dome.rotation.x=Math.PI;dome.position.y=-0.9;group.add(dome);
    // Solution
    const solColor=new THREE.Color(sol.solColor);
    const solMesh=new THREE.Mesh(
      new THREE.CylinderGeometry(0.11,0.11,0.9,16),
      new THREE.MeshStandardMaterial({color:solColor,transparent:true,opacity:0.55})
    );
    solMesh.position.y=-0.5;solMesh.userData.isSol=true;group.add(solMesh);

    group.position.set(-2.5+i*1.0,-0.8,0.5);
    group.userData.solIdx=i;
    scene.add(group);
    tubeGroups.push(group);
  });
}

function buildMixingBeaker(){
  const g=new THREE.Group();
  const w=new THREE.Mesh(new THREE.CylinderGeometry(0.55,0.5,1.4,32,1,true),new THREE.MeshStandardMaterial({color:0x88ccff,transparent:true,opacity:0.2,side:THREE.DoubleSide}));
  g.add(w);
  const b=new THREE.Mesh(new THREE.CircleGeometry(0.5,32),new THREE.MeshStandardMaterial({color:0x88ccff,transparent:true,opacity:0.2}));
  b.rotation.x=-Math.PI/2;b.position.y=-0.7;g.add(b);
  g.position.set(0,-1.5,-1.2);
  scene.add(g);
  g.userData.isBeaker=true;
}

let firstSel=null,firstBtn=null;

function selectSolution(sol,idx,btn){
  if(!firstSel){
    firstSel={sol,idx};firstBtn=btn;
    btn.style.borderColor='#00d4ff';btn.style.boxShadow='0 0 12px #00d4ff44';
    infoBox.innerHTML=`<strong style="color:#00d4ff">Selected: ${sol.label}</strong>  — Now click another solution to mix!`;
  } else {
    if(firstSel.idx===idx){
      firstSel=null;firstBtn.style.borderColor='rgba(100,120,255,0.2)';firstBtn.style.boxShadow='none';firstBtn=null;
      infoBox.innerHTML='<strong style="color:#eef0ff">Precipitation Reactions</strong>  —  Click a test tube, then click another to mix them!';
      return;
    }
    const key=firstSel.sol.id+'+'+sol.id;
    const rxn=REACTIONS[key]||REACTIONS[sol.id+'+'+firstSel.sol.id];
    firstBtn.style.borderColor='rgba(100,120,255,0.2)';firstBtn.style.boxShadow='none';
    btn.style.borderColor='rgba(100,120,255,0.2)';btn.style.boxShadow='none';
    if(rxn){
      showPrecipitation(rxn);
    } else {
      infoBox.innerHTML=`<strong style="color:#ffaa44">No precipitate</strong> — ${firstSel.sol.label} + ${sol.label} → No visible reaction (remain soluble).`;
    }
    firstSel=null;firstBtn=null;
  }
}

function showPrecipitation(rxn){
  resultBox.style.display='block';
  resultBox.innerHTML=`<strong style="color:#ffd700">${rxn.pName}</strong> — <span style="color:#00e87a">${rxn.type}</span><br><span style="font-family:monospace;font-size:11px;color:#4f8ef7">${rxn.equation}</span><br><span style="font-size:11px;color:#7a85a8">${rxn.desc}</span>`;

  // Spawn particles in mixing beaker
  const count=60;
  for(let i=0;i<count;i++){
    setTimeout(()=>{
      const geo=new THREE.SphereGeometry(0.025+Math.random()*0.025,6,6);
      const mat=new THREE.MeshStandardMaterial({color:rxn.precipHex,roughness:0.3,metalness:rxn.product==='PbI2'?0.6:0.1});
      const mesh=new THREE.Mesh(geo,mat);
      mesh.position.set((Math.random()-0.5)*0.9,-1.3+Math.random()*0.6,-1.2+(Math.random()-0.5)*0.8);
      mesh.userData.vy=0;mesh.userData.falling=true;mesh.userData.life=1;
      scene.add(mesh);
      precipParticles.push(mesh);
    },i*30);
  }

  // Add settled precipitate ring
  setTimeout(()=>{
    const settled=new THREE.Mesh(
      new THREE.CylinderGeometry(0.45,0.42,0.08+Math.random()*0.05,32),
      new THREE.MeshStandardMaterial({color:rxn.precipHex,roughness:0.6})
    );
    settled.position.set(0,-2.15,-1.2);
    scene.add(settled);
    precipMeshes.push(settled);
    infoBox.innerHTML=`<strong style="color:#00e87a">✓ Precipitation complete!</strong>  <span style="font-family:monospace;font-size:11px;color:#4f8ef7">${rxn.equation}</span>`;
  },2500);
}

function resetScene(){
  precipParticles.forEach(p=>{if(p.parent)p.parent.remove(p);});
  precipMeshes.forEach(p=>{if(p.parent)p.parent.remove(p);});
  precipParticles=[];precipMeshes=[];
  firstSel=null;firstBtn=null;
  resultBox.style.display='none';
  infoBox.innerHTML='<strong style="color:#eef0ff">Precipitation Reactions</strong>  —  Click a test tube, then click another to mix them!';
}

function animate(){
  animId=requestAnimationFrame(animate);
  const t=clock.getElapsedTime();

  // Animate falling particles
  for(let i=precipParticles.length-1;i>=0;i--){
    const p=precipParticles[i];
    if(p.userData.falling){
      p.userData.vy-=0.003;
      p.position.y+=p.userData.vy;
      if(p.position.y<-2.1){p.userData.falling=false;p.userData.vy=0;}
    }
  }

  // Gentle tube sway
  tubeGroups.forEach((g,i)=>{
    g.rotation.z=Math.sin(t*0.5+i*0.8)*0.005;
  });

  renderer.render(scene,camera);
}

function destroy(){
  if(animId)cancelAnimationFrame(animId);
  if(renderer)renderer.dispose();
  if(scene)scene.clear();
}

window.Precipitation={init,destroy};
})();
