
import { GoogleGenAI } from "@google/genai";
import { Transaction, Category } from '../types';

if (!process.env.API_KEY) {
    throw new Error("API_KEY environment variable not set");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const SYSTEM_INSTRUCTION = `Você é um assistente de finanças pessoais amigável e perspicaz chamado Amigo Orçamentário Gemini.
Sua principal função é analisar os dados de transação do usuário para fornecer insights acionáveis e conselhos personalizados.
Analise os dados fornecidos para responder à consulta do usuário com precisão.

Ao analisar, procure ativamente por:
1.  **Padrões de Gastos:** Identifique as 3 principais categorias de despesas e mencione o valor total gasto em cada uma.
2.  **Oportunidades de Economia:** Com base nos padrões, sugira áreas específicas onde o usuário pode economizar. Por exemplo, "Notei que seus gastos com Restaurantes foram de R$X este mês. Talvez cozinhar em casa algumas vezes por semana possa ajudar a reduzir essa despesa."
3.  **Alertas de Gastos Excessivos:** Compare o total de despesas com o total de receitas. Se as despesas estiverem altas (por exemplo, acima de 80% da renda), alerte o usuário gentilmente e ofeça ajuda para criar um plano.
4.  **Análise de Consulta:** Responda diretamente à pergunta específica do usuário.

Forneça insights financeiros claros, concisos e úteis. Use formatação como listas ou texto em negrito para melhorar a legibilidade. Seja sempre encorajador e solidário.
Não invente transações ou valores; baseie sua análise estritamente nos dados fornecidos.`;

export const getAiBudgetAnalysis = async (
    query: string, 
    transactions: Transaction[], 
    summary: { totalIncome: number, totalExpenses: number }
): Promise<string> => {
    const modelName = 'gemma-3n-e2b';
    
    const prompt = `
      Resumo Financeiro do Período:
      - Renda Total: R$ ${summary.totalIncome.toFixed(2)}
      - Despesas Totais: R$ ${summary.totalExpenses.toFixed(2)}

      Consulta do Usuário: "${query}"

      Dados Detalhados da Transação:
      ${JSON.stringify(transactions, null, 2)}
    `;

    try {
        const response = await ai.models.generateContent({
            model: modelName,
            contents: prompt,
            config: {
                systemInstruction: SYSTEM_INSTRUCTION,
                temperature: 0.5,
                topP: 0.95,
                topK: 64,
                thinkingConfig: { thinkingBudget: 32768 }
            },
        });

        return response.text;
    } catch (error) {
        console.error("Erro ao chamar a API Gemini:", error);
        return "Desculpe, encontrei um erro ao analisar seu orçamento. Verifique o console para mais detalhes e tente novamente.";
    }
};

export const suggestCategory = async (description: string, categories: Category[], transactionType: 'income' | 'expense'): Promise<string> => {
    const modelName = 'gemini-2.5-flash';

    const incomeCategories = ['Salário', 'Freelance'];
    const filteredCategories = transactionType === 'income' 
        ? incomeCategories 
        : categories.filter(c => !incomeCategories.includes(c) && !c.startsWith('Salário') && !c.startsWith('Freelance'));

    const prompt = `
        Analise a seguinte descrição de transação e sugira a categoria mais apropriada da lista fornecida.
        Responda APENAS com a string da categoria que melhor corresponde. Não adicione nenhuma explicação ou formatação.

        Descrição da Transação: "${description}"

        Categorias Disponíveis:
        ${filteredCategories.join('\n')}
    `;

    try {
        const response = await ai.models.generateContent({
            model: modelName,
            contents: prompt,
            config: {
                temperature: 0.1,
            },
        });

        const suggestedCategory = response.text.trim();
        const cleanedSuggestion = suggestedCategory.split('\n')[0].trim();
        
        if (filteredCategories.includes(cleanedSuggestion)) {
            return cleanedSuggestion;
        } else {
            console.warn(`O modelo sugeriu uma categoria que não está na lista: "${cleanedSuggestion}". Usando fallback.`);
            return categories.find(c => c === 'Sem Categoria') || categories[0];
        }
    } catch (error) {
        console.error("Erro ao chamar a API Gemini para sugestão de categoria:", error);
        return "Sem Categoria";
    }
};
