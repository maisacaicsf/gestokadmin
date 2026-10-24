/* =====================================================
   GESTOK - PAINEL ADMINISTRATIVO
   LOGIN + LOJAS + NOTIFICAÇÕES + SUPORTE
===================================================== */

const auth = firebase.auth();
const db = firebase.firestore();


/* =====================================================
   LOGIN
===================================================== */

const loginView =
    document.getElementById("loginView");

const adminView =
    document.getElementById("adminView");

const loginForm =
    document.getElementById("loginForm");

const loginEmail =
    document.getElementById("loginEmail");

const loginSenha =
    document.getElementById("loginSenha");

const btnLogin =
    document.getElementById("btnLogin");

const loginStatus =
    document.getElementById("loginStatus");


/* =====================================================
   ADMIN
===================================================== */

const adminNome =
    document.getElementById("adminNome");

const adminEmail =
    document.getElementById("adminEmail");

const btnSair =
    document.getElementById("btnSair");


/* =====================================================
   LOJAS
===================================================== */

const listaLojas =
    document.getElementById("listaLojas");

const campoBusca =
    document.getElementById("campoBusca");

const filtroStatus =
    document.getElementById("filtroStatus");

const btnAtualizar =
    document.getElementById("btnAtualizar");

const statusCarregamento =
    document.getElementById("statusCarregamento");


/* =====================================================
   MODAL
===================================================== */

const modalLoja =
    document.getElementById("modalLoja");

const fecharModal =
    document.getElementById("fecharModal");
const excluirContaBtn =
    document.getElementById(
        "excluirContaBtn"
    );

let lojaSelecionadaParaExclusao =
    null;


/* =====================================================
   NOTIFICAÇÕES
===================================================== */

const formNotificacao =
    document.getElementById("formNotificacao");

const btnLimparNotificacoes =
    document.getElementById("btnLimparNotificacoes");

const tituloNotificacao =
    document.getElementById("tituloNotificacao");

const tipoNotificacao =
    document.getElementById("tipoNotificacao");

const mensagemNotificacao =
    document.getElementById("mensagemNotificacao");

const btnEnviarNotificacao =
    document.getElementById("btnEnviarNotificacao");

const statusEnvio =
    document.getElementById("statusEnvio");

const contadorMensagem =
    document.getElementById("contadorMensagem");

const listaNotificacoes =
    document.getElementById("listaNotificacoes");

const statusNotificacoes =
    document.getElementById("statusNotificacoes");

const contadorNotificacoes =
    document.getElementById("contadorNotificacoes");

const totalNotificacoes =
    document.getElementById("totalNotificacoes");

const notificacoesTodas =
    document.getElementById("notificacoesTodas");

const notificacoesAtivas =
    document.getElementById("notificacoesAtivas");

const ultimaNotificacao =
    document.getElementById("ultimaNotificacao");


/* =====================================================
   SUPORTE
===================================================== */

const listaChamadosAdmin =
    document.getElementById("listaChamadosAdmin");

const campoBuscaChamados =
    document.getElementById("campoBuscaChamados");

const filtroStatusChamados =
    document.getElementById("filtroStatusChamados");

const statusChamadosAdmin =
    document.getElementById("statusChamadosAdmin");

const totalChamadosAdmin =
    document.getElementById("totalChamadosAdmin");

const chamadosAbertosAdmin =
    document.getElementById("chamadosAbertosAdmin");

const chamadosAtendimentoAdmin =
    document.getElementById("chamadosAtendimentoAdmin");

const chamadosResolvidosAdmin =
    document.getElementById("chamadosResolvidosAdmin");


/* =====================================================
   CACHE
===================================================== */

let lojasCache = [];

let notificacoesCache = [];

let chamadosCache = [];

/* Chamados abertos manualmente no painel */
const chamadosExpandidosAdmin = new Set();


/* =====================================================
   UTILITÁRIOS
===================================================== */

function escaparHtml(valor) {

    return String(valor ?? "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");

}


function formatarData(data) {

    if (!data) {
        return "—";
    }

    let valor;

    try {

        if (
            data &&
            typeof data.toDate === "function"
        ) {

            valor = data.toDate();

        } else if (
            data instanceof Date
        ) {

            valor = data;

        } else {

            valor = new Date(data);

        }

    } catch (erro) {

        return "—";

    }

    if (
        !valor ||
        Number.isNaN(valor.getTime())
    ) {

        return "—";

    }

    return valor.toLocaleString(
        "pt-BR",
        {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit"
        }
    );

}


function obterTimestamp(data) {

    if (!data) {
        return 0;
    }

    try {

        if (
            data &&
            typeof data.toDate === "function"
        ) {

            return data.toDate().getTime();

        }

        if (
            data instanceof Date
        ) {

            return data.getTime();

        }

        const dataConvertida =
            new Date(data);

        if (
            Number.isNaN(
                dataConvertida.getTime()
            )
        ) {

            return 0;

        }

        return dataConvertida.getTime();

    } catch (erro) {

        return 0;

    }

}


function obterStatusLoja(loja) {

    const assinatura =
        loja?.assinatura ||
        {};

    const ativa =
        assinatura.ativa === true ||
        loja?.ativa === true;

    if (ativa) {
        return "ativa";
    }

    const pagamento =
        String(
            assinatura.status ||
            loja?.status ||
            ""
        )
        .toLowerCase();

    if (
        pagamento.includes("pagamento") ||
        pagamento.includes("aguard") ||
        pagamento.includes("pendente")
    ) {

        return "pagamento";

    }

    return "inativa";
}


function textoStatusLoja(loja) {

    const status =
        obterStatusLoja(loja);

    if (status === "ativa") {
        return "Ativa";
    }

    if (status === "pagamento") {
        return "Aguardando pagamento";
    }

    return "Inativa";
}


/* =====================================================
   STATUS DOS CHAMADOS
===================================================== */

function normalizarStatusChamado(status) {

    return String(
        status || "Aberto"
    )
        .trim()
        .toLowerCase();

}


function textoStatusChamado(status) {

    const normalizado =
        normalizarStatusChamado(
            status
        );

    if (
        normalizado ===
        "em atendimento"
    ) {

        return "Em atendimento";

    }

    if (
        normalizado ===
        "em análise" ||
        normalizado ===
        "em analise"
    ) {

        return "Em análise";

    }

    if (
        normalizado ===
        "resolvido"
    ) {

        return "Resolvido";

    }

    if (
        normalizado ===
        "fechado"
    ) {

        return "Fechado";

    }

    return "Aberto";

}


function classeStatusChamado(status) {

    const normalizado =
        normalizarStatusChamado(
            status
        );

    if (
        normalizado ===
        "em atendimento"
    ) {

        return "atendimento";

    }

    if (
        normalizado ===
        "em análise" ||
        normalizado ===
        "em analise"
    ) {

        return "analise";

    }

    if (
        normalizado ===
        "resolvido"
    ) {

        return "resolvido";

    }

    if (
        normalizado ===
        "fechado"
    ) {

        return "fechado";

    }

    return "aberto";

}


/* =====================================================
   MOSTRAR / ESCONDER LOGIN
===================================================== */

function mostrarLogin() {

    if (loginView) {
        loginView.hidden = false;
    }

    if (adminView) {
        adminView.hidden = true;
    }

}


function mostrarPainelAdmin() {

    if (loginView) {
        loginView.hidden = true;
    }

    if (adminView) {
        adminView.hidden = false;
    }

    carregarLojas();

    carregarNotificacoes();

    carregarChamadosAdmin();

}


/* =====================================================
   VALIDAR ADMIN
===================================================== */

async function validarAdministrador(usuario) {

    if (!usuario) {
        return false;
    }

    try {

        const snapshot =
            await db
                .collection("admins")
                .doc(usuario.uid)
                .get();

        if (!snapshot.exists) {

            return false;

        }

        const dados =
            snapshot.data() || {};

        if (
            dados.ativo === false
        ) {

            return false;

        }

        if (adminNome) {

            adminNome.textContent =
                dados.nome ||
                "Administrador";

        }

        if (adminEmail) {

            adminEmail.textContent =
                dados.email ||
                usuario.email ||
                "—";

        }

        return true;

    } catch (erro) {

        console.error(
            "Erro ao validar administrador:",
            erro
        );

        return false;

    }

}


/* =====================================================
   LOGIN
===================================================== */

if (loginForm) {

    loginForm.addEventListener(
        "submit",
        async function (event) {

            event.preventDefault();

            const email =
                loginEmail.value.trim();

            const senha =
                loginSenha.value;

            if (
                !email ||
                !senha
            ) {

                loginStatus.textContent =
                    "Preencha e-mail e senha.";

                loginStatus.className =
                    "login-status error";

                return;

            }

            btnLogin.disabled = true;

            btnLogin.textContent =
                "Entrando...";

            loginStatus.textContent =
                "";

            loginStatus.className =
                "login-status";

            try {

                const resultado =
                    await auth
                        .signInWithEmailAndPassword(
                            email,
                            senha
                        );

                const autorizado =
                    await validarAdministrador(
                        resultado.user
                    );

                if (!autorizado) {

                    await auth.signOut();

                    throw new Error(
                        "USUARIO_SEM_ACESSO"
                    );

                }

                loginForm.reset();

                mostrarPainelAdmin();

            } catch (erro) {

                console.error(
                    "Erro no login:",
                    erro
                );

                let mensagem =
                    "Não foi possível entrar.";

                if (
                    erro.code ===
                    "auth/invalid-credential"
                ) {

                    mensagem =
                        "E-mail ou senha incorretos.";

                }

                if (
                    erro.code ===
                    "auth/invalid-email"
                ) {

                    mensagem =
                        "O e-mail informado é inválido.";

                }

                if (
                    erro.code ===
                    "auth/too-many-requests"
                ) {

                    mensagem =
                        "Muitas tentativas. Aguarde alguns instantes.";

                }

                if (
                    erro.message ===
                    "USUARIO_SEM_ACESSO"
                ) {

                    mensagem =
                        "Este usuário não possui acesso ao painel administrativo.";

                }

                loginStatus.textContent =
                    mensagem;

                loginStatus.className =
                    "login-status error";

            } finally {

                btnLogin.disabled =
                    false;

                btnLogin.textContent =
                    "Entrar";

            }

        }
    );

}


