/////////////////Variables///////////////////////////////////////////////////////////////////////////////////////////////////////////

const clipboard = document.querySelector('#clipboard');
const body = document.querySelector('#body');
const keyword = document.querySelector('#keyword');
const substitute = document.querySelector('#substitute');
const left = document.querySelector('#left')
const right = document.querySelector('#right')
let filter = document.querySelector('#filters');
let myFile = document.querySelector('#myFile');
const tableBody = document.querySelector('.detailed_analysis tbody');
const sort = document.querySelector('#sort');
let findIndex = 0;
let map;


////////////////////My Functions///////////////////////////////////////////////////////////////////////////////////////////////////////

		function displayContent(file){

			let fileReader = new FileReader();
			fileReader.onload = function(e){
				let fileContent = e.target.result;
				clipboard.textContent = fileContent;
				characterCount();
				findmatches();
			}
			fileReader.readAsText(file)
		}

		function findmatches(e){

			let text = clipboard.textContent;
			let value = keyword.value;
			let pattern = options();
			function options(){
				if(filter.value === "contains"){
					return new RegExp(value, 'gi');
				}else if(filter.value === "case"){
					return new RegExp(value, 'g');
				}else if(filter.value === "word"){
					return new RegExp(`\\b${value}\\b`, 'gi');
				}else if(filter.value === "starts"){
					return new RegExp(`\\b${value}\w\*`, 'gi');
				}else if(filter.value === "ends"){
					return new RegExp(`\w\*${value}\\b`, 'gi');
				}
			}
			
			if(value !== ''){
				clipboard.innerHTML = text.replace(pattern, function(match){
					return `<span class="hl">${match}</span>`
				});
				let length = document.querySelectorAll('.hl').length;
				if(length > 0){
					left.textContent = (length === 1)?  `1 of ${length} match` :  `1 of ${length} matches`;
					
				}else{
					left.textContent = `unable to find ${value}`;
					
				}
			}else{
				clipboard.innerHTML = text;
				left.textContent = "";
			} 
		}

		function navigateWords(e){

			let html = clipboard.innerHTML;
			let value = keyword.value.trim();
			
			if(value === ''){
				findIndex = 0;
				alert("You have no text. Put some text")
			}else{
				let highlight = document.querySelectorAll('.hl')
				let length = highlight.length;
				// console.log(html)
				if(!html.includes('active-find')){
					findIndex = length;
					highlight[findIndex%length].classList.add("inactive-find");
				}
				if(e.target.id === "find_next"){
					findIndex++;
				}else{
					if(findIndex%length === 0){
			 			findIndex = length;
			 		}
					findIndex--;
				}
				
				highlight.forEach(elem => elem.classList.remove('active-find'));
				left.textContent = `${findIndex%length + 1} of ${length} matches`;
				
				highlight[findIndex%length].classList.add('active-find');
				highlight[findIndex%length].tabIndex = "3";
				highlight[findIndex%length].focus();
			}
		}

		function characterCount(){

			let length = clipboard.textContent.trim().length;
			right.textContent =  length === 1? `${length} character` : `${length} characters`;
			if(length === 0){
				left.textContent = "";
			}
		}

		function groupWords(text){

			let hashMap = {};
			let words = text.toUpperCase()
			words = words.split(/[^\w-]+/)
			count = 0;
			
			for(word of words){
				if(!isNaN(word) && word !== ""){
					word = " " + word;
				}
				if(word){
					if(hashMap[word]){
						hashMap[word]++;
					}else{
						hashMap[word] = 1;
					}
					count++
				}
			}
			return hashMap;
		}



		function reorder(obj,type,dir,len){

			let newObj = {};
			let keys = Object.keys(obj);
			function compare(x,y){
				if(type === "number"){
					if(!len){
						if(dir === "desc"){
							return obj[y] - obj[x];
						}else if(dir === "asc"){
							return obj[x] - obj[y];
						}
					}else if(len){
						if(dir === "desc"){
							return y.length - x.length;
						}else if(dir === "asc"){
							return x.length - y.length;
						}
					}	
				}else if(type === "string"){
					if(dir === "desc"){
					 	return x.toLowerCase() > y.toLowerCase() ? -1: 1
					}else if(dir === "asc"){
						return x.toLowerCase() > y.toLowerCase() ? 1: -1
					}
				}
			}
			keys.sort(compare);
			for (key of keys){
				newObj[key] = obj[key];
			}
			return [newObj, Object.keys(newObj)[0], Object.values(newObj)[0], Object.keys(newObj)[0].length];
		}

		function loadTable(words, tableBody){
            
            let sn = 1
            let dataHTML = '';
            let keys = Object.keys(words);
            for(key of keys){
            	dataHTML += `<tr>
                        <td>${sn++}</td>
                        <td>${key}</td>
                        <td>${words[key]}</td>
                    </tr>`
            }
           
            tableBody.innerHTML = dataHTML;
        }
       
       function checkForContent(len){
			if(len === 0){
				alert("You have no text content")
				return false
			}
			return true;
		}


