import { Serializer } from 'jsonapi-serializer';

const WeeklySummarizedUserTransactionSerializer = new Serializer(
  'weekly_summarized_user_transaction',
  {
    attributes: ['id', 'user_id', 'sub_category_id', 'week_start'],
    keyForAttribute: 'snake_case',
    // UserTransaction: {
    //   ref: 'id',
    //   included: true,
    //   attributes: [
    //     'id',
    //     'user_id',
    //     'amount',
    //     'transaction_datetime',
    //     'recipient_name',
    //     'meta',
    //     'status',
    //   ],
    // },
  },
);

export { WeeklySummarizedUserTransactionSerializer };
