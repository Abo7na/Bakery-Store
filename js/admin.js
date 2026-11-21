function renderAdmin(){
 $("#adminProducts").innerHTML=state.products.map(p=>'<div class="admin-item"><span>'+esc(p.name)+' · '+money(p.price)+' · '+esc(p.category)+'</span><div class="admin-item-actions"><button type="button" data-edit="'+esc(p.id)+'">تعديل</button><button type="button" class="danger-text" data-delete="'+esc(p.id)+'">حذف</button></div></div>').join("")||"لم تتم إضافة منتجات.";
 renderOrders();
 $("#statProducts").textContent=state.products.length;$("#statOrders").textContent=state.orders.length;
 $("#statSales").textContent=money(state.orders.filter(o=>["قيد التنفيذ","جاهز للاستلام","قيد التوصيل","تم التسليم","مقبول"].includes(o.status)).reduce((a,o)=>a+Number(o.total||0),0));
}
let orderStage="all",orderAge="all",orderSearch="";
function orderStageFor(o){if(o.status==="بانتظار موافقة الإدارة"||o.status==="طلب تجريبي")return "pending";if(o.status==="مرفوض")return "finished";if(o.status==="تم التسليم")return "delivered";if(o.status==="قيد التوصيل")return "delivery";if(o.status==="جاهز للاستلام")return "ready";if(["قيد التنفيذ","مقبول"].includes(o.status))return "progress";return "pending"}
function renderOrders(){
 const root=$("#adminOrders");if(!root)return;
 const sorted=[...state.orders].sort((a,b)=>new Date(b.createdAt||0)-new Date(a.createdAt||0));
 const now=Date.now(),day=86400000;
 const filtered=sorted.filter(o=>{
  const stage=orderStageFor(o),created=new Date(o.createdAt||0).getTime();
  const stageOk=orderStage==="all"||(orderStage==="finished"?["finished","delivered"].includes(stage):stage===orderStage);
  const ageOk=orderAge==="all"||(orderAge==="new"&&now-created<=day)||(orderAge==="old"&&now-created>day)||(orderAge==="finished"&&["finished","delivered"].includes(stage));
  const q=orderSearch.trim().toLocaleLowerCase();
  const searchOk=!q||[o.id,o.customer,o.phone].some(v=>String(v||"").toLocaleLowerCase().includes(q));
  return stageOk&&ageOk&&searchOk
 });
 root.innerHTML='<div class="orders-toolbar"><input id="orderSearch" type="search" placeholder="ابحث برقم الطلب أو اسم الزبون أو الهاتف" value="'+esc(orderSearch)+'"><div class="order-filter-row"><select id="orderStageFilter"><option value="all">كل الأقسام</option><option value="pending">بانتظار الموافقة</option><option value="progress">قيد التنفيذ</option><option value="ready">جاهزة للاستلام</option><option value="delivery">قيد التوصيل</option><option value="delivered">تم التسليم</option><option value="finished">الطلبات المنتهية</option></select><select id="orderAgeFilter"><option value="all">كل الفترات</option><option value="new">الطلبات الحديثة (آخر 24 ساعة)</option><option value="old">الطلبات القديمة (أكثر من 24 ساعة)</option><option value="finished">المنتهية</option></select></div></div><div class="orders-count">عرض '+filtered.length+' من '+state.orders.length+' طلب — الأحدث أولاً</div>'+ (filtered.map(o=>{
  const stage=orderStageFor(o),created=o.createdAt?new Date(o.createdAt).toLocaleString("ar-SY"):"غير متوفر";
  const items=(o.items||[]).map(i=>'<li>'+esc(i.name)+' × '+i.qty+' — '+money(i.price*i.qty)+'</li>').join("");
  const req=o.deferred&&o.requestedTime?new Date(o.requestedTime).toLocaleString("ar-SY"):"طلب فوري";
  const mins=Number(o.preparationMinutes)||0;
  let actions="";
  if(stage==="pending")actions='<div class="order-actions"><div class="prep-control"><b>مدة التجهيز من وقت استلام الطلب</b><div class="prep-buttons"><button type="button" data-add-minutes="5" data-order="'+esc(o.id)+'">+5 دقائق</button><button type="button" data-add-minutes="10" data-order="'+esc(o.id)+'">+10 دقائق</button><button type="button" data-add-minutes="15" data-order="'+esc(o.id)+'">+15 دقيقة</button></div><p>المدة المضافة: <strong>'+mins+' دقيقة</strong></p><p>موعد التجهيز المتوقع: <strong>'+(mins?esc(new Date(new Date(o.createdAt).getTime()+mins*60000).toLocaleString("ar-SY")):"لم يحدد")+'</strong></p></div><button type="button" class="primary" data-accept="'+esc(o.id)+'">قبول الطلب</button><label>سبب الرفض<select data-reason="'+esc(o.id)+'"><option value="">اختر سبب الرفض</option><option value="المحل مغلق">المحل مغلق</option><option value="عدم توفر المنتج">عدم توفر المنتج</option></select></label><button type="button" class="danger" data-reject="'+esc(o.id)+'">رفض الطلب</button></div>';
  else if(stage==="progress")actions='<div class="order-actions"><p>موعد التجهيز المتوقع: <b>'+esc(o.estimatedReadyAt?new Date(o.estimatedReadyAt).toLocaleString("ar-SY"):"غير محدد")+'</b></p><button type="button" class="primary" data-ready="'+esc(o.id)+'">تأكيد أن الطلب جاهز</button></div>';
  else if(stage==="ready")actions='<div class="order-actions"><p>الطلب جاهز للاستلام من المخبز.</p><button type="button" class="primary" data-delivered="'+esc(o.id)+'">تأكيد تسليم الطلب</button></div>';
  else if(stage==="delivery")actions='<div class="order-actions"><p>الطلب خرج للتوصيل.</p><button type="button" class="primary" data-delivered="'+esc(o.id)+'">تأكيد إتمام التوصيل</button></div>';
  const result=o.status==="مرفوض"?'<p class="order-result">سبب الرفض: '+esc(o.rejectionReason||"غير محدد")+'</p>':o.status==="تم التسليم"?'<p class="order-result">تم التسليم في: '+esc(o.deliveredAt?new Date(o.deliveredAt).toLocaleString("ar-SY"):"غير محدد")+'</p>':o.status==="قيد التوصيل"?'<p class="order-result">الطلب في طريقه إلى الزبون.</p>':o.status==="جاهز للاستلام"?'<p class="order-result">الطلب جاهز للاستلام من المخبز.</p>':"";
  return '<details class="order-accordion"><summary><span><b>'+esc(o.id)+'</b><small>'+esc(o.customer||"زبون")+' · '+esc(o.phone||"")+'</small></span><span class="order-summary-side"><b>'+money(o.total)+'</b><em>'+esc(o.status||"بانتظار موافقة الإدارة")+'</em><small>'+esc(created)+'</small></span></summary><div class="order-card-body"><p><b>وقت استلام الطلب:</b> '+esc(created)+'</p><p><b>العميل:</b> '+esc(o.customer||"لم يذكر اسمه")+'</p><p><b>الهاتف:</b> '+esc(o.phone)+'</p><p><b>طريقة الاستلام:</b> '+(o.fulfillment==="delivery"?"توصيل":"استلام من المخبز")+'</p><p><b>العنوان:</b> '+esc(o.address)+'</p><p><b>موعد الزبون:</b> '+esc(req)+'</p><p><b>الدفع:</b> '+(o.payment==="sham"?"شام كاش":"نقداً / دفع يدوي")+'</p>'+(o.transaction?'<p><b>رقم عملية شام كاش:</b> '+esc(o.transaction)+'</p>':"")+(o.notes?'<p><b>ملاحظات:</b> '+esc(o.notes)+'</p>':"")+'<b>المنتجات:</b><ul>'+items+'</ul><p>المجموع الفرعي: '+money(o.subtotal)+'</p><p>التوصيل: '+money(o.delivery)+'</p><p class="order-total">الإجمالي: '+money(o.total)+'</p>'+result+actions+'</div></details>'
 }).join("")||'<div class="empty">لا توجد طلبات تطابق البحث أو الفلتر.</div>');
 $("#orderStageFilter").value=orderStage;$("#orderAgeFilter").value=orderAge;
 $("#orderSearch").addEventListener("input",e=>{orderSearch=e.target.value;const pos=e.target.selectionStart;renderOrders();const n=$("#orderSearch");n.focus();n.setSelectionRange(pos,pos)});
 $("#orderStageFilter").addEventListener("change",e=>{orderStage=e.target.value;renderOrders()});
 $("#orderAgeFilter").addEventListener("change",e=>{orderAge=e.target.value;renderOrders()});
}
function tab(name){activeTab=name;document.querySelectorAll(".tab").forEach(x=>x.classList.toggle("hidden",x.id!==name));document.querySelectorAll(".admin-nav button").forEach(x=>x.classList.toggle("active",x.dataset.tab===name))}
function openAdmin(){const ok=confirm("هذه لوحة إدارة تجريبية على هذا المتصفح فقط. لا تستخدمها لاستقبال طلبات حقيقية قبل ربط قاعدة البيانات وتأمين الدخول. هل تريد المتابعة؟");if(!ok)return;$("#storeView").classList.add("hidden");$("#adminView").classList.remove("hidden");$("#settingsForm").elements.shopName.value=state.settings.shop_name;$("#settingsForm").elements.delivery.value=state.settings.delivery_fee;$("#settingsForm").elements.sham.value=state.settings.sham_cash;renderAdmin();tab(activeTab);window.scrollTo(0,0)}
$("#adminBtn").onclick=openAdmin;$("#backStore").onclick=()=>{$("#adminView").classList.add("hidden");$("#storeView").classList.remove("hidden");window.scrollTo(0,0)};
$(".admin-nav").addEventListener("click",e=>{const b=e.target.closest("[data-tab]");if(b){tab(b.dataset.tab);renderAdmin()}});
$("#adminOrders").addEventListener("click",e=>{
 const add=e.target.closest("[data-add-minutes]");
 if(add){const o=state.orders.find(x=>x.id===add.dataset.order);if(!o||orderStageFor(o)!=="pending")return;o.preparationMinutes=(Number(o.preparationMinutes)||0)+Number(add.dataset.addMinutes);save();renderOrders();return}
 const accept=e.target.closest("[data-accept]");
 if(accept){const o=state.orders.find(x=>x.id===accept.dataset.accept);if(!o)return;const mins=Number(o.preparationMinutes)||0;if(!mins){alert("أضف مدة التجهيز قبل قبول الطلب.");return}if(!confirm("قبول الطلب "+o.id+"؟"))return;o.status="قيد التنفيذ";o.estimatedReadyAt=new Date(new Date(o.createdAt).getTime()+mins*60000).toISOString();o.customerNotice="تم قبول طلبك رقم "+o.id+". مدة التجهيز "+mins+" دقيقة.";save();renderAdmin();alert("تم قبول الطلب ونقله إلى قيد التنفيذ.");return}
 const reject=e.target.closest("[data-reject]");
 if(reject){const o=state.orders.find(x=>x.id===reject.dataset.reject);if(!o)return;const select=$("#adminOrders").querySelector('[data-reason="'+CSS.escape(o.id)+'"]');if(!select||!select.value){alert("اختر سبب الرفض.");return}if(!confirm("رفض الطلب بسبب "+select.value+"؟"))return;o.status="مرفوض";o.rejectionReason=select.value;o.customerNotice="نعتذر عن طلبك "+o.id+". السبب: "+select.value;save();renderAdmin();return}
 const ready=e.target.closest("[data-ready]");
 if(ready){const o=state.orders.find(x=>x.id===ready.dataset.ready);if(!o||o.status!=="قيد التنفيذ")return;if(!confirm("تأكيد أن الطلب أصبح جاهزاً؟"))return;o.status=o.fulfillment==="delivery"?"قيد التوصيل":"جاهز للاستلام";o.readyAt=new Date().toISOString();o.customerNotice=o.fulfillment==="delivery"?"طلبك جاهز وخرج للتوصيل.":"طلبك جاهز للاستلام من المخبز.";save();renderAdmin();return}
 const delivered=e.target.closest("[data-delivered]");
 if(delivered){const o=state.orders.find(x=>x.id===delivered.dataset.delivered);if(!o)return;if(!confirm("تأكيد تسليم الطلب "+o.id+"؟"))return;o.status="تم التسليم";o.deliveredAt=new Date().toISOString();o.customerNotice="تم تسليم طلبك. شكراً لزيارتك.";save();renderAdmin()}
});
let editingProductId=null;
const productForm=$("#productForm"),categorySelect=$("#categorySelect"),customCategoryField=$("#customCategoryField"),customCategoryInput=$("#customCategory");
function syncCustomCategory(){const custom=categorySelect.value==="__custom__";customCategoryField.classList.toggle("hidden",!custom);customCategoryInput.required=custom;if(!custom)customCategoryInput.value=""}
function resetProductForm(){editingProductId=null;productForm.reset();categorySelect.value="مناقيش وفطائر";syncCustomCategory();$("#productSubmit").textContent="إضافة المنتج";$("#cancelProductEdit").classList.add("hidden")}
categorySelect.addEventListener("change",syncCustomCategory);
$("#cancelProductEdit").addEventListener("click",resetProductForm);
productForm.onsubmit=e=>{
 e.preventDefault();const f=new FormData(productForm),file=f.get("image");
 const category=categorySelect.value==="__custom__"?String(f.get("customCategory")||"").trim():categorySelect.value;
 if(!category){alert("يرجى اختيار التصنيف أو كتابة اسم تصنيف جديد.");return}
 const existing=editingProductId?state.products.find(p=>p.id===editingProductId):null;
 if(editingProductId&&!existing){alert("تعذر العثور على المنتج. حدّث القائمة وحاول مجدداً.");resetProductForm();return}
 if(editingProductId&&!confirm("هل تريد حفظ التعديلات على هذا المنتج؟"))return;
 const apply=image=>{const data={name:String(f.get("name")).trim(),category,price:Number(f.get("price")),description:String(f.get("description")||""),image:image||(existing?existing.image:"assets/croissant.svg")};if(existing)Object.assign(existing,data);else state.products.unshift({id:"p"+Date.now(),...data});save();resetProductForm();render();renderAdmin();alert(existing?"تم تعديل المنتج وحفظ التغييرات محلياً.":"تمت إضافة المنتج وحفظه محلياً.")};
 if(file&&file.size){if(file.size>1200000){alert("اختر صورة أصغر من 1.2MB لتناسب التخزين المحلي التجريبي.");return}const reader=new FileReader();reader.onload=()=>apply(reader.result);reader.onerror=()=>alert("تعذرت قراءة الصورة. حاول اختيارها مجدداً.");reader.readAsDataURL(file)}else apply("");
};
$("#adminProducts").addEventListener("click",e=>{
 const edit=e.target.closest("[data-edit]");
 if(edit){const p=state.products.find(x=>x.id===edit.dataset.edit);if(!p)return;resetProductForm();editingProductId=p.id;productForm.elements.name.value=p.name;productForm.elements.price.value=p.price;productForm.elements.description.value=p.description||"";const known=[...categorySelect.options].some(o=>o.value===p.category);if(known){categorySelect.value=p.category;syncCustomCategory()}else{categorySelect.value="__custom__";syncCustomCategory();customCategoryInput.value=p.category}$("#productSubmit").textContent="حفظ التعديلات";$("#cancelProductEdit").classList.remove("hidden");productForm.scrollIntoView({behavior:"smooth",block:"start"});return}
 const del=e.target.closest("[data-delete]");if(!del)return;const p=state.products.find(x=>x.id===del.dataset.delete);if(!p)return;if(confirm('هل أنت متأكد من حذف المنتج "'+p.name+'"؟ لا يمكن التراجع عن هذه الخطوة.')){state.products=state.products.filter(x=>x.id!==p.id);delete state.cart[p.id];save();render();renderAdmin();if(editingProductId===p.id)resetProductForm()}
});
$("#deleteAllProducts").addEventListener("click",()=>{if(!state.products.length){alert("لا توجد منتجات لحذفها.");return}if(confirm("تحذير: هل أنت متأكد من حذف جميع المنتجات وعددها "+state.products.length+"؟ سيتم إفراغ السلة من هذه المنتجات ولا يمكن التراجع عن الحذف.")){const removedIds=new Set(state.products.map(p=>p.id));state.products=[];for(const id of removedIds)delete state.cart[id];save();resetProductForm();render();renderAdmin();alert("تم حذف جميع المنتجات.")}});
$("#settingsForm").onsubmit=e=>{e.preventDefault();const f=new FormData(e.target);state.settings={shop_name:String(f.get("shopName")||"مخبوزات الشام"),delivery_fee:Math.max(0,Number(f.get("delivery"))||0),sham_cash:String(f.get("sham")||"")};save();render();syncPaymentField();alert("تم حفظ الإعدادات على هذا الجهاز.")};