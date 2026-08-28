// EmailOS starter plugin. One entry file drives everything:
//  - in the hidden background sandbox, register commands and listeners
//  - in a view document (`emailos.view` is set), render your page
//
// The `emailos` global is fully typed — see emailos.d.ts, kept in this
// folder so editors give you IntelliSense out of the box.

// ---------------------------------------------------------------- commands

emailos.commands.register('hello', async ctx => {
  if (ctx.threadId && ctx.accountId) {
    const thread = await emailos.mail.threadMetadata({
      accountId: ctx.accountId,
      threadId: ctx.threadId,
    })
    const latest = thread.messages[thread.messages.length - 1]
    emailos.ui.toast(
      `Hello from "${(latest && latest.subject) || 'this conversation'}"` +
        (ctx.input ? ` — you said: ${ctx.input}` : ''),
      'success'
    )
    return
  }
  emailos.ui.toast(ctx.input ? `You said: ${ctx.input}` : 'Hello!', 'info')
})

// ------------------------------------------------------------------ events

emailos.events.on('selection.changed', data => {
  // Payload fields depend on your mail grants; log to the dev-mode
  // plugin log (Preferences → Extensions) to inspect what you receive.
  void emailos.log('debug', 'selection.changed: ' + JSON.stringify(data))
})

// ------------------------------------------------------------------- view

async function renderHome() {
  // Views are your document: any HTML/CSS/JS you like. The `eos-*`
  // classes and `var(--…)` tokens are injected by the host so plugin
  // pages can look native with zero styling effort — using them is
  // optional.
  const page = document.createElement('div')
  page.className = 'eos-page'
  page.innerHTML = `
    <h1>Starter Home</h1>
    <p class="eos-muted">
      This page is yours: a sandboxed document with the EmailOS design
      tokens injected. Edit entry.js and hit Reload in Preferences →
      Extensions.
    </p>
    <div class="eos-card">
      <strong>Recent unread</strong>
      <div id="results" class="eos-muted">Loading…</div>
    </div>
    <button id="refresh" class="eos-button eos-button-primary">Refresh</button>
  `
  document.body.appendChild(page)

  const results = /** @type {HTMLElement} */ (page.querySelector('#results'))
  async function refresh() {
    const found = await emailos.mail.search({ query: 'is:unread', limit: 5 })
    results.textContent =
      found.messages.map(m => m.subject || '(no subject)').join(' · ') ||
      'Nothing unread. Nice.'
  }
  page.querySelector('#refresh')?.addEventListener('click', () => {
    refresh().catch(error => emailos.ui.toast(error.message, 'error'))
  })
  await refresh()
}

if (emailos.view && emailos.view.id === 'home') {
  renderHome().catch(error =>
    emailos.log('error', 'Home view failed: ' + error.message)
  )
}
