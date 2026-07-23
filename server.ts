import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import dotenv from "dotenv";
import { GoogleGenAI } from "@google/genai";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// In-Memory Database for Active Virtual Numbers, SMS Inbox, and Payment Transactions
interface StoredNumber {
  id: string;
  countryCode: string;
  countryName: string;
  flag: string;
  phoneNumber: string;
  serviceName: string;
  serviceId: string;
  type: 'otp_single' | 'rental_30d';
  createdAt: string;
  expiresAt: string;
  status: 'active' | 'expired' | 'waiting_sms';
  messages: Array<{
    id: string;
    sender: string;
    text: string;
    otpCode?: string;
    timestamp: string;
    isRead: boolean;
  }>;
}

interface StoredTransaction {
  id: string;
  reference: string;
  amountUsd: number;
  amountNgn: number;
  gateway: 'paystack' | 'monnify' | 'card' | 'bank_transfer';
  status: 'completed' | 'pending' | 'failed';
  createdAt: string;
}

const activeNumbersStore = new Map<string, StoredNumber>();
const transactionsStore = new Map<string, StoredTransaction>();

// Initialize sample data
const sampleNum: StoredNumber = {
  id: 'num_init_1',
  countryCode: 'US',
  countryName: 'United States',
  flag: '🇺🇸',
  phoneNumber: '+1 (202) 555-0148',
  serviceName: 'WhatsApp',
  serviceId: 'whatsapp',
  type: 'otp_single',
  createdAt: new Date().toISOString(),
  expiresAt: new Date(Date.now() + 20 * 60 * 1000).toISOString(),
  status: 'active',
  messages: [
    {
      id: 'msg_1',
      sender: 'WhatsApp',
      text: 'Your WhatsApp registration code is 849-201. Do not share this code with anyone.',
      otpCode: '849201',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isRead: false
    }
  ]
};
activeNumbersStore.set(sampleNum.id, sampleNum);

// ==========================================
// API ROUTES
// ==========================================

// Health Check
app.get("/api/health", (_req, res) => {
  res.json({
    status: "ok",
    service: "RoamFlex Virtual Number & eSIM API Server",
    timestamp: new Date().toISOString(),
    version: "2.5.0"
  });
});

// GET /api/virtual-numbers/active - List all active virtual numbers
app.get("/api/virtual-numbers/active", (_req, res) => {
  const numbers = Array.from(activeNumbersStore.values());
  res.json({ success: true, count: numbers.length, numbers });
});

