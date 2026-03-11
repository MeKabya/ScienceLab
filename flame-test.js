/* ════════════════════════════════════
   FLAME TEST SIMULATOR — flame-test.js
   ════════════════════════════════════ */
(function(){
const CHEMICALS=[
  {id:'Na',label:'Sodium',formula:'NaCl',color:'#ffaa00',glow:'#ff8800',name:'Sodium (Na)→ Yellow-Orange flame',info:'Sodium emits bright yellow-orange light at 589nm. This is why streetlights glow orange — sodium vapor lamps use the same emission.'},
  {id:'K', label:'Potassium',formula:'KCl',color:'#c08aff',glow:'#9955ff',name:'Potassium (K) → Lilac/Violet flame',info:'Potassium emits lilac light at 766-770nm. It must be viewed through cobalt-blue glass to remove sodium contamination.'},
  {id:'Cu',label:'Copper',formula:'CuCl₂',color:'#00ff80',glow:'#00cc55',name:'Copper (Cu) → Green-Blue flame',info:'Copper produces a vivid blue-green flame from excited Cu⁺ ions. This color is used in fireworks to produce green effects.'},
  {id:'Sr',label:'Strontium',formula:'SrCl₂',color:'#ff3333',glow:'#cc0000',name:'Strontium (Sr) → Bright Red flame',info:'Strontium produces a brilliant crimson-red flame at 605-690nm. Widely used in red fireworks and emergency flares.'},
  {id:'Ba',label:'Barium',formula:'BaCl₂',color:'#ccff99',glow:'#88ff33',name:'Barium (Ba) → Pale Green flame',info:'Barium gives an apple-green or pale yellow-green flame. Barium chlorate is used in fireworks for green colors.'},
  {id:'Ca',label:'Calcium',formula:'CaCl₂',color:'#ff6600',glow:'#cc4400',name:'Calcium (Ca) → Orange-Red flame',info:'Calcium produces an orange-red flame at 622nm. Less intense than sodium but produces a distinctive brick-red color.'}
];

let scene,camera,renderer,animId;
let flameParticles=[],flameMesh,burnerGroup;
let activeChemical=null,flameLit=false;
let dragging=null,dragOffset={x:0,y:0};
let bottles=[];
let dropZone=null;
let infoPanel,flameColorOverlay;

function init(container){
  container.innerHTML='';

  // --- UI Layout ---
  container.style.cssText='position:relative;width:100%;height:580px;background:linear-gradient(180deg,#0a0b18 0%,#111327 100%);border-radius:16px;overflow:hidden;user-select:none;';

  // Canvas
  const canvas=document.createElement('canvas');
  canvas.style.cssText='position:absolute;inset:0;width:100%;height:100%;';
  container.appendChild(canvas);

  // Overlay UI
  const ui=document.createElement('div');
  ui.style.cssText='position:absolute;inset:0;pointer-events:none;';
  container.appendChild(ui);

  // Info panel
  infoPanel=document.createElement('div');
  infoPanel.style.cssText='position:absolute;top:12px;left:12px;right:12px;padding:12px 16px;background:rgba(15,17,30,0.9);border:1px solid rgba(79,142,247,0.2);border-radius:12px;font-size:12px;color:#7a85a8;line-height:1.6;transition:all 0.4s;opacity:0;pointer-events:none;backdrop-filter:blur(12px);';
  infoPanel.innerHTML='<strong style="color:#eef0ff">Click a chemical bottle below, then drag it to the flame!</strong>';
  ui.appendChild(infoPanel);
  setTimeout(()=>infoPanel.style.opacity='1',300);

  // Flame color overlay glow
  flameColorOverlay=document.createElement('div');
  flameColorOverlay.style.cssText='position:absolute;inset:0;pointer-events:none;transition:background 0.5s,opacity 0.5s;opacity:0;border-radius:16px;';
  ui.appendChild(flameColorOverlay);

  // Bottles tray
  const tray=document.createElement('div');
  tray.style.cssText='position:absolute;bottom:10px;left:0;right:0;display:flex;justify-content:center;gap:12px;padding:10px;pointer-events:all;';
  ui.appendChild(tray);

  CHEMICALS.forEach((chem,i)=>{
    const bottle=document.createElement('div');
    bottle.className='ft-bottle';
    bottle.dataset.id=chem.id;
    bottle.style.cssText=`
      width:60px;height:80px;cursor:grab;display:flex;flex-direction:column;align-items:center;justify-content:flex-end;gap:3px;
      transition:transform 0.2s,box-shadow 0.2s;border-radius:8px;padding:6px 4px;
      background:rgba(17,19,39,0.8);border:1.5px solid rgba(100,120,255,0.15);
      animation:bottleIn 0.4s ease ${i*0.07}s both;
    `;
    // Bottle SVG
    bottle.innerHTML=`
      <div style="width:28px;height:44px;position:relative">
        <svg viewBox="0 0 28 50" width="28" height="44">
          <defs><radialGradient id="bg${chem.id}" cx="35%" cy="30%"><stop offset="0%" stop-color="${chem.color}" stop-opacity="0.9"/><stop offset="100%" stop-color="${chem.glow}" stop-opacity="0.5"/></radialGradient></defs>
          <rect x="10" y="0" width="8" height="8" rx="2" fill="#aaa"/>
          <path d="M6 12 Q4 18 4 28 L4 44 Q4 48 8 48 L20 48 Q24 48 24 44 L24 28 Q24 18 22 12 Z" fill="url(#bg${chem.id})" stroke="${chem.color}" stroke-width="1"/>
          <path d="M8 20 L20 20" stroke="rgba(255,255,255,0.2)" stroke-width="0.5"/>
          <path d="M7 30 L21 30" stroke="rgba(255,255,255,0.15)" stroke-width="0.5"/>
          <rect x="8" y="35" width="12" height="8" rx="2" fill="rgba(0,0,0,0.3)"/>
          <text x="14" y="41" text-anchor="middle" fill="white" font-size="5" font-family="monospace">${chem.formula}</text>
        </svg>
      </div>
      <span style="font-family:monospace;font-size:9px;color:${chem.color};font-weight:700;letter-spacing:1px">${chem.id}</span>
    `;
    bottle.addEventListener('mousedown',e=>startDrag(e,chem,bottle));
    bottle.addEventListener('touchstart',e=>startDrag(e,chem,bottle),{passive:false});
    tray.appendChild(bottle);
    bottles.push({el:bottle,chem});
  });

  // Drop zone indicator (over flame)
  dropZone=document.createElement('div');
  dropZone.style.cssText='position:absolute;left:50%;top:50%;transform:translate(-50%,-50%);width:80px;height:80px;border-radius:50%;border:2px dashed rgba(255,180,0,0.3);pointer-events:none;transition:all 0.3s;';
  ui.appendChild(dropZone);

  // Reset button
  const resetBtn=document.createElement('button');
  resetBtn.textContent='🔄 Reset Flame';
  resetBtn.style.cssText='position:absolute;top:12px;right:12px;padding:7px 14px;background:rgba(255,68,102,0.1);border:1px solid rgba(255,68,102,0.25);color:#ff4466;border-radius:8px;font-size:11px;font-weight:700;cursor:pointer;pointer-events:all;font-family:inherit;transition:all 0.2s;';
  resetBtn.onclick=()=>resetFlame();
  resetBtn.onmouseenter=()=>resetBtn.style.background='rgba(255,68,102,0.2)';
  resetBtn.onmouseleave=()=>resetBtn.style.background='rgba(255,68,102,0.1)';
  ui.appendChild(resetBtn);

  // Add CSS animations
  if(!document.getElementById('ft-style')){
    const s=document.createElement('style');s.id='ft-style';
    s.textContent=`
      @keyframes bottleIn{from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:translateY(0)}}
      @keyframes ftFloat{0%,100%{transform:translateY(0)}50%{transform:translateY(-4px)}}
      .ft-bottle:hover{transform:translateY(-4px)!important;box-shadow:0 8px 20px rgba(0,0,0,0.4)!important}
      .ft-ghost{position:fixed;pointer-events:none;z-index:9999;transition:none;opacity:0.9;filter:drop-shadow(0 4px 12px rgba(255,180,0,0.6))}
    `;
    document.head.appendChild(s);
  }

  // Three.js scene
  initThreeScene(canvas,container);
}

function initThreeScene(canvas,container){
  const W=container.clientWidth,H=container.clientHeight;
  scene=new THREE.Scene();
  scene.background=null;
  camera=new THREE.PerspectiveCamera(45,W/H,0.1,100);
  camera.position.set(0,2,7);
  camera.lookAt(0,0,0);

  renderer=new THREE.WebGLRenderer({canvas,antialias:true,alpha:true});
  renderer.setSize(W,H);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio,2));
  renderer.shadowMap.enabled=true;

  // Lighting
  scene.add(new THREE.AmbientLight(0x111133,2));
  const dLight=new THREE.DirectionalLight(0xffffff,1);
  dLight.position.set(3,6,4);
  dLight.castShadow=true;
  scene.add(dLight);

  // Lab bench
  buildLabBench();
  buildBunsenBurner();
  buildFlame();
  buildLabItems();

  animate();

  // Resize
  window.addEventListener('resize',()=>{
    const w=container.clientWidth,h=container.clientHeight;
    camera.aspect=w/h;camera.updateProjectionMatrix();
    renderer.setSize(w,h);
  });
}

