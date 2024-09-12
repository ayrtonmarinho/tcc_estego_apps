// Função para esteganografar várias imagens e salvar em um arquivo ZIP
function esteganografarImagens() {
    const inputImages = document.getElementById('inputImages');
    const mensagem = document.getElementById('mensagem').value;
    const bits = parseInt(document.getElementById('bits').value);

    if (inputImages.files.length === 0) {
        alert("Por favor, carregue imagens.");
        return;
    }

    const zip = new JSZip();
    const folder = zip.folder("imagens_esteganografadas");
    const mensagemBin = mensagem.split('').map(c => c.charCodeAt(0).toString(2).padStart(8, '0')).join('');

    Array.from(inputImages.files).forEach((file, index) => {
        const reader = new FileReader();

        reader.onload = function(event) {
            const img = new Image();
            img.src = event.target.result;

            img.onload = function() {
                const canvas = document.createElement('canvas');
                const ctx = canvas.getContext('2d');

                canvas.width = img.width;
                canvas.height = img.height;
                ctx.drawImage(img, 0, 0);

                const imgData = ctx.getImageData(0, 0, img.width, img.height);
                const pixels = imgData.data;

                let mensagemIndex = 0;
                for (let i = 0; i < pixels.length; i += 4) {
                    if (mensagemIndex < mensagemBin.length) {
                        let pixelBin = pixels[i].toString(2).padStart(8, '0');
                        const bitsToHide = mensagemBin.substring(mensagemIndex, mensagemIndex + bits);

                        // Substituir os últimos bits pelos bits da mensagem
                        pixelBin = pixelBin.substring(0, 8 - bits) + bitsToHide;

                        pixels[i] = parseInt(pixelBin, 2); // Alterando valor do pixel de R (grayscale)

                        mensagemIndex += bits;
                    }
                }

                ctx.putImageData(imgData, 0, 0);

                // Adicionar imagem esteganografada ao ZIP
                canvas.toBlob(function(blob) {
                    folder.file(`imagem_esteganografada_${index + 1}.png`, blob);
                    if (index === inputImages.files.length - 1) {
                        // Gerar o arquivo ZIP quando todas as imagens forem processadas
                        zip.generateAsync({ type: "blob" }).then(function(content) {
                            const link = document.createElement('a');
                            link.href = URL.createObjectURL(content);
                            link.download = "imagens_esteganografadas.zip";
                            link.click();
                        });
                    }
                });
            };
        };

        reader.readAsDataURL(file);
    });
}
