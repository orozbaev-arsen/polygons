const classifyPoint = require('robust-point-in-polygon');
const fs = require('fs');
const polygons = require('../data/polygons');

class Polygons {

  constructor(Server) {
    this.server = Server;
    // состяние просчета
    this.calculated = false;
    // просчет вхождений при парсинге файла
    this.precalculate = this.server.config.polygons.precalculate;
  }

  async initialize() {
    const files = await this.server.FILES.find({status: 'wait'}).toArray();
    this.orders = files.map(row => row.filename);
    this.check();
  }

  overlap(longitude, latitude) {
    return classifyPoint(polygons, [longitude, latitude]) <= 0;
  }

  add_to_orders(file) {
    this.orders.push(file);
    this.check();
  }

  async calculate(filename) {
    this.calculated = true;
    const file = await this.server.FILES.findOne({filename});
    return new Promise((resolve) => {
      if (file) {
        const readline = require('readline');
        const stream = require('stream');
        const instream = fs.createReadStream(`files/${file.username}/${file.filename}`);
        const outstream = new stream;
        const rl = readline.createInterface(instream, outstream);
        const data = [];

        rl.on('line', (line) => {
          rl.pause();
          try {
            if (line.length > 0) {
              // поиск точек и описания
              const match = new RegExp(this.server.config.polygons.pattern, 'gm').exec(line.trim());
              if (match) {
                let lineInfo = {
                  coords: {
                    longitude: match[1],
                    latitude: match[2]
                  },
                  place: match[3],
                };
                if (this.precalculate) {
                  lineInfo.overlap = this.overlap(match[1], match[2]);
                }
                data.push(lineInfo);
              }
            }
          } catch (e) {
            console.log('Error', e);
          }
          rl.resume();
        });

        rl.on('close', () => {
          this.server.FILES.updateOne({_id: file._id}, {
            $set: {
              data,
              status: 'done',
            }
          }).then(() => {
            resolve(true);
            this.calculated = false;
          });
        });
      } else {
        resolve(false);
      }
    })
  }

  check() {
    if (!this.calculated && this.orders.length > 0) {
      // запуск первого файла в очереди
      this.calculate(this.orders[0]).then((result) => {
        if (result) {
          // удаляем из очереди
          this.orders.splice(0, 1);
          // повторная проверка на очередь
          this.check();
        }
      });
    }
  }


}

module.exports = Polygons;
