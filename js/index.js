function showUser(){

document.getElementById("roleSelect").style.display="none"
document.getElementById("userOptions").style.display="block"

}

function showAdmin(){

document.getElementById("roleSelect").style.display="none"
document.getElementById("adminLogin").style.display="block"

}

function goBack(){

document.getElementById("roleSelect").style.display="block"
document.getElementById("userOptions").style.display="none"
document.getElementById("adminLogin").style.display="none"

}

function goLogin(){

window.location.href="/login.html"

}

function goRegister(){

window.location.href="/register.html"

}

function adminLogin(){

const username=document.getElementById("adminUser").value.trim()
const password=document.getElementById("adminPass").value.trim()

const ADMIN_USER = "admin"
const ADMIN_PASS = "123456"

if(username === ADMIN_USER && password === ADMIN_PASS){

window.location.href="/admin.html"

}else{

alert("Invalid admin credentials")

}

}

window.showUser=showUser
window.showAdmin=showAdmin
window.goBack=goBack
window.goLogin=goLogin
window.goRegister=goRegister
window.adminLogin=adminLogin