const API_URL = 'https://tarefadatabase.vercel.app/';

const app = Vue.createApp({
    data() {
        return {
            nomedousuario: '',
            password: '',
            exibirFormulario: false,
            novoUsuario: {
                usuario: '',
                senha: ''
            },
            exibirErro: false,
            cadastroRealizado: false
        }
    },
    methods: {
        formulario() {
            this.exibirFormulario = !this.exibirFormulario;
        },
        async cadastrar() {
            try {
                await this.cadastrarUsuarioBD(this.novoUsuario.usuario, this.novoUsuario.senha);
                this.cadastroRealizado = true;
            } catch (error) {
                console.error('Erro ao cadastrar usuário:', error);
            }
        },
        async cadastrarUsuarioBD(usuario, senha) {
            try {
                const response = await fetch(`${API_URL}/inserirUsuario`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ usuario, senha })
                });
                if (!response.ok) {
                    throw new Error('Erro ao inserir usuário no banco de dados.');
                }
                console.log('Usuário inserido com sucesso.');
            } catch (error) {
                console.error('Erro ao inserir usuário no banco de dados:', error);
                throw error; // Propaga o erro para ser tratado onde a função foi chamada
            }
        },
        async autenticar() {
            try {
                const response = await fetch(`${API_URL}/validarUsuario?usuario=${this.nomedousuario}&senha=${this.password}`, {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json'
                    }
                });
                if (!response.ok) {
                    this.exibirErro = true;
                } else {
                    this.exibirErro = false;
                    this.exibirFormulario = false; // Esconde o formulário de cadastro após autenticar
                    window.location.href = 'game.html'; // Redireciona para a página do jogo
                }
                console.log('Usuário validado com sucesso.');
            } catch (error) {
                console.error('Erro ao validar usuário:', error);
            }
        }
    }
});

app.mount('#app');
