/**
 * MEDORA | ميدورا — Biometric Verification Utility
 * Uses WebAuthn (Passkeys) to provide secure, device-based biometric confirmation.
 */

export async function verifyBiometrics(): Promise<{ success: boolean; type: string; error?: string }> {
  // Check if WebAuthn/Biometrics are supported
  if (!window.PublicKeyCredential) {
    return { success: false, type: 'none', error: 'Biometric authentication not supported on this browser.' };
  }

  const isAvailable = await window.PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable();
  if (!isAvailable) {
    return { success: false, type: 'none', error: 'No biometric authenticator (Fingerprint/Face ID) found on this device.' };
  }

  try {
    // Note: In a production scenario, the server would provide a challenge.
    // For this implementation, we use a local-only verification flow to confirm identity.
    // This triggers the OS-level prompt (Touch ID, Face ID, Windows Hello, etc.)
    
    // We create a dummy credential request to trigger the platform prompt
    // In a full implementation, we would use a real challenge/response with the server.
    const challenge = new Uint8Array(32);
    window.crypto.getRandomValues(challenge);

    const options: CredentialCreationOptions = {
      publicKey: {
        challenge,
        rp: { name: "MEDORA | ميدورا", id: window.location.hostname },
        user: {
          id: new Uint8Array(16),
          name: "attendance-verification",
          displayName: "Attendance Verification"
        },
        pubKeyCredParams: [{ alg: -7, type: "public-key" }, { alg: -257, type: "public-key" }],
        authenticatorSelection: {
          authenticatorAttachment: "platform",
          userVerification: "required"
        },
        timeout: 60000
      }
    };

    // This will trigger the native prompt
    // Note: We are using a 'creation' as a simple 'is this user really here' check for this PWA version.
    // A production version would use 'get' with a registered credential.
    const credential = await navigator.credentials.create(options);

    if (credential) {
      return { success: true, type: 'biometric' };
    }
    
    return { success: false, type: 'none', error: 'Verification failed.' };
  } catch (err: any) {
    console.error("Biometric verification error:", err);
    if (err.name === 'NotAllowedError') {
      return { success: false, type: 'none', error: 'User cancelled biometric verification.' };
    }
    return { success: false, type: 'none', error: err.message || 'Biometric verification error.' };
  }
}
