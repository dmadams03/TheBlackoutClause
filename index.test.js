const test = require('node:test');
const assert = require('node:assert/strict');

const { createApp } = require('./index');

test('uploads an image and returns a public link', async () => {
  const app = createApp();
  const server = app.listen(0);

  try {
    const address = server.address();
    const formData = new FormData();
    formData.append('image', new Blob(['image-bytes'], { type: 'image/png' }), 'photo.png');

    const response = await fetch(`http://127.0.0.1:${address.port}/images`, {
      method: 'POST',
      body: formData
    });

    assert.equal(response.status, 201);
    const payload = await response.json();
    assert.match(payload.url, new RegExp(`^http://127\\.0\\.0\\.1:${address.port}/uploads/[a-f0-9-]+\\.png$`));
  } finally {
    await new Promise((resolve) => server.close(resolve));
  }
});

test('rejects upload requests without image file', async () => {
  const app = createApp();
  const server = app.listen(0);

  try {
    const address = server.address();
    const response = await fetch(`http://127.0.0.1:${address.port}/images`, {
      method: 'POST',
      body: new FormData()
    });

    assert.equal(response.status, 400);
    const payload = await response.json();
    assert.equal(payload.error, 'An image file is required');
  } finally {
    await new Promise((resolve) => server.close(resolve));
  }
});
