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

app.get('/relatorioPersonagem', async (req, res) => {
    try {
        await sql.connect(config);
        const request = new sql.Request();
        const result = await request.query("SELECT veiculo, peca, quilometragem_atual, quilometragem_troca FROM personagem");
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
