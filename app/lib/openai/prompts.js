const OPEN_AI_PROMPTS = {
  testSeriesRawQuestionSystemPrompt: `Your goal is to extract text from images.You will be provided with an image, and you will output a json object containing the following information: {
    question: string // string of question as in the image,
    options: string[] // array of options as in the image,
    correctionAnswer: string // string of correction answer as in the image
}
`,
};

export { OPEN_AI_PROMPTS };
