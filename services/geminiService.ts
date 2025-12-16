import { GoogleGenAI, Type } from "@google/genai";
import { Transaction, AIReport } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const MODEL_FAST = 'gemini-2.5-flash';

// Analyze financial data to generate a report
export const generateFinancialReport = async (transactions: Transaction[]): Promise<AIReport> => {
  const transactionData = JSON.stringify(transactions.map(t => ({
    date: t.date,
    desc: t.description,
    amt: t.amount,
    type: t.type,
    cat: t.category
  })));

  const currentDate = new Date().toLocaleDateString('en-NG', { year: 'numeric', month: 'long', day: 'numeric' });

  const prompt = `
    You are an expert Chartered Accountant and Independent Auditor acting for a Nigerian company "Acme Corp Ltd".
    
    Task: Prepare a standard "Audited Financial Statement" based on the provided transaction ledger.
    The report must comply with IFRS and the Nigerian Finance Act.

    Transactions:
    ${transactionData}

    Instructions:
    1. Prepare a "Statement of Profit or Loss and Other Comprehensive Income".
       - Categorize transactions into Revenue, Cost of Sales (if applicable, otherwise 0), and Operating Expenses.
       - Calculate Gross Profit, Operating Profit, and Net Profit.
       - ESTIMATE Taxation (CIT @ 30% of profit if profitable, otherwise 0) and Education Tax if applicable.
    
    2. Prepare a "Statement of Financial Position" (Balance Sheet).
       - Assume the net difference in cash flow resides in "Cash and Cash Equivalents" under Current Assets.
       - Classify items like "Rent" as expenses, but if there are asset purchases (e.g., Computers, Furniture), classify them as Non-Current Assets.
       - Calculate Retained Earnings (Equity) based on the Net Profit.
       - Ensure the Balance Sheet balances (Assets = Liabilities + Equity).

    3. Provide an "Independent Auditor's Opinion" summarizing the financial state and compliance.

    4. Provide "Notes to the Accounts" explaining the basis of preparation (e.g., "The financial statements have been prepared in accordance with IFRS...").

    Response Format: Return ONLY valid JSON matching the schema provided.
  `;

  try {
    const response = await ai.models.generateContent({
      model: MODEL_FAST,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            statementDate: { type: Type.STRING },
            companyName: { type: Type.STRING },
            auditorOpinion: { type: Type.STRING },
            incomeStatement: {
              type: Type.OBJECT,
              properties: {
                revenueItems: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { description: {type: Type.STRING}, amount: {type: Type.NUMBER} } } },
                totalRevenue: { type: Type.NUMBER },
                costOfSalesItems: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { description: {type: Type.STRING}, amount: {type: Type.NUMBER} } } },
                totalCostOfSales: { type: Type.NUMBER },
                grossProfit: { type: Type.NUMBER },
                operatingExpenses: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { description: {type: Type.STRING}, amount: {type: Type.NUMBER} } } },
                totalOperatingExpenses: { type: Type.NUMBER },
                operatingProfit: { type: Type.NUMBER },
                taxation: { type: Type.NUMBER },
                netProfit: { type: Type.NUMBER },
              }
            },
            balanceSheet: {
              type: Type.OBJECT,
              properties: {
                currentAssets: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { description: {type: Type.STRING}, amount: {type: Type.NUMBER} } } },
                nonCurrentAssets: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { description: {type: Type.STRING}, amount: {type: Type.NUMBER} } } },
                totalAssets: { type: Type.NUMBER },
                currentLiabilities: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { description: {type: Type.STRING}, amount: {type: Type.NUMBER} } } },
                nonCurrentLiabilities: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { description: {type: Type.STRING}, amount: {type: Type.NUMBER} } } },
                totalLiabilities: { type: Type.NUMBER },
                equityItems: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { description: {type: Type.STRING}, amount: {type: Type.NUMBER} } } },
                totalEquity: { type: Type.NUMBER },
              }
            },
            notesToAccounts: { type: Type.ARRAY, items: { type: Type.STRING } }
          }
        }
      }
    });

    const text = response.text;
    if (!text) throw new Error("No response from AI");
    
    const result = JSON.parse(text);
    
    return {
      ...result,
      generatedAt: new Date().toISOString()
    };
  } catch (error) {
    console.error("Report Generation Error:", error);
    throw new Error("Failed to generate financial report.");
  }
};

// Chat with the Tax AI
export const getTaxAdvice = async (history: { role: string, content: string }[], newMessage: string): Promise<string> => {
  try {
    const chat = ai.chats.create({
      model: MODEL_FAST,
      config: {
        systemInstruction: "You are 'LedgerBot', a helpful AI Accountant for Nigerian businesses. You know about FIRS, VAT (7.5%), CIT (30% for large, 20% for medium, 0% for small), and Withholding Tax. Keep answers professional but accessible to SMEs.",
      },
      history: history.map(h => ({
        role: h.role,
        parts: [{ text: h.content }]
      }))
    });

    const response = await chat.sendMessage({ message: newMessage });
    return response.text || "I apologize, I could not generate a response at this time.";
  } catch (error) {
    console.error("Chat Error:", error);
    return "I am currently experiencing high traffic. Please try again later.";
  }
};

// Auto-categorize a transaction description
export const suggestCategory = async (description: string): Promise<string> => {
    try {
        const response = await ai.models.generateContent({
            model: MODEL_FAST,
            contents: `Categorize this transaction description into one word (e.g., Marketing, Utilities, Payroll, Inventory, Sales, Logistics): "${description}"`,
            config: {
                maxOutputTokens: 10,
                temperature: 0.2
            }
        });
        return response.text?.trim() || "Uncategorized";
    } catch (e) {
        return "General";
    }
}