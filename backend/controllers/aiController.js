const { GoogleGenerativeAI } = require("@google/generative-ai");

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// @desc    Auto-fill item details using AI
// @route   POST /api/ai/autofill
const autoFillItem = async (req, res) => {
  try {
    const { itemName } = req.body;

    if (!itemName) {
      return res.status(400).json({ message: "Item name is required" });
    }

    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    const prompt = `You are a helpful kitchen assistant. Given the item name "${itemName}", suggest the following details in JSON format only, no extra text, no markdown, no backticks:
    {
      "category": one of [dairy, grains, snacks, beverages, vegetables, fruits, meat, oils, masala, pulses, sweets, frozen, cleaning, other],
      "unit": one of [kg, g, litre, ml, pieces, packets],
      "expiryDays": number of days until typical expiry from today as a number,
      "lowStockThreshold": suggested low stock quantity as a number
    }
    Return ONLY the JSON object, nothing else.`;

    const result = await model.generateContent(prompt);
    const text = result.response.text().trim();
    const parsed = JSON.parse(text);

    // Calculate expiry date from today
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
    res.status(500).json({ message: "AI service error" });
  }
};

module.exports = { autoFillItem };