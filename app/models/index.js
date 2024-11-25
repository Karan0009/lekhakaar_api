import Category from './category.js';
import RawTransaction from './raw_transaction.js';
import Session from './session.js';
import TestSeriesRawQuestion from './test_series_raw_question.js';
import Transaction from './transaction.js';
import User from './user.js';

// Initialize the models (this ensures they are added to sequelize.models)
const models = {
  User,
  Transaction,
  Category,
  RawTransaction,
  Session,
  TestSeriesRawQuestion,
};

models.User.hasMany(models.Transaction, { foreignKey: 'user_id' });
models.User.hasMany(models.RawTransaction, { foreignKey: 'user_id' });
models.User.hasMany(models.Category, { foreignKey: 'user_id' });
models.Category.hasMany(models.Transaction, { foreignKey: 'category_id' });

export { models as default };