function buildLabBench(){
  // Bench top
  const bench=new THREE.Mesh(
    new THREE.BoxGeometry(9,0.2,3.5),
    new THREE.MeshStandardMaterial({color:0x2a1a08,roughness:0.8,metalness:0.1})
  );
  bench.position.set(0,-0.9,0);
  bench.receiveShadow=true;
  scene.add(bench);
  // Bench front
  const front=new THREE.Mesh(
    new THREE.BoxGeometry(9,1.5,0.2),
    new THREE.MeshStandardMaterial({color:0x1a0f04,roughness:0.9})
  );
  front.position.set(0,-1.65,1.75);
  scene.add(front);
  // Grid lines on bench
  const geo=new THREE.BufferGeometry();
  const pts=[];
  for(let x=-4;x<=4;x++){pts.push(x,-0.79,-1.5,x,-0.79,1.5);}
  for(let z=-1.5;z<=1.5;z+=0.5){pts.push(-4,-0.79,z,4,-0.79,z);}
  geo.setAttribute('position',new THREE.Float32BufferAttribute(pts,3));
  const grid=new THREE.LineSegments(geo,new THREE.LineBasicMaterial({color:0x3a2010,opacity:0.5,transparent:true}));
  scene.add(grid);
}

function buildBunsenBurner(){
  burnerGroup=new THREE.Group();
  // Base
  const base=new THREE.Mesh(
    new THREE.CylinderGeometry(0.35,0.4,0.12,16),
    new THREE.MeshStandardMaterial({color:0x555555,metalness:0.7,roughness:0.3})
  );
  base.position.y=-0.06;
  burnerGroup.add(base);
  // Barrel
  const barrel=new THREE.Mesh(
    new THREE.CylinderGeometry(0.12,0.15,1.0,16),
    new THREE.MeshStandardMaterial({color:0x777777,metalness:0.8,roughness:0.25})
  );
  barrel.position.y=0.56;
  burnerGroup.add(barrel);
  // Collar
  const collar=new THREE.Mesh(
    new THREE.CylinderGeometry(0.16,0.16,0.18,16),
    new THREE.MeshStandardMaterial({color:0x444444,metalness:0.9,roughness:0.2})
  );
  collar.position.y=0.96;
  burnerGroup.add(collar);
  // Gas tube
  const tube=new THREE.Mesh(
    new THREE.CylinderGeometry(0.04,0.04,0.5,8),
    new THREE.MeshStandardMaterial({color:0x333333,metalness:0.6,roughness:0.4})
  );
  tube.rotation.z=Math.PI/2;
  tube.position.set(0.27,0.1,0);
  burnerGroup.add(tube);

  burnerGroup.position.set(0,-0.8,0);
  burnerGroup.castShadow=true;
  scene.add(burnerGroup);
}

