export const maxDuration = 60;

export async function POST(request) {
  if (!process.env.ANTHROPIC_API_KEY || !process.env.STABILITY_API_KEY) {
    return Response.json(
      { error: 'config', message: 'API keys not configured. Add ANTHROPIC_API_KEY and STABILITY_API_KEY to .env.local' },
      { status: 500 }
    );
  }

  let imageData, mediaType;
  try {
    ({ imageData, mediaType } = await request.json());
  } catch {
    return Response.json({ error: 'invalid', message: 'Invalid request body.' }, { status: 400 });
  }

  if (!imageData || !mediaType) {
    return Response.json({ error: 'invalid', message: 'Missing imageData or mediaType.' }, { status: 400 });
  }

  // ── Step 1: Detect person via Claude vision ───────────────────
  const detectionRes = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'x-api-key':         process.env.ANTHROPIC_API_KEY,
      'anthropic-version': '2023-06-01',
      'content-type':      'application/json',
    },
    body: JSON.stringify({
      model:      'claude-haiku-4-5-20251001',
      max_tokens: 10,
      messages: [{
        role: 'user',
        content: [
          { type: 'image', source: { type: 'base64', media_type: mediaType, data: imageData } },
          { type: 'text',  text: 'Is there a clearly visible person (human being) in this image? Reply YES or NO only.' },
        ],
      }],
    }),
  });

  if (!detectionRes.ok) {
    const err = await detectionRes.text();
    console.error('Anthropic error:', err);
    return Response.json({ error: 'detection_failed', message: 'Person detection failed. Check your ANTHROPIC_API_KEY.' }, { status: 500 });
  }

  const detection = await detectionRes.json();
  const answer = (detection.content?.[0]?.text || '').trim().toUpperCase();

  if (!answer.startsWith('YES')) {
    return Response.json(
      { error: 'no_person', message: 'No person detected. Upload a photo where a person is clearly visible.' },
      { status: 400 }
    );
  }

  // ── Step 2: Transform physique via Stability AI ───────────────
  const imageBuffer = Buffer.from(imageData, 'base64');

  const form = new FormData();
  form.append('image',  new Blob([imageBuffer], { type: mediaType }), 'upload.jpg');
  form.append('prompt', [
    'extremely muscular bodybuilder physique',
    'massive bulging biceps and triceps',
    'enormous broad shoulders and thick traps',
    'huge defined chest and six pack abs',
    '20 kilograms of added muscle mass',
    'competition-ready physique',
    'same face same identity',
    'photorealistic high detail 8k',
  ].join(', '));
  form.append('negative_prompt', 'skinny, fat, deformed, ugly, blurry, low quality, distorted face, extra limbs');
  form.append('strength',       '0.6');
  form.append('output_format',  'jpeg');

  const transformRes = await fetch('https://api.stability.ai/v2beta/stable-image/generate/core', {
    method:  'POST',
    headers: {
      'Authorization': `Bearer ${process.env.STABILITY_API_KEY}`,
      'Accept':        'application/json',
    },
    body: form,
  });

  if (!transformRes.ok) {
    const errText = await transformRes.text();
    console.error('Stability AI error:', transformRes.status, errText);
    return Response.json({ error: 'transform_failed', message: 'Transformation failed. Check your STABILITY_API_KEY.' }, { status: 500 });
  }

  const result = await transformRes.json();
  return Response.json({ image: `data:image/jpeg;base64,${result.image}` });
}
