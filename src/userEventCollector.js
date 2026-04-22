/**
 * userEventCollector.js
 * ─────────────────────────────────────────────────────────────────────────────
 * Módulo de recolección de eventos para proyectoMondongo (React + Vite)
 *
 * FUNCIONES PRINCIPALES
 * ─────────────────────────────────────────────────────────────────────────────
 *  collectFormEvents(formRef, schema)  → Registra listeners sobre un <form> y
 *                                        devuelve un objeto con los datos,
 *                                        errores y método sendToApi().
 *
 *  buildUserPayload(eventMap)          → Transforma el mapa de eventos en el
 *                                        JSON listo para enviar a la API.
 *
 *  sendToApi(url, payload, options)    → Envía el JSON a la URL indicada y
 *                                        retorna la respuesta.
 *
 *  watchTable(tableRef, onAction)      → Observa la tabla de usuarios y
 *                                        emite eventos edit / delete.
 *
 * USO RÁPIDO EN UN COMPONENTE REACT
 * ─────────────────────────────────────────────────────────────────────────────
 *  import { collectFormEvents, buildUserPayload, sendToApi } from './userEventCollector';
 *
 *  // Dentro de useEffect o del handler del formulario:
 *  const { snapshot, sendToApi: send } = collectFormEvents(
 *    formRef.current,
 *    { url: 'https://mi-api.com/usuarios' }
 *  );
 *
 *  // O con el flujo manual:
 *  const payload = buildUserPayload(datos);
 *  const result  = await sendToApi('https://mi-api.com/usuarios', payload);
 * ─────────────────────────────────────────────────────────────────────────────
 */

/* ═══════════════════════════════════════════════════════════════════════════ */
/*  1. ESQUEMA / CAMPOS RECONOCIDOS                                            */
/* ═══════════════════════════════════════════════════════════════════════════ */

/** Campos del formulario de usuario (deben coincidir con `name` del <input>). */
const USER_FIELDS = ['documento', 'nombres', 'apellidos', 'correo', 'pass'];

/**
 * Validadores básicos por campo.
 * Devuelven "" si el valor es válido, o un mensaje de error.
 */
const FIELD_VALIDATORS = {
  documento: (v) =>
    !v ? 'El documento es obligatorio' :
    !/^[0-9]{6,12}$/.test(v) ? 'Solo números, 6–12 dígitos' : '',

  nombres: (v) =>
    !v ? 'Los nombres son obligatorios' :
    v.trim().length < 2 ? 'Mínimo 2 caracteres' : '',

  apellidos: (v) =>
    !v ? 'Los apellidos son obligatorios' :
    v.trim().length < 2 ? 'Mínimo 2 caracteres' : '',

  correo: (v) =>
    !v ? 'El correo es obligatorio' :
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v) ? 'Correo inválido' : '',

  pass: (v) =>
    !v ? 'La contraseña es obligatoria' :
    v.length < 8 ? 'Mínimo 8 caracteres' : '',
};

/* ═══════════════════════════════════════════════════════════════════════════ */
/*  2. RECOLECTOR DE EVENTOS DE FORMULARIO                                     */
/* ═══════════════════════════════════════════════════════════════════════════ */

/**
 * Adjunta escuchas a un elemento <form> y mantiene un estado interno
 * con los datos actualizados y los errores de validación.
 *
 * @param {HTMLFormElement} formElement  - El elemento <form> del DOM.
 * @param {Object}          schema       - Configuración adicional.
 *   @param {string}  [schema.url]       - URL de la API destino.
 *   @param {string}  [schema.method]    - Método HTTP (default: 'POST').
 *   @param {Object}  [schema.headers]   - Headers extra para el fetch.
 *   @param {boolean} [schema.debug]     - Si true, imprime eventos en consola.
 *
 * @returns {{
 *   snapshot    : () => Object,   // Devuelve copia del estado actual
 *   getErrors   : () => Object,   // Devuelve errores actuales
 *   isValid     : () => boolean,  // true si no hay errores pendientes
 *   sendToApi   : () => Promise,  // Envía a la URL configurada
 *   detach      : () => void      // Elimina todos los listeners
 * }}
 */
