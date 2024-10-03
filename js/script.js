document.getElementById('steganography-form').addEventListener('submit', function (e) {
    e.preventDefault();

    const files = document.getElementById('image-upload').files;
    const messages = document.getElementById('message-input').value.split(',');
    const bits = parseInt(document.getElementById('bit-selection').value);
    const canvas = document.getElementById('canvas');
    const ctx = canvas.getContext('2d');
    
    console.log(files.length);
    console.log(messages.length);

    

    if (files.length !== messages.length) {
        alert('O número de imagens deve ser igual ao número de mensagens.');
        return;
    }

    const csvData = [['Nome da Imagem', 'Mensagem', 'Esteg', 'Tipo de Esteg']];
    const zip = new JSZip();
    const imageFolder = zip.folder("images");

    let processedImages = 0;  // Contador para imagens processadas

    for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const message = messages[i].trim();

        const reader = new FileReader();
        reader.onload = function (event) {
            const img = new Image();
            img.onload = function () {
                canvas.width = img.width;
                canvas.height = img.height;
                ctx.drawImage(img, 0, 0);

                // Converter para escala de cinza
                const imageData = ctx.getImageData(0, 0, img.width, img.height);
                const data = imageData.data;

                for (let j = 0; j < data.length; j += 4) {
                    const avg = (data[j] + data[j + 1] + data[j + 2]) / 3;
                    data[j] = data[j + 1] = data[j + 2] = avg; // Escala de cinza
                }

                ctx.putImageData(imageData, 0, 0);

                // Aplicar esteganografia LSB (ASCII)
                let messageIndex = 0;
                let charCode = message.charCodeAt(messageIndex);
                let bitMask = (1 << bits) - 1;
                let bitPosition = 8 - bits;

                for (let y = 0; y < img.height; y++) {
                    for (let x = 0; x < img.width; x++) {
                        if (messageIndex >= message.length) break;

                        const pixelIndex = (y * img.width + x) * 4;
                        let grayValue = data[pixelIndex];

                        // Inserir os bits da mensagem no pixel (ASCII)
                        grayValue = (grayValue & ~bitMask) | ((charCode >> bitPosition) & bitMask);
                        data[pixelIndex] = grayValue;
                        data[pixelIndex + 1] = grayValue;
                        data[pixelIndex + 2] = grayValue;

                        bitPosition -= bits;
                        if (bitPosition < 0) {
                            bitPosition = 8 - bits;
                            messageIndex++;
                            if (messageIndex < message.length) {
                                charCode = message.charCodeAt(messageIndex);
                            }
                        }
                    }
                }

                ctx.putImageData(imageData, 0, 0);

                // Gerar Blob da imagem processada e adicionar ao ZIP
                canvas.toBlob(function (blob) {
                    imageFolder.file(`steg_${file.name}`, blob);

                    processedImages++;

                    // Adicionar registro ao CSV
                    csvData.push([file.name, message, true, `${bits} bits`]);

                    // Quando todas as imagens forem processadas, gerar o ZIP e CSV
                    if (processedImages === files.length) {
                        // Gerar CSV
                        const csvContent = "data:text/csv;charset=utf-8," + csvData.map(e => e.join(",")).join("\n");
                        const csvLink = document.getElementById('download-csv');
                        csvLink.href = encodeURI(csvContent);
                        csvLink.download = 'results.csv';
                        csvLink.style.display = 'block';
                        csvLink.innerText = 'Baixar CSV';

                        // Gerar e baixar o ZIP
                        zip.generateAsync({ type: "blob" }).then(function (content) {
                            const zipLink = document.getElementById('download-zip');
                            zipLink.href = URL.createObjectURL(content);
                            zipLink.download = 'images_steg.zip';
                            zipLink.style.display = 'block';
                            zipLink.innerText = 'Baixar ZIP das Imagens';
                        });
                    }
                }, 'image/png');
            };
            img.src = event.target.result;
        };
        reader.readAsDataURL(file);
    }
});


const textarea = document.getElementById('message-input');
const span = document.getElementById('qtd_msgs');

// Função para atualizar o span ao perder o foco do textarea
textarea.addEventListener('blur', function () {
    const messages_qtd = document.getElementById('message-input').value.split(',');
    // Obtém o valor do textarea
    const valor = messages_qtd.length;
    // Exibe o valor no span
    span.textContent = valor;
});