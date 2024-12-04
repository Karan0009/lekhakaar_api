import OpenAI from 'openai';
import config from '../config/config.js';

const openai = new OpenAI({
  apiKey: config.OPENAI_API_KEY,
});

export default openai;