////////////////////////////Event Listeners//////////////////////////////////////////////////////////////////

		body.addEventListener('input', function(e){
			if(e.target.id === "keyword"){
				findmatches(e)
			}
			else if(e.target.id === "clipboard"){
				characterCount()
			}

		})
		
		body.addEventListener('change', function(e){
			if(e.target.id === "filters"){
				findmatches(e);
			}
			else if(e.target.id === "fileupload"){
				let file = e.target.files[0];
				displayContent(file);
			}
			else if(e.target.id === "sort"){
				let arr = e.target.value.split('-');
				let type = arr[0];
				let dir = arr[1];
				let len = arr[2];
				let sortedMap = reorder(map,type,dir,len);
				loadTable(sortedMap[0], tableBody);
			}
		})

		body.addEventListener('dragover', function(e){
			e.preventDefault();
			clipboard.classList.add('active');
		},false)

		body.addEventListener('dragleave', function(e){
			e.preventDefault();
			clipboard.classList.remove('active');
		}, false)

		body.addEventListener('drop', function(e){
			e.preventDefault();
			e.stopPropagation();
			clipboard.classList.remove('active');
			let file = e.dataTransfer.files[0];
			console.log(file.type)
			let regex = /^text[/].*/
			if(regex.test(file.type)){
				displayContent(file);	
			}else{
				alert('Please text files only e.g. Notepad files')
			}
			
			return false
			
		}, false)

		body.addEventListener('click', function(e){
			if(e.target.id === "analyse"){
				let text = clipboard.textContent;
				text = text.trim();
				length = text.length;
				
				let content = checkForContent(length);
				if(content){
					let words = text.split(' ').length;
					let char_non_space = text.replace(/\s/g, '').length;
					let char_space = length - char_non_space;
					const simple_analysis = document.querySelectorAll('.simple_analysis tbody td')
					const see_more = document.querySelector('#see_more') 
					map = groupWords(text);
					
					tableBody.parentElement.classList.remove('show');
					sort.classList.remove('show');
					sort.selectedIndex = 0;
					see_more.textContent = "See More";
					let mode = reorder(map,'number', 'desc');
					let longestWord = reorder(map,'number', 'desc', true);

					simple_analysis[1].textContent = words;
					simple_analysis[3].textContent = `${mode[1]} (${mode[2]})`;
					simple_analysis[5].textContent = `${longestWord[1]} (${longestWord[3]})`;
					simple_analysis[7].textContent = char_non_space;
					simple_analysis[9].textContent = char_space;
					simple_analysis[11].textContent = length;
				}
				
			}

			else if(e.target.id === "see_more"){
				if(e.target.textContent === "See More"){
					tableBody.parentElement.classList.add('show');
					sort.classList.add('show');
					loadTable(map, tableBody)
					e.target.textContent = "See Less";
				}else if(e.target.textContent === "See Less"){
					tableBody.parentElement.classList.remove('show');
					sort.classList.remove('show');
					e.target.textContent = "See More";
				}
			}

			else if(e.target.id === "find_next"){
				navigateWords(e)
			}
			
			else if(e.target.id === "find_prev"){	
				navigateWords(e);
			}

			else if(e.target.id === "replace"){
				let html = clipboard.innerHTML;
			
				if(checkForContent(html.length)){
					let value = keyword.value;
					let sub = substitute.value;
					let pattern;
					
					if(html.includes("active-find")){
						pattern = new RegExp(`\(\?\<\=\\bactive-find" tabindex="3">\)${value}`, 'i')
						
					}else{
						pattern = new RegExp(`${value}`, 'i') 
						
					}		
					
					clipboard.innerHTML = html.replace(pattern, sub);
					characterCount();
					findmatches(e);
				}
				
			}

			else if(e.target.id === "replace_all"){
				let html = clipboard.innerHTML;
				
				if(checkForContent(html.length)){
					let value = keyword.value;
					let sub = substitute.value;
					let pattern = new RegExp(`${value}`, 'gi') 
					clipboard.innerHTML = html.replace(pattern, sub);
					characterCount();
					left.textContent = "Replace All Completed";
				}
			}
		})




