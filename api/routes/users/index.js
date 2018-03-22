const publicRoutes = require('./public');
const privateRoutes = require('./private');

module.exports = {
  public: publicRoutes,
  private: privateRoutes,
};