/* =====================================================
   LOGOUT
===================================================== */

if (btnSair) {

    btnSair.addEventListener(
        "click",
        async function () {

            try {

                await auth.signOut();

            } catch (erro) {

                console.error(
                    "Erro ao sair:",
                    erro
                );

            }

        }
    );

}


/* =====================================================
   AUTENTICAÇÃO
===================================================== */

auth.onAuthStateChanged(
    async function (usuario) {

        if (!usuario) {

            mostrarLogin();

            return;

        }

        const autorizado =
            await validarAdministrador(
                usuario
            );

        if (!autorizado) {

            await auth.signOut();

            if (loginStatus) {

                loginStatus.textContent =
                    "Este usuário não possui acesso ao painel administrativo.";

                loginStatus.className =
                    "login-status error";

            }

            mostrarLogin();

            return;

        }

        mostrarPainelAdmin();

    }
);


/* =====================================================
   CARREGAR USUÁRIO DA LOJA
===================================================== */

async function carregarUsuarioDaLoja(
    lojaDoc,
    loja
) {

    try {

        const donoUid =
            loja.donoUid ||
            loja.uid ||
            null;

        if (!donoUid) {

            return "—";

        }

        const usuarioSnapshot =
            await lojaDoc.ref
                .collection("usuarios")
                .doc(donoUid)
                .get();

        if (!usuarioSnapshot.exists) {

            return "—";

        }

        const usuario =
            usuarioSnapshot.data() || {};

        return (
            usuario.usuario ||
            usuario.nomeUsuario ||
            "—"
        );

    } catch (erro) {

        console.error(
            "Erro ao carregar usuário:",
            erro
        );

        return "—";

    }

}


/* =====================================================
   CARREGAR LOJAS
===================================================== */

async function carregarLojas() {

    if (!listaLojas) {
        return;
    }

    statusCarregamento.textContent =
        "Carregando...";

    listaLojas.innerHTML = `
        <tr>
            <td
                colspan="7"
                class="empty-cell"
            >
                Carregando lojas...
            </td>
        </tr>
    `;

    try {

        const lojasSnapshot =
            await db
                .collection("lojas")
                .get();

        const lojas = [];

        for (
            const documento
            of lojasSnapshot.docs
        ) {

            const dados =
                documento.data() || {};

            let quantidadeProdutos = 0;

            let quantidadeUsuarios = 0;

            let quantidadeMovimentacoes = 0;

            try {

                const resultado =
                    await Promise.all([

                        documento.ref
                            .collection("produtos")
                            .get(),

                        documento.ref
                            .collection("usuarios")
                            .get(),

                        documento.ref
                            .collection("movimentacoes")
                            .get()

                    ]);

                quantidadeProdutos =
                    resultado[0].size;

                quantidadeUsuarios =
                    resultado[1].size;

                quantidadeMovimentacoes =
                    resultado[2].size;

            } catch (erroInterno) {

                console.error(
                    "Erro ao carregar subcoleções da loja:",
                    documento.id,
                    erroInterno
                );

            }

            const usuario =
                await carregarUsuarioDaLoja(
                    documento,
                    dados
                );

            lojas.push({

                id:
                    documento.id,

                nome:
                    dados.nome ||
                    "Sem nome",

                codigo:
                    dados.codigo ||
                    dados.codigoLoja ||
                    "—",

                email:
                    dados.email ||
                    "—",

                donoUid:
                    dados.donoUid ||
                    null,

                usuario:
                    usuario,

                assinatura:
                    dados.assinatura ||
                    {},

                ativa:
                    dados.ativa,

                status:
                    dados.status,

                plano:
                    dados.plano,

                criadaEm:
                    dados.criadaEm,

                quantidadeProdutos,
                quantidadeUsuarios,
                quantidadeMovimentacoes

            });

        }

        lojasCache = lojas;

        atualizarResumoLojas();

        renderizarLojas();

        statusCarregamento.textContent =
            `${lojas.length} ${
                lojas.length === 1
                    ? "loja encontrada"
                    : "lojas encontradas"
            }.`;

    } catch (erro) {

        console.error(
            "Erro ao carregar lojas:",
            erro
        );

        lojasCache = [];

        atualizarResumoLojas();

        listaLojas.innerHTML = `
            <tr>
                <td
                    colspan="7"
                    class="empty-cell error-cell"
                >
                    Não foi possível carregar as lojas.
                </td>
            </tr>
        `;

        statusCarregamento.textContent =
            "Erro ao carregar.";

    }

}


/* =====================================================
   RESUMO DAS LOJAS
===================================================== */

function atualizarResumoLojas() {

    const total =
        lojasCache.length;

    const ativas =
        lojasCache.filter(
            function (loja) {

                return (
                    obterStatusLoja(loja) ===
                    "ativa"
                );

            }
        ).length;

    const pagamento =
        lojasCache.filter(
            function (loja) {

                return (
                    obterStatusLoja(loja) ===
                    "pagamento"
                );

            }
        ).length;

    const produtos =
        lojasCache.reduce(
            function (totalAtual, loja) {

                return (
                    totalAtual +
                    Number(
                        loja.quantidadeProdutos ||
                        0
                    )
                );

            },
            0
        );

    const elementoTotal =
        document.getElementById(
            "totalLojas"
        );

    const elementoAtivas =
        document.getElementById(
            "lojasAtivas"
        );

    const elementoPagamento =
        document.getElementById(
            "lojasPagamento"
        );

    const elementoProdutos =
        document.getElementById(
            "totalProdutos"
        );

    if (elementoTotal) {
        elementoTotal.textContent =
            total;
    }

    if (elementoAtivas) {
        elementoAtivas.textContent =
            ativas;
    }

    if (elementoPagamento) {
        elementoPagamento.textContent =
            pagamento;
    }

    if (elementoProdutos) {
        elementoProdutos.textContent =
            produtos;
    }

}


/* =====================================================
   RENDERIZAR LOJAS
===================================================== */

function renderizarLojas() {

    if (!listaLojas) {
        return;
    }

    const busca =
        String(
            campoBusca?.value ||
            ""
        )
        .trim()
        .toLowerCase();

    const filtro =
        filtroStatus?.value ||
        "";

    const filtradas =
        lojasCache.filter(
            function (loja) {

                const texto =
                    [

                        loja.nome,

                        loja.codigo,

                        loja.email,

                        loja.usuario

                    ]
                    .filter(Boolean)
                    .join(" ")
                    .toLowerCase();

                const correspondeBusca =
                    !busca ||
                    texto.includes(
                        busca
                    );

                const correspondeStatus =
                    !filtro ||
                    obterStatusLoja(
                        loja
                    ) === filtro;

                return (
                    correspondeBusca &&
                    correspondeStatus
                );

            }
        );

    if (
        !filtradas.length
    ) {

        listaLojas.innerHTML = `
            <tr>
                <td
                    colspan="7"
                    class="empty-cell"
                >
                    Nenhuma loja encontrada.
                </td>
            </tr>
        `;

        return;

    }

    listaLojas.innerHTML =
        filtradas
            .map(
                function (loja) {

                    const status =
                        obterStatusLoja(
                            loja
                        );

                    return `
                        <tr>

                            <td>

                                <strong>
                                    ${escaparHtml(
                                        loja.nome
                                    )}
                                </strong>

                            </td>


                            <td>

                                ${escaparHtml(
                                    loja.codigo
                                )}

                            </td>


                            <td>

                                ${escaparHtml(
                                    loja.usuario
                                )}

                            </td>


                            <td>

                                ${escaparHtml(
                                    loja.email
                                )}

                            </td>


                            <td>

                                ${Number(
                                    loja.quantidadeProdutos ||
                                    0
                                )}

                            </td>


                            <td>

                                <span
                                    class="status-pill ${status}"
                                >
                                    ${textoStatusLoja(
                                        loja
                                    )}
                                </span>

                            </td>


                            <td>

                                <button
                                    type="button"
                                    class="view-button"
                                    data-loja-id="${loja.id}"
                                >
                                    Ver
                                </button>

                            </td>

                        </tr>
                    `;

                }
            )
            .join("");

}


/* =====================================================
   CLIQUE NO BOTÃO "VER"
===================================================== */

if (listaLojas) {

    listaLojas.addEventListener(
        "click",
        function (event) {

            const botao =
                event.target.closest(
                    ".view-button"
                );

            if (!botao) {
                return;
            }

            const lojaId =
                botao.getAttribute(
                    "data-loja-id"
                );

            if (!lojaId) {

                console.error(
                    "Botão sem ID da loja."
                );

                return;

            }

            abrirModalLoja(
                lojaId
            );
            
        }
    );

}


