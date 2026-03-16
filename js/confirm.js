import { supabase } from "./supabaseClient.js"

async function handleConfirmation(){

const params = new URLSearchParams(window.location.search)

const compId = params.get("comp")
const action = params.get("action")

let newStatus = ""

if(action === "yes"){
 newStatus = "resolved"
}

if(action === "no"){
 newStatus = "pending"
}

if(!newStatus){
 document.getElementById("result").innerText = "Invalid request"
 return
}

const { error } = await supabase
.from("complaints")
.update({ status: newStatus })
.eq("comp_id", compId)

if(error){
 document.getElementById("result").innerText = "Error updating complaint"
 return
}

document.getElementById("result").innerText =
`Thank you. Complaint status updated to ${newStatus}.`

}

handleConfirmation()