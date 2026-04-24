// components/users/RegisterForm.jsx
import { useState }    from "react";
import { Button }     from "../ui/Button";
import { Input }      from "../ui/Input";
import { useUserForm } from "../hooks/useUserForm";

export function RegisterForm({ onUserCreated }) {
  
  const { form, errors, handleChange, validate, reset }
    = useUserForm();
  const [success, setSuccess] = useState(false);


const [loading, setLoading] = useState(false)
const [serverError, setServerError] = useState(null)




const handleSubmit = async (e) => {
  e.preventDefault()
  if (!validate()) return  // tu lógica de validación existente

  setLoading(true)
  setServerError(null)

  try {
    const res = await fetch('https://reactcompensar-env.eba-p272mu4y.us-east-2.elasticbeanstalk.com/api/usuarios', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    })

    if (!res.ok) throw new Error(`Error del servidor: ${res.status}`)

    const newUser = { ...form, id: Date.now() };
    onUserCreated(newUser);
  
    setSuccess(true)
    reset()
  } catch (err) {
    setServerError(err.message)
  } finally {
    setLoading(false)
  }
}



  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <h2>Registrar nuevo usuario</h2>

      {success && <div className="alert-success">✓ Usuario registrado</div>}

      {/* Aquí podrías mostrar errores del servidor si los hay ESTO ES NUEVO */}
      {serverError && <div className="alert-error">{serverError}</div>}

      <div className="grid grid-cols-2 gap-3">
        <Input id="documento"  name="documento"  label="Documento"
          pattern="[0-9]{6,12}" maxLength={12} required
          value={form.documento}  onChange={handleChange}
          error={errors.documento}
          type="number"
        />
        <Input id="correo" name="correo" label="Correo"
          type="email" autoComplete="email" required
          value={form.correo}  onChange={handleChange}
          error={errors.correo}
        />
        <Input id="nombres"   name="nombres"   label="Nombres"   required
          value={form.nombres}   onChange={handleChange} error={errors.nombres}
        />
        <Input id="apellidos" name="apellidos" label="Apellidos" required
          value={form.apellidos} onChange={handleChange} error={errors.apellidos}
        />
        <Input id="pass" name="pass" label="Contraseña"
          type="password" minLength={8} required
          className="col-span-2"
          value={form.pass} onChange={handleChange} error={errors.pass}
        />
      </div>

      <div className="flex gap-2 justify-end">
        <Button variant="ghost"   onClick={reset}>Limpiar</Button>
        { /* El botón de submit se deshabilita mientras se envía el formulario */ }
        {/*<Button type="submit" variant="primary">Registrar usuario</Button>*/}

        <Button type="submit" variant="primary" disabled={loading}>
          {loading ? 'Enviando...' : 'Registrar usuario'}
        </Button>
      </div>
    </form>
  );
}