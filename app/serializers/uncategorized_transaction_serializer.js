import { Serializer } from 'jsonapi-serializer';

export default new Serializer('uncategorized_transaction', {
  attributes: ['id', 'user_id', 'transaction_id', 'UserTransaction'],
  keyForAttribute: 'snake_case',
  UserTransaction: {
    ref: 'id',
    included: true,
    attributes: [
      'id',
      'user_id',
      'amount',
      'transaction_datetime',
      'recipient_name',
      'meta',
      'status',
    ],
  },
});
