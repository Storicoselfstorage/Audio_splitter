const express = require('express');
const multer = require('multer');
const fs = require('fs');
const ffmpeg = require('fluent-ffmpeg');
const archiver = require('archiver');

const app = express();
const upload = multer({ dest: '/tmp/uploads/' });

app.post('/split-audio', upload.single('audio'), (req, res) => {
  if (!req.file) {
    return res.status(400).send('Nie przesłano pliku audio.');
  }

  const inputFile = req.file.path;
  const outputDir = '/tmp/output/';

  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir);
  }

  ffmpeg.ffprobe(inputFile, (err, metadata) => {
    if (err) {
      console.error('Błąd podczas analizy pliku:', err);
      return res.status(500).send('Wystąpił błąd podczas przetwarzania pliku.');
    }

    const duration = metadata.format.duration;
    const segmentDuration = 600; // 10 minut (600 sekund)
    const segmentCount = Math.ceil(duration / segmentDuration);

    let completedSegments = 0;
    const archive = archiver('zip');

    archive.on('error', (err) => {
      console.error('Archive error:', err);
      res.status(500).send('Failed to archive files.');
    });

    res.attachment('podzielone_audio.zip');
    archive.pipe(res);

    for (let i = 0; i < segmentCount; i++) {
      const start = i * segmentDuration;
      const output = `${outputDir}segment_${i + 1}.mp3`;

      ffmpeg(inputFile)
        .setStartTime(start)
        .setDuration(segmentDuration)
        .output(output)
        .on('end', () => {
          archive.file(output, { name: `segment_${i + 1}.mp3` });
          completedSegments++;

          if (completedSegments === segmentCount) {
            archive.finalize();
          }
        })
        .run();
    }
  });
});

module.exports = app;
