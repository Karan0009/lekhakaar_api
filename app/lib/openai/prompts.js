const OPEN_AI_PROMPTS = {
  testSeriesRawQuestionSystemPrompt: `Your goal is to extract text from images.You will be provided with an image, and you will output a json object containing the following information: {question: string // string of question as in the image,options: string[] // array of options as in the image,correctAnswer: string // string of correction answer as in the image, solution: string // reason why correctAnswer is correct and other options are not}`,
  rawTransactionDataExtractionPrompt: (
    trxnText,
  ) => `Analyze the following message to determine if it describes a successful debit bank transaction:  
"${trxnText}"
If the message is related to an OTP or contains phrases like "OTPs are secret" "OTP for" or similar or if it contains some random string, classify it as NOT a successful debit transaction and return:  { "amount": null,  "currency": null,  "datetime": null,  "recipient": null,  "upi_id": null,  "upi_ref_no": null  }
If it is a successful debit transaction, extract and send the details as JSON:  
{ "amount": number, "currency": string,  "datetime": string (format: YYYY-MM-DD HH:mm:ss), "recipient": string,  "upi_id": string, "upi_ref_no": string  }
Do not include any additional text, explanations, or commentary — only return the JSON response`,
};

export { OPEN_AI_PROMPTS };
