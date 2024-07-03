const express = require('express');
const serverless = require('serverless-http');
const ffmpegPath = require('@ffmpeg-installer/ffmpeg').path;
const ffmpeg = require('fluent-ffmpeg');
ffmpeg.setFfmpegPath(ffmpegPath);
const fs = require('fs');
const os = require('os');
const path = require('path');
const archiver = require('archiver');
const multer = require('multer');

const app = express();
const upload = multer({ dest: os.tmpdir() });

app.post('/split-audio', upload.single('audio'), async (req, res) => {
  console.log('Request:', req.method, req.path);
  console.log('File:', req.file);

  if (!req.file) {
    return res.status(400).send('No audio file uploaded.');
  }

  const inputFile = req.file.path;
  const outputDir = path.join(os.tmpdir(), 'output');
  
  try {
    // Ensure output directory exists
    await fs.promises.mkdir(outputDir, { recursive: true });

    // Get audio duration
    const duration = await getAudioDuration(inputFile);
    const segmentDuration = 600; // 10 minutes
    const segmentCount = Math.ceil(duration / segmentDuration);

    // Split audio file
    for (let i = 0; i < segmentCount; i++) {
      const start = i * segmentDuration;
      const output = path.join(outputDir, `segment_${i + 1}.mp3`);
      await splitAudio(inputFile, output, start, segmentDuration);
    }

    // Create ZIP archive
    const zipFile = path.join(os.tmpdir(), 'output.zip');
    await createZipArchive(outputDir, zipFile);

    // Send ZIP file
    res.download(zipFile, 'split_audio.zip', (err) => {
      if (err) {
        console.error('Download error:', err);
        res.status(500).send('Error during file download');
      }
      
      // Clean up
      fs.unlink(zipFile, () => {});
      fs.rm(outputDir, { recursive: true, force: true }, () => {});
    });

  } catch (error) {
    console.error('Error:', error);
    res.status(500).send('Internal Server Error');
  }
});

function getAudioDuration(file) {
  return new Promise((resolve, reject) => {
    ffmpeg.ffprobe(file, (err, metadata) => {
      if (err) reject(err);
      else resolve(metadata.format.duration);
    });
  });
}

function splitAudio(input, output, start, duration) {
  return new Promise((resolve, reject) => {
    ffmpeg(input)
      .setStartTime(start)
      .setDuration(duration)
      .output(output)
      .on('end', resolve)
      .on('error', reject)
      .run();
  });
}

function createZipArchive(sourceDir, outputFile) {
  return new Promise((resolve, reject) => {
    const archive = archiver('zip', { zlib: { level: 9 } });
    const stream = fs.createWriteStream(outputFile);

    archive
      .directory(sourceDir, false)
      .on('error', err => reject(err))
      .pipe(stream);

    stream.on('close', () => resolve());
    archive.finalize();
  });
}

// Wrap the Express app with serverless-http
const handler = serverless(app);
module.exports = { handler };
