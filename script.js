const form=document.getElementById("taskForm");
const taskInput=document.getElementById("taskInput");
const dateInput=document.getElementById("dateInput");
const timeInput=document.getElementById("timeInput");
const list=document.getElementById("taskList");
const empty=document.getElementById("empty");
const remaining=document.getElementById("remaining");
const clearCompleted=document.getElementById("clearCompleted");
let tasks=JSON.parse(localStorage.getItem("taskflow_tasks")||"[]");
let filter="all";

function save(){localStorage.setItem("taskflow_tasks",JSON.stringify(tasks));render()}
function esc(s){return s.replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[c]))}
function formatDue(task){
 if(!task.date&&!task.time)return "";
 const d=task.date?new Date(`${task.date}T${task.time||"00:00"}`):null;
 if(!d||Number.isNaN(d.getTime()))return "";
 const text=d.toLocaleString([], {dateStyle:"medium",timeStyle:task.time?"short":"short"});
 const overdue=!task.done&&d.getTime()<Date.now();
 return `<span class="${overdue?"overdue":""}">${overdue?"Overdue • ":"Due • "}${text}</span>`;
}
function render(){
 const filtered=tasks.filter(t=>filter==="all"||(filter==="active"&&!t.done)||(filter==="completed"&&t.done));
 list.innerHTML=filtered.map(t=>`
 <article class="task ${t.done?"done":""}">
   <button class="check" data-action="toggle" data-id="${t.id}" aria-label="Mark complete"></button>
   <div><div class="task-title">${esc(t.title)}</div><div class="task-info">${formatDue(t)}</div></div>
   <div class="task-actions">
    <button class="icon-btn" data-action="edit" data-id="${t.id}">Edit</button>
    <button class="icon-btn delete" data-action="delete" data-id="${t.id}">Delete</button>
   </div>
 </article>`).join("");
 empty.classList.toggle("hidden",filtered.length>0);
 remaining.textContent=tasks.filter(t=>!t.done).length;
}
form.addEventListener("submit",e=>{
 e.preventDefault();
 tasks.unshift({id:Date.now(),title:taskInput.value.trim(),date:dateInput.value,time:timeInput.value,done:false});
 form.reset();save();taskInput.focus();
});
list.addEventListener("click",e=>{
 const b=e.target.closest("button");if(!b)return;
 const id=Number(b.dataset.id), action=b.dataset.action, task=tasks.find(t=>t.id===id);
 if(action==="toggle")task.done=!task.done;
 if(action==="delete")tasks=tasks.filter(t=>t.id!==id);
 if(action==="edit"){
   const title=prompt("Edit task:",task.title);
   if(title&&title.trim())task.title=title.trim();
   else return;
 }
 save();
});
document.querySelectorAll(".filter").forEach(b=>b.addEventListener("click",()=>{
 document.querySelectorAll(".filter").forEach(x=>x.classList.remove("active"));
 b.classList.add("active");filter=b.dataset.filter;render();
}));
clearCompleted.addEventListener("click",()=>{tasks=tasks.filter(t=>!t.done);save()});
render();
