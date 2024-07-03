

# Audio Splitter

## Description
Audio Splitter is a microservice designed to split audio files into smaller parts, each with a maximum size of 10MB. The service is optimized for deployment on the Netlify platform.

## Functionality
- Accepts MP3 audio files via POST request.
- Splits the input file into segments with a maximum duration of 10 minutes (which corresponds to approximately 10MB for an MP3 file).
- Returns the divided segments in a ZIP archive.

## How to Use
1. Send a POST request to the `/split-audio` endpoint with the audio file attached as `multipart/form-data`.
2. The service will process the file and return a ZIP archive containing the divided audio segments.

## Technologies
- Node.js
- Express.js
- FFmpeg (fluent-ffmpeg)
- Multer (for handling file uploads)
- Archiver (for creating ZIP archives)

## Local Installation and Running
1. Clone the repository
2. Install dependencies: `npm install`
3. Run the server locally: `npm start`

## Deployment on Netlify
1. Connect this repository to your Netlify account.
2. In the deployment settings, add the environment variable `NODE_VERSION` and set it to `14` or newer.
3. Deploy the application.

## Notes
- The service is limited by execution time and file size that can be processed in a serverless environment.
- For larger files or more advanced operations, consider using dedicated servers or cloud processing services.

## Author
Bartosz Lyskawinski

## License
This project is licensed under the terms of the MIT License. See the [LICENSE](LICENSE) file for the full license text.

Copyright (c) 2024 Bartosz Lyskawinski
