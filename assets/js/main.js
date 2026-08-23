const $=(s,r=document)=>r.querySelector(s);
const $$=(s,r=document)=>[...r.querySelectorAll(s)];
const clamp=(v,a,b)=>Math.min(b,Math.max(a,v));
const reduced=matchMedia("(prefers-reduced-motion: reduce)").matches;

// Boot
const boot=$("#boot");
const finishBoot=()=>boot?.classList.add("is-done");
$("#bootSkip")?.addEventListener("click",finishBoot);
setTimeout(finishBoot,reduced?80:1350);

// Reveal
const revealObserver=new IntersectionObserver(entries=>{
  entries.forEach(e=>{
    if(e.isIntersecting){e.target.classList.add("visible");revealObserver.unobserve(e.target)}
  });
},{threshold:.12,rootMargin:"0px 0px -5% 0px"});
$$("[data-reveal]").forEach(el=>revealObserver.observe(el));

// Progress
const progress=$(".progress span");
const updateProgress=()=>{
  const h=document.documentElement.scrollHeight-innerHeight;
  progress.style.width=`${h>0?clamp(scrollY/h*100,0,100):0}%`;
};
updateProgress();
addEventListener("scroll",updateProgress,{passive:true});

// Pointer
let px=innerWidth/2,py=innerHeight/2;
const orb=$(".cursor-orb");
const readout=$("#pointerReadout");
addEventListener("pointermove",e=>{
  px=e.clientX;py=e.clientY;
  if(orb&&!reduced){orb.style.left=`${px}px`;orb.style.top=`${py}px`}
  if(readout){
    const x=((px/innerWidth)*2-1).toFixed(2);
    const y=((py/innerHeight)*2-1).toFixed(2);
    readout.textContent=`X ${x>=0?"+":""}${x} · Y ${y>=0?"+":""}${y}`;
  }
},{passive:true});

// Magnetic + tilt
if(matchMedia("(hover:hover) and (pointer:fine)").matches&&!reduced){
  $$(".magnetic").forEach(el=>{
    el.addEventListener("pointermove",e=>{
      const r=el.getBoundingClientRect();
      el.style.transform=`translate(${(e.clientX-r.left-r.width/2)*.1}px,${(e.clientY-r.top-r.height/2)*.1}px)`;
    });
    el.addEventListener("pointerleave",()=>el.style.transform="");
  });
  $$(".tilt").forEach(el=>{
    el.addEventListener("pointermove",e=>{
      const r=el.getBoundingClientRect(),x=(e.clientX-r.left)/r.width,y=(e.clientY-r.top)/r.height;
      el.style.transform=`perspective(1300px) rotateX(${(.5-y)*3.8}deg) rotateY(${(x-.5)*5}deg) translateY(-2px)`;
    });
    el.addEventListener("pointerleave",()=>el.style.transform="");
  });
}

// Hero principle words
const principles=["GROUNDED","TRACEABLE","REVIEWABLE","LOCAL-FIRST","EVALUATED"];
let principleIndex=0;
const principle=$("#principleWord");
if(principle&&!reduced){
  setInterval(()=>{
    principleIndex=(principleIndex+1)%principles.length;
    principle.animate([{opacity:0,transform:"translateY(8px)"},{opacity:1,transform:"translateY(0)"}],{duration:420,easing:"cubic-bezier(.16,.8,.2,1)"});
    principle.textContent=principles[principleIndex];
  },2400);
}

// Filters
$$(".filter").forEach(btn=>{
  btn.addEventListener("click",()=>{
    $$(".filter").forEach(b=>b.classList.remove("active"));
    btn.classList.add("active");
    const f=btn.dataset.filter;
    $$(".repo-row").forEach(row=>{
      const show=f==="all"||row.dataset.cat.split(" ").includes(f);
      row.classList.toggle("hidden",!show);
    });
  });
});

