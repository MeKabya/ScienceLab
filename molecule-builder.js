/* ════════════════════════════════════
   MOLECULE BUILDER — molecule-builder.js
   ════════════════════════════════════ */
(function(){
let scene,camera,renderer,animId;
let clock=new THREE.Clock();
let moleculeMeshes=[];
let isDragging=false,lastMouse={x:0,y:0};
let rotationGroup;

const ATOM_COLORS={H:0x88ccff,C:0x333333,N:0x4466ff,O:0xff3333,Cl:0x33cc33,Na:0xddddcc,Ca:0xffffff};
const ATOM_RADIUS={H:0.25,C:0.38,N:0.35,O:0.35,Cl:0.42,Na:0.5,Ca:0.55};

const MOLECULES={
  H2O:{name:'Water',formula:'H₂O',atoms:[
    {sym:'O',pos:[0,0,0]},{sym:'H',pos:[0.757,0.586,0]},{sym:'H',pos:[-0.757,0.586,0]}
  ],bonds:[[0,1],[0,2]],
  info:'Bond angle: 104.5°. Polar molecule due to lone pairs on oxygen. Hydrogen bonding makes water liquid at room temperature.',
  angle:'104.5°'},
  CO2:{name:'Carbon Dioxide',formula:'CO₂',atoms:[
    {sym:'C',pos:[0,0,0]},{sym:'O',pos:[1.16,0,0]},{sym:'O',pos:[-1.16,0,0]}
  ],bonds:[[0,1],[0,2]],
  info:'Linear molecule. Bond angle: 180°. Double bonds between C and O. Non-polar despite having polar bonds.',
  angle:'180°',double:[0,1,0,2]},
  CH4:{name:'Methane',formula:'CH₄',atoms:[
    {sym:'C',pos:[0,0,0]},
    {sym:'H',pos:[1.089,0,0]},{sym:'H',pos:[-0.363,1.027,0]},
    {sym:'H',pos:[-0.363,-0.514,0.891]},{sym:'H',pos:[-0.363,-0.514,-0.891]}
  ],bonds:[[0,1],[0,2],[0,3],[0,4]],
  info:'Tetrahedral geometry. Bond angle: 109.5°. Main component of natural gas. Non-polar molecule.',
  angle:'109.5°'},
  NH3:{name:'Ammonia',formula:'NH₃',atoms:[
    {sym:'N',pos:[0,0,0]},
    {sym:'H',pos:[0.940,0,0]},{sym:'H',pos:[-0.470,0.814,0]},{sym:'H',pos:[-0.470,-0.407,0.705]}
  ],bonds:[[0,1],[0,2],[0,3]],
  info:'Trigonal pyramidal. Bond angle: 107°. One lone pair on N distorts shape. Used in fertilizers and cleaning products.',
  angle:'107°'},
  NaCl:{name:'Sodium Chloride',formula:'NaCl',atoms:[
    {sym:'Na',pos:[0,0,0]},{sym:'Cl',pos:[2.36,0,0]}
  ],bonds:[[0,1]],
  info:'Ionic bond (not covalent). Na⁺ donates electron to Cl⁻. Lattice structure in solid form. Dissolves in water to form ions.',
  angle:'N/A (ionic)'}
};

let currentMol=null;
let infoBox;

function init(container){
  container.innerHTML='';
  container.style.cssText='position:relative;width:100%;height:580px;background:radial-gradient(ellipse at 50% 30%, #0a0f1e 0%, #07080f 100%);border-radius:16px;overflow:hidden;';

  const canvas=document.createElement('canvas');
  canvas.style.cssText='position:absolute;inset:0;width:100%;height:100%;cursor:grab;';
  container.appendChild(canvas);

  const ui=document.createElement('div');
  ui.style.cssText='position:absolute;inset:0;pointer-events:none;';
  container.appendChild(ui);

  infoBox=document.createElement('div');
  infoBox.style.cssText='position:absolute;top:10px;left:10px;right:10px;padding:10px 14px;background:rgba(10,12,25,0.9);border:1px solid rgba(79,142,247,0.2);border-radius:10px;font-size:12px;color:#7a85a8;line-height:1.6;backdrop-filter:blur(12px);transition:all 0.4s;';
  infoBox.innerHTML='<strong style="color:#eef0ff">Molecule Builder</strong><br>Select a molecule below to view its 3D structure, bond angles and properties.';
  ui.appendChild(infoBox);

  // Legend
  const legend=document.createElement('div');
  legend.style.cssText='position:absolute;top:10px;right:10px;padding:8px 12px;background:rgba(10,12,25,0.9);border:1px solid rgba(79,142,247,0.15);border-radius:10px;font-size:10px;backdrop-filter:blur(12px);';
  legend.innerHTML=['H:Light Blue','C:Dark','N:Blue','O:Red','Cl:Green','Na:Silver'].map(s=>{
    const [sym,col]=s.split(':');
    const hex={H:'#88ccff',C:'#888',N:'#4466ff',O:'#ff3333',Cl:'#33cc33',Na:'#ddd'}[sym];
    return `<div style="display:flex;align-items:center;gap:5px;margin-bottom:2px"><div style="width:8px;height:8px;border-radius:50%;background:${hex};"></div><span style="color:#7a85a8">${sym} — ${col}</span></div>`;
  }).join('');
  ui.appendChild(legend);

  // Molecule buttons
  const btnRow=document.createElement('div');
  btnRow.style.cssText='position:absolute;bottom:10px;left:0;right:0;display:flex;justify-content:center;gap:8px;flex-wrap:wrap;padding:0 10px;pointer-events:all;';
  ui.appendChild(btnRow);

  Object.entries(MOLECULES).forEach(([key,mol])=>{
    const btn=document.createElement('button');
    btn.style.cssText='padding:9px 14px;border-radius:10px;border:1.5px solid rgba(79,142,247,0.25);background:rgba(17,19,39,0.9);color:#eef0ff;font-family:monospace;font-size:12px;font-weight:700;cursor:pointer;transition:all 0.2s;';
    btn.innerHTML=`${mol.formula}<br><span style="font-family:inherit;font-size:9px;color:#4a5070">${mol.name}</span>`;
    btn.onmouseenter=()=>{btn.style.borderColor='#4f8ef7';btn.style.boxShadow='0 4px 14px rgba(79,142,247,0.25)';};
    btn.onmouseleave=()=>{btn.style.borderColor='rgba(79,142,247,0.25)';btn.style.boxShadow='none';};
    btn.onclick=()=>loadMolecule(key);
    btnRow.appendChild(btn);
  });

  initThree(canvas,container);
  loadMolecule('H2O');

  // Drag to rotate
  canvas.addEventListener('mousedown',e=>{isDragging=true;lastMouse={x:e.clientX,y:e.clientY};canvas.style.cursor='grabbing';});
  canvas.addEventListener('mousemove',e=>{
    if(!isDragging||!rotationGroup)return;
    const dx=e.clientX-lastMouse.x,dy=e.clientY-lastMouse.y;
    lastMouse={x:e.clientX,y:e.clientY};
    rotationGroup.rotation.y+=dx*0.008;
    rotationGroup.rotation.x+=dy*0.008;
  });
  canvas.addEventListener('mouseup',()=>{isDragging=false;canvas.style.cursor='grab';});
  canvas.addEventListener('touchstart',e=>{isDragging=true;lastMouse={x:e.touches[0].clientX,y:e.touches[0].clientY};},{passive:true});
  canvas.addEventListener('touchmove',e=>{
    if(!isDragging||!rotationGroup)return;
    const t=e.touches[0];
    const dx=t.clientX-lastMouse.x,dy=t.clientY-lastMouse.y;
    lastMouse={x:t.clientX,y:t.clientY};
    rotationGroup.rotation.y+=dx*0.008;rotationGroup.rotation.x+=dy*0.008;
  },{passive:true});
  canvas.addEventListener('touchend',()=>isDragging=false,{passive:true});
}

function initThree(canvas,container){
  const W=container.clientWidth,H=container.clientHeight;
  scene=new THREE.Scene();
  camera=new THREE.PerspectiveCamera(40,W/H,0.1,100);
  camera.position.set(0,0,8);
  renderer=new THREE.WebGLRenderer({canvas,antialias:true,alpha:true});
  renderer.setSize(W,H);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio,2));

  scene.add(new THREE.AmbientLight(0xffffff,1.5));
  const dl=new THREE.DirectionalLight(0xffffff,2);dl.position.set(3,5,5);scene.add(dl);
  const dl2=new THREE.DirectionalLight(0x4488ff,1);dl2.position.set(-3,-3,-3);scene.add(dl2);

  // Background particles
  buildStarField();

  rotationGroup=new THREE.Group();
  scene.add(rotationGroup);

  animate();
  window.addEventListener('resize',()=>{const w=container.clientWidth,h=container.clientHeight;camera.aspect=w/h;camera.updateProjectionMatrix();renderer.setSize(w,h);});
}

