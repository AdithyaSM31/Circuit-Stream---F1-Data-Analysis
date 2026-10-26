package com.circuitstream.f1

import org.junit.Assert.assertEquals
import org.junit.Test

class NavigationPolicyTest {
    @Test fun onlyAssetOriginStaysInsideTheApp() {
        assertEquals(NavigationPolicy.Destination.INTERNAL, NavigationPolicy.destination(NavigationPolicy.HOME + "telemetry"))
        for (url in listOf("https://www.circuitstream.app/", "https://appassets.androidplatform.net.evil.test/")) {
            assertEquals(NavigationPolicy.Destination.EXTERNAL, NavigationPolicy.destination(url))
        }
        for (url in listOf("javascript:alert(1)", "file:///data/private", "http://appassets.androidplatform.net/", "https://user:pass@appassets.androidplatform.net/", "intent://scan", "not a URL")) {
            assertEquals(url, NavigationPolicy.Destination.BLOCKED, NavigationPolicy.destination(url))
        }
    }
    @Test fun restoresEveryAnalysisRouteWithoutMaskingMissingAssets() {
        for (route in listOf("/", "/schedule", "/standings", "/teams", "/results", "/laps", "/telemetry", "/race-control", "/circuit")) {
            assertEquals("public/index.html", NavigationPolicy.assetPath(route))
        }
        assertEquals("public/static/js/main.js", NavigationPolicy.assetPath("/static/js/main.js"))
        assertEquals("public/brand/index.html", NavigationPolicy.assetPath("/brand/"))
        assertEquals("public/missing.js", NavigationPolicy.assetPath("/missing.js"))
    }
}