/* =====================================================
   FILTROS LOJAS
===================================================== */

if (campoBusca) {

    campoBusca.addEventListener(
        "input",
        function () {

            renderizarLojas();

        }
    );

}


if (filtroStatus) {

    filtroStatus.addEventListener(
        "change",
        function () {

            renderizarLojas();

        }
    );

}


if (btnAtualizar) {

    btnAtualizar.addEventListener(
        "click",
        function () {

            carregarLojas();

        }
    );

}


/* =====================================================
   ABRIR MODAL DA LOJA
===================================================== */

function abrirModalLoja(id) {

    const loja =
        lojasCache.find(
            function (item) {

                return (
                    String(item.id) ===
                    String(id)
                );

            }
        );

    if (!loja) {

        alert(
            "Não foi possível localizar os dados desta loja."
        );

        return;

    }

    lojaSelecionadaParaExclusao =
        loja;

    // restante da função continua aqui


    const nome =
        document.getElementById(
            "modalNomeLoja"
        );

    const codigo =
        document.getElementById(
            "modalCodigo"
        );

    const usuario =
        document.getElementById(
            "modalUsuario"
        );

    const email =
        document.getElementById(
            "modalEmail"
        );

    const produtos =
        document.getElementById(
            "modalProdutos"
        );

    const usuarios =
        document.getElementById(
            "modalUsuarios"
        );

    const movimentacoes =
        document.getElementById(
            "modalMovimentacoes"
        );

    const plano =
        document.getElementById(
            "modalPlano"
        );

    const status =
        document.getElementById(
            "modalStatus"
        );


    if (nome) {

        nome.textContent =
            loja.nome ||
            "Sem nome";

    }

    if (codigo) {

        codigo.textContent =
            loja.codigo ||
            "—";

    }

    if (usuario) {

        usuario.textContent =
            loja.usuario ||
            "—";

    }

    if (email) {

        email.textContent =
            loja.email ||
            "—";

    }

    if (produtos) {

        produtos.textContent =
            Number(
                loja.quantidadeProdutos ||
                0
            );

    }

    if (usuarios) {

        usuarios.textContent =
            Number(
                loja.quantidadeUsuarios ||
                0
            );

    }

    if (movimentacoes) {

        movimentacoes.textContent =
            Number(
                loja.quantidadeMovimentacoes ||
                0
            );

    }


    const assinatura =
        loja.assinatura ||
        {};


    if (plano) {

        plano.textContent =
            assinatura.plano ||
            assinatura.nomePlano ||
            loja.plano ||
            "—";

    }

    if (status) {

        status.textContent =
            textoStatusLoja(
                loja
            );

    }


    if (modalLoja) {

        modalLoja.hidden =
            false;

        modalLoja.classList.add(
            "active"
        );

    }

}


/* =====================================================
   FECHAR MODAL
===================================================== */

function fecharModalLoja() {

    if (!modalLoja) {
        return;
    }

    modalLoja.classList.remove(
        "active"
    );

    modalLoja.hidden =
        true;

}


if (fecharModal) {

    fecharModal.addEventListener(
        "click",
        function () {

            fecharModalLoja();

        }
    );

}


if (modalLoja) {

    modalLoja.addEventListener(
        "click",
        function (event) {

            if (
                event.target ===
                modalLoja
            ) {

                fecharModalLoja();

            }

        }
    );

}


document.addEventListener(
    "keydown",
    function (event) {

        if (
            event.key === "Escape"
        ) {

            fecharModalLoja();

        }

    }
);


/* =====================================================
   ABAS
===================================================== */

document
    .querySelectorAll(
        ".admin-tab"
    )
    .forEach(
        function (tab) {

            tab.addEventListener(
                "click",
                function () {

                    document
                        .querySelectorAll(
                            ".admin-tab"
                        )
                        .forEach(
                            function (item) {

                                item.classList.remove(
                                    "active"
                                );

                            }
                        );

                    document
                        .querySelectorAll(
                            ".tab-content"
                        )
                        .forEach(
                            function (item) {

                                item.classList.remove(
                                    "active"
                                );

                            }
                        );

                    this.classList.add(
                        "active"
                    );

                    const nome =
                        this.dataset.tab;

                    const mapaAbas = {

                        lojas:
                            "tabContentLojas",

                        notificacoes:
                            "tabContentNotificacoes",

                        suporte:
                            "tabContentSuporte"

                    };

                    const idConteudo =
                        mapaAbas[nome];

                    const alvo =
                        document.getElementById(
                            idConteudo
                        );

                    if (alvo) {

                        alvo.classList.add(
                            "active"
                        );

                    }

                    if (
                        nome === "suporte"
                    ) {

                        carregarChamadosAdmin();

                    }

                }
            );

        }
    );


/* =====================================================
   CONTADOR DE MENSAGEM
===================================================== */

if (mensagemNotificacao) {

    mensagemNotificacao.addEventListener(
        "input",
        function () {

            if (contadorMensagem) {

                contadorMensagem.textContent =
                    `${this.value.length} / 500`;

            }

        }
    );

}


/* =====================================================
   CARREGAR NOTIFICAÇÕES
===================================================== */

async function carregarNotificacoes() {

    if (!listaNotificacoes) {
        return;
    }

    if (statusNotificacoes) {

        statusNotificacoes.textContent =
            "Carregando...";

    }

    listaNotificacoes.innerHTML = `
        <div class="empty-history">
            Carregando notificações...
        </div>
    `;

    try {

        const snapshot =
            await db
                .collection(
                    "notificacoes"
                )
                .get();


        notificacoesCache =
            snapshot.docs
                .map(
                    function (doc) {

                        return {

                            id:
                                doc.id,

                            ...doc.data()

                        };

                    }
                )
                .sort(
                    function (a, b) {

                        return (
                            obterTimestamp(
                                b.data
                            ) -
                            obterTimestamp(
                                a.data
                            )
                        );

                    }
                );


        atualizarResumoNotificacoes();

        renderizarNotificacoes();


        if (statusNotificacoes) {

            statusNotificacoes.textContent =
                "Histórico atualizado.";

        }

    } catch (erro) {

        console.error(
            "Erro ao carregar notificações:",
            erro
        );

        if (statusNotificacoes) {

            statusNotificacoes.textContent =
                "Erro ao carregar.";

        }

        listaNotificacoes.innerHTML = `
            <div class="empty-history error-text">
                Não foi possível carregar as notificações.
            </div>
        `;

    }

}


/* =====================================================
   RESUMO DAS NOTIFICAÇÕES
===================================================== */

function atualizarResumoNotificacoes() {

    const total =
        notificacoesCache.length;

    const todas =
        notificacoesCache.filter(
            function (item) {

                return (
                    item.destino === "todas" ||
                    item.lojasDestino === "todas"
                );

            }
        ).length;

    const ativas =
        notificacoesCache.filter(
            function (item) {

                return (
                    item.ativa !== false
                );

            }
        ).length;


    if (totalNotificacoes) {

        totalNotificacoes.textContent =
            total;

    }

    if (notificacoesTodas) {

        notificacoesTodas.textContent =
            todas;

    }

    if (notificacoesAtivas) {

        notificacoesAtivas.textContent =
            ativas;

    }

    if (contadorNotificacoes) {

        contadorNotificacoes.textContent =
            total;

    }


    if (
        !total ||
        !notificacoesCache[0]
    ) {

        if (ultimaNotificacao) {

            ultimaNotificacao.textContent =
                "—";

        }

        return;

    }


    if (ultimaNotificacao) {

        ultimaNotificacao.textContent =
            formatarData(
                notificacoesCache[0].data
            );

    }

}


/* =====================================================
   RENDERIZAR NOTIFICAÇÕES
===================================================== */

function renderizarNotificacoes() {

    if (!listaNotificacoes) {
        return;
    }

    if (
        !notificacoesCache.length
    ) {

        listaNotificacoes.innerHTML = `
            <div class="empty-history">
                Nenhuma notificação enviada ainda.
            </div>
        `;

        return;

    }


    listaNotificacoes.innerHTML =
        notificacoesCache
            .map(
                function (item) {

                    const tipo =
                        item.tipo ||
                        "informativa";

                    return `
                        <article
                            class="notification-history-card"
                        >

                            <div
                                class="history-card-icon ${escaparHtml(tipo)}"
                            >
                                !
                            </div>

                            <div
                                class="history-card-content"
                            >

                                <div
                                    class="history-card-top"
                                >

                                    <div>

                                        <strong>
                                            ${escaparHtml(
                                                item.titulo ||
                                                "Sem título"
                                            )}
                                        </strong>

                                        <span>
                                            ${escaparHtml(
                                                tipo
                                            )}
                                        </span>

                                    </div>

                                    <button
                                        type="button"
                                        class="delete-notification"
                                        data-id="${item.id}"
                                    >
                                        Excluir
                                    </button>

                                </div>


                                <p>
                                    ${escaparHtml(
                                        item.mensagem ||
                                        ""
                                    )}
                                </p>


                                <small>
                                    ${formatarData(
                                        item.data
                                    )}
                                    · Todas as lojas
                                </small>

                            </div>

                        </article>
                    `;

                }
            )
            .join("");


    listaNotificacoes
        .querySelectorAll(
            ".delete-notification"
        )
        .forEach(
            function (botao) {

                botao.addEventListener(
                    "click",
                    function () {

                        excluirNotificacao(
                            this.dataset.id
                        );

                    }
                );

            }
        );

}


