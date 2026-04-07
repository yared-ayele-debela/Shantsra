import { useState } from 'react'
import { BadgeCheck, Paperclip, Phone, Search, Send, ShieldCheck } from 'lucide-react'
import { conversations } from '../data/mockData.js'

function MessagesPage() {
  const [activeId, setActiveId] = useState(conversations[0].id)
  const activeConversation =
    conversations.find((conversation) => conversation.id === activeId) ?? conversations[0]

  return (
    <div className="surface-card overflow-hidden">
      <div className="grid min-h-[78vh] lg:grid-cols-[320px_1fr]">
        <aside className="border-b border-slate-100 lg:border-b-0 lg:border-r">
          <div className="border-b border-slate-100 p-4">
            <h1 className="text-2xl font-semibold text-slate-950">Messages</h1>
            <div className="relative mt-4">
              <Search className="pointer-events-none absolute left-4 top-4 h-4 w-4 text-slate-400" />
              <input className="input-field pl-11" placeholder="Search conversations" />
            </div>
          </div>
          <div className="max-h-[28vh] overflow-auto lg:max-h-[calc(78vh-5.5rem)]">
            {conversations.map((conversation) => (
              <button
                key={conversation.id}
                type="button"
                onClick={() => setActiveId(conversation.id)}
                className={[
                  'flex w-full items-start gap-3 border-b border-slate-100 px-4 py-4 text-left transition',
                  activeConversation.id === conversation.id ? 'bg-brand-50' : 'bg-white hover:bg-slate-50',
                ].join(' ')}
              >
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-brand-700 text-sm font-semibold text-white">
                  {conversation.name
                    .split(' ')
                    .map((part) => part[0])
                    .join('')
                    .slice(0, 2)}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <p className="truncate text-sm font-semibold text-slate-900">{conversation.name}</p>
                    {conversation.verified ? <BadgeCheck className="h-4 w-4 text-brand-600" /> : null}
                  </div>
                  <p className="truncate text-sm text-slate-500">{conversation.route}</p>
                </div>
                {conversation.unread ? (
                  <span className="rounded-full bg-accent-600 px-2 py-1 text-[11px] font-semibold text-white">
                    {conversation.unread}
                  </span>
                ) : null}
              </button>
            ))}
          </div>
        </aside>

        <section className="flex min-h-[50vh] flex-col bg-slate-50/80">
          <div className="flex items-center justify-between border-b border-slate-100 bg-white px-4 py-4">
            <div>
              <div className="flex items-center gap-2">
                <p className="font-semibold text-slate-900">{activeConversation.name}</p>
                <BadgeCheck className="h-4 w-4 text-brand-600" />
              </div>
              <p className="text-sm text-slate-500">{activeConversation.route}</p>
            </div>
            <div className="hidden items-center gap-3 sm:flex">
              <div className="inline-flex items-center gap-2 rounded-full bg-brand-50 px-3 py-2 text-xs font-semibold text-brand-700">
                <ShieldCheck className="h-4 w-4" />
                Escrow protected
              </div>
              <button type="button" className="rounded-full border border-slate-200 p-3 text-slate-500">
                <Phone className="h-4 w-4" />
              </button>
            </div>
          </div>

          <div className="flex-1 space-y-4 overflow-auto px-4 py-5">
            {activeConversation.messages.map((message) => {
              const isMine = message.sender === 'me'
              return (
                <div key={message.id} className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}>
                  <div
                    className={[
                      'max-w-[82%] rounded-[20px] px-4 py-3 text-sm leading-6 shadow-sm',
                      isMine ? 'bg-brand-700 text-white' : 'bg-white text-slate-700',
                    ].join(' ')}
                  >
                    <p>{message.text}</p>
                    <p className={`mt-2 text-[11px] ${isMine ? 'text-brand-100' : 'text-slate-400'}`}>
                      {message.time}
                    </p>
                  </div>
                </div>
              )
            })}
          </div>

          <div className="border-t border-slate-100 bg-white p-4">
            <div className="flex items-center gap-3">
              <button type="button" className="rounded-full border border-slate-200 p-3 text-slate-500">
                <Paperclip className="h-4 w-4" />
              </button>
              <input className="input-field" placeholder="Type a message" />
              <button type="button" className="btn-primary px-4">
                <Send className="h-4 w-4" />
              </button>
            </div>
          </div>
        </section>
      </div>
    </div>
  )
}

export default MessagesPage
