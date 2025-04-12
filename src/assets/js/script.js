/*  activação dos tooltips  */

const tooltipTriggerList = document.querySelectorAll('[data-bs-toggle="tooltip"]')
const tooltipList = [...tooltipTriggerList].map(tooltipTriggerEl => new bootstrap.Tooltip(tooltipTriggerEl))

/* iniciar o mapa */
function initMap(latitude, longitude) {
    // Inicializa o mapa
    const map = L.map('map').setView([latitude, longitude], 13); // 13 é o nível de zoom

    // Adiciona o mapa base (OpenStreetMap gratuito)
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors'
    }).addTo(map);

    // Adiciona um marcador no local
    L.marker([latitude, longitude]).addTo(map)
        .bindPopup('Localização atual')
        .openPopup();

}

/* scripts da dashboard */
function carregarDashboard(cityUrl) {
    getWeatherData(cityUrl);
}

async function getWeatherData(city) {
    if (!city || city.trim() === "") {
        city = document.getElementById("cityInput").value
    }
    const api_key = "7e69a7ca2dab1b9d722bf274d9f0d21c";
    const url = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${api_key}&lang=pt_br&units=metric`;
    const url5dias = `https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${api_key}&lang=pt_br&units=metric`;

    try {
        const response = await fetch(url);
        const data = await response.json();
        console.log("Tempo actual: ", data);

        if (data.cod !== 200) {
            throw new Error("Cidade inválida ou não encontrada");
        }

        lon = data.coord.lon;
        lat = data.coord.lat;

        console.log("lon= ", lon, " lat= ", lat);
        console.log("Dados retornadods: ", data);
        mostrarBandeira(data.sys.country);

        document.getElementById("actualNomeCidade").innerHTML = data.name;
        document.getElementById("actualHoraCidade").innerHTML = getLocalTime(data.timezone, data.dt);
        document.getElementById("actualDataCidade").innerHTML = new Date().toLocaleDateString("pt-BR", { weekday: "long", day: "numeric", month: "long", year: "numeric" });
        document.getElementById("actualTemCidade").innerHTML = `${data.main.temp}°C`;
        document.getElementById("actualTemIntervaloCidade").innerHTML = `${data.main.temp_max}°C / ${data.main.temp_min}°C`
        document.getElementById("actualDescricaoCidade").innerHTML = `${data.weather[0].description}`;
        const weatherIcon = data.weather[0].icon;

        document.getElementById("bgClima").style.backgroundImage = `url(src/assets/icon/imagens/${weatherIcon}.png)`;
        document.getElementById("actualIconCidade").src = `src/assets/icon/iconsClima/${weatherIcon}.svg`;

        document.getElementById("detalTemperatura").textContent = `${data.main.feels_like}°c`;
        document.getElementById("detalProbabilidadeChuva").textContent = `${data.clouds.all}%`;
        document.getElementById("detalVentoVeloc").textContent = `${data.wind.speed} km/h`;
        document.getElementById("detalHumidade").textContent = `${data.main.humidity}%`;
        document.getElementById("detalPressao").textContent = `${data.main.pressure} hPa`;

        console.log(getLocalTime(data.timezone, data.dt));

    } catch (error) {

        console.error("Erro ao buscar clima atual:", error);
        window.location.href = "error.html";

    }

    try {
        const response = await fetch(url5dias);
        const data = await response.json();
        console.log("5 dias de previsão: ", data);

        const previsaoContainer = document.getElementById("previsaoTempo");
        previsaoContainer.innerHTML = "";

        for (let i = 0; i < data.list.length; i += 8) { // Pegando previsões a cada 24h
            const previsao = data.list[i];
            const diaSemana = new Date((previsao.dt + 86400) * 1000).toLocaleDateString("pt-BR", { weekday: "short" });
            const tempMin = previsao.main.temp_min;
            const tempMax = previsao.main.temp_max;
            const descricao = previsao.weather[0].description;
            const weatherIcon = previsao.weather[0].icon;
            const cardHTML = `

                <div class="card-previsao">
                    <div class="text-center fw-bolder">
                        <span>${diaSemana}</span>
                    </div>
                    <div>
                        <img src="src/assets/icon/iconsClima/${weatherIcon}.svg" alt="${descricao}" class="img-fluid">
                    </div>
                    <div class="text-center"> 
                        <span class="d-block ">${descricao}</span>
                        <span>
                            <span class="fw-bold">${tempMin}ºC / </span>
                            <span>${tempMax}ºC</span>
                        </span>
                    </div>
                </div>

            `;
            previsaoContainer.innerHTML += cardHTML;
        }

    } catch (error) {

        console.error("Erro ao obter previsão de 5 dias:", error);
        window.location.href = "error.html";

    }
}

function mostrarBandeira(country) {
    const flagUrl = `https://flagsapi.com/${country}/flat/64.png`;
    document.getElementById("imgCountry").src = flagUrl;
    document.getElementById("imgCountry").alt = `Bandeira de ${country}`;
}

function getLocalTime(timezoneOffset, dt) {
    const localTime = new Date((dt + timezoneOffset) * 1000);
    return localTime.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
}

/*  toast div Whatsapp */
const botaoWhats = document.getElementById('toastBtnWhatsapp')
const toastBootstrapWhatsApp = bootstrap.Toast.getOrCreateInstance(document.getElementById('toastWhatsapp'))

botaoWhats.addEventListener('click', () => { // diaparar toast whatsapp
    toastBootstrapWhatsApp.show()
})

document.getElementById("toastFormWhatsapp").addEventListener("submit", (e) => { // partilhar link whatsapp
    e.preventDefault();
    const numero = document.getElementById("whatsappNumber").value.trim();
    if (numero !== "") {
        const mensagem = encodeURIComponent(`*Partilha ALPP - WeatherPrevision*\nAcesse o Link para consultar o tempo, no instante compartilhado:\n${window.location.href}`);
        const link = `https://wa.me/${numero}?text=${mensagem}`;
        // Abre o link do WhatsApp automaticamente
        window.open(link, "_blank");
        // esconder o toast
        bootstrap.Toast.getOrCreateInstance(document.getElementById('toastWhatsapp')).hide();
        document.getElementById("toastFormWhatsapp").reset();
    }
});

/* toast Alert clima */
const toastBootstrapAlert = bootstrap.Toast.getOrCreateInstance(document.getElementById('toastAlert'));
toastBootstrapAlert.show()

/* abrir mapa */
document.getElementById("mapIcon").addEventListener("click", () => {
    console.log("icone mapa");
    if (lat && lon) {
        window.location.href = `map.html?lat=${lat}&lon=${lon}`;
    } else {
        document.getElementById("msgAlert").innerHTML = "Por favor, busque uma cidade primeiro para ver no mapa.";
        toastBootstrapAlert.show()
    }
});
