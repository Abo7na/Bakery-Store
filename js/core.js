const $=s=>document.querySelector(s);
const STORE_KEY="bakery_store_syp_v1";
const defaults={
 products:[
  {id:"p1",name:"كرواسون بالزبدة",category:"كرواسون",price:35000,description:"طبقات هشة ومخبوزة يومياً.",image:"assets/croissant.svg"},
  {id:"p2",name:"منقوشة الزعتر",category:"مناقيش وفطائر",price:20000,description:"زعتر بلدي وزيت زيتون.",image:"assets/manoushe.svg"},
  {id:"p3",name:"فطيرة الجبنة",category:"مناقيش وفطائر",price:28000,description:"جبنة ذائبة وعجينة ذهبية.",image:"assets/cheese.svg"},
  {id:"p4",name:"بيتزا صغيرة",category:"بيتزا",price:40000,description:"صلصة طماطم وجبنة ومكونات طازجة.",image:"assets/pizza.svg"}
 ],
 cart:{},orders:[],directSales:[],settings:{shop_name:"مخبوزات الشام",delivery_fee:5000,sham_cash:""}
};
let state=loadState(),category="الكل",activeTab="overview";
function loadState(){try{return {...structuredClone(defaults),...JSON.parse(localStorage.getItem(STORE_KEY)||"{}")}}catch{return structuredClone(defaults)}}
function save(){localStorage.setItem(STORE_KEY,JSON.stringify(state))}
const esc=s=>String(s??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const money=n=>new Intl.NumberFormat("ar-SY",{maximumFractionDigits:0}).format(Math.round(Number(n)||0))+" ل.س";
function lines(){return Object.entries(state.cart).map(([id,q])=>({p:state.products.find(p=>p.id===id),q:Math.max(0,Math.floor(q))})).filter(x=>x.p&&x.q>0)}
function subtotal(){return lines().reduce((a,x)=>a+Math.round(Number(x.p.price)||0)*x.q,0)}
function delivery(){return $("#fulfillment").value==="delivery"?Math.round(Number(state.settings.delivery_fee)||0):0}
