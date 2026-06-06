import { NextRequest, NextResponse } from 'next/server';

const GEMINI_URL =
  'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent';

async function callGemini(prompt: string) {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    throw new Error('GEMINI_API_KEY is not configured');
  }

  const res = await fetch(`${GEMINI_URL}?key=${apiKey}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      contents: [
        {
          parts: [{ text: prompt }],
        },
      ],
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 1024,
      },
    }),
  });

  const data = await res.json();

  if (!res.ok) {
    console.error('Gemini HTTP Error:', {
      status: res.status,
      statusText: res.statusText,
      data,
    });

    throw new Error(
      data?.error?.message ||
        `Gemini API Error (${res.status})`
    );
  }

  const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;

  if (!text) {
    console.error('Gemini Invalid Response:', data);
    throw new Error('Gemini returned no response');
  }

  return text;
}

async function callGeminiChat(
  systemPrompt: string,
  history: any[],
  userMessage: string
) {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    throw new Error('GEMINI_API_KEY is not configured');
  }

  const contents = [
    {
      role: 'user',
      parts: [{ text: systemPrompt }],
    },
    {
      role: 'model',
      parts: [
        {
          text: 'Understood. I will follow these instructions.',
        },
      ],
    },
    ...history.map((m: any) => ({
      role: m.role === 'user' ? 'user' : 'model',
      parts: [{ text: m.content }],
    })),
    {
      role: 'user',
      parts: [{ text: userMessage }],
    },
  ];

  const res = await fetch(`${GEMINI_URL}?key=${apiKey}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      contents,
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 512,
      },
    }),
  });

  const data = await res.json();

  if (!res.ok) {
    console.error('Gemini HTTP Error:', {
      status: res.status,
      statusText: res.statusText,
      data,
    });

    throw new Error(
      data?.error?.message ||
        `Gemini API Error (${res.status})`
    );
  }

  const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;

  if (!text) {
    console.error('Gemini Invalid Response:', data);
    throw new Error('Gemini returned no response');
  }

  return text;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { feature } = body;

    if (feature === 'resume_screen') {
      const { resume, jobDescription } = body;

      const prompt = `You are an expert HR recruiter. Analyze this resume against the job description.

JOB DESCRIPTION:
${jobDescription}

RESUME:
${resume}

Respond with ONLY valid JSON, no extra text, no markdown:
{
  "score": <number 0-100>,
  "recommendation": "<Strongly Recommend | Recommend | Maybe | Do Not Recommend>",
  "strengths": ["<strength1>", "<strength2>", "<strength3>"],
  "weaknesses": ["<weakness1>", "<weakness2>"],
  "summary": "<2-3 sentence overall assessment>"
}`;

      let result = await callGemini(prompt);
      result = result.replace(/```json|```/g, '').trim();

      const parsed = JSON.parse(result);

      return NextResponse.json(parsed);
    }

    if (feature === 'hr_chat') {
      const { message, history } = body;

      const systemPrompt = `You are an intelligent HR assistant for FWC IT Services HRMS.

Help employees with HR queries in a friendly, professional tone.

Key policies:
- Casual leave: 12 days/year
- Sick leave: 10 days/year
- Earned leave: 15 days/year
- Office hours: 9am-6pm, late after 10am
- Payroll: processed on last working day of month
- Performance reviews: conducted quarterly

Keep answers concise and helpful.`;

      const reply = await callGeminiChat(
        systemPrompt,
        history,
        message
      );

      return NextResponse.json({ reply });
    }

    if (feature === 'perf_review') {
      const {
        employeeName,
        designation,
        rating,
        kpis,
        feedback,
      } = body;

      const prompt = `You are an expert HR professional. Generate a performance review.

Employee: ${employeeName}
Designation: ${designation}
Rating: ${rating}/5
KPIs/Goals: ${kpis}
Manager Feedback: ${feedback}

Respond with ONLY valid JSON, no extra text, no markdown:
{
  "summary": "<3-4 sentence professional summary>",
  "achievements": ["<achievement1>", "<achievement2>", "<achievement3>"],
  "improvements": ["<area1>", "<area2>"],
  "training": ["<recommendation1>", "<recommendation2>"],
  "overallVerdict": "<Exceptional | Exceeds Expectations | Meets Expectations | Needs Improvement>"
}`;

      let result = await callGemini(prompt);
      result = result.replace(/```json|```/g, '').trim();

      const parsed = JSON.parse(result);

      return NextResponse.json(parsed);
    }

    if (feature === 'recruit_chat') {
      const {
        jobTitle,
        jobDescription,
        candidateMessage,
        history,
      } = body;

      const systemPrompt = `You are an AI interviewer conducting a screening interview for ${jobTitle}.

Job Description:
${jobDescription}

Ask relevant technical and behavioral questions one at a time.

After each answer give brief feedback then ask the next question.

After 4-5 questions provide a final assessment score out of 10.

Be encouraging but objective.`;

      const reply = await callGeminiChat(
        systemPrompt,
        history,
        candidateMessage
      );

      return NextResponse.json({ reply });
    }

    return NextResponse.json(
      { message: 'Unknown feature' },
      { status: 400 }
    );
  } catch (err: any) {
    console.error('AI Error:', err);

    return NextResponse.json(
      {
        message: err.message || 'Internal Server Error',
      },
      { status: 500 }
    );
  }
}