window.addEventListener("load",()=>{
    var xhr = new XMLHttpRequest();
    document.querySelector("button").addEventListener("click",()=>{
    	if(document.querySelector("#name").value==''){
    		alert("Please Enter a Name to use");
    		return;
    	}
        var inputData=document.querySelector("#name").value;
        xhr.open("GET", "/clientName?name="+inputData, true);
        xhr.onreadystatechange = function() {
            if (this.readyState == 4 && this.status == 200){
                if(this.responseText=="nameValid"){
                    localStorage.setItem('name', inputData);
                    window.location.replace("/chatapp.html");
                }
                else{
                    alert("The Name is already in use");
                }
            }
        };
        xhr.send();
    });
    window.addEventListener("keypress",(event)=>{
    	if(event.code=="Enter"){
        	if(document.querySelector("#name").value==''){
        		alert("Please Enter a Name to use");
        		return;
        	}
        	document.querySelector("button").click();
        }
    });
});
