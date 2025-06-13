/**
 * @swagger
 * /auth/login:
 *   post:
 *     summary: Login para obtener token JWT
 *     tags:
 *       - Autenticación
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               username:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Token generado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 token:
 *                   type: string
 *       401:
 *         description: Credenciales inválidas
 */

const express = require('express');
const jwt = require('jsonwebtoken');
const router = express.Router();

router.post('/login', (req, res) => {
  const { username, password } = req.body;

  if (username !== 'admin' || password !== '1234') {
    return res.status(401).json({ message: 'Credenciales inválidas' });
  }

  const token = jwt.sign({ username }, process.env.ACCESS_TOKEN_SECRET, {
    expiresIn: '1d',
  });

  res.json({ token });
});

module.exports = router;

