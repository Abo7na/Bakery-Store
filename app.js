const $=s=>document.querySelector(s);
const STORE_KEY="bakery_store_syp_v1";
const defaults={
 products:[
  {id:"p1",name:"كرواسون بالزبدة",category:"كرواسون",price:35000,description:"طبقات هشة ومخبوزة يومياً.",image:"assets/croissant.svg"},
  {id:"p2",name:"منقوشة الزعتر",category:"مناقيش وفطائر",price:20000,description:"زعتر بلدي وزيت زيتون.",image:"assets/manoushe.svg"},
  {id:"p3",name:"فطيرة الجبنة",category:"مناقيش وفطائر",price:28000,description:"جبنة ذائبة وعجينة ذهبية.",image:"assets/cheese.svg"},
  {id:"p4",name:"بيتزا صغيرة",category:"بيتزا",price:40000,description:"صلصة طماطم وجبنة ومكونات طازجة.",image:"assets/pizza.svg"}
 ],
 cart:{},orders:[],settings:{shop_name:"مخبوزات الشام",delivery_fee:5000,sham_cash:""}
};
let state=loadState(),category="الكل",activeTab="overview";
function loadState(){try{return {...structuredClone(defaults),...JSON.parse(localStorage.getItem(STORE_KEY)||"{}")}}catch{return structuredClone(defaults)}}
function save(){localStorage.setItem(STORE_KEY,JSON.stringify(state))}
const esc=s=>String(s??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const money=n=>new Intl.NumberFormat("ar-SY",{maximumFractionDigits:0}).format(Math.round(Number(n)||0))+" ل.س";
function lines(){return Object.entries(state.cart).map(([id,q])=>({p:state.products.find(p=>p.id===id),q:Math.max(0,Math.floor(q))})).filter(x=>x.p&&x.q>0)}
function subtotal(){return lines().reduce((a,x)=>a+cents(x.p.price)*x.q,0)}
function delivery(){return $("#fulfillment").value==="delivery"?Math.round(Number(state.settings.delivery_fee)||0):0}
function render(){
 $("#shopName").textContent=state.settings.shop_name;
 $("#filters").innerHTML=["الكل","مناقيش وفطائر","كرواسون","بيتزا","حلويات","أخرى"].map(c=>'<button class="filter '+(category===c?"active":"")+'" data-cat="'+esc(c)+'">'+esc(c)+'</button>').join("");
 const products=state.products.filter(p=>category==="الكل"||p.category===category);
 $("#products").innerHTML=products.length?products.map(p=>'<article class="product"><img src="'+esc(p.image||"assets/croissant.svg")+'" alt="'+esc(p.name)+'" loading="lazy"><div class="product-info"><h3>'+esc(p.name)+'</h3><p>'+esc(p.description)+'</p><div class="product-bottom"><b>'+money(p.price)+'</b><button class="add" data-add="'+esc(p.id)+'">أضف للسلة +</button></div></div></article>').join(""):'<div class="empty">لا توجد منتجات في هذا التصنيف حالياً.</div>';
 $("#cartCount").textContent=lines().reduce((a,x)=>a+x.q,0);renderCart();
}
function renderCart(){
 const xs=lines(),sum=subtotal();
 $("#cartItems").innerHTML=xs.length?xs.map(x=>'<div class="cart-row"><span><b>'+esc(x.p.name)+'</b><br><small>'+money(x.p.price)+' للقطعة</small></span><span class="qty"><button data-qty="'+esc(x.p.id)+'" data-delta="-1">−</button> '+x.q+' <button data-qty="'+esc(x.p.id)+'" data-delta="1">+</button></span><b>'+money(x.p.price*x.q)+'</b></div>').join(""):'السلة فارغة حالياً.';
 $("#cartTotal").innerHTML='المجموع الفرعي: '+money(sum)+'<br><small>التوصيل يُحسب عند اختيار طريقة الاستلام.</small>';
 $("#checkoutBtn").disabled=!xs.length;
}
function renderAdmin(){
 $("#adminProducts").innerHTML=state.products.map(p=>'<div class="admin-item"><span>'+esc(p.name)+' · '+money(p.price)+'</span><button data-delete="'+esc(p.id)+'">حذف</button></div>').join("")||"لم تتم إضافة منتجات.";
 $("#adminOrders").innerHTML=state.orders.map(o=>'<div class="admin-item"><span>#'+esc(o.id)+' · '+esc(o.customer)+' · '+money(o.total)+'</span><b>'+esc(o.status)+'</b></div>').join("")||"لا توجد طلبات بعد.";
 $("#statProducts").textContent=state.products.length;$("#statOrders").textContent=state.orders.length;
 $("#statSales").textContent=money(state.orders.reduce((a,o)=>a+o.total,0));
}
function tab(name){activeTab=name;document.querySelectorAll(".tab").forEach(x=>x.classList.toggle("hidden",x.id!==name));document.querySelectorAll(".admin-nav button").forEach(x=>x.classList.toggle("active",x.dataset.tab===name))}
function openAdmin(){const ok=confirm("هذه لوحة إدارة تجريبية على هذا المتصفح فقط. لا تستخدمها لاستقبال طلبات حقيقية قبل ربط قاعدة البيانات وتأمين الدخول. هل تريد المتابعة؟");if(!ok)return;$("#storeView").classList.add("hidden");$("#adminView").classList.remove("hidden");$("#settingsForm").elements.shopName.value=state.settings.shop_name;$("#settingsForm").elements.delivery.value=state.settings.delivery_fee;$("#settingsForm").elements.sham.value=state.settings.sham_cash;renderAdmin();tab(activeTab);window.scrollTo(0,0)}
$("#filters").addEventListener("click",e=>{const b=e.target.closest("[data-cat]");if(b){category=b.dataset.cat;render()}});
$("#products").addEventListener("click",e=>{const b=e.target.closest("[data-add]");if(!b)return;state.cart[b.dataset.add]=(state.cart[b.dataset.add]||0)+1;save();render()});
$("#cartBtn").onclick=()=>$("#cartOverlay").classList.remove("hidden");$("#closeCart").onclick=()=>$("#cartOverlay").classList.add("hidden");
$("#cartOverlay").addEventListener("click",e=>{if(e.target.id==="cartOverlay")$("#cartOverlay").classList.add("hidden")});
$("#cartItems").addEventListener("click",e=>{const b=e.target.closest("[data-qty]");if(!b)return;const id=b.dataset.qty;state.cart[id]=Math.max(0,(state.cart[id]||0)+Number(b.dataset.delta));if(!state.cart[id])delete state.cart[id];save();render()});
$("#checkoutBtn").onclick=()=>{$("#checkout").classList.toggle("hidden");$("#checkout").scrollIntoView({behavior:"smooth",block:"nearest"})};
$("#fulfillment").onchange=e=>{$("#addressLabel").classList.toggle("hidden",e.target.value!=="delivery");const fee=e.target.value==="delivery"?cents(state.settings.delivery_fee):0;$("#cartTotal").innerHTML='المجموع الفرعي: '+money(subtotal())+'<br>رسوم التوصيل: '+money(fee)+'<br><b>الإجمالي: '+money(subtotal()+fee)+'</b>'};
$("#orderForm").onsubmit=e=>{e.preventDefault();const f=new FormData(e.target),xs=lines();if(!xs.length)return;if(f.get("fulfillment")==="delivery"&&!String(f.get("address")||"").trim()){alert("يرجى إدخال عنوان التوصيل.");return}const sum=subtotal(),fee=f.get("fulfillment")==="delivery"?cents(state.settings.delivery_fee):0;const order={id:String(Date.now()).slice(-8),customer:f.get("customer"),phone:f.get("phone"),fulfillment:f.get("fulfillment"),address:f.get("address"),time:f.get("time"),payment:f.get("payment"),transaction:f.get("transaction"),notes:f.get("notes"),items:xs.map(x=>({name:x.p.name,price:Math.round(Number(x.p.price)||0),qty:x.q})),subtotal:sum,delivery:fee,total:sum+fee,status:"طلب تجريبي"};state.orders.unshift(order);state.cart={};save();e.target.reset();$("#addressLabel").classList.add("hidden");$("#checkout").classList.add("hidden");$("#cartOverlay").classList.add("hidden");render();alert("تم حفظ الطلب التجريبي على هذا الجهاز. رقم الطلب: "+order.id+"\nسيتم ربط الطلبات بقاعدة بيانات مشتركة لاحقاً.")};
$("#adminBtn").onclick=openAdmin;$("#backStore").onclick=()=>{$("#adminView").classList.add("hidden");$("#storeView").classList.remove("hidden");window.scrollTo(0,0)};
$(".admin-nav").addEventListener("click",e=>{const b=e.target.closest("[data-tab]");if(b){tab(b.dataset.tab);renderAdmin()}});
$("#productForm").onsubmit=e=>{e.preventDefault();const f=new FormData(e.target),file=f.get("image");const add=image=>{state.products.unshift({id:"p"+Date.now(),name:String(f.get("name")).trim(),category:f.get("category"),price:Number(f.get("price")),description:String(f.get("description")||""),image:image||"assets/croissant.svg"});save();e.target.reset();render();renderAdmin();alert("تمت إضافة المنتج وحفظه محلياً.")};if(file&&file.size){if(file.size>1200000){alert("اختر صورة أصغر من 1.2MB لتناسب التخزين المحلي التجريبي.");return}const reader=new FileReader();reader.onload=()=>add(reader.result);reader.readAsDataURL(file)}else add("")};
$("#adminProducts").addEventListener("click",e=>{const b=e.target.closest("[data-delete]");if(!b)return;if(confirm("حذف المنتج؟")){state.products=state.products.filter(p=>p.id!==b.dataset.delete);delete state.cart[b.dataset.delete];save();render();renderAdmin()}});
$("#settingsForm").onsubmit=e=>{e.preventDefault();const f=new FormData(e.target);state.settings={shop_name:String(f.get("shopName")||"مخبوزات الشام"),delivery_fee:Math.max(0,Number(f.get("delivery"))||0),sham_cash:String(f.get("sham")||"")};save();render();alert("تم حفظ الإعدادات على هذا الجهاز.")};
$("#langBtn").onclick=()=>alert("ستتم إضافة الواجهة الإنجليزية في مرحلة لاحقة.");
render();
