import OpenAI from 'openai';
import config from '../../config/config.js';

const openaiClient = new OpenAI({
  apiKey: config.OPENAI_API_KEY,
});

export default openaiClient;
