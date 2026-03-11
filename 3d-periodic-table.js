/* ════════════════════════════════════
   3D PERIODIC TABLE — 3d-periodic-table.js
   ════════════════════════════════════ */
(function(){
let scene,camera,renderer,animId,controls3d;
let elementMeshes=[],selectedEl=null;
let raycaster,mouse;
let clock=new THREE.Clock();
let infoPanel;
let isAnimating=true;

const CAT_COLORS_HEX={
  alkali:0xef4444,alkaline:0xf59e0b,transition:0x3b82f6,
  post:0x06b6d4,metalloid:0x22c55e,nonmetal:0x8b5cf6,
  noble:0x00d4ff,lanthanide:0xa855f7,actinide:0xf97316,hydrogen:0x14b8a6
};

const PT_LAYOUT=[
  [1,1,1],[2,18,1],
  [3,1,2],[4,2,2],[5,13,2],[6,14,2],[7,15,2],[8,16,2],[9,17,2],[10,18,2],
  [11,1,3],[12,2,3],[13,13,3],[14,14,3],[15,15,3],[16,16,3],[17,17,3],[18,18,3],
  [19,1,4],[20,2,4],[21,3,4],[22,4,4],[23,5,4],[24,6,4],[25,7,4],[26,8,4],[27,9,4],[28,10,4],[29,11,4],[30,12,4],[31,13,4],[32,14,4],[33,15,4],[34,16,4],[35,17,4],[36,18,4],
  [37,1,5],[38,2,5],[39,3,5],[40,4,5],[41,5,5],[42,6,5],[43,7,5],[44,8,5],[45,9,5],[46,10,5],[47,11,5],[48,12,5],[49,13,5],[50,14,5],[51,15,5],[52,16,5],[53,17,5],[54,18,5],
  [55,1,6],[56,2,6],[72,4,6],[73,5,6],[74,6,6],[75,7,6],[76,8,6],[77,9,6],[78,10,6],[79,11,6],[80,12,6],[81,13,6],[82,14,6],[83,15,6],[84,16,6],[85,17,6],[86,18,6],
  [87,1,7],[88,2,7],[104,4,7],[105,5,7],[106,6,7],[107,7,7],[108,8,7],[109,9,7],[110,10,7],[111,11,7],[112,12,7],[113,13,7],[114,14,7],[115,15,7],[116,16,7],[117,17,7],[118,18,7],
  [58,4,8.5],[59,5,8.5],[60,6,8.5],[61,7,8.5],[62,8,8.5],[63,9,8.5],[64,10,8.5],[65,11,8.5],[66,12,8.5],[67,13,8.5],[68,14,8.5],[69,15,8.5],[70,16,8.5],[71,17,8.5],
  [90,4,9.5],[91,5,9.5],[92,6,9.5],[93,7,9.5],[94,8,9.5],[95,9,9.5],[96,10,9.5],[97,11,9.5],[98,12,9.5],[99,13,9.5],[100,14,9.5],[101,15,9.5],[102,16,9.5],[103,17,9.5]
];

// Minimal element data subset for 3D PT
const EL_3D=window.EL||[];

function init(container){
  container.innerHTML='';
  container.style.cssText='position:relative;width:100%;height:600px;background:#07080f;border-radius:16px;overflow:hidden;';

  const canvas=document.createElement('canvas');
  canvas.style.cssText='position:absolute;inset:0;width:100%;height:100%;cursor:grab;';
  container.appendChild(canvas);

  const ui=document.createElement('div');
  ui.style.cssText='position:absolute;inset:0;pointer-events:none;';
  container.appendChild(ui);

  infoPanel=document.createElement('div');
  infoPanel.style.cssText='position:absolute;top:10px;left:10px;padding:12px 16px;background:rgba(10,12,25,0.92);border:1px solid rgba(79,142,247,0.25);border-radius:12px;min-width:200px;max-width:260px;font-size:12px;color:#7a85a8;line-height:1.6;backdrop-filter:blur(16px);transition:all 0.3s;';
  infoPanel.innerHTML='<strong style="color:#eef0ff">3D Periodic Table</strong><br>Click any element sphere to explore it.<br><span style="font-size:10px;color:#3a4060">Drag to rotate · Scroll to zoom</span>';
  ui.appendChild(infoPanel);

  // View controls
  const viewRow=document.createElement('div');
  viewRow.style.cssText='position:absolute;bottom:10px;left:0;right:0;display:flex;justify-content:center;gap:8px;pointer-events:all;';
  ui.appendChild(viewRow);

  [['🔄 Reset View',()=>{camera.position.set(9,8,14);camera.lookAt(9,0,-5);}],
   ['⏸ Pause',btn=>{isAnimating=!isAnimating;btn.textContent=isAnimating?'⏸ Pause':'▶ Resume';}]
  ].forEach(([label,fn])=>{
    const btn=document.createElement('button');
    btn.textContent=label;
    btn.style.cssText='padding:7px 14px;border-radius:10px;border:1px solid rgba(79,142,247,0.25);background:rgba(17,19,39,0.9);color:#7a85a8;font-family:inherit;font-size:11px;font-weight:600;cursor:pointer;transition:all 0.2s;';
    btn.onclick=()=>fn(btn);
    viewRow.appendChild(btn);
  });

  raycaster=new THREE.Raycaster();
  mouse=new THREE.Vector2();

  initThree(canvas,container);
  canvas.addEventListener('click',onCanvasClick);
  canvas.addEventListener('mousedown',()=>canvas.style.cursor='grabbing');
  canvas.addEventListener('mouseup',()=>canvas.style.cursor='grab');
}

let isDragging=false,lastMouse={x:0,y:0},cameraAngle={theta:0.3,phi:0.5,r:18};

function initThree(canvas,container){
  const W=container.clientWidth,H=container.clientHeight;
  scene=new THREE.Scene();
  scene.background=new THREE.Color(0x07080f);
  scene.fog=new THREE.FogExp2(0x07080f,0.018);
  camera=new THREE.PerspectiveCamera(45,W/H,0.1,200);
  camera.position.set(9,8,16);
  camera.lookAt(9,0,-4);
  renderer=new THREE.WebGLRenderer({canvas,antialias:true});
  renderer.setSize(W,H);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio,2));

  scene.add(new THREE.AmbientLight(0x112244,2));
  const dl=new THREE.DirectionalLight(0xffffff,1.5);dl.position.set(10,15,10);scene.add(dl);
  const ptLight=new THREE.PointLight(0x4488ff,2,40);ptLight.position.set(9,5,0);scene.add(ptLight);

  buildGrid();
  buildElements();

  // Drag to rotate
  const c=canvas;
  c.addEventListener('mousedown',e=>{isDragging=true;lastMouse={x:e.clientX,y:e.clientY};});
  c.addEventListener('mousemove',e=>{
    if(!isDragging)return;
    const dx=e.clientX-lastMouse.x,dy=e.clientY-lastMouse.y;
    lastMouse={x:e.clientX,y:e.clientY};
    cameraAngle.theta-=dx*0.005;
    cameraAngle.phi=Math.max(0.1,Math.min(Math.PI/2,cameraAngle.phi-dy*0.005));
    updateCameraOrbit();
  });
  c.addEventListener('mouseup',()=>isDragging=false);
  c.addEventListener('wheel',e=>{cameraAngle.r=Math.max(8,Math.min(35,cameraAngle.r+e.deltaY*0.02));updateCameraOrbit();});
  // Touch
  let lastTouch;
  c.addEventListener('touchstart',e=>{isDragging=true;lastTouch=e.touches[0];},{passive:true});
  c.addEventListener('touchmove',e=>{
    if(!isDragging||!lastTouch)return;
    const t=e.touches[0];
    const dx=t.clientX-lastTouch.clientX,dy=t.clientY-lastTouch.clientY;
    lastTouch=t;
    cameraAngle.theta-=dx*0.005;
    cameraAngle.phi=Math.max(0.1,Math.min(Math.PI/2,cameraAngle.phi-dy*0.005));
    updateCameraOrbit();
  },{passive:true});
  c.addEventListener('touchend',()=>isDragging=false,{passive:true});

  animate();
  window.addEventListener('resize',()=>{const w=container.clientWidth,h=container.clientHeight;camera.aspect=w/h;camera.updateProjectionMatrix();renderer.setSize(w,h);});
}

