// © MEDORA Health Care Eco System. All rights reserved. Proprietary and confidential.
// Reference adapter: integrate into the signed iOS wrapper; it is not packaged by the web build.
import UIKit

/// Obscures a sensitive native web view while iOS reports recording, mirroring,
/// or AirPlay capture. iOS does not provide a general screenshot-prevention API.
final class MedoraCapturePrivacyController {
    private let protectedView: UIView
    private let redactionView: UIView
    private let onCaptureRisk: (String) -> Void

    init(protectedView: UIView, onCaptureRisk: @escaping (String) -> Void) {
        self.protectedView = protectedView
        self.onCaptureRisk = onCaptureRisk
        self.redactionView = UIView(frame: protectedView.bounds)
        self.redactionView.backgroundColor = .systemBackground
        self.redactionView.autoresizingMask = [.flexibleWidth, .flexibleHeight]
        self.redactionView.isHidden = true
        protectedView.addSubview(redactionView)
    }

    func beginProtecting() {
        NotificationCenter.default.addObserver(self, selector: #selector(refreshCaptureState), name: UIScreen.capturedDidChangeNotification, object: nil)
        NotificationCenter.default.addObserver(self, selector: #selector(recordScreenshotEvent), name: UIApplication.userDidTakeScreenshotNotification, object: nil)
        refreshCaptureState()
    }

    func endProtecting() {
        NotificationCenter.default.removeObserver(self)
        redactionView.isHidden = true
    }

    @objc private func refreshCaptureState() {
        redactionView.isHidden = !UIScreen.main.isCaptured
        if !redactionView.isHidden { onCaptureRisk("native-screen-capture") }
    }

    @objc private func recordScreenshotEvent() {
        onCaptureRisk("native-screenshot")
    }
}
