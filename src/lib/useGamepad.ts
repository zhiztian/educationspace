import { onMounted, onUnmounted, ref } from 'vue'

/**
 * 语义化手柄动作。视图按需响应，不直接关心按键编号。
 *
 * 标准映射（XInput / standard）：
 *   confirm = A   cancel = B   aux = X   menu = Y
 *   exit    = Start / Back
 *   page_up / page_down = LB / RB
 *   up/down/left/right = D-pad + 左/右摇杆（带死区 + 边沿触发 + 自动连发）
 */
export type GamepadAction =
  | 'confirm'
  | 'cancel'
  | 'aux'
  | 'menu'
  | 'exit'
  | 'up'
  | 'down'
  | 'left'
  | 'right'
  | 'page_up'
  | 'page_down'

interface UseGamepadOptions {
  onAction: (action: GamepadAction) => void
  /** 摇杆死区，默认 0.4 */
  deadzone?: number
  /** 长按到自动连发的初始延迟 (ms)，默认 450；设为 0 关闭连发 */
  repeatDelay?: number
  /** 连发间隔 (ms)，默认 110 */
  repeatRate?: number
  /** 是否启用（false 时不轮询） */
  enabled?: () => boolean
}

const BUTTON_A = 0
const BUTTON_B = 1
const BUTTON_X = 2
const BUTTON_Y = 3
const BUTTON_LB = 4
const BUTTON_RB = 5
const BUTTON_BACK = 8
const BUTTON_START = 9
const BUTTON_DUP = 12
const BUTTON_DDOWN = 13
const BUTTON_DLEFT = 14
const BUTTON_DRIGHT = 15

const buttonAction: Record<number, GamepadAction> = {
  [BUTTON_A]: 'confirm',
  [BUTTON_B]: 'cancel',
  [BUTTON_X]: 'aux',
  [BUTTON_Y]: 'menu',
  [BUTTON_LB]: 'page_up',
  [BUTTON_RB]: 'page_down',
  [BUTTON_BACK]: 'exit',
  [BUTTON_START]: 'exit',
  [BUTTON_DUP]: 'up',
  [BUTTON_DDOWN]: 'down',
  [BUTTON_DLEFT]: 'left',
  [BUTTON_DRIGHT]: 'right',
}

// 哪些 action 支持长按连发（仅导航类，避免 confirm 长按炸出十几次）
const REPEATABLE: ReadonlySet<GamepadAction> = new Set([
  'up', 'down', 'left', 'right', 'page_up', 'page_down',
])

export function useGamepad(opts: UseGamepadOptions) {
  const deadzone = opts.deadzone ?? 0.4
  const repeatDelay = opts.repeatDelay ?? 450
  const repeatRate = opts.repeatRate ?? 110

  const connected = ref(false)
  const padId = ref('')
  let raf = 0

  const btnState = new Map<number, { down: boolean; nextRepeatAt: number }>()
  type AxisDir = 'idle' | 'pos' | 'neg'
  const axisState = new Map<number, { dir: AxisDir; nextRepeatAt: number }>()

  function getActivePad(): Gamepad | null {
    if (!navigator.getGamepads) return null
    const pads = navigator.getGamepads()
    for (const p of pads) {
      if (p && p.connected) return p
    }
    return null
  }

  function fire(a: GamepadAction) {
    if (opts.enabled && !opts.enabled()) return
    opts.onAction(a)
  }

  function handleButton(i: number, action: GamepadAction, pressed: boolean, now: number) {
    let s = btnState.get(i)
    if (!s) { s = { down: false, nextRepeatAt: 0 }; btnState.set(i, s) }
    if (pressed) {
      if (!s.down) {
        fire(action)
        s.down = true
        s.nextRepeatAt = now + repeatDelay
      } else if (repeatDelay > 0 && REPEATABLE.has(action) && now >= s.nextRepeatAt) {
        fire(action)
        s.nextRepeatAt = now + repeatRate
      }
    } else {
      s.down = false
    }
  }

  function handleAxis(idx: number, val: number, negAction: GamepadAction, posAction: GamepadAction, now: number) {
    let s = axisState.get(idx)
    if (!s) { s = { dir: 'idle', nextRepeatAt: 0 }; axisState.set(idx, s) }
    if (val > deadzone) {
      if (s.dir !== 'pos') {
        fire(posAction)
        s.dir = 'pos'
        s.nextRepeatAt = now + repeatDelay
      } else if (repeatDelay > 0 && now >= s.nextRepeatAt) {
        fire(posAction)
        s.nextRepeatAt = now + repeatRate
      }
    } else if (val < -deadzone) {
      if (s.dir !== 'neg') {
        fire(negAction)
        s.dir = 'neg'
        s.nextRepeatAt = now + repeatDelay
      } else if (repeatDelay > 0 && now >= s.nextRepeatAt) {
        fire(negAction)
        s.nextRepeatAt = now + repeatRate
      }
    } else {
      s.dir = 'idle'
    }
  }

  function poll(nowDom: number) {
    const pad = getActivePad()
    if (pad) {
      if (!connected.value) {
        connected.value = true
        padId.value = pad.id
      }
      const now = nowDom
      // Buttons
      for (const [k, action] of Object.entries(buttonAction)) {
        const i = Number(k)
        const btn = pad.buttons[i]
        if (!btn) continue
        handleButton(i, action, btn.pressed, now)
      }
      // Axes (standard layout: [LX, LY, RX, RY])
      const axes = pad.axes
      if (axes.length >= 2) {
        handleAxis(0, axes[0], 'left', 'right', now)
        handleAxis(1, axes[1], 'up', 'down', now)
      }
      if (axes.length >= 4) {
        handleAxis(2, axes[2], 'left', 'right', now)
        handleAxis(3, axes[3], 'up', 'down', now)
      }
    } else if (connected.value) {
      connected.value = false
      padId.value = ''
    }
    raf = requestAnimationFrame(poll)
  }

  function onConnect(e: GamepadEvent) {
    connected.value = true
    padId.value = e.gamepad.id
  }
  function onDisconnect() {
    if (!getActivePad()) {
      connected.value = false
      padId.value = ''
    }
  }

  onMounted(() => {
    window.addEventListener('gamepadconnected', onConnect)
    window.addEventListener('gamepaddisconnected', onDisconnect)
    raf = requestAnimationFrame(poll)
  })
  onUnmounted(() => {
    window.removeEventListener('gamepadconnected', onConnect)
    window.removeEventListener('gamepaddisconnected', onDisconnect)
    if (raf) cancelAnimationFrame(raf)
  })

  return { connected, padId }
}
