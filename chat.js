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
  console.log("API Key presente:", !!process.env.OPENAI_API_KEY);

  try {
    const openaiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'gpt-4-turbo',
        messages: [
          {
            role: 'system',
            content:
              'Você é o Conselheiro do Agro, uma inteligência artificial especializada em gestão, liderança e estratégia no agronegócio. Responda de forma clara, objetiva e prática.',
          },
          {
            role: 'user',
            content: message,
          },
        ],
        temperature: 0.7,
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