function buildFlame(){
  // Flame light
  const flameLight=new THREE.PointLight(0xff8800,3,4);
  flameLight.position.set(0,0.8,0);
  scene.add(flameLight);
  flameLight._isFlameLight=true;

  // Particle system for flame
  const count=120;
  const positions=new Float32Array(count*3);
  const colors=new Float32Array(count*3);
  const sizes=new Float32Array(count);
  const geo=new THREE.BufferGeometry();

  for(let i=0;i<count;i++){
    resetParticle(positions,colors,sizes,i,{r:1,g:0.55,b:0});
  }
  geo.setAttribute('position',new THREE.BufferAttribute(positions,3));
  geo.setAttribute('color',new THREE.BufferAttribute(colors,3));
  geo.setAttribute('size',new THREE.BufferAttribute(sizes,1));

  const mat=new THREE.PointsMaterial({size:0.18,vertexColors:true,transparent:true,opacity:0.85,blending:THREE.AdditiveBlending,depthWrite:false,sizeAttenuation:true});
  flameMesh=new THREE.Points(geo,mat);
  flameMesh.position.set(0,-0.8+1.06,0);
  scene.add(flameMesh);

  // Outer cone glow
  const coneGeo=new THREE.ConeGeometry(0.22,0.7,16,1,true);
  const coneMat=new THREE.MeshBasicMaterial({color:0xff8800,transparent:true,opacity:0.08,side:THREE.DoubleSide,blending:THREE.AdditiveBlending,depthWrite:false});
  const cone=new THREE.Mesh(coneGeo,coneMat);
  cone.position.set(0,-0.8+1.41,0);
  cone._isFlameGlow=true;
  scene.add(cone);
}

