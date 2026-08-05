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
const generateShoppingList = async (req, res) => {
  const { items } = req.body;

  if (!items || items.length === 0) {
    return res.status(400).json({ message: "No items provided" });
  }

  try {
    const itemsList = items.map(i => 
      `${i.name} (${i.quantity} ${i.unit} left, threshold: ${i.lowStockThreshold})`
    ).join(", ");

    const response = await ai.models.generateContent({
      model: 'gemini-3.6-flash',
      contents: `You are a smart grocery assistant. Based on these low/out of stock items: ${itemsList}
      
      Generate a shopping list in JSON format only, no extra text:
      {
        "shoppingList": [
          {
            "name": "item name",
            "quantity": suggested quantity to buy as number,
            "unit": "unit",
            "reason": "why to buy this"
          }
        ],
        "summary": "a friendly one line summary"
      }`,
    });

    const text = response.text.trim()
      .replace(/```json/g, '')
      .replace(/```/g, '')
      .trim();

    const parsed = JSON.parse(text);
    res.status(200).json(parsed);

  } catch (error) {
    console.error("Shopping List Error:", error.message);

    if (error?.status === 429 || error?.message?.includes("429")) {
      return res.status(429).json({
        message: "Rate limit reached. Please wait and try again."
      });
    }

    return res.status(500).json({ message: "AI service error" });
  }
};

module.exports = { autoFillItem, generateShoppingList  };