export default async function handler(req, res) {
  // CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Resposta rápida para requisições OPTIONS (preflight)
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { message } = req.body;

  if (!message) {
    return res.status(400).json({ error: 'Mensagem não fornecida' });
  }

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: 'gpt-4o', // Confirme que esse modelo está habilitado para sua chave
        messages: [
          {
            role: 'system',
            content: 'Você é um conselheiro experiente em liderança no agronegócio. Responda de forma clara, estratégica e aplicada à realidade do agro brasileiro.'
          },
          {
            role: 'user',
            content: message
          }
        ]
      })
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('Erro da OpenAI:', data);
      return res.status(500).json({ error: data.error?.message || 'Erro inesperado da OpenAI' });
    }

    const reply = data.choices?.[0]?.message?.content;

    if (!reply) {
      return res.status(500).json({ error: 'Resposta vazia da OpenAI' });
    }

    res.status(200).json({ reply });
  } catch (error) {
    console.error('Erro ao chamar OpenAI:', error);
    res.status(500).json({ error: 'Erro ao processar a resposta' });
  }
}
