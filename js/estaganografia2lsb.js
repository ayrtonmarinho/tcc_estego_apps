document.getElementById('imageLoader').addEventListener('change', handleImage, false);
document.getElementById('imageLoaderDecode').addEventListener('change', handleImageDecode, false);
const canvas = document.getElementById('imageCanvas');
const ctx = canvas.getContext('2d');

function handleImage(e) {
    const reader = new FileReader();
    reader.onload = function(event) {
        const img = new Image();
        img.onload = function() {
            ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        };
        img.src = event.target.result;
    };
    reader.readAsDataURL(e.target.files[0]);
}

function handleImageDecode(e) {
    const reader = new FileReader();
    reader.onload = function(event) {
        const img = new Image();
        img.onload = function() {
            ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
            decodeMessage(); // Decodifica a mensagem logo após carregar a imagem
        };
        img.src = event.target.result;
    };
    reader.readAsDataURL(e.target.files[0]);
}

function encodeMessage() {
    const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imgData.data;
    const message = document.getElementById('message').value;
    const binaryMessage = textToBinary(message);
    
    // Usando dois bits para esconder a mensagem
    for (let i = 0; i < binaryMessage.length; i += 2) {
        const pixelIndex = Math.floor(i / 2) * 4;
        const bitsToHide = binaryMessage.substring(i, i + 2).padEnd(2, '0');

        data[pixelIndex] = (data[pixelIndex] & 0xFC) | parseInt(bitsToHide, 2);  // Esconde 2 bits no pixel
    }

    ctx.putImageData(imgData, 0, 0);
    alert("Mensagem escondida na imagem!");
    document.getElementById('saveImageButton').style.display = 'inline'; // Mostra o botão "Salvar Imagem"
}

function decodeMessage() {
    const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imgData.data;
    let binaryMessage = '';

    for (let i = 0; i < data.length; i += 4) {
        const hiddenBits = (data[i] & 0x03).toString(2).padStart(2, '0'); // Extrai os 2 bits menos significativos
        binaryMessage += hiddenBits;
    }

    const decodedMessage = binaryToText(binaryMessage);
    alert("Mensagem revelada: " + decodedMessage);
}

function saveImage() {
    const link = document.createElement('a');
    link.href = canvas.toDataURL('image/png');
    link.download = 'imagem_esteganografada.png';
    link.click();
}

function textToBinary(text) {
    return text.split('').map(char => char.charCodeAt(0).toString(2).padStart(8, '0')).join('');
}

function binaryToText(binary) {
    let text = '';
    for (let i = 0; i < binary.length; i += 8) {
        const byte = binary.slice(i, i + 8);
        text += String.fromCharCode(parseInt(byte, 2));
    }
    return text.replace(/\0/g, ''); // Remove qualquer caractere nulo
}
