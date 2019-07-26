class Files {
  constructor(Server) {
    this.server = Server;
    // просчет вхождений при парсинге файла
    this.precalculate = this.server.config.polygons.precalculate;
  }

  async getFileList(username) {
    return await this.server.FILES.find({ username }).toArray();
  };

  async getFile(username, filename) {
    const userFile = await this.server.FILES.findOne({username, filename});
    // если просчёта вхождения не было и существуют точки
    if (userFile && userFile.data.length > 0) {
      // не прочитывать если стоит настройка
      if (!this.precalculate) {
        userFile.data.forEach((data) => {
          if (!data.overlap) {
            data.overlap = this.server.polygons.overlap(data.coords.longitude, data.coords.latitude);
          }
        });
      }
      return userFile;
    }
    return false;
  };

  async addFile(username, filename) {
    await this.server.FILES.insertOne({
      username,
      filename,
      status: 'wait',
      data: [],
    });
    this.server.polygons.add_to_orders(filename);
  };
}

module.exports = Files;
