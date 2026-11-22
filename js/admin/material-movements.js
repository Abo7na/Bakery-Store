(()=>{"use strict";
const $=s=>document.querySelector(s),params=new URLSearchParams(location.search),materialId=params.get("materialId");
const materials=()=>Array.isArray(state.rawMaterials)?state.rawMaterials:[],movements=()=>Array.isArray(state.rawMaterialMovements)?state.rawMaterialMovements:[];
const fmt=n=>new Intl.NumberFormat("ar-SY",{maximumFractionDigits:3}).format(Number(n)||0),qty=m=>Math.max(0,Number(m.quantity)||0);
const material=materials().find(m=>String(m.id)===String(materialId));
let activeTab="all";
if(!materialId||(!material&&!movements().some(m=>String(m.materialId)===String(materialId)))){$("#materialMovementPage").innerHTML='<div class="inventory-empty">لم يتم العثور على المادة المطلوبة أو لا توجد حركات مرتبطة بها.</div>';}
else{
 const all=()=>movements().filter(m=>String(m.materialId||"")===String(materialId)).sort((a,b)=>String(b.createdAt||"").localeCompare(String(a.createdAt||"")));
 const unit=material?.unit||all()[0]?.unit||"",name=material?.name||all()[0]?.materialName||"مادة محذوفة";
 $("#materialMovementTitle").textContent="حركات "+name;
 const total=(items)=>items.reduce((v,m)=>v+(Number(m.quantity)||0),0);
 const adds=all().filter(m=>m.type==="add"),removes=all().filter(m=>m.type==="remove"),sets=all().filter(m=>m.type==="set");
 const stock=material?qty(material):Number(all()[0]?.after)||0,price=Number(material?.unitPrice)||0,currency=material?.priceCurrency==="USD"?"$":"ل.س";
 $("#materialMovementSummary").innerHTML='<div><span>الرصيد الحالي</span><b>'+fmt(stock)+' '+esc(unit)+'</b></div><div><span>قيمة المخزون الحالية</span><b>'+fmt(stock*price)+' '+currency+'</b></div><div><span>إجمالي التوريد</span><b class="plus">+'+fmt(total(adds))+' '+esc(unit)+'</b></div><div><span>إجمالي السحب</span><b class="minus">−'+fmt(total(removes))+' '+esc(unit)+'</b></div><div><span>عدد التسويات</span><b>'+sets.length+'</b></div><div><span>عدد الحركات</span><b>'+all().length+'</b></div>';
 function render(){const from=$("#materialReportFrom").value,to=$("#materialReportTo").value,q=$("#materialMovementSearch").value.trim().toLocaleLowerCase("ar");if(from&&to&&from>to){$("#materialReportCount").textContent="تحقق من التاريخ";$("#materialMovementRows").innerHTML='<div class="inventory-empty">تاريخ البداية يجب أن يسبق تاريخ النهاية.</div>';return}
 const labels={all:"السجل الكامل",add:"تقرير التوريدات",remove:"تقرير السحوبات",set:"تقرير التسويات"};
 const rows=all().filter(m=>(activeTab==="all"||m.type===activeTab)&&(!from||String(m.createdAt||"").slice(0,10)>=from)&&(!to||String(m.createdAt||"").slice(0,10)<=to)&&(!q||[m.reason,m.materialName,m.createdAt].some(v=>String(v||"").toLocaleLowerCase("ar").includes(q))));
 $("#materialReportHeading").textContent=labels[activeTab];$("#materialReportCount").textContent=rows.length+" سجل";
 $("#materialMovementRows").innerHTML=rows.length?rows.map(m=>{const type=m.type==="add"?"توريد":m.type==="remove"?"سحب":"تسوية",sign=m.type==="add"?"+":m.type==="remove"?"−":"↔",cls=m.type==="add"?"plus":m.type==="remove"?"minus":"",currency=m.purchaseCurrency==="USD"?"$":m.purchaseCurrency==="SYP"?"ل.س":"—",date=m.createdAt?new Date(m.createdAt).toLocaleString("ar-SY"):"—";return '<article class="inventory-material-report-card"><div class="inventory-material-report-head"><div><b>'+type+' · '+esc(m.reason||"بدون وصف")+'</b><small>'+esc(date)+'</small></div><strong class="'+cls+'">'+sign+fmt(m.quantity)+' '+esc(m.unit||unit)+'</strong></div><div class="inventory-material-report-metrics"><div><span>قبل الحركة</span><b>'+fmt(m.before)+' '+esc(m.unit||unit)+'</b></div><div><span>بعد الحركة</span><b>'+fmt(m.after)+' '+esc(m.unit||unit)+'</b></div>'+(m.type==="add"?'<div><span>إجمالي تكلفة التوريد</span><b>'+(m.purchaseTotal!=null?fmt(m.purchaseTotal)+" "+currency:"غير مسجلة")+'</b></div><div><span>تكلفة الوحدة</span><b>'+(m.purchaseUnitPrice!=null?fmt(m.purchaseUnitPrice)+" "+currency+" / "+esc(m.unit||unit):"غير مسجلة")+'</b></div>':"")+'</div></article>'}).join(""):'<div class="inventory-empty">لا توجد حركات تطابق الفلاتر المحددة.</div>';
 }
 document.querySelectorAll("[data-report-tab]").forEach(b=>b.addEventListener("click",()=>{activeTab=b.dataset.reportTab;document.querySelectorAll("[data-report-tab]").forEach(x=>x.classList.toggle("active",x===b));render()}));
 ["materialMovementSearch","materialReportFrom","materialReportTo"].forEach(id=>$("#"+id).addEventListener(id==="materialMovementSearch"?"input":"change",render));
 $("#resetMaterialReportFilters").addEventListener("click",()=>{$("#materialMovementSearch").value="";$("#materialReportFrom").value="";$("#materialReportTo").value="";render()});
 $("#backToInventoryMovements").addEventListener("click",()=>location.href="inventory.html#movements");
 render();
}
})();