function buildStarField(){
  const count=200;const pts=new Float32Array(count*3);
  for(let i=0;i<count*3;i++)pts[i]=(Math.random()-0.5)*40;
  const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.Float32BufferAttribute(pts,3));
  scene.add(new THREE.Points(geo,new THREE.PointsMaterial({color:0x4466aa,size:0.05,transparent:true,opacity:0.4,blending:THREE.AdditiveBlending})));
}

function loadMolecule(key){
  currentMol=MOLECULES[key];
  // Clear existing
  while(rotationGroup.children.length)rotationGroup.remove(rotationGroup.children[0]);
  moleculeMeshes=[];
  const mol=currentMol;

  // Center molecule
  const cx=mol.atoms.reduce((s,a)=>s+a.pos[0],0)/mol.atoms.length;
  const cy=mol.atoms.reduce((s,a)=>s+a.pos[1],0)/mol.atoms.length;
  const cz=mol.atoms.reduce((s,a)=>s+a.pos[2],0)/mol.atoms.length;

  // Atoms
  mol.atoms.forEach((atom,i)=>{
    const col=ATOM_COLORS[atom.sym]||0x888888;
    const r=ATOM_RADIUS[atom.sym]||0.35;
    const geo=new THREE.SphereGeometry(r,28,28);
    const mat=new THREE.MeshStandardMaterial({color:col,roughness:0.25,metalness:0.3,emissive:col,emissiveIntensity:0.08});
    const mesh=new THREE.Mesh(geo,mat);
    mesh.position.set(atom.pos[0]-cx,atom.pos[1]-cy,atom.pos[2]-cz);
    rotationGroup.add(mesh);
    moleculeMeshes.push(mesh);

    // Electron shells (only for heavier atoms)
    if(atom.sym!=='H'&&atom.sym!=='C'){
      for(let s=0;s<1;s++){
        const ring=new THREE.Mesh(
          new THREE.TorusGeometry(r+0.18+s*0.14,0.015,6,32),
          new THREE.MeshBasicMaterial({color:col,transparent:true,opacity:0.2,blending:THREE.AdditiveBlending})
        );
        ring.position.copy(mesh.position);
        ring.userData.isElectronRing=true;ring.userData.phase=s*Math.PI/2;
        rotationGroup.add(ring);
      }
    }
  });

  // Bonds
  mol.bonds.forEach(([a,b],bi)=>{
    const posA=moleculeMeshes[a].position;
    const posB=moleculeMeshes[b].position;
    buildBond(posA,posB,mol.double&&(mol.double[bi*2]===a||mol.double[bi*2+1]===a)?2:1);
  });

  // Update info
  infoBox.innerHTML=`
    <div style="display:flex;align-items:center;gap:10px;margin-bottom:6px">
      <span style="font-family:monospace;font-size:18px;font-weight:700;color:white">${mol.formula}</span>
      <span style="font-size:13px;color:#7a85a8">${mol.name}</span>
      <span style="margin-left:auto;font-family:monospace;font-size:10px;padding:2px 8px;border-radius:100px;background:rgba(79,142,247,0.1);border:1px solid rgba(79,142,247,0.2);color:#4f8ef7">∠ ${mol.angle}</span>
    </div>
    <div style="font-size:11.5px;color:#7a85a8;line-height:1.7">${mol.info}</div>
  `;

  // Animate in
  rotationGroup.scale.set(0.1,0.1,0.1);
  let t=0;
  const grow=setInterval(()=>{t+=0.1;const s=Math.min(1,t);rotationGroup.scale.set(s,s,s);if(s>=1)clearInterval(grow);},16);
}

