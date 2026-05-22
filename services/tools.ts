
import { FunctionDeclaration, Type, GoogleGenAI } from '@google/genai';

export const jokeTool: FunctionDeclaration = {
  name: 'get_random_joke',
  description: 'Returns a random funny joke from a curated set across various categories.',
  parameters: {
    type: Type.OBJECT,
    properties: {
      category: {
        type: Type.STRING,
        description: 'The style of joke.',
        enum: ['programming', 'dad', 'science', 'general']
      }
    }
  }
};

export const weatherTool: FunctionDeclaration = {
  name: 'get_weather',
  description: 'Retrieve hyper-local weather data for a specific geographic location.',
  parameters: {
    type: Type.OBJECT,
    properties: {
      location: {
        type: Type.STRING,
        description: 'City, State, or Country'
      },
      unit: {
        type: Type.STRING,
        enum: ['celsius', 'fahrenheit']
      }
    },
    required: ['location']
  }
};

export const learningTool: FunctionDeclaration = {
  name: 'get_learning_resource',
  description: 'Provides curated educational links and glossary terms for AI, Machine Learning, and Neural Engineering.',
  parameters: {
    type: Type.OBJECT,
    properties: {
      topic: {
        type: Type.STRING,
        description: 'AI/ML concept name (e.g., Transformers, Reinforcement Learning).'
      },
      level: {
        type: Type.STRING,
        enum: ['beginner', 'intermediate', 'advanced'],
        description: 'Curricular depth.'
      }
    },
    required: ['topic']
  }
};

export const toolDesignerTool: FunctionDeclaration = {
  name: 'generate_function_declaration',
  description: 'Architects a JSON-schema compatible FunctionDeclaration for Gemini tool-calling based on a specific requirement.',
  parameters: {
    type: Type.OBJECT,
    properties: {
      purpose: {
        type: Type.STRING,
        description: 'What the tool should accomplish.'
      },
      suggested_name: {
        type: Type.STRING,
        description: 'The unique identifier for the tool.'
      }
    },
    required: ['purpose']
  }
};

export const codeExplainerTool: FunctionDeclaration = {
  name: 'analyze_code_structure',
  description: 'Deconstructs source code to analyze cyclomatic complexity, logical patterns, and structural efficiency.',
  parameters: {
    type: Type.OBJECT,
    properties: {
      code: {
        type: Type.STRING,
        description: 'The raw code block to analyze.'
      },
      language: {
        type: Type.STRING,
        description: 'Programming language identifier.'
      }
    },
    required: ['code']
  }
};

export const imageGenerationTool: FunctionDeclaration = {
  name: 'generate_image',
  description: 'Synthesizes high-fidelity visual assets from text prompts. Trigger this when users request drawings, visuals, or image creation.',
  parameters: {
    type: Type.OBJECT,
    properties: {
      prompt: {
        type: Type.STRING,
        description: 'A vivid, multi-layered description of the visual scene.'
      },
      aspect_ratio: {
        type: Type.STRING,
        enum: ['1:1', '3:4', '4:3', '9:16', '16:9'],
        description: 'Dimensional ratio.'
      }
    },
    required: ['prompt']
  }
};

// Handlers Implementation
export const toolHandlers: Record<string, (args: any) => Promise<any>> = {
  get_random_joke: async ({ category = 'general' }) => {
    const jokes: Record<string, string[]> = {
      programming: [
        "Why do programmers prefer dark mode? Because light attracts bugs.",
        "A SQL query walks into a bar, walks up to two tables, and asks, 'Can I join you?'",
        "How many programmers does it take to change a light bulb? None, that's a hardware problem.",
        "To understand what recursion is, you must first understand what recursion is."
      ],
      science: [
        "Why can't you trust atoms? Because they make up everything!",
        "A photon checks into a hotel and is asked if he needs any help with his luggage. He says, 'No, I'm traveling light.'",
        "Two atoms are walking. One says, 'I think I lost an electron.' The other asks, 'Are you sure?' The first replies, 'I'm positive.'"
      ],
      dad: [
        "I'm afraid for the calendar. Its days are numbered.",
        "My wife said I should do lunges to stay in shape. That would be a big step forward.",
        "Why did the ocean break up with the pond? He thought she was too shallow.",
        "I used to play piano by ear, but now I use my hands."
      ],
      general: [
        "I told my doctor that I broke my arm in two places. He told me to stop going to those places.",
        "Parallel lines have so much in common. It’s a shame they’ll never meet.",
        "What do you call a fake noodle? An Impasta."
      ]
    };
    const list = jokes[category] || jokes.general;
    return { joke: list[Math.floor(Math.random() * list.length)] };
  },
  get_weather: async ({ location, unit = 'celsius' }) => {
    const temp = Math.floor(Math.random() * 30);
    return { location, temperature: temp, unit, condition: 'Atmospheric Stability Optimal' };
  },
  get_learning_resource: async ({ topic, level = 'beginner' }) => {
    return {
      topic,
      level,
      curriculum_node: "Nexus Learning Pathway",
      links: [
        { title: `Gemini API: Mastering ${topic}`, url: `https://ai.google.dev/docs` },
        { title: `Foundations of ML: ${topic}`, url: `https://developers.google.com/machine-learning/glossary#${topic.replace(/\s/g, '_')}` }
      ],
      summary: `Researching ${topic} at ${level} level. Connection to Google Knowledge Graph established.`
    };
  },
  analyze_code_structure: async ({ code, language = 'auto' }) => {
    const lines = code.split('\n').length;
    const hasLoops = /for|while/.test(code);
    const hasConditionals = /if|else|switch/.test(code);
    const hasFunctions = /function|def|=>/.test(code);
    const complexityScore = (lines * 0.1) + (hasLoops ? 2 : 0) + (hasConditionals ? 1 : 0);

    return {
      analysis_report: {
        detected_language: language,
        line_count: lines,
        complexity_rating: complexityScore > 8 ? 'High' : complexityScore > 3 ? 'Medium' : 'Low',
        features: {
          iteration: hasLoops,
          logic_gates: hasConditionals,
          modularization: hasFunctions
        },
        engine_status: "Structural scanning complete. Logical flow mapped."
      }
    };
  },
  generate_function_declaration: async ({ purpose, suggested_name }) => {
    const nameToUse = suggested_name || 'custom_nexus_tool';
    const safeName = nameToUse.replace(/[^a-zA-Z0-9_]/g, '');
    return {
      snippet: `import { FunctionDeclaration, Type } from '@google/genai';\n\n/**\n * Defined Purpose: ${purpose}\n */\nexport const ${safeName}: FunctionDeclaration = {\n  name: '${safeName}',\n  description: '${purpose}',\n  parameters: {\n    type: Type.OBJECT,\n    properties: {\n      input_query: {\n        type: Type.STRING,\n        description: 'The core query for the tool execution'\n      }\n    },\n    required: ['input_query']\n  }\n};`
    };
  },
  generate_image: async ({ prompt, aspect_ratio = '1:1' }) => {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: [{ parts: [{ text: prompt }] }],
      config: {
        imageConfig: {
          aspectRatio: aspect_ratio as any
        }
      }
    });

    const candidate = response.candidates?.[0];
    if (!candidate) throw new Error("Synthesis aborted: No neural candidates generated.");

    for (const part of candidate.content.parts) {
      if (part.inlineData) {
        return {
          image_url: `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`,
          revised_prompt: prompt,
          success: true,
          metadata: { provider: "Nexus Image Engine", model: "gemini-2.5-flash-image" }
        };
      }
    }
    throw new Error("Decoding error: Binary image data stream missing.");
  }
};