/* =====================================================
   ENVIAR NOTIFICAÇÃO
===================================================== */

if (formNotificacao) {

    formNotificacao.addEventListener(
        "submit",
        async function (event) {

            event.preventDefault();

            const titulo =
                tituloNotificacao.value
                    .trim();

            const mensagem =
                mensagemNotificacao.value
                    .trim();

            const tipo =
                tipoNotificacao.value;


            if (
                !titulo ||
                !mensagem
            ) {

                statusEnvio.textContent =
                    "Preencha título e mensagem.";

                statusEnvio.className =
                    "send-status error";

                return;

            }


            btnEnviarNotificacao.disabled =
                true;

            btnEnviarNotificacao.textContent =
                "Enviando...";

            statusEnvio.textContent =
                "";

            statusEnvio.className =
                "send-status";


            try {

                await db
                    .collection(
                        "notificacoes"
                    )
                    .add({

                        titulo:
                            titulo,

                        mensagem:
                            mensagem,

                        tipo:
                            tipo,

                        destino:
                            "todas",

                        lojasDestino:
                            "todas",

                        ativa:
                            true,

                        data:
                            firebase.firestore
                                .FieldValue
                                .serverTimestamp(),

                        criadoPorUid:
                            auth.currentUser?.uid ||
                            null,

                        criadoPorEmail:
                            auth.currentUser?.email ||
                            ""

                    });


                statusEnvio.textContent =
                    "Notificação enviada com sucesso.";

                statusEnvio.className =
                    "send-status success";


                formNotificacao.reset();


                if (contadorMensagem) {

                    contadorMensagem.textContent =
                        "0 / 500";

                }


                await carregarNotificacoes();

            } catch (erro) {

                console.error(
                    "Erro ao enviar notificação:",
                    erro
                );

                statusEnvio.textContent =
                    "Não foi possível enviar a notificação.";

                statusEnvio.className =
                    "send-status error";

            } finally {

                btnEnviarNotificacao.disabled =
                    false;

                btnEnviarNotificacao.textContent =
                    "Enviar notificação";

            }

        }
    );

}


/* =====================================================
   EXCLUIR NOTIFICAÇÃO
===================================================== */

async function excluirNotificacao(id) {

    const confirmar =
        window.confirm(
            "Deseja realmente excluir esta notificação?"
        );

    if (!confirmar) {
        return;
    }

    try {

        await db
            .collection("notificacoes")
            .doc(id)
            .delete();


        await carregarNotificacoes();

    } catch (erro) {

        console.error(
            "Erro ao excluir notificação:",
            erro
        );

        alert(
            "Não foi possível excluir a notificação."
        );

    }

}


/* =====================================================
   LIMPAR TODAS AS NOTIFICAÇÕES
===================================================== */

if (btnLimparNotificacoes) {

    btnLimparNotificacoes.addEventListener(
        "click",
        async function () {

            const usuario =
                auth.currentUser;

            if (!usuario) {

                alert(
                    "Sua sessão administrativa expirou. Entre novamente."
                );

                return;

            }


            const confirmar =
                window.confirm(
                    "ATENÇÃO!\n\nIsso vai apagar TODAS as notificações de todas as lojas.\n\nDeseja continuar?"
                );


            if (!confirmar) {

                return;

            }


            btnLimparNotificacoes.disabled =
                true;

            btnLimparNotificacoes.textContent =
                "Limpando...";


            try {

                const snapshot =
                    await db
                        .collection("notificacoes")
                        .get();


                if (
                    snapshot.empty
                ) {

                    alert(
                        "A coleção de notificações já está vazia."
                    );

                    await carregarNotificacoes();

                    return;

                }


                const documentos =
                    snapshot.docs;

                const tamanhoLote =
                    400;


                for (
                    let inicio = 0;
                    inicio < documentos.length;
                    inicio += tamanhoLote
                ) {

                    const lote =
                        documentos.slice(
                            inicio,
                            inicio + tamanhoLote
                        );


                    const batch =
                        db.batch();


                    lote.forEach(
                        function (documento) {

                            batch.delete(
                                documento.ref
                            );

                        }
                    );


                    await batch.commit();

                }


                const conferencia =
                    await db
                        .collection("notificacoes")
                        .get();


                if (
                    conferencia.size > 0
                ) {

                    throw new Error(
                        `A limpeza terminou, mas ${conferencia.size} notificações ainda permanecem.`
                    );

                }


                notificacoesCache = [];

                atualizarResumoNotificacoes();

                renderizarNotificacoes();


                if (
                    statusNotificacoes
                ) {

                    statusNotificacoes.textContent =
                        "Nenhuma notificação cadastrada.";

                }


                alert(
                    "Todas as notificações foram apagadas com sucesso."
                );


            } catch (erro) {

                console.error(
                    "ERRO AO LIMPAR NOTIFICAÇÕES:",
                    erro
                );


                let mensagem =
                    "Não foi possível limpar as notificações.";


                if (
                    erro.code ===
                    "permission-denied"
                ) {

                    mensagem =
                        "O Firebase bloqueou a exclusão pelas regras de segurança.";

                }


                alert(
                    mensagem
                );


            } finally {

                btnLimparNotificacoes.disabled =
                    false;

                btnLimparNotificacoes.textContent =
                    "Limpar todas";

            }

        }
    );

}
/* =====================================================
   SUPORTE - CARREGAR CHAMADOS
===================================================== */

async function carregarChamadosAdmin() {

    if (!listaChamadosAdmin) {
        return;
    }

    if (statusChamadosAdmin) {

        statusChamadosAdmin.textContent =
            "Carregando chamados...";

    }

    listaChamadosAdmin.innerHTML = `
        <div class="empty-history">
            Carregando chamados...
        </div>
    `;


    try {

        /* =============================================
           BUSCAR TODAS AS LOJAS
        ============================================= */

        const lojasSnapshot =
            await db
                .collection("lojas")
                .get();


        const chamados = [];


        /* =============================================
           BUSCAR CHAMADOS DE CADA LOJA
        ============================================= */

        for (
            const lojaDoc
            of lojasSnapshot.docs
        ) {

            const loja =
                lojaDoc.data() || {};


            const lojaId =
                lojaDoc.id;


            try {

                const chamadosSnapshot =
                    await lojaDoc.ref
                        .collection("chamados")
                        .get();


                chamadosSnapshot.docs
                    .forEach(
                        function (doc) {

                            chamados.push({

                                id:
                                    doc.id,

                                lojaId:
                                    lojaId,

                                lojaNome:
                                    loja.nome ||
                                    "Sem nome",

                                lojaCodigo:
                                    loja.codigo ||
                                    loja.codigoLoja ||
                                    "—",

                                caminho:
                                    doc.ref.path,

                                referencia:
                                    doc.ref,

                                ...doc.data()

                            });

                        }
                    );


            } catch (erroLoja) {

                console.error(
                    "Erro ao carregar chamados da loja:",
                    lojaId,
                    erroLoja
                );

            }

        }


        /* =============================================
           ORDENAR MAIS RECENTES PRIMEIRO
        ============================================= */

        chamados.sort(
            function (a, b) {

                return (
                    obterTimestamp(
                        b.criadoEm
                    ) -
                    obterTimestamp(
                        a.criadoEm
                    )
                );

            }
        );


        chamadosCache =
            chamados;


        console.log(
            "Chamados carregados no Admin:",
            chamadosCache.length
        );


        /* =============================================
           ATUALIZAR RESUMO
        ============================================= */

        atualizarResumoChamadosAdmin();


        /* =============================================
           RENDERIZAR
        ============================================= */

        renderizarChamadosAdmin();


        /* =============================================
           STATUS
        ============================================= */

        if (statusChamadosAdmin) {

            statusChamadosAdmin.textContent =
                `${chamadosCache.length} ${
                    chamadosCache.length === 1
                        ? "chamado encontrado"
                        : "chamados encontrados"
                }.`;

        }


    } catch (erro) {

        console.error(
            "Erro ao carregar chamados do Admin:",
            erro
        );


        chamadosCache = [];


        atualizarResumoChamadosAdmin();


        if (statusChamadosAdmin) {

            statusChamadosAdmin.textContent =
                "Erro ao carregar chamados.";

        }


        listaChamadosAdmin.innerHTML = `
            <div class="empty-history error-text">
                Não foi possível carregar os chamados.
            </div>
        `;

    }

}


/* =====================================================
   RESUMO DOS CHAMADOS
===================================================== */

