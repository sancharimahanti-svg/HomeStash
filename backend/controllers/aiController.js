const { GoogleGenAI } = require('@google/genai');

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

const autoFillItem = async (req, res) => {
  const { itemName } = req.body;

  if (!itemName) {
    return res.status(400).json({ message: "Item name is required" });
  }

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3.6-flash',
      contents: `You are a kitchen assistant. Given the grocery item "${itemName}", respond with ONLY a JSON object, no extra text:
      {
        "category": "one of: dairy/grains/snacks/beverages/vegetables/fruits/meat/oils/masala/pulses/sweets/frozen/cleaning/other",
        "unit": "one of: kg/g/litre/ml/pieces/packets",
        "expiryDays": 7,
        "lowStockThreshold": 2
      }
      Replace the numbers with appropriate values for ${itemName}.`,
    });

    const text = response.text.trim()
      .replace(/```json/g, '')
      .replace(/```/g, '')
      .trim();

    const parsed = JSON.parse(text);

    const expiryDate = new Date();
    expiryDate.setDate(expiryDate.getDate() + parsed.expiryDays);
    const formattedExpiry = expiryDate.toISOString().split("T")[0];

    res.status(200).json({
      category: parsed.category,
      unit: parsed.unit,
      expiryDate: formattedExpiry,
      lowStockThreshold: parsed.lowStockThreshold,
    });

  } catch (error) {
    console.error("AI AutoFill Error:", error.message);

    if (error?.status === 429 || error?.message?.includes("429") || error?.message?.includes("quota")) {
      return res.status(429).json({
        message: "Rate limit reached. Please wait 20 seconds and try again."
      });
    }

    return res.status(500).json({ message: "AI service error", error: error.message });
  }
};

module.exports = { autoFillItem };