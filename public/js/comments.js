var messageBtn = document.getElementById('messageBtn'),
	contentId = document.getElementById('contentId'),
	username = document.getElementById('username'),
	messageContent = document.getElementById('messageContent'),
	commentsList = document.getElementById('commentsList'),
	messageCount = document.getElementById('messageCount');

messageBtn.onclick = function(){
	var data = {
		contentId: contentId.value,
		comment: messageContent.value,
		username: username.value
	}

	var myInit = {
		method: 'POST',
		body: JSON.stringify(data),
		headers: {'Content-Type': 'application/json'},
		credentials: 'include'    
	}

	fetch('/api/comment/post', myInit)
		.then(function(res){
			return res.json()
		})
		.then(function(responseData){
			renderComment(responseData.data.comments.reverse());
			messageContent.value = '';
		})		
}

function renderComment(data){   
	var html = '';

	messageCount.innerHTML = data.length;

	for(var i = 0, l = data.length; i < l; i++){
		var comment = data[i];
		html +=   `<div id="commentItem">
					<p id="userMsg">
						<span id="commentUser">${comment.username}</span>
						<span id="commentTime">${comment.date}</span>
					</p>
					<p id="comment">
						${comment.content}
					</p>
				  </div>`
	}

	commentsList.innerHTML = html;
}

//进入内容页面时发送fetch显示评论
	var data = {
		contentId: contentId.value
	}

	var myInit = {
		method: 'POST',
		body: JSON.stringify(data),
		headers: {'Content-Type': 'application/json'},
		credentials: 'include'    
	}

fetch('/api/comment', myInit)
	.then(function(res){
		return res.json()
	})
	.then(function(responseData){
		renderComment(responseData.data.comments.reverse());
	})