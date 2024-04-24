import { GPT_MODELS } from "./open-ai";

// Types taken from uploadthing node modules
type PowOf2 = 1 | 2 | 4 | 8 | 16 | 32 | 64 | 128 | 256 | 512 | 1024;
type SizeUnit = "B" | "KB" | "MB" | "GB";
type FileSize = `${PowOf2}${SizeUnit}`;
 

export const PLANS = [
  {
    name: 'Free',
    slug: 'free',
    quota: 10,
    pdfCap: '4MB' as FileSize, 
    pagesPerPdf: 5,
    numProjects: 1,
    numQuestions: 3,
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
    pdfCap: '32MB' as FileSize, 
    pagesPerPdf: 300,
    numProjects: 10,
    numQuestions: 30,
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