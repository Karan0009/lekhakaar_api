import { Serializer } from 'jsonapi-serializer';
import config from '../config/config.js';

const SummarizedUserTransactionsSerializer = new Serializer(
  'summarized_user_transactions',
  {
    nullIfMissing: true,
    keyForAttribute: 'snake_case',
    id: 'id',
    attributes: [
      'user_id',
      'sub_cat_id',
      ...Object.values(config.SUMMARY_TYPE_DATE_KEYS),
      'total_amount',
      'SubCategory',
    ],
    SubCategory: {
      ref: 'id',
      included: true,
      nullIfMissing: true,
      attributes: ['id', 'name', 'icon', 'description'],
    },
  },
);

export { SummarizedUserTransactionsSerializer };
