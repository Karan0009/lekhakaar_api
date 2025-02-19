import Category from './category.js';
import RawTransaction from './raw_transaction.js';
import Session from './session.js';
import TestSeriesRawQuestion from './test_series_raw_question.js';
import UserTransaction from './user_transaction.js';
import TestSeriesQuestion from './test_series_question.js';
import User from './user.js';
import OpenaiBatch from './openai_batch.js';
import TestSeries from './test_series.js';
import SubmittedTest from './submitted_test.js';
import UncategorizedTransaction from './uncategorized_transactions.js';
import Otp from './otp.js';
import RefreshToken from './refresh_token.js';

// Initialize the models (this ensures they are added to sequelize.models)
const models = {
  User,
  UserTransaction,
  UncategorizedTransaction,
  Category,
  RawTransaction,
  Session,
  TestSeriesRawQuestion,
  TestSeriesQuestion,
  OpenaiBatch,
  TestSeries,
  SubmittedTest,
  Otp,
  RefreshToken,
};

models.User.hasMany(models.RefreshToken, { foreignKey: 'user_id' });
models.User.hasMany(models.UserTransaction, { foreignKey: 'user_id' });
models.User.hasMany(models.RawTransaction, { foreignKey: 'user_id' });
models.User.hasMany(models.Category, { foreignKey: 'user_id' });
models.Category.hasMany(models.UserTransaction, { foreignKey: 'category_id' });
models.TestSeriesRawQuestion.belongsTo(models.TestSeriesQuestion, {
  foreignKey: 'question_id',
});
models.TestSeriesQuestion.hasOne(models.TestSeriesRawQuestion, {
  foreignKey: 'question_id',
});
models.TestSeries.hasMany(models.TestSeriesQuestion, {
  foreignKey: 'weekly_test_series_id',
});
models.TestSeries.hasMany(models.SubmittedTest, {
  foreignKey: 'test_series_id',
});

models.User.hasMany(UncategorizedTransaction, { foreignKey: 'user_id' });
models.UncategorizedTransaction.belongsTo(models.User, {
  foreignKey: 'user_id',
  targetKey: 'id',
});

models.UserTransaction.hasMany(UncategorizedTransaction, {
  foreignKey: 'transaction_id',
});
models.UncategorizedTransaction.belongsTo(models.UserTransaction, {
  foreignKey: 'transaction_id',
  targetKey: 'id',
});

export { models as default };
