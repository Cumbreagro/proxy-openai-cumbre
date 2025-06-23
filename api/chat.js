export default async function handler(req, res) {
  // Headers de CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Tratamento para requisição OPTIONS (pré-flight)
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Só aceita requisição POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { message } = req.body;

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: 'gpt-4o',
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

    if (!data.choices || !data.choices[0] || !data.choices[0].message) {
      throw new Error('Resposta inesperada da API');
    }

    res.status(200).json({ reply: data.choices[0].message.content });
  } catch (error) {
    console.error('Erro ao chamar OpenAI:', error);
    res.status(500).json({ error: 'Erro ao processar a resposta' });
  }
}
