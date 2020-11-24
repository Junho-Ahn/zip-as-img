let log = null;

document.addEventListener("DOMContentLoaded", () => {
	let console = document.querySelector("#console");
	log = {
		log(x){
			console.appendChild(createDiv(x.toString()));
		},
		clear(){
			console.innerHTML = "";
		}
	};
	document.querySelector("#fileform").addEventListener("change", function(){
		makeResultFile(this.files);
	});
	document.querySelector("#coverform").addEventListener("change", function(e){
		updateImgBlob(this.files[0]);
		e.stopPropagation();
	});
	document.querySelector("#dropzone").addEventListener("click", () => {
		document.querySelector("#fileform").click();
	});
	document.querySelector("p").addEventListener("click", (e) => {
		document.querySelector("#coverform").click();
		e.stopPropagation();
	});
	
	updateImgBlob(img_blob);
});

function createDiv(innerText){
	let element = document.createElement("DIV");
	element.innerHTML = innerText;
	return element;
}

function updateImgBlob(blob){
	img_blob = blob;
	
	let reader = new FileReader();
	reader.onload = () => {
		document.querySelector("#cover-preview").setAttribute("src", reader.result);
	};
	reader.readAsDataURL(img_blob);
}

function makeResultFile(files){
	log.clear();
	
	let zip = new JSZip();
	log.log("포함될 파일 목록:");
	for(let i = 0; i < files.length; i++){
		log.log(files[i].name);
		zip.file(files[i].name, files[i]);
	}
	
	log.log("압축하는 중...");
	
	zip.generateAsync({type: "blob"}).then((blob) => {
		let fr = new FileReader();
		fr.onload = () => {
			let img_len = img_blob.size;
			let zipview = new DataView(fr.result);
			let len = zipview.byteLength;
			let eocd = len - 22;
			let cdr = zipview.getUint32(eocd + 16, true);
			zipview.setUint32(eocd + 16, cdr + img_len, true);
			
			while(cdr < eocd){
				let n = zipview.getUint16(cdr + 28, true);
				let m = zipview.getUint16(cdr + 30, true);
				let old_offset = zipview.getUint32(cdr + 42, true);
				zipview.setUint32(cdr + 42, old_offset + img_len, true);
				cdr += 46 + n + m;
			}
			let result_blob = new Blob([img_blob, zipview],
				{type: "image/png"});
			saveAs(result_blob, "result.png");
		};
		fr.readAsArrayBuffer(blob);
	}, null);
}

window.addEventListener("dragover", function(e){
	e.preventDefault();
}, false);

window.addEventListener("drop", function(e){
	e.preventDefault();
	e.stopPropagation();
	
	makeResultFile(e.dataTransfer.files);
}, false);
