(()=>{"use strict";
const readStore=()=>{try{const raw=localStorage.getItem("bakery_store_syp_v1");const data=raw?JSON.parse(raw):{};return{orders:Array.isArray(data.orders)?data.orders:[],products:Array.isArray(data.products)?data.products:[]}}catch(error){console.error("Dashboard storage:",error);return{orders:[],products:[]}}};
const escValue=value=>String(value??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const formatMoney=value=>new Intl.NumberFormat("ar-SY",{maximumFractionDigits:0}).format(Math.round(Number(value)||0))+" ل.س";
function renderDashboard(){
const data=readStore(),orders=data.orders,products=data.products;
const rejected=o=>["مرفوض","مرفوضة","rejected"].includes(String(o.status||"").trim());
const completed=o=>["تم التسليم","مكتمل","مكتملة","delivered","completed"].includes(String(o.status||"").trim());
const salesOrders=orders.filter(o=>!rejected(o)),sales=salesOrders.reduce((sum,o)=>sum+Number(o.total||0),0),active=orders.filter(o=>!rejected(o)&&!completed(o));
const set=(selector,value)=>{const node=document.querySelector(selector);if(node)node.textContent=value};
set("#dashboardDate",new Date().toLocaleDateString("ar-SY",{weekday:"long",year:"numeric",month:"long",day:"numeric"}));
set("#dashboardRevenue",formatMoney(sales));set("#statOrders",orders.length);set("#statActive",active.length);set("#statProducts",products.length);set("#statAverage",formatMoney(salesOrders.length?sales/salesOrders.length:0));
const days=Array.from({length:30},(_,i)=>{const d=new Date();d.setHours(0,0,0,0);d.setDate(d.getDate()-(29-i));return d});
const dayKey=d=>d.getFullYear()+"-"+String(d.getMonth()+1).padStart(2,"0")+"-"+String(d.getDate()).padStart(2,"0");
const dailyTotals={};const dailyOrders={};
salesOrders.forEach(o=>{const d=new Date(o.createdAt||0);if(Number.isNaN(d.getTime()))return;const key=dayKey(d);dailyTotals[key]=(dailyTotals[key]||0)+Number(o.total||0);dailyOrders[key]=(dailyOrders[key]||0)+1});
const values=days.map(d=>dailyTotals[dayKey(d)]||0);
const max=Math.max(...values,1),points=values.map((v,i)=>({x:24+i*(852/29),y:160-v/max*132}));
const chart=document.querySelector("#salesChart"),detail=document.querySelector("#chartDetail"),chartWrap=document.querySelector(".chart-wrap"),tooltip=document.querySelector("#chartTooltip");
if(chart){
chart.setAttribute("viewBox","0 0 900 190");
chart.innerHTML='<line x1="20" y1="160" x2="880" y2="160" stroke="#e7ded2"/><line x1="20" y1="94" x2="880" y2="94" stroke="#eee7de" stroke-dasharray="4 5"/><line x1="20" y1="28" x2="880" y2="28" stroke="#eee7de" stroke-dasharray="4 5"/><polyline points="'+points.map(p=>p.x+","+p.y).join(" ")+'" fill="none" stroke="#916447" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round"/>'+points.map((p,i)=>'<circle class="chart-point" data-index="'+i+'" tabindex="0" role="button" aria-label="عرض مبيعات يوم '+days[i].toLocaleDateString("ar-SY",{day:"numeric",month:"long"})+'" cx="'+p.x+'" cy="'+p.y+'" r="12" fill="transparent" pointer-events="all"/><circle class="chart-dot" cx="'+p.x+'" cy="'+p.y+'" r="4" fill="#916447" pointer-events="none"/>').join("");
const dayInfo=i=>{const key=dayKey(days[i]);return{date:days[i].toLocaleDateString("ar-SY",{weekday:"long",day:"numeric",month:"long"}),sales:formatMoney(values[i]),orders:dailyOrders[key]||0}};
const selectDay=(index,showDetail=true)=>{const i=Number(index);if(!Number.isInteger(i)||i<0||i>=days.length)return;const info=dayInfo(i);if(detail&&showDetail){detail.hidden=false;detail.textContent=info.date+" — "+info.sales+" — "+info.orders+" طلبات";}chart.querySelectorAll(".chart-dot").forEach((p,n)=>p.setAttribute("r",n===i?"8":"4"));chart.querySelectorAll(".chart-point").forEach((p,n)=>p.classList.toggle("selected",n===i));return info;};
chart.querySelectorAll(".chart-point").forEach(point=>{point.addEventListener("click",()=>selectDay(point.dataset.index));point.addEventListener("keydown",event=>{if(event.key==="Enter"||event.key===" "){event.preventDefault();selectDay(point.dataset.index)}})});
if(chartWrap){
chartWrap.addEventListener("scroll",()=>{const svg=chart.getBoundingClientRect(),wrap=chartWrap.getBoundingClientRect();const center=chartWrap.scrollLeft+chartWrap.clientWidth/2;const index=Math.max(0,Math.min(29,Math.round((center-24)/(852/29))));selectDay(index);},{passive:true});
chartWrap.addEventListener("pointermove",event=>{if(event.pointerType!=="mouse"||!tooltip)return;const point=event.target.closest(".chart-point");if(!point){tooltip.classList.remove("visible");return;}const i=Number(point.dataset.index),info=dayInfo(i),rect=chartWrap.getBoundingClientRect();tooltip.innerHTML='<strong>'+info.date+'</strong><span>'+info.sales+'</span><small>'+info.orders+' طلبات</small>';tooltip.style.left=Math.max(8,Math.min(event.clientX-rect.left-tooltip.offsetWidth/2,rect.width-tooltip.offsetWidth-8))+"px";tooltip.style.top=Math.max(6,event.clientY-rect.top-tooltip.offsetHeight-14)+"px";tooltip.classList.add("visible");selectDay(i,false);});
chartWrap.addEventListener("pointerleave",event=>{if(event.pointerType==="mouse"&&tooltip)tooltip.classList.remove("visible")});
}
}
const labels=document.querySelector("#salesChartLabels");if(labels){labels.innerHTML=[0,5,11,17,23,29].map(i=>'<span>'+days[i].toLocaleDateString("ar-SY",{day:"numeric",month:"short"})+'</span>').join("");}
const totals={};salesOrders.forEach(o=>(o.items||[]).forEach(item=>{const name=item.name||"منتج";totals[name]=(totals[name]||0)+Number(item.qty||0)}));
const best=Object.entries(totals).sort((a,b)=>b[1]-a[1]).slice(0,5),top=document.querySelector("#topProducts");if(top)top.innerHTML=best.length?best.map(([name,count],i)=>'<div class="top-product-row"><span class="top-product-rank">'+(i+1)+'</span><b>'+escValue(name)+'</b><strong>'+count+'</strong></div>').join(""):'<div class="dashboard-empty">لا توجد مبيعات مسجلة بعد</div>';
const recent=document.querySelector("#recentOrders");if(recent)recent.innerHTML=[...orders].sort((a,b)=>new Date(b.createdAt||0)-new Date(a.createdAt||0)).slice(0,6).map(o=>'<tr><td dir="ltr">'+escValue(o.id||"—")+'</td><td>'+escValue(o.customer||"زبون")+'</td><td><span class="recent-status">'+escValue(o.status||"بانتظار الموافقة")+'</span></td><td>'+formatMoney(o.total)+'</td></tr>').join("")||'<tr><td colspan="4" class="dashboard-empty">لا توجد طلبات حتى الآن</td></tr>';
}
if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",renderDashboard,{once:true});else renderDashboard();
window.addEventListener("storage",event=>{if(event.key==="bakery_store_syp_v1")renderDashboard()});
})();