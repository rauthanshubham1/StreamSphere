const { S3Client, GetObjectCommand, PutObjectCommand } = require("@aws-sdk/client-s3")
const fs = require("node:fs/promises")
const { readFile } = require("node:fs/promises")
const path = require("node:path")
const ffmpeg = require("fluent-ffmpeg")

const s3Client = new S3Client({
    region: process.env.AWS_REGION,
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    }
});

const KEY = process.env.KEY;
const BUCKET_NAME = process.env.BUCKET_NAME;

async function init() {
    // Download the original video
    const command = new GetObjectCommand({
        Bucket: BUCKET_NAME,
        Key: KEY,
    })

    const result = await s3Client.send(command);
    const originalFilePath = `original-video.mp4`;
    await fs.writeFile(originalFilePath, result.Body);
    const originalVideoPath = path.resolve(originalFilePath);

    // Create output directory for segments
    const outputDir = 'hls';
    await fs.mkdir(outputDir, { recursive: true });

    // Start the transcoder
    return new Promise((resolve) => {
        ffmpeg(originalVideoPath)
            .outputOptions([
                '-profile:v high',
                '-level:v 4.0',
                '-preset medium',
                '-codec:v libx264',
                '-codec:a aac',
                '-r 24',
                '-g 48',             
                '-sc_threshold 0',    
                '-b:v 5000k',        
                '-maxrate 5350k',    
                '-bufsize 7000k',    
                '-b:a 192k',         
                '-s 1920x1080',      
                '-hls_time 6',       
                '-hls_list_size 0',  
                '-hls_segment_filename', `${outputDir}/segment_%03d.ts`
            ])
            .output(`${outputDir}/playlist.m3u8`)
            .on('end', async () => {
                // Upload m3u8 playlist
                const playlistCommand = new PutObjectCommand({
                    Bucket: "streamsphere-new",
                    Key: `${KEY}/playlist.m3u8`,
                    Body: await readFile(`${outputDir}/playlist.m3u8`)
                });
                await s3Client.send(playlistCommand);
                console.log("Uploaded playlist.m3u8");

                // Upload all segments
                const files = await fs.readdir(outputDir);
                const segmentFiles = files.filter(file => file.endsWith('.ts'));

                for (const segment of segmentFiles) {
                    const segmentCommand = new PutObjectCommand({
                        Bucket: "streamsphere-new",
                        Key: `${KEY}/${segment}`,
                        Body: await readFile(`${outputDir}/${segment}`)
                    });
                    await s3Client.send(segmentCommand);
                    console.log("Uploaded", segment);
                }

                resolve();
            })
            .on('error', (err) => {
                console.error('An error occurred:', err);
                process.exit(1);
            })
            .run();
    });
}

init();