function atualizarResumoChamadosAdmin() {

    const total =
        chamadosCache.length;


    const abertos =
        chamadosCache.filter(
            function (chamado) {

                const status =
                    normalizarStatusChamado(
                        chamado.status
                    );

                return (
                    status === "aberto" ||
                    status === "em análise" ||
                    status === "em analise"
                );

            }
        ).length;


    const atendimento =
        chamadosCache.filter(
            function (chamado) {

                return (
                    normalizarStatusChamado(
                        chamado.status
                    ) ===
                    "em atendimento"
                );

            }
        ).length;


    const resolvidos =
        chamadosCache.filter(
            function (chamado) {

                const status =
                    normalizarStatusChamado(
                        chamado.status
                    );

                return (
                    status === "resolvido" ||
                    status === "fechado"
                );

            }
        ).length;


    if (totalChamadosAdmin) {

        totalChamadosAdmin.textContent =
            total;

    }

    if (chamadosAbertosAdmin) {

        chamadosAbertosAdmin.textContent =
            abertos;

    }

    if (chamadosAtendimentoAdmin) {

        chamadosAtendimentoAdmin.textContent =
            atendimento;

    }

    if (chamadosResolvidosAdmin) {

        chamadosResolvidosAdmin.textContent =
            resolvidos;

    }

}


/* =====================================================
   NOME DA LOJA DO CHAMADO
===================================================== */

function obterNomeLojaDoChamado(chamado) {

    const lojaId =
        chamado.lojaId ||
        (
            chamado.caminho
                ? String(
                    chamado.caminho
                )
                .split("/")[1]
                : ""
        );

    if (!lojaId) {

        return (
            chamado.codigoLoja ||
            "Loja não identificada"
        );

    }

    const loja =
        lojasCache.find(
            function (item) {

                return (
                    String(item.id) ===
                    String(lojaId)
                );

            }
        );

    if (loja) {

        return (
            loja.nome ||
            loja.codigo ||
            lojaId
        );

    }

    return (
        chamado.codigoLoja ||
        lojaId
    );

}


/* =====================================================
   RENDERIZAR CHAMADOS
===================================================== */

function aplicarEstilosChamadosAdmin() {

    if (document.getElementById("gestok-chamados-admin-style")) {
        return;
    }

    const style = document.createElement("style");
    style.id = "gestok-chamados-admin-style";

    style.textContent = `
        .support-admin-card {
            overflow: hidden;
            transition:
                box-shadow .18s ease,
                border-color .18s ease,
                transform .18s ease;
        }

        .support-admin-card.open {
            border-color: #dbe7f8;
            box-shadow: 0 5px 18px rgba(52,120,229,.07);
        }

        .support-admin-card-top.support-admin-card-toggle {
            width: 100%;
            margin: 0;
            padding: 0;
            background: transparent;
            border: 0;
            cursor: pointer;
            text-align: left;
            user-select: none;
            outline: none;
        }

        .support-admin-card-top.support-admin-card-toggle:focus-visible {
            box-shadow: 0 0 0 3px rgba(52,120,229,.10);
            border-radius: 8px;
        }

        .support-admin-toggle-right {
            flex-shrink: 0;
            display: flex;
            align-items: center;
            gap: 8px;
        }

        .support-admin-toggle-status {
            flex-shrink: 0;
        }

        .support-admin-chevron {
            width: 24px;
            height: 24px;
            display: inline-flex;
            align-items: center;
            justify-content: center;
            border-radius: 7px;
            background: #f5f7fa;
            color: #7a8592;
            font-size: 13px;
            line-height: 1;
            transition: transform .18s ease, background .18s ease;
        }

        .support-admin-card.open .support-admin-chevron {
            background: #edf4ff;
            color: #3478e5;
            transform: rotate(180deg);
        }

        .support-admin-details {
            padding-top: 2px;
            animation: gestokChamadoAbrir .18s ease;
        }

        .support-admin-details[hidden] {
            display: none !important;
        }

        .support-admin-details-actions {
            display: flex;
            align-items: center;
            gap: 8px;
            margin-top: 12px;
            padding-top: 12px;
            border-top: 1px solid #edf0f4;
            flex-wrap: wrap;
        }

        .support-admin-details-actions .status-chamado-rapido-admin {
            min-width: 160px;
        }

        .support-admin-details-actions .btn-abrir-conversa-admin {
            margin-right: 0;
        }

        .support-admin-details-actions .support-admin-conversation-button {
            margin-left: auto;
        }

        .status-chamado-rapido-admin {
            height: 38px;
            min-width: 160px;
            padding: 0 10px;
            border: 1px solid #dfe5ec;
            border-radius: 8px;
            background: #ffffff;
            color: #4f5966;
            font-family: inherit;
            font-size: 9px;
            font-weight: 700;
            outline: none;
            cursor: pointer;
        }

        .status-chamado-rapido-admin:focus {
            border-color: #3478e5;
            box-shadow: 0 0 0 3px rgba(52,120,229,.09);
        }

        .btn-confirmar-status-admin {
            height: 38px;
            border: 0;
            padding: 0 12px;
            border-radius: 8px;
            background: #3478e5;
            color: #ffffff;
            font-family: inherit;
            font-size: 9px;
            font-weight: 700;
            cursor: pointer;
            white-space: nowrap;
        }

        .btn-confirmar-status-admin:hover {
            background: #2563d3;
        }

        .btn-confirmar-status-admin:disabled {
            opacity: .6;
            cursor: wait;
        }

        .btn-abrir-conversa-admin {
            border: 0;
            background: #edf4ff;
            color: #3478e5;
            border-radius: 7px;
            padding: 8px 11px;
            cursor: pointer;
            font-family: inherit;
            font-size: 9px;
            font-weight: 700;
            white-space: nowrap;
        }

        .btn-abrir-conversa-admin:hover {
            background: #dfeaff;
            color: #2563d3;
        }

        @keyframes gestokChamadoAbrir {
            from {
                opacity: 0;
                transform: translateY(-4px);
            }
            to {
                opacity: 1;
                transform: translateY(0);
            }
        }

        @media (max-width: 650px) {
            .support-admin-toggle-right {
                gap: 5px;
            }

            .support-admin-chevron {
                width: 22px;
                height: 22px;
                font-size: 12px;
            }

            .support-admin-details-actions {
                display: grid;
                grid-template-columns: 1fr auto;
            }

            .support-admin-details-actions .support-admin-conversation-button {
                grid-column: 1 / -1;
                margin-left: 0;
            }

            .support-admin-details-actions .status-chamado-rapido-admin {
                width: 100%;
                min-width: 0;
            }

            .support-admin-details-actions .btn-confirmar-status-admin {
                width: 100%;
            }
        }
    `;

    document.head.appendChild(style);

}


