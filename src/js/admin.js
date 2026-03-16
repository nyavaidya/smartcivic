import { supabase } from "./supabaseClient.js"

// ---------- MAP SETUP ----------

const map = L.map("adminMap").setView([18.5204, 73.8567], 13)

L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
 attribution: "© OpenStreetMap"
}).addTo(map)

let heatLayer

// Marker clustering
const markersLayer = L.markerClusterGroup()
map.addLayer(markersLayer)


// ---------- LOAD COMPLAINTS ----------

async function loadComplaints() {

 const selectedCategory = document.getElementById("categoryFilter")?.value

 let query = supabase.from("complaints").select("*")

 if (selectedCategory && selectedCategory !== "all") {
  query = query.eq("category", selectedCategory)
 }

 const { data, error } = await query.order("created_at", { ascending:false })

 if(error){
  console.error(error)
  return
 }

 // ---------- ANALYTICS ----------

 const total = data.length
 const pending = data.filter(c => c.status === "pending").length
 const resolved = data.filter(c => c.status === "resolved").length

 const categoryCount = {}

 data.forEach(c=>{
  categoryCount[c.category] = (categoryCount[c.category] || 0) + 1
 })

 let topCategory = "-"
 let maxCount = 0

 for(const category in categoryCount){
  if(categoryCount[category] > maxCount){
   maxCount = categoryCount[category]
   topCategory = category
  }
 }

 document.getElementById("totalComplaints").innerText = total
 document.getElementById("pendingComplaints").innerText = pending
 document.getElementById("resolvedComplaints").innerText = resolved
 document.getElementById("topCategory").innerText = topCategory


 // ---------- TABLE + MAP ----------

 const table = document.getElementById("adminTable")
 table.innerHTML = ""

 markersLayer.clearLayers()

 const bounds = []
 const heatPoints = []

 data.forEach(c=>{

  const row = document.createElement("tr")

  row.innerHTML = `
<td>${c.comp_id}</td>
<td>${c.category}</td>
<td>${c.description}</td>

<td>
${c.photo_url 
 ? `<img src="${c.photo_url}" width="80" style="border-radius:6px; cursor:pointer;" onclick="window.open('${c.photo_url}')">`
 : "No Image"}
</td>

<td>${c.status}</td>

<td>
<button onclick="resolveComplaint('${c.comp_id}')">
Resolve
</button>
</td>
`

  table.appendChild(row)

  if(c.latitude && c.longitude){

   bounds.push([c.latitude, c.longitude])

   heatPoints.push([c.latitude, c.longitude, 0.5])

   const iconColor = c.status === "resolved" ? "green" : "red"

   const icon = L.icon({
    iconUrl:`https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-${iconColor}.png`,
    shadowUrl:"https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
    iconSize:[25,41],
    iconAnchor:[12,41]
   })

   const marker = L.marker(
    [c.latitude, c.longitude],
    { icon: icon }
   ).addTo(markersLayer)

   marker.bindPopup(`
<b>${c.category}</b><br>
${c.description}<br>
Status: ${c.status}<br>
ID: ${c.comp_id}<br><br>

${c.photo_url 
 ? `<img src="${c.photo_url}" width="200" style="border-radius:8px; cursor:pointer;" onclick="window.open('${c.photo_url}')">`
 : "No image uploaded"}
`)
  }

 })

 // ---------- AUTO ZOOM ----------

 if(bounds.length){
  map.fitBounds(bounds)
 }

 // ---------- HEATMAP ----------

 if(heatLayer){
  map.removeLayer(heatLayer)
 }

 heatLayer = L.heatLayer(heatPoints,{
  radius:25,
  blur:20,
  maxZoom:17
 }).addTo(map)

}


// ---------- RESOLVE COMPLAINT ----------

window.resolveComplaint = async function(id){

 const { data: complaint, error: fetchErr } = await supabase
  .from("complaints")
  .select("comp_id, user_id")
  .eq("comp_id", id)
  .single()

 if(fetchErr){
  console.error(fetchErr)
  return
 }

 const { error } = await supabase
  .from("complaints")
  .update({ status:"awaiting_confirmation" })
  .eq("comp_id", id)

 if(error){
  console.error(error)
  return
 }

 const { data:user, error:userErr } = await supabase
  .from("users")
  .select("email")
  .eq("user_id", complaint.user_id)
  .single()

 if(userErr){
  console.error(userErr)
  return
 }

 sendConfirmationEmail(user.email, complaint.comp_id)

 loadComplaints()
}


// ---------- FILTER ----------

document.getElementById("categoryFilter")
 ?.addEventListener("change", loadComplaints)


// ---------- INITIAL LOAD ----------

loadComplaints()


// ---------- LOGOUT ----------

document.getElementById("adminLogoutBtn")
 ?.addEventListener("click", async () => {

  await supabase.auth.signOut()

  window.location.href = "/"

 })


// ---------- EMAIL ----------

function sendConfirmationEmail(email, compId){

 const yesLink = `${window.location.origin}/confirm.html?comp=${compId}&action=yes`
 const noLink = `${window.location.origin}/confirm.html?comp=${compId}&action=no`

 emailjs.send("service_lyxua09","template_m1g3k3k",{
  user_email: email,
  complaint_id: compId,
  yes_link: yesLink,
  no_link: noLink
 })
 .then(()=>console.log("Email sent"))
 .catch(err=>console.error("Email error",err))

}