/* ════════════════════════════════════
   PARTICLES SYSTEM — particles.js
   Standalone version
   ════════════════════════════════════ */
(function(){
  // Only define if not already defined by lab-scene.js
  if(window.ParticleSystem)return;

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
        blending:options.blending||(typeof THREE!=='undefined'?THREE.AdditiveBlending:1)
      };
      if(typeof THREE!=='undefined')this._build();
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
      const{r,g,b}=this._getColor();
      const pos=this.geo.attributes.position.array;
      const cols=this.geo.attributes.color.array;
      const sizes=this.geo.attributes.size.array;
      pos[i*3]=(Math.random()-0.5)*0.2;
      pos[i*3+1]=Math.random()*0.1;
      pos[i*3+2]=(Math.random()-0.5)*0.2;
      const t=Math.random();
      cols[i*3]=r*t;cols[i*3+1]=g*t;cols[i*3+2]=b*t;
      sizes[i]=this.config.size*(0.5+Math.random());
      this.particles[i]={
        vx:(Math.random()-0.5)*0.005,
        vy:this.config.speed*(0.5+Math.random()),
        vz:(Math.random()-0.5)*0.005,
        life:Math.random()
      };
    }

    _getColor(){
      const c=new THREE.Color(this.config.color);
      return{r:c.r,g:c.g,b:c.b};
    }

    setColor(hexColor){this.config.color=hexColor;}

    update(){
      if(!this.geo)return;
      const pos=this.geo.attributes.position.array;
      const sizes=this.geo.attributes.size.array;
      const cols=this.geo.attributes.color.array;
      for(let i=0;i<this.count;i++){
        const p=this.particles[i];
        if(!p)continue;
        pos[i*3]+=p.vx;pos[i*3+1]+=p.vy;pos[i*3+2]+=p.vz;
        p.life+=0.02;
        if(p.life>1.0||pos[i*3+1]>0.8){p.life=0;this._resetParticle(i);continue;}
        const alpha=Math.sin(p.life*Math.PI);
        const{r,g,b}=this._getColor();
        cols[i*3]=r*alpha;cols[i*3+1]=g*alpha;cols[i*3+2]=b*alpha;
        sizes[i]=this.config.size*(1-p.life*0.5);
      }
      this.geo.attributes.position.needsUpdate=true;
      this.geo.attributes.color.needsUpdate=true;
      this.geo.attributes.size.needsUpdate=true;
    }

    // Burst: spawn N particles from a given world position
    burst(x,y,z,count,color){
      const oldColor=this.config.color;
      if(color!==undefined)this.config.color=color;
      for(let i=0;i<Math.min(count,this.count);i++){
        this._resetParticle(i);
        this.geo.attributes.position.array[i*3]=x;
        this.geo.attributes.position.array[i*3+1]=y;
        this.geo.attributes.position.array[i*3+2]=z;
      }
      this.geo.attributes.position.needsUpdate=true;
      if(color!==undefined)this.config.color=oldColor;
    }

    setPosition(x,y,z){if(this.points)this.points.position.set(x,y,z);}

    dispose(){
      if(this.scene&&this.points)this.scene.remove(this.points);
      if(this.geo)this.geo.dispose();
      if(this.mat)this.mat.dispose();
    }
  }

  window.ParticleSystem=ParticleSystem;
})();
