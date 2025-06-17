require('dotenv').config();
const express = require('express');

const router = express.Router();
const verifyToken = require('../middlewares/verifyToken');
const validator = require('../middlewares/validator');
const WhatsAppService = require('../services/baileys');
const { sendText, checkNumber } = require('../validators/message');

const multer = require('multer');
const upload = multer(); // Para manejar multipart/form-data


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
 * /session/enviar-audio-base64:
 *   post:
 *     summary: Enviar audio a un número de WhatsApp usando base64
 *     tags:
 *       - Mensajes
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - to
 *               - base64
 *             properties:
 *               to:
 *                 type: string
 *                 description: Número de WhatsApp con o sin @s.whatsapp.net
 *                 example: 5491122334455
 *               base64:
 *                 type: string
 *                 description: Audio codificado en base64
 *               mimetype:
 *                 type: string
 *                 example: audio/ogg
 *     responses:
 *       200:
 *         description: Audio enviado correctamente
 */
router.post('/enviar-audio-base64', verifyToken, async (req, res) => {
  try {
    let { to, base64, mimetype } = req.body;

    if (!to || !base64) {
      return res.sendError(400, 'Faltan campos requeridos: to, base64');
    }

    if (!to.includes('@')) {
      to += '@s.whatsapp.net';
    }

    const buffer = Buffer.from(base64, 'base64');
    await WhatsAppService.enviarAudio(to, buffer, mimetype || 'audio/ogg');

    res.sendResponse(200, { success: true, message: 'Audio enviado' });
  } catch (error) {
    res.sendError(500, error);
  }
});

/**
 * @swagger
 * /session/enviar-audio-file:
 *   post:
 *     summary: Enviar audio a un número de WhatsApp usando archivo .ogg
 *     tags:
 *       - Mensajes
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - to
 *               - file
 *             properties:
 *               to:
 *                 type: string
 *                 description: Número de WhatsApp con o sin @s.whatsapp.net
 *                 example: 5491122334455
 *               file:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Audio enviado correctamente
 */
router.post('/enviar-audio-file', verifyToken, upload.single('file'), async (req, res) => {
  try {
    let { to } = req.body;
    const audioBuffer = req.file?.buffer;
    const mimetype = req.file?.mimetype;

    if (!to || !audioBuffer) {
      return res.sendError(400, 'Faltan campos requeridos: to, file');
    }

    if (!to.includes('@')) {
      to += '@s.whatsapp.net';
    }

    await WhatsAppService.enviarAudio(to, audioBuffer, mimetype || 'audio/ogg');

    res.sendResponse(200, { success: true, message: 'Audio enviado' });
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