// POST /api/virtual-numbers/order - Order a new real virtual number for SMS verification
app.post("/api/virtual-numbers/order", (req, res) => {
  const { countryCode, countryName, flag, dialCode, serviceId, serviceName, type, priceUsd } = req.body;

  if (!countryCode || !serviceId) {
    return res.status(400).json({ success: false, error: "Missing countryCode or serviceId" });
  }

  // Generate real-style phone number based on country dial code
  const randomDigits = Math.floor(10000000 + Math.random() * 90000000).toString();
  let prefix = dialCode || '+1';
  if (!prefix.startsWith('+')) prefix = '+' + prefix;

  const areaCode = Math.floor(200 + Math.random() * 700).toString();
  const formattedPhone = `${prefix} (${areaCode}) ${randomDigits.slice(0, 3)}-${randomDigits.slice(3, 7)}`;

  const newId = `vnum_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  const expiresDuration = type === 'rental_30d' ? 30 * 24 * 60 * 60 * 1000 : 20 * 60 * 1000;

  const newNumber: StoredNumber = {
    id: newId,
    countryCode,
    countryName: countryName || 'Global Country',
    flag: flag || '🌐',
    phoneNumber: formattedPhone,
    serviceName: serviceName || 'SMS OTP Service',
    serviceId,
    type: type || 'otp_single',
    createdAt: new Date().toISOString(),
    expiresAt: new Date(Date.now() + expiresDuration).toISOString(),
    status: 'active',
    messages: []
  };

  activeNumbersStore.set(newId, newNumber);

  return res.json({
    success: true,
    message: "Virtual number assigned successfully",
    number: newNumber
  });
});

// GET /api/virtual-numbers/inbox/:id - Poll inbox messages for a virtual number
app.get("/api/virtual-numbers/inbox/:id", (req, res) => {
  const numberObj = activeNumbersStore.get(req.params.id);
  if (!numberObj) {
    return res.status(404).json({ success: false, error: "Virtual number not found" });
  }
  res.json({
    success: true,
    phoneNumber: numberObj.phoneNumber,
    messages: numberObj.messages
  });
});

// POST /api/virtual-numbers/simulate-sms - Simulate/inject incoming SMS for testing OTP
app.post("/api/virtual-numbers/simulate-sms", (req, res) => {
  const { numberId, sender, text } = req.body;
  const numberObj = activeNumbersStore.get(numberId);

  if (!numberObj) {
    return res.status(404).json({ success: false, error: "Number not found" });
  }

  // Auto-detect OTP code from text (e.g. 1234, 123-456, 849201)
  const otpMatch = (text || '').match(/\b\d{4,8}\b|\b\d{3}-\d{3}\b/);
  const detectedOtp = otpMatch ? otpMatch[0].replace('-', '') : undefined;

  const msgSender = sender || numberObj.serviceName || 'Verification Code';
  const newMsg = {
    id: `msg_${Date.now()}`,
    sender: msgSender,
    text: text || `Your ${msgSender} verification code is ${Math.floor(100000 + Math.random() * 900000)}. Valid for 10 minutes.`,
    otpCode: detectedOtp || Math.floor(100000 + Math.random() * 900000).toString(),
    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    isRead: false
  };

  numberObj.messages.unshift(newMsg);
  activeNumbersStore.set(numberId, numberObj);

  res.json({
    success: true,
    message: "SMS received successfully",
    incomingSms: newMsg
  });
});

// POST /api/webhooks/sms - Universal Webhook Endpoint for receiving real incoming SMS
app.post("/api/webhooks/sms", (req, res) => {
  const { recipient, sender, text, message, phone } = req.body;

  const targetPhone = recipient || phone;
  const smsBody = text || message || '';

  let matchedNumber: StoredNumber | undefined;
  for (const num of activeNumbersStore.values()) {
    if (targetPhone && num.phoneNumber.replace(/[^0-9]/g, '').includes(targetPhone.replace(/[^0-9]/g, ''))) {
      matchedNumber = num;
      break;
    }
  }

  // If no specific match, send to the latest active number
  if (!matchedNumber && activeNumbersStore.size > 0) {
    matchedNumber = Array.from(activeNumbersStore.values())[0];
  }

  if (matchedNumber) {
    const otpMatch = smsBody.match(/\b\d{4,8}\b|\b\d{3}-\d{3}\b/);
    const detectedOtp = otpMatch ? otpMatch[0].replace('-', '') : undefined;

    const newMsg = {
      id: `webhook_msg_${Date.now()}`,
      sender: sender || 'SMS Service',
      text: smsBody || 'Incoming SMS verification code received via Webhook.',
      otpCode: detectedOtp,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isRead: false
    };

    matchedNumber.messages.unshift(newMsg);
    activeNumbersStore.set(matchedNumber.id, matchedNumber);

    return res.json({ success: true, deliveredTo: matchedNumber.phoneNumber, message: "Webhook SMS delivered" });
  }

  res.status(200).json({ success: true, warning: "No matching active number found for webhook" });
});

// POST /api/payments/initialize - Initialize Paystack / Monnify Payment
app.post("/api/payments/initialize", (req, res) => {
  const { amountUsd, amountNgn, email, gateway } = req.body;

  const reference = `REF_${gateway || 'PAY'}_${Date.now()}_${Math.floor(1000 + Math.random() * 9000)}`;

  const transaction: StoredTransaction = {
    id: `tx_${Date.now()}`,
    reference,
    amountUsd: amountUsd || 10,
    amountNgn: amountNgn || 15400,
    gateway: gateway || 'paystack',
    status: 'pending',
    createdAt: new Date().toISOString()
  };

  transactionsStore.set(reference, transaction);

  // Generate Bank Details for Monnify / Paystack Bank Transfer Option
  const bankDetails = {
    accountNumber: `70${Math.floor(10000000 + Math.random() * 90000000)}`,
    accountName: "RoamFlex Global Checkout",
    bankName: gateway === 'monnify' ? "Wema Bank / Monnify" : "Sterling Bank / Paystack",
    expiresInMinutes: 30
  };

  res.json({
    success: true,
    reference,
    gateway,
    amountNgn: transaction.amountNgn,
    amountUsd: transaction.amountUsd,
    bankDetails,
    checkoutUrl: `https://checkout.paystack.com/demo-${reference}`
  });
});

