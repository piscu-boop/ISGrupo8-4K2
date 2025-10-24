<template>
  <teleport to="body">
    <transition name="modal-fade">
      <div
        v-if="visible"
        class="modal-backdrop"
        @click.self="emitClose"
        aria-modal="true"
        role="dialog"
        :aria-labelledby="titleId"
        :aria-describedby="descId"
      >
        <div class="modal-card" ref="card" tabindex="-1">
          <div class="modal-header" :class="headerClass">
            <span class="modal-title" :id="titleId">
              {{ type === 'success' ? '✅ Inscripción exitosa' : '❌ Ocurrió un error' }}
            </span>
            <button class="btn-close" aria-label="Cerrar" @click="emitClose">✕</button>
          </div>

          <div class="modal-body" :id="descId">
            <slot>
              {{ safeMessage }}
            </slot>
          </div>

          <div class="modal-footer">
            <button class="btn btn-primary" @click="emitClose">Aceptar</button>
          </div>
        </div>
      </div>
    </transition>
  </teleport>
</template>

<script>
export default {
  name: 'AlertModal',
  props: {
    visible: { type: Boolean, default: false },
    type: { type: String, default: 'success' }, // 'success' | 'error'
    message: { type: [String, Object], default: '' },
    autoCloseMs: { type: Number, default: 0 } // 0 = no autocerrar
  },
  emits: ['close'],
  data() {
    return {
      titleId: `modal-title-${Math.random().toString(36).slice(2)}`,
      descId: `modal-desc-${Math.random().toString(36).slice(2)}`,
      escHandler: null,
      timer: null
    }
  },
  computed: {
    headerClass() {
      return this.type === 'success' ? 'header-success' : 'header-error'
    },
    safeMessage() {
      if (typeof this.message === 'string') return this.message
      try {
        // Evita [object Object]
        return JSON.stringify(this.message, null, 2)
      } catch {
        return String(this.message)
      }
    }
  },
  mounted() {
    this.escHandler = (e) => { if (e.key === 'Escape' && this.visible) this.emitClose() }
    window.addEventListener('keydown', this.escHandler)
    if (this.autoCloseMs > 0 && this.visible) {
      this.timer = setTimeout(() => this.emitClose(), this.autoCloseMs)
    }
    // foco inicial accesible
    this.$nextTick(() => this.$refs.card && this.$refs.card.focus())
  },
  watch: {
    visible(v) {
      if (this.timer) clearTimeout(this.timer)
      if (this.autoCloseMs > 0 && v) {
        this.timer = setTimeout(() => this.emitClose(), this.autoCloseMs)
      }
    }
  },
  beforeUnmount() {
    window.removeEventListener('keydown', this.escHandler)
    if (this.timer) clearTimeout(this.timer)
  },
  methods: {
    emitClose() { this.$emit('close') }
  }
}
</script>

<style scoped>
/* Backdrop */
.modal-backdrop {
  position: fixed; inset: 0;
  background: rgba(0,0,0,.8);
  display: block; 
  place-items: center;
  padding-top: 4rem;
  z-index: 1000;
}

/* Card */
.modal-card {
  width: min(560px, 92vw);
  background: #fff;
  border-radius: 14px;
  box-shadow: 0 20px 60px rgba(0,0,0,.25);
  outline: none;
}

/* Header */
.modal-header {
  display: flex; align-items: center; justify-content: space-between;
  padding: 1rem 1.25rem; border-top-left-radius: 14px; border-top-right-radius: 14px;
  color: #fff;
}
.header-success { background: #28a745; }
.header-error { background: #dc3545; }

.modal-title { font-weight: 600; }

/* Close button */
.btn-close {
  border: none; background: rgba(255,255,255,.2); color: #fff;
  width: 32px; height: 32px; border-radius: 8px; cursor: pointer;
}

/* Body & Footer */
.modal-body { padding: 1.25rem; color: #333; white-space: pre-wrap; }
.modal-footer {
  display: flex; justify-content: flex-end; gap: .5rem;
  padding: 1rem 1.25rem; border-top: 1px solid #eee;
}

/* Buttons (usa tu sistema de estilos si ya lo tenés) */
.btn { padding: .6rem 1rem; border-radius: 10px; border: none; cursor: pointer; }
.btn-primary { background: var(--primary-light, #4a7c59); color: #fff; }

/* Animación */
.modal-fade-enter-from, .modal-fade-leave-to { opacity: 0; }
.modal-fade-enter-active, .modal-fade-leave-active { transition: opacity .2s ease; }
</style>
