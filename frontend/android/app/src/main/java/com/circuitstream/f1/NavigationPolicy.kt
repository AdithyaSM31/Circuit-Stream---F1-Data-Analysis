package com.circuitstream.f1

import java.net.URI

internal object NavigationPolicy {
    const val HOST = "appassets.androidplatform.net"
    const val HOME = "https://$HOST/"
    enum class Destination { INTERNAL, EXTERNAL, BLOCKED }
    fun destination(url: String): Destination {
        val uri = try { URI(url) } catch (_: Exception) { return Destination.BLOCKED }
        if (uri.userInfo != null) return Destination.BLOCKED
        return when {
            uri.scheme == "https" && uri.host == HOST && uri.port in listOf(-1, 443) -> Destination.INTERNAL
            uri.scheme == "https" && !uri.host.isNullOrEmpty() -> Destination.EXTERNAL
            uri.scheme == "mailto" -> Destination.EXTERNAL
            else -> Destination.BLOCKED
        }
    }
    fun assetPath(path: String): String {
        val routes = setOf("", "schedule", "standings", "teams", "results", "laps", "telemetry", "race-control", "circuit")
        val clean = path.trim('/')
        return when {
            clean in routes -> "public/index.html"
            path.endsWith('/') -> "public/${clean}/index.html"
            else -> "public/$clean"
        }
    }
}