function buildBond(posA,posB,order=1){
  const dir=new THREE.Vector3().subVectors(posB,posA);
  const len=dir.length();
  const mid=new THREE.Vector3().addVectors(posA,posB).multiplyScalar(0.5);

  const offsets=order===1?[0]:[-0.07,0.07];
  offsets.forEach(off=>{
    const geo=new THREE.CylinderGeometry(0.06,0.06,len,12);
    const mat=new THREE.MeshStandardMaterial({color:0x888899,roughness:0.5,metalness:0.3,transparent:true,opacity:0.7});
    const mesh=new THREE.Mesh(geo,mat);
    mesh.position.copy(mid);
    if(off!==0){
      const perp=new THREE.Vector3(-dir.z,0,dir.x).normalize();
      mesh.position.addScaledVector(perp,off);
    }
    mesh.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),dir.normalize());
    rotationGroup.add(mesh);
  });
}

function animate(){
  animId=requestAnimationFrame(animate);
  const t=clock.getElapsedTime();

  if(!isDragging&&rotationGroup){
    rotationGroup.rotation.y+=0.003;
  }

  // Electron ring rotation
  rotationGroup.traverse(obj=>{
    if(obj.userData.isElectronRing){
      obj.rotation.y+=0.015;
      obj.rotation.x=Math.sin(t*0.8+obj.userData.phase)*0.5;
    }
  });

  renderer.render(scene,camera);
}

function destroy(){
  if(animId)cancelAnimationFrame(animId);
  if(renderer)renderer.dispose();
  if(scene)scene.clear();
}

window.MoleculeBuilder={init,destroy};
})();
