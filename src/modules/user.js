const bcrypt = require('bcrypt');

class User {
  constructor(Server) {
    this.server = Server;
  }

  get USERS() {
    return this.server.collection('users');
  }

  async getByUsername(username) {
    return await this.USERS.findOne({username});
  };

  async checkPassword(user) {
    return await bcrypt.compare(user.password, user.hash);
  };
}

module.exports = User;
