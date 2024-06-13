const express = require('express');
const path = require('path');
const sql = require('mssql');
const cors = require('cors');

const app = express();
const PORT = 3000;

const config = {
    user: 'morerao',
    password: 'Gustavo1210',
    server: 'morerao-server.database.windows.net',
    database: 'heroivilao',
    options: {
        encrypt: true,
        enableArithAbort: true
    }
};

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'front-game')));

// Endpoint para inserir dados de manutenção
app.post('/inserirManutencao', async (req, res) => {
    const { veiculo, peca, quilometragemAtual, quilometragemTroca } = req.body;

    try {
        await sql.connect(config);
        const request = new sql.Request();
        request.input('veiculo', sql.NVarChar, veiculo);
        request.input('peca', sql.NVarChar, peca);
        request.input('quilometragemAtual', sql.Int, quilometragemAtual);
        request.input('quilometragemTroca', sql.Int, quilometragemTroca);
        
        await request.query(`
            INSERT INTO personagem (veiculo, peca, quilometragem_atual, quilometragem_troca)
            VALUES (@veiculo, @peca, @quilometragemAtual, @quilometragemTroca);
        `);
        res.status(200).send('Informações de manutenção inseridas com sucesso.');
    } catch (err) {
        console.error(err);
        res.status(500).send('Erro ao inserir informações de manutenção.');
    }
});

// Endpoint para atualizar a vida do herói e vilão
app.post('/atualizarVida', async (req, res) => {
    const { vidaHeroi, vidaVilao } = req.body;
    try {
        await sql.connect(config);
        const request = new sql.Request();
        await request.query(`
            MERGE INTO personagem AS target
            USING (VALUES ('heroi', ${vidaHeroi}), ('vilao', ${vidaVilao})) AS source (nome, vida)
            ON target.nome = source.nome
            WHEN MATCHED THEN
                UPDATE SET vida = source.vida
            WHEN NOT MATCHED THEN
                INSERT (nome, vida) VALUES (source.nome, source.vida);
        `);
        res.status(200).send('Vida do herói e do vilão atualizada com sucesso.');
    } catch (err) {
        console.error(err);
        res.status(500).send('Erro ao atualizar a vida do herói e do vilão.');
    }
});

// Endpoint para buscar dados do herói e vilão
app.get('/characters', async (req, res) => {
    try {
        await sql.connect(config);
        const request = new sql.Request();
        const heroResult = await request.query("SELECT * FROM personagem WHERE nome = 'heroi'");
        const heroi = heroResult.recordset[0];
        const villainResult = await request.query("SELECT * FROM personagem WHERE nome = 'vilao'");
        const vilao = villainResult.recordset[0];
        res.json({ heroi, vilao });
    } catch (error) {
        console.error('Erro ao buscar dados do herói e do vilão:', error);
        res.status(500).json({ error: 'Erro ao buscar dados do herói e do vilão.' });
    }
});

// Endpoint para inserir ou atualizar usuário
app.post('/inserirUsuario', async (req, res) => {
    const { usuario, senha } = req.body;
    try {
        await sql.connect(config);
        const request = new sql.Request();
        await request.query(`
            MERGE INTO usuario AS target
            USING (VALUES ('${usuario}', '${senha}')) AS source (usuario, senha)
            ON target.usuario = source.usuario
            WHEN MATCHED THEN
                UPDATE SET senha = source.senha
            WHEN NOT MATCHED THEN
                INSERT (usuario, senha) VALUES (source.usuario, source.senha);
        `);
        res.status(200).send('Usuario cadastrado com sucesso.');
    } catch (err) {
        console.error(err);
        res.status(500).send('Erro ao inserir usuario.');
    }
});

// Endpoint para validar usuário
app.get('/validarUsuario', async (req, res) => {
    try {
        const { usuario, senha } = req.query;
        await sql.connect(config);
        const request = new sql.Request();
        const userResult = await request.query(`SELECT * FROM usuario WHERE usuario = '${usuario}' AND senha = '${senha}'`);
        const user = userResult.recordset[0];
        if (user === undefined) {
            return res.status(404).json({ error: 'Usuario não cadastrado' });
        }
        return res.json({ usuario, senha });
    } catch (error) {
        res.status(500).json({ error: 'Erro ao buscar dados do usuario.' });
    }
});

// Endpoint para gerar relatório da tabela personagem
app.get('/relatorioPersonagem', async (req, res) => {
    try {
        await sql.connect(config);
        const request = new sql.Request();
        const result = await request.query("SELECT * FROM personagem");
        res.json(result.recordset);
    } catch (error) {
        console.error('Erro ao buscar dados da tabela personagem:', error);
        res.status(500).json({ error: 'Erro ao buscar dados da tabela personagem.' });
    }
});

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'front-game/login.html'));
});

app.get('/game', (req, res) => {
    res.sendFile(path.join(__dirname, 'front-game/game.html'));
});

app.get('/dashboard', (req, res) => {
    res.sendFile(path.join(__dirname, 'front-game/dashboard.html'));
});

app.listen(PORT, () => {
    console.log(`Servidor Express rodando na porta ${PORT}`);
});
