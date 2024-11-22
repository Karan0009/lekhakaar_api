import sequelize from './sequelize.js';

class WWWJsPGStore {
  constructor() {
    this.store = sequelize;
  }

  /**
   *
   * @param {{session: string}} data
   */
  async sessionExists(data) {}

  async save(data) {}

  async extract(data) {}

  async delete(data) {}
}

export default WWWJsPGStore();
