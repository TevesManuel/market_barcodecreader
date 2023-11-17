let code_has_been_readed = false;
let initial_background_color = null;
let last_code = null;

document.addEventListener('DOMContentLoaded', (event) => {
	const canvas = document.getElementById('canvas');
	const context = canvas.getContext('2d');

	//640 W  480 H

	let box_size = window.innerWidth * 0.5;
    canvas.width = box_size;
    canvas.height = box_size * (3/4);

    initial_background_color = document.body.style.backgroundColor;

    setInterval(() => {
    	if(code_has_been_readed)
    	{
 			document.body.style.backgroundColor = "rgb(0, 200, 0)";
    	}
    	else
    	{
    		document.body.style.backgroundColor = initial_background_color;	
    	}
    	code_has_been_readed = false;
	}, 100);

	let spreadsheetId = "1lbjVB17RPO54akkEkrb2lxFE2Coc4QgyycP1d_iMvSY";

	idColumnValues = [];
	priceColumnValues = [];

	google.load('visualization', '1', { packages: ['corechart'], callback: () => {
    	const query = new google.visualization.Query(`https://spreadsheets.google.com/tq?key=${spreadsheetId}&gid=0`);
	    query.setQuery('SELECT B, C');
	    query.send((response) => {
	    	if(response.isError())
	    	{
			    alert("ERROR AL CARGAR PRECIOS");			    		
	    	}
	    	else
	    	{
 		        let dataTable = response.getDataTable();

                if (dataTable.getNumberOfRows() > 0)
                {
                    for (let i = 0; i < dataTable.getNumberOfRows(); i++)
                    {
                    	idColumnValues.push(dataTable.getValue(i, 0));
                    	priceColumnValues.push(dataTable.getValue(i, 1));
                    }
                }
                else
                {
                	alert("NO SE ENCONTRARON PRECIOS");
                }
				alert("OK");
	    	}
    	});	
	}});


	Quagga.init({
	    inputStream: {
	        name: "Live",
	        type: "LiveStream",
	        target: canvas,
	        constraints: {
	            width: 640,
	            height: 480,
	            facingMode: "environment"
	        },
	    },
	    decoder: {
	        readers: ["ean_reader", "upc_reader", "code_128_reader"]
	    },
	    numOfWorkers: 8,
	    locate: true,
	    locator: {
	        patchSize: "medium",
	        halfSample: true
	    }
	}, function (err) {
	    if (err) {
	        console.log(err);
	        return;
	    }
	    
	    document.getElementById('barcode_out').innerHTML = "Scanning...";
	    Quagga.start();
	});

	Quagga.onDetected(function (result) {
		if(last_code != result.codeResult.code)
		{
		    document.getElementById('barcode_out').innerHTML = "Código de barras detectado y decodificado: " + result.codeResult.code;
		    document.getElementById('audioPlayer').play();
		    code_has_been_readed = true;
		    last_code = result.codeResult.code;
            for (let i = 0; i < idColumnValues.length; i++)
            {
	            if(result.codeResult.code == idColumnValues[i])
	            {
	            	document.getElementById('price_of_product').innerHTML = priceColumnValues[i] + "$";
	            	
	            }
            }
		}
	});

	Quagga.onProcessed(function (result) {
	    var drawingCtx = Quagga.canvas.ctx.overlay,
	        drawingCanvas = Quagga.canvas.dom.overlay;
	
	    if (result) {
	        if (result.boxes) {
	            drawingCtx.clearRect(0, 0, parseInt(drawingCanvas.getAttribute("width")), parseInt(drawingCanvas.getAttribute("height")));
	            result.boxes.filter(function (box) {
	                return box !== result.box;
	            }).forEach(function (box) {
	                Quagga.ImageDebug.drawPath(box, { x: 0, y: 1 }, drawingCtx, { color: "green", lineWidth: 2 });
	            });
	        }
	
	        if (result.box) {
	            Quagga.ImageDebug.drawPath(result.box, { x: 0, y: 1 }, drawingCtx, { color: "blue", lineWidth: 2 });
	        }
	
	        if (result.codeResult && result.codeResult.code) {
	            Quagga.ImageDebug.drawPath(result.line, { x: 'start', y: 'bar' }, drawingCtx, { color: 'red', lineWidth: 3 });
	        }
	    }
	});

	navigator.mediaDevices.enumerateDevices()
	.then(function(devices) {
	    const cameras = devices.filter(device => device.kind === 'videoinput');
	    const rearCamera = cameras.find(camera => camera.label.includes('back') || camera.label.includes('rear'));
	
	    if (rearCamera) {
	        return navigator.mediaDevices.getUserMedia({
	            video: {
	                deviceId: { exact: rearCamera.deviceId }
	            }
	        });
	    } else {
	        throw new Error('No se encontró una cámara trasera.');
	    }
	})
	.then(function (stream) {
                  const videoStream = new MediaStream([stream.getVideoTracks()[0]]);

                  const video = document.createElement('video');
                  video.srcObject = videoStream;
                  video.play();
                  const updateCanvas = () => {
                      context.drawImage(video, 0, 0, canvas.width, canvas.height);
                      requestAnimationFrame(updateCanvas);
                  };

                  updateCanvas();
       	})
	.catch(function (error) {
	    console.error("Error al acceder a la cámara trasera: ", error);
	});		
});