function updateCameraOrbit(){
  const {theta,phi,r}=cameraAngle;
  camera.position.set(
    9+r*Math.sin(phi)*Math.sin(theta),
    r*Math.cos(phi),
    -4+r*Math.sin(phi)*Math.cos(theta)
  );
  camera.lookAt(9,0,-4);
}

function buildGrid(){
  const geo=new THREE.BufferGeometry();
  const pts=[];
  for(let x=0;x<=18;x+=1){pts.push(x,-0.55,0,x,-0.55,-12);}
  for(let z=0;z>=-12;z-=1){pts.push(0,-0.55,z,18,-0.55,z);}
  geo.setAttribute('position',new THREE.Float32BufferAttribute(pts,3));
  scene.add(new THREE.LineSegments(geo,new THREE.LineBasicMaterial({color:0x1a2040,opacity:0.4,transparent:true})));
}

function buildElements(){
  const EL=window.EL||[];
  const tMap={}; PT_LAYOUT.forEach(([an,col,row])=>{tMap[an]={col,row};});
  EL.forEach(el=>{
    const pos=tMap[el.n]; if(!pos)return;
    const x=(pos.col-1)*1.1;
    const z=-(pos.row)*1.1;
    const y=0;
    const col=CAT_COLORS_HEX[el.cat]||0x4f8ef7;

    // Sphere
    const geo=new THREE.SphereGeometry(0.38,18,18);
    const mat=new THREE.MeshStandardMaterial({color:col,roughness:0.3,metalness:0.5,emissive:col,emissiveIntensity:0.05});
    const mesh=new THREE.Mesh(geo,mat);
    mesh.position.set(x,y,z);
    mesh.userData.el=el;
    mesh.userData.baseColor=col;
    mesh.userData.baseEmissive=0.05;
    scene.add(mesh);
    elementMeshes.push(mesh);

    // Atomic number "pulse" ring
    if(el.n%10===0){
      const ring=new THREE.Mesh(
        new THREE.TorusGeometry(0.48,0.03,6,24),
        new THREE.MeshBasicMaterial({color:col,transparent:true,opacity:0.4,blending:THREE.AdditiveBlending})
      );
      ring.position.copy(mesh.position);
      ring.userData.isRing=true;ring.userData.phase=Math.random()*Math.PI*2;
      scene.add(ring);
    }
  });
}

