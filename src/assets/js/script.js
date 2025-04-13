/*  activação dos tooltips  */

const tooltipTriggerList = document.querySelectorAll('[data-bs-toggle="tooltip"]')
const tooltipList = [...tooltipTriggerList].map(tooltipTriggerEl => new bootstrap.Tooltip(tooltipTriggerEl))
let objectoTempo = null;


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
function carregarDashboard(cityUrl, id) {
    if (id && id.trim() !== "") {
        getWeatherDataId(id); // Busca o objeto salvo pela API com base no ID
    } else {
        getWeatherData(cityUrl); // Busca direto da OpenWeather se não houver ID
    }
}


async function getWeatherDataId(id) {
    try {
        const data = await buscarTempoID(id);
        console.log("Objecto:", data);

        // Atualizando a UI com os dados obtidos
        mostrarBandeira(data.pais);
        document.getElementById("actualNomeCidade").innerHTML = data.cidade;
        document.getElementById("actualHoraCidade").innerHTML = getLocalTime(data.timezone, data.dataHora);
        document.getElementById("actualDataCidade").innerHTML = new Date().toLocaleDateString("pt-BR", {
            weekday: "long", day: "numeric", month: "long", year: "numeric"
        });

        document.getElementById("actualTemCidade").innerHTML = `${Math.round(data.temperatura)}°C`;
        document.getElementById("actualTemIntervaloCidade").innerHTML = `${Math.round(data.temp_max)}°C / ${Math.round(data.temp_min)}°C`;
        document.getElementById("actualDescricaoCidade").innerHTML = `${data.descricao}`;

        const weatherIcon = data.iconeClima;
        document.getElementById("bgClima").style.backgroundImage = `url(src/assets/icon/imagens/${weatherIcon}.png)`;
        document.getElementById("actualIconCidade").src = `src/assets/icon/iconsClima/${weatherIcon}.svg`;

        // Detalhes do clima
        document.getElementById("detalTemperatura").textContent = `${Math.round(data.sensacao)}°C`;
        document.getElementById("detalProbabilidadeChuva").textContent = `${data.nuvens}%`;
        document.getElementById("detalVentoVeloc").textContent = `${data.vento} km/h`;
        document.getElementById("detalHumidade").textContent = `${data.humidade}%`;
        document.getElementById("detalPressao").textContent = `${data.pressao} hPa`;

        // Previsão de 5 dias
        const previsaoContainer = document.getElementById("previsaoTempo");
        previsaoContainer.innerHTML = "";

        data.previsoes.forEach(prev => {
            const card = document.createElement("div");
            card.classList.add("card-previsao");

            card.innerHTML = `
                <div class="text-center fw-bolder">
                    <span>${prev.data}</span>
                </div>
                <div>
                    <img src="src/assets/icon/iconsClima/${prev.iconeclima}.svg" alt="Previsão" class="img-fluid">
                </div>
                <div class="text-center">
                    <span class="d-block">${prev.descricao}</span>
                    <span>
                        <span class="fw-bold">${Math.round(prev.temp_min)}° / </span>
                        <span>${Math.round(prev.temp_max)}°</span>
                    </span>
                </div>
            `;

            previsaoContainer.appendChild(card);
        });

    } catch (error) {
        console.error("Erro ao carregar dados por ID:", error);
    }
}