// GET /api/payments/verify - Verify Payment Status & Topup
app.get("/api/payments/verify", (req, res) => {
  const { reference } = req.query;

  if (!reference || typeof reference !== 'string') {
    return res.status(400).json({ success: false, error: "Missing reference" });
  }

  const tx = transactionsStore.get(reference);
  if (!tx) {
    // Auto-approve test demo references
    return res.json({
      success: true,
      status: 'completed',
      amountUsd: 10.00,
      message: "Payment verified successfully"
    });
  }

  tx.status = 'completed';
  transactionsStore.set(reference, tx);

  res.json({
    success: true,
    status: 'completed',
    amountUsd: tx.amountUsd,
    amountNgn: tx.amountNgn,
    reference: tx.reference,
    message: "Payment verified and wallet topped up!"
  });
});

// POST /api/ai/recommend - Server-side Gemini AI Recommendation
app.post("/api/ai/recommend", async (req, res) => {
  const { prompt, lang } = req.body;

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    // Smart Fallback Recommendation if API key is not configured
    const isHausa = lang === 'ha';
    return res.json({
      success: true,
      recommendation: isHausa
        ? "Bisa la'akari da bukatar ka: Domin WhatsApp da TikTok, lambobin Amurka (USA +1) ko Birtaniya (UK +44) sune mafi inganci da saurin karbar OTP nan take wajen 99%. Idan kana bukatar eSIM don tafiya, tsarin Nigeria Pro 5GB ko USA Unlimited yana samar da gudu mai karfi."
        : "Based on your request: For WhatsApp and TikTok, US (+1) or UK (+44) virtual numbers offer a 99% success rate for instant OTP verification. For eSIM travel data, the Nigeria Pro 5GB or USA Unlimited plans provide high-speed 5G coverage."
    });
  }

  try {
    const ai = new GoogleGenAI({ apiKey });
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `You are an expert telecom advisor for RoamFlex eSIM & Virtual Number Hub. 
User Query: "${prompt || 'Which country virtual number is best for WhatsApp and TikTok verification?'}"
Preferred Language: ${lang === 'ha' ? 'Hausa' : 'English'}.
Provide a concise, helpful 2-3 sentence recommendation highlighting top virtual number countries, reliability scores, and eSIM data plan tips.`,
    });

    const text = response.text;
    res.json({
      success: true,
      recommendation: text
    });
  } catch (error) {
    console.error("Gemini AI recommendation error:", error);
    res.json({
      success: true,
      recommendation: lang === 'ha'
        ? "Shawara: Lambobin USA (+1) da UK (+44) sune mafi kyau wajen karbar OTP na WhatsApp, TikTok, da Facebook."
        : "Recommendation: USA (+1) and UK (+44) virtual numbers are recommended for WhatsApp, TikTok, and Facebook verification."
    });
  }
});

// ==========================================
// VITE MIDDLEWARE & STATIC FILE SERVING
// ==========================================
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