function onCanvasClick(e){
  const canvas=e.target;
  const rect=canvas.getBoundingClientRect();
  mouse.x=((e.clientX-rect.left)/rect.width)*2-1;
  mouse.y=-((e.clientY-rect.top)/rect.height)*2+1;
  raycaster.setFromCamera(mouse,camera);
  const hits=raycaster.intersectObjects(elementMeshes);
  if(hits.length>0){
    selectElement(hits[0].object);
  }
}

function selectElement(mesh){
  // Deselect old
  if(selectedEl){
    selectedEl.material.emissiveIntensity=selectedEl.userData.baseEmissive;
    selectedEl.scale.set(1,1,1);
  }
  selectedEl=mesh;
  mesh.material.emissiveIntensity=0.5;
  mesh.scale.set(1.3,1.3,1.3);

  const el=mesh.userData.el;
  const col=`#${(CAT_COLORS_HEX[el.cat]||0x4f8ef7).toString(16).padStart(6,'0')}`;
  infoPanel.innerHTML=`
    <div style="display:flex;align-items:center;gap:10px;margin-bottom:8px">
      <div style="width:44px;height:44px;border-radius:10px;background:${col}22;border:2px solid ${col}55;display:flex;flex-direction:column;align-items:center;justify-content:center;flex-shrink:0">
        <span style="font-size:7px;color:${col};font-family:monospace">${el.n}</span>
        <span style="font-size:18px;font-weight:900;color:white;line-height:1">${el.sym}</span>
        <span style="font-size:5.5px;color:rgba(255,255,255,0.4);font-family:monospace">${el.mass}</span>
      </div>
      <div>
        <div style="font-weight:800;font-size:15px;color:white">${el.name}</div>
        <div style="font-size:10px;color:${col};margin-top:1px">${{alkali:'Alkali Metal',alkaline:'Alkaline Earth',transition:'Transition Metal',post:'Post-Transition',metalloid:'Metalloid',nonmetal:'Nonmetal',noble:'Noble Gas',lanthanide:'Lanthanide',actinide:'Actinide',hydrogen:'Hydrogen'}[el.cat]||el.cat}</div>
      </div>
    </div>
    <div style="font-family:monospace;font-size:10px;color:#4f8ef7;margin-bottom:4px">${el.config}</div>
    <div style="font-size:10.5px;color:#7a85a8;line-height:1.6">${el.desc||''}</div>
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:4px;margin-top:8px">
      ${[['Period',el.period],['Group',el.group||'f-block'],['State',el.state],['Mass',el.mass+' u']].map(([l,v])=>`<div style="background:rgba(79,142,247,0.06);border:1px solid rgba(79,142,247,0.12);border-radius:6px;padding:5px 7px"><div style="font-family:monospace;font-size:7.5px;color:#3a4060;text-transform:uppercase;letter-spacing:1.5px">${l}</div><div style="font-size:11px;font-weight:600;color:white">${v}</div></div>`).join('')}
    </div>
  `;
}

function animate(){
  animId=requestAnimationFrame(animate);
  if(!isAnimating){renderer.render(scene,camera);return;}
  const t=clock.getElapsedTime();

  elementMeshes.forEach((m,i)=>{
    if(m===selectedEl)return;
    // Gentle float
    m.position.y=Math.sin(t*0.5+i*0.3)*0.04;
    // Subtle emissive pulse
    m.material.emissiveIntensity=0.04+Math.sin(t*0.8+i*0.4)*0.02;
  });

  // Pulse rings
  scene.traverse(obj=>{
    if(obj.userData.isRing){
      obj.material.opacity=0.2+Math.sin(t*1.5+obj.userData.phase)*0.2;
      obj.scale.setScalar(1+Math.sin(t*1.2+obj.userData.phase)*0.08);
    }
  });

  renderer.render(scene,camera);
}

function destroy(){
  if(animId)cancelAnimationFrame(animId);
  if(renderer)renderer.dispose();
  if(scene)scene.clear();
}

window.PeriodicTable3D={init,destroy};
})();
