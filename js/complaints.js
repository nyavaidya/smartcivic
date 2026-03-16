import { supabase } from "./supabaseClient.js"
let lat = null
let lng = null

const map = L.map('map')

navigator.geolocation.getCurrentPosition(
    (position) => {

        const userLat = position.coords.latitude
        const userLng = position.coords.longitude

        console.log("Detected location:", userLat, userLng)

        lat = userLat
        lng = userLng

        map.setView([userLat, userLng], 16)

        L.marker([userLat, userLng])
            .addTo(map)
            .bindPopup("Your current location")
            .openPopup()

    },
    (error) => {

        console.log("Geolocation failed:", error)

        //fallback to Chattrapati Sambhajinagar
        const fallbackLat = 19.8761653
        const fallbackLng = 75.3433139

        map.setView([fallbackLat, fallbackLng], 13)

    },
    {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0
    }
)

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© OpenStreetMap'
}).addTo(map)



let marker

map.on("click", function (e) {

    lat = e.latlng.lat
    lng = e.latlng.lng
    document.getElementById("selectedLocation").innerText =
        "Selected: " + lat.toFixed(5) + ", " + lng.toFixed(5)

    if (marker) {
        map.removeLayer(marker)
    }

    marker = L.marker([lat, lng]).addTo(map)

})

const submitBtn = document.getElementById("submitComplaint")

if (submitBtn) {

    submitBtn.addEventListener("click", async () => {

        const { data: sessionData } = await supabase.auth.getSession()

        if (!sessionData.session) {
            window.location.href = "/login.html"
            return
        }

        const user = sessionData.session.user

        const category = document.getElementById("category").value
        const description = document.getElementById("description").value

        if (lat === null || lng === null) {
            alert("Please select a location on the map")
            return
        }

        const file = document.getElementById("photo").files[0]

        let photoUrl = null

        if (file) {

            const fileName = `${Date.now()}_${file.name}`

            const { data, error } = await supabase.storage
                .from("complaint-images")
                .upload(fileName, file)

            if (error) {
                console.error("UPLOAD ERROR:", error)
                alert("Image upload failed")
                return
            }

            photoUrl = supabase.storage
                .from("complaint-images")
                .getPublicUrl(fileName).data.publicUrl

            console.log("Uploaded image URL:", photoUrl)
        }

        const { error } = await supabase
            .from("complaints")
            .insert([
                {
                    user_id: user.id,
                    category: category,
                    description: description,
                    photo_url: photoUrl,
                    location: lat + "," + lng,
                    latitude: lat,
                    longitude: lng,
                    status: "pending"
                }
            ])

        if (error) {
            alert("Failed to submit complaint")
            console.error(error)
            return
        }

        alert("Complaint submitted successfully")

        window.location.href = "/dashboard.html"

    })

}