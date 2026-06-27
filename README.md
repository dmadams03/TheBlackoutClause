# TheBlackoutClause

## Image Upload API

Start the server:

```bash
npm install
npm start
```

Upload an image and receive a public link:

```bash
curl -X POST http://localhost:3000/images \\
  -F "image=@/absolute/path/to/image.png"
```

Response example:

```json
{
  "url": "http://localhost:3000/uploads/<generated-file-name>.png"
}
```
