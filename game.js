let score=0, combo=1, timeLeft=60, playing=true, mode="classique";
let bestScore=localStorage.getItem("bestScore")||0;
let bestCombo=localStorage.getItem("bestCombo")||0;

const circle=document.getElementById("circle");
const scoreBox=document.getElementById("score");
const comboBox=document.getElementById("combo");
const timerBox=document.getElementById("timer");

const menu=document.getElementById("menu");
const game=document.getElementById("game");
const gameoverOverlay=document.getElementById("gameover-overlay");
const finalScoreBox=document.getElementById("final-score");
const restartBtn=document.querySelector("#gameover-box #restart");
const createGifBtn=document.querySelector("#gameover-box #create-gif");

const bestScoreBox=document.getElementById("best-score");
const bestComboBox=document.getElementById("best-combo");
bestScoreBox.innerText="Meilleur Score : "+bestScore;
bestComboBox.innerText="Meilleur Combo : x"+bestCombo;

function randomColor(){ return `hsl(${Math.random()*360},100%,50%)`; }

function explodeParticles(x,y){
    for(let i=0;i<8;i++){
        const p=document.createElement("div");
        p.className="particle";
        p.style.background=circle.style.background;
        p.style.left=x+"px";
        p.style.top=y+"px";
        document.body.appendChild(p);
        setTimeout(()=>p.remove(),500);
    }
}

function createTrail(x,y){
    const t=document.createElement("div");
    t.className="trail";
    t.style.left=(x-20)+"px";
    t.style.top=(y-20)+"px";
    document.body.appendChild(t);
    setTimeout(()=>t.remove(),400);
}

function createBackgroundStars(amount=80){
    for(let i=0;i<amount;i++){
        const star=document.createElement("div");
        star.className="star";
        star.style.left=Math.random()*window.innerWidth+"px";
        star.style.top=Math.random()*window.innerHeight+"px";
        star.style.animationDuration=(2+Math.random()*3)+"s";
        document.body.appendChild(star);
    }
}
createBackgroundStars();

function moveCircle(){
    const padding=10;
    const maxX=window.innerWidth - circle.offsetWidth - padding;
    const maxY=window.innerHeight - circle.offsetHeight - padding;
    const x=padding + Math.random()*maxX;
    const y=padding + Math.random()*maxY;
    circle.style.left=x+"px";
    circle.style.top=y+"px";
    createTrail(x+circle.offsetWidth/2, y+circle.offsetHeight/2);
}

function startGame(selectedMode){
    mode=selectedMode;
    menu.classList.add("hidden");
    game.classList.remove("hidden");
    score=0; combo=1; timeLeft=60; playing=true;

    scoreBox.innerText="Score : 0";
    comboBox.innerText="Combo x1";
    timerBox.innerText=mode==="infini"?"♾️":timeLeft+"s";

    moveCircle();

    if(mode!=="infini"){
        const timer=setInterval(()=>{
            if(!playing) return clearInterval(timer);
            timeLeft--;
            timerBox.innerText=timeLeft+"s";
            if(timeLeft<=0) endGame();
        },1000);
    }
}

circle.addEventListener("click",()=>{
    if(!playing) return;

    combo++;
    score+=5*combo;
    scoreBox.innerText="Score : "+score;
    comboBox.innerText="Combo x"+combo;

    const newColor=randomColor();
    circle.style.background=newColor;
    circle.style.boxShadow=`0 0 25px ${newColor},0 0 50px ${newColor}`;
    document.body.style.background=`linear-gradient(120deg, ${randomColor()}, ${randomColor()}, #24243e)`;

    const rect=circle.getBoundingClientRect();
    explodeParticles(rect.left+circle.offsetWidth/2, rect.top+circle.offsetHeight/2);

    if(combo>=10){ document.body.style.filter="brightness(1.2)"; setTimeout(()=>document.body.style.filter="brightness(1)",100); }
    if(combo>=20){ document.body.style.animation="shake 0.1s infinite"; setTimeout(()=>document.body.style.animation="",300); }

    moveCircle();
    circle.style.transform="scale(0.8)";
    setTimeout(()=>circle.style.transform="scale(1)",100);
});

function endGame(){
    playing=false;
    circle.style.display="none";
    gameoverOverlay.classList.remove("hidden");

    let displayedScore=0;
    const interval=setInterval(()=>{
        if(displayedScore>=score){ clearInterval(interval); return; }
        displayedScore+=Math.ceil(score/50);
        finalScoreBox.innerText="Ton score final : "+displayedScore;
        finalScoreBox.style.transform="scale(1.2)";
        setTimeout(()=>finalScoreBox.style.transform="scale(1)",50);
    },50);

    if(score>bestScore){ bestScore=score; localStorage.setItem("bestScore",bestScore);}
    if(combo>bestCombo){ bestCombo=combo; localStorage.setItem("bestCombo",bestCombo);}
}

restartBtn.addEventListener("click",()=>location.reload());

createGifBtn.addEventListener("click", ()=>{
    alert("Le GIF sera créé en 5 secondes !");
    const gif=new GIF({workers:2, quality:10, width:window.innerWidth, height:window.innerHeight});
    let frames=0; const maxFrames=50;
    const captureInterval=setInterval(()=>{
        html2canvas(document.body).then(canvas=>gif.addFrame(canvas,{delay:100}));
        frames++;
        if(frames>=maxFrames){ clearInterval(captureInterval); gif.render(); }
    },100);
    gif.on('finished', blob=>{
        const url=URL.createObjectURL(blob);
        const a=document.createElement("a"); a.href=url; a.download="glow_strike.gif"; a.click();
        URL.revokeObjectURL(url);
        alert("GIF créé et prêt à télécharger !");
    });
});

function adjustCircleSize(){
    const w=window.innerWidth;
    if(w<500){ circle.style.width="70px"; circle.style.height="70px"; }
    else{ circle.style.width="100px"; circle.style.height="100px"; }
}
window.addEventListener("resize", adjustCircleSize);
adjustCircleSize();
