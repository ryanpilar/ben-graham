import OpenAI from 'openai' 

/** ================================|| Open AI ||=================================== **/

export const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})