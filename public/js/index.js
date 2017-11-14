const loginBox = document.getElementById('loginBox');
const registerBox = document.getElementById('registerBox');
const loginLink = registerBox.getElementsByTagName('a');
const registerLink = loginBox.getElementsByTagName('a');

loginLink[0].addEventListener('click', function(){
	loginBox.style.display = "block";
	registerBox.style.display = "none";
})

registerLink[0].addEventListener('click', function(){
	loginBox.style.display = "none";
	registerBox.style.display = "block";
})