// Case studies
const PROJECTS={
  aegis:{
    kicker:"FLAGSHIP / ANDROID SECURITY / GRADUATION PROJECT",
    title:"AEGIS",
    summary:"An AI-powered Android mobile security platform designed around analyst review, risk scoring, APK evidence and traceable AI assistance.",
    problem:"Security tooling becomes less useful when a model gives a risk label without showing the evidence behind it. The goal was to make APK and device analysis reviewable rather than opaque.",
    decision:"Separate evidence collection and deterministic analysis from AI interpretation. Preserve lineage, map findings to MITRE ATT&CK, keep analyst review in the loop, and generate report-ready outputs.",
    why:"The system demonstrates end-to-end AI product thinking: ingestion, analysis, retrieval, risk reasoning, interface design, review workflows and reporting — not just an isolated model.",
    flow:["APK / DEVICE","STATIC + DYNAMIC","EVIDENCE","RISK + MITRE","LOCAL AI","ANALYST REVIEW","REPORT"],
    stack:["Python","FastAPI","React","Docker","Ollama","RAG","MITRE ATT&CK"],
    repo:"https://github.com/A7med668/AEGIS-Graduation-Project"
  },
  agents:{
    kicker:"AGENTIC AI / MOBILE SECURITY",
    title:"Multi-Agent Security Assistant",
    summary:"A guarded LangGraph system for mobile security reasoning with long-term memory, MASVS knowledge, RAG, caching and observability.",
    problem:"A single chatbot pipeline is hard to control, debug and specialize. Security questions also need routing, retrieval, guardrails and memory that should not all live inside one prompt.",
    decision:"Use specialized graph nodes for guard, cache, router, memory, database knowledge, retrieval, optional web search and final response generation. Add LangSmith traces for execution visibility.",
    why:"The architecture turns an LLM conversation into an inspectable workflow where routing, retrieval, memory and safety decisions can be reasoned about independently.",
    flow:["QUERY","GUARD","CACHE","ROUTER","MEMORY","MASVS / RAG","RESPONSE"],
    stack:["LangGraph","LangChain","FAISS","Qdrant","Ollama","MASVS","LangSmith"],
    repo:"https://github.com/A7med668/LangGraph-Multi-Agent-Mobile-Security-Assistant"
  },
  deeptrace:{
    kicker:"DIGITAL FORENSICS / LOCAL-FIRST",
    title:"DeepTrace AI",
    summary:"A local-first forensic workstation for image and PDF evidence with deterministic analysis and bounded AI interpretation.",
    problem:"Forensic evidence should not depend on an unconstrained cloud model, and model summaries should never replace integrity checks, OCR, metadata or deterministic signals.",
    decision:"Build the forensic layer first: SHA-256 integrity, OCR, metadata, ELA and duplicate detection. Keep optional local-LLM summaries separated from deterministic analysis and constrain their role.",
    why:"This design makes AI an assistant to the evidence pipeline rather than the authority — a better fit for forensic review and privacy-sensitive workflows.",
    flow:["EVIDENCE","HASH","OCR","META / ELA","DUP CHECK","LOCAL LLM","REVIEW"],
    stack:["Python","FastAPI","Streamlit","OpenCV","Tesseract","PyMuPDF","SQLAlchemy","Ollama"],
    repo:""
  },
  hunter:{
    kicker:"THREAT HUNTING / RAG / MITRE",
    title:"LlamaRAG-Hunter",
    summary:"A local AI threat-hunting workflow that analyzes multiple evidence formats, grounds findings with RAG and maps signals to MITRE ATT&CK.",
    problem:"Security evidence arrives in heterogeneous formats — logs, PCAP, EVTX, APK — and analysts need a coherent, explainable way to connect findings.",
    decision:"Normalize evidence, add domain-specific analysis, retrieve relevant knowledge with RAG, map results to ATT&CK techniques and generate structured reports with confidence-oriented signals.",
    why:"It combines local AI with classical security tooling and standardized threat taxonomy rather than using an LLM as a free-form security oracle.",
    flow:["EVTX / PCAP / APK","PARSE","SIGNALS","RAG","MITRE MAP","LLAMA 3","REPORT"],
    stack:["Llama 3","ChromaDB","RAG","Androguard","Scapy","Streamlit"],
    repo:"https://github.com/A7med668/LlamaRAG-Hunter"
  }
};
const caseDialog=$("#caseDialog");
const fillCase=(key)=>{
  const p=PROJECTS[key]; if(!p)return;
  $("#caseKicker").textContent=p.kicker;
  $("#caseTitle").textContent=p.title;
  $("#caseSummary").textContent=p.summary;
  $("#caseProblem").textContent=p.problem;
  $("#caseDecision").textContent=p.decision;
  $("#caseWhy").textContent=p.why;
  const repo=$("#caseRepo");
  if(p.repo){repo.href=p.repo;repo.textContent="View repository ↗";repo.classList.remove("is-private")}
  else{repo.removeAttribute("href");repo.textContent="Private / local build";repo.classList.add("is-private")}
  $("#caseFlow").innerHTML=p.flow.map((x,i)=>`${i?'<span class="flow-arrow">→</span>':''}<div class="flow-node">${x}</div>`).join("");
  $("#caseStack").innerHTML=p.stack.map(x=>`<span>${x}</span>`).join("");
  caseDialog.showModal();
};
$$("[data-open-project]").forEach(btn=>btn.addEventListener("click",()=>fillCase(btn.dataset.openProject)));
$("#caseClose")?.addEventListener("click",()=>caseDialog.close());
caseDialog?.addEventListener("click",e=>{if(e.target===caseDialog)caseDialog.close()});

