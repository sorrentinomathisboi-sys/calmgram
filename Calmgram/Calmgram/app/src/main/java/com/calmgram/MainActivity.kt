package com.calmgram

import android.annotation.SuppressLint
import android.app.Activity
import android.graphics.Bitmap
import android.os.Bundle
import android.webkit.CookieManager
import android.webkit.WebResourceRequest
import android.webkit.WebView
import android.webkit.WebViewClient

class MainActivity : Activity() {
    private lateinit var web: WebView
    private lateinit var js: String

    @SuppressLint("SetJavaScriptEnabled")
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        js = assets.open("calm.js").bufferedReader().use { it.readText() }
        web = WebView(this)
        setContentView(web)

        CookieManager.getInstance().setAcceptCookie(true)
        CookieManager.getInstance().setAcceptThirdPartyCookies(web, true)

        with(web.settings) {
            javaScriptEnabled = true
            domStorageEnabled = true
            mediaPlaybackRequiresUserGesture = false
            userAgentString = userAgentString.replace("; wv", "")
        }

        web.webViewClient = object : WebViewClient() {
            // Reste dans Instagram/Facebook (login) : aucun lien externe n'est ouvert.
            override fun shouldOverrideUrlLoading(v: WebView, r: WebResourceRequest): Boolean {
                val h = r.url.host ?: return true
                return !(h.endsWith("instagram.com") || h.endsWith("facebook.com"))
            }
            override fun onPageStarted(v: WebView, url: String?, f: Bitmap?) {
                v.evaluateJavascript(js, null)
            }
            override fun onPageFinished(v: WebView, url: String?) {
                v.evaluateJavascript(js, null)
            }
        }
        web.loadUrl("https://www.instagram.com/")
    }

    @Deprecated("Deprecated in Java")
    override fun onBackPressed() {
        if (web.canGoBack()) web.goBack() else super.onBackPressed()
    }
}
