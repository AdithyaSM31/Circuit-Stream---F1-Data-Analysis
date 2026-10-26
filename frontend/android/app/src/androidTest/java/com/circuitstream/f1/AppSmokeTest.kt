package com.circuitstream.f1

import android.view.View
import android.view.ViewGroup
import android.webkit.WebView
import androidx.test.core.app.ActivityScenario
import androidx.test.ext.junit.runners.AndroidJUnit4
import androidx.test.platform.app.InstrumentationRegistry
import org.junit.Assert.assertEquals
import org.junit.Assert.assertTrue
import org.junit.Test
import org.junit.runner.RunWith
import java.util.concurrent.CountDownLatch
import java.util.concurrent.TimeUnit
import java.util.concurrent.atomic.AtomicReference

@RunWith(AndroidJUnit4::class)
class AppSmokeTest {
    private fun findWebView(view: View): WebView? {
        if (view is WebView) return view
        if (view is ViewGroup) for (i in 0 until view.childCount) {
            findWebView(view.getChildAt(i))?.let { return it }
        }
        return null
    }
    private fun js(scenario: ActivityScenario<MainActivity>, script: String): String {
        val value = AtomicReference<String>("")
        val latch = CountDownLatch(1)
        scenario.onActivity { activity ->
            findWebView(activity.window.decorView)!!.evaluateJavascript(script) {
                value.set(it)
                latch.countDown()
            }
        }
        assertTrue("WebView callback timed out", latch.await(10, TimeUnit.SECONDS))
        return value.get()
    }
    private fun await(scenario: ActivityScenario<MainActivity>, script: String) {
        val end = System.currentTimeMillis() + 45000
        while (System.currentTimeMillis() < end) {
            if (js(scenario, script) == "true") return
            Thread.sleep(300)
        }
        throw AssertionError("Timed out waiting for $script; " + js(scenario, "document.body.innerText.slice(-1200)"))
    }
    @Test fun bundledAppUsesMobileViewportAndRestoresNavigation() {
        ActivityScenario.launch(MainActivity::class.java).use { scenario ->
            await(scenario, "document.body.innerText.includes('RACE') && !!document.querySelector('a[href=\"/telemetry\"]')")
            assertEquals("true", js(scenario, "window.innerWidth < 600"))
            assertEquals("true", js(scenario, "location.origin === 'https://appassets.androidplatform.net'"))
            js(scenario, "document.querySelector('a[href=\"/telemetry\"]').click()")
            await(scenario, "location.pathname === '/telemetry' && document.body.innerText.includes('INVISIBLE')")
            scenario.recreate()
            await(scenario, "location.pathname === '/telemetry' && document.body.innerText.includes('INVISIBLE')")
            scenario.onActivity { it.onBackPressedDispatcher.onBackPressed() }
            await(scenario, "location.pathname === '/' && document.body.innerText.includes('DECODED')")
            assertEquals("com.circuitstream.f1", InstrumentationRegistry.getInstrumentation().targetContext.packageName)
        }
    }
    @Test fun sessionResultsLoadRealBackendDataAndDriverPortraits() {
        ActivityScenario.launch(MainActivity::class.java).use { scenario ->
            await(scenario, "!!document.querySelector('a[href=\"/telemetry\"]')")
            js(scenario, "document.querySelector('a[href=\"/telemetry\"]').click()")
            await(scenario, "!!document.querySelector('a[href=\"/results\"]')")
            js(scenario, "document.querySelector('a[href=\"/results\"]').click()")
            await(scenario, "document.querySelector('select[aria-label=\"Grand Prix\"]')?.options.length > 1")
            js(scenario, "Array.from(document.querySelectorAll('button')).find(b=>b.textContent.includes('Load Results')).click()")
            await(scenario, "document.querySelectorAll('tbody tr').length > 15")
            await(scenario, "Array.from(document.querySelectorAll('.session-driver-portrait img')).slice(0,3).every(i=>i.complete && i.naturalWidth>0)")
            assertEquals("true", js(scenario, "document.body.innerText.includes('RUS')"))
        }
    }
}
