import { supabase } from "./supabaseClient.js"

const registerBtn = document.getElementById("registerBtn")

if (registerBtn) {
  registerBtn.addEventListener("click", async () => {

    const name = document.getElementById("name").value
    const phone = document.getElementById("phone").value
    const email = document.getElementById("email").value
    const password = document.getElementById("password").value

    const { data, error } = await supabase.auth.signUp({
      email: email,
      password: password
    })

    if (error) {
      alert(error.message)
      return
    }

    const user = data.user || data.session?.user

    if (!user) {
      alert("User created but session not returned")
      return
    }

    const { error: insertError } = await supabase
      .from("users")
      .insert([
        {
          user_id: user.id,
          name: name,
          phone: phone,
          email: email
        }
      ])

    if (insertError) {
      console.error(insertError)
      alert("User profile creation failed")
      return
    }

    alert("Registration successful")
    window.location.href = "/src/pages/login.html"
  })
}

const loginBtn = document.getElementById("loginBtn")

if (loginBtn) {
  loginBtn.addEventListener("click", async () => {

    const email = document.getElementById("email").value
    const password = document.getElementById("password").value

    const { data, error } = await supabase.auth.signInWithPassword({
      email: email,
      password: password
    })

    if (error) {
      alert(error.message)
      return
    }

    window.location.href = "/src/pages/dashboard.html"
  })
}