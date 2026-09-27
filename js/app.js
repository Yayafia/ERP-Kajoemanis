const recipes = {
  brownies: {name:"Brownies Burnt Cheesecake", code:"KM-BBC", yield:1, unit:"loyang", portions:"8–10 potong", ingredients:[
    ["Cream cheese",500,"gram"],["Gula pasir",150,"gram"],["Telur ayam",4,"butir"],["Whipping cream",250,"ml"],["Tepung terigu",20,"gram"],["Tepung maizena",10,"gram"],["Vanili",5,"gram"],["Garam",2,"gram"],["Dark chocolate",100,"gram"],["Butter",50,"gram"]
  ]},
  tape: {name:"Cake Tape",code:"KM-CT",yield:1,unit:"loyang",portions:"10–12 potong",ingredients:[
    ["Tape singkong",250,"gram"],["Tepung terigu",200,"gram"],["Gula pasir",150,"gram"],["Telur ayam",4,"butir"],["Margarin",150,"gram"],["Susu cair",100,"ml"],["Baking powder",5,"gram"],["Vanili",5,"gram"],["Keju parut",50,"gram"],["Garam",2,"gram"]
  ]},
  soes: {name:"Kue Soes",code:"KM-KS",yield:1,unit:"batch",portions:"10–12 buah",ingredients:[
    ["Tepung terigu",60,"gram"],["Margarin",50,"gram"],["Air",100,"ml"],["Telur ayam",2,"butir"],["Gula pasir (adonan kulit)",5,"gram"],["Garam",1,"gram"],["Susu cair (bahan vla)",250,"ml"],["Tepung maizena",20,"gram"],["Gula pasir (bahan vla)",50,"gram"],["Kuning telur",1,"butir"],["Vanili",2,"gram"]
  ]}
};
const $ = id => document.getElementById(id);
let orders = JSON.parse(localStorage.getItem("kajoeManisMO") || "[]");
let activeStatus = "All";
const today = new Date();
$("todayLabel").textContent = today.toLocaleDateString("id-ID",{day:"numeric",month:"short",year:"numeric"});
$("dateInput").value = `${today.getFullYear()}-${String(today.getMonth()+1).padStart(2,"0")}-${String(today.getDate()).padStart(2,"0")}`;

function formatQty(n){return Number.isInteger(n)?String(n):n.toLocaleString("id-ID",{maximumFractionDigits:2});}
function renderBOM(){
  const key=$("productSelect").value, qty=Math.max(1,Number($("qtyInput").value)||1);
  const recipe=recipes[key];
  if(!recipe){$("bomList").innerHTML='<p class="empty-bom">Pilih produk untuk melihat kebutuhan bahan.</p>';return;}
  $("bomList").innerHTML=recipe.ingredients.map(([name,amount,unit])=>`<div class="bom-item"><span>${name}</span><b>${formatQty(amount*qty)} ${unit}</b></div>`).join("");
}
function statusClass(status){return status==="In Progress"?"progress":status==="Pending"?"pending":"completed";}
function render(){
  const query=$("searchInput").value.toLowerCase();
  const filtered=orders.filter(o=>(activeStatus==="All"||o.status===activeStatus)&&(`${o.code} ${o.product}`.toLowerCase().includes(query)));
  $("statTotal").textContent=orders.length;
  $("statProgress").textContent=orders.filter(o=>o.status==="In Progress").length;
  $("statPending").textContent=orders.filter(o=>o.status==="Pending").length;
  $("statCompleted").textContent=orders.filter(o=>o.status==="Completed").length;
  $("activeCount").textContent=orders.filter(o=>o.status!=="Completed").length;
  $("resultCount").textContent=`Menampilkan ${filtered.length} dari ${orders.length} data`;
  $("emptyState").hidden=filtered.length!==0;
  $("ordersBody").innerHTML=filtered.map(o=>{
    const icon=o.key==="brownies"?"🍰":o.key==="tape"?"🍞":"🧁";
    const next=o.status==="Pending"?"In Progress":o.status==="In Progress"?"Completed":"In Progress";
    const action=o.status==="Completed"?"↻":"▶";
    return `<tr><td><div class="product-cell"><div class="product-thumb">${icon}</div><div><b>${o.product}</b><small>${o.code}</small></div></div></td><td>${new Date(o.date+"T00:00:00").toLocaleDateString("id-ID",{day:"numeric",month:"short",year:"numeric"})}<br><small>${o.source}</small></td><td><span class="yield">${o.qty} ${recipes[o.key].unit}</span><br><small>${recipes[o.key].portions} / unit</small></td><td><span class="status ${statusClass(o.status)}">${o.status}</span></td><td><div class="actions"><button class="action-btn" title="Ubah status" onclick="changeStatus('${o.id}','${next}')">${action}</button><button class="action-btn" title="Hapus MO" onclick="deleteOrder('${o.id}')">✎</button></div></td></tr>`;
  }).join("");
}
function save(){localStorage.setItem("kajoeManisMO",JSON.stringify(orders));render();}
$("productSelect").addEventListener("change",renderBOM);
$("qtyInput").addEventListener("input",renderBOM);
$("searchInput").addEventListener("input",render);
$("statusTabs").addEventListener("click",e=>{
  const btn=e.target.closest("button[data-status]");if(!btn)return;
  activeStatus=btn.dataset.status;
  document.querySelectorAll(".tab").forEach(t=>t.classList.toggle("selected",t===btn));render();
});
$("moForm").addEventListener("submit",e=>{
  e.preventDefault();
  const key=$("productSelect").value, qty=Number($("qtyInput").value), date=$("dateInput").value;
  if(!recipes[key]||qty<1||!date)return;
  const recipe=recipes[key], seq=String(orders.length+1).padStart(3,"0");
  orders.unshift({id:Date.now().toString(),key,product:recipe.name,code:`MO-${today.getFullYear()}-${seq}`,qty,date,source:$("sourceInput").value,status:"Pending",note:$("noteInput").value});
  save();e.target.reset();$("qtyInput").value=1;$("dateInput").value=`${today.getFullYear()}-${String(today.getMonth()+1).padStart(2,"0")}-${String(today.getDate()).padStart(2,"0")}`;renderBOM();
});
window.changeStatus=(id,status)=>{orders=orders.map(o=>o.id===id?{...o,status}:o);save();};
window.deleteOrder=id=>{if(confirm("Hapus Manufacturing Order ini?")){orders=orders.filter(o=>o.id!==id);save();}};
renderBOM();render();
