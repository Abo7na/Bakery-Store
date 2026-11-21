function renderCart(){
 const xs=lines(),sum=subtotal();
 $("#cartItems").innerHTML=xs.length?xs.map(x=>'<div class="cart-row"><span><b>'+esc(x.p.name)+'</b><br><small>'+money(x.p.price)+' للقطعة</small></span><span class="qty"><button data-qty="'+esc(x.p.id)+'" data-delta="-1">−</button> '+x.q+' <button data-qty="'+esc(x.p.id)+'" data-delta="1">+</button></span><b>'+money(x.p.price*x.q)+'</b></div>').join(""):'السلة فارغة حالياً.';
 $("#cartTotal").innerHTML='المجموع الفرعي: '+money(sum)+'<br><small>التوصيل يُحسب عند اختيار طريقة الاستلام.</small>';
 $("#checkoutBtn").disabled=!xs.length;renderCheckoutSummary();
}
function renderCheckoutSummary(){const fee=$("#fulfillment").value==="delivery"?Math.round(Number(state.settings.delivery_fee)||0):0;$("#checkoutSummary").innerHTML="<div><span>المجموع الفرعي</span><b>"+money(subtotal())+"</b></div><div><span>التوصيل</span><b>"+money(fee)+"</b></div><div class=\"summary-total\"><span>الإجمالي</span><b>"+money(subtotal()+fee)+"</b></div>"}
function setCheckoutMode(enabled){$("#cartOverlay .drawer").classList.toggle("checkout-mode",enabled);$("#cartOverlay .drawer-head h2").textContent=enabled?"إتمام الطلب":"سلة مشترياتك";$("#cartOverlay .drawer-subtitle").textContent=enabled?"خطوتان بسيطتان لإكمال طلبك":"راجع اختياراتك قبل تأكيد الطلب";$("#continueShopping").classList.toggle("hidden",enabled);$("#cartItems").classList.toggle("hidden",enabled);$("#drawerFoot").classList.toggle("hidden",enabled);$("#checkout").classList.toggle("hidden",!enabled);if(enabled){$("#checkout").scrollTop=0;renderCheckoutSummary()}}
function openCart(){$("#cartOverlay").classList.remove("hidden")}
$("#cartBtn").onclick=openCart;$("#mobileCartOpen").onclick=openCart;$("#mobileNavCart").onclick=openCart;$("#closeCart").onclick=()=>$("#cartOverlay").classList.add("hidden");
