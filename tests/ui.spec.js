const { test, expect } = require('@playwright/test');
const path = require('path');

test('index.html basic UI interactions', async ({ page }) => {
  // Mock SpeechRecognition and speechSynthesis before the page loads
  await page.addInitScript(() => {
    class MockRecognition {
      constructor() {
        this.continuous = true;
        this.interimResults = true;
        this.lang = 'en-US';
      }
      start() {
        if (typeof this.onstart === 'function') this.onstart();
      }
      stop() {
        if (typeof this.onend === 'function') this.onend();
      }
    }

    window.SpeechRecognition = MockRecognition;
    window.webkitSpeechRecognition = MockRecognition;
    window.speechSynthesis = {
      cancel: () => {},
      speak: (utter) => {
        if (utter && typeof utter.onend === 'function') utter.onend();
      },
    };
  });

  const fileUrl = 'file://' + path.join(process.cwd(), 'index.html');
  await page.goto(fileUrl);

  const status = page.getByTestId('status');
  const toggle = page.getByTestId('toggle');
  const clear = page.getByTestId('clear');
  const transcript = page.getByTestId('transcript');

  await expect(status).toHaveAttribute('data-state', 'idle');
  await expect(toggle).toHaveText('録音を開始');

  // Click toggle to start listening (uses our mocked Recognition)
  await toggle.click();
  await expect(status).toHaveAttribute('data-state', 'listening');
  await expect(toggle).toHaveText('録音を停止');

  // Populate transcript, then click clear and expect ghost text
  await page.evaluate(() => {
    const t = document.getElementById('transcript');
    t.textContent = 'Hello world';
  });
  await clear.click();
  await expect(transcript).toContainText('まだ発話がありません。');
});
