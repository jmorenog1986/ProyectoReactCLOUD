// hooks/useUserForm.js
import { useState } from "react";

const INITIAL = {
  documento: "", nombres: "",
  apellidos: "", correo:  "", pass: "",
};

// Cada función recibe el valor y devuelve el mensaje de error (o "")
const VALIDATORS = {
  documento: (v) =>
    !v                       ? "El documento es obligatorio"  :
    !/^[0-9]{6,12}$/.test(v) ? "Solo números, 6-12 dígitos"    : "",

  nombres: (v) =>
    !v               ? "Los nombres son obligatorios" :
    v.trim().length < 2 ? "Mínimo 2 caracteres"          : "",

  apellidos: (v) =>
    !v               ? "Los apellidos son obligatorios" :
    v.trim().length < 2 ? "Mínimo 2 caracteres"             : "",

  correo: (v) =>
    !v                                          ? "El correo es obligatorio" :
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v) ? "Formato de correo inválido" : "",

  pass: (v) =>
    !v          ? "La contraseña es obligatoria" :
    v.length < 8 ? "Mínimo 8 caracteres"           : "",
};

export function useUserForm(initialData = INITIAL) {
  const [form,   setForm]   = useState(initialData);
  const [errors, setErrors] = useState({});

  // Handler genérico: actualiza el campo y valida en tiempo real
  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({
      ...prev,
      [name]: VALIDATORS[name]?.(value) ?? "",
    }));
  };

  // Valida todos los campos, devuelve true si no hay errores
  const validate = () => {
    const newErrors = {};
    Object.keys(VALIDATORS).forEach((key) => {
      newErrors[key] = VALIDATORS[key](form[key]);
    });
    setErrors(newErrors);
    return Object.values(newErrors).every((e) => e === "");
  };

  const reset = () => { setForm(INITIAL); setErrors({}); };

  return { form, errors, handleChange, validate, reset, setForm };
}