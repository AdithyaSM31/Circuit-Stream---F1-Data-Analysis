package com.circuitstream.f1

import android.annotation.SuppressLint
import android.content.ActivityNotFoundException
import android.content.Intent
import android.graphics.Color
import android.net.Uri
import android.os.Bundle
import android.view.Gravity
import android.view.View
import android.view.ViewGroup
import android.webkit.CookieManager
import android.webkit.WebChromeClient
import android.webkit.WebResourceError
import android.webkit.WebResourceRequest
import android.webkit.WebResourceResponse
import android.webkit.WebSettings
import android.webkit.WebView
import android.webkit.WebViewClient
import android.widget.Button
import android.widget.FrameLayout
import android.widget.LinearLayout
import android.widget.ProgressBar
import android.widget.TextView
import android.widget.Toast
import androidx.activity.ComponentActivity
import androidx.activity.OnBackPressedCallback
import androidx.core.splashscreen.SplashScreen.Companion.installSplashScreen
import androidx.core.view.ViewCompat
import androidx.core.view.WindowCompat
import androidx.core.view.WindowInsetsCompat
import androidx.webkit.WebViewAssetLoader
import java.io.ByteArrayInputStream

class MainActivity : ComponentActivity() {
    private lateinit var webView: WebView
    private lateinit var progress: ProgressBar
    private lateinit var errorPanel: LinearLayout
    private var loadFailed = false

