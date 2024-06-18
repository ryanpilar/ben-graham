/** ================================|| GPT Model Config ||===================================
   
    Each model configuration includes the following properties:

        name:                   Name of the model.
        contextWindow:          Context window size in tokens.
        inputCost:              Cost per input token in USD.
        outputCost:             Cost per output token in USD.
        extraTokenCosts:        Specifying additional token costs:
            tokensPerMessage:   Additional tokens added per message.
            tokensPerName:      Additional tokens added per name.                           */

export const GPT_MODELS = {

  gpt4o_2024_05_13: {
    name: 'gpt-4o-2024-05-13',
    contextWindow: 128000,
    inputCost: 0.000005,
    outputCost: 0.000015,
    extraTokenCosts: {
      tokensPerMessage: 4,
      tokensPerName: 1,
    }
  },

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