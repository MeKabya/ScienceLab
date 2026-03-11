/* ════════════════════════════════════
   LAB SCENE MANAGER — lab-scene.js
   ════════════════════════════════════ */
(function(){
  const LabScene={
    currentScene:null,
    currentKey:null,

    scenes:{
      'flame':   ()=>window.FlameTest,
      'metalwater':()=>window.MetalWater,
      'titration':()=>window.Titration,
      'precip':  ()=>window.Precipitation,
      'gas':     ()=>window.GasProduction,
      'pt3d':    ()=>window.PeriodicTable3D,
      'molecule':()=>window.MoleculeBuilder,
      'electro': ()=>window.Electrochemical
    },

    load(key,container){
      if(this.currentScene&&this.currentScene.destroy){
        try{this.currentScene.destroy();}catch(e){}
      }
      this.currentKey=key;
      const factory=this.scenes[key];
      if(!factory){console.warn('LabScene: unknown key',key);return;}
      this.currentScene=factory();
      if(!this.currentScene){console.warn('LabScene: module not loaded for',key);return;}
      try{
        container.innerHTML='<div style="display:flex;align-items:center;justify-content:center;height:200px;color:#4a5070;font-family:monospace;font-size:12px;letter-spacing:2px">LOADING LAB...</div>';
        setTimeout(()=>this.currentScene.init(container),50);
      }catch(e){
        container.innerHTML=`<div style="color:#ff4466;padding:20px;font-size:12px">Error loading lab: ${e.message}</div>`;
      }
    },

    unload(){
      if(this.currentScene&&this.currentScene.destroy){
        try{this.currentScene.destroy();}catch(e){}
      }
      this.currentScene=null;this.currentKey=null;
    }
  };

  window.LabScene=LabScene;
})();

/* ════════════════════════════════════
   PARTICLES SYSTEM — particles.js
   ════════════════════════════════════ */
(function(){
  class ParticleSystem{
    constructor(options={}){
      this.count=options.count||100;
      this.scene=options.scene;
      this.particles=[];
      this.config={
        color:options.color||0xffffff,
        size:options.size||0.05,
        speed:options.speed||0.02,
        life:options.life||1.0,
        emissive:options.emissive!==undefined?options.emissive:true,
        blending:options.blending||THREE.AdditiveBlending
      };
      this._build();
    }

    _build(){
      const count=this.count;
      const positions=new Float32Array(count*3);
      const colors=new Float32Array(count*3);
      const sizes=new Float32Array(count);
      this.geo=new THREE.BufferGeometry();
      this.geo.setAttribute('position',new THREE.BufferAttribute(positions,3));
      this.geo.setAttribute('color',new THREE.BufferAttribute(colors,3));
      this.geo.setAttribute('size',new THREE.BufferAttribute(sizes,1));
      this.mat=new THREE.PointsMaterial({
        size:this.config.size,vertexColors:true,transparent:true,
        opacity:0.9,blending:this.config.blending,depthWrite:false,sizeAttenuation:true
      });
      this.points=new THREE.Points(this.geo,this.mat);
      if(this.scene)this.scene.add(this.points);
      for(let i=0;i<count;i++)this._resetParticle(i);
    }

    _resetParticle(i){
      const {r,g,b}=this._getColor();
      this.geo.attributes.position.array[i*3]=(Math.random()-0.5)*0.2;
      this.geo.attributes.position.array[i*3+1]=Math.random()*0.1;
      this.geo.attributes.position.array[i*3+2]=(Math.random()-0.5)*0.2;
      this.geo.attributes.color.array[i*3]=r;
      this.geo.attributes.color.array[i*3+1]=g;
      this.geo.attributes.color.array[i*3+2]=b;
      this.geo.attributes.size.array[i]=this.config.size*(0.5+Math.random());
      this.particles[i]={vx:(Math.random()-0.5)*0.005,vy:this.config.speed*(0.5+Math.random()),vz:(Math.random()-0.5)*0.005,life:Math.random()};
    }

    _getColor(){
      const c=new THREE.Color(this.config.color);
      return{r:c.r,g:c.g,b:c.b};
    }

    setColor(hexColor){this.config.color=hexColor;}

    update(){
      const pos=this.geo.attributes.position.array;
      const sizes=this.geo.attributes.size.array;
      const cols=this.geo.attributes.color.array;
      for(let i=0;i<this.count;i++){
        const p=this.particles[i];
        pos[i*3]+=p.vx;pos[i*3+1]+=p.vy;pos[i*3+2]+=p.vz;
        p.life+=0.02;
        if(p.life>1.0||pos[i*3+1]>0.8){p.life=0;this._resetParticle(i);}
        const alpha=Math.sin(p.life*Math.PI);
        const{r,g,b}=this._getColor();
        cols[i*3]=r*alpha;cols[i*3+1]=g*alpha;cols[i*3+2]=b*alpha;
        sizes[i]=this.config.size*(1-p.life*0.5);
      }
      this.geo.attributes.position.needsUpdate=true;
      this.geo.attributes.color.needsUpdate=true;
      this.geo.attributes.size.needsUpdate=true;
    }

    setPosition(x,y,z){this.points.position.set(x,y,z);}

    dispose(){
      if(this.scene)this.scene.remove(this.points);
      this.geo.dispose();this.mat.dispose();
    }
  }

  window.ParticleSystem=ParticleSystem;
})();
