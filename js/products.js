function render(){
 $("#shopName").textContent=state.settings.shop_name;
 const categories=["الكل",...new Set(["مناقيش وفطائر","كرواسون","بيتزا","حلويات","أخرى",...state.products.map(p=>String(p.category||"").trim()).filter(Boolean)])];
 $("#filters").innerHTML=categories.map(c=>'<button class="filter '+(category===c?"active":"")+'" data-cat="'+esc(c)+'">'+esc(c)+'</button>').join("");
 if(!categories.includes(category))category="الكل";
 const products=state.products.filter(p=>category==="الكل"||p.category===category);
 $("#products").innerHTML=products.length?products.map(p=>'<article class="product"><img src="'+esc(p.image||"assets/croissant.svg")+'" alt="'+esc(p.name)+'" loading="lazy"><div class="product-info"><h3>'+esc(p.name)+'</h3><p>'+esc(p.description)+'</p><div class="product-bottom"><b>'+money(p.price)+'</b><button class="add" data-add="'+esc(p.id)+'">أضف للسلة +</button></div></div></article>').join(""):'<div class="empty">لا توجد منتجات في هذا التصنيف حالياً.</div>';
 const count=lines().reduce((a,x)=>a+x.q,0);$("#cartCount").textContent=count;$("#mobileNavBadge").textContent=count;$("#mobileCartCount").textContent=count+" منتجات";$("#mobileCartTotal").textContent=money(subtotal());$("#mobileCartBar").classList.toggle("hidden",!count);renderCart();
}
$("#filters").addEventListener("click",e=>{const b=e.target.closest("[data-cat]");if(b){category=b.dataset.cat;render()}});
$("#products").addEventListener("click",e=>{const b=e.target.closest("[data-add]");if(!b)return;state.cart[b.dataset.add]=(state.cart[b.dataset.add]||0)+1;save();render()});