function renderizarChamadosAdmin() {

    if (!listaChamadosAdmin) {
        return;
    }

    aplicarEstilosChamadosAdmin();

    const busca =
        String(
            campoBuscaChamados?.value ||
            ""
        )
        .trim()
        .toLowerCase();

    const filtro =
        String(
            filtroStatusChamados?.value ||
            ""
        )
        .trim()
        .toLowerCase();

    const filtrados =
        chamadosCache.filter(
            function (chamado) {

                const loja =
                    obterNomeLojaDoChamado(chamado);

                const texto =
                    [
                        chamado.numero,
                        chamado.assunto,
                        chamado.categoria,
                        chamado.mensagem,
                        chamado.usuario,
                        chamado.email,
                        chamado.codigoLoja,
                        loja
                    ]
                    .filter(Boolean)
                    .join(" ")
                    .toLowerCase();

                const correspondeBusca =
                    !busca ||
                    texto.includes(busca);

                const status =
                    normalizarStatusChamado(chamado.status);

                const correspondeStatus =
                    !filtro ||
                    status === filtro;

                return (
                    correspondeBusca &&
                    correspondeStatus
                );

            }
        );

    if (!filtrados.length) {

        listaChamadosAdmin.innerHTML = `
            <div class="empty-history">
                Nenhum chamado encontrado.
            </div>
        `;

        return;

    }

    listaChamadosAdmin.innerHTML =
        filtrados
            .map(
                function (chamado) {

                    const status =
                        textoStatusChamado(chamado.status);

                    const classe =
                        classeStatusChamado(chamado.status);

                    const loja =
                        obterNomeLojaDoChamado(chamado);

                    const respostaAtual =
                        chamado.respostaSuporte ||
                        chamado.resposta_suporte ||
                        chamado.resposta ||
                        "";

                    const estaAberto =
                        chamadosExpandidosAdmin.has(
                            String(chamado.id)
                        );

                    return `
                        <article
                            class="support-admin-card ${
                                estaAberto ? "open" : ""
                            }"
                            data-chamado-id="${escaparHtml(
                                chamado.id
                            )}"
                        >

                            <div
                                class="support-admin-card-top support-admin-card-toggle"
                                role="button"
                                tabindex="0"
                                aria-expanded="${estaAberto ? "true" : "false"}"
                                data-id="${escaparHtml(chamado.id)}"
                                title="Clique para ${
                                    estaAberto ? "fechar" : "abrir"
                                } o chamado"
                            >

                                <div>
                                    <small>
                                        Chamado #${escaparHtml(
                                            chamado.numero || chamado.id
                                        )}
                                    </small>

                                    <h3>
                                        ${escaparHtml(
                                            chamado.assunto || "Sem assunto"
                                        )}
                                    </h3>
                                </div>

                                <div class="support-admin-toggle-right">

                                    <span
                                        class="status-pill ${escaparHtml(classe)} support-admin-toggle-status"
                                    >
                                        ${escaparHtml(status)}
                                    </span>

                                    <span
                                        class="support-admin-chevron"
                                        aria-hidden="true"
                                    >
                                        ▾
                                    </span>

                                </div>

                            </div>

                            <div
                                class="support-admin-details"
                                ${estaAberto ? "" : "hidden"}
                            >

                                <div class="support-admin-meta">

                                    <span>
                                        <strong>Loja:</strong>
                                        ${escaparHtml(loja)}
                                    </span>

                                    <span>
                                        <strong>Usuário:</strong>
                                        ${escaparHtml(
                                            chamado.usuario || "—"
                                        )}
                                    </span>

                                    <span>
                                        <strong>Categoria:</strong>
                                        ${escaparHtml(
                                            chamado.categoria || "—"
                                        )}
                                    </span>

                                    <span>
                                        <strong>Data:</strong>
                                        ${formatarData(chamado.criadoEm)}
                                    </span>

                                </div>

                                <div class="support-admin-message">
                                    <strong>Mensagem</strong>
                                    <p>
                                        ${escaparHtml(
                                            chamado.mensagem ||
                                            "Nenhuma mensagem informada."
                                        )}
                                    </p>
                                </div>

                                ${
                                    respostaAtual
                                        ? `
                                            <div class="support-admin-response-old">
                                                <strong>Resposta atual</strong>
                                                <p>
                                                    ${escaparHtml(respostaAtual)}
                                                </p>
                                                ${
                                                    chamado.respondidoPor
                                                        ? `
                                                            <small>
                                                                Respondido por:
                                                                ${escaparHtml(
                                                                    chamado.respondidoPor
                                                                )}
                                                            </small>
                                                          `
                                                        : ""
                                                }
                                            </div>
                                          `
                                        : ""
                                }

                                <div class="support-admin-details-actions">

                                    <select
                                        class="status-chamado-rapido-admin"
                                        data-id="${escaparHtml(chamado.id)}"
                                        aria-label="Alterar status do chamado ${escaparHtml(
                                            chamado.numero || chamado.id
                                        )}"
                                    >
                                        <option value="Aberto" ${
                                            status === "Aberto" ? "selected" : ""
                                        }>
                                            Aberto
                                        </option>
                                        <option value="Em atendimento" ${
                                            status === "Em atendimento" ? "selected" : ""
                                        }>
                                            Em atendimento
                                        </option>
                                        <option value="Em análise" ${
                                            status === "Em análise" ? "selected" : ""
                                        }>
                                            Em análise
                                        </option>
                                        <option value="Resolvido" ${
                                            status === "Resolvido" ? "selected" : ""
                                        }>
                                            Resolvido
                                        </option>
                                        <option value="Fechado" ${
                                            status === "Fechado" ? "selected" : ""
                                        }>
                                            Fechado
                                        </option>
                                    </select>

                                    <button
                                        type="button"
                                        class="btn-confirmar-status-admin"
                                        data-id="${escaparHtml(chamado.id)}"
                                    >
                                        Confirmar
                                    </button>

                                    <div class="support-admin-conversation-button">
                                        <button
                                            type="button"
                                            class="btn-abrir-conversa-admin"
                                            data-id="${escaparHtml(chamado.id)}"
                                        >
                                            Ver conversa
                                        </button>
                                    </div>

                                </div>

                            </div>

                        </article>
                    `;

                }
            )
            .join("");

    listaChamadosAdmin
        .querySelectorAll(".status-chamado-rapido-admin")
        .forEach(function (select) {

            select.addEventListener(
                "click",
                function (event) {
                    event.stopPropagation();
                }
            );

            select.addEventListener(
                "change",
                function (event) {
                    event.stopPropagation();
                }
            );

        });

    listaChamadosAdmin
        .querySelectorAll(".btn-confirmar-status-admin")
        .forEach(function (botao) {

            botao.addEventListener(
                "click",
                async function (event) {

                    event.stopPropagation();

                    const id =
                        String(this.dataset.id || "");

                    const select =
                        listaChamadosAdmin.querySelector(
                            `.status-chamado-rapido-admin[data-id="${CSS.escape(id)}"]`
                        );

                    const novoStatus =
                        select?.value || "Aberto";

                    await atualizarStatusChamadoAdmin(
                        id,
                        novoStatus,
                        this
                    );

                }
            );

        });

    listaChamadosAdmin
        .querySelectorAll(".support-admin-card-toggle")
        .forEach(function (gatilho) {

            const alternar = function () {

                const id =
                    String(this.dataset.id || "");

                const card =
                    this.closest(".support-admin-card");

                const detalhes =
                    card?.querySelector(".support-admin-details");

                if (!id || !card || !detalhes) {
                    return;
                }

                const vaiAbrir = detalhes.hidden;

                detalhes.hidden = !vaiAbrir;

                card.classList.toggle("open", vaiAbrir);

                this.setAttribute(
                    "aria-expanded",
                    vaiAbrir ? "true" : "false"
                );

                this.setAttribute(
                    "title",
                    `Clique para ${vaiAbrir ? "fechar" : "abrir"} o chamado`
                );

                if (vaiAbrir) {
                    chamadosExpandidosAdmin.add(id);
                } else {
                    chamadosExpandidosAdmin.delete(id);
                }

            };

            gatilho.addEventListener("click", alternar);

            gatilho.addEventListener(
                "keydown",
                function (event) {

                    if (
                        event.key === "Enter" ||
                        event.key === " "
                    ) {

                        event.preventDefault();
                        alternar.call(this);

                    }

                }
            );

        });

    listaChamadosAdmin
        .querySelectorAll(".btn-abrir-conversa-admin")
        .forEach(function (botao) {

            botao.addEventListener(
                "click",
                function (event) {

                    event.stopPropagation();

                    abrirConversaAdmin(
                        this.dataset.id
                    );

                }
            );

        });

}


/* =====================================================
   BUSCA / FILTRO DE CHAMADOS
===================================================== */

if (campoBuscaChamados) {

    campoBuscaChamados.addEventListener(
        "input",
        function () {

            renderizarChamadosAdmin();

        }
    );

}


if (filtroStatusChamados) {

    filtroStatusChamados.addEventListener(
        "change",
        function () {

            renderizarChamadosAdmin();

        }
    );

}


/* =====================================================
   SALVAR STATUS / RESPOSTA DO ADMIN
===================================================== */

async function salvarAtendimentoAdmin(
    id,
    respostaForcada = null,
    statusForcado = null
) {

    const chamado =
        chamadosCache.find(
            function (item) {

                return (
                    String(item.id) ===
                    String(id)
                );

            }
        );

    if (!chamado) {

        alert("Chamado não encontrado.");
        return;

    }

    if (!chamado.referencia) {

        alert("Referência do chamado não encontrada.");
        return;

    }

    let resposta = respostaForcada;
    let novoStatus = statusForcado;

    if (resposta === null) {

        const select =
            listaChamadosAdmin?.querySelector(
                `.status-chamado-admin[data-id="${CSS.escape(
                    String(id)
                )}"]`
            );

        const textarea =
            listaChamadosAdmin?.querySelector(
                `.resposta-chamado-admin[data-id="${CSS.escape(
                    String(id)
                )}"]`
            );

        novoStatus =
            select?.value ||
            textoStatusChamado(chamado.status);

        resposta =
            textarea?.value.trim() ||
            "";

    }

    novoStatus = novoStatus || "Em atendimento";
    resposta = String(resposta || "").trim();

    const botao =
        listaChamadosAdmin?.querySelector(
            `.btn-responder-chamado-admin[data-id="${CSS.escape(
                String(id)
            )}"]`
        );

    if (botao) {
        botao.disabled = true;
        botao.textContent = "Salvando...";
    }

    try {

        const usuario = auth.currentUser;

        if (!usuario) {
            throw new Error("Administrador não autenticado.");
        }

        const nomeAdmin =
            adminNome?.textContent?.trim() ||
            usuario.email ||
            "Administrador";

        const agora =
            firebase.firestore.Timestamp.now();

        if (resposta) {

            await chamado.referencia
                .collection("mensagens")
                .add({
                    autorTipo: "admin",
                    autorUid: usuario.uid,
                    autorNome: nomeAdmin,
                    autorEmail: usuario.email || "",
                    mensagem: resposta,
                    criadoEm: agora
                });

        }

        await chamado.referencia.update({

            status: novoStatus,

            respostaSuporte:
                resposta ||
                chamado.respostaSuporte ||
                "",

            respondidoPor: nomeAdmin,
            respondidoPorUid: usuario.uid,
            respondidoPorEmail: usuario.email || "",
            ultimaResposta: agora,
            atualizadoEm: agora,
            ultimaMensagem:
                resposta ||
                chamado.ultimaMensagem ||
                "",
            ultimaMensagemAutor: "admin",
            ultimaInteracao: agora

        });

        chamado.status = novoStatus;

        if (resposta) {
            chamado.respostaSuporte = resposta;
        }

        chamado.respondidoPor = nomeAdmin;
        chamado.respondidoPorUid = usuario.uid;
        chamado.respondidoPorEmail = usuario.email || "";
        chamado.ultimaResposta = agora;
        chamado.atualizadoEm = agora;
        chamado.ultimaMensagem =
            resposta ||
            chamado.ultimaMensagem ||
            "";
        chamado.ultimaMensagemAutor = "admin";
        chamado.ultimaInteracao = agora;

        atualizarResumoChamadosAdmin();
        renderizarChamadosAdmin();

        if (statusChamadosAdmin) {
            statusChamadosAdmin.textContent =
                resposta
                    ? "Resposta enviada com sucesso."
                    : "Chamado atualizado com sucesso.";
        }

    } catch (erro) {

        console.error("Erro ao atualizar chamado:", erro);

        alert("Não foi possível atualizar o chamado.");

        if (botao) {
            botao.disabled = false;
            botao.textContent = "Salvar atendimento";
        }

    }

}


