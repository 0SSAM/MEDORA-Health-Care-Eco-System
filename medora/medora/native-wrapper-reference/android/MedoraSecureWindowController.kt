// © MEDORA Health Care Eco System. All rights reserved. Proprietary and confidential.
// Reference adapter: integrate into the signed Android wrapper; it is not packaged by the web build.
package com.medora.security

import android.app.Activity
import android.os.Build
import android.view.WindowManager

/**
 * Controls the Android secure-window boundary while an authenticated MEDORA
 * workspace is visible. The host wrapper supplies a scope-free callback: all
 * organization, branch, and jurisdiction validation remains on the server.
 */
class MedoraSecureWindowController(
    private val activity: Activity,
    private val onCaptureRisk: (String) -> Unit,
) {
    private val captureCallback = Activity.ScreenCaptureCallback {
        onCaptureRisk("native-screenshot")
    }

    fun enterSensitiveWorkspace() {
        activity.window.addFlags(WindowManager.LayoutParams.FLAG_SECURE)
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.UPSIDE_DOWN_CAKE) {
            activity.registerScreenCaptureCallback(activity.mainExecutor, captureCallback)
        }
    }

    fun leaveSensitiveWorkspace() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.UPSIDE_DOWN_CAKE) {
            activity.unregisterScreenCaptureCallback(captureCallback)
        }
        activity.window.clearFlags(WindowManager.LayoutParams.FLAG_SECURE)
    }
}
