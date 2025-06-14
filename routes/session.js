require('dotenv').config();
const express = require('express');
const QRCode = require('qrcode');

const router = express.Router();
const verifyToken = require('../middlewares/verifyToken');
const WhatsAppService = require('../services/baileys');

async function generateQRBase64(text) {
  try {
    return await QRCode.toDataURL(text, {
      errorCorrectionLevel: 'H',
      type: 'image/png',
      width: 256,
      margin: 1,
    });
  } catch (error) {
    throw new Error(`QR Code Generation Error: ${error.message}`);
  }
}

/**
 * @swagger
 * /session/start:
 *   post:
 *     summary: Inicia una nueva sesión de WhatsApp y genera un QR
 *     tags:
 *       - Session
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Devuelve el estado de la sesión y el QR en base64 si corresponde
 */
router.post('/start', verifyToken, async (req, res) => {
  try {
    const result = await WhatsAppService.initialize();

    if (!result.success) {
      res.sendError(500, result);
      return;
    }

    if (result.status === 'waiting_qr') {
      const qrBase64 = await generateQRBase64(result.qr);
      res.sendResponse(200, {
        ...result,
        qrBase64,
      });
      return;
    }

    res.sendResponse(200, result);
  } catch (error) {
    res.sendError(500, error);
  }
});

/**
 * @swagger
 * /session/status:
 *   get:
 *     summary: Verifica el estado actual de la sesión de WhatsApp
 *     tags:
 *       - Session
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Devuelve el estado de conexión actual, y QR si está esperando
 */
router.get('/status', verifyToken, async (req, res) => {
  try {
    const status = WhatsAppService.getConnectionStatus();
        const qr = WhatsAppService.getLatestQR();

    if (qr) {
      const qrBase64 = await generateQRBase64(qr);
      status.qr = qr;
      status.qrBase64 = qrBase64;
    }


    if (status.qr) {
      status.qrBase64 = await generateQRBase64(status.qr);
    }

    res.sendResponse(200, {
      success: true,
      ...status,
    });
  } catch (error) {
    res.sendError(500, error);
  }
});

/**
 * @swagger
 * /session/logout:
 *   post:
 *     summary: Cierra la sesión de WhatsApp
 *     tags:
 *       - Session
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Resultado del cierre de sesión
 */
router.post('/logout', verifyToken, async (req, res) => {
  try {
    const result = await WhatsAppService.logout();
    if (result.success) {
      res.sendResponse(200, result);
    } else {
      res.sendError(400, result);
    }
  } catch (error) {
    res.sendError(500, error);
  }
});


/**
 * @swagger
 * /session/mensajes/recibidos:
 *   get:
 *     summary: Devuelve los mensajes recibidos desde WhatsApp almacenados en memoria
 *     tags:
 *       - Session
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de mensajes recibidos
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 mensajes:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                       from:
 *                         type: string
 *                       fromMe:
 *                         type: boolean
 *                       timestamp:
 *                         type: number
 *                       type:
 *                         type: string
 *                       pushName:
 *                         type: string
 *                       content:
 *                         type: object
 */
router.get('/mensajes/recibidos', verifyToken, (req, res) => {
  const mensajes = WhatsAppService.getReceivedMessages();
  res.sendResponse(200, { mensajes });
});

/**
 * @swagger
 * /session/mensajes/recibidos:
 *   delete:
 *     summary: Elimina los mensajes en memoria
 *     tags:
 *       - Session
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Confirmación de que los mensajes fueron eliminados
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 */
router.delete('/mensajes/recibidos', verifyToken, (req, res) => {
  WhatsAppService.clearReceivedMessages();
  res.sendResponse(200, {
    success: true,
    message: 'Mensajes eliminados de memoria',
  });
});



module.exports = router;

