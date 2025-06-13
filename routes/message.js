require('dotenv').config();
const express = require('express');

const router = express.Router();
const verifyToken = require('../middlewares/verifyToken');
const validator = require('../middlewares/validator');
const WhatsAppService = require('../services/baileys');
const { sendText, checkNumber } = require('../validators/message');




/**
 * @swagger
 * /message/check-number:
 *   post:
 *     summary: Verifica si un número tiene cuenta de WhatsApp
 *     tags:
 *       - Message
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               to:
 *                 type: string
 *                 description: Número con sufijo `@s.whatsapp.net`
 *                 example: "5491133345566@s.whatsapp.net"
 *     responses:
 *       200:
 *         description: Resultado de la validación del número
 *       400:
 *         description: Error en la solicitud
 *       500:
 *         description: Error interno del servidor
 */
router.post('/check-number', verifyToken, validator(checkNumber), async (req, res) => {
  try {
    const { to } = req.body;
    const result = await WhatsAppService.checkNumber(to);
    res.sendResponse(200, result);
  } catch (error) {
    res.sendError(500, error);
  }
});






/**
 * @swagger
 * /message/send-text:
 *   post:
 *     summary: Envía un mensaje de texto a un número de WhatsApp
 *     tags:
 *       - Message
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               to:
 *                 type: string
 *                 description: Número con sufijo `@s.whatsapp.net`
 *                 example: "5491133345566@s.whatsapp.net"
 *               message:
 *                 type: string
 *                 description: Contenido del mensaje
 *                 example: "Hola desde Swagger"
 *     responses:
 *       200:
 *         description: Mensaje enviado exitosamente
 *       400:
 *         description: Error al enviar el mensaje
 *       500:
 *         description: Error interno del servidor
 */
router.post('/send-text', verifyToken, validator(sendText), async (req, res) => {
  try {
    const { to, message } = req.body;
    const result = await WhatsAppService.sendMessage(to, message);
    if (result.status === 1) {
      res.sendResponse(200, result);
    } else {
      res.sendError(400, result);
    }
  } catch (error) {
    res.sendError(500, error);
  }
});

module.exports = router;
