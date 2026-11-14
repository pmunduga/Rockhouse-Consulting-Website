(function(){
  var QS=[
   {d:'sales',q:'How do new customers usually find you?',o:['Mostly luck or word of mouth, nothing steady','A few reliable sources, but not tracked','A clear, repeatable way I can measure']},
   {d:'sales',q:'When a customer reaches out, how fast and consistent is your follow-up?',o:['It depends on how busy I am','Usually quick, but it is not written down','Same day, every time, with a simple routine']},
   {d:'ops',q:'How much of your week goes to repeat tasks you do by hand?',o:['Most of it','Some of it','Very little, they are templated or automated']},
   {d:'ops',q:'If you were out for two weeks, what would happen?',o:['Things would stall','Mostly fine, a few things would slip','Runs fine, my process is documented']},
   {d:'money',q:'How well do you know your numbers (profit, cash, best and worst customers)?',o:['I check the bank balance and hope','I know the basics, not the detail','I review them monthly and act on them']},
   {d:'money',q:'How often are invoices late or jobs priced by gut feel?',o:['Often','Sometimes','Rarely, I have pricing rules and collections routine']},
   {d:'people',q:'How clear is who does what in your business?',o:['Everything runs through me','Roles exist but overlap','Clear roles and handoffs']},
   {d:'people',q:'How ready is the business to grow 20% without breaking?',o:['It would break','It would strain','I have a plan and capacity']}
  ];
  var NAMES={sales:'Getting and keeping customers',ops:'Running day to day',money:'Money and pricing',people:'Team and growth'};
  var TIPS={
   sales:'Write down your top three customer sources and the one follow-up step you will always do within a day. Track which source brings paying customers.',
   ops:'List the five tasks you repeat most. Pick one and turn it into a checklist or template this week. Documenting it is the first step before automating it.',
   money:'Set one 30-minute monthly money review: cash in, cash out, top and bottom customers. Price your next job from cost plus target margin, not gut feel.',
   people:'Draw who owns what on one page. Anything only you can do is your bottleneck. Hand off or document one item this month.'
  };
  var i=0,ans=[],last=null,$=function(id){return document.getElementById(id)};
  function g(n,p){if(window.gtag)gtag('event',n,p||{});}
  function show(id){['bc-intro','bc-quiz','bc-result'].forEach(function(x){$(x).style.display=x===id?'block':'none'});}
  function render(){
    var q=QS[i];$('bc-progress').textContent='Question '+(i+1)+' of '+QS.length;$('bc-q').textContent=q.q;
    var box=$('bc-opts');box.innerHTML='';
    q.o.forEach(function(t,k){var b=document.createElement('button');b.type='button';b.className='btn';b.style.textAlign='left';b.textContent=t;
      b.onclick=function(){ans[i]=k;if(i<QS.length-1){i++;render();}else finish();};box.appendChild(b);});
    $('bc-back').style.display=i>0?'inline-block':'none';
  }
  function finish(){
    var t={sales:0,ops:0,money:0,people:0};QS.forEach(function(q,k){t[q.d]+=ans[k];});
    var weakest=Object.keys(t).sort(function(a,b){return t[a]-t[b]})[0];
    var total=Object.keys(t).reduce(function(s,k){return s+t[k]},0);
    var level=total<=5?'Lots of easy wins':total<=11?'A solid base with clear gaps':'Strong foundation';
    last={weakest:NAMES[weakest],score:total+'/16',level:level,t:t,total:total};
    $('bc-headline').textContent=level+'. Start with: '+NAMES[weakest]+'.';
    var s='';Object.keys(t).forEach(function(k){var p=t[k]/4*100;
      s+='<div style="margin:.6rem 0"><div style="display:flex;justify-content:space-between"><span>'+NAMES[k]+'</span><span>'+t[k]+'/4</span></div><div style="background:#e3e8ee;height:10px;border-radius:5px"><div style="width:'+p+'%;height:10px;border-radius:5px;background:#0E8394"></div></div></div>';});
    $('bc-scores').innerHTML=s;
    $('bc-tips').innerHTML='<h3>Your first move</h3><p>'+TIPS[weakest]+'</p>';
    show('bc-result');g('bc_complete',{weakest_area:weakest,score:total});window.scrollTo(0,0);
  }
  $('bc-start').onclick=function(){g('bc_start');i=0;ans=[];show('bc-quiz');render();};
  $('bc-back').onclick=function(){if(i>0){i--;render();}};
  $('bc-form').addEventListener('submit',function(e){
    e.preventDefault();var f=e.target,st=$('bc-status');st.textContent='Sending...';
    var d=new FormData(f);d.append('source','business-check');
    var LAB=['Weak','Developing','Strong'],L=[];
    L.push('BUSINESS CHECK SUMMARY','Overall: '+last.score+' ('+last.level+')','Weakest area: '+last.weakest,'','AREA SCORES (each out of 4)');
    Object.keys(NAMES).forEach(function(k){L.push('- '+NAMES[k]+': '+last.t[k]+'/4');});
    L.push('','ANSWERS');
    QS.forEach(function(q,k){L.push((k+1)+'. ['+NAMES[q.d]+'] '+q.q+' -> '+q.o[ans[k]]+' ('+LAB[ans[k]]+')');});
    L.push('','TALKING POINTS FOR FOLLOW-UP','Lead with: '+TIPS[Object.keys(NAMES).filter(function(k){return NAMES[k]===last.weakest})[0]]);
    var weakQs=QS.filter(function(q,k){return ans[k]===0}).map(function(q){return '- '+q.q});
    if(weakQs.length){L.push('','Answered "weak" on:');weakQs.forEach(function(x){L.push(x);});}
    d.append('message',L.join('\n'));
    d.append('_subject','Business Check lead: '+(f.company.value||f.name.value)+' ('+last.score+', weakest: '+last.weakest+')');
    fetch('https://formspree.io/f/xoeqydqp',{method:'POST',body:d,headers:{Accept:'application/json'}}).then(function(r){
      if(r.ok){g('generate_lead',{source:'business-check'});st.textContent='Thanks. I will be in touch within a business day.';f.reset();}
      else st.textContent='Something went wrong. Please email info@rockhouse-consulting.com.';
    }).catch(function(){st.textContent='Something went wrong. Please email info@rockhouse-consulting.com.';});
  });
})();
