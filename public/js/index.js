const loginBox = document.getElementById('loginBox');
const registerLink = document.getElementById('registerLink');
const loginBtn = document.getElementById('loginBtn');

const registerBox = document.getElementById('registerBox');
const loginLink = document.getElementById('loginLink');
const registerBtn = document.getElementById('registerBtn')

const userBox = document.getElementById('userBox');
const logoutBtn = document.getElementById('logoutBtn');



document.addEventListener('click', function(event){
	target = event.target;

	switch(target.id){
		//切换到登录面板
		case 'loginLink':
			loginBox.style.display = "block";
			registerBox.style.display = "none";	
			break;
		//切换到注册面板
		case 'registerLink':
			loginBox.style.display = "none";
			registerBox.style.display = "block";
			break;
		//注册,通过fetch提交数据
		case 'registerBtn':
			var data = {
				username: registerBox.querySelector('input[name="username"]').value,
				password: registerBox.querySelector('input[name="password"]').value,
				repassword: registerBox.querySelector('input[name="repassword"]').value
			}
			var myInit = {
				method: 'POST',
				body: JSON.stringify(data),
				headers: {'Content-Type': 'application/json'}
			}

			fetch('/api/user/register', myInit)
				.then(function(res){  //res是包含一个response对象的promise对象
					return res.json();
				})
                .then(function(obj){
					document.getElementById('registerInfo').innerHTML = obj.message;
				})
			break;

		// case 'registerBtn':
		// 	var myInit = {
		// 		method: 'post',
		// 		body: new FormData(registerBox.querySelector('form')),
		// 		headers: {
		// 			'Content-Type': 'application/x-www-form-urlencoded'
		// 		}
		// 	}

		// 	fetch('/api/user/register', myInit)
		// 		.then(function(res){
		// 			console.log(res.formData())
					
		// 		})
		// 		.then(function(obj){
		// 			document.getElementById('userInfo').innerHTML = obj.message;
		// 		})

		//登录,通过fetch提交数据
		case 'loginBtn':
			var data = {
				username: loginBox.querySelector('input[name="username"]').value,
				password: loginBox.querySelector('input[name="password"]').value
			}
			var myInit = {
				method: 'POST',
				body: JSON.stringify(data),
				headers: {'Content-Type': 'application/json'},
				credentials: 'include'                 //fetch请求默认不带cookie
			}

			fetch('/api/user/login', myInit)
				.then(function(res){  //res是包含一个response对象的promise对象
					return res.json(); //返回的也是promise对象
				})
                .then(function(obj){
                	if(obj.code === 0){
                        //userBox.style.display = "block";
                 	    //loginBox.style.display = "none"
						// document.getElementById('username').innerHTML = obj.userMsg.username;
						window.location.reload();
					}else{
						document.getElementById('loginInfo').innerHTML = obj.message;
					}	
				})
			break;	
	    case 'logoutBtn':
			var myInit = {
				credentials: 'include'                //fetch请求默认不带cookie
			}

	    	fetch('/api/user/logout', myInit)
	    		.then(function(res){
	    			window.location.reload();
	    		})
	    	break;		
	}
})
