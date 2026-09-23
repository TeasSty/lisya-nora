import { useEffect, useRef, useState } from 'react'
import { DEMO_MODE } from '../../lib/config'
import {
  clearVkSession,
  displayVkName,
  getVkSession,
  setVkSession,
  vkProfileUrl,
  type VkSessionUser,
} from '../../lib/vkSession'

/** Публичный App ID из кабинета id.vk.com — без секрета в клиенте. */
const VKID_APP_ID = Number(import.meta.env.VITE_VKID_APP_ID) || 0

interface VkLoginBlockProps {
  /** Подставить имя из VK в поле заявки, если оно ещё пустое. */
  onPrefillName?: (name: string) => void
}

function DemoVkButton({ onLogin }: { onLogin: (user: VkSessionUser) => void }) {
  return (
    <button
      type="button"
      className="btn btn-ghost btn-sm vk-login__demo-btn"
      onClick={() => {
        const user: VkSessionUser = {
          vkUserId: '10001',
          firstName: 'Анна',
          lastName: 'Демо',
          avatarUrl: '',
          profileUrl: vkProfileUrl(10001),
        }
        setVkSession(user)
        onLogin(user)
      }}
    >
      Войти через VK (демо)
    </button>
  )
}

function VkProfileChip({
  user,
  onLogout,
}: {
  user: VkSessionUser
  onLogout: () => void
}) {
  const name = displayVkName(user) || `id${user.vkUserId}`
  return (
    <div className="vk-login__chip">
      {user.avatarUrl ? (
        <img className="vk-login__avatar" src={user.avatarUrl} alt="" width={36} height={36} />
      ) : (
        <span className="vk-login__avatar vk-login__avatar--placeholder" aria-hidden="true">
          VK
        </span>
      )}
      <div className="vk-login__chip-text">
        <strong>{name}</strong>
        <a href={user.profileUrl} target="_blank" rel="noreferrer">
          Профиль ВКонтакте
        </a>
      </div>
      <button type="button" className="btn btn-ghost btn-sm" onClick={onLogout}>
        Выйти
      </button>
    </div>
  )
}

export function VkLoginBlock({ onPrefillName }: VkLoginBlockProps) {
  const [user, setUser] = useState<VkSessionUser | null>(() => getVkSession())
  const [loginError, setLoginError] = useState<string | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const prefilledRef = useRef(false)
  const onPrefillNameRef = useRef(onPrefillName)
  onPrefillNameRef.current = onPrefillName

  function applyUser(next: VkSessionUser) {
    setUser(next)
    setLoginError(null)
    if (!prefilledRef.current) {
      const name = displayVkName(next)
      if (name) {
        onPrefillNameRef.current?.(name)
        prefilledRef.current = true
      }
    }
  }

  function handleLogout() {
    clearVkSession()
    setUser(null)
    prefilledRef.current = false
  }

  useEffect(() => {
    if (user || !VKID_APP_ID || !containerRef.current) return

    const container = containerRef.current
    let cancelled = false
    let oneTap: { close?: () => void } | null = null

    async function mountOneTap() {
      try {
        const VKID = await import('@vkid/sdk')
        if (cancelled || !container) return

        VKID.Config.init({
          app: VKID_APP_ID,
          redirectUrl: window.location.origin + window.location.pathname,
          responseMode: VKID.ConfigResponseMode.Callback,
          mode: VKID.ConfigAuthMode.InNewTab,
          scope: 'vkid.personal_info',
        })

        container.innerHTML = ''
        const widget = new VKID.OneTap()
        oneTap = widget as unknown as { close?: () => void }

        widget
          .render({
            container,
            showAlternativeLogin: true,
            contentId: VKID.OneTapContentId.SIGN_IN,
            styles: { height: 40, borderRadius: 10 },
          })
          .on(VKID.OneTapInternalEvents.LOGIN_SUCCESS, async (payload: { code: string; device_id: string }) => {
            try {
              const tokens = await VKID.Auth.exchangeCode(payload.code, payload.device_id)
              const info = await VKID.Auth.userInfo(tokens.access_token)
              const profile = info.user ?? {}
              const vkUserId = String(profile.user_id ?? tokens.user_id ?? '')
              if (!vkUserId) throw new Error('empty user id')

              const next: VkSessionUser = {
                vkUserId,
                firstName: profile.first_name?.trim() ?? '',
                lastName: profile.last_name?.trim() ?? '',
                avatarUrl: profile.avatar?.trim() ?? '',
                profileUrl: vkProfileUrl(vkUserId),
              }
              setVkSession(next)
              if (!cancelled) applyUser(next)
            } catch {
              if (!cancelled) setLoginError('Не удалось войти через VK. Можно оформить заявку без входа.')
            }
          })
          .on(VKID.WidgetEvents.ERROR, () => {
            if (!cancelled) setLoginError('Вход через VK временно недоступен. Заявку можно отправить без входа.')
          })
      } catch {
        if (!cancelled) setLoginError('Не удалось загрузить вход VK. Заявку можно отправить без входа.')
      }
    }

    void mountOneTap()

    return () => {
      cancelled = true
      try {
        oneTap?.close?.()
      } catch {
        /* ignore */
      }
      container.innerHTML = ''
    }
  }, [user])

  return (
    <div className="vk-login">
      <p className="vk-login__label">
        Войти через VK <span className="vk-login__optional">(необязательно)</span>
      </p>
      <p className="field-hint vk-login__hint">
        Если войдёте, в заявке сохранится ваш профиль ВКонтакте — так нам проще связаться. Без входа
        заказ тоже можно оформить.
      </p>

      {user ? (
        <VkProfileChip user={user} onLogout={handleLogout} />
      ) : (
        <>
          {VKID_APP_ID > 0 ? (
            <div className="vk-login__onetap" ref={containerRef} />
          ) : DEMO_MODE ? (
            <DemoVkButton onLogin={applyUser} />
          ) : (
            <p className="field-hint">Вход через VK пока не настроен на этом сайте.</p>
          )}
          {loginError && (
            <p className="form-error form-error--field" role="alert">
              {loginError}
            </p>
          )}
        </>
      )}
    </div>
  )
}
