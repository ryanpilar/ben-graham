export const GPT_MODELS = {

    gpt4_0125_preview: {
      name: 'gpt-4-0125-preview',
      contextWindow: 128000,
      inputCost: 0.00001,
      outputCost: 0.00003,
      extraTokenCosts: {
        tokensPerMessage: 4,
        tokensPerName: 1,
      }
    },
    
    gpt35_turbo_0125: {
      name: 'gpt-3.5-turbo-0125',
      contextWindow: 16384,
      inputCost: 0.0000005,
      outputCost: 0.0000015,
      extraTokenCosts: {
        tokensPerMessage: 3,
        tokensPerName: 1,
      }
    },
  }