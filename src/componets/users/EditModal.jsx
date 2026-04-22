// components/users/EditModal.jsx
import { useEffect }    from "react";
import { Button }       from "../ui/Button";
import { Input }        from "../ui/Input";
import { useUserForm }  from "../hooks/useUserForm";
import { useState }     from "react";

export function EditModal({ user, onSave, onClose }) {
  const { form, errors, handleChange, validate, setForm }
    = useUserForm();

  const [loading, setLoading] = useState(false)
  const [serverError, setServerError] = useState(null)

  // Precarga los datos cuando el usuario cambia
  useEffect(() => {
    if (user) setForm({ ...user, pass: "" });
    // ↑ vaciamos pass por seguridad
  }, [user]);

const handleSubmit2 = async (e) => {
  e.preventDefault()
  //mover esto a un hook personalizado para evitar repetir código con RegisterForm 
  /*
  const [loading, setLoading] = useState(false)
  const [serverError, setServerError] = useState(null)
  */
  try {
    const res = await fetch(`https://reactcompensar-env.eba-p272mu4y.us-east-2.elasticbeanstalk.com/api/usuarios/${form.documento}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    })

    if (!res.ok) throw new Error(`Error del servidor: ${res.status}`)

    const newUser = { ...form};
    onUserCreated(newUser);
    alert(res.message);
    setSuccess(true)
    reset()
  } catch (err) {
    setServerError(err.message)
  } finally {
    setLoading(false)
  }
}

/*
  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;
    onSave({ ...user, ...form });
    onClose();
  };
*/
  if (!user) return null;

  return (
  
    <div className="modal-overlay">
      {/* Tarjeta del modal */}
      <div className="modal-card">
        <h2>Editar usuario</h2>

        <form onSubmit={handleSubmit2} >
          <Input id="documento" name="documento" label="Documento"
            value={form.documento} onChange={handleChange}
            error={errors.documento} required
          />
          {/* ... nombres, apellidos, correo igual que en RegisterForm */}
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
        <Input
            id="pass" name="pass"
            label="Nueva contraseña (opcional)"
            type="password"
            placeholder="Dejar vacío para no cambiar"
            value={form.pass} onChange={handleChange}
          />
        <div className="flex gap-2 justify-end">
          <Button variant="ghost"   onClick={onClose}>Cancelar</Button>
          <Button type="submit" variant="primary">Guardar</Button>
        </div>
        </form>
      </div>
    </div>
  );
}