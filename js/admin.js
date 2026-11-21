function renderAdmin(){
 $("#adminProducts").innerHTML=state.products.map(p=>'<div class="admin-item"><span>'+esc(p.name)+' · '+money(p.price)+' · '+esc(p.category)+'</span><div class="admin-item-actions"><button type="button" data-edit="'+esc(p.id)+'">تعديل</button><button type="button" class="danger-text" data-delete="'+esc(p.id)+'">حذف</button></div></div>').join("")||"لم تتم إضافة منتجات.";
 $("#adminOrders").innerHTML=state.orders.map(o=>'<div class="admin-item"><span>#'+esc(o.id)+' · '+esc(o.customer)+' · '+money(o.total)+'</span><b>'+esc(o.status)+'</b></div>').join("")||"لا توجد طلبات بعد.";
 $("#statProducts").textContent=state.products.length;$("#statOrders").textContent=state.orders.length;
 $("#statSales").textContent=money(state.orders.reduce((a,o)=>a+o.total,0));
}
function tab(name){activeTab=name;document.querySelectorAll(".tab").forEach(x=>x.classList.toggle("hidden",x.id!==name));document.querySelectorAll(".admin-nav button").forEach(x=>x.classList.toggle("active",x.dataset.tab===name))}
function openAdmin(){const ok=confirm("هذه لوحة إدارة تجريبية على هذا المتصفح فقط. لا تستخدمها لاستقبال طلبات حقيقية قبل ربط قاعدة البيانات وتأمين الدخول. هل تريد المتابعة؟");if(!ok)return;$("#storeView").classList.add("hidden");$("#adminView").classList.remove("hidden");$("#settingsForm").elements.shopName.value=state.settings.shop_name;$("#settingsForm").elements.delivery.value=state.settings.delivery_fee;$("#settingsForm").elements.sham.value=state.settings.sham_cash;renderAdmin();tab(activeTab);window.scrollTo(0,0)}
$("#adminBtn").onclick=openAdmin;$("#backStore").onclick=()=>{$("#adminView").classList.add("hidden");$("#storeView").classList.remove("hidden");window.scrollTo(0,0)};
$(".admin-nav").addEventListener("click",e=>{const b=e.target.closest("[data-tab]");if(b){tab(b.dataset.tab);renderAdmin()}});
let editingProductId=null;
const productForm=$("#productForm"),categorySelect=$("#categorySelect"),customCategoryField=$("#customCategoryField"),customCategoryInput=$("#customCategory");
function syncCustomCategory(){const custom=categorySelect.value==="__custom__";customCategoryField.classList.toggle("hidden",!custom);customCategoryInput.required=custom;if(!custom)customCategoryInput.value=""}
function resetProductForm(){editingProductId=null;productForm.reset();categorySelect.value="مناقيش وفطائر";syncCustomCategory();$("#productSubmit").textContent="إضافة المنتج";$("#cancelProductEdit").classList.add("hidden")}
categorySelect.addEventListener("change",syncCustomCategory);
$("#cancelProductEdit").addEventListener("click",resetProductForm);
productForm.onsubmit=e=>{
 e.preventDefault();
 const f=new FormData(productForm),file=f.get("image");
 const category=categorySelect.value==="__custom__"?String(f.get("customCategory")||"").trim():categorySelect.value;
 if(!category){alert("يرجى اختيار التصنيف أو كتابة اسم تصنيف جديد.");return}
 const existing=editingProductId?state.products.find(p=>p.id===editingProductId):null;
 if(editingProductId&&!existing){alert("تعذر العثور على المنتج. حدّث القائمة وحاول مجدداً.");resetProductForm();return}
 if(editingProductId&&!confirm("هل تريد حفظ التعديلات على هذا المنتج؟"))return;
 const apply=image=>{
  const data={name:String(f.get("name")).trim(),category,price:Number(f.get("price")),description:String(f.get("description")||""),image:image||(existing?existing.image:"assets/croissant.svg")};
  if(existing)Object.assign(existing,data);else state.products.unshift({id:"p"+Date.now(),...data});
  save();resetProductForm();render();renderAdmin();alert(existing?"تم تعديل المنتج وحفظ التغييرات محلياً.":"تمت إضافة المنتج وحفظه محلياً.");
 };
 if(file&&file.size){
  if(file.size>1200000){alert("اختر صورة أصغر من 1.2MB لتناسب التخزين المحلي التجريبي.");return}
  const reader=new FileReader();reader.onload=()=>apply(reader.result);reader.onerror=()=>alert("تعذرت قراءة الصورة. حاول اختيارها مجدداً.");reader.readAsDataURL(file);
 }else apply("");
};
$("#adminProducts").addEventListener("click",e=>{
 const edit=e.target.closest("[data-edit]");
 if(edit){
  const p=state.products.find(x=>x.id===edit.dataset.edit);if(!p)return;
  resetProductForm();editingProductId=p.id;
  productForm.elements.name.value=p.name;productForm.elements.price.value=p.price;productForm.elements.description.value=p.description||"";
  const known=[...categorySelect.options].some(o=>o.value===p.category);
  if(known){categorySelect.value=p.category;syncCustomCategory()}
  else{categorySelect.value="__custom__";syncCustomCategory();customCategoryInput.value=p.category}
  $("#productSubmit").textContent="حفظ التعديلات";$("#cancelProductEdit").classList.remove("hidden");
  productForm.scrollIntoView({behavior:"smooth",block:"start"});return;
 }
 const del=e.target.closest("[data-delete]");if(!del)return;
 const p=state.products.find(x=>x.id===del.dataset.delete);if(!p)return;
 if(confirm('هل أنت متأكد من حذف المنتج "'+p.name+'"؟ لا يمكن التراجع عن هذه الخطوة.')){
  state.products=state.products.filter(x=>x.id!==p.id);delete state.cart[p.id];save();render();renderAdmin();
  if(editingProductId===p.id)resetProductForm();
 }
});
$("#deleteAllProducts").addEventListener("click",()=>{
 if(!state.products.length){alert("لا توجد منتجات لحذفها.");return}
 if(confirm("تحذير: هل أنت متأكد من حذف جميع المنتجات وعددها "+state.products.length+"؟ سيتم إفراغ السلة من هذه المنتجات ولا يمكن التراجع عن الحذف.")){
  const removedIds=new Set(state.products.map(p=>p.id));state.products=[];for(const id of removedIds)delete state.cart[id];
  save();resetProductForm();render();renderAdmin();alert("تم حذف جميع المنتجات.");
 }
});
$("#settingsForm").onsubmit=e=>{e.preventDefault();const f=new FormData(e.target);state.settings={shop_name:String(f.get("shopName")||"مخبوزات الشام"),delivery_fee:Math.max(0,Number(f.get("delivery"))||0),sham_cash:String(f.get("sham")||"")};save();render();syncPaymentField();alert("تم حفظ الإعدادات على هذا الجهاز.")};
