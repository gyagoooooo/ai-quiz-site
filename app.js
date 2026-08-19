
const data=window.QUIZ_DATA||[];
const KEY='ssafy-ai-quiz-v1';
const state=JSON.parse(localStorage.getItem(KEY)||'{"answers":{},"wrong":{},"reviewed":{}}');
let view='all';
const $=s=>document.querySelector(s);
function save(){localStorage.setItem(KEY,JSON.stringify(state));renderStats()}
function esc(s=''){return String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]))}
function fmt(s=''){return esc(s).replace(/\*\*(.*?)\*\*/g,'<b>$1</b>').replace(/`([^`]+)`/g,'<code>$1</code>').replace(/\n/g,'<br>')}
function sources(){return [...new Set(data.map(q=>q.source))]}
function renderFilters(){ $('#source').innerHTML='<option value="">전체 파일</option>'+sources().map(s=>`<option>${esc(s)}</option>`).join(''); }
function filtered(){let arr=data; const s=$('#source').value, typ=$('#type').value, word=$('#search').value.trim().toLowerCase(); if(s)arr=arr.filter(q=>q.source===s); if(typ)arr=arr.filter(q=>q.type===typ); if(word)arr=arr.filter(q=>(q.title+' '+q.body+' '+q.answer).toLowerCase().includes(word)); if(view==='wrong')arr=arr.filter(q=>state.wrong[q.id]); if(view==='unanswered')arr=arr.filter(q=>state.answers[q.id]==null); return arr}
function renderStats(){const solved=Object.keys(state.answers).length, wrong=Object.keys(state.wrong).length; $('#total').textContent=data.length; $('#solved').textContent=solved; $('#wrong').textContent=wrong}
function card(q){const prev=state.answers[q.id]; let input=''; if(q.choices.length){input=`<div class="choices">${q.choices.map(c=>`<label class="choice"><input type="radio" name="${esc(q.id)}" value="${c.key}" ${prev===c.key?'checked':''}><span><b>${esc(c.label)}</b> ${fmt(c.text)}</span></label>`).join('')}</div>`} else {input=`<textarea class="textarea" data-text="${esc(q.id)}" placeholder="여기에 답안을 작성하세요.">${esc(prev||'')}</textarea>`}
let fb=''; if(state.reviewed[q.id]){const bad=state.wrong[q.id]; fb=`<div class="feedback ${bad?'bad':'good'}">${bad?'오답노트에 저장됨':'정답/완료로 기록됨'}</div><div class="answer"><b>정답 및 해설</b><br>${fmt(q.answer||'첨부 자료에 별도 해설이 없습니다.')}</div>`}
return `<article class="qcard" data-id="${esc(q.id)}"><div class="meta"><span class="chip">${esc(q.source)}</span>${q.group?`<span class="chip">${esc(q.group)}</span>`:''}<span class="chip">${esc(q.type)}</span><span class="chip">#${esc(q.number)}</span></div><div class="qtitle">${fmt(q.title||'문제 '+q.number)}</div><div class="qbody">${fmt(q.body)}</div>${input}<div class="actions">${q.choices.length?`<button class="btn primary" onclick="grade('${q.id}')">채점하기</button>`:`<button class="btn primary" onclick="reveal('${q.id}')">모범답안 확인</button>`}<button class="btn" onclick="mark('${q.id}',true)">오답으로 저장</button><button class="btn" onclick="mark('${q.id}',false)">정답/완료</button></div>${fb}</article>`}
function render(){const arr=filtered(); $('#count').textContent=arr.length; $('#list').innerHTML=arr.length?arr.map(card).join(''):'<div class="empty">조건에 맞는 문제가 없습니다.</div>'}
window.grade=id=>{const q=data.find(x=>x.id===id); const el=document.querySelector(`input[name="${CSS.escape(id)}"]:checked`); if(!el)return alert('답을 먼저 선택해 주세요.'); state.answers[id]=el.value; if(q.correct){state.wrong[id]=el.value!==q.correct; if(!state.wrong[id])delete state.wrong[id];} else {state.wrong[id]=true;} state.reviewed[id]=true; save(); render()}
window.reveal=id=>{const q=data.find(x=>x.id===id); const ta=document.querySelector(`[data-text="${CSS.escape(id)}"]`); state.answers[id]=ta?ta.value:''; state.reviewed[id]=true; save(); render()}
window.mark=(id,bad)=>{const q=data.find(x=>x.id===id); const ta=document.querySelector(`[data-text="${CSS.escape(id)}"]`); if(ta)state.answers[id]=ta.value; else {const el=document.querySelector(`input[name="${CSS.escape(id)}"]:checked`); if(el)state.answers[id]=el.value;} if(bad)state.wrong[id]=true; else delete state.wrong[id]; state.reviewed[id]=true; save(); render()}
function tab(v){view=v; document.querySelectorAll('.tab').forEach(b=>b.classList.toggle('active',b.dataset.view===v));render()}
window.resetAll=()=>{if(confirm('저장된 풀이/오답 기록을 모두 초기화할까요?')){localStorage.removeItem(KEY);location.reload()}}
window.addEventListener('DOMContentLoaded',()=>{renderFilters(); ['source','type','search'].forEach(id=>$('#'+id).addEventListener(id==='search'?'input':'change',render)); document.querySelectorAll('.tab').forEach(b=>b.onclick=()=>tab(b.dataset.view)); renderStats(); render();});