export function collectFormEvents(formElement, schema = {}) {
  if (!(formElement instanceof HTMLFormElement)) {
    throw new Error('[userEventCollector] Se esperaba un HTMLFormElement.');
  }

  const {
    url     = '',
    method  = 'POST',
    headers = {},
    debug   = false,
  } = schema;

  // Estado interno ────────────────────────────────────────────
  const _data   = {};   // { campo: valor }
  const _errors = {};   // { campo: mensajeError }
  const _events = [];   // historial de eventos [{type, field, value, ts}]

  // Inicializar con los valores actuales del formulario ───────
  USER_FIELDS.forEach((field) => {
    const el = formElement.elements[field];
    _data[field]   = el ? el.value : '';
    _errors[field] = '';
  });

  // ── Handlers ────────────────────────────────────────────────

  function _onInput(e) {
    const { name, value, type } = e.target;
    if (!USER_FIELDS.includes(name)) return;

    // Ocultar contraseña en el historial
    const safeValue = type === 'password' ? '[PROTECTED]' : value;

    _data[name]   = value;
    _errors[name] = FIELD_VALIDATORS[name]?.(value) ?? '';

    _events.push({ type: 'input', field: name, value: safeValue, ts: Date.now() });
    if (debug) console.log('[collector] input →', name, safeValue);
  }

  function _onFocus(e) {
    const { name } = e.target;
    if (!USER_FIELDS.includes(name)) return;
    _events.push({ type: 'focus', field: name, ts: Date.now() });
    if (debug) console.log('[collector] focus →', name);
  }

  function _onBlur(e) {
    const { name, value } = e.target;
    if (!USER_FIELDS.includes(name)) return;
    // Validación al salir del campo
    _errors[name] = FIELD_VALIDATORS[name]?.(value) ?? '';
    _events.push({ type: 'blur', field: name, valid: _errors[name] === '', ts: Date.now() });
    if (debug) console.log('[collector] blur  →', name, '| error:', _errors[name] || 'ninguno');
  }

  function _onSubmit(e) {
    // No preventDefault aquí; eso lo hace el componente React.
    // Solo registramos el evento.
    const allValid = Object.values(_errors).every((err) => err === '');
    _events.push({ type: 'submit', allValid, ts: Date.now() });
    if (debug) console.log('[collector] submit | válido:', allValid, '| datos:', { ..._data, pass: '[PROTECTED]' });
  }

  // Registrar listeners ──────────────────────────────────────
  formElement.addEventListener('input',  _onInput);
  formElement.addEventListener('focusin',  _onFocus);
  formElement.addEventListener('focusout', _onBlur);
  formElement.addEventListener('submit', _onSubmit);

  // ── API pública ─────────────────────────────────────────────

  /**
   * Retorna una copia inmutable del estado actual del formulario.
   * La contraseña siempre se omite del snapshot por seguridad.
   */
  function snapshot() {
    const { pass, ...safeData } = _data;  // eslint-disable-line no-unused-vars
    return {
      ...safeData,
      metadata: {
        capturedAt : new Date().toISOString(),
        eventCount : _events.length,
        hasPassword: !!pass,
      },
    };
  }

  /** Retorna los errores de validación actuales. */
  function getErrors() {
    return { ..._errors };
  }

  /** Retorna true si todos los campos tienen valor y sin errores. */
  function isValid() {
    const hasErrors  = Object.values(_errors).some((e) => e !== '');
    const hasEmpties = USER_FIELDS.some((f) => !_data[f]);
    return !hasErrors && !hasEmpties;
  }

  /**
   * Construye el payload y lo envía a la URL configurada en `schema`.
   * @returns {Promise<{ok: boolean, status: number, body: any}>}
   */
  async function sendToApiInternal() {
    if (!url) throw new Error('[userEventCollector] No se configuró una URL en schema.url');
    const payload = buildUserPayload(_data);
    return sendToApi(url, payload, { method, headers });
  }

  /** Elimina todos los listeners (llamar en el cleanup del useEffect). */
  function detach() {
    formElement.removeEventListener('input',    _onInput);
    formElement.removeEventListener('focusin',  _onFocus);
    formElement.removeEventListener('focusout', _onBlur);
    formElement.removeEventListener('submit',   _onSubmit);
    if (debug) console.log('[collector] Listeners eliminados.');
  }

  return { snapshot, getErrors, isValid, sendToApi: sendToApiInternal, detach };
}

