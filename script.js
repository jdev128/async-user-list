/*
- OK INDICADOR DE CARGA
- OK FUNCION NUMERO ALEATORIO - obtenerNumeroAleatorio(max)
- CONSULTAR APIS REST (JSON)
    OK Recuperar conjunto de usuarios y mostrarlos en pantalla - MULTIPLE AWAIT + TRY CATCH
        https://jsonplaceholder.typicode.com/users
    OK LAMBDA -> PROMISE - obtenerAvatar(idUsuario) - Asignar una imagen Aleatoria como avatar a cada uno (ID Max: 1084, Factor: 1200)
        https://picsum.photos/id/237/50
        En caso de obtener error: Imagen por Defecto
    LAMBDA -> PROMISE - obtenerFrase(idUsuario) - Asignar una frase Aleatoria a cada uno
        https://api.quotable.io/quotes/random?tags=inspirational
        En caso de obtener error: Icono de Alerta (Hubo un error al obtener esta informacion)
    OK DECLARED FUNCTION -> PROMISE - usuarioEstaConectado(idUsuario)
        new Promise + setTimeout( () => Boolean aleatorio , 100 )
- CALLBACKS DECLARADOS
    OK procesarError(error, alertarUsuario) -> console.error( error.message ) + alert() solo si alertarUsuario
    ASYNC DECLARED FUNCTION - generarBadgesUsuarios(json) -> Array<HTMLElement>
- ASYNC LAMBDA + MULTIPLE AWAIT - generarBadgeUsuario {
    Promise.all (obtenerAvatar, obtenerFrase) - FETCH.THENx2 (+json) / CATCH / FINALLY
    usuarioEstaConectado
} -> HTMLElement */

const URL_USERS = "https://jsonplaceholder.typicode.com/users";
const URL_AVATARES = "https://picsum.photos/id/ID_IMAGEN/150";
const URL_FRASE = "https://api.quotable.io/quotes/random?tags=inspirational";

const TEST_USER = {
	id: 1,
	name: "Leanne Graham",
	username: "Bret",
	email: "Sincere@april.biz",
	address: {
		street: "Kulas Light",
		suite: "Apt. 556",
		city: "Gwenborough",
		zipcode: "92998-3874",
		geo: {
			lat: "-37.3159",
			lng: "81.1496",
		},
	},
	phone: "1-770-736-8031 x56442",
	website: "hildegard.org",
	company: {
		name: "Romaguera-Crona",
		catchPhrase: "Multi-layered client-server neural-net",
		bs: "harness real-time e-markets",
	},
};

/**
 * Devuelve un número aleatorio entre 0 y el máximo definido
 * @param {number} numeroMaximo El valor máximo a devolver. Opcional (Valor por defecto: 1)
 * @returns Un numero aleatorio entre 0 y numeroMaximo
 */
function obtenerNumeroAleatorio(numeroMaximo = 1) {
	return Math.round(Math.random() * numeroMaximo);
}

function procesarError(error, notificarUsuario = false) {
	console.groupCollapsed(`%c${error.message}`, "color: red");
	console.error(JSON.stringify(error.cause));
	if (notificarUsuario && error.cause?.codigo && error.cause?.endpoint) {
		alert(
			`Se presentó el código HTTP ${error.cause.codigo} al consultar la URL ${error.cause.endpoint}`
		);
	}
}

const consultarAPI = async (url, metodo = "GET") => {
	const idConsulta = obtenerNumeroAleatorio(999);

	const etiquetaTimer = `Demora #${idConsulta}`;
	console.time(etiquetaTimer);

	const response = await fetch(url, {
		method: metodo,
	});

	console.groupCollapsed(`Consulta API #${idConsulta}`);
	console.info("Endpoint:", metodo, url);
	console.info("Estado:", response.status, response.statusText);
	console.timeEnd(etiquetaTimer);
	console.groupEnd();

	if (!response.ok) {
		throw new Error("Error HTTP al consultar API", {
			cause: {
				endpoint: url,
				codigo: response.status,
			},
		});
	}

	return response;
};

async function obtenerUsuarios() {
	try {
		const response = await consultarAPI(URL_USERS);
		const usuarios = await response.json();
		return usuarios;
	} catch (error) {
		procesarError(error, true);
	}
}