/* =====================================================
   ATUALIZAR SOMENTE STATUS DO CHAMADO
===================================================== */

async function atualizarStatusChamadoAdmin(
    id,
    novoStatus,
    botao = null
) {

    const chamado =
        chamadosCache.find(
            function (item) {
                return String(item.id) === String(id);
            }
        );

    if (!chamado) {
        alert("Chamado não encontrado.");
        return;
    }

    if (!chamado.referencia) {
        alert("Referência do chamado não encontrada.");
        return;
    }

    const statusPermitidos = [
        "Aberto",
        "Em atendimento",
        "Em análise",
        "Resolvido",
        "Fechado"
    ];

    if (!statusPermitidos.includes(novoStatus)) {
        novoStatus = "Aberto";
    }

    if (botao) {
        botao.disabled = true;
        botao.textContent = "Salvando...";
    }

    try {

        const agora =
            firebase.firestore.Timestamp.now();

        await chamado.referencia.update({
            status: novoStatus,
            atualizadoEm: agora,
            ultimaInteracao: agora
        });

        chamado.status = novoStatus;
        chamado.atualizadoEm = agora;
        chamado.ultimaInteracao = agora;

        atualizarResumoChamadosAdmin();
        renderizarChamadosAdmin();

        if (statusChamadosAdmin) {
            statusChamadosAdmin.textContent =
                "Status do chamado atualizado com sucesso.";
        }

    } catch (erro) {

        console.error(
            "Erro ao atualizar status do chamado:",
            erro
        );

        alert(
            "Não foi possível atualizar o status do chamado."
        );

    } finally {

        if (botao) {
            botao.disabled = false;
            botao.textContent = "Confirmar";
        }

    }

}


/* =====================================================
   CONVERSA CONTÍNUA - ADMIN
===================================================== */

let modalConversaAdmin = null;
let unsubscribeConversaAdmin = null;

function conversaAdminEstaPertoDoFim(elemento) {

    if (!elemento) return true;

    const distancia =
        elemento.scrollHeight -
        elemento.scrollTop -
        elemento.clientHeight;

    return distancia <= 90;

}

function rolarConversaAdminParaFim(forcar = false) {

    const lista =
        document.getElementById("listaMensagensConversaAdmin");

    if (!lista) return;

    if (!forcar && !conversaAdminEstaPertoDoFim(lista)) {
        return;
    }

    requestAnimationFrame(function () {
        lista.scrollTo({
            top: lista.scrollHeight,
            behavior: forcar ? "smooth" : "auto"
        });
    });

}

function fecharConversaAdmin() {

    if (typeof unsubscribeConversaAdmin === "function") {
        unsubscribeConversaAdmin();
        unsubscribeConversaAdmin = null;
    }

    if (modalConversaAdmin) {
        modalConversaAdmin.remove();
        modalConversaAdmin = null;
    }

}

function renderizarConversaAdmin(mensagens, chamado) {

    const lista =
        document.getElementById("listaMensagensConversaAdmin");

    if (!lista) return;

    const listaMensagens = [...mensagens];

    /*
     * O primeiro texto do chamado antigo fica no documento principal.
     * Mostramos também na conversa caso ainda não exista na subcoleção.
     */

    if (chamado?.mensagem) {

        const existeMensagemInicial =
            listaMensagens.some(function (mensagem) {

                return (
                    mensagem.autorTipo === "cliente" &&
                    String(mensagem.mensagem || "").trim() ===
                        String(chamado.mensagem || "").trim()
                );

            });

        if (!existeMensagemInicial) {

            listaMensagens.unshift({
                autorTipo: "cliente",
                autorNome: chamado.usuario || "Cliente",
                mensagem: chamado.mensagem,
                criadoEm: chamado.criadoEm || chamado.data
            });

        }

    }

    /*
     * Compatibilidade com respostas antigas salvas no chamado.
     */

    const respostaAntiga = String(
        chamado?.respostaSuporte ||
        chamado?.resposta_suporte ||
        chamado?.resposta ||
        ""
    ).trim();

    if (respostaAntiga) {

        const existeRespostaAntiga =
            listaMensagens.some(function (mensagem) {

                return (
                    mensagem.autorTipo === "admin" &&
                    String(mensagem.mensagem || "").trim() ===
                        respostaAntiga
                );

            });

        if (!existeRespostaAntiga) {

            listaMensagens.push({
                autorTipo: "admin",
                autorNome: chamado.respondidoPor || "Suporte Gestok",
                mensagem: respostaAntiga,
                criadoEm: chamado.ultimaResposta || chamado.atualizadoEm
            });

        }

    }

    if (!listaMensagens.length) {

        lista.innerHTML = `
            <div class="conversation-empty">
                Nenhuma mensagem ainda.
            </div>
        `;
        return;

    }

    lista.innerHTML = listaMensagens.map(function (mensagem) {

        const admin =
            mensagem.autorTipo === "admin";

        return `
            <div class="conversation-message ${admin ? "admin" : "cliente"}">
                <div class="conversation-message-top">
                    <strong>
                        ${escaparHtml(
                            mensagem.autorNome ||
                            (admin ? "Administrador" : "Cliente")
                        )}
                    </strong>
                    <span>
                        ${formatarData(mensagem.criadoEm)}
                    </span>
                </div>
                <p>
                    ${escaparHtml(mensagem.mensagem || "")}
                </p>
            </div>
        `;

    }).join("");

    rolarConversaAdminParaFim();

}

function abrirConversaAdmin(id) {

    const chamado =
        chamadosCache.find(function (item) {
            return String(item.id) === String(id);
        });

    if (!chamado) return;

    fecharConversaAdmin();

    modalConversaAdmin =
        document.createElement("div");

    modalConversaAdmin.className =
        "modal-overlay active";

    modalConversaAdmin.innerHTML = `
        <div class="modal admin-conversation-modal">

            <div class="modal-header">
                <div>
                    <span>SUPORTE</span>
                    <h2>
                        ${escaparHtml(
                            chamado.assunto || "Chamado"
                        )}
                    </h2>
                </div>

                <button
                    type="button"
                    class="modal-close"
                    id="fecharConversaAdmin"
                >
                    ×
                </button>
            </div>

            <div class="modal-body">

                <div class="admin-conversation-info">
                    <div>
                        <strong>
                            Chamado #${escaparHtml(
                                chamado.numero || chamado.id
                            )}
                        </strong>
                        <small>
                            ${escaparHtml(
                                obterNomeLojaDoChamado(chamado)
                            )}
                        </small>
                    </div>

                    <span
                        id="statusBadgeConversaAdmin"
                        class="conversation-status-badge"
                    >
                        ${escaparHtml(textoStatusChamado(chamado.status || "Aberto"))}
                    </span>
                </div>

                <div
                    class="ticket-conversation"
                    id="listaMensagensConversaAdmin"
                >
                    <div class="conversation-empty">
                        Carregando conversa...
                    </div>
                </div>

                <div class="admin-conversation-reply">

                    <textarea
                        id="mensagemConversaAdmin"
                        class="resposta-chamado-admin"
                        maxlength="2000"
                        placeholder="Digite uma resposta para a loja..."
                    ></textarea>

                    <button
                        type="button"
                        class="btn-responder-chamado-admin"
                        id="btnEnviarMensagemAdmin"
                    >
                        Responder
                    </button>

                </div>

            </div>
        </div>
    `;

    document.body.appendChild(modalConversaAdmin);

    document
        .getElementById("fecharConversaAdmin")
        ?.addEventListener(
            "click",
            fecharConversaAdmin
        );

    modalConversaAdmin.addEventListener(
        "click",
        function (event) {
            if (event.target === modalConversaAdmin) {
                fecharConversaAdmin();
            }
        }
    );

    const statusBadge =
        document.getElementById("statusBadgeConversaAdmin");

    if (statusBadge) {
        statusBadge.textContent =
            textoStatusChamado(
                chamado.status || "Aberto"
            );

        statusBadge.className =
            "conversation-status-badge " +
            normalizarStatusChamado(
                chamado.status || "Aberto"
            );
    }

    unsubscribeConversaAdmin =
        chamado.referencia
            .collection("mensagens")
            .orderBy("criadoEm", "asc")
            .onSnapshot(
                function (snapshot) {

                    const mensagens =
                        snapshot.docs.map(function (doc) {
                            return {
                                id: doc.id,
                                ...doc.data()
                            };
                        });

                    renderizarConversaAdmin(
                        mensagens,
                        chamado
                    );

                },
                function (erro) {
                    console.error(
                        "Erro ao carregar conversa do Admin:",
                        erro
                    );
                }
            );

    document
        .getElementById("btnEnviarMensagemAdmin")
        ?.addEventListener(
            "click",
            async function () {

                const textarea =
                    document.getElementById(
                        "mensagemConversaAdmin"
                    );

                const resposta =
                    textarea?.value.trim() || "";

                const novoStatus =
                    chamado.status || "Aberto";

                if (!resposta) return;

                const botao = this;
                botao.disabled = true;
                botao.textContent = "Enviando...";

                try {
                    await salvarAtendimentoAdmin(
                        chamado.id,
                        resposta,
                        novoStatus
                    );

                    chamado.status = novoStatus;

                    const badge =
                        document.getElementById("statusBadgeConversaAdmin");

                    if (badge) {
                        badge.textContent = textoStatusChamado(novoStatus);
                        badge.className =
                            "conversation-status-badge " +
                            normalizarStatusChamado(novoStatus);
                    }

                    if (textarea) {
                        textarea.value = "";
                    }

                } finally {
                    botao.disabled = false;
                    botao.textContent = "Responder";
                }

            }
        );

    const textareaConversaAdmin =
        document.getElementById("mensagemConversaAdmin");

    if (textareaConversaAdmin) {

        textareaConversaAdmin.addEventListener("keydown", function (event) {

            if (event.key !== "Enter" || event.shiftKey) {
                return;
            }

            event.preventDefault();
            document
                .getElementById("btnEnviarMensagemAdmin")
                ?.click();

        });

    }

    aplicarEstilosConversaAdmin();

}