    @SuppressLint("SetJavaScriptEnabled")
    override fun onCreate(savedInstanceState: Bundle?) {
        installSplashScreen()
        super.onCreate(savedInstanceState)
        WindowCompat.setDecorFitsSystemWindows(window, false)
        WindowCompat.getInsetsController(window, window.decorView).apply {
            isAppearanceLightStatusBars = false
            isAppearanceLightNavigationBars = false
        }
        val root = FrameLayout(this).apply { setBackgroundColor(Color.rgb(9, 14, 12)) }
        ViewCompat.setOnApplyWindowInsetsListener(root) { view, insets ->
            val bars = insets.getInsets(WindowInsetsCompat.Type.systemBars() or WindowInsetsCompat.Type.displayCutout())
            val keyboard = insets.getInsets(WindowInsetsCompat.Type.ime())
            view.setPadding(bars.left, bars.top, bars.right, maxOf(bars.bottom, keyboard.bottom))
            insets
        }
        webView = WebView(this).apply {
            setBackgroundColor(Color.rgb(9, 14, 12))
            settings.apply {
                javaScriptEnabled = true
                domStorageEnabled = true
                allowFileAccess = false
                allowContentAccess = false
                mixedContentMode = WebSettings.MIXED_CONTENT_NEVER_ALLOW
                javaScriptCanOpenWindowsAutomatically = false
                mediaPlaybackRequiresUserGesture = true
                setSupportMultipleWindows(false)
            }
            CookieManager.getInstance().setAcceptThirdPartyCookies(this, false)
        }
        WebView.setWebContentsDebuggingEnabled(BuildConfig.DEBUG)
        root.addView(webView, FrameLayout.LayoutParams(-1, -1))
        progress = ProgressBar(this, null, android.R.attr.progressBarStyleHorizontal).apply {
            max = 100
            contentDescription = getString(R.string.loading)
            progressTintList = android.content.res.ColorStateList.valueOf(Color.rgb(169, 219, 189))
        }
        root.addView(progress, FrameLayout.LayoutParams(-1, dp(3), Gravity.TOP))
        errorPanel = LinearLayout(this).apply {
            orientation = LinearLayout.VERTICAL
            gravity = Gravity.CENTER
            setPadding(dp(28), dp(28), dp(28), dp(28))
            setBackgroundColor(Color.rgb(9, 14, 12))
            visibility = View.GONE
            addView(TextView(context).apply {
                text = getString(R.string.load_error)
                textSize = 28f
                setTextColor(Color.rgb(169, 219, 189))
            })
            addView(TextView(context).apply {
                text = getString(R.string.load_error_detail)
                textSize = 16f
                gravity = Gravity.CENTER
                setPadding(0, dp(16), 0, dp(24))
                setTextColor(Color.rgb(240, 238, 229))
            })
            addView(Button(context).apply {
                text = getString(R.string.retry)
                setOnClickListener { webView.loadUrl(NavigationPolicy.HOME) }
            })
        }
        root.addView(errorPanel, FrameLayout.LayoutParams(-1, -1))
        setContentView(root)
        ViewCompat.requestApplyInsets(root)

        val assets = WebViewAssetLoader.AssetsPathHandler(this)
        val loader = WebViewAssetLoader.Builder().addPathHandler("/") { path ->
            assets.handle(NavigationPolicy.assetPath(path)) ?: WebResourceResponse(
                "text/plain", "UTF-8", 404, "Not Found", emptyMap(), ByteArrayInputStream(ByteArray(0)))
        }.build()
        webView.webViewClient = object : WebViewClient() {
            override fun shouldInterceptRequest(view: WebView, request: WebResourceRequest): WebResourceResponse? =
                loader.shouldInterceptRequest(request.url)

            override fun shouldOverrideUrlLoading(view: WebView, request: WebResourceRequest): Boolean {
                return when (NavigationPolicy.destination(request.url.toString())) {
                    NavigationPolicy.Destination.INTERNAL -> false
                    NavigationPolicy.Destination.EXTERNAL -> {
                        if (request.isForMainFrame) openExternal(request.url)
                        true
                    }
                    NavigationPolicy.Destination.BLOCKED -> true
                }
            }
            override fun onPageStarted(view: WebView, url: String?, favicon: android.graphics.Bitmap?) {
                loadFailed = false
                errorPanel.visibility = View.GONE
                progress.visibility = View.VISIBLE
            }
            override fun onPageFinished(view: WebView, url: String?) {
                progress.visibility = View.GONE
            }
            override fun onReceivedError(view: WebView, request: WebResourceRequest, error: WebResourceError) {
                if (request.isForMainFrame) showError()
            }
            override fun onReceivedHttpError(view: WebView, request: WebResourceRequest, response: WebResourceResponse) {
                if (request.isForMainFrame) showError()
            }
        }
        webView.webChromeClient = object : WebChromeClient() {
            override fun onProgressChanged(view: WebView, newProgress: Int) {
                progress.progress = newProgress
                progress.visibility = if (newProgress < 100 && !loadFailed) View.VISIBLE else View.GONE
            }
        }
        webView.setDownloadListener { url, _, _, _, _ ->
            val uri = Uri.parse(url)
            if (NavigationPolicy.destination(url) == NavigationPolicy.Destination.EXTERNAL) openExternal(uri)
        }
        onBackPressedDispatcher.addCallback(this, object : OnBackPressedCallback(true) {
            override fun handleOnBackPressed() {
                if (webView.canGoBack()) webView.goBack() else finish()
            }
        })
        if (savedInstanceState == null || webView.restoreState(savedInstanceState) == null) {
            webView.loadUrl(NavigationPolicy.HOME)
        }
    }

    private fun showError() {
        loadFailed = true
        progress.visibility = View.GONE
        errorPanel.visibility = View.VISIBLE
    }
    private fun openExternal(uri: Uri) {
        try {
            startActivity(Intent(Intent.ACTION_VIEW, uri).addCategory(Intent.CATEGORY_BROWSABLE))
        } catch (_: ActivityNotFoundException) {
            Toast.makeText(this, R.string.no_browser, Toast.LENGTH_SHORT).show()
        }
    }
    private fun dp(value: Int) = (value * resources.displayMetrics.density).toInt()
    override fun onSaveInstanceState(outState: Bundle) {
        webView.saveState(outState)
        super.onSaveInstanceState(outState)
    }
    override fun onPause() {
        webView.onPause()
        super.onPause()
    }
    override fun onResume() {
        super.onResume()
        webView.onResume()
    }
    override fun onDestroy() {
        (webView.parent as? ViewGroup)?.removeView(webView)
        webView.stopLoading()
        webView.destroy()
        super.onDestroy()
    }
}
