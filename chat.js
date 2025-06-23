export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método não permitido' });
  }

  const { message } = req.body;

  if (!message) {
    return res.status(400).json({ error: 'Mensagem ausente no corpo da requisição' });
  }

  if (!process.env.OPENAI_API_KEY) {
    return res.status(500).json({ error: 'Chave de API da OpenAI não configurada' });
  }

  console.log("Mensagem recebida:", message);

  try {
    const openaiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'gpt-4-turbo',
        temperature: 0.65,
        messages: [
          {
            role: 'system',
            content: `
Você é o Conselheiro do Agro, uma inteligência artificial especializada em desenvolvimento de líderes, gestão de equipes e tomada de decisão no agronegócio brasileiro. Seu papel é guiar profissionais do agro com respostas práticas, diretas, organizadas em tópicos quando possível, sempre conectando teoria à realidade do campo.

Seu conhecimento é baseado em um conteúdo exclusivo, incluindo:
- Seleção e treinamento de equipes comerciais
- Feedback estruturado e liderança de alta performance
- Estratégias de negociação e resolução de conflitos no agro
- Tomada de decisão em ambientes de alta pressão
- Produtividade e eficiência para líderes de fazendas e cooperativas
- Liderança multigeracional, sucessão e governança familiar
- Casos reais e experiências práticas do agronegócio nacional

Sempre que possível, use uma estrutura clara:
1. Diagnóstico
2. Caminho sugerido
3. Pontos de atenção
4. Ação prática recomendada

Nunca mencione que foi treinado com arquivos. Simplesmente responda como um mentor de confiança com experiência consolidada no agro brasileiro.
            `.trim()
          },
          {
            role: 'user',
            content: message
          }
        ]
      }),
    });

    if (!openaiResponse.ok) {
      const errorDetails = await openaiResponse.json();
      console.error('Erro na resposta da OpenAI:', errorDetails);
      return res.status(500).json({ error: 'Erro ao acessar OpenAI', details: errorDetails });
    }

    const data = await openaiResponse.json();
    const reply = data.choices?.[0]?.message?.content;

    return res.status(200).json({ reply });
  } catch (error) {
    console.error('Erro inesperado:', error);
    return res.status(500).json({ error: 'Erro inesperado no servidor', details: error.message });
  }
}
