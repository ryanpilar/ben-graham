import { GPT_MODELS } from "./open-ai";

export const PLANS = [
  {
    name: 'Free',
    slug: 'free',
    quota: 10,
    pagesPerPdf: 5,
    numProjects: 1,
    numQuestions: 3,
    // gptModel: 'gpt-4-0125-preview',
    gptModel: GPT_MODELS.gpt4_0125_preview,
    vectorStoreCap: 2,
    prevMessagesCap: 5,
    price: {
      amount: 0,
      priceIds: {
        test: '',
        production: '',
      },
    },
  },
  {
    name: 'Plus',
    slug: 'plus',
    quota: 50,
    pagesPerPdf: 25,
    numProjects: 10,
    numQuestions: 30,
    // gptModel: 'gpt-3.5-turbo-0125',
    gptModel: GPT_MODELS.gpt4_0125_preview,
    vectorStoreCap: 10,
    prevMessagesCap: 12,
    price: {
      amount: 35,
      priceIds: {
        test: 'price_1OyU5WG6vPkzZrpkI3b9OO75',
        production: '',
      },
    },
  },
]