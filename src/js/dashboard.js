import { supabase } from "./supabaseClient.js"

async function loadDashboard() {

    const { data: sessionData } = await supabase.auth.getSession()

    if (!sessionData.session) {
        window.location.href = "/src/pages/login.html"
        return
    }

    const user = sessionData.session.user

    loadUserProfile(user.id)
    loadUserComplaints(user.id)
}

async function loadUserProfile(userId) {

    const { data, error } = await supabase
        .from("users")
        .select("*")
        .eq("user_id", userId)
        .single()

    if (error) {
        console.error(error)
        return
    }

    document.getElementById("userName").innerText = "Name: " + data.name
    document.getElementById("userEmail").innerText = "Email: " + data.email
    document.getElementById("userPhone").innerText = "Phone: " + data.phone

    const firstLetter = data.name.charAt(0).toUpperCase()
    document.getElementById("avatar").innerText = firstLetter
}

async function loadUserComplaints(userId) {

    const { data, error } = await supabase
        .from("complaints")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false })

    if (error) {
        console.error(error)
        return
    }

    const table = document.getElementById("complaintsTable")
    table.innerHTML = ""

    data.forEach(c => {

const row = document.createElement("tr")

let statusText = c.status

if(c.status === "awaiting_confirmation"){
statusText = "Awaiting Your Confirmation"
}

row.innerHTML = `
<td>${c.comp_id}</td>
<td>${c.category}</td>
<td>
<span class="${
c.status === "resolved"
? "status-green"
: c.status === "awaiting_confirmation"
? "status-blue"
: "status-orange"
}">
${statusText}
</span>
</td>
<td>${new Date(c.created_at).toLocaleDateString()}</td>
`

table.appendChild(row)

})
}

document.getElementById("lodgeComplaintBtn")
    .addEventListener("click", () => {
        window.location.href = "/src/pages/complaint.html"
    })

loadDashboard()

document.getElementById("logoutBtn")
?.addEventListener("click", async () => {

await supabase.auth.signOut()

window.location.href = "/"

})