function aplicarEstilosConversaAdmin() {

    if (document.getElementById("gestok-conversa-admin-style")) {
        return;
    }

    const style = document.createElement("style");
    style.id = "gestok-conversa-admin-style";

    style.textContent = `
        .admin-conversation-modal {
            width: min(760px, 100%);
        }

        .admin-conversation-info {
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: 12px;
            margin-bottom: 12px;
            padding: 10px 12px;
            border-radius: 9px;
            background: #f8fafc;
            color: #697382;
            font-size: 10px;
        }

        .admin-conversation-info > div {
            display: flex;
            flex-direction: column;
            gap: 3px;
            min-width: 0;
        }

        .admin-conversation-info small {
            color: #9ba4b1;
            font-size: 8px;
            overflow-wrap: anywhere;
        }

        .conversation-status-badge {
            flex-shrink: 0;
            padding: 5px 8px;
            border-radius: 999px;
            font-size: 8px;
            font-weight: 700;
            background: #edf4ff;
            color: #2563d3;
        }

        .conversation-status-badge.aberto {
            background: #edf4ff;
            color: #2563d3;
        }

        .conversation-status-badge.em-atendimento {
            background: #fff3df;
            color: #c87510;
        }

        .conversation-status-badge.em-analise {
            background: #f2edff;
            color: #7b45c7;
        }

        .conversation-status-badge.resolvido {
            background: #e9f9f0;
            color: #159957;
        }

        .conversation-status-badge.fechado {
            background: #eef1f4;
            color: #747d88;
        }

        .admin-conversation-reply {
            display: grid;
            grid-template-columns: 1fr auto;
            gap: 9px;
            margin-top: 12px;
        }

        .admin-conversation-modal .ticket-conversation {
            max-height: 390px;
            overflow-y: auto;
            display: flex;
            flex-direction: column;
            gap: 10px;
            padding: 4px;
        }

        .admin-conversation-modal .conversation-message {
            max-width: 86%;
            padding: 11px 13px;
            border-radius: 11px;
            border: 1px solid #e7ebf0;
            background: #f8fafc;
        }

        .admin-conversation-modal .conversation-message.cliente {
            align-self: flex-start;
        }

        .admin-conversation-modal .conversation-message.admin {
            align-self: flex-end;
            background: #edf4ff;
            border-color: #dceaff;
        }

        .admin-conversation-modal .conversation-message-top {
            display: flex;
            justify-content: space-between;
            gap: 12px;
            margin-bottom: 5px;
        }

        .admin-conversation-modal .conversation-message-top strong {
            font-size: 10px;
            color: #1f2937;
        }

        .admin-conversation-modal .conversation-message-top span {
            font-size: 8px;
            color: #9ba4b1;
            white-space: nowrap;
        }

        .admin-conversation-modal .conversation-message p {
            margin: 0;
            font-size: 10px;
            line-height: 1.5;
            color: #5f6977;
            white-space: pre-wrap;
            word-break: break-word;
        }

        .status-chamado-rapido-admin {
            height: 32px;
            min-width: 145px;
            padding: 0 9px;
            border: 1px solid #dfe5ec;
            border-radius: 7px;
            background: #ffffff;
            color: #4f5966;
            font-family: inherit;
            font-size: 8px;
            font-weight: 700;
            outline: none;
            cursor: pointer;
        }

        .status-chamado-rapido-admin:focus {
            border-color: #3478e5;
            box-shadow: 0 0 0 3px rgba(52,120,229,.09);
        }

        .btn-confirmar-status-admin {
            height: 32px;
            border: 0;
            padding: 0 10px;
            border-radius: 7px;
            background: #3478e5;
            color: #ffffff;
            font-family: inherit;
            font-size: 8px;
            font-weight: 700;
            cursor: pointer;
            white-space: nowrap;
        }

        .btn-confirmar-status-admin:hover {
            background: #2563d3;
        }

        .btn-confirmar-status-admin:disabled {
            opacity: .6;
            cursor: wait;
        }

        .support-admin-toggle-right {
            display: flex;
            align-items: center;
            gap: 7px;
            flex-shrink: 0;
        }

        .support-admin-toggle-right .support-admin-chevron {
            margin-left: 1px;
        }

        .btn-abrir-conversa-admin {
            border: 0;
            background: #edf4ff;
            color: #3478e5;
            border-radius: 7px;
            padding: 7px 10px;
            cursor: pointer;
            font-size: 9px;
            font-weight: 700;
            margin-right: 6px;
        }

        .conversation-empty {
            padding: 25px;
            text-align: center;
            color: #9ba4b1;
            font-size: 10px;
        }
    `;

    document.head.appendChild(style);

}
/* =====================================================
   EXCLUIR LOJA
   Tenta a Cloud Function "excluirContaGestok" (se existir, ela também
   remove o login). Se não existir, apaga os dados direto pelo painel.
===================================================== */

async function apagarColecaoLojaAdmin(consulta) {
    while (true) {
        const snap = await consulta.limit(400).get();
        if (snap.empty) { break; }
        const lote = db.batch();
        snap.docs.forEach(function (d) { lote.delete(d.ref); });
        await lote.commit();
    }
}

async function excluirDadosLojaAdmin(loja) {
    const lojaRef = db.collection("lojas").doc(loja.id);
    const subcolecoes = ["usuarios", "operadores", "produtos", "movimentacoes", "solicitacoes"];
    for (const nome of subcolecoes) {
        await apagarColecaoLojaAdmin(lojaRef.collection(nome));
    }
    const chamados = await lojaRef.collection("chamados").get();
    for (const ch of chamados.docs) {
        await apagarColecaoLojaAdmin(ch.ref.collection("mensagens"));
        await ch.ref.delete();
    }
    const acessos = new Map();
    const porLoja = await db.collection("acessos").where("lojaId", "==", loja.id).get();
    porLoja.forEach(function (d) { acessos.set(d.id, d.ref); });
    const uidDono = loja.donoUid || loja.uid;
    if (uidDono) {
        const porUid = await db.collection("acessos").where("uid", "==", uidDono).get();
        porUid.forEach(function (d) { acessos.set(d.id, d.ref); });
    }
    for (const ref of acessos.values()) {
        await ref.delete();
    }
    await lojaRef.delete();
}

if (excluirContaBtn) {
    excluirContaBtn.addEventListener("click", async function () {
        const loja = lojaSelecionadaParaExclusao;
        if (!loja || !loja.id) {
            alert("Não foi possível identificar a loja.");
            return;
        }
        const confirmacao = prompt(
            'Você está prestes a excluir PERMANENTEMENTE a loja "' + (loja.nome || loja.id) + '" ' +
            "e todos os dados dela (produtos, movimentações, chamados e operadores).\n\n" +
            "Digite EXCLUIR para confirmar."
        );
        if (confirmacao !== "EXCLUIR") { return; }
        try {
            excluirContaBtn.disabled = true;
            excluirContaBtn.textContent = "Excluindo...";
            let loginRemovido = false;
            try {
                await firebase.functions().httpsCallable("excluirContaGestok")({ lojaId: loja.id });
                loginRemovido = true;
            } catch (erroFuncao) {
                const codigoFuncao = String((erroFuncao && erroFuncao.code) || "");
                // Recusas propositais da função (permissão, admin, etc.) não devem cair no plano B.
                if (["functions/permission-denied", "functions/unauthenticated",
                     "functions/failed-precondition", "functions/invalid-argument"].includes(codigoFuncao)) {
                    throw erroFuncao;
                }
                console.warn("Função excluirContaGestok indisponível; excluindo pelo painel.", codigoFuncao);
                await excluirDadosLojaAdmin(loja);
            }
            alert(loginRemovido
                ? "Loja excluída com sucesso."
                : "Loja e dados excluídos com sucesso.\n\nO login do cliente" +
                  (loja.email ? " (" + loja.email + ")" : "") +
                  " continua em Firebase > Authentication e pode ser removido por lá.");
            lojaSelecionadaParaExclusao = null;
            fecharModalLoja();
            await carregarLojas();
        } catch (erro) {
            console.error("Erro ao excluir loja:", erro);
            alert(String((erro && erro.code) || "").indexOf("functions/") === 0 && erro.message
                ? erro.message
                : "Não foi possível excluir a loja completamente. Verifique se as regras do Firestore foram atualizadas e tente novamente.");
        } finally {
            excluirContaBtn.disabled = false;
            excluirContaBtn.textContent = "Excluir conta";
        }
    });
}
