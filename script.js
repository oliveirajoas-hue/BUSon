// 1. Inicialização do Mapa (MapLibre GL)
document.addEventListener("DOMContentLoaded", () => {
  const map = new maplibregl.Map({
    container: 'map',
    style: 'https://basemaps.cartocdn.com/gl/voyager-gl-style/style.json', // Estilo do mapa
    center: [-37.4268, -10.6868], // Exemplo de coordenadas iniciais (região)
    zoom: 13
  });

  // 2. Controle de Geolocalização e Rastreamento do Usuário (Passageiro)
  const recenterBtn = document.getElementById('recenter');
  if (recenterBtn) {
    recenterBtn.addEventListener('click', () => {
      // Lógica para centralizar o mapa na localização atual do usuário
      navigator.geolocation.getCurrentPosition(position => {
        const { latitude, longitude } = position.coords;
        map.flyTo({ center: [longitude, latitude], zoom: 15 });
      });
    });
  }

  // 3. Controle de Abas e Painel Inferior (Sheet)
  const segButtons = document.querySelectorAll('.seg button');
  segButtons.forEach(btn => {
    btn.addEventListener('click', (e) => {
      // Alterna o estado ativo das abas (Passageiro, Motorista, Admin)
      segButtons.forEach(b => b.removeAttribute('aria-pressed'));
      e.target.setAttribute('aria-pressed', 'true');
      
      // Exibe/oculta seções correspondentes (#pax, #login, #drv, #adm)
    });
  });

  // 4. Módulo do Motorista: Envio de Posição via GPS em Tempo Real
  const goBtn = document.getElementById('go');
  let watchId = null;
  let sentCount = 0;

  if (goBtn) {
    goBtn.addEventListener('click', () => {
      const isRunning = goBtn.classList.toggle('stop');
      if (isRunning) {
        goBtn.textContent = 'Parar rota';
        // Mantém a tela acesa se a API WakeLock for suportada
        if ('wakeLock' in navigator) {
          navigator.wakeLock.request('screen').catch(err => console.log(err));
        }
        
        // Inicia o rastreamento contínuo da posição do motorista
        watchId = navigator.geolocation.watchPosition(position => {
          const { latitude, longitude } = position.coords;
          sentCount++;
          document.getElementById('sent').textContent = sentCount;
          
          // Aqui entraria a rotina de envio das coordenadas para o Firebase
        }, error => {
          console.error("Erro no GPS:", error);
        }, { enableHighAccuracy: true, maximumAge: 0 });
        
      } else {
        goBtn.textContent = 'Iniciar rota';
        if (watchId !== null) {
          navigator.geolocation.clearWatch(watchId);
          watchId = null;
        }
      }
    });
  }

  // 5. Integração com Firebase (Autenticação e Dados em Tempo Real)
  // Configuração de ouvintes (onSnapshot / database listeners) para atualizar
  // a posição das vans/ônibus no mapa para os passageiros em tempo real.
});