async function obtenerURLAvatar(idUsuario) {
	try {
		let avatarURL = URL_AVATARES.replace(
			"ID_IMAGEN",
			obtenerNumeroAleatorio(1300)
		);
		const response = await consultarAPI(avatarURL);
		console.info(`Foto usuario #${idUsuario}: ${response.url}`);
		return response.url;
	} catch (error) {
		procesarError(error);
		return "assets/user-pic.svg";
	}
}

async function obtenerFrase(idUsuario) {
	try {
		const response = await consultarAPI(URL_FRASE);
		const body = await response.json();
		const frase = body[0].content + " (" + body[0].author + ").";
		console.info(`Frase usuario #${idUsuario}: ${frase}`);
		return frase;
	} catch (error) {
		procesarError(error);
	}
}

/**
 * Obtiene el estado de conexión actual de un usuario.
 * @param {number} idUsuario El id del usuario a consultar.
 * @returns Una promesa que resuelve true si el usuario está conectado o false en caso contrario.
 */
function usuarioEstaConectado(idUsuario) {
	return new Promise((res) => {
		const etiquetaTimer = `Demora #${idUsuario}`;
		console.time(etiquetaTimer);

		setTimeout(() => {
			const conectado = [true, false][obtenerNumeroAleatorio()];

			console.info(
				`Estado de conexion usuario #${idUsuario}: ${
					conectado ? "conectado" : "fuera de línea"
				}`
			);
			console.timeEnd(etiquetaTimer);

			res(conectado);
		}, 400);
	});
}

/**
 * Genera una nueva tarjeta para un usuario
 * @param {string} nombre El nombre del usuario
 * @param {string} URLavatar La url donde buscar la foto de perfil
 * @param {string} frase La frase favorita del usuario
 * @param {boolean} conectado Si el usuario se encuentra conectado o no
 * @returns Un HTMLElement conteniendo la tarjeta
 */
function crearTarjeta(nombre, ciudad, URLavatar, frase, conectado) {
	const TARJETA = document.createElement("div");
	TARJETA.classList.add("user-card");

	const AVATAR = document.createElement("img");
	AVATAR.classList.add("user-avatar");
	AVATAR.src = URLavatar;

	const CUERPO_TARJETA = document.createElement("div");
	CUERPO_TARJETA.classList.add("card-body");

	const ESTADO_CONEXION = document.createElement("span");
	ESTADO_CONEXION.classList.add("online-status");
	ESTADO_CONEXION.classList.add(conectado ? "online" : "offline");

	const NOMBRE = document.createElement("h4");
	NOMBRE.classList.add("user-name");
	NOMBRE.textContent = nombre;

	const CIUDAD = document.createElement("span");
	CIUDAD.classList.add("user-city");
	CIUDAD.textContent = " - " + ciudad;

	const FRASE = document.createElement("p");
	FRASE.className = "user-phrase";
	FRASE.textContent = frase;
	FRASE.title = frase;

	CUERPO_TARJETA.appendChild(ESTADO_CONEXION);
	CUERPO_TARJETA.appendChild(NOMBRE);
	CUERPO_TARJETA.appendChild(CIUDAD);
	CUERPO_TARJETA.appendChild(FRASE);

	TARJETA.appendChild(AVATAR);
	TARJETA.appendChild(CUERPO_TARJETA);

	return TARJETA;
}

function ocultarSpinner() {
	document.getElementById("spinner").style.display = "none";
}

const obtenerTarjetaUsuario = (usuario) => {
	return Promise.allSettled([
		obtenerFrase(usuario.id),
		obtenerURLAvatar(usuario.id),
		usuarioEstaConectado(usuario.id),
	]).then((result) => {
		let frase = result[0].status === "fulfilled" ? result[0].value : "-";
		let foto = result[1].value;
		let conectado = result[2].value;
		return crearTarjeta(
			usuario.name,
			usuario.address.city,
			foto,
			frase,
			conectado
		);
	});
};

document.addEventListener("DOMContentLoaded", () => {
	obtenerUsuarios().then((usuarios) => {
		const promesas = usuarios.map((usuario) =>
			obtenerTarjetaUsuario(usuario)
		);
		Promise.allSettled(promesas).then((resultados) => {
			resultados.forEach((resultado) => {
				if (resultado.status === "fulfilled") {
					document
						.querySelector("#users-container")
						.appendChild(resultado.value);
				}
			});
			ocultarSpinner();
		});
	});
});
