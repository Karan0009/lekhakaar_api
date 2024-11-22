import { v1 as uuidv1 } from 'uuid';

class Utils {
  constructor() {}

  getUUID() {
    return uuidv1();
  }
}

export default new Utils();
