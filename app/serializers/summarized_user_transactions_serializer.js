import { Serializer } from 'jsonapi-serializer';
import config from '../config/config.js';

const SummarizedUserTransactionsSerializer = new Serializer(
  'summarized_user_transactions',
  {
    attributes: [
      'user_id',
      'sub_cat_id',
      ...Object.values(config.SUMMARY_TYPE_DATE_KEYS),
      'total_amount',
      'SubCategory',
    ],
    keyForAttribute: 'snake_case',
    SubCategory: {
      ref: 'id',
      included: true,
      attributes: ['id', 'name', 'icon', 'description'],
    },
  },
);

export { SummarizedUserTransactionsSerializer };
