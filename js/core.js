const $=s=>document.querySelector(s);
const STORE_KEY="bakery_store_syp_v1";
const defaults={
 products:[],
 cart:{},orders:[],directSales:[],settings:{shop_name:"مخبوزات الشام",delivery_fee:5000,sham_cash:""}
};
let state=loadState(),category="الكل",activeTab="overview";
function loadState(){try{const saved=JSON.parse(localStorage.getItem(STORE_KEY)||"{}");if(!saved||typeof saved!=="object"||Array.isArray(saved))return structuredClone(defaults);return {...structuredClone(defaults),...saved,products:Array.isArray(saved.products)?saved.products:structuredClone(defaults.products),orders:Array.isArray(saved.orders)?saved.orders:[],directSales:Array.isArray(saved.directSales)?saved.directSales:[],cart:saved.cart&&typeof saved.cart==="object"&&!Array.isArray(saved.cart)?saved.cart:{},settings:{...defaults.settings,...(saved.settings&&typeof saved.settings==="object"&&!Array.isArray(saved.settings)?saved.settings:{})},rawMaterials:Array.isArray(saved.rawMaterials)?saved.rawMaterials:[],rawMaterialMovements:Array.isArray(saved.rawMaterialMovements)?saved.rawMaterialMovements:[],stockMovements:Array.isArray(saved.stockMovements)?saved.stockMovements:[]}}catch(error){console.error("تعذر قراءة بيانات المتجر المحفوظة:",error);return structuredClone(defaults)}}
function save(){localStorage.setItem(STORE_KEY,JSON.stringify(state))}
const esc=s=>String(s??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const money=n=>new Intl.NumberFormat("ar-SY",{maximumFractionDigits:0}).format(Math.round(Number(n)||0))+" ل.س";
function lines(){return Object.entries(state.cart).map(([id,q])=>({p:state.products.find(p=>p.id===id),q:Math.max(0,Math.floor(q))})).filter(x=>x.p&&x.q>0)}
function subtotal(){return lines().reduce((a,x)=>a+Math.round(Number(x.p.price)||0)*x.q,0)}
function delivery(){return $("#fulfillment").value==="delivery"?Math.round(Number(state.settings.delivery_fee)||0):0}
