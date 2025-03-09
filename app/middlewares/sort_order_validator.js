import { query } from 'express-validator';
import config from '../config/config.js';

const sortOrderValidator = (
  allowedSortByList,
  defaultSortBy,
  defaultOrderBy,
) => {
  return [
    query('sort_by').default(defaultSortBy).isIn(allowedSortByList).escape(),
    query('order_by')
      .default(defaultOrderBy)
      .isIn(Object.values(config.ORDER_BY))
      .escape(),
  ];
};

export default sortOrderValidator;
