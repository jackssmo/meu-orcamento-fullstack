// middleware/auth.js

const jwt = require('jsonwebtoken');

const auth = (req, res, next) => {
  try {
    // Pega o token do cabeçalho da requisição
    // O formato esperado é "Bearer TOKEN_GIGANTE"
    const token = req.header('Authorization').replace('Bearer ', '');

    // Verifica se o token é válido usando o mesmo segredo que usamos para criá-lo
    const decoded = jwt.verify(token, 'SEU_SEGREDO_SUPER_SECRETO');

    // Adiciona as informações do usuário (que estavam no token) na requisição
    req.user = decoded;

    // Deixa a requisição continuar para a rota final
    next();
  } catch (error) {
    res.status(401).send({ error: 'Autenticação falhou. Por favor, envie um token válido.' });
  }
};

module.exports = auth;