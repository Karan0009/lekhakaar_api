const WA_MESSAGE_TEMPLATES = {
  defaultMessage: `*Hey, please send any of the following options*
    *1. Register yourself in the app*
    *2. summary of the transactions*
    *3. contact us*
    
After registering you can start sending your transactions by following ways
    1. share the transaction from payment applications
    2. share debit statement sms from the bank`,

  defaultErrorMessage: `Oops, something went sideways! Blame it on the glitch gremlins. We'll sort it out soon! 🚨`,

  register: {
    success: `You're registered ✅ 🎊, Now you can start sending transactions our way 🤝`,
    already_registered: `Welcome back 👋, You're already registered!
Start sending transactions our way 🤝`,
    error:
      'Some error occured 😬, Please try again after some time or contact us at 🤷‍♂️',
  },

  transactions: {
    input_received: `Transaction received ✅`,
    media_download_error: `Error in processing this transacation, Please try again`,
    one_day_maxed_out: `Whoa there, speed racer! You've hit today’s limit. But don't worry, the message fairy will refill your stash tomorrow. 📨✨`,
  },

  testSeries: {
    input_received: `Added ✅`,
  },
};

export default WA_MESSAGE_TEMPLATES;
