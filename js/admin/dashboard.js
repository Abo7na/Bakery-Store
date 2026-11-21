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
const months=Array.from({length:6},(_,i)=>{const d=new Date();d.setDate(1);d.setMonth(d.getMonth()-(5-i));return d});
const values=months.map(d=>salesOrders.filter(o=>{const x=new Date(o.createdAt||0);return x.getFullYear()===d.getFullYear()&&x.getMonth()===d.getMonth()}).reduce((sum,o)=>sum+Number(o.total||0),0));
const max=Math.max(...values,1),points=values.map((v,i)=>({x:24+i*110,y:160-v/max*132}));
const chart=document.querySelector("#salesChart");if(chart)chart.innerHTML='<line x1="20" y1="160" x2="580" y2="160" stroke="#e7ded2"/><line x1="20" y1="94" x2="580" y2="94" stroke="#eee7de" stroke-dasharray="4 5"/><line x1="20" y1="28" x2="580" y2="28" stroke="#eee7de" stroke-dasharray="4 5"/><polyline points="'+points.map(p=>p.x+","+p.y).join(" ")+'" fill="none" stroke="#916447" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>'+points.map(p=>'<circle cx="'+p.x+'" cy="'+p.y+'" r="4.5" fill="#916447"/>').join("");
const labels=document.querySelector("#salesChartLabels");if(labels)labels.innerHTML=months.map(d=>'<span>'+d.toLocaleDateString("ar-SY",{month:"short"})+'</span>').join("");
const totals={};salesOrders.forEach(o=>(o.items||[]).forEach(item=>{const name=item.name||"منتج";totals[name]=(totals[name]||0)+Number(item.qty||0)}));
const best=Object.entries(totals).sort((a,b)=>b[1]-a[1]).slice(0,5),top=document.querySelector("#topProducts");if(top)top.innerHTML=best.length?best.map(([name,count,i])=>'<div class="top-product-row"><span class="top-product-rank">'+(i+1)+'</span><b>'+escValue(name)+'</b><strong>'+count+'</strong></div>').join(""):'<div class="dashboard-empty">لا توجد مبيعات مسجلة بعد</div>';
const recent=document.querySelector("#recentOrders");if(recent)recent.innerHTML=[...orders].sort((a,b)=>new Date(b.createdAt||0)-new Date(a.createdAt||0)).slice(0,6).map(o=>'<tr><td dir="ltr">'+escValue(o.id||"—")+'</td><td>'+escValue(o.customer||"زبون")+'</td><td><span class="recent-status">'+escValue(o.status||"بانتظار الموافقة")+'</span></td><td>'+formatMoney(o.total)+'</td></tr>').join("")||'<tr><td colspan="4" class="dashboard-empty">لا توجد طلبات حتى الآن</td></tr>';
}
if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",renderDashboard,{once:true});else renderDashboard();
window.addEventListener("storage",event=>{if(event.key==="bakery_store_syp_v1")renderDashboard()});
})();