/* ═══════════════════════════════════════════════════════════════════════════ */
/*  3. CONSTRUCCIÓN DEL PAYLOAD JSON                                           */
/* ═══════════════════════════════════════════════════════════════════════════ */

/**
 * Convierte los datos del formulario en el payload JSON para la API.
 *
 * El objeto resultante sigue la estructura:
 * {
 *   usuario : { documento, nombres, apellidos, correo },
 *   auth    : { password },      ← solo si pass tiene valor
 *   meta    : { createdAt, source }
 * }
 *
 * @param {Object} data  - Objeto con los datos del formulario.
 * @returns {Object}      - Payload listo para JSON.stringify / fetch body.
 */
export function buildUserPayload(data = {}) {
  const { documento, nombres, apellidos, correo, pass, id } = data;

  const payload = {
    usuario: {
      ...(id !== undefined && { id }),
      documento : (documento ?? '').trim(),
      nombres   : (nombres   ?? '').trim(),
      apellidos : (apellidos ?? '').trim(),
      correo    : (correo    ?? '').trim().toLowerCase(),
    },
    meta: {
      createdAt : new Date().toISOString(),
      source    : 'proyectoMondongo-web',
    },
  };

  // Solo incluir auth si se proporcionó contraseña
  if (pass && pass.trim().length > 0) {
    payload.auth = { password: pass };
  }

  return payload;
}

/* ═══════════════════════════════════════════════════════════════════════════ */
/*  4. CLIENTE HTTP (wrapper sobre fetch)                                      */
/* ═══════════════════════════════════════════════════════════════════════════ */

/**
 * Envía un payload JSON a una URL mediante fetch.
 *
 * @param {string} url            - Endpoint de la API.
 * @param {Object} payload        - Datos a enviar (serán JSON.stringify-ados).
 * @param {Object} [options]      - Opciones adicionales.
 *   @param {string}  [options.method='POST']    - Método HTTP.
 *   @param {Object}  [options.headers={}]       - Headers adicionales.
 *   @param {string}  [options.token]            - Bearer token opcional.
 *   @param {boolean} [options.throwOnError=true]- Lanza error en 4xx/5xx.
 *
 * @returns {Promise<{ok: boolean, status: number, body: any}>}
 *
 * @example
 *   const result = await sendToApi('https://api.ejemplo.com/users', payload, {
 *     token: 'mi-token-jwt',
 *   });
 *   if (result.ok) console.log('Guardado:', result.body);
 */
export async function sendToApi(url, payload, options = {}) {
  const {
    method       = 'POST',
    headers      = {},
    token        = null,
    throwOnError = true,
  } = options;

  const authHeader = token ? { Authorization: `Bearer ${token}` } : {};

  let response;
  try {
    response = await fetch(url, {
      method,
      headers: {
        'Content-Type': 'application/json',
        Accept        : 'application/json',
        ...authHeader,
        ...headers,
      },
      body: JSON.stringify(payload),
    });
  } catch (networkError) {
    throw new Error(`[userEventCollector] Error de red al llamar ${url}: ${networkError.message}`);
  }

  let body;
  const contentType = response.headers.get('content-type') ?? '';
  try {
    body = contentType.includes('application/json')
      ? await response.json()
      : await response.text();
  } catch {
    body = null;
  }

  if (throwOnError && !response.ok) {
    const msg = typeof body === 'object' ? JSON.stringify(body) : body;
    throw new Error(`[userEventCollector] HTTP ${response.status} en ${url}: ${msg}`);
  }

  return { ok: response.ok, status: response.status, body };
}

/* ═══════════════════════════════════════════════════════════════════════════ */
/*  5. OBSERVADOR DE LA TABLA DE USUARIOS (delegación de eventos)              */
/* ═══════════════════════════════════════════════════════════════════════════ */

