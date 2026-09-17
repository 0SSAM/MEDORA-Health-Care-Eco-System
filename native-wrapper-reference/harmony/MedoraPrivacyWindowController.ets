// © MEDORA Health Care Eco System. All rights reserved. Proprietary and confidential.
// Reference adapter: validate the exact HarmonyOS NEXT SDK and signing profile before production use.
import { window } from '@kit.ArkUI';

export class MedoraPrivacyWindowController {
  constructor(private readonly activeWindow: window.Window) {}

  async enterSensitiveWorkspace(): Promise<void> {
    await this.activeWindow.setWindowPrivacyMode(true);
  }

  async leaveSensitiveWorkspace(): Promise<void> {
    await this.activeWindow.setWindowPrivacyMode(false);
  }
}
