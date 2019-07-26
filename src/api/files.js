const express = require('express');

module.exports = (Server) => {
  const router = new express.Router();

  Server.middleware('auth', router);
  router.get('/', async (req, res) => {
    const fileList = await Server.files.getFileList(req.user.username);
    res.send({result: true, files: fileList})
  });

  router.post('/', [Server.upload.single('file')], async (req, res) => {
    if (req.file.path) {
      await Server.files.addFile(req.user.username, req.file.filename);
      res.send({result: true, filename: req.file.filename});
    } else {
      res.send({result: false})
    }
  });

  router.get('/:filename', async (req, res) => {
    const file = await Server.files.getFile(req.user.username, req.params.filename);
    if (file) {
      res.send({result: true, file: file.data, status: file.status})
    } else {
      res.send({result: false})
    }
  });

  return router;
};
