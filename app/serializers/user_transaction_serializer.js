import { Serializer } from 'jsonapi-serializer';

const UserTransactionSerializer = new Serializer('user_transactions', {
  attributes: ['id', 'user_id', 'sub_cat_id', 'amount', 'SubCategory'],
  keyForAttribute: 'snake_case',
  SubCategory: {
    ref: 'id',
    included: true,
    attributes: ['id', 'name', 'icon', 'description'],
  },
});

export { UserTransactionSerializer };