function resetParticle(pos,cols,sizes,i,col){
  const r=(Math.random()-0.5)*0.18;
  const ang=Math.random()*Math.PI*2;
  pos[i*3]= Math.cos(ang)*r;
  pos[i*3+1]= Math.random()*0.55;
  pos[i*3+2]= Math.sin(ang)*r;
  const t=Math.random();
  cols[i*3]=col.r*(0.7+t*0.3);
  cols[i*3+1]=col.g*(0.2+t*0.4)*t;
  cols[i*3+2]=col.b;
  sizes[i]=0.08+Math.random()*0.18;
}

function buildLabItems(){
  // Beaker
  const bGroup=new THREE.Group();
  const bGeo=new THREE.CylinderGeometry(0.25,0.22,0.6,20,1,true);
  const bMat=new THREE.MeshStandardMaterial({color:0x88ccff,transparent:true,opacity:0.25,side:THREE.DoubleSide});
  bGroup.add(new THREE.Mesh(bGeo,bMat));
  const bottom=new THREE.Mesh(new THREE.CircleGeometry(0.22,20),new THREE.MeshStandardMaterial({color:0x88ccff,transparent:true,opacity:0.3}));
  bottom.rotation.x=-Math.PI/2;bottom.position.y=-0.3;
  bGroup.add(bottom);
  bGroup.position.set(-2.5,-0.6,0);
  scene.add(bGroup);

  // Test tube rack
  const rack=new THREE.Mesh(new THREE.BoxGeometry(1.8,0.1,0.4),new THREE.MeshStandardMaterial({color:0x4a3525,roughness:0.8}));
  rack.position.set(2.5,-0.84,0);
  scene.add(rack);
  for(let i=0;i<3;i++){
    const tt=new THREE.Mesh(new THREE.CylinderGeometry(0.06,0.06,0.45,12,1,true),new THREE.MeshStandardMaterial({color:0xaaddff,transparent:true,opacity:0.3,side:THREE.DoubleSide}));
    tt.position.set(2.0+i*0.4,-0.65,0);
    scene.add(tt);
  }

  // Lab notebook
  const book=new THREE.Mesh(new THREE.BoxGeometry(0.8,0.06,0.55),new THREE.MeshStandardMaterial({color:0x1a3a6a,roughness:0.95}));
  book.position.set(-1.5,-0.82,-0.3);
  book.rotation.y=0.3;
  scene.add(book);

  // Safety goggles on bench
  const goggle=new THREE.Mesh(new THREE.TorusGeometry(0.13,0.04,8,16),new THREE.MeshStandardMaterial({color:0x2255aa,transparent:true,opacity:0.7}));
  goggle.position.set(1.5,-0.77,0.4);
  goggle.rotation.x=Math.PI/2;
  scene.add(goggle);
}

let flameColor={r:1,g:0.55,b:0};
let targetColor={r:1,g:0.55,b:0};
let clock=new THREE.Clock();

function animate(){
  animId=requestAnimationFrame(animate);
  const t=clock.getElapsedTime();

  // Animate flame particles
  if(flameMesh){
    const pos=flameMesh.geometry.attributes.position;
    const cols=flameMesh.geometry.attributes.color;
    const sizes=flameMesh.geometry.attributes.size;
    const count=pos.count;
    flameColor.r+=(targetColor.r-flameColor.r)*0.05;
    flameColor.g+=(targetColor.g-flameColor.g)*0.05;
    flameColor.b+=(targetColor.b-flameColor.b)*0.05;

    for(let i=0;i<count;i++){
      pos.array[i*3+1]+=0.018+Math.random()*0.01;
      pos.array[i*3]  +=(Math.random()-0.5)*0.006;
      pos.array[i*3+2]+=(Math.random()-0.5)*0.006;
      sizes.array[i]-=0.003;
      if(pos.array[i*3+1]>0.58||sizes.array[i]<=0){
        const r=(Math.random()-0.5)*0.15;
        const ang=Math.random()*Math.PI*2;
        pos.array[i*3]=Math.cos(ang)*r;
        pos.array[i*3+1]=Math.random()*0.05;
        pos.array[i*3+2]=Math.sin(ang)*r;
        const tt=Math.random();
        cols.array[i*3]=flameColor.r*(0.7+tt*0.3);
        cols.array[i*3+1]=flameColor.g*(0.5+tt*0.5);
        cols.array[i*3+2]=flameColor.b;
        sizes.array[i]=0.1+Math.random()*0.18;
      }
    }
    pos.needsUpdate=true;
    cols.needsUpdate=true;
    sizes.needsUpdate=true;

    // Flicker
    flameMesh.position.x=Math.sin(t*8)*0.01;
    flameMesh.position.z=Math.cos(t*7)*0.01;
  }

  // Animate flame light
  scene.traverse(obj=>{
    if(obj._isFlameLight){
      obj.intensity=2.5+Math.sin(t*12)*0.5;
      obj.color.setRGB(flameColor.r,flameColor.g*0.7,flameColor.b*0.3);
    }
    if(obj._isFlameGlow){
      obj.material.color.setRGB(flameColor.r,flameColor.g,flameColor.b);
      obj.material.opacity=0.05+Math.sin(t*5)*0.02;
      obj.scale.x=0.9+Math.sin(t*8)*0.05;
      obj.scale.z=0.9+Math.cos(t*9)*0.05;
    }
  });

  renderer.render(scene,camera);
}

