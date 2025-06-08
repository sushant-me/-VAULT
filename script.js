document.addEventListener("DOMContentLoaded", function () {
  // --- Configuration ---
  const DECOY_CHARS = [
    "श",
    "ष",
    "स",
    "ह",
    "ळ",
    "क्ष",
    "ज्ञ",
    "त्र",
    "श्र",
    "अ",
    "आ",
    "इ",
  ];
  const DECOY_INSERTION_CHANCE = 0.3; // 30% chance to insert a decoy

  // --- Secure AES & Obfuscation Object ---
  const secureCrypto = {
    addDecoys(text) {
      let obfuscatedText = "";
      for (const char of text) {
        obfuscatedText += char;
        if (Math.random() < DECOY_INSERTION_CHANCE) {
          const randomDecoy =
            DECOY_CHARS[Math.floor(Math.random() * DECOY_CHARS.length)];
          obfuscatedText += randomDecoy;
        }
      }
      return obfuscatedText;
    },

    removeDecoys(obfuscatedText) {
      // Removes any character that is not a valid Base64 character
      return obfuscatedText.replace(/[^A-Za-z0-9+/=]/g, "");
    },

    encrypt(text, password) {
      if (!password) return null;
      try {
        const encrypted = CryptoJS.AES.encrypt(text, password).toString();
        return this.addDecoys(encrypted);
      } catch (error) {
        console.error("Encryption failed:", error);
        return null;
      }
    },

    decrypt(obfuscatedText, password) {
      if (!password || !obfuscatedText) return null;
      try {
        const ciphertext = this.removeDecoys(obfuscatedText);
        if (!ciphertext) return ""; // Return empty if only decoys were present
        const bytes = CryptoJS.AES.decrypt(ciphertext, password);
        const originalText = bytes.toString(CryptoJS.enc.Utf8);
        return originalText; // Will be empty string if password is wrong
      } catch (error) {
        console.error("Decryption failed:", error);
        return null;
      }
    },
  };

  // --- DOM Elements ---
  const encryptPasswordInput = document.getElementById("encryptPassword");
  const decryptPasswordInput = document.getElementById("decryptPassword");
  const originalMessage = document.getElementById("originalMessage");
  const encryptedMessage = document.getElementById("encryptedMessage");
  const encryptedInput = document.getElementById("encryptedInput");
  const decryptedMessage = document.getElementById("decryptedMessage");
  const encryptBtn = document.getElementById("encryptBtn");
  const decryptBtn = document.getElementById("decryptBtn");
  const copyEncryptedBtn = document.getElementById("copyEncrypted");
  const copyDecryptedBtn = document.getElementById("copyDecrypted");

  // --- Utility Functions ---
  function showNotification(element, message) {
    const originalText = element.textContent;
    element.textContent = message;
    setTimeout(() => {
      element.textContent = originalText;
    }, 2000);
  }

  function copyToClipboard(element, button) {
    const textToCopy = element.textContent;
    if (!textToCopy || textToCopy.includes("...")) {
      showNotification(button, "Nothing to copy!");
      return;
    }
    navigator.clipboard
      .writeText(textToCopy)
      .then(() => showNotification(button, "Copied!"))
      .catch((err) => {
        console.error("Copy failed:", err);
        showNotification(button, "Copy Failed!");
      });
  }

  // --- Event Listeners ---
  encryptBtn.addEventListener("click", () => {
    const message = originalMessage.value;
    const password = encryptPasswordInput.value;

    if (!password.trim()) {
      alert("Please enter a password to encrypt the message.");
      return;
    }
    if (!message.trim()) {
      alert("Please enter a message to encrypt.");
      return;
    }

    const encrypted = secureCrypto.encrypt(message, password);
    encryptedMessage.textContent =
      encrypted || "Encryption failed. Check console.";
  });

  decryptBtn.addEventListener("click", () => {
    const message = encryptedInput.value;
    const password = decryptPasswordInput.value;

    if (!password.trim()) {
      alert("Please enter the password to decrypt the message.");
      return;
    }
    if (!message.trim()) {
      alert("Please enter an encrypted message to decrypt.");
      return;
    }

    const decrypted = secureCrypto.decrypt(message, password);
    if (decrypted) {
      decryptedMessage.textContent = decrypted;
    } else {
      decryptedMessage.textContent =
        "Decryption failed. Incorrect password or corrupted message.";
    }
  });

  copyEncryptedBtn.addEventListener("click", () =>
    copyToClipboard(encryptedMessage, copyEncryptedBtn)
  );
  copyDecryptedBtn.addEventListener("click", () =>
    copyToClipboard(decryptedMessage, copyDecryptedBtn)
  );
});
