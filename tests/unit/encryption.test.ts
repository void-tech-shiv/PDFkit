import { describe, it, expect } from 'vitest';
import { PDFDocument } from 'pdf-lib';
import muhammara from 'muhammara';
import fs from 'node:fs';
import path from 'node:path';
import { TempManager } from '../../backend/src/utils/temp-manager.js';

describe('Real PDF Password Encryption & Decryption Verification', () => {
  it('should genuinely encrypt PDF with password and require password to open', async () => {
    // 1. Create a sample PDF
    const pdfDoc = await PDFDocument.create();
    const page = pdfDoc.addPage([600, 400]);
    page.drawText('Confidential Protected Content', { x: 50, y: 350 });
    const sampleBytes = await pdfDoc.save();

    const sandbox = TempManager.createSandbox();
    const inputPath = path.join(sandbox.dirPath, 'input.pdf');
    const encryptedPath = path.join(sandbox.dirPath, 'encrypted.pdf');
    const decryptedPath = path.join(sandbox.dirPath, 'decrypted.pdf');

    fs.writeFileSync(inputPath, Buffer.from(sampleBytes));

    const testPassword = 'MySecurePassword123!';

    // 2. Encrypt using muhammara
    muhammara.recrypt(inputPath, encryptedPath, {
      userPassword: testPassword,
      ownerPassword: testPassword + '_owner',
      userProtectionFlag: 4, // standard protection flag
    });

    expect(fs.existsSync(encryptedPath)).toBe(true);
    const encryptedBuffer = fs.readFileSync(encryptedPath);
    expect(encryptedBuffer.length).toBeGreaterThan(0);

    // 3. Verify that opening WITHOUT password fails or detects encryption
    let failedWithoutPassword = false;
    try {
      await PDFDocument.load(encryptedBuffer, { ignoreEncryption: false });
    } catch (err: any) {
      failedWithoutPassword = true;
    }
    // Also verify muhammara PDFReader rejects without password
    const readerWithoutPass = muhammara.createReader(encryptedPath);
    const isEncrypted = readerWithoutPass.isEncrypted();
    expect(isEncrypted).toBe(true);

    // 4. Verify that decrypting with WRONG password fails
    let wrongPasswordFailed = false;
    try {
      muhammara.recrypt(encryptedPath, decryptedPath, {
        password: 'WrongPassword!',
      });
    } catch (err) {
      wrongPasswordFailed = true;
    }
    expect(wrongPasswordFailed).toBe(true);

    // 5. Verify that decrypting with CORRECT password succeeds
    muhammara.recrypt(encryptedPath, decryptedPath, {
      password: testPassword,
    });
    expect(fs.existsSync(decryptedPath)).toBe(true);
    const decryptedBytes = fs.readFileSync(decryptedPath);

    // 6. Verify decrypted document loads freely in pdf-lib
    const verifiedDoc = await PDFDocument.load(decryptedBytes, { ignoreEncryption: false });
    expect(verifiedDoc.getPageCount()).toBe(1);

    // Cleanup sandbox
    TempManager.cleanSandbox(sandbox.dirPath);
  });
});