function setFlameColor(chem){
  activeChemical=chem;
  const hexToRGB=h=>{const r=parseInt(h.slice(1,3),16)/255,g=parseInt(h.slice(3,5),16)/255,b=parseInt(h.slice(5,7),16)/255;return{r,g,b};};
  const rgb=hexToRGB(chem.color);
  targetColor={r:rgb.r,g:rgb.g,b:rgb.b};

  // Update info panel
  infoPanel.innerHTML=`<strong style="color:${chem.color}">${chem.name}</strong><br><span style="color:#9aa0c0;font-size:11px">${chem.info}</span>`;

  // Color overlay glow
  flameColorOverlay.style.background=`radial-gradient(ellipse 30% 40% at 50% 50%,${chem.color}18,transparent 70%)`;
  flameColorOverlay.style.opacity='1';
}

function resetFlame(){
  activeChemical=null;
  targetColor={r:1,g:0.55,b:0};
  infoPanel.innerHTML='<strong style="color:#eef0ff">Click a chemical bottle below, then drag it to the flame!</strong>';
  flameColorOverlay.style.opacity='0';
  bottles.forEach(b=>b.el.style.outline='none');
}

// Drag and drop
let ghost=null;
function startDrag(e,chem,bottleEl){
  e.preventDefault();
  const touch=e.touches?e.touches[0]:e;
  ghost=document.createElement('div');
  ghost.className='ft-ghost';
  ghost.innerHTML=bottleEl.innerHTML;
  ghost.style.cssText=`position:fixed;pointer-events:none;z-index:9999;opacity:0.9;width:60px;height:80px;display:flex;flex-direction:column;align-items:center;justify-content:flex-end;gap:3px;padding:6px 4px;background:rgba(17,19,39,0.95);border:2px solid ${chem.color};border-radius:8px;filter:drop-shadow(0 4px 16px ${chem.color}88);`;
  document.body.appendChild(ghost);
  moveGhost(touch.clientX,touch.clientY);

  const onMove=ev=>{const tc=ev.touches?ev.touches[0]:ev;moveGhost(tc.clientX,tc.clientY);};
  const onUp=ev=>{
    document.removeEventListener('mousemove',onMove);
    document.removeEventListener('mouseup',onUp);
    document.removeEventListener('touchmove',onMove);
    document.removeEventListener('touchend',onUp);
    if(ghost){ghost.remove();ghost=null;}
    // Check if dropped on flame area
    const tc=ev.changedTouches?ev.changedTouches[0]:ev;
    const el=document.elementFromPoint(tc.clientX,tc.clientY);
    const container=bottleEl.closest('[style*="position:relative"]');
    if(container){
      const rect=container.getBoundingClientRect();
      const cx=rect.left+rect.width/2,cy=rect.top+rect.height/2;
      if(Math.abs(tc.clientX-cx)<100&&Math.abs(tc.clientY-cy)<120){
        setFlameColor(chem);
        // Flash effect
        bottleEl.style.outline=`2px solid ${chem.color}`;
        bottleEl.style.boxShadow=`0 0 16px ${chem.color}66`;
      }
    }
  };
  document.addEventListener('mousemove',onMove);
  document.addEventListener('mouseup',onUp);
  document.addEventListener('touchmove',onMove,{passive:false});
  document.addEventListener('touchend',onUp);
}
function moveGhost(x,y){if(ghost){ghost.style.left=(x-30)+'px';ghost.style.top=(y-40)+'px';}}

function destroy(){
  if(animId)cancelAnimationFrame(animId);
  if(renderer)renderer.dispose();
  if(scene)scene.clear();
}

window.FlameTest={init,destroy};
})();
