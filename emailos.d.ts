/**
 * EmailOS plugin API (§48). Ambient typings for the `emailos` global the
 * sandbox runtime installs before your entry script runs.
 *
 * Every capability call is checked in Rust against the §49 permissions the
 * user granted your plugin; a missing grant rejects the promise and logs a
 * denial to your plugin's developer log.
 */

interface EmailosPluginInfo {
  id: string
  name: string
  version: string
}

/** Present when this document renders one of your manifest `views`;
 *  `null` in the hidden background sandbox. */
interface EmailosViewInfo {
  id: string
}

interface EmailosCommandContext {
  /** Selected message's account — only with `mail.read.metadata`. */
  accountId?: string
  /** Selected conversation — only with `mail.read.metadata`. */
  threadId?: string
  /** Selected message — only with `mail.read.metadata`. */
  messageId?: string
  /** Free text collected by the invoker when your manifest command
   *  declares `inputPlaceholder`. */
  input?: string
}

type EmailosEventKind =
  | 'mail.received'
  | 'mail.opened'
  | 'mail.archived'
  | 'mail.sent'
  | 'thread.updated'
  | 'selection.changed'
  | 'account.synced'
  | 'workflow.changed'

interface EmailosThreadMessage {
  id: string
  messageId: string | null
  subject: string | null
  fromName: string | null
  fromAddress: string | null
  dateMs: number | null
  snippet: string | null
  isSeen: boolean
  hasAttachments: boolean
}

interface EmailosSearchResult extends EmailosThreadMessage {
  accountId: string
  threadId: string
  mailboxId: string
  isFlagged: boolean
}

interface EmailosAccount {
  id: string
  email: string
  displayName: string
  color: string
}

interface EmailosMailbox {
  id: string
  name: string
  role: string
  unreadCount: number
  totalCount: number
}

interface EmailosThreadLink {
  accountId: string
  threadId: string
  externalId: string
  externalUrl: string | null
  title: string | null
  status: string | null
  assignee: string | null
  updatedAtMs: number
}

interface EmailosSlotCard {
  title: string
  subtitle?: string | null
  body?: string | null
  /** `https://` or `mailto:` only; anything else is dropped. */
  href?: string | null
  /** One of your own manifest command ids; renders a run button. */
  commandId?: string | null
}

type EmailosSlotId =
  | 'threadSidebar'
  | 'messageActions'
  | 'composerToolbar'
  | 'commandPalette'
  | 'contactPanel'
  | 'readingPaneMetadata'

interface EmailosFetchResponse {
  status: number
  contentType: string
  body: string
}

declare const emailos: {
  plugin: EmailosPluginInfo
  view: EmailosViewInfo | null

  commands: {
    /** Handler for a command id declared in your manifest. Requires the
     *  `commands.register` permission. */
    register(
      id: string,
      handler: (ctx: EmailosCommandContext) => void | Promise<void>
    ): void
  }

  events: {
    /** Subscribe to a kind declared in your manifest `events`. Payload
     *  fields are filtered to your mail grants. */
    on(kind: EmailosEventKind, handler: (data: unknown) => void): void
  }

  mail: {
    /** Requires `mail.read.metadata`. */
    threadMetadata(params: { accountId: string; threadId: string }): Promise<{
      omittedOlderMessages: number
      messages: EmailosThreadMessage[]
    }>
    /** Requires `mail.read.body`. */
    messageBody(params: {
      accountId: string
      messageId: string
    }): Promise<{ text: string | null; html: string | null }>
    /** Full-text search over cached mail. Requires `mail.read.metadata`. */
    search(params: {
      query: string
      accountId?: string | null
      limit?: number
    }): Promise<{ messages: EmailosSearchResult[] }>
    /** Requires `mail.modify`. */
    archive(params: { messageId: string }): Promise<{ ok: boolean }>
    /** Requires `mail.modify`. */
    setSeen(params: {
      messageId: string
      seen: boolean
    }): Promise<{ ok: boolean }>
    /** Requires `mail.modify`. */
    setFlagged(params: {
      messageId: string
      flagged: boolean
    }): Promise<{ ok: boolean }>
  }

  accounts: {
    /** Requires `mail.read.metadata`. */
    list(): Promise<{ accounts: EmailosAccount[] }>
  }

  mailboxes: {
    /** Requires `mail.read.metadata`. */
    list(params: {
      accountId: string
    }): Promise<{ mailboxes: EmailosMailbox[] }>
  }

  workflow: {
    /** Set or clear Waiting For / Needs Reply / a reminder on a thread.
     *  Requires `mail.modify`. */
    set(params: {
      messageId: string
      state?: 'needs_reply' | 'waiting_for' | null
      remindAtMs?: number | null
    }): Promise<{ ok: boolean }>
  }

  thread: {
    /** Rename a conversation locally; empty subject clears the rename.
     *  Requires `mail.modify`. */
    rename(params: {
      accountId: string
      threadId: string
      subject: string
    }): Promise<{ ok: boolean }>
  }

  storage: {
    /** Plugin-scoped KV. All three require `storage`. */
    get(key: string): Promise<string | null>
    set(key: string, value: string): Promise<{ ok: boolean }>
    remove(key: string): Promise<{ deleted: boolean }>
  }

  links: {
    /** Link a conversation to an external object (feeds the thread
     *  sidebar card). Requires `storage`. */
    upsert(link: {
      accountId: string
      threadId: string
      externalId: string
      externalUrl?: string | null
      title?: string | null
      status?: string | null
      assignee?: string | null
    }): Promise<unknown>
    /** Every link your plugin has recorded. Requires `storage`. */
    list(): Promise<{ links: EmailosThreadLink[] }>
  }

  net: {
    /** HTTPS via the host (no CORS). Requires a `network.<host>` grant
     *  covering the URL's host or a parent domain. */
    fetch(params: {
      url: string
      method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'
      headers?: Record<string, string>
      body?: string | null
    }): Promise<EmailosFetchResponse>
  }

  ui: {
    /** Toast in the app chrome, prefixed with your plugin name. */
    toast(message: string, type?: 'info' | 'success' | 'error'): void
    /** Replace your cards for one UI slot (§50); empty array clears.
     *  Requires that slot's `ui.<slot>` permission. Max 8 cards. */
    setSlotCards(
      slotId: EmailosSlotId,
      cards: EmailosSlotCard[]
    ): Promise<{ cards: number }>
  }

  /** Line in your plugin's developer log (Preferences → Extensions). */
  log(
    level: 'debug' | 'info' | 'warn' | 'error',
    message: string
  ): Promise<{ ok: boolean }>
}