async function getWeatherData(city) {
    if (!city || city   .trim() === "") {
        city = document.getElementById("cityInput").value;
    }
    const api_key = "7e69a7ca2dab1b9d722bf274d9f0d21c";
    const url = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${api_key}&lang=pt_br&units=metric`;
    const url5dias = `https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${api_key}&lang=pt_br&units=metric`;

    // Inicializando a variável objectoTempo
    objectoTempo = {
        cidade: city,
        pais: "",
        iconeClima: "",
        descricao: "",      
        temperatura: 0,
        temp_max: 0,
        temp_min: 0,
        sensacao: 0,
        humidade: 0,
        pressao: 0,
        vento: 0,
        nuvens: 0,
        timezone: 0,
        dataHora: Date.now(),
        longitude: 0,
        latitude: 0,
        previsoes: []
    };

    try {
        const response = await fetch(url);
        const data = await response.json();
        console.log("Tempo actual: ", data);

        if (data.cod !== 200) {
            throw new Error("Cidade inválida ou não encontrada");
        }

        // Preenchendo a variável objectoTempo com os dados do clima atual
        objectoTempo.cidade = data.name;
        objectoTempo.pais = data.sys.country;
        objectoTempo.iconeClima = data.weather[0].icon;
        objectoTempo.descricao = data.weather[0].description;
        objectoTempo.temperatura = data.main.temp;
        objectoTempo.temp_max = data.main.temp_max;
        objectoTempo.temp_min = data.main.temp_min;
        objectoTempo.sensacao = data.main.feels_like;
        objectoTempo.humidade = data.main.humidity;
        objectoTempo.pressao = data.main.pressure;
        objectoTempo.vento = data.wind.speed;
        objectoTempo.nuvens = data.clouds.all;
        objectoTempo.timezone = data.timezone;
        objectoTempo.longitude = data.coord.lon;
        objectoTempo.latitude = data.coord.lat;

        // Atualizando a UI com os dados obtidos
        mostrarBandeira(data.sys.country);
        document.getElementById("actualNomeCidade").innerHTML = data.name;
        document.getElementById("actualHoraCidade").innerHTML = getLocalTime(data.timezone, data.dt);
        document.getElementById("actualDataCidade").innerHTML = new Date().toLocaleDateString("pt-BR", { weekday: "long", day: "numeric", month: "long", year: "numeric" });
        document.getElementById("actualTemCidade").innerHTML = `${data.main.temp}°C`;
        document.getElementById("actualTemIntervaloCidade").innerHTML = `${data.main.temp_max}°C / ${data.main.temp_min}°C`;
        document.getElementById("actualDescricaoCidade").innerHTML = `${data.weather[0].description}`;
        const weatherIcon = data.weather[0].icon;
        document.getElementById("bgClima").style.backgroundImage = `url(src/assets/icon/imagens/${weatherIcon}.png)`;
        document.getElementById("actualIconCidade").src = `src/assets/icon/iconsClima/${weatherIcon}.svg`;
        document.getElementById("detalTemperatura").textContent = `${data.main.feels_like}°c`;
        document.getElementById("detalProbabilidadeChuva").textContent = `${data.clouds.all}%`;
        document.getElementById("detalVentoVeloc").textContent = `${data.wind.speed} km/h`;
        document.getElementById("detalHumidade").textContent = `${data.main.humidity}%`;
        document.getElementById("detalPressao").textContent = `${data.main.pressure} hPa`;

        // Notificação 
        if ("Notification" in window) {
            Notification.requestPermission().then(permission => {
                if (permission === "granted") {
                    new Notification("WeatherPrevision - Alerta de Clima!", {
                        body: `Agora em ${data.name}: ${data.main.temp}°C, ${data.weather[0].description}`,
                        icon: `src/assets/icon/iconsClima/${data.weather[0].icon}.svg`
                    });
                }
            });
        } else {
            alert("Este navegador não suporta notificações.");
        }

    } catch (error) {
        console.error("Erro ao buscar clima atual:", error);
        window.location.href = "error.html";
    }

    try {
        const response = await fetch(url5dias);
        const data5dias = await response.json();
        console.log("5 dias de previsão: ", data5dias);
        console.log("bojectoTempo", objectoTempo);


        const previsaoContainer = document.getElementById("previsaoTempo");
        previsaoContainer.innerHTML = "";

        // Preenchendo as previsões de 5 dias
        for (let i = 0; i < data5dias.list.length; i += 8) { // Pegando previsões a cada 24h
            const previsao = data5dias.list[i];
            const diaSemana = new Date((previsao.dt + 86400) * 1000).toLocaleDateString("pt-BR", { weekday: "short" });
            const tempMin = previsao.main.temp_min;
            const tempMax = previsao.main.temp_max;
            const descricao = previsao.weather[0].description;
            const weatherIcon = previsao.weather[0].icon;

            // Adicionando a previsão no array do objectoTempo
            objectoTempo.previsoes.push({
                data: diaSemana,
                temp_min: tempMin,
                temp_max: tempMax,
                descricao: descricao,
                iconeclima: weatherIcon
            });

            console.log("bojectoTempo", objectoTempo);


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

botaoWhats.addEventListener('click', async () => { // diaparar toast whatsapp
    // console.log("clicou no botao whatsapp ", await registarConsumir(objectoTempo));
    toastBootstrapWhatsApp.show()
})

document.getElementById("toastFormWhatsapp").addEventListener("submit", async (e) => {
    e.preventDefault(); 
    const numero = document.getElementById("whatsappNumber").value.trim();

    if (numero !== "") {

        // Registra os dados do clima e pega o ID retornado
        const id = await registarConsumir(objectoTempo);
        console.log("objecto recuperado: ", id);

        if (id) {
            const mensagem = encodeURIComponent(`*Partilha ALPP - WeatherPrevision*\nAcesse o Link para consultar o tempo, no instante compartilhado:\n${window.location.href}?id=${id}`);

            const link = `https://wa.me/${numero}?text=${mensagem}`;

            window.open(link, "_blank");

            const toast = bootstrap.Toast.getOrCreateInstance(document.getElementById('toastWhatsapp'));
            toast.hide();
            document.getElementById("toastFormWhatsapp").reset();
        } else {
            console.error("Erro ao registrar os dados do clima.");
        }
    } else {
        alert("Por favor, insira um número de telefone do WhatsApp.");
    }
});


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

// scrip salvar na bd
async function registarConsumir(objectoTempo) {
    let cabecario = {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(objectoTempo)
    };

    try {
        const resposta = await fetch("https://api-tempo-92mi.onrender.com/store", cabecario);
        const dados = await resposta.json();
        console.log("Salvo no banco! ", dados);
        return dados._id;
    } catch (erro) {
        console.log("Erro: " + erro);
    }
    return null;
}

async function buscarTempoID(id) {
    try {
        const resposta = await fetch("https://api-tempo-92mi.onrender.com/buscarID?id=" + id);
        const dados = await resposta.json();
        return dados;
    } catch (erro) {
        console.log("Erro: " + erro);
    }
    return null;
}
