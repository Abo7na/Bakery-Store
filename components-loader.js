(async function(){
 const parts=[["siteHeader","components/header.html"],["storefront","components/storefront.html"],["adminPanel","components/admin.html"],["cartPanel","components/cart.html"],["mobileControls","components/mobile.html"],["siteFooter","components/footer.html"]];
 try{
  const loaded=await Promise.all(parts.map(async([id,url])=>{const response=await fetch(url);if(!response.ok)throw new Error("Failed to load "+url);return [id,await response.text()]}));
  for(const [id,html] of loaded)document.getElementById(id).innerHTML=html;
  for(const src of ["js/core.js","js/products.js","js/cart.js","js/checkout.js","js/admin.js","js/app.js"]){
   await new Promise((resolve,reject)=>{const script=document.createElement("script");script.src=src;script.onload=resolve;script.onerror=()=>reject(new Error("Failed to load "+src));document.body.appendChild(script)});
  }
 }catch(error){console.error("Store loading error:",error);document.getElementById("appLoadError").hidden=false}
})();