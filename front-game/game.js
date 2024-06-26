<!DOCTYPE html>
<html lang="pt-br">
<head>
    <meta charset="UTF-8">
    <title>Dashboard - Jogo Herói e Vilão</title>
    <link rel="stylesheet" href="dashboard-style.css">
</head>
<body>
    <div id="app" class="container">
        <h1>Dashboard</h1>
        <div class="personagens">
            <div class="personagem">
                <h2>Herói</h2>
                <div>Vida: {{ heroi.vida }}%</div>
            </div>
            <div class="personagem">
                <h2>Vilão</h2>
                <div>Vida: {{ vilao.vida }}%</div>
            </div>
        </div>
        <button @click="atacar(true)">Herói Atacar</button>
        <button @click="atacar(false)">Vilão Atacar</button>
    </div>
    <script src="https://cdn.jsdelivr.net/npm/vue@2"></script>
    <script>
        const { createApp } = Vue;
        const API_URL = 'https://tarefadatabase.vercel.app';

        createApp({
            data() {
                return {
                    heroi: { vida: 100 },
                    vilao: { vida: 100 }            
                };        
            },
            mounted() {
                this.fetchCharacterData();
            },
            methods: {
                async fetchCharacterData() {
                    try {
                        const response = await fetch(`${API_URL}/characters`);
                        if (!response.ok) {
                            throw new Error('Erro ao buscar dados dos personagens.');
                        }
                        const data = await response.json();
                        this.heroi.vida = data.heroi.vida;
                        this.vilao.vida = data.vilao.vida;
                    } catch (error) {
                        console.error('Erro ao buscar dados dos personagens:', error);
                    }
                },
                async atualizarVidaNoBancoDeDados(vidaHeroi, vidaVilao) {
                    try {
                        const response = await fetch(`${API_URL}/atualizarVida`, {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json'
                            },
                            body: JSON.stringify({ vidaHeroi, vidaVilao })
                        });
                        if (!response.ok) {
                            throw new Error('Erro ao atualizar a vida no banco de dados.');
                        }
                        console.log('Vida do herói e do vilão atualizada com sucesso.');
                        this.fetchCharacterData(); // Atualizar os dados no frontend após a atualização no banco de dados
                    } catch (error) {
                        console.error('Erro ao atualizar a vida no banco de dados:', error);
                    }
                },
                atacar(isHeroi) {
                    if (isHeroi) {
                        this.vilao.vida -= 10;
                        this.atualizarVidaNoBancoDeDados(this.heroi.vida, this.vilao.vida);
                        this.acaoVilao();
                    } else {
                        this.heroi.vida -= 20;
                        this.atualizarVidaNoBancoDeDados(this.heroi.vida, this.vilao.vida);
                    }
                },
                defender(isHeroi) {
                    this.acaoVilao();
                },
                usarPocao(isHeroi) {
                    if (isHeroi) {
                        this.heroi.vida += 10;
                        this.atualizarVidaNoBancoDeDados(this.heroi.vida, this.vilao.vida);
                        this.acaoVilao();
                    } else {
                        this.vilao.vida += 10;
                        this.atualizarVidaNoBancoDeDados(this.heroi.vida, this.vilao.vida);
                    }
                },
                correr(isHeroi) {
                    this.acaoVilao();
                },
                acaoVilao() {
                    const acoes = ['atacar', 'defender', 'usarPocao', 'correr'];
                    const acaoAleatoria = acoes[Math.floor(Math.random() * acoes.length)];
                    this[acaoAleatoria](false);
                    console.log('O vilão usou: ' + acaoAleatoria)
                }
            }
        }).mount("#app");
    </script>
</body>
</html>