// Command palette
const cmd=$("#commandDialog");
const openCmd=()=>{if(!cmd.open)cmd.showModal()};
$$("[data-command]").forEach(b=>b.addEventListener("click",openCmd));
addEventListener("keydown",e=>{
  if((e.ctrlKey||e.metaKey)&&e.key.toLowerCase()==="k"){e.preventDefault();cmd.open?cmd.close():openCmd()}
  if(e.key==="Escape"&&caseDialog?.open)caseDialog.close();
});
$$(".command-items a").forEach(a=>a.addEventListener("click",()=>cmd.close()));

// 3D shader hero (progressive enhancement)
async function initHero3D(){
  const canvas=$("#heroWebGL"); if(!canvas)return;
  try{
    const THREE=await import("https://cdn.jsdelivr.net/npm/three@0.178.0/+esm");
    const scene=new THREE.Scene();
    const camera=new THREE.PerspectiveCamera(42,1,.1,100);
    camera.position.z=5.8;
    const renderer=new THREE.WebGLRenderer({canvas,alpha:true,antialias:true,powerPreference:"high-performance"});
    renderer.setPixelRatio(Math.min(devicePixelRatio,1.7));
    renderer.setClearColor(0x000000,0);

    const geometry=new THREE.IcosahedronGeometry(1.42,5);
    const uniforms={uTime:{value:0},uMouse:{value:new THREE.Vector2()},uAccent:{value:new THREE.Color(0xa7ff68)},uCyan:{value:new THREE.Color(0x6be8ef)}};
    const material=new THREE.ShaderMaterial({
      uniforms,transparent:true,depthWrite:false,
      vertexShader:`
        uniform float uTime; uniform vec2 uMouse;
        varying float vWave; varying vec3 vNormalW; varying vec3 vPos;
        void main(){
          vec3 p=position;
          float w=sin(p.x*3.4+uTime*0.85)*sin(p.y*3.0-uTime*.6)*sin(p.z*3.2+uTime*.42);
          w+=sin((p.x+p.y+p.z)*5.0-uTime*.7)*.25;
          p+=normal*w*.085;
          p.x+=uMouse.x*.08*(1.0-abs(normal.x));
          p.y+=uMouse.y*.08*(1.0-abs(normal.y));
          vec4 world=modelMatrix*vec4(p,1.0);
          vPos=world.xyz; vNormalW=normalize(mat3(modelMatrix)*normal); vWave=w;
          gl_Position=projectionMatrix*viewMatrix*world;
        }`,
      fragmentShader:`
        uniform vec3 uAccent; uniform vec3 uCyan;
        varying float vWave; varying vec3 vNormalW; varying vec3 vPos;
        void main(){
          vec3 V=normalize(cameraPosition-vPos);
          float fres=pow(1.0-max(dot(V,normalize(vNormalW)),0.0),2.2);
          float grid=smoothstep(.46,.5,abs(sin(vPos.y*12.0+vWave*1.5)));
          vec3 col=mix(uAccent,uCyan,clamp(fres+.25*vWave,0.0,1.0));
          float alpha=.06+fres*.52+grid*.035;
          gl_FragColor=vec4(col,alpha);
        }`,
      blending:THREE.AdditiveBlending,side:THREE.DoubleSide
    });
    const mesh=new THREE.Mesh(geometry,material);
    scene.add(mesh);

    const wire=new THREE.Mesh(
      new THREE.IcosahedronGeometry(1.6,2),
      new THREE.MeshBasicMaterial({color:0xa7ff68,wireframe:true,transparent:true,opacity:.055})
    );
    scene.add(wire);

    const pCount=innerWidth<760?190:380;
    const pos=new Float32Array(pCount*3);
    for(let i=0;i<pCount;i++){
      const t=Math.random()*Math.PI*2, z=Math.random()*2-1, r=2.0+Math.random()*1.1, s=Math.sqrt(1-z*z);
      pos[i*3]=r*s*Math.cos(t);pos[i*3+1]=r*s*Math.sin(t);pos[i*3+2]=r*z;
    }
    const pg=new THREE.BufferGeometry();pg.setAttribute("position",new THREE.BufferAttribute(pos,3));
    const points=new THREE.Points(pg,new THREE.PointsMaterial({color:0xcbd7c8,size:.018,transparent:true,opacity:.45}));
    scene.add(points);

    const torus1=new THREE.Mesh(new THREE.TorusGeometry(2.2,.006,5,180),new THREE.MeshBasicMaterial({color:0x6be8ef,transparent:true,opacity:.15}));
    torus1.rotation.set(.9,.3,.5);scene.add(torus1);
    const torus2=new THREE.Mesh(new THREE.TorusGeometry(2.65,.004,5,180),new THREE.MeshBasicMaterial({color:0xaa88ff,transparent:true,opacity:.1}));
    torus2.rotation.set(1.2,.7,-.4);scene.add(torus2);

    const resize=()=>{
      const r=canvas.getBoundingClientRect(),w=Math.max(1,r.width),h=Math.max(1,r.height);
      renderer.setSize(w,h,false);camera.aspect=w/h;camera.updateProjectionMatrix()
    };
    resize();const ro=new ResizeObserver(resize);ro.observe(canvas);

    const clock=new THREE.Clock();let raf=0;
    const frame=()=>{
      raf=requestAnimationFrame(frame);
      const t=clock.getElapsedTime();
      const rect=canvas.getBoundingClientRect();
      const mx=clamp(((px-rect.left)/Math.max(1,rect.width))*2-1,-1,1);
      const my=clamp(-(((py-rect.top)/Math.max(1,rect.height))*2-1),-1,1);
      uniforms.uTime.value=reduced?0:t;
      uniforms.uMouse.value.lerp(new THREE.Vector2(mx,my),.05);
      if(!reduced){
        mesh.rotation.y=t*.08+mx*.13;mesh.rotation.x=t*.035+my*.09;
        wire.rotation.y=-t*.055;wire.rotation.x=t*.03;
        points.rotation.y=t*.018;torus1.rotation.z=t*.035;torus2.rotation.y=-t*.025;
      }
      renderer.render(scene,camera);
    };
    frame();
    addEventListener("pagehide",()=>{cancelAnimationFrame(raf);ro.disconnect();renderer.dispose();geometry.dispose();pg.dispose()},{once:true});
  }catch(err){
    console.info("WebGL enhancement unavailable; CSS fallback remains active.",err);
    canvas.style.display="none";
  }
}
initHero3D();


// V5: public project media gracefully falls back if GitHub raw media is unavailable.
const publicProjectShot = document.querySelector("#agentStudioShot");
publicProjectShot?.addEventListener("error", () => {
  publicProjectShot.closest(".media-screen")?.classList.add("image-error");
});
publicProjectShot?.addEventListener("load", () => {
  publicProjectShot.closest(".media-screen")?.classList.remove("image-error");
});