/**
 * Escucha clics en la tabla de usuarios para detectar acciones edit / delete.
 * Usa delegación de eventos (un solo listener en el contenedor padre).
 *
 * @param {HTMLElement} tableContainer  - El elemento que contiene la <table>.
 * @param {Function}    onAction        - Callback ({ action, userId, element }).
 *   action: 'edit' | 'delete'
 *   userId: el data-id del botón / fila (string)
 *
 * @returns {{ detach: () => void }}  - Objeto con método para limpiar.
 *
 * @example
 *   // En el componente UserTable, con useRef:
 *   const tableRef = useRef(null);
 *   useEffect(() => {
 *     const watcher = watchTable(tableRef.current, ({ action, userId }) => {
 *       if (action === 'edit')   handleEdit(userId);
 *       if (action === 'delete') handleDelete(userId);
 *     });
 *     return () => watcher.detach();
 *   }, []);
 *
 *   // En el JSX de los botones, agregar data-action y data-id:
 *   <button data-action="edit"   data-id={user.id}>Editar</button>
 *   <button data-action="delete" data-id={user.id}>Eliminar</button>
 */
export function watchTable(tableContainer, onAction) {
  if (!(tableContainer instanceof HTMLElement)) {
    throw new Error('[userEventCollector] Se esperaba un HTMLElement para watchTable.');
  }

  function _onClick(e) {
    const btn = e.target.closest('[data-action]');
    if (!btn) return;

    const action = btn.dataset.action;   // 'edit' | 'delete'
    const userId = btn.dataset.id;       // id del usuario

    if (!['edit', 'delete'].includes(action)) return;

    onAction({ action, userId: userId ?? null, element: btn });
  }

  tableContainer.addEventListener('click', _onClick);

  return {
    detach() {
      tableContainer.removeEventListener('click', _onClick);
    },
  };
}

/* ═══════════════════════════════════════════════════════════════════════════ */
/*  6. HELPERS DE USO EN REACT (hooks simples — no dependen de React)          */
/* ═══════════════════════════════════════════════════════════════════════════ */

/**
 * Serializa el array de usuarios a JSON e inicia una descarga en el navegador.
 * Útil para exportar el estado local antes de conectar la API real.
 *
 * @param {Array}  users     - Array de usuarios del estado React.
 * @param {string} [filename='usuarios.json']
 */
export function downloadUsersAsJson(users, filename = 'usuarios.json') {
  const safeUsers = users.map(({ pass, ...rest }) => rest); // sin contraseñas
  const blob = new Blob([JSON.stringify(safeUsers, null, 2)], {
    type: 'application/json',
  });
  const url  = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href     = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

/**
 * Convierte un array de usuarios en JSON string listo para loggear o mostrar.
 * Nunca incluye la contraseña.
 *
 * @param {Array}   users
 * @param {boolean} [pretty=true]
 * @returns {string}
 */
export function usersToJson(users, pretty = true) {
  const safe = users.map(({ pass, ...rest }) => rest);
  return pretty ? JSON.stringify(safe, null, 2) : JSON.stringify(safe);
}

/* ═══════════════════════════════════════════════════════════════════════════ */
/*  7. EJEMPLO COMPLETO DE INTEGRACIÓN EN RegisterForm.jsx                     */
/* ═══════════════════════════════════════════════════════════════════════════ */
/*
  import { useRef, useEffect }   from 'react';
  import { collectFormEvents,
           buildUserPayload,
           sendToApi }           from '../../userEventCollector';

  export function RegisterForm({ onUserCreated }) {
    const formRef    = useRef(null);
    const collector  = useRef(null);

    useEffect(() => {
      if (!formRef.current) return;

      // Iniciar recolección con la URL de tu API
      collector.current = collectFormEvents(formRef.current, {
        url   : 'https://tu-api.com/api/usuarios',
        debug : import.meta.env.DEV,        // logs solo en desarrollo
      });

      return () => collector.current?.detach(); // cleanup al desmontar
    }, []);

    const handleSubmit = async (e) => {
      e.preventDefault();
      if (!validate()) return;

      // Opción A — usar el collector directamente
      // const result = await collector.current.sendToApi();

      // Opción B — construir el payload manualmente y enviarlo
      const payload = buildUserPayload(form);
      try {
        const result = await sendToApi('https://tu-api.com/api/usuarios', payload, {
          token: localStorage.getItem('token'),
        });

        if (result.ok) {
          onUserCreated({ ...form, id: result.body?.id ?? Date.now() });
          reset();
        }
      } catch (err) {
        console.error('Error al registrar usuario:', err.message);
      }
    };

    return (
      <form ref={formRef} onSubmit={handleSubmit}>
        ...
      </form>
    );
  }
*/
